import pytest
from pydantic import ValidationError
from app.schemas.intent import IntentClassification, IntentType
from app.schemas.tools import (
    StandardSearchInput,
    CertificationGuidanceInput,
    HallmarkingSearchInput,
    LaboratorySearchInput
)
from app.schemas.responses import (
    StandardRecommendationResponse,
    CertificationGuidanceResponse,
    HallmarkingResponse,
    LaboratoryResultsResponse,
    SourceCitation,
    StandardItem
)


def test_standard_search_input_validation():
    # Valid input
    valid = StandardSearchInput(product="cookware", query="What standard applies?", language="en")
    assert valid.product == "cookware"
    assert valid.language == "en"

    # Too short product name should raise ValidationError
    with pytest.raises(ValidationError):
        StandardSearchInput(product="a", query="What standard applies?", language="en")

    # Unsupported language should raise ValidationError
    with pytest.raises(ValidationError):
        StandardSearchInput(product="cookware", query="What standard applies?", language="fr")


def test_intent_classification_schema():
    intent = IntentClassification(
        intent=IntentType.FIND_STANDARD,
        query="applicable standards for domestic pressure cooker",
        product="pressure cooker",
        language="en"
    )
    assert intent.intent == IntentType.FIND_STANDARD
    assert intent.confidence == 1.0


def test_source_citation_demo_badge():
    citation = SourceCitation(
        document_title="Sample Document",
        section="Section 1",
        page_number=1,
        url="https://www.bis.gov.in",
        is_demo=True
    )
    assert citation.is_demo is True
    assert citation.demo_badge == "Demo / Sample / Not official"


def test_standard_recommendation_schema():
    resp = StandardRecommendationResponse(
        summary="Test summary",
        standards=[
            StandardItem(
                code="IS SAMPLE",
                title="Sample Test Standard",
                reason="Testing relevance",
                is_demo=True
            )
        ],
        sources=[
            SourceCitation(
                document_title="Sample Doc",
                url="https://www.bis.gov.in",
                is_demo=True
            )
        ],
        is_demo=True
    )
    assert resp.type == "standard_recommendation"
    assert resp.is_demo is True
    assert len(resp.standards) == 1
    assert resp.standards[0].demo_badge == "Demo / Sample / Not official"
