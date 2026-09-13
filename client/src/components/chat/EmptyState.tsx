"use client";

import React from "react";
import {
  Shield,
  BookOpen,
  Award,
  CheckCircle,
  FlaskConical,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void;
  language: "en" | "hi";
}

const suggestions = {
  en: [
    {
      icon: BookOpen,
      title: "Find a Standard",
      prompt: "What Indian Standard applies to packaged drinking water?",
      category: "Standards",
    },
    {
      icon: Award,
      title: "Certification Path",
      prompt: "Step-by-step ISI certification process for a pressure cooker",
      category: "Scheme I",
    },
    {
      icon: CheckCircle,
      title: "HUID Verification",
      prompt: "How do I verify the 6-digit gold HUID hallmark?",
      category: "Hallmarking",
    },
    {
      icon: FlaskConical,
      title: "Find a Lab",
      prompt: "Find BIS recognized testing laboratories in Mumbai for electrical products",
      category: "Laboratories",
    },
    {
      icon: Layers,
      title: "Scheme Comparison",
      prompt: "What is the difference between Scheme I (ISI) and Scheme II (CRS)?",
      category: "Schemes",
    },
    {
      icon: Shield,
      title: "Consumer Rights",
      prompt: "What are my statutory rights if I receive substandard ISI-marked products?",
      category: "Consumer",
    },
  ],
  hi: [
    {
      icon: BookOpen,
      title: "मानक खोजें",
      prompt: "प्रेशर कुकर के लिए कौन सा BIS मानक लागू है?",
      category: "मानक",
    },
    {
      icon: Award,
      title: "प्रमाणन मार्ग",
      prompt: "पैकेज्ड पेयजल के लिए ISI प्रमाणन प्रक्रिया क्या है?",
      category: "स्कीम I",
    },
    {
      icon: CheckCircle,
      title: "HUID सत्यापन",
      prompt: "सोने के आभूषण पर 6-अंकीय HUID कैसे जांचें?",
      category: "हॉलमार्किंग",
    },
    {
      icon: FlaskConical,
      title: "लैब खोजें",
      prompt: "दिल्ली में खाद्य उत्पादों के लिए BIS मान्यता प्राप्त प्रयोगशालाएं?",
      category: "प्रयोगशाला",
    },
    {
      icon: Layers,
      title: "योजना तुलना",
      prompt: "स्कीम I और स्कीम II में क्या अंतर है?",
      category: "योजनाएँ",
    },
    {
      icon: Shield,
      title: "उपभोक्ता अधिकार",
      prompt: "BIS अधिनियम 2016 के तहत उपभोक्ता के क्या अधिकार हैं?",
      category: "उपभोक्ता",
    },
  ],
};

export const EmptyState: React.FC<EmptyStateProps> = ({ onPromptClick, language }) => {
  const items = suggestions[language] || suggestions.en;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 animate-fade-in">
      {/* Logo mark */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
            boxShadow: "0 8px 32px -8px rgba(37, 99, 235, 0.35)",
          }}
        >
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div className="text-center space-y-1">
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {language === "hi"
              ? "BIS इंटेलिजेंस असिस्टेंट"
              : "BIS Intelligence Assistant"}
          </h2>
          <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>
            {language === "hi"
              ? "भारतीय मानकों, प्रमाणन और हॉलमार्किंग के बारे में पूछें"
              : "Ask about Indian Standards, certification, hallmarking, and testing labs"}
          </p>
        </div>
      </div>

      {/* Capabilities label */}
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: "var(--text-placeholder)" }}
      >
        {language === "hi" ? "सुझाए गए प्रश्न" : "Suggested questions"}
      </p>

      {/* Suggestion grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onPromptClick(item.prompt)}
              className="group flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: "var(--surface-raised)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-raised)";
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                style={{
                  backgroundColor: "var(--accent-subtle)",
                  color: "var(--accent)",
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </span>
                  <ArrowUpRight
                    className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                    style={{ color: "var(--accent)" }}
                  />
                </div>
                <span
                  className="text-[11px] leading-relaxed line-clamp-2 mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.prompt}
                </span>
                <span
                  className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                  style={{
                    backgroundColor: "var(--accent-subtle)",
                    color: "var(--accent)",
                  }}
                >
                  {item.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tip */}
      <p
        className="mt-8 text-[11px] text-center max-w-sm"
        style={{ color: "var(--text-placeholder)" }}
      >
        {language === "hi"
          ? "💡 सुझाव पर क्लिक करें या नीचे अपना प्रश्न टाइप करें"
          : "💡 Click any suggestion or type your own question below"}
      </p>
    </div>
  );
};
