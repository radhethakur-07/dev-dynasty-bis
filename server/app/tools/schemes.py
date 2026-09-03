from app.schemas.tools import SchemeInformationInput
from app.schemas.responses import SchemeInformationResponse
from app.services.scheme_service import scheme_service


def get_scheme_information(args: SchemeInformationInput) -> SchemeInformationResponse:
    """
    Retrieve structural information regarding BIS conformity schemes (e.g. ISI Mark, CRS, FMCS).
    """
    return scheme_service.get_scheme_info(
        scheme_name=args.scheme_name,
        language=args.language
    )
