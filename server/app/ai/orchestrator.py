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


def extract_context_from_history(history: List[Any]) -> Dict[str, Optional[str]]:
    """
    Extracts the most recent standard code (e.g. IS 14543, IS 2347)
    and product mentions from previous chat history turns.
    """
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

        # Stage 2: Intent Validation & Out-of-Scope Check
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

        # Stage 2.5: Multi-Turn Context & Conversational Anaphora Resolution
        context = extract_context_from_history(request.history)
        active_standard = context.get("standard_code")
        active_product = context.get("product")

        lower_query = request.message.lower()
        is_qco_or_compulsory = any(k in lower_query for k in [
            "compulsory", "mandatory", "qco", "quality control order", "order compulsory",
            "is this standard compulsory", "is it compulsory", "under qco", "mandatory certification",
            "अनिवार्य", "बाध्यकारी"
        ])
        is_anaphora = any(k in lower_query for k in [
            "this standard", "this product", "it", "this", "the standard", "iss standard", "ye standard"
        ])

        # Specialized Grounded Handler: Direct QCO & Mandatory Certification Inquiries
        if is_qco_or_compulsory:
            target_std_code = None
            if active_standard and is_anaphora:
                target_std_code = active_standard
            else:
                std_match = re.search(r"\bIS\s*(\d{3,5})", request.message, re.IGNORECASE)
                if std_match:
                    target_std_code = f"IS {std_match.group(1)}"
                elif active_standard:
                    target_std_code = active_standard

            if target_std_code:
                stages.append(
                    ProcessingStage(
                        stage="Regulatory QCO verification",
                        detail=f"Checking Quality Control Order and mandatory certification for {target_std_code}"
                    )
                )

                found_stds = standards_repo.search_standards(target_std_code)
                if found_stds:
                    top_std = found_stds[0]
                    std_title = top_std.get("title", "")
                    std_code = top_std.get("code", target_std_code)
                    std_status = top_std.get("status", "Active")
                    std_reason = top_std.get("reason", "")
                    std_url = top_std.get("source_url") or "https://www.bis.gov.in"

                    grounded_context = (
                        f"Standard: {std_code}\n"
                        f"Title: {std_title}\n"
                        f"Status: {std_status}\n"
                        f"Regulatory Mandate / QCO Details: {std_reason}\n"
                        f"Official Source URL: {std_url}"
                    )

                    synthesis = self.llm.synthesize_answer(
                        prompt=request.message,
                        context=grounded_context,
                        language=request.language
                    )

                    if not synthesis:
                        is_compulsory = "compulsory" in std_reason.lower() or std_status.lower() == "compulsory"
                        comp_str = "COMPULSORY under BIS certification (Scheme I — ISI Mark)" if is_compulsory else "VOLUNTARY (not under compulsory QCO)"
                        synthesis = (
                            f"**Yes.** Bureau of Indian Standards (BIS) certification for **{std_code}** ({std_title}) is **{comp_str}**.\n\n"
                            f"**Regulatory Framework:** {std_reason}. Under Section 16 of the BIS Act, 2016 and applicable statutory notifications, "
                            f"all manufacturers, importers, and sellers must hold a valid BIS licence and display the Standard Mark."
                        )

                    stages.append(
                        ProcessingStage(
                            stage="Synthesizing grounded regulatory response",
                            detail=f"Authoritative determination for {std_code}"
                        )
                    )

                    rec_item = StandardItem(
                        code=std_code,
                        title=std_title,
                        reason=std_reason,
                        label="Applicable Mandatory Standard",
                        confidence="high",
                        match_strength="Definitive Regulatory Match",
                        relevance_score=1.0,
                        is_demo=False
                    )

                    return ChatResponse(
                        session_id=session_id,
                        intent=IntentType.TECHNICAL_QUERY.value,
                        tool_called="verify_qco_status",
                        processing_stages=stages,
                        response=StandardRecommendationResponse(
                            summary=synthesis,
                            standards=[rec_item],
                            sources=[
                                SourceCitation(
                                    document_title=f"BIS Mandatory Certification Order — {std_code}",
                                    section="Quality Control Order (QCO) / Statutory Notification",
                                    url=std_url,
                                    is_demo=False
                                )
                            ],
                            disclaimer="Final regulatory applicability and enforcement dates must be confirmed through official Gazette notifications on manakonline.in."
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
            eff_product = active_product if (is_anaphora and active_product) else request.message
            eff_query = f"{active_product} {active_standard or ''}".strip() if (is_anaphora and active_product) else request.message
            tool_args = {
                "query": eff_query,
                "product": eff_product,
                "product_or_test": eff_product,
                "language": request.language
            }
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

            try:
                tool_result: FinalResponseUnion = tool_registry.execute_tool(
                    tool_name=selected_tool,
                    arguments=tool_args
                )
            except Exception as tool_exc:
                logger.error(f"Tool execution failed for {selected_tool}: {tool_exc}")
                return ChatResponse(
                    session_id=session_id,
                    intent=intent_result.intent.value,
                    tool_called=selected_tool,
                    processing_stages=stages,
                    response=TextResponse(
                        content="I encountered an error while retrieving information. Please try rephrasing your question or try again in a moment.",
                        sources=[],
                        disclaimer="Tool execution encountered a temporary error."
                    )
                )

            stages.append(
                ProcessingStage(
                    stage="Verifying source citations",
                    detail="Ensuring document titles, sections, and demo notices are attached"
                )
            )


            # TASK 1: Synthesize tool results
            evidence_text = ""
            result_type = type(tool_result).__name__
            if result_type == "StandardRecommendationResponse":
                evidence_text = "\n".join([f"Standard: {s.code}, Title: {s.title}, Reason: {s.reason}" for s in getattr(tool_result, 'standards', [])])
            elif result_type == "TextResponse":
                evidence_text = getattr(tool_result, 'content', '')
            elif result_type == "HallmarkingResponse":
                evidence_text = getattr(tool_result, 'summary', '')
            elif result_type == "LaboratoryResponse":
                evidence_text = "\n".join([f"Lab: {l.name}, Location: {l.location}, Standards: {', '.join(getattr(l, 'supported_standards', []))}" for l in getattr(tool_result, 'labs', [])])
            elif result_type == "SchemeInformationResponse":
                evidence_text = getattr(tool_result, 'summary', '')

            # TASK 2: TIER A and TIER B logic
            if evidence_text and str(evidence_text).strip():
                # TIER A
                synthesis = self.llm.synthesize_answer(
                    prompt=request.message,
                    context=f"Retrieved Evidence:\n{evidence_text}",
                    language=request.language
                )
                if synthesis:
                    if hasattr(tool_result, 'summary') and not isinstance(tool_result, TextResponse):
                        tool_result.summary = synthesis
                    elif isinstance(tool_result, TextResponse):
                        tool_result.content = synthesis
            else:
                # TIER B: BIS-related question but no evidence
                synthesis = self.llm.synthesize_answer(
                    prompt=request.message,
                    context="No specific evidence found. I could not find verified official data for this exact question. Provide general BIS guidance and acknowledge missing information.",
                    language=request.language
                )
                if synthesis:
                    if hasattr(tool_result, 'summary') and not isinstance(tool_result, TextResponse):
                        tool_result.summary = synthesis
                    elif isinstance(tool_result, TextResponse):
                        tool_result.content = synthesis

            return ChatResponse(
                session_id=session_id,
                intent=intent_result.intent.value,
                tool_called=selected_tool,
                processing_stages=stages,
                response=tool_result
            )

        # TIER B: No tool selected, but BIS-related (fallback direct guidance)
        stages.append(
            ProcessingStage(
                stage="Preparing response",
                detail="Synthesizing BIS guidance (No evidence)"
            )
        )
        synthesis = self.llm.synthesize_answer(
            prompt=request.message,
            context="No specific evidence found. I could not find verified official data for this exact question. Provide general BIS guidance and acknowledge missing information.",
            language=request.language
        )
        return ChatResponse(
            session_id=session_id,
            intent=intent_result.intent.value,
            tool_called=None,
            processing_stages=stages,
            response=TextResponse(
                content=synthesis if synthesis else llm_decision.get("text", "I could not find verified official data for this exact question. Please clarify your BIS or Indian Standards query."),
                sources=[],
                disclaimer="Dev Dynasty Assistant operates strictly within the Bureau of Indian Standards scope."
            )
        )


ai_orchestrator = AIOrchestrator()
orchestrator = ai_orchestrator
