import React, { useState, KeyboardEvent } from "react";
import { Language } from "@/types/api";
import { Send, Sparkles, Globe, CornerDownLeft } from "lucide-react";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  language,
  onLanguageChange,
}) => {
  const [input, setInput] = useState("");

  const samplePrompts = language === "hi" ? [
    "प्रेशर कुकर के लिए कौन सा BIS मानक लागू है?",
    "सोने के आभूषण पर HUID कैसे जांचें?",
    "खिलौनों (toys) के लिए ISI प्रमाणन प्रक्रिया क्या है?",
    "मुंबई में BIS मान्यता प्राप्त परीक्षण प्रयोगशालाएं?"
  ] : [
    "What Indian Standard applies to domestic pressure cookers?",
    "How do I verify 6-digit gold HUID hallmarking?",
    "Step-by-step ISI certification process for packaged drinking water",
    "Find BIS testing laboratories in Mumbai for mechanical products"
  ];

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      {/* Sample Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] font-medium flex-shrink-0 mr-1">
          <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" />
          {language === "hi" ? "त्वरित प्रश्न:" : "Example queries:"}
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            disabled={isLoading}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] transition-all disabled:opacity-50 shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative flex items-center rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-1.5">
        {/* Language selector toggle */}
        <button
          type="button"
          onClick={() => onLanguageChange(language === "en" ? "hi" : "en")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex-shrink-0"
          title="Toggle Language (English / हिन्दी)"
        >
          <Globe className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span>{language === "en" ? "EN" : "हिन्दी"}</span>
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            language === "hi"
              ? "BIS मानक, प्रमाणन, हॉलमार्किंग या लैब के बारे में पूछें..."
              : "Ask about Indian Standards, certification, hallmarking, or testing labs..."
          }
          disabled={isLoading}
          className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />

        {/* Voice-to-Text Input Button */}
        <VoiceInputButton
          language={language}
          disabled={isLoading}
          onTranscript={(text, isFinal) => {
            if (isFinal) {
              setInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
            }
          }}
          className="mr-1.5"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
          title="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Dev Dynasty • SIH267107 • Controlled Domain Execution</span>
        <span className="hidden sm:inline">Press Enter to send</span>
      </div>
    </div>
  );
};
