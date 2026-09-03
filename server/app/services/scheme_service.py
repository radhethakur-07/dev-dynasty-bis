from app.schemas.responses import SchemeInformationResponse, SourceCitation
from scripts.ingestion.sample_demo_data import DEMO_CERTIFICATION_SCHEMES
from app.core.config import settings


class SchemeService:
    def get_scheme_info(self, scheme_name: str, language: str = "en") -> SchemeInformationResponse:
        key = "crs" if any(k in scheme_name.lower() for k in ["crs", "compulsory", "electronic", "registration"]) else "isi"
        data = DEMO_CERTIFICATION_SCHEMES.get(key, DEMO_CERTIFICATION_SCHEMES["isi"])

        citations = [
            SourceCitation(
                document_title=s["document_title"],
                section=s["section"],
                page_number=s["page_number"],
                url=s["url"],
                is_demo=s.get("is_demo", True),
                demo_badge=settings.DEMO_DATA_NOTICE
            )
            for s in data["sources"]
        ]

        return SchemeInformationResponse(
            scheme_name=data["scheme_name"],
            description=data["description"],
            applicability=data["applicability"],
            key_features=data["key_features"],
            sources=citations,
            disclaimer="Official scheme regulations are governed by BIS Act 2016 and subsequent Gazette notifications.",
            is_demo=True,
            demo_badge=settings.DEMO_DATA_NOTICE
        )


scheme_service = SchemeService()
