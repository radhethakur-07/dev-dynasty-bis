from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.orchestrator import orchestrator
from app.core.logging import logger

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """
    Main conversational interface for the BIS Intelligence Assistant.
    Validates query, runs through intent & tool selection, retrieves knowledge,
    and returns a structured response with verified citations.
    """
    try:
        response = orchestrator.process_message(request)
        return response
    except Exception as exc:
        logger.error(f"Error processing chat request: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your BIS intelligence query."
        )
