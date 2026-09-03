from app.schemas.tools import LaboratorySearchInput
from app.schemas.responses import LaboratoryResultsResponse
from app.services.laboratory_service import laboratory_service


def find_testing_labs(args: LaboratorySearchInput) -> LaboratoryResultsResponse:
    """
    Search recognized testing laboratories by product/testing capability and geographical location.
    """
    return laboratory_service.find_labs(
        product_or_test=args.product_or_test,
        location=args.location,
        language=args.language
    )
