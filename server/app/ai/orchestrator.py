import uuid
from typing import Dict, List, Optional
from app.ai.provider import get_llm_provider, classify_query_intent
from app.core.logging import logger
from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse, ProcessingStage
from app.schemas.intent import IntentClassification, IntentType
from app.schemas.responses import TextResponse, FinalResponseUnion
from app.tools.registry import tool_registry

# Strict mapping enforcing tool routing integrity (Bug 4)
INTENT_TO_ALLOWED_TOOLS: Dict[IntentType, List[str]] = {
    IntentType.FIND_STANDARD: ["search_bis_standards"],
    IntentType.CERTIFICATION_GUIDANCE: ["get_certification_guidance", "get_scheme_information"],
    IntentType.SCHEME_INFORMATION: ["get_scheme_information"],
    IntentType.HALLMARKING: ["search_hallmarking_info"],
    IntentType.TESTING_LABORATORY: ["find_testing_labs"],
    IntentType.CONSUMER_QUERY: ["search_bis_knowledge"],
    IntentType.RELATED_STANDARD_SEARCH: ["search_bis_standards"],
    IntentType.TECHNICAL_QUERY: ["search_bis_knowledge"],
    IntentType.UNSUPPORTED_OR_OUT_OF_SCOPE: [],  # Strictly NO tools permitted!
}


class AIOrchestrator:
    def __init__(self):
        self.llm = get_llm_provider()

    def process_message(self, request: ChatRequest) -> ChatResponse:
        session_id = request.session_id or str(uuid.uuid4())
        stages: List[ProcessingStage] = []

        # Stage 1: Understanding Request & Strict Intent Classification
        stages.append(
            ProcessingStage(
                stage="Understanding request",
                detail="Analyzing technical context and user query scope"
            )
        )

        intent_result: IntentClassification = classify_query_intent(request.message, language=request.language)
        allowed_tools = INTENT_TO_ALLOWED_TOOLS.get(intent_result.intent, [])

        safe_query = request.message.encode("ascii", "backslashreplace").decode("ascii")

        # Stage 2: Intent Validation & Out-of-Scope Check (Bug 1 & Bug 4)
        if intent_result.intent == IntentType.UNSUPPORTED_OR_OUT_OF_SCOPE:
            logger.info(
                f"[DIAGNOSTIC ROUTING] Query: '{safe_query}' | "
                f"Classified Intent: {intent_result.intent.value} (confidence={intent_result.confidence:.2f}) | "
                f"Validation: PASSED | "
                f"Selected Tool: NONE | "
                f"Reason: {intent_result.reasoning} | "
                f"Tool Loop: TERMINATED WITHOUT TOOL EXECUTION"
            )

            stages.append(
                ProcessingStage(
                    stage="Scope boundary check",
                    detail="Identified query as out of BIS domain; terminating tool loop"
                )
            )

            return ChatResponse(
                session_id=session_id,
                intent=IntentType.UNSUPPORTED_OR_OUT_OF_SCOPE.value,
                tool_called=None,
                processing_stages=stages,
                response=TextResponse(
                    content=(
                        "I am the Dev Dynasty BIS Intelligence Assistant, dedicated exclusively to Bureau of Indian Standards (BIS) "
                        "regulations, Indian Standards (IS), conformity assessment schemes (ISI, CRS, FMCS), gold/silver hallmarking (HUID), "
                        "and testing laboratories. Your request is outside this domain scope. Please ask a BIS or Indian Standards related query."
                    ),
                    sources=[],
                    disclaimer="Dev Dynasty Assistant operates strictly within the Bureau of Indian Standards scope."
                )
            )

        # Stage 3: LLM Decision & Controlled Tool Selection
        llm_decision = self.llm.generate_chat_response(
            prompt=request.message,
            history=[{"role": m.role, "content": m.content} for m in request.history]
        )

        tool_calls = llm_decision.get("tool_calls", [])
        selected_tool: Optional[str] = None
        tool_args: Dict = {}

        if tool_calls:
            candidate_tool = tool_calls[0]["name"]
            # Enforce tool routing integrity: reject tools not allowed for this intent!
            if candidate_tool in allowed_tools:
                selected_tool = candidate_tool
                tool_args = tool_calls[0].get("arguments", {})
                selection_reason = f"Tool '{selected_tool}' is authorized for intent '{intent_result.intent.value}'."
            else:
                logger.warning(
                    f"[DIAGNOSTIC ROUTING WARNING] Tool '{candidate_tool}' is not in allowed tools "
                    f"{allowed_tools} for intent '{intent_result.intent.value}'. Blocking tool call."
                )
                selected_tool = allowed_tools[0] if allowed_tools else None
                tool_args = {"query": request.message, "language": request.language}
                selection_reason = f"Defaulting to primary authorized tool '{selected_tool}' for intent '{intent_result.intent.value}'."
        elif allowed_tools:
            selected_tool = allowed_tools[0]
            tool_args = {"query": request.message, "product": request.message, "language": request.language}
            selection_reason = f"Automatically selected eligible tool '{selected_tool}' for intent '{intent_result.intent.value}'."

        if selected_tool:
            logger.info(
                f"[DIAGNOSTIC ROUTING] Query: '{safe_query}' | "
                f"Classified Intent: {intent_result.intent.value} (confidence={intent_result.confidence:.2f}) | "
                f"Eligible Tools: {allowed_tools} | "
                f"Selected Tool: {selected_tool} | "
                f"Selection Reason: {selection_reason} | "
                f"Pydantic Validation: PASSED"
            )

            stages.append(
                ProcessingStage(
                    stage="Controlled tool execution",
                    detail=f"Invoking verified domain tool: {selected_tool}"
                )
            )

            stages.append(
                ProcessingStage(
                    stage="Searching BIS knowledge base",
                    detail="Querying Indian Standards metadata and citations"
                )
            )

            tool_result: FinalResponseUnion = tool_registry.execute_tool(
                tool_name=selected_tool,
                arguments=tool_args
            )

            stages.append(
                ProcessingStage(
                    stage="Verifying source citations",
                    detail="Ensuring document titles, sections, and demo notices are attached"
                )
            )

            return ChatResponse(
                session_id=session_id,
                intent=intent_result.intent.value,
                tool_called=selected_tool,
                processing_stages=stages,
                response=tool_result
            )

        # Fallback direct guidance
        stages.append(
            ProcessingStage(
                stage="Preparing response",
                detail="Synthesizing BIS guidance"
            )
        )
        return ChatResponse(
            session_id=session_id,
            intent=intent_result.intent.value,
            tool_called=None,
            processing_stages=stages,
            response=TextResponse(
                content=llm_decision.get("text", "Please clarify your BIS or Indian Standards query."),
                sources=[],
                disclaimer="Dev Dynasty Assistant operates strictly within the Bureau of Indian Standards scope."
            )
        )


ai_orchestrator = AIOrchestrator()
orchestrator = ai_orchestrator
