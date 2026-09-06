from typing import Any, Dict, List, Optional
from app.repositories.knowledge_repo import knowledge_repo
from app.schemas.responses import SourceCitation
from app.core.config import settings
from app.core.logging import logger


class RAGService:
    def get_query_embedding(self, text: str, is_document: bool = False) -> List[float]:
        """
        Generates query or document embedding vector using Gemini or fallback dimension-padded vector.
        """
        if settings.is_gemini_configured:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                task_type = "retrieval_document" if is_document else "retrieval_query"
                result = genai.embed_content(
                    model=settings.EMBEDDING_MODEL,
                    content=text,
                    task_type=task_type,
                    output_dimensionality=settings.EMBEDDING_DIMENSION
                )
                if "embedding" in result:
                    return result["embedding"]
            except Exception as exc:
                logger.warning(f"Failed to generate embedding with Gemini API: {exc}. Using fallback vector.")

        # Deterministic dimension-compliant vector
        dim = settings.EMBEDDING_DIMENSION
        return [0.01 * ((i % 10) + 1) for i in range(dim)]

    def retrieve_context(
        self, query: str, match_count: int = 6
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant knowledge chunks and returns them with structured source citations.
        """
        embedding = self.get_query_embedding(query, is_document=False)
        chunks = knowledge_repo.search_vector_chunks(
            query_embedding=embedding,
            match_count=match_count
        )
        return chunks

    def format_evidence_block(self, retrieved_chunks: List[Dict[str, Any]]) -> str:
        if not retrieved_chunks:
            return "No verified BIS documents found in knowledge base."

        evidence_lines = []
        for i, chunk in enumerate(retrieved_chunks, 1):
            demo_flag = f" [{settings.DEMO_DATA_NOTICE}]" if chunk.get("is_demo") else ""
            evidence_lines.append(
                f"[Source {i}{demo_flag}]: Title: {chunk.get('document_title', 'Unknown')}, "
                f"Section: {chunk.get('section', 'N/A')}, Page: {chunk.get('page_number', 'N/A')}\n"
                f"Content: {chunk.get('chunk_text', '')}\n"
            )
        return "\n".join(evidence_lines)

    def extract_citations(self, retrieved_chunks: List[Dict[str, Any]]) -> List[SourceCitation]:
        citations = []
        seen = set()
        for chunk in retrieved_chunks:
            key = (chunk.get("document_title"), chunk.get("section"))
            if key not in seen:
                seen.add(key)
                citations.append(
                    SourceCitation(
                        document_title=chunk.get("document_title", "BIS Knowledge Document"),
                        section=chunk.get("section"),
                        page_number=chunk.get("page_number"),
                        url=chunk.get("source_url", "https://www.bis.gov.in"),
                        is_demo=chunk.get("is_demo", False),
                        demo_badge=settings.DEMO_DATA_NOTICE if chunk.get("is_demo", False) else None
                    )
                )
        return citations


rag_service = RAGService()
