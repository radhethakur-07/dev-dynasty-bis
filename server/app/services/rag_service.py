import re
from typing import Any, Dict, List, Optional, Set
from app.repositories.knowledge_repo import knowledge_repo, cosine_similarity
from app.schemas.responses import SourceCitation
from app.core.config import settings
from app.core.logging import logger

STOPWORDS: Set[str] = {
    "what", "is", "the", "a", "an", "for", "in", "of", "to", "on", "with", "and", "or",
    "standard", "standards", "indian", "applies", "applicable", "apply", "requirement",
    "requirements", "specification", "specifications", "please", "tell", "me", "which",
    "give", "code", "number", "product", "products", "find", "search", "show", "can", "you",
    "about", "how", "details", "info", "information", "does", "do", "any", "related", "like",
    "under", "quality", "control", "order", "qco", "compulsory", "mandatory", "voluntary",
    "this", "that", "it", "its", "whether", "certification", "license", "licence", "procedure",
    "process", "scheme", "schemes", "test", "testing", "lab", "laboratory",
    "मानक", "है", "क्या", "के", "लिए", "बताओ", "लागू", "होने", "वाले", "बारे", "में", "अनिवार्य"
}


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

    def _extract_query_tokens(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        words = cleaned.split()
        tokens = []
        for w in words:
            if w not in STOPWORDS and len(w) > 1 and not re.match(r"^(19|20)\d{2}$", w):
                norm = w[:-1] if w.endswith("s") and len(w) > 3 and not w.endswith("ss") else w
                tokens.append(norm)
        return tokens

    def _hybrid_rerank(
        self, query: str, query_embedding: List[float], pool: List[Dict[str, Any]], match_count: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Performs hybrid keyword, standard code, and semantic similarity scoring to accurately
        match the user's specific product and scheme, while eliminating irrelevant cross-domain results.
        """
        if not pool:
            return []

        q_lower = query.lower()
        product_tokens = self._extract_query_tokens(query)
        std_codes = re.findall(r"\b(?:is\s*)?(\d{3,5})\b", q_lower)

        scored = []
        for c in pool:
            text = c.get("chunk_text", "").lower()
            title = c.get("document_title", "").lower()
            section = c.get("section", "").lower()
            emb = c.get("embedding", [])

            sim = cosine_similarity(query_embedding, emb) if emb and query_embedding else 0.0
            score = sim * 5.0  # Base vector score

            # 1. Exact multi-word product phrase boost
            if len(product_tokens) >= 2:
                phrase = " ".join(product_tokens)
                if phrase in text or phrase in section or phrase in title:
                    score += 25.0

            # 2. Individual product token matches
            for token in product_tokens:
                if token in section or token in title:
                    score += 8.0
                elif token in text:
                    score += 4.0

            # 3. Standard code matches (e.g. 2347, 14543, 9873, 1786)
            for code in std_codes:
                if f"is {code}" in text or f"is {code}" in section or code in section:
                    score += 18.0

            # 4. Domain intent matching
            if any(w in q_lower for w in ["process", "procedure", "step", "how to apply", "application", "guidance"]):
                if any(k in text or k in section for k in ["application process", "manakonline", "certification process", "steps"]):
                    score += 6.0
            if any(w in q_lower for w in ["huid", "hallmark", "gold", "silver", "jewellery"]):
                if "hallmarking" in title or "hallmark" in text or "huid" in text:
                    score += 12.0
            if any(w in q_lower for w in ["crs", "electronics", "meity", "battery", "laptop", "mobile"]):
                if "crs" in title or "crs" in section or "electronics" in title:
                    score += 10.0

            # 5. Product contradiction penalty: prevent cement or steel from leaking into pressure cooker / toy queries
            if product_tokens:
                if "cooker" in product_tokens or "pressure" in product_tokens:
                    if ("cement" in section and "cooker" not in text) or ("textile" in section and "cooker" not in text):
                        score -= 15.0
                elif "cement" in product_tokens:
                    if ("cooker" in section and "cement" not in text) or ("toy" in section and "cement" not in text):
                        score -= 15.0
                elif "toy" in product_tokens:
                    if ("cement" in section and "toy" not in text) or ("steel" in section and "toy" not in text):
                        score -= 15.0
                elif "gold" in product_tokens or "silver" in product_tokens or "huid" in product_tokens:
                    if "steel" in section or "cement" in section or "cable" in section:
                        score -= 15.0

            scored.append((score, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for score, c in scored[:match_count]]

    def retrieve_context(
        self, query: str, match_count: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant knowledge chunks using hybrid vector search and product filtering.
        """
        embedding = self.get_query_embedding(query, is_document=False)

        # 1. First check if Supabase pgvector returned candidates
        candidates = knowledge_repo.search_vector_chunks(
            query_embedding=embedding,
            match_count=max(match_count * 5, 25)
        )

        # 2. If candidates are few or from local store, rank across all local chunks
        all_local = knowledge_repo.get_all_local_chunks()
        pool = all_local if all_local else candidates

        ranked = self._hybrid_rerank(
            query=query, query_embedding=embedding, pool=pool, match_count=match_count
        )
        return ranked

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
            doc_title = chunk.get("document_title", "BIS Knowledge Document")
            section = chunk.get("section")
            raw_url = chunk.get("source_url", "https://www.bis.gov.in")

            # Direct and accurate official URLs
            url = raw_url
            if url == "https://www.bis.gov.in" or url == "https://www.bis.gov.in/":
                if "Scheme I" in doc_title or "Certification" in doc_title:
                    url = "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/?lang=en"
                elif "Household" in doc_title:
                    url = "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/?lang=en"
                elif "Hallmarking" in doc_title:
                    url = "https://www.bis.gov.in/hallmarking-overview/"
                elif "LIMS" in doc_title or "Laboratory" in doc_title:
                    url = "https://lims.bis.gov.in/home/labs/"
                elif "Act" in doc_title:
                    url = "https://www.bis.gov.in/the-bis-act-2016/"
                elif "General" in doc_title:
                    url = "https://www.manakonline.in/MANAK/ApplicationFormAction"

            key = (doc_title, section)
            if key not in seen:
                seen.add(key)
                citations.append(
                    SourceCitation(
                        document_title=doc_title,
                        section=section,
                        page_number=chunk.get("page_number"),
                        url=url,
                        is_demo=chunk.get("is_demo", False),
                        demo_badge=settings.DEMO_DATA_NOTICE if chunk.get("is_demo", False) else None
                    )
                )
        return citations


rag_service = RAGService()
