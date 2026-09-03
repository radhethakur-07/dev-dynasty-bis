from enum import Enum
from typing import Literal, Optional
from pydantic import BaseModel, Field


class IntentType(str, Enum):
    FIND_STANDARD = "find_standard"
    CERTIFICATION_GUIDANCE = "certification_guidance"
    SCHEME_INFORMATION = "scheme_information"
    HALLMARKING = "hallmarking"
    TESTING_LABORATORY = "testing_laboratory"
    CONSUMER_QUERY = "consumer_query"
    RELATED_STANDARD_SEARCH = "related_standard_search"
    TECHNICAL_QUERY = "technical_query"
    UNSUPPORTED_OR_OUT_OF_SCOPE = "unsupported_or_out_of_scope"


class IntentClassification(BaseModel):
    intent: IntentType
    query: str = Field(min_length=1, max_length=1000)
    product: Optional[str] = Field(default=None, max_length=200)
    language: Literal["en", "hi"] = "en"
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    reasoning: Optional[str] = Field(default=None, max_length=500)
