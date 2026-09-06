from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.orchestrator import orchestrator
from app.auth.middleware import get_optional_user
from app.db.supabase import get_supabase_client
from app.core.logging import logger

router = APIRouter()


def _persist_message(session_id: str, role: str, content: str, intent: str = None, tool_called: str = None):
    """Persist a message to Supabase (best-effort, never blocks chat)."""
    try:
        supabase = get_supabase_client()
        if supabase and session_id:
            supabase.table("messages").insert({
                "session_id": session_id,
                "role": role,
                "content": content[:10000] if content else "",
                "intent": intent,
                "tool_called": tool_called
            }).execute()
    except Exception as e:
        logger.debug(f"[CHAT] Message persistence skipped: {e}")


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
) -> ChatResponse:
    """
    Main conversational interface for the BIS Intelligence Assistant.
    Validates query, runs through intent & tool selection, retrieves knowledge,
    and returns a structured response with verified citations.
    """
    try:
        response = orchestrator.process_message(request)

        # Persist user and assistant messages (best-effort)
        session_id = str(response.session_id) if response.session_id else None
        if session_id and current_user:
            _persist_message(session_id, "user", request.message)
            # Extract assistant response text
            assistant_text = ""
            if hasattr(response.response, 'content'):
                assistant_text = response.response.content or ""
            elif hasattr(response.response, 'summary'):
                assistant_text = response.response.summary or ""
            _persist_message(
                session_id, "assistant", assistant_text,
                intent=response.intent,
                tool_called=response.tool_called
            )

        return response
    except Exception as exc:
        logger.error(f"Error processing chat request: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your BIS intelligence query."
        )
