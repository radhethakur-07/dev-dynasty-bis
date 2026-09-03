import React from "react";
import { HallmarkingResponse } from "@/types/api";
import { CitationPanel } from "./CitationPanel";
import { Shield, Check, Smartphone, AlertCircle, Sparkles } from "lucide-react";

interface HallmarkingCardProps {
  data: HallmarkingResponse;
}

export const HallmarkingCard: React.FC<HallmarkingCardProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="text-sm leading-relaxed text-slate-200">
        {data.summary}
      </div>

      {/* Demo Notice */}
      {data.is_demo && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Notice: Guidance compiled using {data.demo_badge || "Demo / Sample / Not official"} records.</span>
        </div>
      )}

      {/* The 3 Mandatory Hallmarks */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4" />
          <span>The 3 Mandatory BIS Hallmarks</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {data.mandatory_marks.map((mark, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-amber-500/20 bg-slate-900/80 text-xs text-slate-200 space-y-1"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                {idx + 1}
              </div>
              <div className="font-semibold text-slate-100">{mark}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recognized Purity Grades */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <h4 className="text-xs font-semibold text-slate-300 mb-2.5">
          Recognized Purity Grades & Fineness
        </h4>
        <div className="flex flex-wrap gap-2">
          {data.purity_grades.map((grade, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs font-mono font-medium"
            >
              {grade}
            </span>
          ))}
        </div>
      </div>

      {/* Consumer Verification Guide (BIS CARE App) */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2.5">
          <Smartphone className="w-4 h-4" />
          <span>How to Verify HUID via BIS CARE Mobile App</span>
        </div>
        <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
          {data.consumer_verification_steps.map((step, idx) => (
            <li key={idx} className="pl-1">
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

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
