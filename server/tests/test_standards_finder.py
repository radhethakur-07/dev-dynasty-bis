import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_relevant_product_query():
    """
    Test 1: Relevant product query with structured attributes.
    Must return IS 2347:2023 with 'Potentially Relevant Standard' label.
    """
    payload = {
        "product": "Domestic Pressure Cooker",
        "category": "Consumer Goods / Mechanical",
        "material": "Aluminium",
        "intended_use": "Domestic food cooking",
        "description": "Kitchen pressure cooker capacity 5 litres with safety valve",
        "language": "en"
    }
    response = client.post("/api/v1/standards/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "standard_recommendation"
    assert len(data["standards"]) > 0
    
    # Must find IS 2347
    top_standard = data["standards"][0]
    assert "2347" in top_standard["code"]
    assert top_standard["label"] == "Potentially Relevant Standard"
    assert top_standard["confidence"] in ["high", "medium"]
    assert top_standard["relevance_score"] >= 0.60
    
    # Must NOT include unrelated standards (e.g. Toys IS 9873)
    codes = [s["code"] for s in data["standards"]]
    assert not any("9873" in c for c in codes)


def test_unrelated_product_query():
    """
    Test 2: Unrelated product query that has no BIS standard in repository.
    Must NOT return random standards or toys; must return empty standards with guidance.
    """
    payload = {
        "product": "Quantum Cryptography Compiler",
        "category": "Software",
        "material": "Digital code",
        "intended_use": "Blockchain security",
        "language": "en"
    }
    response = client.post("/api/v1/standards/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["standards"]) == 0
    assert "No Indian Standard" in data["summary"]
    assert data["clarification_prompt"] is not None


def test_ambiguous_query():
    """
    Test 3: Ambiguous or generic product query.
    Must NOT return high-confidence mismatch.
    """
    payload = {
        "product": "Generic metal container",
        "language": "en"
    }
    response = client.post("/api/v1/standards/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Should not falsely match toys or electrical appliances
    for s in data["standards"]:
        assert "9873" not in s["code"]
        assert "302" not in s["code"]


def test_no_evidence_query():
    """
    Test 4: Query for completely non-existent item.
    Must return 0 standards and no fabricated source URLs.
    """
    payload = {
        "product": "XyzSpaceLaserDevice999",
        "language": "en"
    }
    response = client.post("/api/v1/standards/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["standards"]) == 0
    assert len(data["sources"]) == 0
    assert "clarification_prompt" in data
    assert data["clarification_prompt"] is not None


def test_citation_preservation():
    """
    Test 5: Verified citation preservation.
    Official URL from standards.csv must be strictly preserved without modification.
    """
    payload = {
        "product": "Packaged Drinking Water",
        "category": "Food / Consumer",
        "material": "PET Bottle",
        "intended_use": "Direct human consumption",
        "language": "en"
    }
    response = client.post("/api/v1/standards/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["standards"]) > 0
    assert any("14543" in s["code"] for s in data["standards"])
    
    # Check source citations
    assert len(data["sources"]) > 0
    for src in data["sources"]:
        assert "services.bis.gov.in" in src["url"]
        assert src["is_demo"] is False
