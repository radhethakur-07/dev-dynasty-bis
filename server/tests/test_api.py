import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["problem_statement"] == "SIH267107"
    assert "demo_data_notice" in data
    assert data["demo_data_notice"] == "Demo / Sample / Not official"
    # Ensure no secrets are leaked in response
    assert "GEMINI_API_KEY" not in str(data)
    assert "SUPABASE_SERVICE_ROLE_KEY" not in str(data)


def test_chat_out_of_scope_query():
    response = client.post(
        "/api/v1/chat",
        json={"message": "Write a poem about minecraft", "language": "en"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "unsupported_or_out_of_scope"
    assert "outside my domain" in data["response"]["content"]


def test_chat_product_standard_query():
    response = client.post(
        "/api/v1/chat",
        json={"message": "What standard applies to cookware?", "language": "en"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tool_called"] == "search_bis_standards"
    assert len(data["processing_stages"]) > 0
    assert data["response"]["type"] == "standard_recommendation"
    assert len(data["response"]["standards"]) > 0


def test_chat_hindi_query():
    response = client.post(
        "/api/v1/chat",
        json={"message": "हॉलमार्क कैसे चेक करें?", "language": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tool_called"] == "search_hallmarking_info"
    assert data["response"]["type"] == "hallmarking_info"
