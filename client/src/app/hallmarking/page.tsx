"use client";

import React, { useState, useCallback } from "react";
import { searchHallmarking } from "@/lib/api";
import { HallmarkingResponse, Language } from "@/types/api";
import { HallmarkingCard } from "@/components/responses/HallmarkingCard";
import { ShieldCheck, Search, Loader2, Globe, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function HallmarkingPage() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [hallmarkData, setHallmarkData] = useState<HallmarkingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHallmarking = useCallback(async (searchQuery: string, lang: Language) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchHallmarking(searchQuery.trim(), lang);
      setHallmarkData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load hallmarking details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    fetchHallmarking(query, language);
  };

  const handleLanguageToggle = () => {
    const nextLang = language === "en" ? "hi" : "en";
    setLanguage(nextLang);
    if (query.trim()) {
      fetchHallmarking(query, nextLang);
    }
  };

  const handleReset = () => {
    setQuery("");
    setHallmarkData(null);
    setError(null);
  };

  const sampleQueries = [
    { label: "Gold 3 Marks & HUID", text: "Explain mandatory gold hallmarking marks and HUID verification" },
    { label: "Silver Hallmark", text: "What are the mandatory marks for Silver jewellery hallmarking?" },
    { label: "HUID Verification Steps", text: "How do consumers verify HUID on the official BIS Care App?" },
    { label: "Assaying & Testing", text: "Can consumers test hallmarked jewellery at BIS recognized centres?" }
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Precious Metals & Consumer Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          BIS Hallmarking & HUID Verification
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Verified intelligence from official BIS documentation on gold & silver hallmarking, purity fineness standards, and verifying the 6-digit Hallmark Unique Identification (HUID).
        </p>
      </div>

      {/* Query Bar */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about purity grades, HUID, or hallmarking guidelines..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />

          <button
            type="button"
            onClick={handleLanguageToggle}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>{language === "en" ? "EN" : "हिन्दी"}</span>
          </button>

          {hallmarkData && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm disabled:opacity-50 transition-all shadow-md shadow-amber-600/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Lookup Guidelines</span>
          </button>
        </form>

        {/* Quick sample buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Quick queries:</span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sq.text);
                fetchHallmarking(sq.text, language);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              {sq.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Active Loading State */}
      {isLoading && (
        <div className="p-8 rounded-2xl border border-amber-500/30 bg-slate-900/40 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            Retrieving official BIS hallmarking & HUID documentation from Supabase...
          </h3>
        </div>
      )}

      {/* Results View */}
      {!isLoading && hallmarkData && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-2xl">
          <HallmarkingCard data={hallmarkData} />
        </div>
      )}

      {/* Empty State: Search-First Guidance */}
      {!isLoading && !hallmarkData && (
        <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-100">
              Search Official BIS Hallmarking & HUID Regulations
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No results preloaded. Enter a query or click one of the verified topic buttons above to retrieve official BIS hallmarking standards from Supabase.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-3xl mx-auto pt-2">
            <div
              onClick={() => {
                setQuery(sampleQueries[0].text);
                fetchHallmarking(sampleQueries[0].text, language);
              }}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 hover:border-amber-500/40 transition-all cursor-pointer space-y-1.5"
            >
              <div className="text-xs font-bold text-amber-300">Gold Hallmarking (IS 1417)</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                3 mandatory marks: BIS Logo, Purity Grade (e.g. 22K916), and 6-digit alphanumeric HUID.
              </p>
            </div>

            <div
              onClick={() => {
                setQuery(sampleQueries[1].text);
                fetchHallmarking(sampleQueries[1].text, language);
              }}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 hover:border-amber-500/40 transition-all cursor-pointer space-y-1.5"
            >
              <div className="text-xs font-bold text-slate-200">Silver Hallmarking (IS 2112:2025)</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                7 purity grades (999 to 800) with BIS mark, fineness, and HUID traceability.
              </p>
            </div>

            <div
              onClick={() => {
                setQuery(sampleQueries[2].text);
                fetchHallmarking(sampleQueries[2].text, language);
              }}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 hover:border-amber-500/40 transition-all cursor-pointer space-y-1.5"
            >
              <div className="text-xs font-bold text-blue-300">BIS Care Verification</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Verify jeweler registration number, AHC assaying centre, and hallmark date on the mobile app.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}