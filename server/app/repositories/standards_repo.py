from typing import Any, Dict, List, Optional
from app.db.supabase import get_supabase_client
from app.core.logging import logger
from scripts.ingestion.sample_demo_data import DEMO_STANDARDS


class StandardsRepository:
    def __init__(self):
        self.supabase = get_supabase_client()

    def search_standards(self, query: str, product: Optional[str] = None) -> List[Dict[str, Any]]:
        search_terms = f"{product or ''} {query}".strip().lower()
        
        # If Supabase is connected, attempt query
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
                logger.warning(f"Error querying Supabase standards: {exc}. Falling back to demo records.")

        # Fallback to demo standards with explicit demo badges
        matched = []
        for std in DEMO_STANDARDS:
            if any(
                term in std["title"].lower() or term in std["category"].lower() or term in std["code"].lower()
                for term in search_terms.split()
            ):
                matched.append(std)

        # If no specific keyword matched, return top demo standards as sample results
        if not matched:
            matched = DEMO_STANDARDS[:2]

        return matched


standards_repo = StandardsRepository()
