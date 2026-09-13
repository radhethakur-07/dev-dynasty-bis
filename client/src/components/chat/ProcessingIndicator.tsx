"use client";

import React from "react";
import { ProcessingStage } from "@/types/api";
import { Shield } from "lucide-react";

interface ProcessingIndicatorProps {
  stages: ProcessingStage[];
  isLoading?: boolean;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  stages,
  isLoading = false,
}) => {
  if (!stages || stages.length === 0) {
    if (isLoading) {
      return (
        <div className="flex items-center gap-3">
          {/* Animated dots */}
          <div className="flex items-center gap-1" aria-label="Processing" role="status">
            <span
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: "var(--accent)", animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: "var(--accent)", animationDelay: "150ms", opacity: 0.7 }}
            />
            <span
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: "var(--accent)", animationDelay: "300ms", opacity: 0.4 }}
            />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Searching BIS knowledge base
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Checking 753+ standards &amp; official sources...
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className="p-3.5 rounded-xl space-y-2 mb-3"
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
          <div className="flex gap-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: "var(--accent)", animationDelay: "0ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: "var(--accent)", animationDelay: "150ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: "var(--accent)", animationDelay: "300ms" }}
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        {stages.map((stg, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "var(--success)" }}
            />
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {stg.stage}:
            </span>
            <span className="truncate" style={{ color: "var(--text-muted)" }}>
              {stg.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
