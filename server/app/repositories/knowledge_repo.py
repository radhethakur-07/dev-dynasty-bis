import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.db.supabase import get_supabase_client
from app.core.logging import logger

KNOWLEDGE_STORE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge_store.json"


class KnowledgeRepository:
    def __init__(self):
        self.supabase = get_supabase_client()

    def search_vector_chunks(
        self, query_embedding: List[float], match_threshold: float = 0.45, match_count: int = 6
    ) -> List[Dict[str, Any]]:
        # 1. Check live Supabase pgvector RPC
        if self.supabase:
            try:
                response = self.supabase.rpc(
                    "match_knowledge_chunks",
                    {
                        "query_embedding": query_embedding,
                        "match_threshold": match_threshold,
                        "match_count": match_count
                    }
                ).execute()
                if response.data:
                    return response.data
            except Exception as exc:
                logger.warning(f"Error querying pgvector match_knowledge_chunks: {exc}.")

        # 2. Check local ingested knowledge chunks
        if KNOWLEDGE_STORE_FILE.exists():
            try:
                with open(KNOWLEDGE_STORE_FILE, "r", encoding="utf-8") as f:
                    store = json.load(f)
                    chunks = store.get("chunks", [])
                    if chunks:
                        return chunks[:match_count]
            except Exception as e:
                logger.warning(f"Error reading chunks from local store: {e}")

        return []


knowledge_repo = KnowledgeRepository()
