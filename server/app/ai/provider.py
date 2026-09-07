import re
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from app.core.config import settings
from app.core.logging import logger
from app.ai.prompts.system import BIS_SYSTEM_PROMPT
from app.schemas.intent import IntentClassification, IntentType


OUT_OF_SCOPE_KEYWORDS = [
    # Programming & Tech Non-BIS
    "python", "javascript", "java", "c++", "c#", "ruby", "golang", "rust", "typescript",
    "programming", "coding", "programmer", "developer", "write code", "debug code",
    "script", "algorithm", "data structure", "teach me", "learn to code", "hello world",
    "sql query", "react", "next.js", "angular", "css", "html", "github", "linux command",
    # Gaming & Entertainment
    "minecraft", "roblox", "fortnite", "gta", "play game", "gameplay", "cheat code",
    "poem", "poetry", "write a story", "lyrics", "song", "movie", "cinema", "actor", "joke",
    # General non-BIS trivia & homework
    "capital of", "who won", "president of", "solve equation", "derivative", "integral",
    "weather today", "travel itinerary", "flight ticket"
]

BIS_CORE_KEYWORDS = [
    "bis", "indian standard", "is ", "isi mark", "crs", "fmcs", "hallmark", "huid",
    "manakonline", "conformity assessment", "testing laboratory", "lims", "qco",
    "quality control order", "carat", "fineness", "bis care", "मानक", "हॉलमार्क",
    "प्रमाणन", "लाइसेंस", "प्रयोगशाला", "शुद्धता"
]


def classify_query_intent(prompt: str, language: str = "en") -> IntentClassification:
    """
    Deterministically and rigorously classifies user query intent.
    Enforces strict domain boundaries before any tool is ever invoked.
    """
    lower_query = prompt.lower().strip()

    has_bis_core = any(k in lower_query for k in BIS_CORE_KEYWORDS)
    is_standard_code = bool(re.search(r"\bis\s*\d+", lower_query))

    # 1. Check for out-of-scope non-BIS queries
    for oos in OUT_OF_SCOPE_KEYWORDS:
        if oos in lower_query and not has_bis_core and not is_standard_code:
            return IntentClassification(
                intent=IntentType.UNSUPPORTED_OR_OUT_OF_SCOPE,
                query=prompt,
                language=language,  # type: ignore
                confidence=0.98,
                reasoning=f"Query matched non-BIS out-of-scope pattern '{oos}' without BIS context."
            )

    # 2. Hallmarking & HUID
    if any(k in lower_query for k in ["hallmark", "gold", "silver", "huid", "carat", "fineness", "हॉलमार्क", "सोना", "चांदी", "शुद्धता"]):
        return IntentClassification(
            intent=IntentType.HALLMARKING,
            query=prompt,
            language=language,  # type: ignore
            confidence=0.95,
            reasoning="Query specifically inquires about precious metals hallmarking, purity, or HUID verification."
        )

    # 3. Testing Laboratories
    if any(k in lower_query for k in ["lab", "laboratory", "testing lab", "test facility", "lims", "nabl", "प्रयोगशाला", "परीक्षण"]):
        return IntentClassification(
            intent=IntentType.TESTING_LABORATORY,
            query=prompt,
            language=language,  # type: ignore
            confidence=0.95,
            reasoning="Query inquires about BIS testing laboratories, capabilities, or locations."
        )

    # 4. Schemes Information
    if any(k in lower_query for k in [
        "scheme i", "scheme-i", "scheme 1",
        "scheme ii", "scheme-ii", "scheme 2",
        "scheme iv", "scheme-iv", "scheme 4",
        "scheme x", "scheme-x", "scheme 10",
        "crs scheme", "fmcs scheme", "coc scheme", "योजना"
    ]):
        return IntentClassification(
            intent=IntentType.SCHEME_INFORMATION,
            query=prompt,
            language=language,  # type: ignore
            confidence=0.95,
            reasoning="Query seeks specific details on a BIS conformity assessment scheme."
        )

    # 5. Certification Guidance
    if any(k in lower_query for k in ["certification", "license", "how to get", "apply for isi", "process to get", "प्रमाणन", "लाइसेंस"]):
        return IntentClassification(
            intent=IntentType.CERTIFICATION_GUIDANCE,
            query=prompt,
            language=language,  # type: ignore
            confidence=0.90,
            reasoning="Query asks for procedural certification pathways or licensing steps."
        )

    # 5.5 QCO, Mandatory / Compulsory Status & Technical Regulations
    if any(k in lower_query for k in [
        "qco", "quality control order", "compulsory", "mandatory", "is this standard compulsory",
        "is it compulsory", "mandatory certification", "under qco", "section 16", "section 29",
        "penalty", "prohibition", "अनिवार्य", "बाध्यकारी"
    ]):
        return IntentClassification(
            intent=IntentType.TECHNICAL_QUERY,
            query=prompt,
            language=language,  # type: ignore
            confidence=0.95,
            reasoning="Query inquires about Quality Control Orders (QCOs), compulsory certification, or statutory requirements."
        )

    # 6. Consumer Queries
    if any(k in lower_query for k in ["complaint", "bis care app", "fake isi", "fraud", "consumer protection", "शिकायत"]):
        return IntentClassification(
            intent=IntentType.CONSUMER_QUERY,
            query=prompt,
            language=language,  # type: ignore
            confidence=0.90,
            reasoning="Query concerns consumer grievance, verification, or BIS Care App guidance."
        )

    # 7. Indian Standards
    if is_standard_code or any(k in lower_query for k in ["standard", "specification", "pressure cooker", "water", "toy", "cable", "appliance", "मानक", "स्पेसिफिकेशन"]):
        return IntentClassification(
            intent=IntentType.FIND_STANDARD,
            query=prompt,
            language=language,  # type: ignore
            confidence=0.90,
            reasoning="Query seeks Indian Standards (IS) applicable to a specific product or standard code."
        )

    # 8. If query lacks BIS relevance, mark as out-of-scope rather than defaulting to search_bis_standards!
    return IntentClassification(
        intent=IntentType.UNSUPPORTED_OR_OUT_OF_SCOPE,
        query=prompt,
        language=language,  # type: ignore
        confidence=0.85,
        reasoning="Query does not contain recognized BIS entities, products, or regulatory intents."
    )


