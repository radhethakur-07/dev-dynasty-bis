import {
  ChatResponse,
  FinalResponseUnion,
  Language,
  StandardRecommendationResponse,
  StandardSearchParams,
  CertificationGuidanceResponse,
  HallmarkingResponse,
  LaboratoryResultsResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getAuthHeaders(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bis-auth-token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return response.json();
}

export async function registerUser(name: string, email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  return response.json();
}

export async function verifyEmail(email: string, code: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Verification failed");
  }
  return response.json();
}

export async function getUserSessions() {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error("Failed to load sessions");
  return response.json();
}

export async function getSessionMessages(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}/messages`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error("Failed to load session messages");
  return response.json();
}

export async function createSession() {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error("Failed to create session");
  return response.json();
}

export async function deleteSession(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error("Failed to delete session");
  return response.json();
}

export async function renameSession(sessionId: string, title: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error("Failed to rename session");
  return response.json();
}

export async function sendChatMessage(
  message: string,
  sessionId?: string,
  language: Language = "en",
  history: { role: string; content: string }[] = []
): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        language,
        history,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.detail || "Failed to communicate with BIS Intelligence Assistant."
      );
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. The server may be busy. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchStandards(
  params: StandardSearchParams
): Promise<StandardRecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/standards/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({
      product: params.product,
      query: params.query || params.product,
      category: params.category || undefined,
      material: params.material || undefined,
      intended_use: params.intended_use || undefined,
      description: params.description || undefined,
      language: params.language || "en",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve Indian Standards recommendations.");
  }

  return response.json();
}

export async function getCertificationGuidance(
  product: string,
  scheme?: string,
  language: Language = "en"
): Promise<CertificationGuidanceResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/certification/guidance`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ product, scheme, language }),
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve certification pathway guidance.");
  }

  return response.json();
}

export async function searchHallmarking(
  query: string,
  language: Language = "en"
): Promise<HallmarkingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/hallmarking/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ query, language }),
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve hallmarking regulations.");
  }

  return response.json();
}

export async function searchLaboratories(
  productOrTestOrParams: string | { product_or_test?: string; location?: string; language?: Language },
  location?: string,
  language: Language = "en"
): Promise<LaboratoryResultsResponse> {
  const isObj = typeof productOrTestOrParams === "object" && productOrTestOrParams !== null;
  const p = isObj ? (productOrTestOrParams.product_or_test || "") : (productOrTestOrParams || "");
  const l = isObj ? productOrTestOrParams.location : location;
  const lang = isObj ? (productOrTestOrParams.language || "en") : (language || "en");

  const response = await fetch(`${API_BASE_URL}/api/v1/laboratories/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ product_or_test: p, location: l, language: lang }),
  });

  if (!response.ok) {
    throw new Error("Failed to search recognized testing laboratories.");
  }

  return response.json();
}

// Aliases for compatibility
export const getHallmarkingGuidance = searchHallmarking;
export const findTestingLaboratories = searchLaboratories;

export async function checkBackendHealth(): Promise<{ status: string; version: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return await response.json();
  } catch (error) {
    return { status: "offline", version: "unknown" };
  }
}
