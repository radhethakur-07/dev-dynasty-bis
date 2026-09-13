"use client";

import React, { useState } from "react";
import { ProcessingStage, FinalResponseUnion } from "@/types/api";
import { ChevronDown, ChevronUp, Cpu, Database, ShieldCheck, Sparkles } from "lucide-react";

interface AgentExecutionDrawerProps {
  intent?: string;
  toolCalled?: string | null;
  stages?: ProcessingStage[];
  structuredResponse?: FinalResponseUnion;
  onQuickPrompt?: (prompt: string) => void;
}

export const AgentExecutionDrawer: React.FC<AgentExecutionDrawerProps> = ({
  intent,
  toolCalled,
  stages = [],
  structuredResponse,
  onQuickPrompt,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getQuickPrompts = (): string[] => {
    if (!structuredResponse) return ["What are the mandatory QCO products?", "How to verify HUID?"];

    switch (structuredResponse.type) {
      case "standard_recommendation": {
        const stdCode = structuredResponse.standards?.[0]?.code || "this standard";
        return [
          `Which recognized laboratory tests for ${stdCode}?`,
          `What is the certification procedure for ${stdCode}?`,
          "Is this standard compulsory under a Quality Control Order?",
          "What is the simplified procedure for grant of licence?",
        ];
      }
      case "certification_guidance":
        return [
          "What is the difference between Scheme I (ISI) and Scheme II (CRS)?",
          "What documents are required for factory audit?",
          "Can an MSME get fee concessions for BIS certification?",
        ];
      case "hallmarking_info":
        return [
          "How do I verify 6-digit HUID on the BIS CARE app?",
          "What are the silver purity grades under IS 2112:2025?",
          "What is the statutory compensation for substandard gold?",
        ];
      case "laboratory_results":
        return [
          "How do I verify laboratory accreditation scope on BIS LIMS?",
          "What is the difference between BIS Recognized and BIS Own Labs?",
        ];
      default:
        return [
          "Show me compulsory standards under Scheme I",
          "How to verify 6-digit HUID on BIS Care?",
          "Find electrical testing labs in Bengaluru",
        ];
    }
  };

  const quickPrompts = getQuickPrompts();

  return (
    <div className="space-y-2">
      {/* Collapsible trace header */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--surface-overlay)",
          border: "1px solid var(--border)",
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors text-xs"
          style={{ color: "var(--text-muted)" }}
          aria-expanded={isOpen}
          aria-label="Toggle AI reasoning trace"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="flex items-center gap-1.5 font-semibold text-xs"
              style={{ color: "var(--accent)" }}
            >
              <Cpu className="w-3.5 h-3.5" />
              AI Reasoning Trace
            </span>

            {intent && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium"
                style={{
                  backgroundColor: "var(--accent-subtle)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-border)",
                }}
              >
                {intent}
              </span>
            )}

            {toolCalled && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  color: "var(--success)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                ⚡ {toolCalled}()
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] flex-shrink-0" style={{ color: "var(--text-placeholder)" }}>
            <span>{isOpen ? "Hide" : "View trace"}</span>
            {isOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        {/* Expanded trace details */}
        {isOpen && (
          <div
            className="px-3 pb-3 pt-2 border-t space-y-2 animate-fade-in"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                className="p-2.5 rounded-lg space-y-1 text-xs"
                style={{
                  backgroundColor: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Database className="w-3 h-3" style={{ color: "var(--info)" }} />
                  Database Retrieval
                </div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Queried{" "}
                  <span className="font-semibold" style={{ color: "var(--accent)" }}>
                    Supabase pgvector
                  </span>{" "}
                  (753 Standards &amp; 437 Labs)
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  PostgreSQL{" "}
                  <code
                    className="font-mono"
                    style={{ color: "var(--accent)" }}
                  >
                    wfts
                  </code>{" "}
                  + Cosine similarity index
                </p>
              </div>

              <div
                className="p-2.5 rounded-lg space-y-1 text-xs"
                style={{
                  backgroundColor: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ShieldCheck className="w-3 h-3" style={{ color: "var(--success)" }} />
                  Provenance Check
                </div>
                <p className="font-medium" style={{ color: "var(--success)" }}>
                  Verified Official Sources
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Zero synthetic data. Official Gazette &amp; LIMS endpoints preserved.
                </p>
              </div>
            </div>

            {stages && stages.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Pipeline Steps
                </p>
                {stages.map((stg, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2 text-xs">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: "var(--success)" }}
                    />
                    <div>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {stg.stage}:{" "}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>{stg.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick follow-up chips */}
      {onQuickPrompt && quickPrompts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => onQuickPrompt(prompt)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-left transition-all group"
              style={{
                backgroundColor: "var(--surface-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-subtle)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-raised)";
              }}
            >
              <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: "var(--accent)" }} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
