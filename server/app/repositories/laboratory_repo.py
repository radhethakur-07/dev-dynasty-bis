import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.db.supabase import get_supabase_client
from app.core.logging import logger

KNOWLEDGE_STORE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge_store.json"

LAB_STOPWORDS = {
    "testing", "tests", "test", "laboratory", "laboratories", "lab", "labs",
    "facility", "facilities", "in", "for", "and", "of", "to", "the", "a", "an",
    "at", "with", "or", "recognized", "centre", "centres", "center", "centers",
    "services", "discipline", "scope"
}


class LaboratoryRepository:
    def __init__(self):
        self.supabase = get_supabase_client()

    def _extract_search_terms(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", " ", (text or "").lower())
        return [w for w in cleaned.split() if w not in LAB_STOPWORDS and len(w) > 2]

    def search_laboratories(
        self, product_or_test: str, location: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        loc_term = (location or "").strip().lower()
        search_terms = self._extract_search_terms(product_or_test)

        # 1. Live Supabase check with database-level filtering
        if self.supabase:
            try:
                query = self.supabase.table("laboratories").select("*")

                # Filter by location if specified
                if loc_term:
                    query = query.or_(f"location.ilike.%{loc_term}%,state.ilike.%{loc_term}%")

                # Filter by product or test discipline terms if specified
                if search_terms:
                    or_clauses = []
                    for t in search_terms:
                        or_clauses.append(f"name.ilike.%{t}%")
                        or_clauses.append(f"scope_of_testing.ilike.%{t}%")
                    query = query.or_(",".join(or_clauses))

                response = query.limit(10).execute()
                if response.data:
                    # Post-query verification to ensure both criteria are respected
                    matched_db = []
                    for row in response.data:
                        row_name = (row.get("name") or "").lower()
                        row_scope = (row.get("scope_of_testing") or "").lower()
                        row_cats = [c.lower() for c in (row.get("categories") or []) if c]
                        row_loc = (row.get("location") or "").lower()
                        row_state = (row.get("state") or "").lower()

                        loc_ok = not loc_term or (loc_term in row_loc or loc_term in row_state)
                        prod_ok = not search_terms or any(
                            t in row_name or t in row_scope or any(t in c for c in row_cats)
                            for t in search_terms
                        )

                        if loc_ok and prod_ok:
                            matched_db.append(row)

                    return matched_db
                elif loc_term or search_terms:
                    # Explicit search with zero database matches -> return empty list (no match)
                    return []
            except Exception as exc:
                logger.warning(f"Error querying Supabase laboratories: {exc}.")

        # 2. Local ingested knowledge store fallback
        if KNOWLEDGE_STORE_FILE.exists():
            try:
                with open(KNOWLEDGE_STORE_FILE, "r", encoding="utf-8") as f:
                    store = json.load(f)
                    ingested_labs = store.get("laboratories", [])
                    matched_local = []
                    for lab in ingested_labs:
                        lab_name = (lab.get("name") or "").lower()
                        lab_scope = (lab.get("scope_of_testing") or "").lower()
                        lab_cats = [c.lower() for c in (lab.get("categories") or []) if c]
                        lab_loc = (lab.get("location") or "").lower()
                        lab_state = (lab.get("state") or "").lower()

                        loc_ok = not loc_term or (loc_term in lab_loc or loc_term in lab_state)
                        prod_ok = not search_terms or any(
                            t in lab_name or t in lab_scope or any(t in c for c in lab_cats)
                            for t in search_terms
                        )

                        if loc_ok and prod_ok:
                            matched_local.append(lab)

                    return matched_local
            except Exception as e:
                logger.warning(f"Error reading laboratories from local store: {e}")

        # If no verified laboratories match the criteria, return an empty list
        return []


laboratory_repo = LaboratoryRepository()

