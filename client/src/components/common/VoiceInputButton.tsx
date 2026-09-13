"use client";

import React, { useState, useEffect } from "react";
import { Mic, AlertCircle } from "lucide-react";
import { Language } from "@/types/api";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";

export interface VoiceInputButtonProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  language?: Language | string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  showFeedbackBadge?: boolean;
  tooltipPosition?: "top" | "bottom";
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  language = "en",
  disabled = false,
  className = "",
  buttonClassName = "",
  showFeedbackBadge = true,
  tooltipPosition = "top",
}) => {
  const [showToast, setShowToast] = useState<boolean>(false);

  const { isSupported, isListening, errorMessage, toggleListening, clearError } =
    useSpeechRecognition({
      language,
      onResult: (text, isFinal) => {
        onTranscript(text, isFinal);
      },
      onError: () => {
        setShowToast(true);
      },
    });

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        clearError();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast, clearError]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported) {
      setShowToast(true);
      return;
    }

    toggleListening({ language });
  };

  const isHindi = String(language).toLowerCase().startsWith("hi");
  const langLabel = isHindi ? "हिन्दी" : "English";

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Listening Indicator Badge */}
      {isListening && showFeedbackBadge && (
        <div
          className={`absolute ${
            tooltipPosition === "top" ? "-top-9" : "-bottom-9"
          } left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-lg backdrop-blur-sm whitespace-nowrap`}
          style={{
            backgroundColor: "rgba(220, 38, 38, 0.15)",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            color: "#f87171",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
          <span>Listening ({langLabel})...</span>
        </div>
      )}

      {/* Error Toast */}
      {showToast && errorMessage && (
        <div
          className={`absolute ${
            tooltipPosition === "top" ? "-top-12" : "-bottom-12"
          } left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] shadow-2xl backdrop-blur-md max-w-xs whitespace-normal text-center`}
          style={{
            backgroundColor: "var(--surface-overlay)",
            border: "1px solid rgba(217, 119, 6, 0.3)",
            color: "#f59e0b",
          }}
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={
          isListening
            ? "Stop voice recording"
            : `Start voice input in ${langLabel}`
        }
        title={
          !isSupported
            ? "Voice input not supported in this browser"
            : isListening
            ? "Listening — click to stop"
            : `Voice input (${langLabel}) — click and speak`
        }
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 ${buttonClassName}`}
        style={
          isListening
            ? {
                backgroundColor: "rgba(220, 38, 38, 0.15)",
                border: "1px solid rgba(220, 38, 38, 0.4)",
                color: "#f87171",
                boxShadow: "0 0 12px -3px rgba(220, 38, 38, 0.3)",
              }
            : !isSupported
            ? {
                backgroundColor: "var(--surface-overlay)",
                border: "1px solid var(--border)",
                color: "var(--text-placeholder)",
              }
            : {
                backgroundColor: "var(--surface-overlay)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }
        }
        onMouseEnter={(e) => {
          if (!isListening && isSupported && !disabled) {
            (e.currentTarget as HTMLElement).style.color = "var(--accent)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-subtle)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isListening && isSupported && !disabled) {
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
          }
        }}
      >
        {isListening ? (
          <>
            <Mic className="w-4 h-4 animate-pulse" />
            <span
              className="absolute inset-0 rounded-xl animate-ping pointer-events-none"
              style={{ backgroundColor: "rgba(220, 38, 38, 0.15)" }}
            />
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
