"use client";

import React, { useState, useEffect, useCallback } from "react";
import { searchLaboratories } from "@/lib/api";
import { LaboratoryResultsResponse, Language } from "@/types/api";
import { LaboratoryTable } from "@/components/responses/LaboratoryTable";
import { FlaskConical, Search, Loader2, MapPin, Globe } from "lucide-react";

export default function LaboratoriesPage() {
  const [productOrTest, setProductOrTest] = useState("pressure cooker and electrical");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [labData, setLabData] = useState<LaboratoryResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLabs = useCallback(async (prod: string, loc: string, lang: Language) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchLaboratories(prod, loc || undefined, lang);
      setLabData(data);
    } catch (err: any) {
      setError(err.message || "Failed to search testing laboratories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabs("pressure cooker and electrical", "", "en");
  }, [fetchLabs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLabs(productOrTest, location, language);
  };

  const sampleLocations = ["Mumbai", "Delhi NCR", "Chennai", "Kolkata"];

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
                placeholder="e.g. Cookware, Water, Chemical, Electrical..."
                required
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
                placeholder="e.g. Mumbai, Delhi, Tamil Nadu..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-500">Quick filter:</span>
              {sampleLocations.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLocation(loc);
                    fetchLabs(productOrTest, loc, language);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px]"
                >
                  {loc}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const nextLang = language === "en" ? "hi" : "en";
                setLanguage(nextLang);
                fetchLabs(productOrTest, location, nextLang);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === "en" ? "English" : "हिन्दी"}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !productOrTest.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
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
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300">
          {error}
        </div>
      )}

      {labData && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
          <LaboratoryTable data={labData} />
        </div>
      )}
    </div>
  );
}
