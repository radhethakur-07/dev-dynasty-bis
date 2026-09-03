import React from "react";
import { CertificationGuidanceResponse } from "@/types/api";
import { CitationPanel } from "./CitationPanel";
import { CheckCircle, ArrowRight, FileText, AlertCircle, Award } from "lucide-react";

interface CertificationStepsProps {
  data: CertificationGuidanceResponse;
}

export const CertificationSteps: React.FC<CertificationStepsProps> = ({ data }) => {
  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="p-4 rounded-xl border border-blue-900/40 bg-blue-950/20">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>{data.scheme_name}</span>
        </div>
        <h3 className="mt-1 text-base font-semibold text-slate-100">
          Certification Pathway for {data.product}
        </h3>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Demo Notice */}
      {data.is_demo && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Notice: Guidance compiled using {data.demo_badge || "Demo / Sample / Not official"} documentation records.</span>
        </div>
      )}

      {/* Step-by-Step Timeline */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {data.steps.map((step) => (
          <div key={step.step_number} className="relative group">
            {/* Step marker */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-blue-500 text-blue-400 flex items-center justify-center text-[10px] font-bold">
              {step.step_number}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>{step.title}</span>
              </h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                {step.description}
              </p>
              {step.important_notes && (
                <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
                  <strong>Note:</strong> {step.important_notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Required Documents Checklist */}
      {data.required_documents && data.required_documents.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Essential Documentation Checklist</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
            {data.required_documents.map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Official Disclaimer */}
      {data.disclaimer && (
        <div className="text-[11px] text-slate-400 italic border-l-2 border-slate-700 pl-3 py-0.5">
          {data.disclaimer}
        </div>
      )}

      {/* Citations */}
      <CitationPanel sources={data.sources} />
    </div>
  );
};
