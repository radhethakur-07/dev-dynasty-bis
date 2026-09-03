"use client";

import React, { useState } from "react";
import { ChatMessage, Language } from "@/types/api";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { sendChatMessage } from "@/lib/api";
import { Shield, Sparkles, RefreshCw, Trash2 } from "lucide-react";

export default function AssistantPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [sessionId, setSessionId] = useState<string>(() => "session-" + Math.random().toString(36).substring(2, 9));
  const [isLoading, setIsLoading] = useState(false);

  const initialGreeting: ChatMessage = {
    id: "msg-welcome",
    role: "assistant",
    content:
      language === "hi"
        ? "नमस्ते! मैं देव डायनेस्टी (Dev Dynasty) BIS इंटेलिजेंस असिस्टेंट हूँ। मैं आपको भारतीय मानक (Indian Standards), ISI/CRS प्रमाणन प्रक्रिया, हॉलमार्किंग और परीक्षण प्रयोगशालाओं की जानकारी में सहायता कर सकता हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?"
        : "Hello! I am the Dev Dynasty BIS Intelligence Assistant. I can assist you with discovering Indian Standards (IS), understanding ISI and CRS certification pathways, gold/silver hallmarking with HUID verification, and finding recognized testing laboratories. How may I assist you today?",
    timestamp: "Just now",
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

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
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content || "",
      }));

      const result = await sendChatMessage(userText, sessionId, language, historyPayload);

      const assistantMsg: ChatMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: result.response.type === "text" ? result.response.content : undefined,
        structuredResponse: result.response,
        processingStages: result.processing_stages,
        toolCalled: result.tool_called,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        structuredResponse: {
          type: "error",
          message: err.message || "Failed to reach the BIS Assistant server.",
        },
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setSessionId("session-" + Math.random().toString(36).substring(2, 9));
    setMessages([
      {
        ...initialGreeting,
        id: "msg-" + Date.now(),
      },
    ]);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto w-full">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">BIS Intelligence Assistant</h2>
            <p className="text-[11px] text-slate-400">
              Grounded on Indian Standards, Conformity Schemes & Hallmarking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            title="Start new conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <ChatArea messages={messages} isLoading={isLoading} />

      {/* Bottom Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          language={language}
          onLanguageChange={setLanguage}
        />
      </div>
    </div>
  );
}
