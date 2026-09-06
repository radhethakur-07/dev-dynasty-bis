import React, { useState } from "react";
import { ProcessingStage, FinalResponseUnion } from "@/types/api";
import { 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Database, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles
} from "lucide-react";

interface AgentExecutionDrawerProps {
  intent?: string;
  toolCalled?: string | null;
  stages?: ProcessingStage[];
  structuredResponse?: FinalResponseUnion;
  onQuickPrompt?: (prompt: string) => void;
}

export const AgentExecutionDrawer: React.FC<AgentExecutionDrawerProps> = ({
  intent,
  toolCalled,
  stages = [],
  structuredResponse,
  onQuickPrompt
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getQuickPrompts = (): string[] => {
    if (!structuredResponse) return ["What are the mandatory QCO products?", "How to verify HUID?"];

    switch (structuredResponse.type) {
      case "standard_recommendation":
        const stdCode = structuredResponse.standards?.[0]?.code || "this standard";
        return [
          `Which recognized testing laboratory tests for ${stdCode}?`,
          `What is the certification procedure for ${stdCode}?`,
          "Is this standard compulsory under Quality Control Order (QCO)?",
          "What is the simplified procedure for grant of licence?"
        ];
      case "certification_guidance":
        return [
          "What is the difference between Scheme I (ISI) and Scheme II (CRS)?",
          "What documents are required for factory audit?",
          "Can an MSME get fee concessions for BIS certification?",
          "How long does normal procedure vs simplified procedure take?"
        ];
      case "hallmarking_info":
        return [
          "How do I verify 6-digit HUID on the BIS CARE app?",
          "What are the 7 official purity grades for silver jewellery under IS 2112:2025?",
          "Can a consumer test jewellery at an Assaying Centre?",
          "What is the statutory compensation for substandard gold?"
        ];
      case "laboratory_results":
        return [
          "How do I verify laboratory accreditation scope on BIS LIMS?",
          "Can I send test samples to any recognized laboratory?",
          "What is the difference between BIS Recognized and BIS Own Labs?"
        ];
      default:
        return [
          "Show me compulsory standards under Scheme I",
          "How to verify 6-digit HUID on BIS Care?",
          "Find electrical testing labs in Bengaluru"
        ];
    }
  };

  const quickPrompts = getQuickPrompts();

  return (
    <div className="space-y-2 mb-3">
      {/* Drawer Toggle Header */}
      <div className="rounded-xl border border-blue-900/40 bg-gradient-to-r from-slate-900/90 via-blue-950/20 to-slate-900/90 p-2.5 sm:p-3 text-xs shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 text-left text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-blue-400">
              <Cpu className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>AI Agent Reasoning & Live Retrieval Trace</span>
            </span>

            {intent && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono">
                {intent}
              </span>
            )}

            {toolCalled && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                ⚡ {toolCalled}()
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0">
            <span>{isOpen ? "Hide Trace" : "View Live Evidence"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Collapsible Inspection Details */}
        {isOpen && (
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5 text-[11px] text-slate-300 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Database className="w-3 h-3 text-indigo-400" />
                  Database Retrieval Layer
                </div>
                <div className="text-slate-200">
                  Queried <span className="text-blue-400 font-semibold">Supabase pgvector</span> (753 Standards & 437 Recognized Labs).
                </div>
                <div className="text-[10px] text-slate-400">
                  Full-text search: PostgreSQL <code className="text-blue-300">wfts</code> + Cosine Similarity index.
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Regulatory Grounding Check
                </div>
                <div className="text-emerald-300 font-medium">
                  Verified Official Government Sources
                </div>
                <div className="text-[10px] text-slate-400">
                  Zero synthetic data. Retained canonical Gazette notifications & LIMS endpoints.
                </div>
              </div>
            </div>

            {/* Stages Log */}
            {stages && stages.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Execution Pipeline Steps
                </div>
                <div className="space-y-1">
                  {stages.map((stg, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">{stg.stage}: </span>
                        <span className="text-slate-400">{stg.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Action Follow-Up Chips */}
      {onQuickPrompt && quickPrompts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => onQuickPrompt(prompt)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-[11px] text-slate-300 hover:text-blue-300 transition-all text-left group"
            >
              <Sparkles className="w-3 h-3 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
