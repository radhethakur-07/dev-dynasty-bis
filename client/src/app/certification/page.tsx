"use client";

import React, { useState } from "react";
import { getCertificationGuidance } from "@/lib/api";
import { CertificationGuidanceResponse, Language } from "@/types/api";
import { CertificationSteps } from "@/components/responses/CertificationSteps";
import { 
  Award, 
  Search, 
  Loader2, 
  Globe, 
  FileCheck2, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Cpu,
  PackageCheck,
  Factory,
  Globe2
} from "lucide-react";

interface SupportedScheme {
  id: string;
  name: string;
  short_name: string;
  badge: string;
  default_product: string;
  description: string;
  icon: any;
}

const SUPPORTED_SCHEMES: SupportedScheme[] = [
  {
    id: "scheme_1",
    name: "Scheme I — Product Certification (ISI Mark)",
    short_name: "Scheme I (ISI Mark)",
    badge: "Factory Audit + In-House Lab",
    default_product: "Domestic Pressure Cooker",
    description: "Standard domestic product certification requiring in-house lab, SIT compliance, factory audit, and independent testing.",
    icon: Factory
  },
  {
    id: "scheme_2",
    name: "Scheme II — Compulsory Registration Scheme (CRS)",
    short_name: "Scheme II (CRS)",
    badge: "Lab Test Report Only (No Factory Audit)",
    default_product: "Laptops & Electronic Tablets",
    description: "Self-declaration of conformity for notified Electronics & IT goods based on 90-day lab test report from BIS recognized lab.",
    icon: Cpu
  },
  {
    id: "scheme_4",
    name: "Scheme IV — Certificate of Conformity (CoC)",
    short_name: "Scheme IV (CoC)",
    badge: "Batch / Consignment Clearance",
    default_product: "Imported Steel Batch Consignment",
    description: "Batch-specific testing and conformity certificate where continuous factory licensing is not applicable.",
    icon: PackageCheck
  },
  {
    id: "scheme_x",
    name: "Scheme X — Industrial Equipment Certification",
    short_name: "Scheme X",
    badge: "Type-Testing + Technical File",
    default_product: "Low-Voltage Switchgear & Industrial Machinery",
    description: "Comprehensive certification for heavy industrial machinery, controlgear, transformers, and complex electrical rotating plant.",
    icon: Layers
  },
  {
    id: "fmcs",
    name: "Foreign Manufacturers Certification Scheme (FMCS)",
    short_name: "FMCS (Scheme I)",
    badge: "Overseas Audit + Mandatory AIR",
    default_product: "PVC Cables manufactured abroad",
    description: "Scheme-I certification for plants outside India exporting to India, requiring Authorized Indian Representative (AIR).",
    icon: Globe2
  }
];

export default function CertificationPage() {
  const [product, setProduct] = useState("");
  const [selectedScheme, setSelectedScheme] = useState(SUPPORTED_SCHEMES[0].short_name);
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [guidance, setGuidance] = useState<CertificationGuidanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = async (targetProduct: string, targetScheme: string, lang: Language) => {
    if (!targetProduct.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getCertificationGuidance(targetProduct.trim(), targetScheme, lang);
      setGuidance(data);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve certification guidance.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(product, selectedScheme, language);
  };

  const handleQuickSchemeSelect = (schemeItem: SupportedScheme) => {
    setSelectedScheme(schemeItem.short_name);
    setProduct(schemeItem.default_product);
    executeSearch(schemeItem.default_product, schemeItem.short_name, language);
  };

  const handleResetSearch = () => {
    setProduct("");
    setGuidance(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Context Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>Official BIS Conformity Assessment & Licensing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Certification Guidance & Scheme Discovery
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Search step-by-step regulatory pathways, in-house laboratory prerequisites, factory audit rules, and required documentation directly from the official BIS knowledge repository.
        </p>
      </div>

      {/* Query & Scheme Selector Form */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl space-y-6">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Product Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Target Product / Article <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Domestic Pressure Cooker, Laptops, Cement, Switchgear..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Supported Scheme Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Official Certification Scheme
              </label>
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              >
                {SUPPORTED_SCHEMES.map((s) => (
                  <option key={s.id} value={s.short_name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Preset Buttons for Supported Schemes */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Click a supported scheme to query official requirements:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_SCHEMES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleQuickSchemeSelect(s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedScheme === s.short_name
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                      : "bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <s.icon className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <span>{s.short_name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Language Toggle, Submit, and Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                const nextLang = language === "en" ? "hi" : "en";
                setLanguage(nextLang);
                if (product.trim()) {
                  executeSearch(product, selectedScheme, nextLang);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Language: {language === "en" ? "English" : "हिन्दी"}</span>
            </button>

            <div className="flex items-center gap-2">
              {guidance && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>New Search</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading || !product.trim()}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching BIS knowledge base...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Certification Guidance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Active Loading State */}
      {isLoading && (
        <div className="p-10 rounded-2xl border border-blue-500/30 bg-slate-900/50 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-200">
              Searching BIS knowledge base...
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Retrieving authentic scheme regulations, in-house lab prerequisites, and inspection procedures from Supabase pgvector.
            </p>
          </div>
        </div>
      )}

      {/* Guidance Results Component */}
      {!isLoading && guidance && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl">
          <CertificationSteps data={guidance} />
        </div>
      )}

      {/* Proper Empty State: Visible only when no result is loaded */}
      {!isLoading && !guidance && (
        <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-100">
              Search Official BIS Certification Guidance
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No results preloaded. Enter a product name and choose a scheme above or click one of the verified official schemes below to begin.
            </p>
          </div>

          {/* Cards for Supported Schemes in Empty State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left max-w-4xl mx-auto pt-2">
            {SUPPORTED_SCHEMES.map((s) => (
              <div
                key={s.id}
                onClick={() => handleQuickSchemeSelect(s)}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/90 hover:border-blue-500/40 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                    {s.short_name}
                  </span>
                  <s.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="text-[10px] font-semibold text-blue-400/90 uppercase tracking-wide">
                  {s.badge}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
