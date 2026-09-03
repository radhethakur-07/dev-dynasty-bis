from app.schemas.tools import KnowledgeSearchInput
from app.schemas.responses import TextResponse
from app.services.rag_service import rag_service
from app.core.config import settings


def search_bis_knowledge(args: KnowledgeSearchInput) -> TextResponse:
    """
    Perform semantic RAG retrieval over indexed BIS knowledge chunks.
    """
    chunks = rag_service.retrieve_context(query=args.query, match_count=4)
    citations = rag_service.extract_citations(chunks)

    if not chunks:
        return TextResponse(
            content="No verified BIS knowledge found matching your query.",
            sources=[],
            is_demo=False
        )

    evidence_summary = (
        f"Retrieved {len(chunks)} relevant BIS knowledge source(s) regarding your query:\n\n"
        + "\n\n".join(f"- **{c.get('document_title', 'Document')}** ({c.get('section', 'General')}): {c.get('chunk_text', '')}" for c in chunks)
    )

    has_demo = any(c.get("is_demo", False) for c in chunks)

    return TextResponse(
        content=evidence_summary,
        sources=citations,
        disclaimer="Grounded on current knowledge base records. Please verify critical parameters with official Gazette notifications.",
        is_demo=has_demo,
        demo_badge=settings.DEMO_DATA_NOTICE if has_demo else None
    )
