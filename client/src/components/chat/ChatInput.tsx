"use client";

import React, { useState, useRef, useCallback, KeyboardEvent, useEffect } from "react";
import { Language } from "@/types/api";
import { Send, Globe } from "lucide-react";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onPopulateInput?: (message: string) => void;
  isLoading: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  defaultValue?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onPopulateInput,
  isLoading,
  language,
  onLanguageChange,
  defaultValue = "",
}) => {
  const [input, setInput] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync input when parent pushes a new pending value
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== input) {
      setInput(defaultValue);
      textareaRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxHeight = 200;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
    ta.style.overflowY = ta.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isLoading, onSendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    if (isFinal) {
      setInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
      textareaRef.current?.focus();
    }
  };

  const isEmpty = !input.trim();

  return (
    <div
      className="border-t px-4 py-3"
      style={{
        backgroundColor: "var(--surface-raised)",
        borderColor: "var(--border)",
      }}
    >
      {/* Input Composer — pill-shaped elevated */}
      <div
        className="flex items-end gap-2 p-2 transition-all duration-200"
        style={{
          backgroundColor: "var(--surface-raised)",
          border: "1.5px solid var(--border)",
          borderRadius: "1.5rem",
          boxShadow: "0 2px 12px -2px rgba(37,56,120,0.08)",
        }}
        onFocus={() => {
          const el = document.querySelector(".chat-input-container") as HTMLElement;
          if (el) {
            el.style.borderColor = "var(--accent)";
            el.style.boxShadow = "0 4px 20px -4px rgba(37,56,120,0.15), 0 0 0 2px var(--accent-subtle)";
          }
        }}
      >
        {/* Language Toggle */}
        <button
          type="button"
          onClick={() => onLanguageChange(language === "en" ? "hi" : "en")}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all duration-150 self-end mb-0.5"
          style={{
            backgroundColor: "var(--surface-overlay)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
          title="Toggle language: English / हिन्दी"
          aria-label="Toggle input language"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--accent)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-subtle)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
          }}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="font-mono">{language === "en" ? "EN" : "हि"}</span>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            language === "hi"
              ? "BIS मानक, प्रमाणन, हॉलमार्किंग के बारे में पूछें..."
              : "Ask about Indian Standards, certification, hallmarking, testing labs..."
          }
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-transparent px-2 py-2 text-sm resize-none focus:outline-none disabled:opacity-50 leading-relaxed"
          style={{
            color: "var(--text-primary)",
            minHeight: "40px",
            maxHeight: "200px",
            overflowY: "hidden",
          }}
          aria-label="Chat message input"
          aria-multiline="true"
        />

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 self-end mb-0.5 flex-shrink-0">
          <VoiceInputButton
            language={language}
            disabled={isLoading}
            onTranscript={handleVoiceTranscript}
            showFeedbackBadge={true}
            tooltipPosition="top"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={isEmpty || isLoading}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 flex-shrink-0 disabled:cursor-not-allowed"
            style={
              isEmpty || isLoading
                ? {
                    backgroundColor: "var(--surface-overlay)",
                    border: "1px solid var(--border)",
                    color: "var(--text-placeholder)",
                    opacity: 0.6,
                  }
                : {
                    backgroundColor: "var(--accent)",
                    border: "1px solid var(--accent)",
                    color: "#ffffff",
                    boxShadow: "0 2px 8px -2px var(--accent)",
                  }
            }
            onMouseEnter={(e) => {
              if (!isEmpty && !isLoading) {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isEmpty && !isLoading) {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
              }
            }}
            aria-label="Send message"
            title="Send (Enter)"
          >
            {isLoading ? (
              <div className="flex gap-0.5 items-center">
                <span className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: "currentColor", animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: "currentColor", animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: "currentColor", animationDelay: "300ms" }} />
              </div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Footer hint */}
      <div
        className="flex items-center justify-between mt-2 px-1 text-[11px]"
        style={{ color: "var(--text-placeholder)" }}
      >
        <span>BIS Intelligence · SIH267107 · Grounded Knowledge</span>
        <span className="hidden sm:inline">
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{
              backgroundColor: "var(--surface-overlay)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            Enter
          </kbd>{" "}
          to send ·{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{
              backgroundColor: "var(--surface-overlay)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            Shift+Enter
          </kbd>{" "}
          for newline
        </span>
      </div>
    </div>
  );
};
