import React from "react";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  Search,
  Award,
  CheckCircle,
  FlaskConical,
  BookOpen,
  ArrowRight,
  Lock,
  Cpu,
  Database,
  Layers,
  FileCheck
} from "lucide-react";

export default function LandingPage() {
  const capabilities = [
    {
      title: "Product-to-Standard Discovery",
      description: "Match your manufacturing product or technical specification to applicable Indian Standards (IS) with clear contextual reasons.",
      href: "/finder",
      icon: Search,
      badge: "P0 Core"
    },
    {
      title: "Certification Guidance",
      description: "Navigate ISI Mark, CRS (Scheme II), and FMCS pathways with detailed step-by-step timelines and documentation checklists.",
      href: "/certification",
      icon: Award,
      badge: "Stepwise"
    },
    {
      title: "Hallmarking & HUID Verification",
      description: "Understand the 3 mandatory BIS hallmarks, purity grades (14K to 24K), and how to verify laser-inscribed HUID via BIS CARE.",
      href: "/hallmarking",
      icon: CheckCircle,
      badge: "Purity"
    },
    {
      title: "Testing Laboratory Finder",
      description: "Locate recognized testing laboratories across India filtered by test capability, product category, and state.",
      href: "/laboratories",
      icon: FlaskConical,
      badge: "Directory"
    }
  ];

  const workflowSteps = [
    {
      title: "1. Natural Language Intent",
      detail: "Ask in English or Hindi. The LLM extracts the user's need into typed intent.",
      icon: Cpu
    },
    {
      title: "2. Pydantic Guardrail",
      detail: "Input schemas validate parameters before any backend tool execution.",
      icon: Lock
    },
    {
      title: "3. Controlled Domain Tool",
      detail: "Allowlisted domain tools execute specific business logic; raw SQL is blocked.",
      icon: Layers
    },
    {
      title: "4. pgvector RAG & Citations",
      detail: "Semantic retrieval from Supabase returns grounded evidence with source metadata.",
      icon: Database
    },
    {
      title: "5. Structured UI Rendering",
      detail: "The frontend renders dedicated cards based on response.type, avoiding raw prose.",
      icon: FileCheck
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-[#080c14] to-[#080c14]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Dev Dynasty • Smart India Hackathon (SIH267107)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100">
            AI-Powered Intelligence for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500">
              Indian Standards & BIS Services
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            Empowering MSMEs, startups, manufacturers, and consumers with source-grounded answers, 
            controlled tool execution, and clear certification guidance—free from hallucinated standards or unchecked database queries.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch BIS Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/finder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Find Product Standards</span>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Pydantic-Validated Guardrails
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Supabase pgvector RAG
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Bilingual (English & हिन्दी)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Strict Source Citations
            </span>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Specialized BIS Knowledge Workflows
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Engineered specifically for Bureau of Indian Standards regulatory pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <Link
                key={idx}
                href={cap.href}
                className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/90 hover:border-blue-500/40 transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {cap.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:gap-2 transition-all">
                  <span>Explore Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Controlled Architecture Workflow */}
      <section className="w-full border-t border-slate-900 bg-slate-950/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              How the Assistant Operates
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              The LLM reasons and formats; backend code validates; tools execute; pgvector grounds the answer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/50 space-y-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center">
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
