"use client";

import React, { useState } from "react";
import { getHallmarkingGuidance } from "@/lib/api";
import { HallmarkingResponse, Language } from "@/types/api";
import { HallmarkingCard } from "@/components/responses/HallmarkingCard";
import { 
  CheckCircle, 
  Search, 
  Loader2, 
  ShieldCheck, 
  Calculator, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Award,
  Scale,
  ExternalLink,
  QrCode
} from "lucide-react";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

export default function HallmarkingPage() {
  const [activeTab, setActiveTab] = useState<"simulator" | "calculator" | "guidance">("simulator");
  
  // HUID Simulator State
  const [huidInput, setHuidInput] = useState("KD9821");
  const [simulatedResult, setSimulatedResult] = useState<any | null>(null);
  
  // Purity Calculator State
  const [metal, setMetal] = useState<"gold" | "silver">("gold");
  const [grade, setGrade] = useState("916");
  const [weightGrams, setWeightGrams] = useState<number>(10);
  
  // Guidance Search State
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<Language>("en");
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
      officialApp: "Simulated response matching official BIS CARE mobile app schema."
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
    } catch (err: any) {
      setError(err.message || "Failed to retrieve hallmarking guidelines.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compute fine weight
  const finenessMultiplier = metal === "gold"
    ? (grade === "999" ? 0.999 : grade === "916" ? 0.916 : grade === "750" ? 0.750 : 0.585)
    : (grade === "999" ? 0.999 : grade === "925" ? 0.925 : grade === "900" ? 0.900 : 0.800);
  
  const fineWeight = (weightGrams * finenessMultiplier).toFixed(3);
  const alloyWeight = (weightGrams * (1 - finenessMultiplier)).toFixed(3);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>BIS Hallmarking & Consumer Protection Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Hallmarking, HUID Verification & Consumer Protection
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Understand mandatory 3-mark gold hallmarking, revised silver hallmarking (IS 2112:2025), simulate 6-digit laser HUID verification, and calculate pure precious metal contents.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "simulator"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>BIS Care HUID Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("calculator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "calculator"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Purity & Content Calculator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("guidance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "guidance"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Knowledge & Rules Search</span>
        </button>
      </div>

      {/* TAB 1: 6-Digit HUID Simulator */}
      {activeTab === "simulator" && (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6 backdrop-blur-sm">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>Interactive 6-Digit HUID Verification Simulator</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every hallmarked article has a unique laser-etched 6-digit alphanumeric Hallmarking Unique Identification (HUID) code. Enter any 6-digit code to simulate the official BIS CARE mobile verification flow.
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
                className="w-full px-4 py-2.5 pr-12 rounded-xl bg-slate-950/80 border border-slate-700 text-base font-mono tracking-widest text-center text-slate-100 uppercase focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 flex-shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify HUID</span>
            </button>
          </form>

          {simulatedResult && (
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {simulatedResult.status}
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                  HUID: {simulatedResult.huid}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Precious Metal & Standard: </span>
                  <strong className="text-slate-200">{simulatedResult.metal}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Certified Purity: </span>
                  <strong className="text-emerald-300">{simulatedResult.purity}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Jeweler Registration: </span>
                  <strong className="text-slate-200">{simulatedResult.jeweler}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Assaying Centre (AHC): </span>
                  <strong className="text-slate-200">{simulatedResult.ahcCenter}</strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-emerald-500/20 pt-2 flex items-center justify-between">
                <span>{simulatedResult.officialApp}</span>
                <span className="text-slate-500">Hallmark Date: {simulatedResult.hallmarkedDate}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Purity Calculator */}
      {activeTab === "calculator" && (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6 backdrop-blur-sm">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <span>Official Precious Metal Purity Calculator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Calculate fine precious metal content based on certified BIS purity grades (IS 1417 for Gold, IS 2112:2025 for Silver).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Precious Metal</label>
              <select
                value={metal}
                onChange={(e) => {
                  const m = e.target.value as any;
                  setMetal(m);
                  setGrade(m === "gold" ? "916" : "925");
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
              >
                <option value="gold">Gold (IS 1417)</option>
                <option value="silver">Silver (IS 2112:2025)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Purity Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
              >
                {metal === "gold" ? (
                  <>
                    <option value="999">24K (999 Fineness — 99.9% Pure)</option>
                    <option value="916">22K (916 Fineness — 91.6% Pure)</option>
                    <option value="750">18K (750 Fineness — 75.0% Pure)</option>
                    <option value="585">14K (585 Fineness — 58.5% Pure)</option>
                  </>
                ) : (
                  <>
                    <option value="999">999 (99.9% Pure Silver)</option>
                    <option value="925">925 (Sterling Silver — 92.5%)</option>
                    <option value="900">900 (90.0% Purity)</option>
                    <option value="800">800 (80.0% Purity)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gross Weight (Grams)</label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={weightGrams}
                onChange={(e) => setWeightGrams(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-900/40 bg-blue-950/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] text-slate-400">Pure Precious Metal Content:</div>
              <div className="text-2xl font-extrabold text-blue-400">{fineWeight} grams</div>
              <div className="text-[10px] text-slate-500">Net fine weight of precious metal</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Alloy / Non-Precious Weight:</div>
              <div className="text-2xl font-extrabold text-slate-300">{alloyWeight} grams</div>
              <div className="text-[10px] text-slate-500">Copper / Zinc / hardening alloy</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Knowledge & Rules Search */}
      {activeTab === "guidance" && (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about hallmarking rules, silver grades, consumer testing fees..."
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <VoiceInputButton
                  language={language}
                  disabled={isLoading}
                  onTranscript={(text, isFinal) => {
                    if (isFinal) {
                      setQuery((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
                    }
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSearchGuidance(query)}
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search Rules</span>
            </button>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-slate-400">Popular Queries:</span>
            {[
              "Mandatory 3 marks on gold jewellery",
              "Silver hallmarking under IS 2112:2025",
              "Testing jewellery at Assaying Centre fee",
              "Statutory compensation for substandard gold"
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(preset);
                  handleSearchGuidance(preset);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="p-8 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
              <div className="text-xs text-slate-400">Searching Hallmarking Regulations in Supabase...</div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 text-xs">
              {error}
            </div>
          )}

          {guidance && <HallmarkingCard data={guidance} />}
        </div>
      )}

      {/* Statutory Consumer Rights Banner under BIS Act 2016 */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-950/15 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Consumer Protection Under Section 49, BIS Act 2016</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          If hallmarked precious metal jewellery is tested at a BIS recognized Assaying & Hallmarking Centre (AHC) and determined to be of lesser purity than marked, the consumer is legally entitled to compensation of <strong className="text-amber-300 font-semibold">2 times the difference in purity value</strong> from the registered jeweler, plus reimbursement of testing fees.
        </p>
      </div>
    </div>
  );
}
