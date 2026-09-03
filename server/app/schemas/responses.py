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
    confidence: Literal["high", "medium", "low"] = Field(default="high")
    is_demo: bool = Field(default=False)
    demo_badge: Optional[str] = Field(default="Demo / Sample / Not official")


class StandardRecommendationResponse(BaseModel):
    type: Literal["standard_recommendation"] = "standard_recommendation"
    summary: str
    standards: List[StandardItem]
    sources: List[SourceCitation]
    disclaimer: str = "Standards identified from current knowledge base. Final applicability should be verified through official BIS processes."
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
    precious_metal: str = "Gold / Silver"
    mandatory_marks: List[str] = Field(
        default_factory=lambda: [
            "BIS Standard Mark (Triangle)",
            "Purity Grade & Fineness (e.g. 22K916)",
            "6-digit alphanumeric HUID (Hallmark Unique Identification)"
        ]
    )
    purity_grades: List[str] = Field(
        default_factory=lambda: [
            "14 Carat (14K585)",
            "18 Carat (18K750)",
            "20 Carat (20K833)",
            "22 Carat (22K916)",
            "23 Carat (23K958)",
            "24 Carat (24K995)"
        ]
    )
    consumer_verification_steps: List[str]
    sources: List[SourceCitation]
    disclaimer: str = "Hallmarking guidelines reflect official BIS standards. Consumers can verify HUID using the BIS CARE app."
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
    disclaimer: str = "Laboratory recognition and testing capabilities should be verified via the official BIS laboratory directory."
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class SourceListResponse(BaseModel):
    type: Literal["source_list"] = "source_list"
    summary: str
    sources: List[SourceCitation]
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class ClarificationRequiredResponse(BaseModel):
    type: Literal["clarification_required"] = "clarification_required"
    question: str
    suggested_options: List[str] = Field(default_factory=list)


class InsufficientEvidenceResponse(BaseModel):
    type: Literal["insufficient_evidence"] = "insufficient_evidence"
    message: str = "I could not find sufficient verified BIS information in the current knowledge base to answer this confidently."
    recommended_official_action: str = "Please consult the official BIS portal (www.bis.gov.in) or Manakonline (www.manakonline.in) for latest Gazette notifications and standards."


class TextResponse(BaseModel):
    type: Literal["text"] = "text"
    content: str
    sources: List[SourceCitation] = Field(default_factory=list)
    disclaimer: Optional[str] = None
    is_demo: bool = False
    demo_badge: Optional[str] = "Demo / Sample / Not official"


class ErrorResponse(BaseModel):
    type: Literal["error"] = "error"
    message: str


FinalResponseUnion = Union[
    StandardRecommendationResponse,
    CertificationGuidanceResponse,
    SchemeInformationResponse,
    HallmarkingResponse,
    LaboratoryResultsResponse,
    SourceListResponse,
    ClarificationRequiredResponse,
    InsufficientEvidenceResponse,
    TextResponse,
    ErrorResponse
]
