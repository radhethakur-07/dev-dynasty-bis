"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { loginUser } from "@/lib/api";
import { Shield, AlertCircle, CheckCircle, Eye, EyeOff, Lock, Zap, BookOpen } from "lucide-react";

/* ——— Left panel seal SVG ——— */
const LargeSeal: React.FC = () => (
  <svg width="72" height="72" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <path d="M18 3L4 8.5V18c0 7.5 5.8 14.2 14 16 8.2-1.8 14-8.5 14-16V8.5L18 3Z" fill="rgba(255,255,255,0.15)" />
    <path d="M18 6.2L6.4 10.8V18c0 6.2 4.8 11.7 11.6 13.3C24.8 29.7 29.6 24.2 29.6 18V10.8L18 6.2Z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
    <text x="18" y="22" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Georgia, serif" fill="#B8860B" letterSpacing="0.5">IS</text>
    <g fill="#B8860B" opacity="0.8">
      <circle cx="14" cy="26" r="1.1" />
      <circle cx="18" cy="26" r="1.1" />
      <circle cx="22" cy="26" r="1.1" />
    </g>
  </svg>
);

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await loginUser(email, password);
      login(token, user);
      router.push("/assistant");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--surface-base)",
    border: "1.5px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: "0.75rem",
  };

  const trustBullets = [
    { icon: Lock, text: "JWT-secured sessions with email verification" },
    { icon: Zap, text: "Instant answers from 753+ verified Indian Standards" },
    { icon: BookOpen, text: "Official Gazette & BIS LIMS sourced data only" },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--surface-base)" }}>
      {/* ——— LEFT PANEL — solid indigo + paper texture ——— */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-paper"
        style={{ backgroundColor: "#253878" }}
      >
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 opacity-5 bg-paper pointer-events-none" />

        {/* Top: Seal + Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <LargeSeal />
            <div>
              <div className="text-white font-bold text-lg tracking-tight">BIS Intelligence</div>
              <div className="text-white/60 text-xs font-mono">Dev Dynasty · SIH267107</div>
            </div>
          </div>

          <h2 className="font-display text-3xl font-bold text-white leading-snug mb-4">
            India&apos;s Most Comprehensive<br />
            <span style={{ color: "#B8860B" }}>Standards Intelligence</span><br />
            Platform
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Grounded AI answers for Indian Standards (IS), BIS certification, hallmarking, and 437+ testing laboratories.
          </p>
        </div>

        {/* Middle: Trust bullets */}
        <div className="relative z-10 space-y-4">
          {trustBullets.map(({ icon: Icon, text }, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(184,134,11,0.2)", border: "1px solid rgba(184,134,11,0.35)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "#B8860B" }} />
              </div>
              <span className="text-white/80 text-xs leading-relaxed">{text}</span>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/40 text-[10px]">Smart India Hackathon 2024 · SIH267107</p>
        </div>
      </div>

      {/* ——— RIGHT PANEL — form on --surface-raised ——— */}
      <div
        className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16"
        style={{ backgroundColor: "var(--surface-raised)" }}
      >
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile brand (hidden on lg) */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#253878" }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>BIS Intelligence</div>
              <div className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>SIH267107</div>
            </div>
          </div>

          <h1
            className="text-2xl font-bold tracking-tight font-display mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Sign in
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Access the BIS Intelligence Platform
          </p>

          {/* Success notice */}
          {justRegistered && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4"
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                color: "var(--success)",
              }}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Account created! Sign in below.</span>
            </div>
          )}

          {/* Demo credentials */}
          <div
            className="p-3 rounded-xl text-xs mb-5 text-center"
            style={{
              backgroundColor: "var(--gold-subtle)",
              border: "1px solid var(--gold-border)",
              color: "var(--gold)",
            }}
          >
            <span className="font-semibold">Demo: </span>
            demo@devdynasty.bis / BISDemo2024!
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4"
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.08)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                color: "var(--error)",
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm focus:outline-none transition-all"
                style={inputStyle}
                placeholder="demo@devdynasty.bis"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 text-sm focus:outline-none transition-all"
                  style={inputStyle}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                  style={{ color: "var(--text-placeholder)" }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              style={{
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                boxShadow: "0 4px 14px -2px rgba(37,56,120,0.4)",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative flex items-center py-3">
              <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
              <span className="px-3 text-xs" style={{ color: "var(--text-muted)", backgroundColor: "var(--surface-raised)" }}>
                New user?
              </span>
              <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
            </div>
            <Link
              href="/register"
              className="block w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all text-center"
              style={{
                backgroundColor: "var(--surface-overlay)",
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
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--surface-base)" }}>
          <div className="flex gap-1">
            {[0, 150, 300].map((d) => (
              <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--accent)", animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
