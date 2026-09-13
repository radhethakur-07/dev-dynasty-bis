"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Language, ChatMessage } from "@/types/api";
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
import {
  Conversation,
  getAllConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation as localDeleteConversation,
  renameConversation as localRenameConversation,
  getActiveConversationId,
  setActiveConversationId,
} from "@/lib/chatStorage";
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
  // Controls the default value for the input (for populate-without-send)
  const [pendingInput, setPendingInput] = useState("");

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 1024);
  }, []);

  // Load conversations from API or fallback to localStorage
  useEffect(() => {
    async function loadData() {
      try {
        const sessions = await getUserSessions();
        if (sessions && sessions.length > 0) {
          const mapped: Conversation[] = sessions.map((s: any) => ({
            id: s.id,
            title: s.title || "New Chat",
            messages: [],
            createdAt: s.created_at || new Date().toISOString(),
            updatedAt: s.created_at || new Date().toISOString(),
          }));
          setConversations(mapped);
          handleSelectConversation(mapped[0].id);
        } else {
          handleNewChat();
        }
      } catch {
        // Fallback to local
        const convs = getAllConversations();
        setConversations(convs);
        const savedActiveId = getActiveConversationId();
        if (savedActiveId && convs.find((c) => c.id === savedActiveId)) {
          setActiveConvId(savedActiveId);
          const conv = getConversation(savedActiveId);
          setMessages(conv?.messages.length ? conv.messages.filter(m => m.id !== "msg-welcome") : []);
        } else if (convs.length > 0) {
          setActiveConvId(convs[0].id);
          setActiveConversationId(convs[0].id);
          setMessages(convs[0].messages.filter(m => m.id !== "msg-welcome"));
        } else {
          const conv = createConversation();
          setActiveConvId(conv.id);
          setMessages([]);
          setConversations([conv]);
        }
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle URL query param — auto-send if present
  useEffect(() => {
    if (queryParam && !initialQueryExecuted.current && activeConvId !== null) {
      initialQueryExecuted.current = true;
      handleSendMessage(queryParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam, activeConvId]);

  // Save messages to localStorage
  useEffect(() => {
    if (activeConvId && messages.length > 0) {
      try {
        updateConversation(activeConvId, messages);
      } catch {
        // localStorage may fail
      }
    }
  }, [messages, activeConvId]);

  const handleSendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    // Clear any pending input
    setPendingInput("");

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
        activeConvId || "session",
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

  const handleNewChat = async () => {
    try {
      const s = await createSession();
      const newConv: Conversation = {
        id: s.id,
        title: "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(s.id);
      setMessages([]);
      setPendingInput("");
    } catch {
      const conv = createConversation();
      setActiveConvId(conv.id);
      setActiveConversationId(conv.id);
      setMessages([]);
      setPendingInput("");
      setConversations(getAllConversations());
    }
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConvId(id);
    setActiveConversationId(id);
    setMessages([]);
    setPendingInput("");
    try {
      const msgs = await getSessionMessages(id);
      if (msgs && msgs.length > 0) {
        const mapped = msgs.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setMessages(mapped);
      } else {
        setMessages([]);
      }
    } catch {
      const conv = getConversation(id);
      setMessages(conv?.messages.filter(m => m.id !== "msg-welcome") ?? []);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteSession(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === activeConvId) {
        setMessages([]);
        handleNewChat();
      }
    } catch {
      localDeleteConversation(id);
      const remaining = getAllConversations();
      setConversations(remaining);
      if (id === activeConvId) {
        if (remaining.length > 0) {
          handleSelectConversation(remaining[0].id);
        } else {
          handleNewChat();
        }
      }
    }
  };

  const handleRenameConversation = async (id: string, title: string) => {
    try {
      await renameSession(id, title);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c))
      );
    } catch {
      localRenameConversation(id, title);
      setConversations(getAllConversations());
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
            {/* Sidebar toggle — always visible */}
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
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
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
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
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
              style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}
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
