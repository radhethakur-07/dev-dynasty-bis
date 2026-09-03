"use client";

import React, { useState, useCallback } from "react";
import { searchLaboratories } from "@/lib/api";
import { LaboratoryResultsResponse, Language } from "@/types/api";
import { LaboratoryTable } from "@/components/responses/LaboratoryTable";
import { FlaskConical, Search, Loader2, MapPin, Globe, RefreshCw, Sparkles, AlertCircle } from "lucide-react";

export default function LaboratoriesPage() {
  const [productOrTest, setProductOrTest] = useState("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [labData, setLabData] = useState<LaboratoryResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLabs = useCallback(async (prod: string, loc: string, lang: Language) => {
    if (!prod.trim() && !loc.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchLaboratories(prod.trim(), loc.trim() || undefined, lang);
      setLabData(data);
    } catch (err: any) {
      setError(err.message || "Failed to search testing laboratories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productOrTest.trim() && !location.trim()) return;
    fetchLabs(productOrTest, location, language);
  };

  const handleReset = () => {
    setProductOrTest("");
    setLocation("");
    setLabData(null);
    setError(null);
  };

  const samplePresets = [
    { label: "Food Services (Hyderabad)", prod: "Food", loc: "Hyderabad" },
    { label: "Power & Electrical (Bengaluru)", prod: "Power Electrical", loc: "Bengaluru" },
    { label: "NTH Test House (Ghaziabad)", prod: "National Test House", loc: "Ghaziabad" },
    { label: "Delhi NCR Labs", prod: "Testing", loc: "Delhi" }
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Testing Infrastructure & Laboratory Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Recognized Testing Laboratories
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Search BIS Central, Regional, and recognized third-party testing laboratories across India by product test scope and location.
        </p>
      </div>

      {/* Filter Form */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Product or Testing Discipline
              </label>
              <input
                type="text"
                value={productOrTest}
                onChange={(e) => setProductOrTest(e.target.value)}
                placeholder="e.g. Food, Power, Cookware, Cement, Electrical..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                City / State (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Hyderabad, Bengaluru..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium">Quick filters:</span>
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setProductOrTest(preset.prod);
                  setLocation(preset.loc);
                  fetchLabs(preset.prod, preset.loc, language);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                const nextLang = language === "en" ? "hi" : "en";
                setLanguage(nextLang);
                if (productOrTest.trim() || location.trim()) {
                  fetchLabs(productOrTest, location, nextLang);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === "en" ? "English" : "हिन्दी"}</span>
            </button>

            <div className="flex items-center gap-2">
              {labData && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading || (!productOrTest.trim() && !location.trim())}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching Laboratories...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Laboratories</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Active Loading State */}
      {isLoading && (
        <div className="p-8 rounded-2xl border border-blue-500/30 bg-slate-900/40 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-200">
              Searching BIS LIMS recognized laboratories...
            </h4>
            <p className="text-xs text-slate-400">
              Filtering testing facility scopes and geographical locations.
            </p>
          </div>
        </div>
      )}

      {/* Results View */}
      {!isLoading && labData && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl space-y-4">
          <LaboratoryTable data={labData} />
        </div>
      )}

      {/* Clean Empty State: Visible on initial load */}
      {!isLoading && !labData && (
        <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
            <FlaskConical className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-100">
              Search BIS Recognized Laboratories
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No results preloaded. Enter a product type (e.g. &quot;Food&quot;, &quot;Power&quot;, &quot;Electrical&quot;) or select a city/state above to retrieve verified testing facilities from the BIS LIMS directory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-3xl mx-auto pt-2">
            <div
              onClick={() => {
                setProductOrTest("Food");
                setLocation("Hyderabad");
                fetchLabs("Food", "Hyderabad", language);
              }}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 hover:border-blue-500/40 transition-all cursor-pointer space-y-1"
            >
              <div className="text-xs font-bold text-slate-200">Food Services Testing</div>
              <div className="text-[11px] text-blue-400 font-medium">Intertek • Hyderabad</div>
              <p className="text-[10px] text-slate-400">
                Recognized under BIS LIMS for food products and packaged water testing.
              </p>
            </div>

            <div
              onClick={() => {
                setProductOrTest("Power Electrical");
                setLocation("Bengaluru");
                fetchLabs("Power Electrical", "Bengaluru", language);
              }}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 hover:border-blue-500/40 transition-all cursor-pointer space-y-1"
            >
              <div className="text-xs font-bold text-slate-200">Power & High Voltage</div>
              <div className="text-[11px] text-blue-400 font-medium">CPRI • Bengaluru</div>
              <p className="text-[10px] text-slate-400">
                Premier institute for power research, transformers, switchgear, and cables.
              </p>
            </div>

            <div
              onClick={() => {
                setProductOrTest("Testing");
                setLocation("Delhi");
                fetchLabs("Testing", "Delhi", language);
              }}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 hover:border-blue-500/40 transition-all cursor-pointer space-y-1"
            >
              <div className="text-xs font-bold text-slate-200">Industrial Research</div>
              <div className="text-[11px] text-blue-400 font-medium">SIIR • Delhi</div>
              <p className="text-[10px] text-slate-400">
                Specialized in chemical, mechanical, and materials testing under BIS LIMS.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

