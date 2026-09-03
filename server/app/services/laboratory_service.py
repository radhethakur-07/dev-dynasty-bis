from typing import Optional
from app.repositories.laboratory_repo import laboratory_repo
from app.schemas.responses import LaboratoryResultsResponse, LaboratoryItem, SourceCitation
from app.core.config import settings


class LaboratoryService:
    def find_labs(
        self, product_or_test: str, location: Optional[str] = None, language: str = "en"
    ) -> LaboratoryResultsResponse:
        records = laboratory_repo.search_laboratories(product_or_test=product_or_test, location=location)

        labs = []
        citations = []
        seen_urls = set()

        for r in records:
            is_demo = r.get("is_demo", False)
            source_url = r.get("source_url", "https://lims.bis.gov.in/home/labs/")

            labs.append(
                LaboratoryItem(
                    name=r["name"],
                    location=f"{r['location']}".strip(),
                    scope_or_capabilities=r.get("scope_of_testing", "Product conformity testing"),
                    recognition_status=r.get("recognition_status", "BIS LIMS Recognized"),
                    source_url=source_url,
                    is_demo=is_demo,
                    demo_badge=settings.DEMO_DATA_NOTICE if is_demo else None
                )
            )

            if source_url not in seen_urls:
                seen_urls.add(source_url)
                citations.append(
                    SourceCitation(
                        document_title="BIS LIMS Laboratory Directory" if not is_demo else "BIS Laboratory Directory (Demo Reference)",
                        section=f"Recognized Testing Labs ({r.get('location', 'India')})",
                        page_number=1,
                        url=source_url,
                        is_demo=is_demo,
                        demo_badge=settings.DEMO_DATA_NOTICE if is_demo else None
                    )
                )

        has_demo = any(l.is_demo for l in labs)

        if language == "hi":
            summary = f"उत्पाद/परीक्षण '{product_or_test}' के लिए प्रयोगशाला रिकॉर्ड प्राप्त हुए।"
            disclaimer = "परीक्षण क्षमताओं और मान्यता स्थिति की पुष्टि आधिकारिक बीआईएस प्रयोगशाला निर्देशिका से की जानी चाहिए।"
        else:
            summary = f"Testing laboratories matching criteria '{product_or_test}'" + (f" in '{location}'." if location else ".")
            disclaimer = "Laboratory recognition and testing capabilities should be verified via the official BIS laboratory directory."

        return LaboratoryResultsResponse(
            summary=summary,
            laboratories=labs,
            sources=citations,
            disclaimer=disclaimer,
            is_demo=has_demo,
            demo_badge=settings.DEMO_DATA_NOTICE if has_demo else None
        )


laboratory_service = LaboratoryService()
