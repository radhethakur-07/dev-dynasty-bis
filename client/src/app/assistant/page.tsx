"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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

function AssistantChat() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q");
  const initialQueryExecuted = useRef(false);
  const { logout } = useAuth();

  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingInput, setPendingInput] = useState("");

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 1024);
  }, []);

  // 1. Initial load from Database (Supabase)
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
          const firstSessionId = mapped[0].id;
          setActiveConvId(firstSessionId);
          await loadMessagesForSession(firstSessionId);
        } else {
          // No sessions exist yet — create the first session in Supabase
          const newSession = await createSession("New Chat");
          if (!isMounted) return;
          const newConv: Conversation = {
            id: newSession.id,
            title: newSession.title || "New Chat",
            created_at: newSession.created_at || new Date().toISOString(),
            updated_at: newSession.created_at || new Date().toISOString(),
          };
          setConversations([newConv]);
          setActiveConvId(newSession.id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to load messages for a specific session directly from Database
  const loadMessagesForSession = async (sessionId: string) => {
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
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error(`[ASSISTANT] Failed to load messages for session ${sessionId}:`, err);
      setMessages([]);
    }
  };

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
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(currentSessionId);
      } catch (err) {
        console.error("[ASSISTANT] Failed to ensure active session:", err);
      }
    } else {
      // Auto-update conversation title in UI if it was "New Chat"
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentSessionId && (c.title === "New Chat" || c.title === "New Conversation")) {
            return {
              ...c,
              title: trimmed.slice(0, 40) + (trimmed.length > 40 ? "..." : ""),
            };
          }
          return c;
        })
      );
    }

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
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

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const isTimeout =
        err instanceof Error &&
        (err.message.includes("timeout") || err.message.includes("Timeout"));

      setMessages((prev) => [
        ...prev,
        {
          id: "error-" + Date.now(),
          role: "assistant",
          content: isTimeout
            ? "⚠️ The request timed out. The server may be busy — please try again in a moment."
            : `⚠️ ${err instanceof Error ? err.message : "Something went wrong. Please try again."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Create New Chat in Database
  const handleNewChat = async () => {
    setIsLoading(true);
    try {
      const s = await createSession("New Chat");
      const newConv: Conversation = {
        id: s.id,
        title: "New Chat",
        created_at: s.created_at || new Date().toISOString(),
        updated_at: s.created_at || new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== s.id)]);
      setActiveConvId(s.id);
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
    if (sessionId === activeConvId && messages.length > 0) return;
    setActiveConvId(sessionId);
    setPendingInput("");
    setIsLoading(true);
    await loadMessagesForSession(sessionId);
    setIsLoading(false);
  };

  // 6. Delete Conversation from Database
  const handleDeleteConversation = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      const remaining = conversations.filter((c) => c.id !== sessionId);
      setConversations(remaining);
      if (sessionId === activeConvId) {
        if (remaining.length > 0) {
          const nextId = remaining[0].id;
          setActiveConvId(nextId);
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
      setConversations((prev) =>
        prev.map((c) => (c.id === sessionId ? { ...c, title } : c))
      );
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
