import React, { useState } from "react";
import { SourceCitation } from "@/types/api";
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface CitationPanelProps {
  sources: SourceCitation[];
}

export const CitationPanel: React.FC<CitationPanelProps> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 border border-slate-800 bg-slate-950/80 rounded-xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-900/60 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Verified Sources & Citations ({sources.length})</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-400">
          <span>{isOpen ? "Collapse" : "View Sources"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/95">
          {sources.map((src, idx) => (
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
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 hover:underline gap-1"
                  >
                    <span>Official Reference</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
