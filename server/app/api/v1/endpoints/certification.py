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
