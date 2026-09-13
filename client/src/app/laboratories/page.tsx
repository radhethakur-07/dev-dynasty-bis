"use client";

import React, { useState } from "react";
import { findTestingLaboratories } from "@/lib/api";
import { LaboratoryResultsResponse, Language } from "@/types/api";
import { LaboratoryTable } from "@/components/responses/LaboratoryTable";
import {
  FlaskConical,
  Search,
  MapPin,
  AlertCircle,
  Filter,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

const disciplines = [
  { label: "All", value: "" },
  { label: "Food & Beverages", value: "Food" },
  { label: "Electrical", value: "Electrical" },
  { label: "Cement & Construction", value: "Cement" },
  { label: "Chemical", value: "Chemical" },
  { label: "Mechanical", value: "Mechanical" },
  { label: "Power & Energy", value: "Power" },
  { label: "Textiles", value: "Textiles" },
];

const presets = [
  { prod: "Food", loc: "Hyderabad", label: "Food Testing in Hyderabad (Intertek)" },
  { prod: "Power", loc: "Bengaluru", label: "Power & Electrical — Bengaluru (CPRI)" },
  { prod: "Industrial", loc: "Delhi", label: "Industrial Research — Delhi (SIIR)" },
  { prod: "Textiles", loc: "Noida", label: "Textiles & Materials — Noida (Testtex)" },
  { prod: "Cement", loc: "Hyderabad", label: "Cement Testing — Hyderabad (NCCBM)" },
  { prod: "National", loc: "Ghaziabad", label: "National Test House — Ghaziabad (NTH)" },
];

export default function LaboratoriesPage() {
  const [productOrTest, setProductOrTest] = useState("Food");
  const [location, setLocation] = useState("Hyderabad");
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [language] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LaboratoryResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        language,
      });
      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to search BIS testing laboratories.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--surface-base)",
    border: "1.5px solid var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
          <FlaskConical className="w-3.5 h-3.5" />
          <span>BIS LIMS Directory · 437 Recognized Labs</span>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          BIS Recognized Testing Laboratories
        </h1>
        <p className="text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
          Search across 437 testing facilities officially recognized under the BIS Laboratory
          Information Management System (LIMS). Filter by state, discipline, or product type.
        </p>
      </div>

      {/* Search Card */}
      <div
        className="p-6 sm:p-8 rounded-2xl space-y-6"
        style={{
          backgroundColor: "var(--surface-raised)",
          border: "1px solid var(--border)",
        }}
      >
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product / Test */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                Product, Material, or Test Discipline
              </label>
              <div className="relative">
                <FlaskConical
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  value={productOrTest}
                  onChange={(e) => setProductOrTest(e.target.value)}
                  placeholder="e.g., Food, Cement, Electrical, Cable..."
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                  style={inputStyle}
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
                      if (isFinal) setProductOrTest((prev) => prev.trim() ? `${prev.trim()} ${text}` : text);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                Location (City or State)
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Hyderabad, Bengaluru, Delhi, Mumbai..."
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                  style={inputStyle}
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
                      if (isFinal) setLocation((prev) => prev.trim() ? `${prev.trim()} ${text}` : text);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Discipline quick filters + submit */}
          <div className="flex flex-wrap items-start justify-between gap-4 pt-1">
            <div className="space-y-2 flex-1">
              <div
                className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                style={{ color: "var(--text-muted)" }}
              >
                <Filter className="w-3 h-3" style={{ color: "var(--accent)" }} />
                Quick Discipline Filters
              </div>
              <div className="flex flex-wrap gap-1.5">
                {disciplines.map((d, idx) => {
                  const isActive = selectedDiscipline === d.value;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedDiscipline(d.value);
                        setProductOrTest(d.value);
                        handleSearch(d.value, location);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={
                        isActive
                          ? {
                              backgroundColor: "var(--accent)",
                              color: "#ffffff",
                            }
                          : {
                              backgroundColor: "var(--surface-overlay)",
                              border: "1px solid var(--border)",
                              color: "var(--text-muted)",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                        }
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!productOrTest.trim() && !location.trim())}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed self-end"
              style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
              onMouseEnter={(e) => {
                if (!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
              }}
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Find Laboratories</span>
            </button>
          </div>
        </form>

        {/* Preset scenarios */}
        <div
          className="pt-5 border-t space-y-3"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Verified LIMS Search Scenarios
          </p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  setProductOrTest(p.prod);
                  setLocation(p.loc);
                  handleSearch(p.prod, p.loc);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all"
                style={{
                  backgroundColor: "var(--surface-overlay)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-subtle)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
                }}
              >
                <Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          className="flex flex-col items-center py-16 gap-4 rounded-2xl"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex gap-1">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-2.5 h-2.5 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--accent)", animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Searching 437 Recognized Testing Facilities...
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Filtering by location, discipline scope &amp; accreditation status
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
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
      {results && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2
              className="text-base font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <CheckCircle2 className="w-4 h-4" style={{ color: "var(--success)" }} />
              BIS Recognized Laboratories
            </h2>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Official BIS LIMS Accreditation Directory
            </span>
          </div>
          <LaboratoryTable data={results} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !results && !error && (
        <div
          className="flex flex-col items-center py-16 gap-3 rounded-2xl"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px dashed var(--border)",
          }}
        >
          <FlaskConical className="w-10 h-10 opacity-20" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Enter a product type and/or location to search for labs
          </p>
          <p className="text-xs" style={{ color: "var(--text-placeholder)" }}>
            Or click one of the preset scenarios above
          </p>
        </div>
      )}
    </div>
  );
}
