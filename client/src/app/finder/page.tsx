"use client";

import React, { useState } from "react";
import { searchStandards } from "@/lib/api";
import { StandardRecommendationResponse, Language } from "@/types/api";
import { StandardCard } from "@/components/responses/StandardCard";
import {
  Search,
  BookOpen,
  Loader2,
  Sparkles,
  Layers,
  Wrench,
  FileText,
  Globe,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from "lucide-react";

export default function StandardsFinderPage() {
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [material, setMaterial] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StandardRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: "", label: "Auto-detect / All Categories" },
    { value: "Consumer Goods / Mechanical", label: "Consumer Goods & Mechanical (Cookers, Utensils)" },
    { value: "Food / Consumer", label: "Food & Beverages (Packaged Water, Milk)" },
    { value: "Electrical Appliances", label: "Electrical & Electronics (Plugs, Switches, Appliances)" },
    { value: "Toys", label: "Toys & Children Products" },
    { value: "Chemicals & Materials", label: "Chemicals, Cement, Construction" }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await searchStandards({
        product: product.trim(),
        category: category || undefined,
        material: material.trim() || undefined,
        intended_use: intendedUse.trim() || undefined,
        description: description.trim() || undefined,
        language
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to search Indian Standards.");
    } finally {
      setIsLoading(false);
    }
  };

  const setPreset = (
    pName: string,
    pCat: string,
    pMat: string,
    pUse: string,
    pDesc: string
  ) => {
    setProduct(pName);
    setCategory(pCat);
    setMaterial(pMat);
    setIntendedUse(pUse);
    setDescription(pDesc);
    setResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Product-to-Standard Discovery Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Product-to-Standard Discovery Engine
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Enter your product attributes to identify Potentially Relevant Indian Standards (IS), mandatory Quality Control Orders (QCOs), and test specifications.
        </p>
      </div>

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6 backdrop-blur-sm">
        <form onSubmit={handleSearch} className="space-y-5">
          {/* Row 1: Product Name & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Product Name</span>
                <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g., Domestic Pressure Cooker, Packaged Water, Baby Rattles..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Language Preference</label>
              <button
                type="button"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 hover:bg-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  {language === "en" ? "English" : "हिन्दी"}
                </span>
                <span className="text-[11px] font-medium text-slate-500">Switch</span>
              </button>
            </div>
          </div>

          {/* Row 2: Category & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Product Category / Sector</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              >
                {categories.map((c, idx) => (
                  <option key={idx} value={c.value} className="bg-slate-950 text-slate-200">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                <span>Material Composition</span>
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g., Aluminium, Stainless Steel, Polymer, Glass..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Row 3: Intended Use */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span>Intended Use / Operating Environment</span>
            </label>
            <input
              type="text"
              value={intendedUse}
              onChange={(e) => setIntendedUse(e.target.value)}
              placeholder="e.g., Domestic kitchen cooking, Direct human consumption, Children under 14..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Row 4: Detailed Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Technical Description / Parameters (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide technical specifications, capacity (e.g. 5 litres), voltage rating, or safety features..."
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Preset Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium">Quick examples:</span>
            <button
              type="button"
              onClick={() =>
                setPreset(
                  "Domestic Pressure Cooker",
                  "Consumer Goods / Mechanical",
                  "Aluminium / Stainless Steel",
                  "Domestic food cooking",
                  "Capacity between 1 and 15 litres with safety relief valve"
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              Domestic Pressure Cooker
            </button>
            <button
              type="button"
              onClick={() =>
                setPreset(
                  "Packaged Drinking Water",
                  "Food / Consumer",
                  "PET Bottle",
                  "Direct human consumption",
                  "Treated drinking water packaged in food-grade plastic"
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              Packaged Drinking Water
            </button>
            <button
              type="button"
              onClick={() =>
                setPreset(
                  "Plastic Toys",
                  "Toys",
                  "Non-toxic Polymer",
                  "Children play under 14 years",
                  "Mechanical and physical safety properties for play articles"
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              Plastic Toys
            </button>
            <button
              type="button"
              onClick={() =>
                setPreset(
                  "Household Electrical Appliance",
                  "Electrical Appliances",
                  "Insulated plastic & copper",
                  "Domestic electrical use",
                  "Safety requirements for household electrical appliances"
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              Electrical Appliances
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !product.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Standards against Knowledge Base...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Potentially Relevant Standards</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-3 animate-pulse">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            Analyzing product attributes against BIS repository...
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Checking Indian Standards metadata, category alignments, and pgvector semantic chunks with strict relevance filtering.
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {result && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Evaluation Results
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {result.standards.length} Potentially Relevant Standard(s)
            </span>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm">
            <StandardCard data={result} />
          </div>
        </div>
      )}
    </div>
  );
}
