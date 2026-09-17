"use client";

import React from "react";
import { ProcessingStage } from "@/types/api";
import { Shield, CheckCircle, Loader2 } from "lucide-react";

interface ProcessingIndicatorProps {
  stages: ProcessingStage[];
  isLoading?: boolean;
}

// Labeled pipeline sequence labels
const PIPELINE_LABELS = [
  "Classifying intent…",
  "Retrieving standards…",
  "Synthesizing answer…",
];

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  stages,
  isLoading = false,
}) => {
  if (!stages || stages.length === 0) {
    if (isLoading) {
      return (
        <div className="flex items-start gap-3" role="status" aria-label="Processing your query">
          {/* Animated processing sequence */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: "var(--accent-subtle)",
              border: "1px solid var(--accent-border)",
            }}
          >
            <Loader2
              className="w-4 h-4 animate-spin"
              style={{ color: "var(--accent)" }}
            />
          </div>
          <div className="pt-1 space-y-2">
            {PIPELINE_LABELS.map((label, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                  style={{
                    backgroundColor: idx === 0 ? "var(--gold)" : "var(--border-strong)",
                    animationDelay: `${idx * 400}ms`,
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: idx === 0 ? "var(--text-primary)" : "var(--text-placeholder)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className="p-3.5 rounded-xl space-y-3 mb-3"
      style={{
        backgroundColor: "var(--surface-overlay)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
          Execution Pipeline
        </span>
        {isLoading && (
          <Loader2
            className="w-3.5 h-3.5 animate-spin"
            style={{ color: "var(--gold)" }}
          />
        )}
      </div>

      {/* Connected vertical timeline */}
      <div className="relative space-y-0">
        {stages.map((stg, idx) => (
          <div key={idx} className="flex items-start gap-3 relative">
            {/* Vertical connector line */}
            {idx < stages.length - 1 && (
              <div
                className="absolute left-[7px] top-5 bottom-0 w-px"
                style={{ backgroundColor: "var(--border)" }}
              />
            )}
            {/* Status dot */}
            <span
              className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
              style={{
                backgroundColor:
                  idx === stages.length - 1 && isLoading
                    ? "var(--gold)"
                    : "var(--success)",
                boxShadow:
                  idx === stages.length - 1 && isLoading
                    ? "0 0 0 3px var(--gold-subtle)"
                    : undefined,
              }}
            >
              {!(idx === stages.length - 1 && isLoading) && (
                <CheckCircle
                  className="w-2.5 h-2.5"
                  style={{ color: "white" }}
                />
              )}
            </span>
            <div className="pb-2.5">
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {stg.stage}:{" "}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {stg.detail}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
