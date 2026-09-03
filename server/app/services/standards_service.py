from typing import Optional
from app.repositories.standards_repo import standards_repo
from app.schemas.responses import (
    StandardRecommendationResponse,
    StandardItem,
    SourceCitation
)
from app.core.config import settings


class StandardsService:
    def find_standards(
        self,
        product: str,
        query: Optional[str] = None,
        category: Optional[str] = None,
        material: Optional[str] = None,
        intended_use: Optional[str] = None,
        description: Optional[str] = None,
        language: str = "en"
    ) -> StandardRecommendationResponse:
        effective_query = query or product
        records = standards_repo.search_standards(
            query=effective_query,
            product=product,
            category=category,
            material=material,
            intended_use=intended_use,
            description=description
        )

        standards_items = []
        citations = []
        seen_urls = set()

        for rec in records:
            score = rec.get("relevance_score", 0.8)
            conf = "high" if score >= 0.85 else ("medium" if score >= 0.65 else "low")
            
            standards_items.append(
                StandardItem(
                    code=rec["code"],
                    title=rec["title"],
                    reason=rec.get("reason", f"Identified as potentially applicable to product '{product}'."),
                    label="Potentially Relevant Standard",
                    confidence=conf,
                    relevance_score=score,
                    is_demo=rec.get("is_demo", False),
                    demo_badge=settings.DEMO_DATA_NOTICE if rec.get("is_demo", False) else None
                )
            )

            url = rec.get("source_url", "https://services.bis.gov.in/")
            if url not in seen_urls:
                seen_urls.add(url)
                citations.append(
                    SourceCitation(
                        document_title=rec.get("source_doc", rec["title"]),
                        section=rec.get("section", "Scope & Specifications"),
                        page_number=rec.get("page_number", 1),
                        url=url,
                        is_demo=rec.get("is_demo", False),
                        demo_badge=settings.DEMO_DATA_NOTICE if rec.get("is_demo", False) else None
                    )
                )

        if not standards_items:
            if language == "hi":
                summary = f"उत्पाद '{product}' के लिए वर्तमान सत्यापित बीआईएस ज्ञान आधार में कोई मानक प्रासंगिकता सीमा पार नहीं कर सका।"
                disclaimer = (
                    "वर्तमान ज्ञान आधार में इस उत्पाद के लिए कोई सत्यापित मानक दर्ज नहीं है। "
                    "कृपया उत्पाद का नाम स्पष्ट करें या manakonline.in पर आधिकारिक बीआईएस ई-बिक्री पोर्टल देखें।"
                )
                clarification = "सुझाव: उत्पाद का आधिकारिक नाम (जैसे 'कुकवेयर' या 'घरेलू उपकरण') दर्ज करें अथवा सामग्री व उपयोग की जानकारी जोड़ें।"
            else:
                summary = f"No Indian Standard in the verified knowledge base matched the criteria for '{product}' above the required relevance threshold."
                disclaimer = (
                    "No authoritative Indian Standard record was established for this query in the ingested repository. "
                    "Do not infer voluntary or mandatory compliance status without verifying official Quality Control Orders (QCOs) on manakonline.in."
                )
                clarification = "Suggestion: Try refining the product name, selecting a standardized category, or providing material specifications (e.g., 'aluminium', 'stainless steel')."
            
            return StandardRecommendationResponse(
                summary=summary,
                standards=[],
                sources=[],
                disclaimer=disclaimer,
                clarification_prompt=clarification,
                is_demo=False,
                demo_badge=None
            )

        if language == "hi":
            summary = f"उत्पाद '{product}' के लिए संभावित रूप से प्रासंगिक भारतीय मानक (Potentially Relevant Standards):"
            disclaimer = (
                "यह एआई-सहायता प्राप्त मार्गदर्शन संभावित रूप से प्रासंगिक मानकों की पहचान करता है। "
                "अंतिम विनियामक अनिवार्यता की पुष्टि manakonline.in पर आधिकारिक गुणवत्ता नियंत्रण आदेशों (QCOs) से की जानी चाहिए।"
            )
        else:
            summary = f"Based on '{product}', the following Potentially Relevant Standards were identified:"
            disclaimer = (
                "This recommendation identifies Potentially Relevant Standards based on verified BIS records. "
                "Final regulatory applicability must be confirmed through official BIS Quality Control Orders (QCOs) on manakonline.in."
            )

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
