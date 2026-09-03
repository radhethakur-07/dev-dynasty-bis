import pytest
from app.schemas.tools import SchemeInformationInput
from app.tools.schemes import get_scheme_information
from app.services.scheme_service import scheme_service
from app.services.laboratory_service import laboratory_service
from app.repositories.laboratory_repo import laboratory_repo
from app.schemas.responses import SchemeInformationResponse, InsufficientEvidenceResponse, LaboratoryResultsResponse


def test_scheme_1_information_grounded():
    """Verify Scheme I returns grounded non-demo response with live citations."""
    resp = get_scheme_information(SchemeInformationInput(scheme_name="Scheme I", language="en"))
    assert isinstance(resp, SchemeInformationResponse)
    assert resp.is_demo is False
    assert resp.demo_badge is None
    assert "ISI Mark" in resp.scheme_name
    assert "in-house" in " ".join(resp.key_features).lower() or "factory" in " ".join(resp.key_features).lower()
    assert len(resp.sources) > 0
    for src in resp.sources:
        assert src.is_demo is False
        assert "sample" not in src.document_title.lower()


def test_scheme_2_crs_information_grounded():
    """Verify Scheme II returns CRS specific information and no factory audit note."""
    resp = get_scheme_information(SchemeInformationInput(scheme_name="Scheme II (CRS)", language="en"))
    assert isinstance(resp, SchemeInformationResponse)
    assert resp.is_demo is False
    assert resp.demo_badge is None
    assert "CRS" in resp.scheme_name or "Compulsory Registration" in resp.scheme_name
    features_text = " ".join(resp.key_features).lower()
    assert "no preliminary factory audit" in features_text or "lab test report" in features_text
    assert len(resp.sources) > 0


def test_scheme_4_coc_information_grounded():
    """Verify Scheme IV returns batch-specific CoC details."""
    resp = get_scheme_information(SchemeInformationInput(scheme_name="Scheme IV (CoC)", language="en"))
    assert isinstance(resp, SchemeInformationResponse)
    assert resp.is_demo is False
    assert resp.demo_badge is None
    assert "Scheme IV" in resp.scheme_name
    features_text = " ".join(resp.key_features).lower()
    assert "batch" in features_text or "consignment" in features_text
    assert len(resp.sources) > 0


def test_scheme_x_information_grounded():
    """Verify Scheme X returns machinery and industrial equipment details."""
    resp = get_scheme_information(SchemeInformationInput(scheme_name="Scheme X", language="en"))
    assert isinstance(resp, SchemeInformationResponse)
    assert resp.is_demo is False
    assert resp.demo_badge is None
    assert "Scheme X" in resp.scheme_name
    features_text = " ".join(resp.key_features).lower()
    assert "machinery" in features_text or "switchgear" in features_text or "tcf" in features_text
    assert len(resp.sources) > 0


def test_unrecognized_scheme_insufficient_evidence():
    """Verify unrecognized schemes return structured insufficient evidence response."""
    resp = get_scheme_information(SchemeInformationInput(scheme_name="Scheme ZZZ Unknown 999", language="en"))
    assert isinstance(resp, InsufficientEvidenceResponse)
    assert resp.is_demo is False
    assert "No verified BIS conformity assessment scheme" in resp.message


def test_no_sample_demo_leak_in_schemes():
    """Verify none of the 5 supported schemes leak sample_demo_data content."""
    for scheme_key in ["Scheme I", "Scheme II", "Scheme IV", "Scheme X", "FMCS"]:
        resp = scheme_service.get_scheme_info(scheme_name=scheme_key, language="en")
        assert resp.is_demo is False
        assert resp.demo_badge is None
        for src in resp.sources:
            assert src.is_demo is False
            assert "sample" not in src.document_title.lower()
            assert "demo" not in src.document_title.lower()


def test_laboratory_cement_testing_without_location():
    """Verify cement testing without location does NOT return arbitrary first 5 labs."""
    labs = laboratory_repo.search_laboratories(product_or_test="cement testing")
    assert isinstance(labs, list)
    assert len(labs) == 0

    service_resp = laboratory_service.find_labs(product_or_test="cement testing")
    assert isinstance(service_resp, LaboratoryResultsResponse)
    assert len(service_resp.laboratories) == 0
    assert "No recognized BIS testing laboratories found" in service_resp.summary


def test_laboratory_electronics_testing_without_location():
    """Verify searching for unlisted discipline returns honest no-match instead of arbitrary labs."""
    labs = laboratory_repo.search_laboratories(product_or_test="electronics testing")
    assert isinstance(labs, list)
    assert len(labs) == 0

    service_resp = laboratory_service.find_labs(product_or_test="electronics testing")
    assert len(service_resp.laboratories) == 0
    assert "No recognized BIS testing laboratories found" in service_resp.summary


def test_laboratory_product_plus_location():
    """Verify combined product + location query returns the exact matching facility."""
    labs = laboratory_repo.search_laboratories(product_or_test="Food", location="Hyderabad")
    assert len(labs) == 1
    assert "Intertek" in labs[0]["name"]
    assert "Hyderabad" in labs[0]["location"]


def test_laboratory_location_only():
    """Verify location-only query returns facility in that location."""
    labs = laboratory_repo.search_laboratories(product_or_test="testing", location="Delhi")
    assert len(labs) >= 1
    assert any("Delhi" in lab["location"] for lab in labs)


def test_laboratory_no_match_query():
    """Verify completely unmatchable discipline returns empty list."""
    labs = laboratory_repo.search_laboratories(product_or_test="spacecraft quantum teleportation testing", location="Goa")
    assert len(labs) == 0
