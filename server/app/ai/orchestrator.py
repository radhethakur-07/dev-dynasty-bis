"""
AI Orchestrator — Production-grade BIS Intelligence Assistant
Handles intent routing, tool execution, and Gemini synthesis.
"""
import re
import uuid
from typing import Any, Dict, List, Optional
from app.ai.provider import get_llm_provider, classify_query_intent
from app.core.logging import logger
from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse, ProcessingStage
from app.schemas.intent import IntentClassification, IntentType
from app.schemas.responses import TextResponse, FinalResponseUnion, SourceCitation, StandardItem, StandardRecommendationResponse
from app.tools.registry import tool_registry
from app.repositories.standards_repo import standards_repo

# Strict mapping enforcing tool routing integrity
INTENT_TO_ALLOWED_TOOLS: Dict[IntentType, List[str]] = {
    IntentType.FIND_STANDARD: ["search_bis_standards"],
    IntentType.CERTIFICATION_GUIDANCE: ["get_certification_guidance", "get_scheme_information"],
    IntentType.SCHEME_INFORMATION: ["get_scheme_information"],
    IntentType.HALLMARKING: ["search_hallmarking_info"],
    IntentType.TESTING_LABORATORY: ["find_testing_labs"],
    IntentType.CONSUMER_QUERY: ["search_bis_knowledge"],
    IntentType.RELATED_STANDARD_SEARCH: ["search_bis_standards"],
    IntentType.TECHNICAL_QUERY: ["search_bis_knowledge"],
    IntentType.UNSUPPORTED_OR_OUT_OF_SCOPE: [],
}


def extract_context_from_history(history: List[Any]) -> Dict[str, Optional[str]]:
    context: Dict[str, Optional[str]] = {"standard_code": None, "product": None}
    if not history:
        return context

    for msg in reversed(history):
        content = getattr(msg, "content", "") if hasattr(msg, "content") else (msg.get("content", "") if isinstance(msg, dict) else "")
        if not content:
            continue

        std_match = re.search(r"\bIS\s*(\d{3,5}(?:\s*(?:Part\s*\d+|:\d{4}))?)", content, re.IGNORECASE)
        if std_match and not context["standard_code"]:
            context["standard_code"] = f"IS {std_match.group(1)}".strip()

        lower = content.lower()
        if not context["product"]:
            for prod in [
                "packaged drinking water", "mineral water", "drinking water",
                "pressure cooker", "cooker", "tmt bar", "steel", "cement",
                "helmet", "toy", "toys", "cable", "wires", "switch", "lamp",
                "battery", "cell", "laptop", "mobile", "jewellery", "gold", "silver"
            ]:
                if prod in lower:
                    context["product"] = prod.title()
                    break

        if context["standard_code"]:
            break

    return context


