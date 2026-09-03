import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.db.supabase import get_supabase_client
from app.core.logging import logger
from scripts.ingestion.sample_demo_data import DEMO_STANDARDS, DEMO_CERTIFICATION_SCHEMES

KNOWLEDGE_STORE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge_store.json"


class KnowledgeRepository:
    def __init__(self):
        self.supabase = get_supabase_client()

    def search_vector_chunks(
        self, query_embedding: List[float], match_threshold: float = 0.60, match_count: int = 5
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

        # 3. Fallback to demo knowledge chunks
        demo_chunks = []
        for std in DEMO_STANDARDS:
            demo_chunks.append({
                "document_title": std["source_doc"],
                "section": std["section"],
                "page_number": std["page_number"],
                "source_url": std["source_url"],
                "chunk_text": f"Standard {std['code']}: {std['title']}. Requirements and scope: {std['reason']}",
                "is_demo": True,
                "similarity": 0.85
            })
        for scheme_key, scheme in DEMO_CERTIFICATION_SCHEMES.items():
            for src in scheme["sources"]:
                demo_chunks.append({
                    "document_title": src["document_title"],
                    "section": src["section"],
                    "page_number": src["page_number"],
                    "source_url": src["url"],
                    "chunk_text": f"{scheme['scheme_name']}: {scheme['description']} Applicability: {scheme['applicability']}",
                    "is_demo": True,
                    "similarity": 0.82
                })

        return demo_chunks[:match_count]


knowledge_repo = KnowledgeRepository()
