from app.schemas.tools import CertificationGuidanceInput
from app.schemas.responses import CertificationGuidanceResponse
from app.services.certification_service import certification_service


def get_certification_guidance(args: CertificationGuidanceInput) -> CertificationGuidanceResponse:
    """
    Retrieve procedural guidance, required documentation, and stages for BIS certification.
    """
    return certification_service.get_guidance(
        product=args.product,
        scheme=args.scheme,
        language=args.language
    )
