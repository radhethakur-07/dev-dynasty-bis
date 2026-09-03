import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.db.supabase import get_supabase_client
from app.core.logging import logger
from scripts.ingestion.sample_demo_data import DEMO_STANDARDS

KNOWLEDGE_STORE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge_store.json"


class StandardsRepository:
    def __init__(self):
        self.supabase = get_supabase_client()

    def search_standards(self, query: str, product: Optional[str] = None) -> List[Dict[str, Any]]:
        search_terms = f"{product or ''} {query}".strip().lower()

        # 1. Check live Supabase
        if self.supabase:
            try:
                response = self.supabase.table("standards_metadata")\
                    .select("*")\
                    .ilike("title", f"%{product or query}%")\
                    .limit(5)\
                    .execute()
                if response.data:
                    return response.data
            except Exception as exc:
                logger.warning(f"Error querying Supabase standards: {exc}.")

        # 2. Check ingested local knowledge store (if real data was ingested)
        if KNOWLEDGE_STORE_FILE.exists():
            try:
                with open(KNOWLEDGE_STORE_FILE, "r", encoding="utf-8") as f:
                    store = json.load(f)
                    ingested_standards = store.get("standards", [])
                    matched_ingested = []
                    for std in ingested_standards:
                        if any(
                            t in std["title"].lower() or t in std.get("category", "").lower() or t in std["code"].lower()
                            for t in search_terms.split()
                        ):
                            matched_ingested.append(std)
                    if matched_ingested:
                        return matched_ingested
            except Exception as e:
                logger.warning(f"Error reading local knowledge store: {e}")

        # 3. Fallback to demo standards with explicit demo badges
        matched = []
        for std in DEMO_STANDARDS:
            if any(
                term in std["title"].lower() or term in std["category"].lower() or term in std["code"].lower()
                for term in search_terms.split()
            ):
                matched.append(std)

        if not matched:
            matched = DEMO_STANDARDS[:2]

        return matched


standards_repo = StandardsRepository()
