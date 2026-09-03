import React from "react";
import Link from "next/link";
import { Shield, ExternalLink, AlertTriangle } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-200">Dev Dynasty</span> • BIS Intelligence Platform
              <span className="ml-2 text-[10px] text-slate-500 font-mono">SIH267107</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a
              href="https://www.bis.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 flex items-center gap-1"
            >
              <span>BIS Official Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.manakonline.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 flex items-center gap-1"
            >
              <span>Manakonline</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link href="/about" className="hover:text-slate-200">
              Scope & Boundaries
            </Link>
          </div>
        </div>

        {/* Regulatory & Disclaimer Notice */}
        <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-900/40 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500/80" />
            <span>Important Regulatory Disclaimer:</span>
          </div>
          <p className="leading-relaxed">
            This platform is an independent AI prototype developed by team Dev Dynasty for Smart India Hackathon (SIH267107) to assist MSMEs, manufacturers, and consumers with Indian Standards discovery. It is not an official Bureau of Indian Standards authority. All sample datasets are designated as <em>Demo / Sample / Not official</em>. Official conformity certifications must be verified directly through authorized BIS offices and Gazette notifications.
          </p>
        </div>

        <div className="text-center text-[10px] text-slate-600">
          © 2026 Dev Dynasty • Built with Next.js, FastAPI, Pydantic, Gemini & Supabase pgvector.
        </div>
      </div>
    </footer>
  );
};
