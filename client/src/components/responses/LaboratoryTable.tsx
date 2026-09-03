import React from "react";
import { LaboratoryResultsResponse } from "@/types/api";
import { CitationPanel } from "./CitationPanel";
import { FlaskConical, MapPin, ExternalLink, AlertCircle } from "lucide-react";

interface LaboratoryTableProps {
  data: LaboratoryResultsResponse;
}

export const LaboratoryTable: React.FC<LaboratoryTableProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="text-sm leading-relaxed text-slate-200">
        {data.summary}
      </div>

      {data.is_demo && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Notice: Laboratory records retrieved from {data.demo_badge || "Demo / Sample / Not official"} dataset.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {data.laboratories.map((lab, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 transition-colors space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{lab.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{lab.location}</span>
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {lab.recognition_status}
              </span>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <strong className="text-slate-400">Testing Capabilities: </strong>
              {lab.scope_or_capabilities}
            </div>

            {lab.source_url && (
              <div className="text-[11px]">
                <a
                  href={lab.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                >
                  <span>Official Laboratory Directory</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.disclaimer && (
        <div className="text-[11px] text-slate-400 italic border-l-2 border-slate-700 pl-3 py-0.5">
          {data.disclaimer}
        </div>
      )}

      <CitationPanel sources={data.sources} />
    </div>
  );
};
