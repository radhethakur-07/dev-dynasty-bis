"""
Chat sessions and messages API endpoints for Supabase persistence.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.db.supabase import get_supabase_client
from app.auth.middleware import get_current_user
from app.core.logging import logger

router = APIRouter()


class CreateSessionRequest(BaseModel):
    title: Optional[str] = "New Chat"


class RenameSessionRequest(BaseModel):
    title: str


@router.get("/sessions")
async def list_sessions(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = supabase.table("chat_sessions") \
            .select("id, title, language, created_at") \
            .eq("user_id", current_user["id"]) \
            .order("created_at", desc=True) \
            .limit(50) \
            .execute()
        return {"sessions": result.data or []}
    except Exception as e:
        logger.error(f"[SESSIONS] Error listing sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to list sessions")


@router.post("/sessions")
async def create_session(
    req: CreateSessionRequest,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = supabase.table("chat_sessions").insert({
            "user_id": current_user["id"],
            "title": req.title or "New Chat",
            "language": "en"
        }).execute()

        if result.data:
            return {"session": result.data[0]}
        raise HTTPException(status_code=500, detail="Failed to create session")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[SESSIONS] Error creating session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create session")


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Verify session belongs to user
        session = supabase.table("chat_sessions") \
            .select("id") \
            .eq("id", session_id) \
            .eq("user_id", current_user["id"]) \
            .execute()

        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")

        result = supabase.table("messages") \
            .select("id, role, content, intent, tool_called, created_at") \
            .eq("session_id", session_id) \
            .order("created_at", desc=False) \
            .execute()

        return {"messages": result.data or []}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[SESSIONS] Error getting messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to get messages")


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        session = supabase.table("chat_sessions") \
            .select("id") \
            .eq("id", session_id) \
            .eq("user_id", current_user["id"]) \
            .execute()

        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")

        # Messages cascade-delete via FK
        supabase.table("chat_sessions").delete().eq("id", session_id).execute()
        return {"message": "Session deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[SESSIONS] Error deleting session: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete session")


@router.patch("/sessions/{session_id}")
async def rename_session(
    session_id: str,
    req: RenameSessionRequest,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        session = supabase.table("chat_sessions") \
            .select("id") \
            .eq("id", session_id) \
            .eq("user_id", current_user["id"]) \
            .execute()

        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")

        supabase.table("chat_sessions").update({"title": req.title}).eq("id", session_id).execute()
        return {"message": "Session renamed", "title": req.title}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[SESSIONS] Error renaming session: {e}")
        raise HTTPException(status_code=500, detail="Failed to rename session")
