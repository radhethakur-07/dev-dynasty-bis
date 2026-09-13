"use client";

import React from "react";
import { LaboratoryResultsResponse } from "@/types/api";
import { CitationPanel } from "./CitationPanel";
import { FlaskConical, MapPin, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";

interface LaboratoryTableProps {
  data: LaboratoryResultsResponse;
}

export const LaboratoryTable: React.FC<LaboratoryTableProps> = ({ data }) => {
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
          <span>Laboratory records from {data.demo_badge || "Demo / Sample"} dataset</span>
        </div>
      )}

      {/* Empty state */}
      {data.laboratories.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-10 gap-3 rounded-xl"
          style={{
            backgroundColor: "var(--surface-overlay)",
            border: "1px solid var(--border)",
          }}
        >
          <FlaskConical className="w-8 h-8 opacity-30" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            No laboratories found for this search
          </p>
          <p className="text-xs text-center max-w-xs" style={{ color: "var(--text-placeholder)" }}>
            Try adjusting your product/test type or location criteria
          </p>
        </div>
      )}

      {/* Lab cards */}
      {data.laboratories.length > 0 && (
        <div className="space-y-3">
          {data.laboratories.map((lab, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl space-y-3 transition-all duration-150"
              style={{
                backgroundColor: "var(--surface-raised)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              }}
            >
              {/* Lab header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: "var(--accent-subtle)",
                      border: "1px solid var(--accent-border)",
                    }}
                  >
                    <FlaskConical className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold leading-snug break-anywhere" style={{ color: "var(--text-primary)" }}>
                      {lab.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{lab.location}</span>
                    </div>
                  </div>
                </div>

                {/* Recognition status */}
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "var(--success)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {lab.recognition_status}
                </span>
              </div>

              {/* Capabilities */}
              <div
                className="p-3 rounded-lg text-xs leading-relaxed"
                style={{
                  backgroundColor: "var(--surface-overlay)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <span className="font-semibold" style={{ color: "var(--text-muted)" }}>
                  Testing capabilities:{" "}
                </span>
                {lab.scope_or_capabilities}
              </div>

              {/* Source link */}
              {lab.source_url && (
                <a
                  href={lab.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: "var(--accent)" }}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Official Laboratory Directory</span>
                </a>
              )}

              {lab.is_demo && (
                <span
                  className="inline-block px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    backgroundColor: "var(--surface-overlay)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {lab.demo_badge || "Demo"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      {data.disclaimer && (
        <p
          className="text-[11px] italic border-l-2 pl-3 py-0.5"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          {data.disclaimer}
        </p>
      )}

      <CitationPanel sources={data.sources} />
    </div>
  );
};
