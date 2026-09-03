from typing import List, Literal, Optional, Union
from pydantic import BaseModel, Field


class SourceCitation(BaseModel):
    document_title: str = Field(..., description="Document or guideline title")
    section: Optional[str] = Field(default=None, description="Section or chapter name")
    page_number: Optional[int] = Field(default=None, description="Page number if available")
    url: Optional[str] = Field(default=None, description="Official portal or source URL")
    is_demo: bool = Field(default=False, description="Whether this citation is from demo seed data")
    demo_badge: Optional[str] = Field(default="Demo / Sample / Not official", description="Explicit demo indicator")


class StandardItem(BaseModel):
    code: str = Field(..., description="Standard code (e.g. IS 2347)")
    title: str = Field(..., description="Title of the standard")
    reason: str = Field(..., description="Why this standard is relevant")
    label: str = Field(default="Potentially Relevant Standard", description="Classification label")
    confidence: Literal["high", "medium", "low"] = Field(default="high")
    relevance_score: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Computed relevance score")
    is_demo: bool = Field(default=False)
    demo_badge: Optional[str] = Field(default="Demo / Sample / Not official")


class StandardRecommendationResponse(BaseModel):
    type: Literal["standard_recommendation"] = "standard_recommendation"
    summary: str
    standards: List[StandardItem]
    sources: List[SourceCitation]
    disclaimer: str = (
        "This recommendation identifies Potentially Relevant Standards based on available BIS records. "
        "Final applicability and mandatory status should be verified through official Quality Control Orders (QCOs) on manakonline.in."
    )
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class CertificationStepItem(BaseModel):
    step_number: int
    title: str
    description: str
    important_notes: Optional[str] = None


class CertificationGuidanceResponse(BaseModel):
    type: Literal["certification_guidance"] = "certification_guidance"
    product: str
    scheme_name: str
    summary: str
    steps: List[CertificationStepItem]
    required_documents: List[str] = Field(default_factory=list)
    sources: List[SourceCitation]
    disclaimer: str = "This is procedural guidance based on available documentation. Compliance criteria and fees must be confirmed directly with BIS."
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class SchemeInformationResponse(BaseModel):
    type: Literal["scheme_information"] = "scheme_information"
    scheme_name: str
    description: str
    applicability: str
    key_features: List[str]
    sources: List[SourceCitation]
    disclaimer: str = "Official scheme details are governed by BIS regulations."
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class HallmarkingResponse(BaseModel):
    type: Literal["hallmarking_info"] = "hallmarking_info"
    summary: str
    mandatory_marks: List[str] = Field(
        default_factory=lambda: [
            "1. BIS Logo (Standard Triangle Hallmark)",
            "2. Purity & Fineness (e.g., 22K916, 18K750, 14K585)",
            "3. 6-digit Alphanumeric HUID (Hallmark Unique Identification)"
        ]
    )
    consumer_verification_steps: List[str]
    sources: List[SourceCitation]
    disclaimer: str = "Hallmarking guidelines are based on official BIS regulations. Verify authenticity using the BIS CARE mobile app."
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class LaboratoryItem(BaseModel):
    name: str
    location: str
    scope_or_capabilities: str
    recognition_status: str
    source_url: Optional[str] = None
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class LaboratoryResultsResponse(BaseModel):
    type: Literal["laboratory_results"] = "laboratory_results"
    summary: str
    laboratories: List[LaboratoryItem]
    sources: List[SourceCitation]
    disclaimer: str = "Laboratory recognition should be verified directly with the official BIS LIMS laboratory directory."
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class InsufficientEvidenceResponse(BaseModel):
    type: Literal["insufficient_evidence"] = "insufficient_evidence"
    message: str
    clarification_prompt: Optional[str] = None
    known_scope: List[str] = Field(default_factory=list)
    sources: List[SourceCitation] = Field(default_factory=list)
    disclaimer: str = "The assistant does not fabricate answers when verified evidence is absent."
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class ClarificationRequiredResponse(BaseModel):
    type: Literal["clarification_required"] = "clarification_required"
    message: str
    suggested_options: List[str]
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class TextResponse(BaseModel):
    type: Literal["text"] = "text"
    content: str
    sources: List[SourceCitation] = Field(default_factory=list)
    disclaimer: Optional[str] = None
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class ErrorResponse(BaseModel):
    type: Literal["error"] = "error"
    error_code: str = "ERROR"
    message: str
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


FinalResponseUnion = Union[
    StandardRecommendationResponse,
    CertificationGuidanceResponse,
    SchemeInformationResponse,
    HallmarkingResponse,
    LaboratoryResultsResponse,
    InsufficientEvidenceResponse,
    ClarificationRequiredResponse,
    TextResponse,
    ErrorResponse
]
