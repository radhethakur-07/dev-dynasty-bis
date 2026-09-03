"use client";

import React, { useState } from "react";
import { searchStandards } from "@/lib/api";
import { StandardRecommendationResponse, Language } from "@/types/api";
import { StandardCard } from "@/components/responses/StandardCard";
import { Search, BookOpen, Loader2, Sparkles, Filter, Globe } from "lucide-react";

export default function StandardsFinderPage() {
  const [product, setProduct] = useState("");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StandardRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await searchStandards(
        product.trim(),
        query.trim() || `Indian standards for ${product}`,
        language
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to search Indian Standards.");
    } finally {
      setIsLoading(false);
    }
  };

  const sampleProducts = [
    "Domestic Pressure Cooker",
    "Packaged Drinking Water",
    "Plastic Toys for Children",
    "Household Electrical Plugs & Sockets"
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Product-to-Standard Discovery Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Find Applicable Indian Standards
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Enter your product details to identify potentially relevant Indian Standards (IS), mandatory quality control orders (QCO), and technical specifications.
        </p>
      </div>

      {/* Form Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Product Name or Type <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Pressure cooker, LED Bulb, Cement, Toy..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="w-full sm:w-48 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Language</label>
              <button
                type="button"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 hover:bg-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  {language === "en" ? "English" : "हिन्दी"}
                </span>
                <span className="text-xs text-slate-500">Switch</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Technical Context / Intended Use (Optional)
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Aluminum or stainless steel domestic use..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500">Try searching:</span>
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !product.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching Standards...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Indian Standards</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Identified Standards & Citations
            </h3>
            <span className="text-xs text-slate-400">
              Found {result.standards.length} standard(s)
            </span>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <StandardCard data={result} />
          </div>
        </div>
      )}
    </div>
  );
}
