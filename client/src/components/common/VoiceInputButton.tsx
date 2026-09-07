"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, AlertCircle, Loader2 } from "lucide-react";
import { Language } from "@/types/api";
import { useSpeechRecognition, mapLanguageToLocale } from "@/lib/useSpeechRecognition";

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

  const {
    isSupported,
    isListening,
    errorMessage,
    toggleListening,
    clearError,
  } = useSpeechRecognition({
    language,
    onResult: (text, isFinal) => {
      onTranscript(text, isFinal);
    },
    onError: () => {
      setShowToast(true);
    },
  });

  // Automatically dismiss error toast after 4 seconds
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
      {/* Listening Feedback Badge / Pill */}
      {isListening && showFeedbackBadge && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/90 border border-red-500/40 text-[11px] font-semibold text-red-300 shadow-xl backdrop-blur-sm whitespace-nowrap animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
          <span>Listening ({langLabel})...</span>
        </div>
      )}

      {/* Error / Permission Toast */}
      {showToast && errorMessage && (
        <div
          className={`absolute ${
            tooltipPosition === "top" ? "-top-12" : "-bottom-12"
          } left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-[11px] text-amber-300 shadow-2xl backdrop-blur-md max-w-xs whitespace-normal text-center`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Microphone Action Button */}
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
            ? "Listening... Click to stop"
            : `Voice Input (${langLabel}) — Click and speak`
        }
        className={`relative p-2 rounded-xl transition-all duration-200 flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
          isListening
            ? "bg-red-500/20 text-red-400 border border-red-500/50 shadow-md shadow-red-500/20 ring-2 ring-red-500/30"
            : !isSupported
            ? "bg-slate-800/40 text-slate-500 hover:text-slate-400 border border-slate-800"
            : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-blue-400 border border-slate-700/60 hover:border-blue-500/40"
        } ${buttonClassName}`}
      >
        {isListening ? (
          <>
            <Mic className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="absolute inset-0 rounded-xl bg-red-500/10 animate-ping pointer-events-none" />
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
