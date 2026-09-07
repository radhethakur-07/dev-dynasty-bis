"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Language } from "../types/api.ts";

export interface SpeechRecognitionHookOptions {
  language?: Language | string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  errorMessage: string | null;
  startListening: (overrideOptions?: { language?: Language | string }) => void;
  stopListening: () => void;
  toggleListening: (overrideOptions?: { language?: Language | string }) => void;
  resetTranscript: () => void;
  clearError: () => void;
}

// Map language identifiers to BCP-47 codes for Web Speech API
export function mapLanguageToLocale(lang?: Language | string): string {
  if (!lang) return "en-IN";
  const lower = String(lang).toLowerCase().trim();
  if (lower === "hi" || lower.startsWith("hi-") || lower.startsWith("hin")) {
    return "hi-IN";
  }
  if (lower === "en" || lower.startsWith("en-") || lower.startsWith("eng")) {
    return "en-IN"; // Prioritize Indian English for BIS terminology
  }
  return "en-IN";
}

export function useSpeechRecognition(
  options: SpeechRecognitionHookOptions = {}
): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Check browser support safely on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorMessage(null);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Recognition might already be stopped
      }
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(
    (overrideOptions?: { language?: Language | string }) => {
      clearError();

      if (typeof window === "undefined") return;

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError("unsupported");
        setErrorMessage(
          "Voice input is not supported in this browser. Please use Chrome, Edge, or Safari."
        );
        optionsRef.current.onError?.("unsupported");
        return;
      }

      // Stop any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          // Ignore
        }
      }

      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        const targetLang =
          overrideOptions?.language || optionsRef.current.language || "en";
        recognition.lang = mapLanguageToLocale(targetLang);
        recognition.continuous = optionsRef.current.continuous ?? false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          clearError();
        };

        recognition.onresult = (event: any) => {
          let final = "";
          let interim = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const item = event.results[i];
            const text = item[0]?.transcript || "";
            if (item.isFinal) {
              final += text;
            } else {
              interim += text;
            }
          }

          if (final) {
            setTranscript((prev) => (prev ? `${prev} ${final}` : final));
            setInterimTranscript("");
            optionsRef.current.onResult?.(final.trim(), true);
          } else if (interim) {
            setInterimTranscript(interim);
            optionsRef.current.onResult?.(interim.trim(), false);
          }
        };

        recognition.onerror = (event: any) => {
          const errType = event.error || "unknown";
          setError(errType);

          let message = "Speech recognition error occurred.";
          if (errType === "not-allowed" || errType === "service-not-allowed") {
            message =
              "Microphone permission was denied. Please allow microphone access in your browser settings.";
          } else if (errType === "no-speech") {
            message = "No speech was detected. Please speak closer to the microphone.";
          } else if (errType === "audio-capture") {
            message = "No microphone found or audio capture failed.";
          } else if (errType === "network") {
            message = "Network error occurred during voice recognition.";
          }

          setErrorMessage(message);
          setIsListening(false);
          optionsRef.current.onError?.(errType);
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
        };

        recognition.start();
      } catch (err: any) {
        setError("start-failed");
        setErrorMessage(
          err?.message || "Failed to start speech recognition."
        );
        setIsListening(false);
      }
    },
    [clearError]
  );

  const toggleListening = useCallback(
    (overrideOptions?: { language?: Language | string }) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(overrideOptions);
      }
    },
    [isListening, startListening, stopListening]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          // Ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    clearError,
  };
}
