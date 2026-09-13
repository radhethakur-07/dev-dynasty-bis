"use client";

import React, { useState } from "react";
import { searchStandards } from "@/lib/api";
import { StandardRecommendationResponse, Language } from "@/types/api";
import { StandardCard } from "@/components/responses/StandardCard";
import {
  Search,
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

type Tab = "instant" | "analyzer";

const sectors = [
  { label: "All Sectors", value: "" },
  { label: "Cement", value: "cement" },
  { label: "Steel & TMT", value: "steel" },
  { label: "Electrical", value: "electrical" },
  { label: "Electronics (CRS)", value: "electronics" },
  { label: "Toys", value: "toys" },
  { label: "Food & Water", value: "water" },
  { label: "Automotive", value: "helmet" },
  { label: "Gas Cylinders", value: "cylinder" },
];

const sampleSpecs = [
  {
    title: "Pressure Cooker",
    spec: "Manufacturing an aluminium alloy pressure cooker of 5-liter capacity with spring-loaded weight safety valve and gasket release for domestic kitchen cooking.",
  },
  {
    title: "Packaged Water",
    spec: "Setting up a water treatment bottling plant supplying 1-liter sealed PET bottles of purified water treated by reverse osmosis, UV, and ozonation.",
  },
  {
    title: "Laptop Battery",
    spec: "Importing rechargeable secondary lithium-ion pouch cell battery packs for portable laptop computers and electronic tablets.",
  },
  {
    title: "Motorcycle Helmet",
    spec: "Manufacturing protective headgear for two-wheeler motor vehicle riders with polycarbonate visor and chin strap.",
  },
];

export default function StandardsFinderPage() {
  const [activeTab, setActiveTab] = useState<Tab>("instant");
  const [instantQuery, setInstantQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [specText, setSpecText] = useState("");
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [material, setMaterial] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [language] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StandardRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (queryOverride?: string, sectorOverride?: string) => {
    const q = queryOverride !== undefined ? queryOverride : activeTab === "instant" ? instantQuery : product;
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
        language,
      });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to search Indian Standards.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeSpec = () => {
    if (!specText.trim()) return;
    let detectedProduct = specText.split(".")[0].slice(0, 50);
    let detectedMaterial = "";
    let detectedUse = "";
    let detectedCat = "";
    const lower = specText.toLowerCase();
    if (lower.includes("steel")) detectedMaterial = "Stainless Steel / Carbon Steel";
    else if (lower.includes("alumin")) detectedMaterial = "Aluminium Alloy";
    else if (lower.includes("plastic") || lower.includes("polymer")) detectedMaterial = "Polymer / Plastic";
    if (lower.includes("kitchen") || lower.includes("domestic")) detectedUse = "Domestic Household Use";
    else if (lower.includes("industrial")) detectedUse = "Industrial Applications";
    else if (lower.includes("vehicle") || lower.includes("automotive")) detectedUse = "Automotive Road Transport";
    if (lower.includes("cooker") || lower.includes("utensil")) { detectedProduct = "Domestic Pressure Cooker"; detectedCat = "Consumer Goods / Mechanical"; }
    else if (lower.includes("water") || lower.includes("drinking")) { detectedProduct = "Packaged Drinking Water"; detectedCat = "Food / Consumer"; }
    else if (lower.includes("cement") || lower.includes("concrete")) { detectedProduct = "Ordinary Portland Cement"; detectedCat = "Chemicals & Materials"; }
    else if (lower.includes("battery") || lower.includes("laptop")) { detectedProduct = "Information Technology Equipment & Batteries"; detectedCat = "Electronics and IT Goods (Scheme II — CRS)"; }
    else if (lower.includes("toy")) { detectedProduct = "Safety of Toys"; detectedCat = "Toys"; }
    else if (lower.includes("helmet")) { detectedProduct = "Protective Helmet for Motor Vehicles"; detectedCat = "Automotive & Safety"; }
    setProduct(detectedProduct); setMaterial(detectedMaterial); setIntendedUse(detectedUse); setCategory(detectedCat);
    handleSearch(detectedProduct, detectedCat);
  };

  const tabStyle = (id: Tab) =>
    activeTab === id
      ? { backgroundColor: "var(--accent)", color: "#ffffff", boxShadow: "0 2px 8px -2px var(--accent)" }
      : { color: "var(--text-muted)" };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "var(--accent-subtle)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Product-to-Standard Discovery Engine · 753+ IS Codes</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Standards Finder
        </h1>
        <p className="text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
          Identify applicable Indian Standards (IS), compulsory Quality Control Orders (QCOs), and
          test specifications by product name or technical description.
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl w-fit"
        style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border)" }}
        role="tablist"
      >
        {[
          { id: "instant" as Tab, label: "Instant Search", icon: Search },
          { id: "analyzer" as Tab, label: "AI Spec Analyzer", icon: Sparkles },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
            style={tabStyle(id)}
            onMouseEnter={(e) => {
              if (activeTab !== id) (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== id) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div
        className="p-6 sm:p-8 rounded-2xl space-y-5"
        style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border)" }}
      >
        {/* Instant search tab */}
        {activeTab === "instant" && (
          <div className="space-y-5" role="tabpanel">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "var(--text-placeholder)" }} />
                <input
                  type="text"
                  value={instantQuery}
                  onChange={(e) => setInstantQuery(e.target.value)}
                  placeholder="Type a product name or IS code (e.g., 'pressure cooker', 'IS 269', 'toys', 'helmet')..."
                  className="w-full pl-12 pr-32 py-3.5 rounded-xl text-sm focus:outline-none transition-all"
                  style={{ backgroundColor: "var(--surface-base)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)"; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <VoiceInputButton
                    language={language}
                    disabled={isLoading}
                    onTranscript={(text, isFinal) => { if (isFinal) setInstantQuery((prev) => prev.trim() ? `${prev.trim()} ${text}` : text); }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !instantQuery.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
                  >
                    {isLoading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Sector filters */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                  <Filter className="w-3 h-3" style={{ color: "var(--accent)" }} />
                  Filter by Industry Sector
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sectors.map((sec, idx) => {
                    const isActive = selectedSector === sec.value;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setSelectedSector(sec.value); if (instantQuery.trim()) handleSearch(instantQuery, sec.value); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={isActive ? { backgroundColor: "var(--accent)", color: "#ffffff" } : { backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                        onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)"; } }}
                        onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; } }}
                      >
                        {sec.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* AI Spec Analyzer tab */}
        {activeTab === "analyzer" && (
          <div className="space-y-5" role="tabpanel">
            <div className="space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Sparkles className="w-4 h-4" style={{ color: "var(--accent)" }} />
                Unstructured Product Specification Analyzer
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Paste your raw manufacturing description, materials, or technical spec. The assistant will parse attributes and identify the applicable Indian Standard and Quality Control Order.
              </p>
            </div>

            <div className="relative">
              <textarea
                rows={5}
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder="e.g., We are a startup manufacturing stainless steel domestic pressure cookers of 3L and 5L capacity with fusible plugs for kitchen usage..."
                className="w-full p-4 pr-14 rounded-xl text-sm focus:outline-none transition-all resize-none leading-relaxed"
                style={{ backgroundColor: "var(--surface-base)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)"; }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
              />
              <div className="absolute right-3 top-3">
                <VoiceInputButton
                  language={language}
                  disabled={isLoading}
                  onTranscript={(text, isFinal) => { if (isFinal) setSpecText((prev) => prev.trim() ? `${prev.trim()} ${text}` : text); }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs" style={{ color: "var(--text-placeholder)" }}>Sample specs:</span>
                {sampleSpecs.map((s, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => setSpecText(s.spec)}
                    className="px-2 py-0.5 rounded-md text-[11px] transition-all"
                    style={{ backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAnalyzeSpec}
                disabled={isLoading || !specText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
              >
                {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Analyze &amp; Find Standard</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center py-14 gap-4 rounded-2xl" style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <div className="flex gap-1">
            {[0, 150, 300].map((delay) => (
              <span key={delay} className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--accent)", animationDelay: `${delay}ms` }} />
            ))}
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Searching 753+ Indian Standards...</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Executing pgvector similarity search &amp; full-text match</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex items-center gap-2 p-4 rounded-xl text-sm" style={{ backgroundColor: "rgba(220, 38, 38, 0.06)", border: "1px solid rgba(220, 38, 38, 0.2)", color: "var(--error)" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: "var(--success)" }} />
              Matching Indian Standards Found
            </h2>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Retrieved from live Supabase knowledge base</span>
          </div>
          <StandardCard data={result} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !result && !error && (
        <div className="flex flex-col items-center py-14 gap-3 rounded-2xl" style={{ backgroundColor: "var(--surface-raised)", border: "1px dashed var(--border)" }}>
          <BookOpen className="w-10 h-10 opacity-20" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            {activeTab === "instant" ? "Type a product name above to find applicable standards" : "Paste a technical spec above and click Analyze"}
          </p>
        </div>
      )}
    </div>
  );
}
