from fastapi import APIRouter
from app.schemas.tools import StandardSearchInput
from app.schemas.responses import StandardRecommendationResponse
from app.services.standards_service import standards_service

router = APIRouter()


@router.post("/search", response_model=StandardRecommendationResponse)
async def search_standards_endpoint(payload: StandardSearchInput) -> StandardRecommendationResponse:
    """
    Direct product-to-standard search endpoint.
    Identifies potentially applicable Indian Standards based on product attributes.
    """
    return standards_service.find_standards(
        product=payload.product,
        query=payload.query,
        language=payload.language
    )
