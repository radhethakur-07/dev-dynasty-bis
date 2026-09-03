from app.schemas.tools import StandardSearchInput
from app.schemas.responses import StandardRecommendationResponse
from app.services.standards_service import standards_service


def search_bis_standards(args: StandardSearchInput) -> StandardRecommendationResponse:
    """
    Search Indian Standards potentially applicable to a product description or category.
    """
    return standards_service.find_standards(
        product=args.product,
        query=args.query or args.product,
        category=args.category,
        material=args.material,
        intended_use=args.intended_use,
        description=args.description,
        language=args.language
    )
