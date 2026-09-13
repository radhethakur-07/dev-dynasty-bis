"use client";

import React, { useState } from "react";
import { CertificationGuidanceResponse } from "@/types/api";
import {
  Award,
  CheckCircle,
  FileText,
  AlertCircle,
  ShieldCheck,
  Microscope,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Info,
  Database,
} from "lucide-react";
import { CitationPanel } from "./CitationPanel";

interface CertificationStepsProps {
  data: CertificationGuidanceResponse;
}

export const CertificationSteps: React.FC<CertificationStepsProps> = ({ data }) => {
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div
        className="p-5 rounded-2xl space-y-3"
        style={{
          background: "linear-gradient(135deg, var(--accent-subtle) 0%, var(--surface-raised) 100%)",
          border: "1px solid var(--accent-border)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: "var(--accent-subtle)",
              color: "var(--accent)",
              border: "1px solid var(--accent-border)",
            }}
          >
            <Award className="w-3.5 h-3.5" />
            {data.scheme_name}
          </span>

          {data.product && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: "var(--surface-overlay)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>Target:</span>
              <strong style={{ color: "var(--text-primary)" }}>{data.product}</strong>
            </span>
          )}
        </div>

        <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
          Official Certification Pathway
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {data.summary}
        </p>

        {data.retrieval_summary && (
          <div className="flex items-center gap-2 pt-1 text-xs" style={{ color: "var(--accent)" }}>
            <Database className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{data.retrieval_summary}</span>
          </div>
        )}
      </div>

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
          <span>Guidance from {data.demo_badge || "Demo / Sample"} documentation</span>
        </div>
      )}

      {/* Applicability */}
      {data.applicability && (
        <div
          className="p-4 rounded-xl space-y-2"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            <Layers className="w-4 h-4" style={{ color: "var(--accent)" }} />
            Scheme Purpose &amp; Applicability
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {data.applicability}
          </p>
        </div>
      )}

      {/* Applicable Products */}
      {data.applicable_products_or_standards && data.applicable_products_or_standards.length > 0 && (
        <div
          className="p-4 rounded-xl space-y-2.5"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            <ShieldCheck className="w-4 h-4" style={{ color: "var(--success)" }} />
            Applicable Products / Standards
          </div>
          <div className="flex flex-wrap gap-2">
            {data.applicable_products_or_standards.map((prod, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: "var(--surface-overlay)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {prod}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Testing & Assessment */}
      {data.testing_and_assessment && (
        <div
          className="p-4 rounded-xl space-y-2"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            <Microscope className="w-4 h-4" style={{ color: "#8b5cf6" }} />
            Testing &amp; Conformity Assessment
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {data.testing_and_assessment}
          </p>
        </div>
      )}

      {/* Steps timeline */}
      {data.steps && data.steps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider px-1" style={{ color: "var(--text-muted)" }}>
            Certification Process
          </h4>

          <div className="relative pl-7 space-y-3">
            {/* Timeline line */}
            <div
              className="absolute left-3.5 top-2 bottom-2 w-px"
              style={{ backgroundColor: "var(--border)" }}
            />

            {data.steps.map((step) => (
              <div key={step.step_number} className="relative">
                {/* Step dot */}
                <div
                  className="absolute -left-7 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10"
                  style={{
                    backgroundColor: "var(--surface-raised)",
                    border: "2px solid var(--accent)",
                    color: "var(--accent)",
                  }}
                >
                  {step.step_number}
                </div>

                <div
                  className="p-4 rounded-xl space-y-1.5 transition-all duration-150"
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
                  <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {step.title}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {step.description}
                  </p>
                  {step.important_notes && (
                    <div
                      className="mt-2 text-[11px] px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: "rgba(217, 119, 6, 0.08)",
                        border: "1px solid rgba(217, 119, 6, 0.2)",
                        color: "var(--warning)",
                      }}
                    >
                      <strong>Note: </strong>
                      {step.important_notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required Documents */}
      {data.required_documents && data.required_documents.length > 0 && (
        <div
          className="p-4 rounded-xl space-y-3"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            <FileText className="w-4 h-4" style={{ color: "var(--success)" }} />
            Required Documents Checklist
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.required_documents.map((doc, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg text-xs"
                style={{
                  backgroundColor: "var(--surface-overlay)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <CheckCircle
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: "var(--success)" }}
                />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Important notes */}
      {data.important_notes && data.important_notes.length > 0 && (
        <div
          className="p-4 rounded-xl space-y-2"
          style={{
            backgroundColor: "rgba(217, 119, 6, 0.06)",
            border: "1px solid rgba(217, 119, 6, 0.2)",
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--warning)" }}>
            <Info className="w-4 h-4" />
            Important Compliance Notes
          </div>
          <ul className="space-y-1.5 text-xs list-disc pl-5" style={{ color: "var(--text-secondary)" }}>
            {data.important_notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      <CitationPanel sources={data.sources} />

      {/* Disclaimer */}
      {data.disclaimer && (
        <p
          className="text-[11px] italic border-l-2 pl-3 py-1"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          {data.disclaimer}
        </p>
      )}
    </div>
  );
};
