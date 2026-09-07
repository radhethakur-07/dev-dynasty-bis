"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Language, ChatMessage } from "@/types/api";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { Shield, Sparkles } from "lucide-react";
import { sendChatMessage, getUserSessions, createSession, deleteSession, renameSession, getSessionMessages } from "@/lib/api";
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

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 768);
  }, []);

  const welcomeMessage = useCallback((): ChatMessage => ({
    id: "msg-welcome",
    role: "assistant",
    content:
      language === "hi"
        ? "नमस्ते! मैं BIS इंटेलिजेंस असिस्टेंट हूँ। मैं भारतीय मानकों, प्रमाणन योजनाओं (ISI/CRS), हॉलमार्किंग और परीक्षण प्रयोगशालाओं में आपकी सहायता कर सकता हूँ।"
        : "Hello! I am the BIS Intelligence Assistant. I can help you with Indian Standards, certification schemes (ISI/CRS), hallmarking, and testing laboratories. Ask me anything about BIS!",
    timestamp: "Just now",
  }), [language]);

  // Load conversations from API or fallback
  useEffect(() => {
    async function loadData() {
      try {
        const sessions = await getUserSessions();
        if (sessions && sessions.length > 0) {
          const mapped: Conversation[] = sessions.map((s: any) => ({
            id: s.id,
            title: s.title || "New Chat",
            messages: [], // will load on select
            createdAt: s.created_at || new Date().toISOString(),
            updatedAt: s.created_at || new Date().toISOString(),
          }));
          setConversations(mapped);
          handleSelectConversation(mapped[0].id);
        } else {
          handleNewChat();
        }
      } catch (err) {
        // Fallback to local
        const convs = getAllConversations();
        setConversations(convs);
        const savedActiveId = getActiveConversationId();
        if (savedActiveId && convs.find((c) => c.id === savedActiveId)) {
          setActiveConvId(savedActiveId);
          const conv = getConversation(savedActiveId);
          if (conv && conv.messages.length > 0) {
            setMessages(conv.messages);
          } else {
            setMessages([welcomeMessage()]);
          }
        } else if (convs.length > 0) {
          setActiveConvId(convs[0].id);
          setActiveConversationId(convs[0].id);
          setMessages(convs[0].messages.length > 0 ? convs[0].messages : [welcomeMessage()]);
        } else {
          // Create first conversation
          const conv = createConversation(welcomeMessage());
          setActiveConvId(conv.id);
          setMessages([welcomeMessage()]);
          setConversations([conv]);
        }
      }
    }
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle URL query param
  useEffect(() => {
    if (queryParam && !initialQueryExecuted.current && activeConvId) {
      initialQueryExecuted.current = true;
      handleSendMessage(queryParam);
    }
  }, [queryParam, activeConvId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save messages to localStorage fallback
  useEffect(() => {
    if (activeConvId && messages.length > 0) {
      try {
        updateConversation(activeConvId, messages);
      } catch (e) {
        // local storage may fail
      }
    }
  }, [messages, activeConvId]);

  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content || "",
      }));

      const result = await sendChatMessage(userText, activeConvId || "session", language, historyPayload);

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
      const errorContent = err instanceof Error
        ? `I'm sorry, I encountered an error processing your request. ${err.message.includes("timeout") || err.message.includes("Timeout") ? "The request timed out. Please try again." : "Please try again in a moment."}`
        : "I'm sorry, something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: "error-" + Date.now(),
          role: "assistant",
          content: errorContent,
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
        messages: [welcomeMessage()],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(s.id);
      setMessages([welcomeMessage()]);
    } catch (err) {
      const conv = createConversation(welcomeMessage());
      setActiveConvId(conv.id);
      setActiveConversationId(conv.id);
      setMessages([welcomeMessage()]);
      setConversations(getAllConversations());
    }
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConvId(id);
    setActiveConversationId(id);
    setMessages([]);
    try {
      const msgs = await getSessionMessages(id);
      if (msgs && msgs.length > 0) {
        const mapped = msgs.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        setMessages(mapped);
      } else {
        setMessages([welcomeMessage()]);
      }
    } catch (err) {
      const conv = getConversation(id);
      setMessages(conv?.messages.length ? conv.messages : [welcomeMessage()]);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteSession(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (id === activeConvId) {
        setMessages([]);
        handleNewChat();
      }
    } catch (err) {
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
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    } catch (err) {
      localRenameConversation(id, title);
      setConversations(getAllConversations());
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-transparent">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800/60 bg-white/90 dark:bg-slate-950/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">BIS Intelligence Assistant</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              SIH267107
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="text-xs text-slate-500 hidden sm:inline font-medium">Powered by Gemini</span>
            </div>
            <button onClick={logout} className="text-xs text-slate-500 hover:text-red-500 font-medium transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Messages */}
        <ChatArea messages={messages} isLoading={isLoading} onQuickPrompt={handleSendMessage} />

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          language={language}
          onLanguageChange={() => setLanguage((prev) => (prev === "en" ? "hi" : "en"))}
        />
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>}>
      <AssistantChat />
    </Suspense>
  );
}
