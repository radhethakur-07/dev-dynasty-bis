from typing import Optional
from app.repositories.standards_repo import standards_repo
from app.schemas.responses import (
    StandardRecommendationResponse,
    StandardItem,
    SourceCitation
)
from app.core.config import settings


class StandardsService:
    def find_standards(self, product: str, query: str, language: str = "en") -> StandardRecommendationResponse:
        records = standards_repo.search_standards(query=query, product=product)

        standards_items = []
        citations = []

        for rec in records:
            standards_items.append(
                StandardItem(
                    code=rec["code"],
                    title=rec["title"],
                    reason=rec.get("reason", f"Identified as potentially applicable to '{product}'."),
                    confidence="high",
                    is_demo=rec.get("is_demo", False),
                    demo_badge=settings.DEMO_DATA_NOTICE if rec.get("is_demo", False) else None
                )
            )
            citations.append(
                SourceCitation(
                    document_title=rec.get("source_doc", rec["title"]),
                    section=rec.get("section", "Scope & Requirements"),
                    page_number=rec.get("page_number"),
                    url=rec.get("source_url", "https://www.bis.gov.in"),
                    is_demo=rec.get("is_demo", False),
                    demo_badge=settings.DEMO_DATA_NOTICE if rec.get("is_demo", False) else None
                )
            )

        if language == "hi":
            summary = f"उत्पाद '{product}' के लिए वर्तमान ज्ञान आधार से निम्नलिखित मानक पहचाने गए हैं।"
            disclaimer = "ये मानक वर्तमान ज्ञान आधार से सुझाए गए हैं। अंतिम पुष्टि आधिकारिक बीआईएस प्रक्रिया के माध्यम से की जानी चाहिए।"
        else:
            summary = f"Based on '{product}', the following Indian Standards may be applicable from the current knowledge base."
            disclaimer = "Standards identified from current knowledge base. Final applicability should be verified through official BIS processes."

        has_demo = any(r.get("is_demo", False) for r in records)

        return StandardRecommendationResponse(
            summary=summary,
            standards=standards_items,
            sources=citations,
            disclaimer=disclaimer,
            is_demo=has_demo,
            demo_badge=settings.DEMO_DATA_NOTICE if has_demo else None
        )


standards_service = StandardsService()
