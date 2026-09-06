"use client";

import React, { useState } from "react";
import { getCertificationGuidance } from "@/lib/api";
import { CertificationGuidanceResponse, Language } from "@/types/api";
import { CertificationSteps } from "@/components/responses/CertificationSteps";
import { 
  Award, 
  Search, 
  Loader2, 
  Layers, 
  Cpu, 
  PackageCheck, 
  Factory, 
  Globe2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Check,
  X
} from "lucide-react";

interface SupportedScheme {
  id: string;
  name: string;
  short_name: string;
  badge: string;
  default_product: string;
  description: string;
  icon: any;
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
    typical_timeline: "30 days (Simplified) to 90 days (Normal)",
    target_audience: "Domestic manufacturers of mandated products"
  },
  {
    id: "scheme_2",
    name: "Scheme II — Compulsory Registration Scheme (CRS)",
    short_name: "Scheme II (CRS)",
    badge: "Lab Test Report Only (No Factory Audit)",
    default_product: "Laptops & Electronic Tablets",
    description: "Self-declaration of conformity for notified Electronics, IT, and Solar goods based solely on a valid test report (issued within 90 days) from a BIS recognized lab.",
    icon: Cpu,
    audit_required: false,
    testing_model: "Test report from BIS recognized lab (within 90 days)",
    typical_timeline: "15 to 20 working days",
    target_audience: "Electronics & IT manufacturers and importers"
  },
  {
    id: "scheme_4",
    name: "Scheme IV — Certificate of Conformity (CoC)",
    short_name: "Scheme IV (CoC)",
    badge: "Batch / Consignment Clearance",
    default_product: "Imported Structural Steel Consignment",
    description: "Consignment-bound certification where each individual batch or consignment is sampled and tested independently, without a continuous factory license.",
    icon: PackageCheck,
    audit_required: false,
    testing_model: "Batch-specific sampling and destructive testing",
    typical_timeline: "Per consignment clearance",
    target_audience: "One-time importers & customized project suppliers"
  },
  {
    id: "scheme_x",
    name: "Scheme X — Industrial Equipment Certification",
    short_name: "Scheme X",
    badge: "Type-Testing + Technical File",
    default_product: "Low-Voltage Switchgear & Industrial Machinery",
    description: "Comprehensive certification for heavy industrial machinery, switchgear, transformers, and rotating electrical plant governed by Gazette S.O. 4531(E).",
    icon: Layers,
    audit_required: true,
    testing_model: "Type-testing + Technical Construction File (TCF)",
    typical_timeline: "60 to 120 days",
    target_audience: "Heavy engineering & machinery manufacturers"
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
    typical_timeline: "3 to 6 months",
    target_audience: "Overseas manufacturers exporting to India"
  }
];

export default function CertificationPage() {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("scheme_1");
  const [productSearch, setProductSearch] = useState("");
  const [language, setLanguage] = useState<Language>("en");
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
    } catch (err: any) {
      setError(err.message || "Failed to retrieve official certification guidance.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>BIS Conformity Assessment Navigator • 5 Authorized Schemes</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          BIS Certification Pathways & Schemes Navigator
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Compare conformity assessment schemes, understand mandatory factory audit requirements vs laboratory-only testing, and generate official step-by-step licensing roadmaps.
        </p>
      </div>

      {/* Interactive Scheme Cards Selector */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {SUPPORTED_SCHEMES.map((scheme) => {
          const Icon = scheme.icon;
          const isSelected = selectedSchemeId === scheme.id;
          return (
            <button
              key={scheme.id}
              type="button"
              onClick={() => {
                setSelectedSchemeId(scheme.id);
                handleFetchGuidance(scheme);
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]"
                  : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700"
              }`}
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-100 line-clamp-2">
                  {scheme.short_name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {scheme.badge}
                </div>
              </div>

              <div className="text-[10px] font-semibold text-blue-400 flex items-center gap-1">
                <span>{isSelected ? "Active View" : "Select Scheme"}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Side-by-Side Scheme Comparison Matrix */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Interactive Scheme Comparison Matrix (SIH Decision Guide)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            {showMatrix ? "Hide Matrix" : "Show Full Comparison"}
          </button>
        </div>

        {showMatrix && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Scheme</th>
                  <th className="py-3 px-3">Factory Audit?</th>
                  <th className="py-3 px-3">Testing Model</th>
                  <th className="py-3 px-3">Typical Timeline</th>
                  <th className="py-3 px-3">Target Sector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {SUPPORTED_SCHEMES.map((s) => (
                  <tr
                    key={s.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      selectedSchemeId === s.id ? "bg-blue-950/20 font-medium" : ""
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      {s.short_name}
                    </td>
                    <td className="py-3 px-3">
                      {s.audit_required ? (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Check className="w-3.5 h-3.5" /> Mandatory
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <X className="w-3.5 h-3.5" /> Exempt
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{s.testing_model}</td>
                    <td className="py-3 px-3 text-slate-400">{s.typical_timeline}</td>
                    <td className="py-3 px-3 text-slate-400">{s.target_audience}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Query Bar for Specific Product */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
        <div className="text-xs font-bold text-slate-200">
          Generate Procedural Guidance for: <span className="text-blue-400 font-extrabold">{selectedScheme.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder={`Enter specific product (Default: '${selectedScheme.default_product}')...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => handleFetchGuidance()}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 flex-shrink-0"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
            <span>Get Roadmap</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/30">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-200">
            Querying Official BIS Regulations & Conformity Guidelines in Supabase...
          </div>
          <div className="text-xs text-slate-400">
            Retrieving grounded phase timelines, documentation checklists, and SIT requirements.
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

      {/* Guidance Roadmap */}
      {guidance && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Grounded Certification Roadmap</span>
            </h2>
            <span className="text-xs text-slate-400">
              Source: Bureau of Indian Standards Official Regulations
            </span>
          </div>

          <CertificationSteps data={guidance} />
        </div>
      )}
    </div>
  );
}
