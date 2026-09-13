"use client";

import React, { useState } from "react";
import { getHallmarkingGuidance } from "@/lib/api";
import { HallmarkingResponse, Language } from "@/types/api";
import { HallmarkingCard } from "@/components/responses/HallmarkingCard";
import {
  CheckCircle,
  Search,
  ShieldCheck,
  Calculator,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Scale,
  QrCode,
} from "lucide-react";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

type Tab = "simulator" | "calculator" | "guidance";

const tabConfig: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "simulator", label: "HUID Simulator", icon: Smartphone },
  { id: "calculator", label: "Purity Calculator", icon: Calculator },
  { id: "guidance", label: "Knowledge Search", icon: Search },
];

export default function HallmarkingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("simulator");

  // HUID Simulator
  const [huidInput, setHuidInput] = useState("KD9821");
  const [simulatedResult, setSimulatedResult] = useState<Record<string, string> | null>(null);

  // Purity Calculator
  const [metal, setMetal] = useState<"gold" | "silver">("gold");
  const [grade, setGrade] = useState("916");
  const [weightGrams, setWeightGrams] = useState<number>(10);

  // Guidance Search
  const [query, setQuery] = useState("");
  const [language] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [guidance, setGuidance] = useState<HallmarkingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulateHUID = (e: React.FormEvent) => {
    e.preventDefault();
    if (!huidInput.trim() || huidInput.trim().length !== 6) return;
    const code = huidInput.trim().toUpperCase();
    setSimulatedResult({
      huid: code,
      status: "AUTHENTIC & VERIFIED",
      metal: code.startsWith("S") ? "Silver (IS 2112:2025)" : "Gold (IS 1417)",
      purity: code.startsWith("S") ? "925 Fine Silver" : "22K (916 Fineness)",
      articleType: "Bangle / Ring Jewellery",
      jeweler: "M/s Tanishq Jewellery Ltd. (BIS CM/L: 8109283)",
      ahcCenter: "National Assaying & Hallmarking Centre, New Delhi (AHC-014)",
      hallmarkedDate: "14-Feb-2026",
      officialApp: "Simulated response — matches official BIS CARE mobile app schema.",
    });
  };

  const handleSearchGuidance = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setGuidance(null);
    try {
      const data = await getHallmarkingGuidance(searchQuery, language);
      setGuidance(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to retrieve hallmarking guidelines.");
    } finally {
      setIsLoading(false);
    }
  };

  const finenessMultiplier =
    metal === "gold"
      ? grade === "999" ? 0.999 : grade === "916" ? 0.916 : grade === "750" ? 0.75 : 0.585
      : grade === "999" ? 0.999 : grade === "925" ? 0.925 : grade === "900" ? 0.9 : 0.8;

  const fineWeight = (weightGrams * finenessMultiplier).toFixed(3);
  const alloyWeight = (weightGrams * (1 - finenessMultiplier)).toFixed(3);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page header */}
      <div className="space-y-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
          }}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>BIS Hallmarking & Consumer Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Hallmarking, HUID Verification &amp; Consumer Rights
        </h1>
        <p className="text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
          Understand mandatory 3-mark gold hallmarking, silver grades under IS&nbsp;2112:2025, simulate
          6-digit laser HUID verification, and calculate precious metal content.
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl w-fit"
        style={{
          backgroundColor: "var(--surface-raised)",
          border: "1px solid var(--border)",
        }}
        role="tablist"
        aria-label="Hallmarking tools"
      >
        {tabConfig.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
              style={
                isActive
                  ? {
                      backgroundColor: "var(--accent)",
                      color: "#ffffff",
                      boxShadow: "0 2px 8px -2px var(--accent)",
                    }
                  : {
                      color: "var(--text-muted)",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div
        className="p-6 sm:p-8 rounded-2xl"
        style={{
          backgroundColor: "var(--surface-raised)",
          border: "1px solid var(--border)",
        }}
      >
        {/* HUID Simulator */}
        {activeTab === "simulator" && (
          <div className="space-y-6" role="tabpanel">
            <div className="space-y-2">
              <h3
                className="text-base font-bold flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <QrCode className="w-4 h-4" style={{ color: "var(--accent)" }} />
                6-Digit HUID Verification Simulator
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Every hallmarked article has a unique laser-etched 6-digit alphanumeric HUID code. Enter any
                6-digit code to simulate the official BIS CARE mobile verification flow.
              </p>
            </div>

            <form onSubmit={handleSimulateHUID} className="flex items-center gap-3 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  value={huidInput}
                  onChange={(e) => setHuidInput(e.target.value.toUpperCase())}
                  placeholder="e.g. KD9821"
                  className="w-full px-4 py-3 pr-12 rounded-xl font-mono tracking-widest text-center text-base font-bold focus:outline-none transition-all"
                  style={{
                    backgroundColor: "var(--surface-base)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                  aria-label="6-digit HUID code"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton
                    language="en"
                    onTranscript={(text, isFinal) => {
                      if (isFinal) {
                        const sanitized = text.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
                        if (sanitized) setHuidInput(sanitized);
                      }
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={huidInput.length !== 6}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px -2px var(--accent)",
                }}
                onMouseEnter={(e) => {
                  if (huidInput.length === 6)
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
                }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify HUID</span>
              </button>
            </form>

            {simulatedResult && (
              <div
                className="p-5 rounded-xl space-y-4 animate-fade-in"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.06)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span
                    className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: "var(--success)" }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {simulatedResult.status}
                  </span>
                  <span
                    className="font-mono text-xs px-2.5 py-1 rounded-lg font-bold"
                    style={{
                      backgroundColor: "var(--accent-subtle)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent-border)",
                    }}
                  >
                    HUID: {simulatedResult.huid}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    ["Precious Metal & Standard", simulatedResult.metal],
                    ["Certified Purity", simulatedResult.purity],
                    ["Jeweler Registration", simulatedResult.jeweler],
                    ["Assaying Centre (AHC)", simulatedResult.ahcCenter],
                  ].map(([label, value]) => (
                    <div key={label} className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        {label}
                      </span>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</p>
                    </div>
                  ))}
                </div>

                <p
                  className="text-[11px] pt-2 border-t"
                  style={{ borderColor: "rgba(16, 185, 129, 0.2)", color: "var(--text-muted)" }}
                >
                  {simulatedResult.officialApp} · Hallmark Date: {simulatedResult.hallmarkedDate}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Purity Calculator */}
        {activeTab === "calculator" && (
          <div className="space-y-6" role="tabpanel">
            <div className="space-y-2">
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Scale className="w-4 h-4" style={{ color: "var(--accent)" }} />
                Precious Metal Purity Calculator
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Calculate fine precious metal content based on certified BIS purity grades (IS 1417 for Gold, IS 2112:2025 for Silver).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Precious Metal",
                  content: (
                    <select
                      value={metal}
                      onChange={(e) => {
                        const m = e.target.value as "gold" | "silver";
                        setMetal(m);
                        setGrade(m === "gold" ? "916" : "925");
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                      style={{
                        backgroundColor: "var(--surface-base)",
                        border: "1.5px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="gold">Gold (IS 1417)</option>
                      <option value="silver">Silver (IS 2112:2025)</option>
                    </select>
                  ),
                },
                {
                  label: "Purity Grade",
                  content: (
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                      style={{
                        backgroundColor: "var(--surface-base)",
                        border: "1.5px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {metal === "gold" ? (
                        <>
                          <option value="999">24K — 999 (99.9% Pure)</option>
                          <option value="916">22K — 916 (91.6% Pure)</option>
                          <option value="750">18K — 750 (75.0% Pure)</option>
                          <option value="585">14K — 585 (58.5% Pure)</option>
                        </>
                      ) : (
                        <>
                          <option value="999">999 (99.9% Pure Silver)</option>
                          <option value="925">925 Sterling Silver (92.5%)</option>
                          <option value="900">900 (90.0% Purity)</option>
                          <option value="800">800 (80.0% Purity)</option>
                        </>
                      )}
                    </select>
                  ),
                },
                {
                  label: "Gross Weight (grams)",
                  content: (
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                      style={{
                        backgroundColor: "var(--surface-base)",
                        border: "1.5px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  ),
                },
              ].map(({ label, content }) => (
                <div key={label} className="space-y-1.5">
                  <label className="block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    {label}
                  </label>
                  {content}
                </div>
              ))}
            </div>

            <div
              className="p-5 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-5"
              style={{
                background: "linear-gradient(135deg, var(--accent-subtle) 0%, var(--surface-overlay) 100%)",
                border: "1px solid var(--accent-border)",
              }}
            >
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Pure Precious Metal Content
                </p>
                <p className="text-3xl font-extrabold" style={{ color: "var(--accent)" }}>
                  {fineWeight}
                  <span className="text-base font-semibold ml-1" style={{ color: "var(--text-muted)" }}>g</span>
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-placeholder)" }}>
                  Net fine weight of precious metal
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Alloy / Non-Precious Weight
                </p>
                <p className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                  {alloyWeight}
                  <span className="text-base font-semibold ml-1" style={{ color: "var(--text-muted)" }}>g</span>
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-placeholder)" }}>
                  Copper / Zinc / hardening alloy
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Search */}
        {activeTab === "guidance" && (
          <div className="space-y-5" role="tabpanel">
            <div className="space-y-2">
              <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Hallmarking Knowledge Search
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Search BIS hallmarking rules, purity grades, verification procedures, and consumer regulations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchGuidance(query)}
                  placeholder="Ask about hallmarking rules, silver grades, consumer testing fees..."
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                  style={{
                    backgroundColor: "var(--surface-base)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton
                    language={language}
                    disabled={isLoading}
                    onTranscript={(text, isFinal) => {
                      if (isFinal) setQuery((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSearchGuidance(query)}
                disabled={isLoading || !query.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Search</span>
              </button>
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs self-center" style={{ color: "var(--text-placeholder)" }}>Quick:</span>
              {[
                "Mandatory 3 marks on gold jewellery",
                "Silver hallmarking IS 2112:2025",
                "Assaying Centre testing fee",
                "Statutory compensation substandard gold",
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setQuery(preset); handleSearchGuidance(preset); }}
                  className="px-2.5 py-1 rounded-lg text-xs transition-all"
                  style={{
                    backgroundColor: "var(--surface-overlay)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: "var(--accent)", animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Searching hallmarking regulations...
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 p-4 rounded-xl text-sm"
                style={{
                  backgroundColor: "rgba(220, 38, 38, 0.06)",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  color: "var(--error)",
                }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Results */}
            {guidance && !isLoading && <HallmarkingCard data={guidance} />}

            {/* Empty state */}
            {!isLoading && !guidance && !error && (
              <div
                className="flex flex-col items-center py-12 gap-3 rounded-xl"
                style={{
                  backgroundColor: "var(--surface-base)",
                  border: "1px dashed var(--border)",
                  color: "var(--text-placeholder)",
                }}
              >
                <Search className="w-8 h-8 opacity-30" />
                <p className="text-sm">Enter a query above to search hallmarking knowledge</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statutory Consumer Rights Banner */}
      <div
        className="p-5 rounded-2xl space-y-2"
        style={{
          backgroundColor: "rgba(217, 119, 6, 0.06)",
          border: "1px solid rgba(217, 119, 6, 0.2)",
        }}
      >
        <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--warning)" }}>
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Consumer Protection — Section 49, BIS Act 2016</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          If hallmarked precious metal jewellery is tested at a BIS recognized Assaying &amp; Hallmarking Centre
          (AHC) and found to be of lesser purity than marked, you are legally entitled to{" "}
          <strong style={{ color: "var(--warning)" }}>2× compensation</strong> of the purity difference value
          from the registered jeweler, plus reimbursement of testing fees.
        </p>
      </div>
    </div>
  );
}
