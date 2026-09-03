from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from app.core.config import settings
from app.core.logging import logger
from app.ai.prompts.system import BIS_SYSTEM_PROMPT


class LLMProvider(ABC):
    @abstractmethod
    def generate_chat_response(
        self, prompt: str, history: Optional[List[Dict[str, str]]] = None, tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        pass


class GeminiProvider(LLMProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
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

    def generate_chat_response(
        self, prompt: str, history: Optional[List[Dict[str, str]]] = None, tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        if not self._initialized:
            return MockProvider().generate_chat_response(prompt, history, tools)

        try:
            model = self.genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=BIS_SYSTEM_PROMPT
            )
            chat = model.start_chat(history=[])
            response = chat.send_message(prompt)
            return {
                "text": response.text,
                "tool_calls": []
            }
        except Exception as exc:
            logger.error(f"Gemini API call failed: {exc}. Falling back to mock provider.")
            return MockProvider().generate_chat_response(prompt, history, tools)


class MockProvider(LLMProvider):
    """
    Controlled Mock Provider for offline architecture validation and testing.
    Determines tool calling deterministically from query keywords.
    """
    def generate_chat_response(
        self, prompt: str, history: Optional[List[Dict[str, str]]] = None, tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        lower_query = prompt.lower()

        # Check for out-of-scope queries
        out_of_scope_keywords = ["poem", "story", "game", "recipe", "python code", "minecraft", "movie"]
        if any(w in lower_query for w in out_of_scope_keywords):
            return {
                "text": "I am the Dev Dynasty BIS Intelligence Assistant, specifically designed to help with Bureau of Indian Standards (BIS) regulations, Indian Standards (IS), conformity schemes, and hallmarking. Your request is outside my domain scope.",
                "tool_calls": [],
                "is_out_of_scope": True
            }

        # Intent / Tool dispatch rules
        if any(w in lower_query for w in ["hallmark", "gold", "silver", "huid", "carat", "हॉलमार्क", "सोना"]):
            return {
                "text": "Fetching official hallmarking regulations and HUID verification guide.",
                "tool_calls": [
                    {
                        "name": "search_hallmarking_info",
                        "arguments": {"query": prompt, "language": "hi" if any(w in prompt for w in ["हॉलमार्क", "सोना", "मानक"]) else "en"}
                    }
                ]
            }

        if any(w in lower_query for w in ["lab", "laboratory", "testing", "लैब", "प्रयोगशाला", "परीक्षण"]):
            # Extract location hint if present
            location = "Mumbai" if "mumbai" in lower_query else ("Delhi" if "delhi" in lower_query else None)
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
                ]
            }

        if any(w in lower_query for w in ["certification", "license", "how to get", "process", "apply", "प्रमाणन", "लाइसेंस"]):
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
                ]
            }

        if any(w in lower_query for w in ["scheme", "crs", "isi mark", "fmcs", "योजना"]):
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
                ]
            }

        # Default to standard search
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
            ]
        }


def get_llm_provider() -> LLMProvider:
    if settings.is_gemini_configured:
        return GeminiProvider()
    return MockProvider()
