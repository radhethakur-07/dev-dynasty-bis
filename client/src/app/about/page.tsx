import React from "react";
import Link from "next/link";
import { Shield, CheckCircle, XCircle, AlertTriangle, ArrowRight, Cpu, Database, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Hero */}
      <div className="space-y-4">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
          }}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Project Governance &amp; Boundaries · SIH267107</span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Dev Dynasty — BIS Intelligence Platform
        </h1>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
          Developed for the Smart India Hackathon under problem statement SIH267107 to make Indian Standards
          (IS), conformity schemes, and BIS services easily discoverable through evidence-grounded AI.
        </p>
      </div>

      {/* What it IS vs NOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          className="p-6 rounded-2xl space-y-4"
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--success)" }}>
            <CheckCircle className="w-4 h-4" />
            <span>What the Platform IS</span>
          </div>
          <ul className="space-y-2.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            {[
              "A specialized, domain-controlled BIS intelligence assistant",
              "Grounded in verified BIS knowledge via Supabase pgvector",
              "Enforces strict Pydantic validation on every tool argument",
              "Supports bilingual discovery in English and Hindi",
              "Preserves technical IS codes precisely — no paraphrasing",
              "Displays verifiable source citations with section &amp; page numbers",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: "var(--success)" }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="p-6 rounded-2xl space-y-4"
          style={{
            backgroundColor: "rgba(220, 38, 38, 0.05)",
            border: "1px solid rgba(220, 38, 38, 0.2)",
          }}
        >
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--error)" }}>
            <XCircle className="w-4 h-4" />
            <span>What the Platform is NOT</span>
          </div>
          <ul className="space-y-2.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            {[
              "NOT an open-ended generic chatbot for chitchat or code writing",
              "NOT an official legal certification authority",
              "NEVER executes arbitrary SQL or grants LLM direct DB access",
              "Does NOT fabricate standards, fee structures, or test parameters",
              "Does NOT hallucinate facts when source evidence is missing",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: "var(--error)" }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tech Stack */}
      <div
        className="p-6 rounded-2xl space-y-5"
        style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border)" }}
      >
        <h3 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Cpu className="w-4 h-4" style={{ color: "var(--accent)" }} />
          Technical Architecture
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Globe,
              label: "Frontend",
              detail: "Next.js 14 · React 18 · TypeScript · Tailwind CSS · Framer Motion",
            },
            {
              icon: Cpu,
              label: "AI Backend",
              detail: "FastAPI · Gemini 2.5 Flash · Function Calling · Pydantic v2",
            },
            {
              icon: Database,
              label: "Knowledge Base",
              detail: "Supabase PostgreSQL · pgvector · Cosine similarity · LIMS data",
            },
          ].map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="p-4 rounded-xl space-y-2"
              style={{ backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--accent)" }}>
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Non-fabrication policy */}
      <div
        className="p-6 rounded-2xl space-y-4"
        style={{
          backgroundColor: "rgba(217, 119, 6, 0.05)",
          border: "1px solid rgba(217, 119, 6, 0.2)",
        }}
      >
        <h3 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--warning)" }}>
          <AlertTriangle className="w-4 h-4" />
          Strict Non-Fabrication &amp; Demo Data Policy
        </h3>
        <ul className="space-y-3 text-xs" style={{ color: "var(--text-secondary)" }}>
          {[
            {
              title: "Demo Data Transparency",
              body: `All mock and fixture datasets used for development are explicitly tagged as "Demo / Sample / Not official".`,
            },
            {
              title: "Zero Hallucination Guarantee",
              body: "When source evidence is insufficient, the system returns an explicit insufficient_evidence status rather than guessing.",
            },
            {
              title: "Official Source Verification",
              body: "Final legal determination must be verified through official BIS notifications on bis.gov.in or manakonline.in.",
            },
          ].map((item) => (
            <li key={item.title} className="flex items-start gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: "var(--warning)" }}
              />
              <div>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {item.title}:{" "}
                </span>
                {item.body}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center pt-2">
        <Link
          href="/assistant"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            boxShadow: "0 4px 16px -4px var(--accent)",
          }}
        >
          <span>Try the BIS Assistant</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
