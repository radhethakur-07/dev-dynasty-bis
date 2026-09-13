"use client";

import React from "react";
import { FinalResponseUnion } from "@/types/api";
import { StandardCard } from "./StandardCard";
import { CertificationSteps } from "./CertificationSteps";
import { HallmarkingCard } from "./HallmarkingCard";
import { LaboratoryTable } from "./LaboratoryTable";
import { CitationPanel } from "./CitationPanel";
import { AlertCircle, HelpCircle, AlertTriangle, ExternalLink } from "lucide-react";

interface ResponseDispatcherProps {
  response: FinalResponseUnion;
}

export const ResponseDispatcher: React.FC<ResponseDispatcherProps> = ({ response }) => {
  if (!response) return null;

  switch (response.type) {
    case "standard_recommendation":
      return <StandardCard data={response} />;

    case "certification_guidance":
      return <CertificationSteps data={response} />;

    case "hallmarking_info":
      return <HallmarkingCard data={response} />;

    case "laboratory_results":
      return <LaboratoryTable data={response} />;

    case "scheme_information":
      return (
        <div className="space-y-4">
          {/* Scheme header */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: "linear-gradient(135deg, var(--accent-subtle) 0%, var(--surface-raised) 100%)",
              border: "1px solid var(--accent-border)",
            }}
          >
            <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {response.scheme_name}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {response.description}
            </p>
          </div>

          {/* Applicability */}
          <div
            className="p-4 rounded-xl space-y-2"
            style={{
              backgroundColor: "var(--surface-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Applicability
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {response.applicability}
            </p>
          </div>

          {/* Key features */}
          <div
            className="p-4 rounded-xl space-y-2"
            style={{
              backgroundColor: "var(--surface-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Key Features
            </h4>
            <ul className="space-y-1.5">
              {response.key_features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          <CitationPanel sources={response.sources} />
        </div>
      );

    case "insufficient_evidence":
      return (
        <div
          className="p-4 rounded-xl space-y-3"
          style={{
            backgroundColor: "rgba(217, 119, 6, 0.06)",
            border: "1px solid rgba(217, 119, 6, 0.2)",
          }}
        >
          <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: "var(--warning)" }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Insufficient Grounded Evidence</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {response.message}
          </p>
          <div
            className="pt-3 border-t text-xs"
            style={{ borderColor: "rgba(217, 119, 6, 0.2)", color: "var(--text-secondary)" }}
          >
            <strong style={{ color: "var(--warning)" }}>Recommended action: </strong>
            {response.recommended_official_action}
          </div>
          <a
            href="https://www.bis.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "var(--accent)" }}
          >
            <ExternalLink className="w-3 h-3" />
            <span>Visit Official BIS Portal (bis.gov.in)</span>
          </a>
        </div>
      );

    case "clarification_required":
      return (
        <div
          className="p-4 rounded-xl space-y-3"
          style={{
            backgroundColor: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
          }}
        >
          <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: "var(--accent)" }}>
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span>Please clarify your question</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {response.question}
          </p>
          {response.suggested_options && response.suggested_options.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {response.suggested_options.map((opt, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {opt}
                </span>
              ))}
            </div>
          )}
        </div>
      );

    case "text":
      return (
        <div className="space-y-3">
          {response.disclaimer && (
            <p
              className="text-[11px] italic border-l-2 pl-3 py-0.5"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              {response.disclaimer}
            </p>
          )}
          {response.sources && <CitationPanel sources={response.sources} />}
        </div>
      );

    case "error":
      return (
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{
            backgroundColor: "rgba(220, 38, 38, 0.06)",
            border: "1px solid rgba(220, 38, 38, 0.2)",
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--error)" }} />
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {response.message}
          </p>
        </div>
      );

    default:
      return null;
  }
};
