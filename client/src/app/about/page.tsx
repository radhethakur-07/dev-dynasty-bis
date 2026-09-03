import React from "react";
import Link from "next/link";
import { Shield, CheckCircle, XCircle, AlertTriangle, ExternalLink, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Project Governance & Boundaries • SIH267107</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          Dev Dynasty — BIS Intelligence Platform
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Developed for the Smart India Hackathon under problem statement SIH267107 to make Indian Standards (IS), conformity schemes, and BIS services easily discoverable through evidence-grounded AI.
        </p>
      </div>

      {/* What it is vs What it is not */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>What the Platform IS</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <li>• A specialized, domain-controlled BIS intelligence assistant.</li>
            <li>• Grounded in verified BIS knowledge chunks using Supabase pgvector.</li>
            <li>• Enforces strict Pydantic validation on every tool argument.</li>
            <li>• Supports bilingual discovery in English and Hindi.</li>
            <li>• Preserves technical Indian Standard numbers (IS codes) precisely.</li>
            <li>• Displays clear, verifiable source citations and page numbers.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-red-400">
            <XCircle className="w-4 h-4" />
            <span>What the Platform is NOT</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <li>• NOT an open-ended generic chatbot for chitchat or code writing.</li>
            <li>• NOT an official legal certification authority.</li>
            <li>• NEVER executes arbitrary SQL or gives the LLM direct database access.</li>
            <li>• Does NOT fabricate standards, fee structures, or test parameters.</li>
            <li>• Does NOT hallucinate facts when source evidence is missing.</li>
          </ul>
        </div>
      </div>

      {/* Grounding & Demo Data Policy */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Strict Non-Fabrication & Demo Data Policy</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          In accordance with the project specification:
        </p>
        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-2 leading-relaxed">
          <li>
            <strong>Demo Data Transparency:</strong> All initial mock and fixture datasets used for development and local verification are explicitly tagged as <em>&quot;Demo / Sample / Not official&quot;</em>.
          </li>
          <li>
            <strong>Zero Hallucination Guarantee:</strong> When source evidence in the knowledge base is insufficient or missing, the system returns an explicit <code>insufficient_evidence</code> status rather than guessing.
          </li>
          <li>
            <strong>Official Source Verification:</strong> Final legal determination of standard applicability and fee structures must be verified through official BIS notifications on <a href="https://www.bis.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">bis.gov.in</a> or <a href="https://www.manakonline.in" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">manakonline.in</a>.
          </li>
        </ul>
      </div>

      {/* CTA to Assistant */}
      <div className="text-center pt-4">
        <Link
          href="/assistant"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"
        >
          <span>Try the BIS Assistant Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