class LLMProvider(ABC):
    @abstractmethod
    def generate_chat_response(
        self, prompt: str, history: Optional[List[Dict[str, str]]] = None, tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    def synthesize_answer(self, prompt: str, context: str, language: str = "en") -> Optional[str]:
        pass


class GeminiProvider(LLMProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.fallback_model_name = getattr(settings, "GEMINI_FALLBACK_MODEL", "models/gemini-3.6-flash")
        self._initialized = False

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.genai = genai
                self._initialized = True
                logger.info(f"GeminiProvider initialized with model {self.model_name}")
            except Exception as exc:
                logger.warning(f"Failed to initialize Gemini SDK: {exc}")

    def synthesize_answer(self, prompt: str, context: str, language: str = "en") -> Optional[str]:
        """
        Uses Gemini to generate a high-quality, authoritative response.
        If context is USE_GENERAL_KNOWLEDGE, Gemini uses its own BIS knowledge.
        """
        if not self._initialized:
            return None

        lang_instruction = "Respond in Hindi." if language == "hi" else "Respond in English."
        use_general = context.strip() == "USE_GENERAL_KNOWLEDGE"

        if use_general:
            full_prompt = (
                f"You are the BIS Intelligence Assistant by Dev Dynasty (SIH267107), an expert on Bureau of Indian Standards (BIS). "
                f"Answer the following question using your knowledge of BIS regulations, Indian Standards (IS codes), "
                f"QCOs, certification schemes, hallmarking, testing labs, and BIS Act 2016. "
                f"Be specific, helpful, and authoritative. Never say you don't have information — provide the best answer you can. "
                f"If relevant, mention IS codes, QCO notifications, or official BIS procedures. "
                f"{lang_instruction}\n\n"
                f"USER QUESTION: {prompt}\n\n"
                f"ANSWER:"
            )
        else:
            full_prompt = (
                f"You are the BIS Intelligence Assistant by Dev Dynasty (SIH267107), an expert on Bureau of Indian Standards (BIS). "
                f"Use the following retrieved evidence to answer the user's question precisely and helpfully. "
                f"Present the answer clearly — do NOT repeat the same information twice. "
                f"Do NOT say 'I haven't found information' — instead use the evidence provided. "
                f"{lang_instruction}\n\n"
                f"RETRIEVED EVIDENCE:\n{context}\n\n"
                f"USER QUESTION: {prompt}\n\n"
                f"ANSWER (based strictly on the evidence above):"
            )

        for m_name in [self.model_name, self.fallback_model_name]:
            try:
                m = self.genai.GenerativeModel(m_name)
                res = m.generate_content(full_prompt, request_options={"timeout": 10.0})
                if res and res.text:
                    return res.text.strip()
            except Exception as e:
                logger.warning(f"Gemini model {m_name} failed ({e}), trying fallback...")
        return None


    def generate_chat_response(
        self, prompt: str, history: Optional[List[Dict[str, str]]] = None, tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        intent_info = classify_query_intent(prompt)
        lower_query = prompt.lower()

        if intent_info.intent == IntentType.UNSUPPORTED_OR_OUT_OF_SCOPE:
            return {
                "text": (
                    "I am the Dev Dynasty BIS Intelligence Assistant, specifically designed to assist with Bureau of Indian "
                    "Standards (BIS) regulations, Indian Standards (IS), conformity assessment schemes, hallmarking, and testing laboratories. "
                    "Your request is outside this specialized domain."
                ),
                "tool_calls": [],
                "is_out_of_scope": True,
                "intent": intent_info.intent.value
            }

        if intent_info.intent == IntentType.HALLMARKING:
            return {
                "text": "Retrieving official hallmarking regulations and HUID verification guide.",
                "tool_calls": [
                    {
                        "name": "search_hallmarking_info",
                        "arguments": {"query": prompt, "language": "hi" if any(w in prompt for w in ["हॉलमार्क", "सोना", "मानक"]) else "en"}
                    }
                ],
                "intent": intent_info.intent.value
            }

        if intent_info.intent == IntentType.TESTING_LABORATORY:
            location = "Mumbai" if "mumbai" in lower_query else ("Delhi" if "delhi" in lower_query else ("Noida" if "noida" in lower_query else None))
            return {
                "text": "Searching recognized testing laboratories.",
                "tool_calls": [
                    {
                        "name": "find_testing_labs",
                        "arguments": {
                            "product_or_test": prompt,
                            "location": location,
                            "language": "hi" if any(w in prompt for w in ["लैब", "परीक्षण"]) else "en"
                        }
                    }
                ],
                "intent": intent_info.intent.value
            }

        if intent_info.intent == IntentType.SCHEME_INFORMATION:
            return {
                "text": "Retrieving BIS conformity scheme overview.",
                "tool_calls": [
                    {
                        "name": "get_scheme_information",
                        "arguments": {
                            "scheme_name": prompt,
                            "language": "hi" if any(w in prompt for w in ["योजना"]) else "en"
                        }
                    }
                ],
                "intent": intent_info.intent.value
            }

        if intent_info.intent == IntentType.CERTIFICATION_GUIDANCE:
            return {
                "text": "Retrieving step-by-step BIS certification guidance.",
                "tool_calls": [
                    {
                        "name": "get_certification_guidance",
                        "arguments": {
                            "product": prompt,
                            "language": "hi" if any(w in prompt for w in ["प्रमाणन", "प्रक्रिया"]) else "en"
                        }
                    }
                ],
                "intent": intent_info.intent.value
            }

        if intent_info.intent == IntentType.CONSUMER_QUERY:
            return {
                "text": "Searching verified BIS consumer FAQs and guidelines.",
                "tool_calls": [
                    {
                        "name": "search_bis_knowledge",
                        "arguments": {
                            "query": prompt
                        }
                    }
                ],
                "intent": intent_info.intent.value
            }

        # FIND_STANDARD
        return {
            "text": "Searching Indian Standards knowledge base.",
            "tool_calls": [
                {
                    "name": "search_bis_standards",
                    "arguments": {
                        "product": prompt,
                        "query": prompt,
                        "language": "hi" if any(w in prompt for w in ["मानक", "उत्पाद"]) else "en"
                    }
                }
            ],
            "intent": intent_info.intent.value
        }


class MockProvider(LLMProvider):
    """Fallback provider when Gemini API key is unavailable. Provides deterministic tool routing only."""

    def synthesize_answer(self, prompt: str, context: str, language: str = "en") -> Optional[str]:
        return None

    def generate_chat_response(
        self, prompt: str, history: Optional[List[Dict[str, str]]] = None, tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        intent_info = classify_query_intent(prompt)

        if intent_info.intent == IntentType.UNSUPPORTED_OR_OUT_OF_SCOPE:
            return {
                "text": "I am the Dev Dynasty BIS Intelligence Assistant. Your request is outside the BIS domain.",
                "tool_calls": [],
                "is_out_of_scope": True,
                "intent": intent_info.intent.value
            }

        # Map intent to tool call
        intent_tool_map = {
            IntentType.HALLMARKING: ("search_hallmarking_info", {"query": prompt}),
            IntentType.TESTING_LABORATORY: ("find_testing_labs", {"product_or_test": prompt}),
            IntentType.SCHEME_INFORMATION: ("get_scheme_information", {"scheme_name": prompt}),
            IntentType.CERTIFICATION_GUIDANCE: ("get_certification_guidance", {"product": prompt}),
            IntentType.CONSUMER_QUERY: ("search_bis_knowledge", {"query": prompt}),
        }

        if intent_info.intent in intent_tool_map:
            tool_name, args = intent_tool_map[intent_info.intent]
            return {
                "text": f"Searching BIS knowledge base.",
                "tool_calls": [{"name": tool_name, "arguments": args}],
                "intent": intent_info.intent.value
            }

        return {
            "text": "Searching Indian Standards.",
            "tool_calls": [{"name": "search_bis_standards", "arguments": {"product": prompt, "query": prompt}}],
            "intent": intent_info.intent.value
        }


def get_llm_provider() -> LLMProvider:
    if settings.is_gemini_configured:
        return GeminiProvider()
    return MockProvider()

