"use client";

import React from "react";
import { StandardRecommendationResponse } from "@/types/api";
import { CitationPanel } from "./CitationPanel";
import { CheckCircle2, AlertCircle, Bookmark, TrendingUp } from "lucide-react";

interface StandardCardProps {
  data: StandardRecommendationResponse;
}

const confidenceConfig = {
  high: { label: "High Confidence", bg: "rgba(16, 185, 129, 0.1)", color: "var(--success)", border: "rgba(16, 185, 129, 0.25)" },
  medium: { label: "Medium Confidence", bg: "rgba(217, 119, 6, 0.1)", color: "var(--warning)", border: "rgba(217, 119, 6, 0.25)" },
  low: { label: "Low Confidence", bg: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)", border: "var(--border)" },
};

export const StandardCard: React.FC<StandardCardProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {/* Demo notice */}
      {data.is_demo && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-xs font-medium"
          style={{
            backgroundColor: "rgba(217, 119, 6, 0.08)",
            border: "1px solid rgba(217, 119, 6, 0.2)",
            color: "var(--warning)",
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Results from {data.demo_badge || "Demo / Sample"} knowledge base</span>
        </div>
      )}

      {/* Empty / no results */}
      {data.standards.length === 0 && (
        <div
          className="p-5 rounded-xl space-y-3"
          style={{
            backgroundColor: "var(--surface-overlay)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--warning)" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>No verified standards met the relevance threshold</span>
          </div>
          {data.clarification_prompt && (
            <div
              className="p-3 rounded-lg text-xs leading-relaxed"
              style={{
                backgroundColor: "var(--accent-subtle)",
                border: "1px solid var(--accent-border)",
                color: "var(--text-secondary)",
              }}
            >
              <strong style={{ color: "var(--accent)" }}>Guidance: </strong>
              {data.clarification_prompt}
            </div>
          )}
        </div>
      )}

      {/* Standards list */}
      {data.standards.length > 0 && (
        <div className="space-y-3">
          {data.standards.map((std, idx) => {
            const conf = confidenceConfig[std.confidence] || confidenceConfig.low;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl transition-all duration-150 group"
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
                {/* Header row */}
                <div className="flex items-start gap-3 flex-wrap">
                  {/* IS Code badge — monospace, gold */}
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: "var(--gold-subtle)",
                      color: "var(--gold)",
                      border: "1px solid var(--gold-border)",
                    }}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {std.code}
                  </span>

                  {/* Label — mandatory vs voluntary status pill */}
                  {std.label && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                      style={{
                        backgroundColor: std.label.toLowerCase().includes("mandatory") || std.label.toLowerCase().includes("qco")
                          ? "var(--gold-subtle)"
                          : "var(--accent-subtle)",
                        color: std.label.toLowerCase().includes("mandatory") || std.label.toLowerCase().includes("qco")
                          ? "var(--gold)"
                          : "var(--accent)",
                        border: `1px solid ${std.label.toLowerCase().includes("mandatory") || std.label.toLowerCase().includes("qco")
                          ? "var(--gold-border)"
                          : "var(--accent-border)"}`,
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {std.label}
                    </span>
                  )}

                  {/* Confidence */}
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ml-auto"
                    style={{
                      backgroundColor: conf.bg,
                      color: conf.color,
                      border: `1px solid ${conf.border}`,
                    }}
                  >
                    <TrendingUp className="w-3 h-3" />
                    {conf.label}
                  </span>

                  {/* Demo badge */}
                  {std.is_demo && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        backgroundColor: "var(--surface-overlay)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {std.demo_badge || "Demo"}
                    </span>
                  )}
                </div>

                {/* Standard title */}
                <h4
                  className="mt-2.5 text-sm font-semibold leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  {std.title}
                </h4>

                {/* Relevance */}
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                    Applicability:{" "}
                  </span>
                  {std.reason}
                </p>

                {/* Match score */}
                {std.relevance_score !== undefined && std.relevance_score !== null && (
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className="flex-1 h-1 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--surface-overlay)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round(std.relevance_score * 100)}%`,
                          backgroundColor: "var(--accent)",
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                      {Math.round(std.relevance_score * 100)}% match
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      {data.disclaimer && (
        <p
          className="text-[11px] italic border-l-2 pl-3 py-0.5"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          {data.disclaimer}
        </p>
      )}

      <CitationPanel sources={data.sources} />
    </div>
  );
};
