"use client";

import React, { useState, useEffect, useCallback } from "react";
import { searchHallmarking } from "@/lib/api";
import { HallmarkingResponse, Language } from "@/types/api";
import { HallmarkingCard } from "@/components/responses/HallmarkingCard";
import { ShieldCheck, Search, Loader2, Globe, Sparkles } from "lucide-react";

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
    if (!query.trim()) return;
    fetchHallmarking(query.trim(), language);
  };

  const handleLanguageToggle = () => {
    const nextLang = language === "en" ? "hi" : "en";
    setLanguage(nextLang);
    fetchHallmarking(query, nextLang);
  };

  const sampleQueries = [
    { label: "Gold 3 Marks & HUID", text: "Explain mandatory gold hallmarking marks and HUID verification" },
    { label: "Silver Hallmark (Data Gap)", text: "What are the mandatory marks for Silver jewellery hallmarking?" },
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
            <span>{language === "en" ? "EN" : "à¤¹à¤¿à¤¨à¥à¤¦à¥€"}</span>
          </button>

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

      {isLoading && !hallmarkData && (
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-3 animate-pulse">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            Retrieving official BIS hallmarking & HUID documentation from Supabase...
          </h3>
        </div>
      )}

      {hallmarkData && (
        <div className={`p-6 rounded-2xl border border-slate-800 bg-slate-900/40 transition-opacity ${isLoading ? "opacity-60" : "opacity-100"}`}>
          {isLoading && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-medium animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Querying live knowledge base for: &quot;{query}&quot;...</span>
            </div>
          )}
          <HallmarkingCard data={hallmarkData} />
        </div>
      )}
    </div>
  );
}