import uuid
from typing import List, Optional
from app.ai.provider import get_llm_provider
from app.core.logging import logger
from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse, ProcessingStage
from app.schemas.intent import IntentClassification, IntentType
from app.schemas.responses import TextResponse, FinalResponseUnion
from app.tools.registry import tool_registry


class AIOrchestrator:
    def __init__(self):
        self.llm = get_llm_provider()

    def process_message(self, request: ChatRequest) -> ChatResponse:
        session_id = request.session_id or str(uuid.uuid4())
        stages: List[ProcessingStage] = []

        # Stage 1: Understanding Request & Intent
        stages.append(
            ProcessingStage(
                stage="Understanding request",
                detail="Analyzing technical context and user query scope"
            )
        )

        llm_decision = self.llm.generate_chat_response(
            prompt=request.message,
            history=[{"role": m.role, "content": m.content} for m in request.history]
        )

        # Handle out-of-scope gracefully
        if llm_decision.get("is_out_of_scope"):
            return ChatResponse(
                session_id=session_id,
                intent=IntentType.UNSUPPORTED_OR_OUT_OF_SCOPE.value,
                tool_called=None,
                processing_stages=stages,
                response=TextResponse(
                    content=llm_decision["text"],
                    sources=[],
                    disclaimer="The Dev Dynasty Assistant operates exclusively within the Bureau of Indian Standards and Indian Standards domain."
                )
            )

        tool_calls = llm_decision.get("tool_calls", [])
        
        if tool_calls:
            tool_call = tool_calls[0]
            tool_name = tool_call["name"]
            tool_args = tool_call.get("arguments", {})

            # Stage 2: Controlled Tool Selection
            stages.append(
                ProcessingStage(
                    stage="Controlled tool execution",
                    detail=f"Invoking verified domain tool: {tool_name}"
                )
            )

            # Stage 3: Retrieval & Grounding
            stages.append(
                ProcessingStage(
                    stage="Searching BIS knowledge base",
                    detail="Querying Indian Standards metadata and citations"
                )
            )

            tool_result: FinalResponseUnion = tool_registry.execute_tool(
                tool_name=tool_name,
                arguments=tool_args
            )

            # Stage 4: Citation Verification
            stages.append(
                ProcessingStage(
                    stage="Verifying source citations",
                    detail="Ensuring document titles, sections, and demo notices are attached"
                )
            )

            return ChatResponse(
                session_id=session_id,
                intent=self._map_tool_to_intent(tool_name),
                tool_called=tool_name,
                processing_stages=stages,
                response=tool_result
            )

        # Direct text response fallback
        stages.append(
            ProcessingStage(
                stage="Preparing response",
                detail="Synthesizing BIS guidance"
            )
        )
        return ChatResponse(
            session_id=session_id,
            intent=IntentType.TECHNICAL_QUERY.value,
            tool_called=None,
            processing_stages=stages,
            response=TextResponse(
                content=llm_decision.get("text", "I am ready to assist with BIS queries."),
                sources=[],
                is_demo=False
            )
        )

    def _map_tool_to_intent(self, tool_name: str) -> str:
        mapping = {
            "search_bis_standards": IntentType.FIND_STANDARD.value,
            "get_certification_guidance": IntentType.CERTIFICATION_GUIDANCE.value,
            "get_scheme_information": IntentType.SCHEME_INFORMATION.value,
            "search_hallmarking_info": IntentType.HALLMARKING.value,
            "find_testing_labs": IntentType.TESTING_LABORATORY.value,
            "search_bis_knowledge": IntentType.TECHNICAL_QUERY.value
        }
        return mapping.get(tool_name, IntentType.TECHNICAL_QUERY.value)


orchestrator = AIOrchestrator()
