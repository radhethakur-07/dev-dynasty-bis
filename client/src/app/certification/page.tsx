"use client";

import React, { useState } from "react";
import { getCertificationGuidance } from "@/lib/api";
import { CertificationGuidanceResponse, Language } from "@/types/api";
import { CertificationSteps } from "@/components/responses/CertificationSteps";
import { Award, Search, Loader2, Globe, FileCheck2 } from "lucide-react";

export default function CertificationPage() {
  const [product, setProduct] = useState("");
  const [scheme, setScheme] = useState("Scheme I (ISI Mark)");
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [guidance, setGuidance] = useState<CertificationGuidanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchGuidance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getCertificationGuidance(product.trim(), scheme, language);
      setGuidance(data);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve certification guidance.");
    } finally {
      setIsLoading(false);
    }
  };

  const sampleProducts = [
    "Packaged Drinking Water",
    "Toys (Electric & Non-electric)",
    "Domestic Pressure Cookers",
    "Solar Photovoltaic Modules"
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>BIS Conformity Assessment & Licensing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Certification Guidance & Process Pathways
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Discover the complete step-by-step pathway to acquire the ISI Mark or Compulsory Registration (CRS), including factory audit preparation and documentation.
        </p>
      </div>

      {/* Query Form */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
        <form onSubmit={handleFetchGuidance} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Target Product / Category <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Bottled water, Toys, Pressure cooker..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Certification Scheme
              </label>
              <select
                value={scheme}
                onChange={(e) => setScheme(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Scheme I (ISI Mark)">Scheme I — Product Certification (ISI Mark)</option>
                <option value="Scheme II (CRS)">Scheme II — Compulsory Registration Scheme (CRS)</option>
                <option value="FMCS">Foreign Manufacturers Certification Scheme (FMCS)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">Popular:</span>
              {sampleProducts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProduct(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-[11px]"
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === "en" ? "English" : "हिन्दी"}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !product.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Guidance...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Generate Certification Pathway</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300">
          {error}
        </div>
      )}

      {guidance && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
          <CertificationSteps data={guidance} />
        </div>
      )}
    </div>
  );
}
