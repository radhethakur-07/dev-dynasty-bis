"use client";

import React, { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/types/api";
import { AgentExecutionDrawer } from "./AgentExecutionDrawer";
import { ResponseDispatcher } from "@/components/responses/ResponseDispatcher";
import { ProcessingIndicator } from "./ProcessingIndicator";
import { EmptyState } from "./EmptyState";
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  language: "en" | "hi";
  onQuickPrompt?: (prompt: string) => void;
  onPopulateInput?: (prompt: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  language,
  onQuickPrompt,
  onPopulateInput,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<{ id: string; type: "up" | "down" } | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, type: "up" | "down") => {
    setFeedbackId({ id, type });
    setTimeout(() => setFeedbackId(null), 3000);
  };

  // Show empty state when no real messages exist
  const realMessages = messages.filter(
    (m) => m.id !== "msg-welcome" && !(m.role === "assistant" && m.id === "msg-welcome")
  );
  const showEmptyState = messages.length === 0 || (messages.length === 1 && messages[0].id === "msg-welcome");

  if (showEmptyState && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--surface-base)" }}>
        <EmptyState
          language={language}
          onPromptClick={(prompt) => {
            // Populate input instead of auto-sending
            if (onPopulateInput) {
              onPopulateInput(prompt);
            } else if (onQuickPrompt) {
              onQuickPrompt(prompt);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: "var(--surface-base)" }}
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {messages.map((msg) => {
          // Skip the welcome placeholder message
          if (msg.id === "msg-welcome") return null;
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 animate-slide-up ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={
                  isUser
                    ? {
                        backgroundColor: "var(--accent)",
                        color: "#ffffff",
                      }
                    : {
                        backgroundColor: "var(--surface-overlay)",
                        border: "1px solid var(--border)",
                        color: "var(--accent)",
                      }
                }
                aria-hidden="true"
              >
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={`flex-1 min-w-0 rounded-2xl overflow-hidden ${
                  isUser ? "max-w-xl" : ""
                }`}
                style={
                  isUser
                    ? {
                        backgroundColor: "var(--chat-user-bg)",
                        color: "var(--chat-user-text)",
                        padding: "12px 16px",
                      }
                    : {
                        backgroundColor: "var(--chat-ai-bg)",
                        border: "1px solid var(--chat-ai-border)",
                        color: "var(--chat-ai-text)",
                      }
                }
              >
                {isUser ? (
                  /* User message — plain text */
                  <p className="text-sm leading-relaxed break-anywhere whitespace-pre-wrap">
                    {msg.content}
                  </p>
                ) : (
                  /* AI message — rich content */
                  <div className="p-4">
                    {/* Agent reasoning drawer */}
                    {(msg.toolCalled || msg.processingStages?.length || msg.intent) && (
                      <div className="mb-4">
                        <AgentExecutionDrawer
                          intent={msg.intent}
                          toolCalled={msg.toolCalled}
                          stages={msg.processingStages}
                          structuredResponse={msg.structuredResponse}
                          onQuickPrompt={onQuickPrompt}
                        />
                      </div>
                    )}

                    {/* Conversational text with markdown */}
                    {msg.content && (
                      <div className="prose text-sm mb-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Structured response component */}
                    {msg.structuredResponse && (
                      <div className={msg.content ? "mt-4 pt-4 border-t" : ""} style={{ borderColor: "var(--border)" }}>
                        <ResponseDispatcher response={msg.structuredResponse} />
                      </div>
                    )}

                    {/* Footer: timestamp + actions */}
                    <div
                      className="mt-4 pt-3 flex items-center justify-between border-t"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <span className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>
                        {msg.timestamp}
                      </span>
                      <div className="flex items-center gap-1">
                        {/* Copy */}
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              msg.id,
                              msg.content || JSON.stringify(msg.structuredResponse, null, 2)
                            )
                          }
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--text-placeholder)" }}
                          title="Copy response"
                          aria-label="Copy response text"
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
                            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "";
                            (e.currentTarget as HTMLElement).style.color = "var(--text-placeholder)";
                          }}
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Thumbs up */}
                        <button
                          type="button"
                          onClick={() => handleFeedback(msg.id, "up")}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{
                            color:
                              feedbackId?.id === msg.id && feedbackId.type === "up"
                                ? "var(--success)"
                                : "var(--text-placeholder)",
                          }}
                          title="Helpful response"
                          aria-label="Mark as helpful"
                          onMouseEnter={(e) => {
                            if (!(feedbackId?.id === msg.id && feedbackId.type === "up")) {
                              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
                              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!(feedbackId?.id === msg.id && feedbackId.type === "up")) {
                              (e.currentTarget as HTMLElement).style.backgroundColor = "";
                              (e.currentTarget as HTMLElement).style.color = "var(--text-placeholder)";
                            }
                          }}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Thumbs down */}
                        <button
                          type="button"
                          onClick={() => handleFeedback(msg.id, "down")}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{
                            color:
                              feedbackId?.id === msg.id && feedbackId.type === "down"
                                ? "var(--error)"
                                : "var(--text-placeholder)",
                          }}
                          title="Not helpful"
                          aria-label="Mark as not helpful"
                          onMouseEnter={(e) => {
                            if (!(feedbackId?.id === msg.id && feedbackId.type === "down")) {
                              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
                              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!(feedbackId?.id === msg.id && feedbackId.type === "down")) {
                              (e.currentTarget as HTMLElement).style.backgroundColor = "";
                              (e.currentTarget as HTMLElement).style.color = "var(--text-placeholder)";
                            }
                          }}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI thinking / loading state */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                backgroundColor: "var(--surface-overlay)",
                border: "1px solid var(--border)",
                color: "var(--accent)",
              }}
              aria-hidden="true"
            >
              <Bot className="w-4 h-4" />
            </div>
            <div
              className="flex-1 rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--chat-ai-bg)",
                border: "1px solid var(--chat-ai-border)",
              }}
            >
              <div className="p-4">
                <ProcessingIndicator stages={[]} isLoading={true} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
