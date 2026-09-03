import React from "react";
import { ProcessingStage } from "@/types/api";
import { Loader2, CheckCircle2, Shield } from "lucide-react";

interface ProcessingIndicatorProps {
  stages: ProcessingStage[];
  isLoading?: boolean;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  stages,
  isLoading = false,
}) => {
  if (!stages || stages.length === 0) {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <span>Understanding request & checking BIS knowledge base...</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2 mb-3">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          Controlled AI Execution Pipeline
        </span>
        {isLoading && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
      </div>

      <div className="space-y-1.5">
        {stages.map((stg, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium text-slate-200">{stg.stage}:</span>
            <span className="text-slate-400 text-[11px] truncate">{stg.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
