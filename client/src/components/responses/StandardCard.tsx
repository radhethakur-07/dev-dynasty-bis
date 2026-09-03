import React from "react";
import { StandardRecommendationResponse } from "@/types/api";
import { CitationPanel } from "./CitationPanel";
import { CheckCircle2, ShieldCheck, AlertCircle, Bookmark } from "lucide-react";

interface StandardCardProps {
  data: StandardRecommendationResponse;
}

export const StandardCard: React.FC<StandardCardProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {/* Summary Message */}
      <div className="text-sm leading-relaxed text-slate-200">
        {data.summary}
      </div>

      {/* Demo notice if applicable */}
      {data.is_demo && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Notice: Results generated using {data.demo_badge || "Demo / Sample / Not official"} knowledge fixtures.</span>
        </div>
      )}

      {/* Empty / Insufficient Evidence State */}
      {data.standards.length === 0 && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>No Verified Standards Met Relevance Threshold</span>
          </div>
          {data.clarification_prompt && (
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-blue-400">Guidance: </strong>
              {data.clarification_prompt}
            </div>
          )}
        </div>
      )}

      {/* Standard List */}
      {data.standards.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
        {data.standards.map((std, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-200 shadow-sm group"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold">
                    <Bookmark className="w-3.5 h-3.5" />
                    {std.code}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <CheckCircle2 className="w-3 h-3" />
                    {std.label || "Potentially Relevant Standard"}
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-slate-100 group-hover:text-blue-200 transition-colors">
                  {std.title}
                </h4>
              </div>

              {std.is_demo && (
                <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded bg-slate-800 border border-slate-700 text-slate-400">
                  {std.demo_badge || "Demo"}
                </span>
              )}
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              <strong className="text-slate-400">Applicability Context: </strong>
              {std.reason}
            </p>
          </div>
        ))}
      </div>
      )}

      {/* Official Disclaimer */}
      {data.disclaimer && (
        <div className="text-[11px] text-slate-400 italic border-l-2 border-slate-700 pl-3 py-0.5">
          {data.disclaimer}
        </div>
      )}

      {/* Verified Citations */}
      <CitationPanel sources={data.sources} />
    </div>
  );
};
