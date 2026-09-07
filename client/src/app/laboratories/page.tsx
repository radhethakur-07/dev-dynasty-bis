"use client";

import React, { useState } from "react";
import { findTestingLaboratories } from "@/lib/api";
import { LaboratoryResultsResponse, Language, LaboratoryItem } from "@/types/api";
import { LaboratoryTable } from "@/components/responses/LaboratoryTable";
import { 
  FlaskConical, 
  Search, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  ExternalLink, 
  Loader2, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Sparkles
} from "lucide-react";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

export default function LaboratoriesPage() {
  const [productOrTest, setProductOrTest] = useState("Food");
  const [location, setLocation] = useState("Hyderabad");
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LaboratoryResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const indianStates = [
    { label: "All States / Union Territories", value: "" },
    { label: "Delhi (NCR)", value: "Delhi" },
    { label: "Maharashtra", value: "Maharashtra" },
    { label: "Telangana", value: "Telangana" },
    { label: "Karnataka", value: "Karnataka" },
    { label: "Tamil Nadu", value: "Tamil Nadu" },
    { label: "Uttar Pradesh", value: "Uttar Pradesh" },
    { label: "Gujarat", value: "Gujarat" },
    { label: "Haryana", value: "Haryana" },
    { label: "West Bengal", value: "West Bengal" },
    { label: "Rajasthan", value: "Rajasthan" },
    { label: "Kerala", value: "Kerala" },
    { label: "Madhya Pradesh", value: "Madhya Pradesh" },
    { label: "Punjab", value: "Punjab" },
    { label: "Andhra Pradesh", value: "Andhra Pradesh" }
  ];

  const disciplines = [
    { label: "All Disciplines", value: "" },
    { label: "Food & Beverages", value: "Food" },
    { label: "Electrical & Electronics", value: "Electrical" },
    { label: "Cement & Construction", value: "Cement" },
    { label: "Chemical & Materials", value: "Chemical" },
    { label: "Mechanical & Steel", value: "Mechanical" },
    { label: "Power & Energy", value: "Power" },
    { label: "Textiles", value: "Testing" }
  ];

  const presets = [
    { prod: "Food", loc: "Hyderabad", label: "Food Testing in Hyderabad (Intertek)" },
    { prod: "Power", loc: "Bengaluru", label: "Power & Electrical in Bengaluru (CPRI)" },
    { prod: "Industrial", loc: "Delhi", label: "Industrial Research in Delhi (SIIR)" },
    { prod: "Testing", loc: "Noida", label: "Textiles & Materials in Noida (Testtex)" },
    { prod: "Cement", loc: "Hyderabad", label: "Cement Testing in Hyderabad (NCCBM)" },
    { prod: "National", loc: "Ghaziabad", label: "National Test House (NTH Ghaziabad)" }
  ];

  const handleSearch = async (prodOverride?: string, locOverride?: string) => {
    const prod = prodOverride !== undefined ? prodOverride : productOrTest;
    const loc = locOverride !== undefined ? locOverride : location;

    if (!prod.trim() && !loc.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await findTestingLaboratories({
        product_or_test: prod.trim() || undefined,
        location: loc.trim() || undefined,
        language
      });
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to search BIS testing laboratories.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>BIS LIMS Testing Laboratory Directory • 437 Recognized Labs</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          BIS Recognized Testing Laboratories Directory
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Search across 437 testing facilities officially recognized under the BIS Laboratory Information Management System (LIMS). Filter by state, testing discipline, or facility name.
        </p>
      </div>

      {/* Search Filter Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6 backdrop-blur-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Product, Material, or Test Discipline
              </label>
              <div className="relative flex items-center">
                <FlaskConical className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={productOrTest}
                  onChange={(e) => setProductOrTest(e.target.value)}
                  placeholder="e.g., Food, Cement, Electrical, Cable, Pressure Cooker..."
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <VoiceInputButton
                    language={language}
                    disabled={isLoading}
                    onTranscript={(text, isFinal) => {
                      if (isFinal) {
                        setProductOrTest((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Location (City or State)
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Hyderabad, Bengaluru, Delhi, Noida, Mumbai..."
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <VoiceInputButton
                    language={language}
                    disabled={isLoading}
                    onTranscript={(text, isFinal) => {
                      if (isFinal) {
                        setLocation((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3 text-blue-400" />
                Quick Discipline Filters:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {disciplines.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDiscipline(d.value);
                      setProductOrTest(d.value);
                      handleSearch(d.value, location);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      selectedDiscipline === d.value
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!productOrTest.trim() && !location.trim())}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 self-end"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Find Laboratories</span>
            </button>
          </div>
        </form>

        {/* Preset Queries */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Verified LIMS Search Scenarios:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  setProductOrTest(p.prod);
                  setLocation(p.loc);
                  handleSearch(p.prod, p.loc);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 hover:text-blue-300 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/30">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-200">
            Searching 437 Recognized Testing Facilities in Supabase LIMS Database...
          </div>
          <div className="text-xs text-slate-400">
            Filtering by location, discipline scope, and official recognition status.
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
      {results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Recognized Testing Laboratories</span>
            </h2>
            <span className="text-xs text-slate-400">
              Official BIS LIMS Accreditation Directory
            </span>
          </div>

          <LaboratoryTable data={results} />
        </div>
      )}
    </div>
  );
}
