from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.orchestrator import orchestrator
from app.auth.middleware import get_optional_user
from app.db.supabase import get_supabase_client
from app.core.logging import logger

import uuid as _uuid

router = APIRouter()


def _is_valid_uuid(value: str) -> bool:
    try:
        _uuid.UUID(value)
        return True
    except (ValueError, AttributeError):
        return False


def _auto_update_session_title(session_id: str, message: str):
    """Auto-update session title from 'New Chat' to the user's initial query."""
    if not session_id or not _is_valid_uuid(session_id):
        return
    try:
        supabase = get_supabase_client()
        if supabase:
            res = supabase.table("chat_sessions").select("title").eq("id", session_id).execute()
            if res.data and res.data[0].get("title") in ("New Chat", "New Conversation", None, ""):
                clean_title = message.strip()[:45]
                if len(message.strip()) > 45:
                    clean_title += "..."
                supabase.table("chat_sessions").update({"title": clean_title}).eq("id", session_id).execute()
    except Exception as e:
        logger.debug(f"[CHAT] Auto update session title skipped: {e}")


def _persist_message(
    session_id: str,
    role: str,
    content: str,
    intent: str = None,
    tool_called: str = None,
    response_type: str = None,
    structured_payload: dict = None
):
    """Persist a message and its structured payload to Supabase."""
    if not session_id or not _is_valid_uuid(session_id):
        logger.debug(f"[CHAT] Skipping message persistence — non-UUID session_id: {session_id!r}")
        return
    try:
        supabase = get_supabase_client()
        if supabase:
            payload: Dict[str, Any] = {
                "session_id": session_id,
                "role": role,
                "content": content[:10000] if content else "",
                "intent": intent,
                "tool_called": tool_called,
            }
            if response_type:
                payload["response_type"] = response_type
            if structured_payload:
                payload["structured_payload"] = structured_payload

            supabase.table("messages").insert(payload).execute()
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

        # Persist user and assistant messages to database (best-effort)
        session_id = str(response.session_id) if response.session_id else None
        if session_id:
            # 1. Persist user message and auto-update session title
            _persist_message(session_id, "user", request.message)
            _auto_update_session_title(session_id, request.message)

            # 2. Extract assistant response text
            assistant_text = ""
            if hasattr(response.response, 'content') and response.response.content:
                assistant_text = response.response.content
            elif hasattr(response.response, 'summary') and response.response.summary:
                assistant_text = response.response.summary

            # 3. Extract response type and structured payload
            response_type = getattr(response.response, 'type', None)
            structured_payload = None
            if hasattr(response.response, 'model_dump'):
                structured_payload = response.response.model_dump()
            elif hasattr(response.response, 'dict'):
                structured_payload = response.response.dict()

            # 4. Persist assistant message with rich payload
            _persist_message(
                session_id,
                "assistant",
                assistant_text,
                intent=response.intent,
                tool_called=response.tool_called,
                response_type=response_type,
                structured_payload=structured_payload
            )

        return response
    except Exception as exc:
        logger.error(f"Error processing chat request: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your BIS intelligence query."
        )
