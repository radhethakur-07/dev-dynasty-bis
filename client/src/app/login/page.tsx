"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { loginUser } from "@/lib/api";
import { Shield, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

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
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--surface-base)" }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
              boxShadow: "0 8px 24px -6px rgba(37, 99, 235, 0.35)",
            }}
          >
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>

        <h1
          className="text-center text-2xl font-extrabold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          BIS Intelligence
        </h1>
        <p className="mt-2 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          AI-powered Indian Standards Assistant
        </p>
        <div className="flex justify-center mt-2">
          <span
            className="px-2 py-0.5 rounded text-[11px] font-mono font-bold"
            style={{
              backgroundColor: "var(--accent-subtle)",
              color: "var(--accent)",
              border: "1px solid var(--accent-border)",
            }}
          >
            SIH267107 · Dev Dynasty
          </span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <div
          className="py-8 px-6 rounded-2xl"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
            boxShadow: "0 4px 24px -8px rgba(0,0,0,0.12)",
          }}
        >
          {/* Registered success */}
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
              backgroundColor: "var(--accent-subtle)",
              border: "1px solid var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            <span className="font-semibold">Demo credentials: </span>
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
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={inputStyle}
                placeholder="demo@devdynasty.bis"
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
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
                  className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm focus:outline-none transition-all"
                  style={inputStyle}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
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
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                boxShadow: "0 2px 8px -2px var(--accent)",
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
            <div
              className="relative flex items-center py-3"
            >
              <div
                className="flex-1 border-t"
                style={{ borderColor: "var(--border)" }}
              />
              <span
                className="px-3 text-xs"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--surface-raised)" }}
              >
                New user?
              </span>
              <div
                className="flex-1 border-t"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <Link
              href="/register"
              className="block w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all text-center"
              style={{
                backgroundColor: "var(--surface-overlay)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
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
      }
    >
      <LoginForm />
    </Suspense>
  );
}
