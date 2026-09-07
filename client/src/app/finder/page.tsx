"use client";

import React, { useState, useEffect } from "react";
import { searchStandards } from "@/lib/api";
import { StandardRecommendationResponse, Language, StandardItem } from "@/types/api";
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
  CheckCircle2,
  Cpu,
  ShieldAlert,
  ArrowRight,
  Filter
} from "lucide-react";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

export default function StandardsFinderPage() {
  const [activeTab, setActiveTab] = useState<"instant" | "analyzer">("instant");
  
  // Instant Search State
  const [instantQuery, setInstantQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  
  // AI Spec Analyzer State
  const [specText, setSpecText] = useState("");
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [material, setMaterial] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StandardRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sectors = [
    { label: "All Sectors", value: "" },
    { label: "Cement & Construction", value: "cement" },
    { label: "Steel & TMT Bars", value: "steel" },
    { label: "Electrical Appliances", value: "electrical" },
    { label: "Electronics & IT (CRS)", value: "electronics" },
    { label: "Toys & Child Safety", value: "toys" },
    { label: "Food & Drinking Water", value: "water" },
    { label: "Automotive & Helmets", value: "helmet" },
    { label: "Chemicals & Gas Cylinders", value: "cylinder" }
  ];

  const handleSearch = async (queryOverride?: string, sectorOverride?: string) => {
    const q = queryOverride !== undefined ? queryOverride : (activeTab === "instant" ? instantQuery : product);
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const cat = sectorOverride !== undefined ? sectorOverride : category;

    try {
      const data = await searchStandards({
        product: q.trim(),
        query: q.trim(),
        category: cat || undefined,
        material: material.trim() || undefined,
        intended_use: intendedUse.trim() || undefined,
        description: specText.trim() || undefined,
        language
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to search Indian Standards.");
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze unstructured text
  const handleAnalyzeSpec = () => {
    if (!specText.trim()) return;

    // Simple heuristic parser for unstructured specs
    let detectedProduct = specText.split(".")[0].slice(0, 50);
    let detectedMaterial = "";
    let detectedUse = "";
    let detectedCat = "";

    const lower = specText ? specText.toLowerCase() : "";
    if (lower.includes("steel")) detectedMaterial = "Stainless Steel / Carbon Steel";
    else if (lower.includes("aluminum") || lower.includes("aluminium")) detectedMaterial = "Aluminium Alloy";
    else if (lower.includes("plastic") || lower.includes("polymer")) detectedMaterial = "Polymer / Plastic";

    if (lower.includes("kitchen") || lower.includes("domestic") || lower.includes("home")) detectedUse = "Domestic Household Use";
    else if (lower.includes("industrial") || lower.includes("factory")) detectedUse = "Industrial Applications";
    else if (lower.includes("vehicle") || lower.includes("automotive")) detectedUse = "Automotive Road Transport";

    if (lower.includes("cooker") || lower.includes("utensil")) {
      detectedProduct = "Domestic Pressure Cooker";
      detectedCat = "Consumer Goods / Mechanical";
    } else if (lower.includes("water") || lower.includes("drinking")) {
      detectedProduct = "Packaged Drinking Water";
      detectedCat = "Food / Consumer";
    } else if (lower.includes("cement") || lower.includes("concrete")) {
      detectedProduct = "Ordinary Portland Cement";
      detectedCat = "Chemicals & Materials";
    } else if (lower.includes("battery") || lower.includes("laptop") || lower.includes("tablet")) {
      detectedProduct = "Information Technology Equipment & Batteries";
      detectedCat = "Electronics and IT Goods (Scheme II — CRS)";
    } else if (lower.includes("toy")) {
      detectedProduct = "Safety of Toys";
      detectedCat = "Toys";
    }

    setProduct(detectedProduct);
    setMaterial(detectedMaterial);
    setIntendedUse(detectedUse);
    setCategory(detectedCat);

    handleSearch(detectedProduct, detectedCat);
  };

  const sampleSpecs = [
    {
      title: "Domestic Pressure Cooker",
      spec: "Manufacturing an aluminium alloy pressure cooker of 5-liter capacity with spring-loaded weight safety valve and gasket release for domestic kitchen cooking."
    },
    {
      title: "Packaged Drinking Water",
      spec: "Setting up a water treatment bottling plant supplying 1-liter sealed PET bottles of purified water treated by reverse osmosis, UV, and ozonation."
    },
    {
      title: "Laptop / Lithium Battery Pack",
      spec: "Importing rechargeable secondary lithium-ion pouch cell battery packs for portable laptop computers and electronic tablets."
    },
    {
      title: "Motorcycle Safety Helmet",
      spec: "Manufacturing protective headgear and protective helmets for two-wheeler motor vehicle riders with polycarbonate visor and chin strap."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Product-to-Standard Discovery Engine • 753+ Grounded Standards</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Product-to-Standard Discovery Engine
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Identify applicable Indian Standards (IS), compulsory Quality Control Orders (QCOs), and test specifications by product name or technical description.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("instant")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "instant"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Instant Database Search</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analyzer")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "analyzer"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Product Spec Analyzer (For MSMEs / Startups)</span>
        </button>
      </div>

      {/* TAB 1: Instant Search */}
      {activeTab === "instant" && (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={instantQuery}
                onChange={(e) => setInstantQuery(e.target.value)}
                placeholder="Type a product name or standard code (e.g., 'pressure cooker', 'IS 269', 'cables', 'toys', 'helmet')..."
                className="w-full pl-12 pr-44 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <VoiceInputButton
                  language={language}
                  disabled={isLoading}
                  onTranscript={(text, isFinal) => {
                    if (isFinal) {
                      setInstantQuery((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !instantQuery.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Sector Filters */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3 text-blue-400" />
                Filter by Industry Sector:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sectors.map((sec, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedSector(sec.value);
                      if (instantQuery.trim()) {
                        handleSearch(instantQuery, sec.value);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      selectedSector === sec.value
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80"
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: AI Product Spec Analyzer */}
      {activeTab === "analyzer" && (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6 backdrop-blur-sm">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Unstructured Product Specification Analyzer</span>
            </h3>
            <p className="text-xs text-slate-400">
              Paste your raw manufacturing description, materials, or technical spec sheet. The assistant will parse attributes and identify the applicable Indian Standard and Quality Control Order.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <textarea
                rows={4}
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder="e.g., We are a startup manufacturing stainless steel domestic pressure cookers of 3L and 5L capacity with fusible plugs for kitchen usage..."
                className="w-full p-4 pr-14 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="absolute right-3 top-3">
                <VoiceInputButton
                  language={language}
                  disabled={isLoading}
                  onTranscript={(text, isFinal) => {
                    if (isFinal) {
                      setSpecText((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Sample Specs:</span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleSpecs.map((sample, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setSpecText(sample.spec)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeSpec}
                disabled={isLoading || !specText.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Analyze Spec & Find Standard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/30">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-200">
            Searching 753 Standards & Gazette Quality Control Orders in Supabase...
          </div>
          <div className="text-xs text-slate-400">
            Executing PostgreSQL Websearch Full-Text Search and pgvector match.
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Matching Indian Standards Found</span>
            </h2>
            <span className="text-xs text-slate-400">
              Retrieved from live Supabase knowledge base
            </span>
          </div>

          <StandardCard data={result} />
        </div>
      )}
    </div>
  );
}
