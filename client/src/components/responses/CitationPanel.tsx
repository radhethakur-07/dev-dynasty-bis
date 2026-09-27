"use client";

import React, { useState } from "react";
import { SourceCitation } from "@/types/api";
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, AlertCircle, FileText, Globe } from "lucide-react";

interface CitationPanelProps {
  sources: SourceCitation[];
}

const getSourceMeta = (
  url?: string | null,
  title?: string | null,
  section?: string | null
): { label: string; isGazette: boolean } => {
  const lowerUrl = (url || "").toLowerCase();
  const lowerSection = (section || "").toLowerCase();

  if (
    lowerUrl.includes("egazette.gov.in") ||
    lowerUrl.endsWith(".pdf") ||
    lowerUrl.includes("/qcorder/") ||
    lowerUrl.includes("/mandatoryproducts/") ||
    lowerSection.includes("gazette") ||
    lowerSection.includes("qco")
  ) {
    return { label: "Official Gazette / QCO Notification", isGazette: true };
  }
  if (lowerUrl.includes("manakonline.in")) {
    return { label: "Manakonline Application Portal", isGazette: false };
  }
  if (lowerUrl.includes("crsbis.in")) {
    return { label: "CRS Registration Portal", isGazette: false };
  }
  if (lowerUrl.includes("lims.bis.gov.in")) {
    return { label: "BIS LIMS Lab Directory", isGazette: false };
  }
  if (lowerUrl.includes("standards.bis.gov.in") || lowerUrl.includes("services.bis.gov.in")) {
    return { label: "BIS Standards Registry", isGazette: false };
  }
  if (lowerUrl.includes("hallmarking")) {
    return { label: "BIS Hallmarking Portal", isGazette: false };
  }
  if (lowerUrl.includes("bis-apps") || lowerUrl.includes("consumer-complaints")) {
    return { label: "BIS CARE Consumer Portal", isGazette: false };
  }
  if (lowerUrl.includes("scheme-i") || lowerUrl.includes("product-certification")) {
    return { label: "Scheme I (ISI Mark) Portal", isGazette: false };
  }
  return { label: "Official BIS Source Document", isGazette: false };
};

export const CitationPanel: React.FC<CitationPanelProps> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div
      className="mt-4 rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface-overlay)",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--border-subtle)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "";
        }}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? "Hide" : "Show"} ${sources.length} source citations`}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
          <span style={{ color: "var(--text-secondary)" }}>
            {sources.length} verified source{sources.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1" style={{ color: "var(--text-placeholder)" }}>
          <span>{isOpen ? "Collapse" : "View sources"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div
          className="p-3 border-t space-y-2.5 animate-fade-in"
          style={{ borderColor: "var(--border)" }}
        >
          {sources.map((src, idx) => {
            const meta = getSourceMeta(src.url, src.document_title, src.section);
            return (
              <div
                key={idx}
                className="p-3 rounded-lg space-y-1.5"
                style={{
                  backgroundColor: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--gold)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-[10px] flex-shrink-0 font-mono font-bold"
                      style={{
                        backgroundColor: "var(--gold-subtle)",
                        color: "var(--gold)",
                        border: "1px solid var(--gold-border)",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="break-anywhere">{src.document_title}</span>
                  </div>
                  {src.is_demo && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0"
                      style={{
                        backgroundColor: "rgba(217, 119, 6, 0.1)",
                        color: "var(--warning)",
                        border: "1px solid rgba(217, 119, 6, 0.2)",
                      }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {src.demo_badge || "Demo"}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {src.section && (
                    <span>
                      <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Section: </span>
                      {src.section}
                    </span>
                  )}
                  {src.page_number && (
                    <span>
                      <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Page: </span>
                      {src.page_number}
                    </span>
                  )}
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 transition-colors font-medium"
                      style={{ color: "var(--gold)" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "var(--gold-hover)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "var(--gold)")
                      }
                    >
                      {meta.isGazette ? (
                        <FileText className="w-3.5 h-3.5" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                      <span>{meta.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
