from fastapi import APIRouter
from app.schemas.tools import LaboratorySearchInput
from app.schemas.responses import LaboratoryResultsResponse
from app.services.laboratory_service import laboratory_service

router = APIRouter()


@router.post("/search", response_model=LaboratoryResultsResponse)
async def laboratories_endpoint(payload: LaboratorySearchInput) -> LaboratoryResultsResponse:
    """
    Direct laboratory search endpoint.
    Filters recognized labs by testing category/product and geographic location.
    """
    return laboratory_service.find_labs(
        product_or_test=payload.product_or_test,
        location=payload.location,
        language=payload.language
    )
