import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.db.supabase import get_supabase_client
from app.core.logging import logger

KNOWLEDGE_STORE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge_store.json"


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculates cosine similarity between two float vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


class KnowledgeRepository:
    def __init__(self):
        self.supabase = get_supabase_client()
        self._local_chunks: List[Dict[str, Any]] = []
        self._load_local_store()

    def _load_local_store(self):
        if KNOWLEDGE_STORE_FILE.exists():
            try:
                with open(KNOWLEDGE_STORE_FILE, "r", encoding="utf-8") as f:
                    store = json.load(f)
                    self._local_chunks = store.get("chunks", [])
                    logger.info(f"Loaded {len(self._local_chunks)} local knowledge chunks.")
            except Exception as e:
                logger.warning(f"Error loading local knowledge store cache: {e}")

    def get_all_local_chunks(self) -> List[Dict[str, Any]]:
        return self._local_chunks

    def search_vector_chunks(
        self, query_embedding: List[float], match_threshold: float = 0.45, match_count: int = 20
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

        # 2. Check local ingested knowledge chunks with real cosine similarity
        if self._local_chunks:
            scored_chunks = []
            for chunk in self._local_chunks:
                emb = chunk.get("embedding", [])
                if emb:
                    sim = cosine_similarity(query_embedding, emb)
                    scored_chunks.append((sim, chunk))
                else:
                    scored_chunks.append((0.0, chunk))

            scored_chunks.sort(key=lambda x: x[0], reverse=True)

            filtered = [c for sim, c in scored_chunks if sim >= match_threshold]
            if filtered:
                return filtered[:match_count]
            elif scored_chunks:
                return [c for sim, c in scored_chunks[:match_count]]

        return []


knowledge_repo = KnowledgeRepository()
