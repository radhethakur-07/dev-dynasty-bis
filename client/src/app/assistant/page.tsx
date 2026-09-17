"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Language, ChatMessage, Conversation } from "@/types/api";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { Shield, Sparkles, PanelLeft } from "lucide-react";
import {
  sendChatMessage,
  getUserSessions,
  createSession,
  deleteSession,
  renameSession,
  getSessionMessages,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

// Storage keys for instant-restore on refresh
const ACTIVE_SESSION_KEY = "bis-active-session-id";
const CACHED_SESSIONS_KEY = "bis-cached-sessions";
const CACHED_MESSAGES_PREFIX = "bis-cached-msgs-";

function getCachedSessions(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHED_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCachedSessions(sessions: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHED_SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    /* ignore */
  }
}

function getCachedMessages(sessionId: string): ChatMessage[] {
  if (typeof window === "undefined" || !sessionId) return [];
  try {
    const raw = localStorage.getItem(`${CACHED_MESSAGES_PREFIX}${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCachedMessages(sessionId: string, msgs: ChatMessage[]) {
  if (typeof window === "undefined" || !sessionId) return;
  try {
    localStorage.setItem(`${CACHED_MESSAGES_PREFIX}${sessionId}`, JSON.stringify(msgs));
  } catch {
    /* ignore */
  }
}

function AssistantChat() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q");
  const initialQueryExecuted = useRef(false);
  const { logout } = useAuth();

  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize immediately from cache so UI is instant on page refresh
  const [conversations, setConversations] = useState<Conversation[]>(() => getCachedSessions());
  const [activeConvId, setActiveConvId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (saved) return saved;
    }
    const cached = getCachedSessions();
    return cached.length > 0 ? cached[0].id : null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedId) return getCachedMessages(savedId);
      const cached = getCachedSessions();
      if (cached.length > 0) return getCachedMessages(cached[0].id);
    }
    return [];
  });

  const [pendingInput, setPendingInput] = useState("");

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 1024);
  }, []);

  // Update active session memory
  const updateActiveSession = (id: string | null) => {
    setActiveConvId(id);
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem(ACTIVE_SESSION_KEY, id);
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    }
  };

  // Helper to load messages for a specific session directly from Database
  const loadMessagesForSession = useCallback(async (sessionId: string) => {
    // 1. Show cached messages immediately for instant response
    const cached = getCachedMessages(sessionId);
    if (cached.length > 0) {
      setMessages(cached);
    }

    // 2. Fetch latest from Database
    try {
      const msgs = await getSessionMessages(sessionId);
      if (msgs && msgs.length > 0) {
        const mapped: ChatMessage[] = msgs.map((m: any) => ({
          id: m.id || `db-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          role: m.role,
          content: m.content || undefined,
          intent: m.intent || undefined,
          toolCalled: m.tool_called || undefined,
          structuredResponse: m.structured_payload || undefined,
          timestamp: m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        setMessages(mapped);
        saveCachedMessages(sessionId, mapped);
      } else if (cached.length === 0) {
        setMessages([]);
      }
    } catch (err) {
      console.error(`[ASSISTANT] Failed to load messages for session ${sessionId}:`, err);
      // Fallback to cached if available
      if (cached.length > 0) {
        setMessages(cached);
      }
    }
  }, []);

  // 1. Initial load from Database (Supabase) + sync with cached state
  useEffect(() => {
    let isMounted = true;

    async function loadSessionsFromDatabase() {
      try {
        const sessions = await getUserSessions();
        if (!isMounted) return;

        if (sessions && sessions.length > 0) {
          const mapped: Conversation[] = sessions.map((s: any) => ({
            id: s.id,
            title: s.title || "New Chat",
            created_at: s.created_at || new Date().toISOString(),
            updated_at: s.created_at || new Date().toISOString(),
          }));
          setConversations(mapped);
          saveCachedSessions(mapped);

          // Find which session to select: saved active session, or first session
          const savedActiveId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_SESSION_KEY) : null;
          const targetSessionId = (savedActiveId && mapped.some((c) => c.id === savedActiveId))
            ? savedActiveId
            : mapped[0].id;

          updateActiveSession(targetSessionId);
          await loadMessagesForSession(targetSessionId);
        } else {
          // If no sessions exist in DB, create one
          const cached = getCachedSessions();
          if (cached.length > 0) {
            // If local cache had sessions, keep them
            return;
          }
          const newSession = await createSession("New Chat");
          if (!isMounted) return;
          const newConv: Conversation = {
            id: newSession.id,
            title: newSession.title || "New Chat",
            created_at: newSession.created_at || new Date().toISOString(),
            updated_at: newSession.created_at || new Date().toISOString(),
          };
          setConversations([newConv]);
          saveCachedSessions([newConv]);
          updateActiveSession(newSession.id);
          setMessages([]);
        }
      } catch (err) {
        console.error("[ASSISTANT] Error initializing sessions from database:", err);
      }
    }

    loadSessionsFromDatabase();
    return () => {
      isMounted = false;
    };
  }, [loadMessagesForSession]);

  // 2. Handle URL query param (e.g. from Hero search)
  useEffect(() => {
    if (queryParam && !initialQueryExecuted.current && activeConvId !== null) {
      initialQueryExecuted.current = true;
      handleSendMessage(queryParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam, activeConvId]);

  // 3. Send Message Handler
  const handleSendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    setPendingInput("");

    // Ensure we have an active session in Database
    let currentSessionId = activeConvId;
    if (!currentSessionId) {
      try {
        const created = await createSession("New Chat");
        currentSessionId = created.id;
        const newConv: Conversation = {
          id: created.id,
          title: trimmed.slice(0, 40) + (trimmed.length > 40 ? "..." : ""),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updatedList = [newConv, ...conversations];
        setConversations(updatedList);
        saveCachedSessions(updatedList);
        updateActiveSession(currentSessionId);
      } catch (err) {
        console.error("[ASSISTANT] Failed to ensure active session:", err);
      }
    } else {
      // Auto-update conversation title in UI if it was "New Chat"
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === currentSessionId && (c.title === "New Chat" || c.title === "New Conversation")) {
            return {
              ...c,
              title: trimmed.slice(0, 40) + (trimmed.length > 40 ? "..." : ""),
            };
          }
          return c;
        });
        saveCachedSessions(updated);
        return updated;
      });
    }

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessagesList = [...messages, userMsg];
    setMessages(newMessagesList);
    if (currentSessionId) {
      saveCachedMessages(currentSessionId, newMessagesList);
    }

    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content || "",
      }));

      const result = await sendChatMessage(
        trimmed,
        currentSessionId || undefined,
        language,
        historyPayload
      );

      let conversationalContent: string | undefined = undefined;
      if (result.response.type === "text") {
        conversationalContent = result.response.content;
      } else if ("summary" in result.response && result.response.summary) {
        conversationalContent = result.response.summary;
      }

      const assistantMsg: ChatMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: conversationalContent,
        structuredResponse: result.response,
        intent: result.intent,
        toolCalled: result.tool_called || undefined,
        processingStages: result.processing_stages,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalMessages = [...newMessagesList, assistantMsg];
      setMessages(finalMessages);
      if (currentSessionId) {
        saveCachedMessages(currentSessionId, finalMessages);
      }
    } catch (err: unknown) {
      const isTimeout =
        err instanceof Error &&
        (err.message.includes("timeout") || err.message.includes("Timeout"));

      const errorMsg: ChatMessage = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: isTimeout
          ? "⚠️ The request timed out. The server may be busy — please try again in a moment."
          : `⚠️ ${err instanceof Error ? err.message : "Something went wrong. Please try again."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalWithErr = [...newMessagesList, errorMsg];
      setMessages(finalWithErr);
      if (currentSessionId) {
        saveCachedMessages(currentSessionId, finalWithErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Create New Chat in Database
  const handleNewChat = async () => {
    // If current conversation is already empty, just stay on it
    if (messages.length === 0 && activeConvId) {
      return;
    }

    setIsLoading(true);
    try {
      const s = await createSession("New Chat");
      const newConv: Conversation = {
        id: s.id,
        title: "New Chat",
        created_at: s.created_at || new Date().toISOString(),
        updated_at: s.created_at || new Date().toISOString(),
      };
      const updatedList = [newConv, ...conversations.filter((c) => c.id !== s.id)];
      setConversations(updatedList);
      saveCachedSessions(updatedList);
      updateActiveSession(s.id);
      setMessages([]);
      setPendingInput("");
    } catch (err) {
      console.error("[ASSISTANT] Failed to create session in database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Select & Switch Conversation directly from Database
  const handleSelectConversation = async (sessionId: string) => {
    if (sessionId === activeConvId) return;
    updateActiveSession(sessionId);
    setPendingInput("");
    setIsLoading(true);
    await loadMessagesForSession(sessionId);
    setIsLoading(false);
  };

  // 6. Delete Conversation from Database
  const handleDeleteConversation = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`${CACHED_MESSAGES_PREFIX}${sessionId}`);
      }
      const remaining = conversations.filter((c) => c.id !== sessionId);
      setConversations(remaining);
      saveCachedSessions(remaining);

      if (sessionId === activeConvId) {
        if (remaining.length > 0) {
          const nextId = remaining[0].id;
          updateActiveSession(nextId);
          await loadMessagesForSession(nextId);
        } else {
          await handleNewChat();
        }
      }
    } catch (err) {
      console.error("[ASSISTANT] Failed to delete session from database:", err);
    }
  };

  // 7. Rename Conversation in Database
  const handleRenameConversation = async (sessionId: string, title: string) => {
    try {
      await renameSession(sessionId, title);
      const updated = conversations.map((c) => (c.id === sessionId ? { ...c, title } : c));
      setConversations(updated);
      saveCachedSessions(updated);
    } catch (err) {
      console.error("[ASSISTANT] Failed to rename session in database:", err);
    }
  };

  // Populate input without sending (for empty state suggestion chips)
  const handlePopulateInput = (text: string) => {
    setPendingInput(text);
  };

  return (
    <div
      className="flex overflow-hidden"
      style={{
        height: "calc(100vh - 4rem)",
        backgroundColor: "var(--surface-base)",
      }}
    >
      {/* Conversation Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
        onRename={handleRenameConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Column */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ backgroundColor: "var(--surface-base)" }}
      >
        {/* Chat header bar */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{
            backgroundColor: "var(--surface-raised)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors flex-shrink-0"
              style={{
                backgroundColor: "var(--surface-overlay)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
              aria-label={sidebarOpen ? "Close conversation history" : "Open conversation history"}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--border)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
              }}
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #1C2D65, #253878)",
                }}
              >
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-none" style={{ color: "var(--text-primary)" }}>
                  BIS Intelligence Assistant
                </h1>
                <p className="text-[10px] leading-none mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                  Grounded knowledge · 753+ Indian Standards
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs hidden sm:flex" style={{ color: "var(--text-muted)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
              <span>Powered by Gemini</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-xs font-medium transition-colors px-2.5 py-1 rounded-lg"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--error)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(220, 38, 38, 0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "";
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Message area */}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          language={language}
          onQuickPrompt={handleSendMessage}
          onPopulateInput={handlePopulateInput}
        />

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onPopulateInput={handlePopulateInput}
          isLoading={isLoading}
          language={language}
          onLanguageChange={(lang) => setLanguage(lang)}
          defaultValue={pendingInput}
        />
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div
          className="h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--surface-base)" }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1C2D65, #253878)" }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex gap-1">
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--accent)", animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--accent)", animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--accent)", animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      }
    >
      <AssistantChat />
    </Suspense>
  );
}
