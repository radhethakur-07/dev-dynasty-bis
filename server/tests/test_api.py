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
    assert data["tool_called"] is None
    assert "outside" in data["response"]["content"].lower()


def test_python_programming_out_of_scope_regression():
    """
    Regression Test for Bug 1:
    User query: 'Teach me Python programming from basics.'
    Must be classified as unsupported_or_out_of_scope with NO tool calls.
    """
    response = client.post(
        "/api/v1/chat",
        json={"message": "Teach me Python programming from basics.", "language": "en"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "unsupported_or_out_of_scope"
    assert data["tool_called"] is None
    assert data["response"]["type"] == "text"
    assert "outside" in data["response"]["content"].lower()
    # Confirm search_bis_standards was NEVER called
    assert data["tool_called"] != "search_bis_standards"


def test_pressure_cooker_retrieval_excludes_toys_regression():
    """
    Regression Test for Bug 2 & Bug 3:
    Query: 'What Indian Standard applies to domestic pressure cookers?'
    Must retrieve IS 2347 and strictly EXCLUDE unrelated toy standard IS 9873.
    Must label standards as 'Potentially Relevant Standard'.
    """
    response = client.post(
        "/api/v1/chat",
        json={"message": "What Indian Standard applies to domestic pressure cookers?", "language": "en"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "find_standard"
    assert data["tool_called"] == "search_bis_standards"
    
    stds = data["response"]["standards"]
    codes = [s["code"] for s in stds]
    
    # Must include Pressure Cooker standard
    assert any("2347" in c for c in codes)
    
    # Must strictly NOT include Toy standard IS 9873
    assert not any("9873" in c for c in codes)
    
    # Bug 3: Label check
    for std in stds:
        assert std["label"] == "Potentially Relevant Standard"


def test_chat_hindi_query():
    response = client.post(
        "/api/v1/chat",
        json={"message": "हॉलमार्क कैसे चेक करें?", "language": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tool_called"] == "search_hallmarking_info"
    assert data["response"]["type"] == "hallmarking_info"


def test_hindi_out_of_scope():
    response = client.post(
        "/api/v1/chat",
        json={"message": "मुझे पायथन प्रोग्रामिंग सिखाओ", "language": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "unsupported_or_out_of_scope"
    assert data["tool_called"] is None
