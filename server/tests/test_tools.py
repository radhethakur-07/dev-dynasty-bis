import pytest
from app.tools.registry import tool_registry
from app.schemas.responses import ErrorResponse, StandardRecommendationResponse, HallmarkingResponse


def test_tool_allowlist_blocks_unauthorized_tools():
    # Attempting to execute an arbitrary or database query tool must be blocked
    res = tool_registry.execute_tool("query_data", {"sql": "SELECT * FROM users"})
    assert isinstance(res, ErrorResponse)
    assert "not permitted" in res.message

    res2 = tool_registry.execute_tool("execute_sql", {"query": "DROP TABLE standards"})
    assert isinstance(res2, ErrorResponse)
    assert "not permitted" in res2.message


def test_tool_allowlist_blocks_invalid_arguments():
    # Missing required argument 'product' for search_bis_standards
    res = tool_registry.execute_tool("search_bis_standards", {"query": "test query"})
    assert isinstance(res, ErrorResponse)
    assert "Validation failed" in res.message


def test_search_bis_standards_tool_execution():
    res = tool_registry.execute_tool(
        "search_bis_standards",
        {"product": "cooker", "query": "Find standards for cooker", "language": "en"}
    )
    assert isinstance(res, StandardRecommendationResponse)
    assert len(res.standards) > 0
    assert len(res.sources) > 0
    # Confirm demo badge is present if demo data
    if res.is_demo:
        assert res.demo_badge == "Demo / Sample / Not official"


def test_hallmarking_tool_execution():
    res = tool_registry.execute_tool(
        "search_hallmarking_info",
        {"query": "How to verify gold hallmark HUID?", "language": "en"}
    )
    assert isinstance(res, HallmarkingResponse)
    assert len(res.mandatory_marks) == 3
    assert any("HUID" in mark for mark in res.mandatory_marks)
    assert len(res.consumer_verification_steps) > 0
