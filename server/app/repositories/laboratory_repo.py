import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.db.supabase import get_supabase_client
from app.core.logging import logger
from scripts.ingestion.sample_demo_data import DEMO_LABORATORIES

KNOWLEDGE_STORE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge_store.json"


class LaboratoryRepository:
    def __init__(self):
        self.supabase = get_supabase_client()

    def search_laboratories(
        self, product_or_test: str, location: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        loc_term = (location or "").lower()
        prod_term = product_or_test.lower()

        # 1. Live Supabase check
        if self.supabase:
            try:
                query = self.supabase.table("laboratories").select("*")
                if location:
                    query = query.ilike("location", f"%{location}%")
                response = query.limit(5).execute()
                if response.data:
                    return response.data
            except Exception as exc:
                logger.warning(f"Error querying Supabase laboratories: {exc}.")

        # 2. Local ingested knowledge store
        if KNOWLEDGE_STORE_FILE.exists():
            try:
                with open(KNOWLEDGE_STORE_FILE, "r", encoding="utf-8") as f:
                    store = json.load(f)
                    ingested_labs = store.get("laboratories", [])
                    matched = []
                    for lab in ingested_labs:
                        match_loc = not loc_term or loc_term in lab["location"].lower() or loc_term in lab.get("state", "").lower()
                        match_prod = any(
                            term in lab.get("scope_of_testing", "").lower() or any(term in cat.lower() for cat in lab.get("categories", []))
                            for term in prod_term.split()
                        )
                        if match_loc or match_prod:
                            matched.append(lab)
                    if matched:
                        return matched
            except Exception as e:
                logger.warning(f"Error reading laboratories from local store: {e}")

        # 3. Fallback demo data
        results = []
        for lab in DEMO_LABORATORIES:
            match_loc = not loc_term or loc_term in lab["location"].lower() or loc_term in lab["state"].lower()
            match_prod = any(
                term in lab["scope_of_testing"].lower() or any(term in cat.lower() for cat in lab["categories"])
                for term in prod_term.split()
            )
            if match_loc or match_prod:
                results.append(lab)

        if not results:
            results = DEMO_LABORATORIES

        return results


laboratory_repo = LaboratoryRepository()