class AIOrchestrator:
    def __init__(self):
        self.llm = get_llm_provider()

    def _build_final_response(self, tool_result: FinalResponseUnion, synthesis: Optional[str]) -> FinalResponseUnion:
        """
        Replace tool_result content with Gemini synthesis.
        NEVER append synthesis on top of existing content — replace it.
        """
        if not synthesis:
            return tool_result

        result_type = type(tool_result).__name__

        if result_type == "TextResponse":
            tool_result.content = synthesis
        elif result_type == "HallmarkingResponse":
            tool_result.summary = synthesis
        elif result_type == "SchemeInformationResponse":
            tool_result.summary = synthesis
        elif result_type == "CertificationGuidanceResponse":
            # Don't replace structured steps, only add summary
            if hasattr(tool_result, 'summary'):
                tool_result.summary = synthesis
        elif result_type == "StandardRecommendationResponse":
            # Keep structured standards list, only update summary
            if hasattr(tool_result, 'summary'):
                tool_result.summary = synthesis
        elif result_type == "LaboratoryResponse":
            if hasattr(tool_result, 'summary'):
                tool_result.summary = synthesis

        return tool_result

    def _extract_evidence(self, tool_result: FinalResponseUnion) -> str:
        """Extract text evidence from tool result for Gemini synthesis."""
        result_type = type(tool_result).__name__
        parts = []

        if result_type == "StandardRecommendationResponse":
            standards = getattr(tool_result, 'standards', [])
            for s in standards:
                parts.append(f"Standard: {s.code} — {s.title}. Reason: {s.reason}")
                if getattr(s, 'is_compulsory', False):
                    parts.append(f"  → COMPULSORY under QCO")
                if getattr(s, 'scope', None):
                    parts.append(f"  → Scope: {s.scope}")
        elif result_type == "TextResponse":
            parts.append(getattr(tool_result, 'content', ''))
        elif result_type == "HallmarkingResponse":
            parts.append(getattr(tool_result, 'summary', ''))
            details = getattr(tool_result, 'details', [])
            for d in details:
                if hasattr(d, 'description'):
                    parts.append(d.description)
        elif result_type == "LaboratoryResponse":
            labs = getattr(tool_result, 'labs', [])
            for lab in labs:
                parts.append(f"Lab: {getattr(lab, 'name', '')} | City: {getattr(lab, 'location', '')} | Tests: {', '.join(getattr(lab, 'supported_standards', []))}")
        elif result_type == "SchemeInformationResponse":
            parts.append(getattr(tool_result, 'summary', ''))
        elif result_type == "CertificationGuidanceResponse":
            parts.append(getattr(tool_result, 'summary', ''))

        return "\n".join(p for p in parts if p and str(p).strip())

    def process_message(self, request: ChatRequest) -> ChatResponse:
        session_id = request.session_id or str(uuid.uuid4())
        stages: List[ProcessingStage] = []

        # Stage 1: Intent Classification
        stages.append(ProcessingStage(
            stage="Understanding request",
            detail="Analyzing technical context and user query scope"
        ))

        intent_result: IntentClassification = classify_query_intent(request.message, language=request.language)
        allowed_tools = INTENT_TO_ALLOWED_TOOLS.get(intent_result.intent, [])

        # Out-of-scope: decline politely
        if intent_result.intent == IntentType.UNSUPPORTED_OR_OUT_OF_SCOPE:
            return ChatResponse(
                session_id=session_id,
                intent=intent_result.intent.value,
                tool_called=None,
                processing_stages=stages,
                response=TextResponse(
                    content=(
                        "I am the BIS Intelligence Assistant, specialized in Bureau of Indian Standards (BIS) topics — "
                        "Indian Standards (IS codes), QCOs, certification schemes, hallmarking, and testing laboratories. "
                        "Your question appears to be outside this domain. "
                        "Please ask me something related to BIS standards, product certification, or hallmarking!"
                    ),
                    sources=[],
                    disclaimer=""
                )
            )

        # Stage 2: Tool selection via LLM
        stages.append(ProcessingStage(
            stage="Selecting retrieval tool",
            detail=f"Intent: {intent_result.intent.value}"
        ))

        llm_decision = self.llm.generate_chat_response(
            prompt=request.message,
            history=request.history,
            tools=None
        )

        selected_tool = None
        tool_args: Dict[str, Any] = {}
        selection_reason = "No tool selected"

        requested_tool = llm_decision.get("tool_calls", [{}])[0].get("name") if llm_decision.get("tool_calls") else None
        if requested_tool and requested_tool in allowed_tools:
            selected_tool = requested_tool
            tool_args = llm_decision.get("tool_calls", [{}])[0].get("arguments", {})
            selection_reason = f"LLM selected tool within allowed set"
        elif allowed_tools:
            selected_tool = allowed_tools[0]
            # Build args from query
            hist_context = extract_context_from_history(request.history or [])
            tool_args = {
                "query": request.message,
                "product": hist_context.get("product", ""),
                "language": request.language,
                "location": "",
            }
            selection_reason = f"Fallback: used first allowed tool"

        if selected_tool:
            stages.append(ProcessingStage(
                stage=f"Executing: {selected_tool}",
                detail="Querying BIS knowledge base and Supabase"
            ))

            try:
                tool_result: FinalResponseUnion = tool_registry.execute_tool(
                    tool_name=selected_tool,
                    arguments=tool_args
                )
            except Exception as tool_exc:
                logger.error(f"Tool execution failed for {selected_tool}: {tool_exc}")
                # Fall through to Gemini general knowledge
                tool_result = None

            if tool_result is not None:
                evidence_text = self._extract_evidence(tool_result)

                if evidence_text and evidence_text.strip():
                    # TIER A: Evidence found — synthesize grounded answer
                    synthesis = self.llm.synthesize_answer(
                        prompt=request.message,
                        context=f"Official BIS Evidence Retrieved:\n{evidence_text}",
                        language=request.language
                    )
                else:
                    # TIER B: No evidence in DB — use Gemini general BIS knowledge
                    synthesis = self.llm.synthesize_answer(
                        prompt=request.message,
                        context="USE_GENERAL_KNOWLEDGE",
                        language=request.language
                    )

                final_result = self._build_final_response(tool_result, synthesis)

                return ChatResponse(
                    session_id=session_id,
                    intent=intent_result.intent.value,
                    tool_called=selected_tool,
                    processing_stages=stages,
                    response=final_result
                )

        # TIER C: No tool result at all — Gemini answers from general BIS knowledge
        stages.append(ProcessingStage(
            stage="Generating response",
            detail="Using Gemini general BIS knowledge"
        ))
        synthesis = self.llm.synthesize_answer(
            prompt=request.message,
            context="USE_GENERAL_KNOWLEDGE",
            language=request.language
        )
        return ChatResponse(
            session_id=session_id,
            intent=intent_result.intent.value,
            tool_called=None,
            processing_stages=stages,
            response=TextResponse(
                content=synthesis or "I couldn't find a specific answer. Please try rephrasing your BIS-related question.",
                sources=[],
                disclaimer=""
            )
        )


ai_orchestrator = AIOrchestrator()
orchestrator = ai_orchestrator
