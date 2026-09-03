from fastapi import APIRouter
from app.schemas.tools import CertificationGuidanceInput
from app.schemas.responses import CertificationGuidanceResponse
from app.services.certification_service import certification_service

router = APIRouter()


@router.post("/guidance", response_model=CertificationGuidanceResponse)
async def certification_guidance_endpoint(payload: CertificationGuidanceInput) -> CertificationGuidanceResponse:
    """
    Direct certification guidance endpoint.
    Retrieves step-by-step licensing process and required documentation.
    """
    return certification_service.get_guidance(
        product=payload.product,
        scheme=payload.scheme,
        language=payload.language
    )


@router.get("/schemes")
async def get_supported_schemes():
    """
    Returns list of official certification schemes supported with verified knowledge.
    """
    return [
        {
            "id": "scheme_1",
            "name": "Scheme I — Product Certification (ISI Mark)",
            "short_name": "Scheme I (ISI Mark)",
            "supported": True,
            "description": "Standard domestic product certification involving in-house lab, factory audit, SIT compliance, and independent laboratory testing.",
            "sample_query": "Give BIS certification guidance for Scheme I product certification."
        },
        {
            "id": "scheme_2",
            "name": "Scheme II — Compulsory Registration Scheme (CRS)",
            "short_name": "Scheme II (CRS)",
            "supported": True,
            "description": "Self-declaration of conformity for Electronics & IT goods based on laboratory testing (no preliminary factory audit required).",
            "sample_query": "Give BIS certification guidance for Scheme II CRS electronics."
        },
        {
            "id": "scheme_4",
            "name": "Scheme IV — Certificate of Conformity (CoC)",
            "short_name": "Scheme IV (CoC)",
            "supported": True,
            "description": "One-time batch or consignment-specific testing and certification where continuous manufacturing license is impractical.",
            "sample_query": "Give BIS certification guidance for Scheme IV Certificate of Conformity."
        },
        {
            "id": "scheme_x",
            "name": "Scheme X — Industrial Equipment Certification",
            "short_name": "Scheme X",
            "supported": True,
            "description": "Comprehensive certification for heavy industrial machinery, low-voltage switchgear, controlgear, and transformers.",
            "sample_query": "Give BIS certification guidance for Scheme X industrial equipment."
        },
        {
            "id": "fmcs",
            "name": "Foreign Manufacturers Certification Scheme (FMCS)",
            "short_name": "FMCS (Scheme I)",
            "supported": True,
            "description": "Scheme-I certification for manufacturing premises outside India exporting to India with mandatory AIR nomination.",
            "sample_query": "Give BIS certification guidance for Foreign Manufacturers Scheme FMCS."
        }
    ]
