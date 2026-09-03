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
          <div className="p-4 rounded-xl border border-blue-900/40 bg-blue-950/20">
            <h3 className="text-base font-bold text-slate-100">{response.scheme_name}</h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">{response.description}</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <h4 className="text-xs font-semibold text-slate-200">Applicability</h4>
            <p className="text-xs text-slate-300">{response.applicability}</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <h4 className="text-xs font-semibold text-slate-200">Key Features</h4>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              {response.key_features.map((feat, idx) => (
                <li key={idx}>{feat}</li>
              ))}
            </ul>
          </div>
          <CitationPanel sources={response.sources} />
        </div>
      );

    case "insufficient_evidence":
      return (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Insufficient Grounded Evidence</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{response.message}</p>
          <div className="pt-2 border-t border-amber-500/20 text-xs text-slate-300">
            <strong className="text-amber-300">Recommended Action: </strong>
            <span>{response.recommended_official_action}</span>
          </div>
          <div className="pt-1">
            <a
              href="https://www.bis.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline"
            >
              <span>Visit Official BIS Portal (bis.gov.in)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      );

    case "clarification_required":
      return (
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span>Clarification Required</span>
          </div>
          <p className="text-xs text-slate-200">{response.question}</p>
          {response.suggested_options && response.suggested_options.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {response.suggested_options.map((opt, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300"
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
          <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
            {response.content}
          </div>
          {response.disclaimer && (
            <div className="text-[11px] text-slate-400 italic border-l-2 border-slate-700 pl-3 py-0.5">
              {response.disclaimer}
            </div>
          )}
          {response.sources && <CitationPanel sources={response.sources} />}
        </div>
      );

    case "error":
      return (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-300 leading-relaxed">{response.message}</div>
        </div>
      );

    default:
      return null;
  }
};
