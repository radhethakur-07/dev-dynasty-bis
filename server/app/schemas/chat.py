from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from app.schemas.responses import FinalResponseUnion


class MessageItem(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User query or message")
    session_id: Optional[str] = Field(default=None, description="Chat session ID for continuing conversation")
    language: Literal["en", "hi"] = Field(default="en", description="Language preference")
    history: List[MessageItem] = Field(default_factory=list, description="Recent conversation turns")


class ProcessingStage(BaseModel):
    stage: str
    detail: str


class ChatResponse(BaseModel):
    session_id: str
    intent: str
    tool_called: Optional[str] = None
    processing_stages: List[ProcessingStage] = Field(default_factory=list)
    response: FinalResponseUnion
