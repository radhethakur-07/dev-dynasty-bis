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
  Database
} from "lucide-react";

interface CertificationStepsProps {
  data: CertificationGuidanceResponse;
}

export const CertificationSteps: React.FC<CertificationStepsProps> = ({ data }) => {
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl border border-blue-900/50 bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-950/80 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-wide">
            <Award className="w-4 h-4 text-blue-400" />
            <span>{data.scheme_name}</span>
          </div>

          {data.product && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
              <span className="text-slate-400">Target:</span>
              <strong className="text-slate-100">{data.product}</strong>
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-100">
          Official Certification Pathway & Compliance Requirements
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {data.summary}
        </p>

        {/* Evidence & Retrieval Summary */}
        {data.retrieval_summary && (
          <div className="flex items-center gap-2 pt-2 text-xs text-blue-300/90 font-medium">
            <Database className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span>{data.retrieval_summary}</span>
          </div>
        )}
      </div>

      {/* Demo Notice if applicable */}
      {data.is_demo && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Notice: Guidance compiled using {data.demo_badge || "Demo / Sample / Not official"} documentation records.</span>
        </div>
      )}

      {/* Section: Purpose & Applicability (Conditional) */}
      {data.applicability && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Scheme Purpose & Regulatory Applicability</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.applicability}
          </p>
        </div>
      )}

      {/* Section: Applicable Products / Standards (Conditional) */}
      {data.applicable_products_or_standards && data.applicable_products_or_standards.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Applicable Products / Indian Standards (Verified Scope)</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {data.applicable_products_or_standards.map((prod, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-200 text-xs font-medium"
              >
                {prod}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Section: Testing & Assessment Information (Conditional) */}
      {data.testing_and_assessment && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Microscope className="w-4 h-4 text-purple-400" />
            <span>Testing & Conformity Assessment Model</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.testing_and_assessment}
          </p>
        </div>
      )}

      {/* Section: Step-by-Step Process Timeline */}
      {data.steps && data.steps.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
            <span>Certification Process & Stages</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {data.steps.map((step) => (
              <div key={step.step_number} className="relative group">
                {/* Step marker */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-blue-500 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                  {step.step_number}
                </div>

                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 transition-colors space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{step.title}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
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
        </div>
      )}

      {/* Section: Required Documents Checklist (Conditional) */}
      {data.required_documents && data.required_documents.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Essential Documentation Checklist</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
            {data.required_documents.map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section: Important Regulatory Notes (Conditional) */}
      {data.important_notes && data.important_notes.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/15 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Important Compliance Notes & Penalties</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-200/90 list-disc pl-5">
            {data.important_notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section: Official BIS Sources & Expandable Evidence Cards */}
      {data.sources && data.sources.length > 0 && (
        <div className="border border-slate-800 bg-slate-950/80 rounded-xl overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => setSourcesOpen(!sourcesOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-900/60 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>{data.sources.length} official BIS sources retrieved</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
              <span>{sourcesOpen ? "Collapse Sources" : "View Sources & Evidence"}</span>
              {sourcesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {sourcesOpen && (
            <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/95">
              {data.sources.map((src, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-800/70 bg-slate-900/40 text-xs text-slate-300 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      {src.document_title}
                    </div>
                    {src.is_demo && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {src.demo_badge || "Demo / Sample / Not official"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
                    {src.section && (
                      <span>
                        <strong className="text-slate-300">Section:</strong> {src.section}
                      </span>
                    )}
                    {src.page_number && (
                      <span>
                        <strong className="text-slate-300">Page:</strong> {src.page_number}
                      </span>
                    )}
                  </div>

                  {src.url && (
                    <div className="pt-1">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{src.url}</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Official Disclaimer */}
      {data.disclaimer && (
        <div className="text-[11px] text-slate-400 italic border-l-2 border-slate-700 pl-3 py-1">
          {data.disclaimer}
        </div>
      )}
    </div>
  );
};
