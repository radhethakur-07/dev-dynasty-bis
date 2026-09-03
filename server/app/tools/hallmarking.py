from app.schemas.tools import HallmarkingSearchInput
from app.schemas.responses import HallmarkingResponse
from app.services.hallmarking_service import hallmarking_service


def search_hallmarking_info(args: HallmarkingSearchInput) -> HallmarkingResponse:
    """
    Retrieve precious metal hallmarking specifications, mandatory marks, purity grades, and HUID verification steps.
    """
    return hallmarking_service.get_hallmarking_guidance(
        query=args.query,
        language=args.language
    )
