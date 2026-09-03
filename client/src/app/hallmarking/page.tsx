"use client";

import React, { useState, useEffect, useCallback } from "react";
import { searchHallmarking } from "@/lib/api";
import { HallmarkingResponse, Language } from "@/types/api";
import { HallmarkingCard } from "@/components/responses/HallmarkingCard";
import { ShieldCheck, Search, Loader2, Globe } from "lucide-react";

export default function HallmarkingPage() {
  const [query, setQuery] = useState("Explain mandatory gold hallmarking marks and HUID verification");
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [hallmarkData, setHallmarkData] = useState<HallmarkingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHallmarking = useCallback(async (searchQuery: string, lang: Language) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchHallmarking(searchQuery, lang);
      setHallmarkData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load hallmarking details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHallmarking("Explain mandatory gold hallmarking marks and HUID verification", "en");
  }, [fetchHallmarking]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHallmarking(query, language);
  };

  const handleLanguageToggle = () => {
    const nextLang = language === "en" ? "hi" : "en";
    setLanguage(nextLang);
    fetchHallmarking(query, nextLang);
  };

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
          Everything consumers and jewellers need to know about official gold & silver hallmarking, purity fineness standards, and verifying the 6-digit Hallmark Unique Identification (HUID).
        </p>
      </div>

      {/* Query Bar */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
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
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900"
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>{language === "en" ? "EN" : "हिन्दी"}</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm disabled:opacity-50 transition-all shadow-md shadow-amber-600/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Lookup Guidelines</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300">
          {error}
        </div>
      )}

      {hallmarkData && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
          <HallmarkingCard data={hallmarkData} />
        </div>
      )}
    </div>
  );
}
