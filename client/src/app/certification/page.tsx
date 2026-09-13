"use client";

import React, { useState } from "react";
import { getCertificationGuidance } from "@/lib/api";
import { CertificationGuidanceResponse, Language } from "@/types/api";
import { CertificationSteps } from "@/components/responses/CertificationSteps";
import {
  Award,
  Search,
  Layers,
  Cpu,
  PackageCheck,
  Factory,
  Globe2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SupportedScheme {
  id: string;
  name: string;
  short_name: string;
  badge: string;
  default_product: string;
  description: string;
  icon: React.ElementType;
  audit_required: boolean;
  testing_model: string;
  typical_timeline: string;
  target_audience: string;
}

const SUPPORTED_SCHEMES: SupportedScheme[] = [
  {
    id: "scheme_1",
    name: "Scheme I — Product Certification (ISI Mark)",
    short_name: "Scheme I (ISI Mark)",
    badge: "Factory Audit + In-House Lab",
    default_product: "Domestic Pressure Cooker",
    description: "Standard domestic manufacturing certification requiring established in-house testing facilities, SIT adherence, factory inspection, and independent laboratory testing.",
    icon: Factory,
    audit_required: true,
    testing_model: "In-house lab testing + BIS officer sample testing",
    typical_timeline: "30–90 days",
    target_audience: "Domestic manufacturers of mandated products",
  },
  {
    id: "scheme_2",
    name: "Scheme II — Compulsory Registration (CRS)",
    short_name: "Scheme II (CRS)",
    badge: "Lab Test Report Only — No Factory Audit",
    default_product: "Laptops & Electronic Tablets",
    description: "Self-declaration of conformity for notified Electronics, IT, and Solar goods based solely on a valid test report from a BIS recognized lab.",
    icon: Cpu,
    audit_required: false,
    testing_model: "Test report from BIS recognized lab (within 90 days)",
    typical_timeline: "15–20 working days",
    target_audience: "Electronics & IT manufacturers and importers",
  },
  {
    id: "scheme_4",
    name: "Scheme IV — Certificate of Conformity (CoC)",
    short_name: "Scheme IV (CoC)",
    badge: "Batch / Consignment Clearance",
    default_product: "Imported Structural Steel Consignment",
    description: "Consignment-bound certification where each individual batch is sampled and tested independently, without a continuous factory license.",
    icon: PackageCheck,
    audit_required: false,
    testing_model: "Batch-specific sampling and destructive testing",
    typical_timeline: "Per consignment clearance",
    target_audience: "One-time importers & customized project suppliers",
  },
  {
    id: "scheme_x",
    name: "Scheme X — Industrial Equipment Certification",
    short_name: "Scheme X",
    badge: "Type-Testing + Technical Construction File",
    default_product: "Low-Voltage Switchgear & Industrial Machinery",
    description: "Comprehensive certification for heavy industrial machinery, switchgear, transformers, and rotating electrical plant governed by Gazette S.O. 4531(E).",
    icon: Layers,
    audit_required: true,
    testing_model: "Type-testing + Technical Construction File (TCF)",
    typical_timeline: "60–120 days",
    target_audience: "Heavy engineering & machinery manufacturers",
  },
  {
    id: "fmcs",
    name: "Foreign Manufacturers Certification Scheme (FMCS)",
    short_name: "FMCS (Scheme I)",
    badge: "Overseas Audit + Mandatory AIR",
    default_product: "PVC Cables manufactured abroad",
    description: "Grant of BIS license to overseas manufacturing plants exporting to India. Requires appointment of Authorized Indian Representative (AIR) and Performance Bank Guarantee.",
    icon: Globe2,
    audit_required: true,
    testing_model: "Overseas factory audit + Indian laboratory testing",
    typical_timeline: "3–6 months",
    target_audience: "Overseas manufacturers exporting to India",
  },
];

export default function CertificationPage() {
  const [selectedSchemeId, setSelectedSchemeId] = useState("scheme_1");
  const [productSearch, setProductSearch] = useState("");
  const [language] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [guidance, setGuidance] = useState<CertificationGuidanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMatrix, setShowMatrix] = useState(true);

  const selectedScheme = SUPPORTED_SCHEMES.find((s) => s.id === selectedSchemeId) || SUPPORTED_SCHEMES[0];

  const handleFetchGuidance = async (schemeToUse?: SupportedScheme, productToUse?: string) => {
    const s = schemeToUse || selectedScheme;
    const p = productToUse !== undefined ? productToUse : (productSearch || s.default_product);
    setIsLoading(true);
    setError(null);
    setGuidance(null);
    try {
      const data = await getCertificationGuidance(s.short_name, p, language);
      setGuidance(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to retrieve official certification guidance.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "var(--accent-subtle)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
        >
          <Award className="w-3.5 h-3.5" />
          <span>BIS Conformity Assessment Navigator · 5 Authorized Schemes</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Certification Pathways &amp; Schemes Navigator
        </h1>
        <p className="text-sm max-w-3xl" style={{ color: "var(--text-muted)" }}>
          Compare conformity assessment schemes, understand mandatory factory audit requirements vs
          laboratory-only testing, and generate official step-by-step licensing roadmaps.
        </p>
      </div>

      {/* Scheme selector grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {SUPPORTED_SCHEMES.map((scheme) => {
          const Icon = scheme.icon;
          const isSelected = selectedSchemeId === scheme.id;
          return (
            <button
              key={scheme.id}
              type="button"
              onClick={() => { setSelectedSchemeId(scheme.id); handleFetchGuidance(scheme); }}
              className="p-4 rounded-2xl text-left flex flex-col justify-between gap-3 transition-all duration-150"
              style={
                isSelected
                  ? {
                      backgroundColor: "var(--accent-subtle)",
                      border: "1.5px solid var(--accent)",
                      transform: "scale(1.02)",
                      boxShadow: "0 4px 16px -4px var(--accent)",
                    }
                  : {
                      backgroundColor: "var(--surface-raised)",
                      border: "1px solid var(--border)",
                    }
              }
              onMouseEnter={(e) => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              }}
            >
              <div className="space-y-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent-subtle)", border: "1px solid var(--accent-border)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--accent)" }} />
                </div>
                <div className="text-xs font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
                  {scheme.short_name}
                </div>
                <div className="text-[10px] leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {scheme.badge}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: isSelected ? "var(--accent)" : "var(--text-placeholder)" }}>
                <span>{isSelected ? "Active" : "Select"}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Comparison matrix */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border)" }}
      >
        <button
          type="button"
          onClick={() => setShowMatrix(!showMatrix)}
          className="w-full flex items-center justify-between p-4 text-sm font-semibold transition-colors"
          style={{ color: "var(--text-primary)" }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)"}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = ""}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <span>Interactive Scheme Comparison Matrix</span>
          </div>
          {showMatrix ? (
            <ChevronUp className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          )}
        </button>

        {showMatrix && (
          <div className="overflow-x-auto border-t" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-xs text-left">
              <thead>
                <tr
                  className="text-[10px] uppercase tracking-wider"
                  style={{ backgroundColor: "var(--surface-overlay)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}
                >
                  {["Scheme", "Factory Audit?", "Testing Model", "Typical Timeline", "Target Sector"].map((h) => (
                    <th key={h} className="py-3 px-4 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUPPORTED_SCHEMES.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors"
                    style={{
                      backgroundColor: selectedSchemeId === s.id ? "var(--accent-subtle)" : "",
                      borderBottom: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) => { if (selectedSchemeId !== s.id) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = selectedSchemeId === s.id ? "var(--accent-subtle)" : ""; }}
                  >
                    <td className="py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>{s.short_name}</td>
                    <td className="py-3 px-4">
                      {s.audit_required ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--warning)" }}>
                          <Check className="w-3.5 h-3.5" /> Mandatory
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--success)" }}>
                          <X className="w-3.5 h-3.5" /> Exempt
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>{s.testing_model}</td>
                    <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>{s.typical_timeline}</td>
                    <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>{s.target_audience}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Query bar for product-specific guidance */}
      <div
        className="p-5 rounded-2xl space-y-3"
        style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border)" }}
      >
        <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          Generate Procedural Guidance for:{" "}
          <span className="font-bold" style={{ color: "var(--accent)" }}>{selectedScheme.short_name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--text-placeholder)" }}
            />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchGuidance()}
              placeholder={`Enter product (Default: '${selectedScheme.default_product}')...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
              style={{ backgroundColor: "var(--surface-base)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)"; }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
            />
          </div>
          <button
            type="button"
            onClick={() => handleFetchGuidance()}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
            onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)"; }}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Award className="w-3.5 h-3.5" />
            )}
            <span>Get Roadmap</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          className="flex flex-col items-center py-14 gap-4 rounded-2xl"
          style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border)" }}
        >
          <div className="flex gap-1">
            {[0, 150, 300].map((delay) => (
              <span key={delay} className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--accent)", animationDelay: `${delay}ms` }} />
            ))}
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Querying Official BIS Regulations...</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Retrieving phase timelines, documentation checklists &amp; SIT requirements</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div
          className="flex items-center gap-2 p-4 rounded-xl text-sm"
          style={{ backgroundColor: "rgba(220, 38, 38, 0.06)", border: "1px solid rgba(220, 38, 38, 0.2)", color: "var(--error)" }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {guidance && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: "var(--success)" }} />
              Grounded Certification Roadmap
            </h2>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Source: Bureau of Indian Standards Official Regulations
            </span>
          </div>
          <CertificationSteps data={guidance} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !guidance && !error && (
        <div
          className="flex flex-col items-center py-12 gap-3 rounded-2xl"
          style={{ backgroundColor: "var(--surface-raised)", border: "1px dashed var(--border)" }}
        >
          <Award className="w-10 h-10 opacity-20" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Select a certification scheme above to generate a roadmap
          </p>
        </div>
      )}
    </div>
  );
}
