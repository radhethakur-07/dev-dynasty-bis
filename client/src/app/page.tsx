"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Shield,
  Sparkles,
  Search,
  Award,
  CheckCircle,
  FlaskConical,
  BookOpen,
  ArrowRight,
  Database,
  Layers,
  Cpu,
  CheckCircle2,
  Building2,
  Rocket,
  Users,
  GraduationCap,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

export default function LandingPage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, token, router]);

  if (isLoading || !token) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/assistant?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const personas = [
    {
      id: "msme",
      title: "MSMEs & Manufacturers",
      icon: Building2,
      badge: "Industry",
      color: "from-blue-600/20 to-indigo-600/20 border-blue-500/30",
      description: "Discover whether your product falls under mandatory Quality Control Orders (QCOs), determine Scheme I (ISI Mark) requirements, and understand in-house testing (SIT).",
      action: "Find Applicable Standard",
      href: "/finder"
    },
    {
      id: "startups",
      title: "Startups & Importers",
      icon: Rocket,
      badge: "Fast-Track",
      color: "from-purple-600/20 to-pink-600/20 border-purple-500/30",
      description: "Fast-track electronics and IT products under Scheme II (CRS) with 90-day lab test reports without factory audits, or navigate FMCS for foreign manufacturing.",
      action: "Explore CRS & FMCS",
      href: "/certification"
    },
    {
      id: "consumers",
      title: "Consumers & Buyers",
      icon: Users,
      badge: "Public Protection",
      color: "from-amber-600/20 to-orange-600/20 border-amber-500/30",
      description: "Verify 6-digit laser HUID on gold/silver jewellery, check hallmarking authenticity, understand 2x compensation rights under BIS Act 2016, and use BIS CARE.",
      action: "Verify Hallmarking & HUID",
      href: "/hallmarking"
    },
    {
      id: "students",
      title: "Students & Researchers",
      icon: GraduationCap,
      badge: "Academics",
      color: "from-emerald-600/20 to-teal-600/20 border-emerald-500/30",
      description: "Explore technical standards across 20+ sectors, find recognized testing facilities for material testing, and learn about Standards Clubs.",
      action: "Browse Laboratories",
      href: "/laboratories"
    }
  ];

  const suggestedQueries = [
    "Domestic Pressure Cooker IS 2347",
    "Packaged Drinking Water IS 14543",
    "Laptop & Tablets CRS Scheme II",
    "Gold 6-digit HUID verification",
    "Cement testing laboratory in Hyderabad",
    "Helmet for two wheeler riders IS 4151"
  ];

  const metrics = [
    { label: "Verified Indian Standards", value: "753+", sub: "Live Ingested from bis.gov.in" },
    { label: "Recognized Testing Labs", value: "437+", sub: "Official BIS LIMS directory" },
    { label: "Conformity Schemes", value: "6 Schemes", sub: "Scheme I, II, IV, X, FMCS, VI" },
    { label: "Grounded Integrity", value: "100%", sub: "Zero synthetic / hallucinated data" }
  ];

  const capabilities = [
    {
      title: "Product-to-Standard Discovery",
      description: "Search 753+ compulsory and active Indian Standards (IS) with full QCO gazette notification links and automated attribute matching.",
      href: "/finder",
      icon: Search,
      badge: "753+ Standards"
    },
    {
      title: "Certification Navigator",
      description: "Step-by-step pathways for Scheme I (ISI), Scheme II (CRS), Scheme IV (CoC), Scheme X (Machinery), and FMCS with side-by-side scheme comparison.",
      href: "/certification",
      icon: Award,
      badge: "5 Schemes"
    },
    {
      title: "Hallmarking & HUID Hub",
      description: "Interactive 6-digit HUID verification simulator, Gold & Silver purity calculator (IS 1417 & IS 2112:2025), and consumer statutory protection rights.",
      href: "/hallmarking",
      icon: CheckCircle,
      badge: "HUID Simulator"
    },
    {
      title: "Testing Laboratories Directory",
      description: "Filter 437 officially recognized testing facilities by State (all 28 states), city, and discipline with direct links to official LIMS scopes.",
      href: "/laboratories",
      icon: FlaskConical,
      badge: "437 LIMS Labs"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-16 pb-12 md:pt-24 md:pb-20 border-b border-slate-200 dark:border-slate-900 bg-gradient-to-b from-slate-50 via-blue-50/20 to-white dark:from-slate-950 dark:via-[#060911] dark:to-[#080c14]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* SIH Problem Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Smart India Hackathon (SIH267107) • AI-Powered BIS Intelligence Assistant</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Intelligent AI Assistant for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-500">
              Indian Standards & BIS Services
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Eliminating the struggle of navigating fragmented PDFs and portals. Get instant, source-backed answers on applicable Indian Standards, mandatory QCOs, licensing pathways, HUID hallmarking, and testing laboratories.
          </p>

          {/* Interactive Live Hero Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <form onSubmit={handleHeroSubmit} className="relative flex items-center">
              <div className="relative w-full flex items-center">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Ask any query e.g. 'Standard for packaged drinking water' or 'IS 2347'..."
                  className="w-full pl-12 pr-44 py-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xl"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <VoiceInputButton
                    language="en"
                    onTranscript={(text, isFinal) => {
                      if (isFinal) {
                        setHeroSearch((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Try asking:</span>
              {suggestedQueries.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => router.push(`/assistant?q=${encodeURIComponent(q)}`)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 text-[11px] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Conversational Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/finder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-semibold transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Product-to-Standard Engine</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Knowledge Base Metrics Bar */}
      <section className="w-full border-b border-slate-200 dark:border-slate-900 bg-slate-50/80 dark:bg-slate-950/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {metrics.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 text-center space-y-1 shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">{m.value}</div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">{m.label}</div>
                <div className="text-[10px] text-slate-500">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personas Section — Tailored for MSMEs, Startups, Consumers & Students */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Tailored For Every Stakeholder
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Who Benefits from BIS Intelligence?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Directly addressing the user struggles highlighted in the Smart India Hackathon problem statement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <div
                key={persona.id}
                className={`p-6 rounded-2xl border bg-white dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${persona.color} hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-slate-300 bg-blue-100/80 dark:bg-slate-800/90 border border-blue-200/60 dark:border-transparent px-2 py-0.5 rounded">
                      {persona.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{persona.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{persona.description}</p>
                </div>

                <Link
                  href={persona.href}
                  className="inline-flex items-center justify-between pt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group"
                >
                  <span>{persona.action}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 dark:border-slate-900">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Dedicated Workflows
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Comprehensive BIS Domain Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <Link
                key={idx}
                href={cap.href}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/90 hover:border-blue-500/40 transition-all group flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-transparent px-2 py-0.5 rounded">
                      {cap.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Controlled Architecture Workflow */}
      <section className="w-full border-t border-slate-200 dark:border-slate-900 bg-slate-50/60 dark:bg-slate-950/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Technical Rigor
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Why Dev Dynasty SIH267107 is Enterprise-Ready
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Real-time database search across 753 standards, Pydantic type safety, and zero synthetic data in production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">1. Typed Intent Routing</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Queries are categorized into typed domain intents with strict tool allowlists; out-of-scope queries are blocked before database execution.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">2. Supabase pgvector RAG</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                768-dimensional Gemini embeddings stored in PostgreSQL with HNSW indexing and PostgreSQL Websearch Full-Text Search (WFTS).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">3. Verified Official Provenance</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Every response preserves exact Government Gazette notification numbers, dates, and official LIMS laboratory scope endpoints.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">4. Multilingual & Hinglish</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Full support for English, pure Hindi (हिन्दी), and natural conversational Hinglish as used by Indian MSMEs and consumers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
