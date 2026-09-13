"use client";

import React from "react";
import { HallmarkingResponse } from "@/types/api";
import { CitationPanel } from "./CitationPanel";
import { Shield, Smartphone, AlertCircle, Star } from "lucide-react";

interface HallmarkingCardProps {
  data: HallmarkingResponse;
}

export const HallmarkingCard: React.FC<HallmarkingCardProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {/* Demo Notice */}
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
          <span>Guidance from {data.demo_badge || "Demo / Sample"} records</span>
        </div>
      )}

      {/* Mandatory Hallmarks */}
      {data.mandatory_marks && data.mandatory_marks.length > 0 ? (
        <div
          className="p-4 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(217, 119, 6, 0.06) 0%, rgba(245, 158, 11, 0.04) 100%)",
            border: "1px solid rgba(217, 119, 6, 0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 flex-shrink-0" style={{ color: "var(--warning)" }} />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--warning)" }}
            >
              The 3 Mandatory BIS Hallmarks
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {data.mandatory_marks.map((mark, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl space-y-1.5"
                style={{
                  backgroundColor: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px]"
                  style={{
                    backgroundColor: "rgba(217, 119, 6, 0.12)",
                    color: "var(--warning)",
                    border: "1px solid rgba(217, 119, 6, 0.2)",
                  }}
                >
                  {idx + 1}
                </div>
                <p className="text-xs font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                  {mark}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 p-4 rounded-xl text-xs"
          style={{
            backgroundColor: "var(--surface-overlay)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--warning)" }} />
          <span>
            No mandatory marks table currently ingested for{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {data.precious_metal || "this material"}
            </strong>
            .
          </span>
        </div>
      )}

      {/* Purity Grades */}
      {data.purity_grades && data.purity_grades.length > 0 && (
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <h4 className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              Recognized Purity Grades &amp; Fineness
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.purity_grades.map((grade, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg font-mono text-xs font-semibold"
                style={{
                  backgroundColor: "var(--surface-overlay)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                {grade}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Consumer Verification Steps */}
      {data.consumer_verification_steps && data.consumer_verification_steps.length > 0 && (
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4" style={{ color: "var(--success)" }} />
            <h4 className="text-xs font-semibold" style={{ color: "var(--success)" }}>
              Verify HUID via BIS CARE Mobile App
            </h4>
          </div>
          <ol className="space-y-2">
            {data.consumer_verification_steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "var(--success)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
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
