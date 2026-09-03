from fastapi import APIRouter
from app.schemas.tools import HallmarkingSearchInput
from app.schemas.responses import HallmarkingResponse
from app.services.hallmarking_service import hallmarking_service

router = APIRouter()


@router.post("/search", response_model=HallmarkingResponse)
async def hallmarking_endpoint(payload: HallmarkingSearchInput) -> HallmarkingResponse:
    """
    Direct hallmarking intelligence endpoint.
    Retrieves purity grades, 3 mandatory marks, and HUID verification guide.
    """
    return hallmarking_service.get_hallmarking_guidance(
        query=payload.query,
        language=payload.language
    )
