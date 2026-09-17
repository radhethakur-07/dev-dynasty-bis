"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Cpu,
  CheckCircle2,
  Building2,
  Rocket,
  Users,
  GraduationCap,
  ChevronRight
} from "lucide-react";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

/* ——— Small seal SVG used in hero badge ——— */
const SealBadge: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <path d="M18 3L4 8.5V18c0 7.5 5.8 14.2 14 16 8.2-1.8 14-8.5 14-16V8.5L18 3Z" fill="#253878" />
    <text x="18" y="22" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Georgia,serif" fill="#B8860B" letterSpacing="0.5">IS</text>
  </svg>
);

/* ——— Animated count-up stat ——— */
const CountUp: React.FC<{ target: string; duration?: number }> = ({ target, duration = 1200 }) => {
  const [displayed, setDisplayed] = useState("0");
  const hasRun = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true;
        // Parse numeric prefix
        const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
        const suffix = target.replace(/[0-9.]/g, "");
        if (isNaN(numeric)) { setDisplayed(target); return; }
        const steps = 40;
        const stepTime = duration / steps;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = Math.round(eased * numeric);
          setDisplayed(`${val}${suffix}`);
          if (step >= steps) clearInterval(timer);
        }, stepTime);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{displayed}</span>;
};

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
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--surface-base)" }}
      >
        <div className="flex gap-1">
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: "var(--accent)", animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    );
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
      accentColor: "#253878",
      description: "Discover whether your product falls under mandatory Quality Control Orders (QCOs), determine Scheme I (ISI Mark) requirements, and understand in-house testing (SIT).",
      action: "Find Applicable Standard",
      href: "/finder"
    },
    {
      id: "startups",
      title: "Startups & Importers",
      icon: Rocket,
      badge: "Fast-Track",
      accentColor: "#B8860B",
      description: "Fast-track electronics and IT products under Scheme II (CRS) with 90-day lab test reports without factory audits, or navigate FMCS for foreign manufacturing.",
      action: "Explore CRS & FMCS",
      href: "/certification"
    },
    {
      id: "consumers",
      title: "Consumers & Buyers",
      icon: Users,
      badge: "Public Protection",
      accentColor: "#B8860B",
      description: "Verify 6-digit laser HUID on gold/silver jewellery, check hallmarking authenticity, understand 2x compensation rights under BIS Act 2016, and use BIS CARE.",
      action: "Verify Hallmarking & HUID",
      href: "/hallmarking"
    },
    {
      id: "students",
      title: "Students & Researchers",
      icon: GraduationCap,
      badge: "Academics",
      accentColor: "#253878",
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
    { label: "Conformity Schemes", value: "6+", sub: "Scheme I, II, IV, X, FMCS, VI" },
    { label: "Grounded Integrity", value: "100%", sub: "Zero synthetic / hallucinated data" }
  ];

  const capabilities = [
    {
      title: "Product-to-Standard Discovery",
      description: "Search 753+ compulsory and active Indian Standards (IS) with full QCO gazette notification links and automated attribute matching.",
      href: "/finder",
      icon: Search,
      badge: "753+ Standards",
      isLarge: true,
    },
    {
      title: "Certification Navigator",
      description: "Step-by-step pathways for Scheme I (ISI), Scheme II (CRS), Scheme IV (CoC), Scheme X (Machinery), and FMCS.",
      href: "/certification",
      icon: Award,
      badge: "5 Schemes",
      isLarge: false,
    },
    {
      title: "Hallmarking & HUID Hub",
      description: "Interactive 6-digit HUID verification simulator, Gold & Silver purity calculator, and consumer statutory protection.",
      href: "/hallmarking",
      icon: CheckCircle,
      badge: "HUID Simulator",
      isLarge: false,
    },
    {
      title: "Testing Laboratories Directory",
      description: "Filter 437 officially recognized testing facilities by State, city, and discipline with direct LIMS links.",
      href: "/laboratories",
      icon: FlaskConical,
      badge: "437 LIMS Labs",
      isLarge: false,
    }
  ];

  const whySteps = [
    {
      num: "1",
      title: "Typed Intent Routing",
      desc: "Queries are categorized into typed domain intents with strict tool allowlists; out-of-scope queries blocked before DB execution.",
      icon: Cpu,
    },
    {
      num: "2",
      title: "Supabase pgvector RAG",
      desc: "768-dimensional Gemini embeddings stored in PostgreSQL with HNSW indexing and PostgreSQL Websearch Full-Text Search (WFTS).",
      icon: Database,
    },
    {
      num: "3",
      title: "Verified Official Provenance",
      desc: "Every response preserves exact Government Gazette notification numbers, dates, and official LIMS laboratory scope endpoints.",
      icon: Shield,
    },
    {
      num: "4",
      title: "Multilingual & Hinglish",
      desc: "Full support for English, pure Hindi (हिन्दी), and natural conversational Hinglish as used by Indian MSMEs and consumers.",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full">

      {/* ——— HERO SECTION ——— */}
      <section
        className="relative w-full overflow-hidden pt-16 pb-12 md:pt-24 md:pb-20 border-b bg-paper"
        style={{
          borderColor: "var(--border)",
          background: "linear-gradient(160deg, var(--surface-base) 0%, var(--surface-overlay) 100%)",
        }}
      >
        {/* Subtle indigo grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(37,56,120,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,56,120,0.05) 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* SIH Problem Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold"
            style={{
              backgroundColor: "var(--accent-subtle)",
              borderColor: "var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            <SealBadge />
            <span>Smart India Hackathon (SIH267107) · AI-Powered BIS Intelligence Assistant</span>
          </div>

          {/* Main Title — Fraunces display font */}
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Intelligent AI Assistant for{" "}
            <span style={{ color: "var(--accent)" }}>
              Indian Standards &amp; BIS Services
            </span>
          </h1>

          <p
            className="max-w-3xl mx-auto text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Eliminating the struggle of navigating fragmented PDFs and portals. Get instant, source-backed answers on applicable Indian Standards, mandatory QCOs, licensing pathways, HUID hallmarking, and testing laboratories.
          </p>

          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <form onSubmit={handleHeroSubmit} className="relative flex items-center">
              <div className="relative w-full flex items-center">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Ask any query e.g. 'Standard for packaged drinking water' or 'IS 2347'..."
                  className="w-full pl-12 pr-44 py-3.5 text-sm focus:outline-none shadow-xl"
                  style={{
                    borderRadius: "1rem",
                    backgroundColor: "var(--surface-raised)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.05)";
                  }}
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
                    className="px-4 py-2 text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                    style={{
                      borderRadius: "0.75rem",
                      backgroundColor: "var(--accent)",
                      boxShadow: "0 4px 14px -2px rgba(37,56,120,0.4)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
              <span className="text-[11px] font-medium mr-1" style={{ color: "var(--text-muted)" }}>Try asking:</span>
              {suggestedQueries.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => router.push(`/assistant?q=${encodeURIComponent(q)}`)}
                  className="px-2.5 py-1 text-[11px] transition-all shadow-sm active:scale-95"
                  style={{
                    borderRadius: "0.5rem",
                    backgroundColor: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--gold)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }}
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
              className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95"
              style={{
                borderRadius: "0.875rem",
                backgroundColor: "var(--accent)",
                boxShadow: "0 6px 20px -4px rgba(37,56,120,0.45)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Conversational Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/finder"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors shadow-sm"
              style={{
                borderRadius: "0.875rem",
                backgroundColor: "var(--surface-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Product-to-Standard Engine</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ——— ANIMATED METRICS STRIP ——— */}
      <section
        className="w-full border-b py-8"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface-overlay)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ backgroundColor: "var(--border)" }}>
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-6 text-center space-y-1"
                style={{ backgroundColor: "var(--surface-overlay)" }}
              >
                <div
                  className="text-3xl sm:text-4xl font-extrabold font-display"
                  style={{ color: "var(--accent)" }}
                >
                  <CountUp target={m.value} />
                </div>
                <div className="text-xs font-semibold" style={{ color: "var(--gold)" }}>{m.label}</div>
                <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— PERSONAS — accent-bar card grid ——— */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-10">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--gold)" }}
          >
            Tailored For Every Stakeholder
          </span>
          <h2
            className="text-2xl sm:text-3xl font-bold font-display"
            style={{ color: "var(--text-primary)" }}
          >
            Who Benefits from BIS Intelligence?
          </h2>
          <p
            className="text-sm max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Directly addressing the user struggles highlighted in the Smart India Hackathon problem statement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona) => {
            const Icon = persona.icon;
            const isGold = persona.accentColor === "#B8860B";
            return (
              <div
                key={persona.id}
                className="flex flex-col justify-between rounded-2xl overflow-hidden shadow-sm hover:shadow-card-hover transition-all"
                style={{
                  backgroundColor: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = isGold ? "var(--gold-border)" : "var(--accent-border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "";
                }}
              >
                {/* Slim 3px top accent bar */}
                <div
                  className="h-[3px] w-full flex-shrink-0"
                  style={{ backgroundColor: isGold ? "var(--gold)" : "var(--accent)" }}
                />
                <div className="p-6 space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: isGold ? "var(--gold-subtle)" : "var(--accent-subtle)",
                        border: `1px solid ${isGold ? "var(--gold-border)" : "var(--accent-border)"}`,
                        color: isGold ? "var(--gold)" : "var(--accent)",
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono"
                      style={{
                        backgroundColor: isGold ? "var(--gold-subtle)" : "var(--accent-subtle)",
                        color: isGold ? "var(--gold)" : "var(--accent)",
                      }}
                    >
                      {persona.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    {persona.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {persona.description}
                  </p>
                </div>

                <Link
                  href={persona.href}
                  className="inline-flex items-center justify-between px-6 pb-5 text-xs font-semibold group"
                  style={{ color: isGold ? "var(--gold)" : "var(--accent)" }}
                >
                  <span>{persona.action}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ——— CAPABILITIES — Asymmetric bento ——— */}
      <section
        className="w-full border-t py-16"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--gold)" }}
            >
              Dedicated Workflows
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold font-display"
              style={{ color: "var(--text-primary)" }}
            >
              Comprehensive BIS Domain Modules
            </h2>
          </div>

          {/* Asymmetric bento: 1 large (spans 2 cols) + 3 standard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              const isLarge = cap.isLarge;
              return (
                <Link
                  key={idx}
                  href={cap.href}
                  className={`group p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all ${
                    isLarge ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""
                  }`}
                  style={{
                    backgroundColor: isLarge ? "var(--accent)" : "var(--surface-raised)",
                    border: `1px solid ${isLarge ? "transparent" : "var(--border)"}`,
                    boxShadow: isLarge ? "0 8px 30px -8px rgba(37,56,120,0.4)" : "0 1px 3px 0 rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLarge) {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-border)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px -2px rgba(184,134,11,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLarge) {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px 0 rgba(0,0,0,0.06)";
                    }
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: isLarge ? "rgba(255,255,255,0.15)" : "var(--gold-subtle)",
                          color: isLarge ? "#ffffff" : "var(--gold)",
                          border: isLarge ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--gold-border)",
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono"
                        style={{
                          backgroundColor: isLarge ? "rgba(255,255,255,0.15)" : "var(--surface-overlay)",
                          color: isLarge ? "#ffffff" : "var(--text-muted)",
                          border: isLarge ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--border)",
                        }}
                      >
                        {cap.badge}
                      </span>
                    </div>
                    <h3
                      className="text-base font-semibold"
                      style={{ color: isLarge ? "#ffffff" : "var(--text-primary)" }}
                    >
                      {cap.title}
                    </h3>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: isLarge ? "rgba(255,255,255,0.75)" : "var(--text-secondary)" }}
                    >
                      {cap.description}
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
                    style={{ color: isLarge ? "#ffffff" : "var(--gold)" }}
                  >
                    <span>Explore Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ——— WHY ENTERPRISE-READY — Horizontal numbered step rail ——— */}
      <section
        className="w-full border-t py-16"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface-overlay)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--gold)" }}
            >
              Technical Rigor
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold font-display"
              style={{ color: "var(--text-primary)" }}
            >
              Why Dev Dynasty SIH267107 is Enterprise-Ready
            </h2>
            <p
              className="text-sm max-w-xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Real-time database search across 753 standards, Pydantic type safety, and zero synthetic data in production.
            </p>
          </div>

          {/* Horizontal numbered step rail */}
          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div
              className="hidden md:block absolute top-7 left-[calc(12.5%-1px)] right-[calc(12.5%-1px)] h-px"
              style={{ backgroundColor: "var(--border-strong)" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
              {whySteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center md:items-start md:text-left">
                    {/* Number circle */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 mb-4 relative z-10"
                      style={{
                        backgroundColor: "var(--accent)",
                        boxShadow: "0 4px 16px -4px rgba(37,56,120,0.45)",
                      }}
                    >
                      <span className="text-lg font-bold text-white font-mono">{step.num}</span>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        {step.title}
                      </h4>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
