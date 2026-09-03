export type Language = "en" | "hi";

export interface SourceCitation {
  document_title: string;
  section?: string | null;
  page_number?: number | null;
  url?: string | null;
  is_demo: boolean;
  demo_badge?: string | null;
}

export interface StandardItem {
  code: string;
  title: string;
  reason: string;
  label?: string;
  confidence: "high" | "medium" | "low";
  match_strength?: string;
  relevance_score?: number;
  is_demo: boolean;
  demo_badge?: string | null;
}

export interface StandardRecommendationResponse {
  type: "standard_recommendation";
  summary: string;
  standards: StandardItem[];
  sources: SourceCitation[];
  disclaimer: string;
  clarification_prompt?: string | null;
  is_demo: boolean;
  demo_badge?: string | null;
}

export interface StandardSearchParams {
  product: string;
  category?: string;
  material?: string;
  intended_use?: string;
  description?: string;
  query?: string;
  language?: Language;
}

export interface CertificationStepItem {
  step_number: number;
  title: string;
  description: string;
  important_notes?: string | null;
}

export interface CertificationGuidanceResponse {
  type: "certification_guidance";
  product: string;
  scheme_name: string;
  summary: string;
  applicability?: string | null;
  applicable_products_or_standards?: string[] | null;
  steps: CertificationStepItem[];
  required_documents?: string[] | null;
  testing_and_assessment?: string | null;
  important_notes?: string[] | null;
  sources: SourceCitation[];
  retrieval_summary?: string | null;
  disclaimer: string;
  is_demo: boolean;
  demo_badge?: string | null;
}

export interface SchemeInformationResponse {
  type: "scheme_information";
  scheme_name: string;
  description: string;
  applicability: string;
  key_features: string[];
  sources: SourceCitation[];
  disclaimer: string;
  is_demo: boolean;
  demo_badge?: string | null;
}

export interface HallmarkingResponse {
  type: "hallmarking_info";
  summary: string;
  precious_metal?: string;
  mandatory_marks: string[];
  purity_grades?: string[];
  consumer_verification_steps: string[];
  sources: SourceCitation[];
  disclaimer: string;
  is_demo: boolean;
  demo_badge?: string | null;
}

export interface LaboratoryItem {
  name: string;
  location: string;
  scope_or_capabilities: string;
  recognition_status: string;
  source_url?: string | null;
  is_demo: boolean;
  demo_badge?: string | null;
}

export interface LaboratoryResultsResponse {
  type: "laboratory_results";
  summary: string;
  laboratories: LaboratoryItem[];
  sources: SourceCitation[];
  disclaimer: string;
  is_demo: boolean;
  demo_badge?: string | null;
}

export interface TextResponse {
  type: "text";
  content: string;
  sources: SourceCitation[];
  disclaimer?: string | null;
  is_demo: boolean;
  demo_badge?: string | null;
}

export interface ClarificationRequiredResponse {
  type: "clarification_required";
  question: string;
  suggested_options: string[];
}

export interface InsufficientEvidenceResponse {
  type: "insufficient_evidence";
  message: string;
  recommended_official_action: string;
}

export interface ErrorResponse {
  type: "error";
  message: string;
}

export type FinalResponseUnion =
  | StandardRecommendationResponse
  | CertificationGuidanceResponse
  | SchemeInformationResponse
  | HallmarkingResponse
  | LaboratoryResultsResponse
  | TextResponse
  | ClarificationRequiredResponse
  | InsufficientEvidenceResponse
  | ErrorResponse;

export interface ProcessingStage {
  stage: string;
  detail: string;
}

export interface ChatResponse {
  session_id: string;
  intent: string;
  tool_called?: string | null;
  processing_stages: ProcessingStage[];
  response: FinalResponseUnion;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content?: string;
  structuredResponse?: FinalResponseUnion;
  processingStages?: ProcessingStage[];
  toolCalled?: string | null;
  timestamp: string;
}
