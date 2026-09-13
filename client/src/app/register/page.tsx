"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";
import { Shield, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const result = await registerUser(name, email, password);
      if (result.verified || result.demo_mode) {
        router.push("/login?registered=1");
      } else {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--surface-base)",
    border: "1.5px solid var(--border)",
    color: "var(--text-primary)",
  };

  const focusHandlers = (el: HTMLElement) => {
    el.style.borderColor = "var(--accent)";
    el.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
  };
  const blurHandlers = (el: HTMLElement) => {
    el.style.borderColor = "var(--border)";
    el.style.boxShadow = "";
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--surface-base)" }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)", boxShadow: "0 8px 24px -6px rgba(37, 99, 235, 0.35)" }}
          >
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-center text-2xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Create your account
        </h1>
        <p className="mt-2 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          BIS Intelligence Platform · Dev Dynasty
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="py-8 px-6 rounded-2xl" style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border)", boxShadow: "0 4px 24px -8px rgba(0,0,0,0.12)" }}>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.2)", color: "var(--error)" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {[
              { id: "name", label: "Full Name", type: "text", value: name, setter: setName, placeholder: "Your name", auto: "name" },
              { id: "email", label: "Email address", type: "email", value: email, setter: setEmail, placeholder: "demo@devdynasty.bis", auto: "email" },
            ].map(({ id, label, type, value, setter, placeholder, auto }) => (
              <div key={id} className="space-y-1.5">
                <label htmlFor={id} className="block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                  {label}
                </label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  autoComplete={auto}
                  required
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => focusHandlers(e.currentTarget)}
                  onBlur={(e) => blurHandlers(e.currentTarget)}
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => focusHandlers(e.currentTarget)}
                  onBlur={(e) => blurHandlers(e.currentTarget)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors" style={{ color: "var(--text-placeholder)" }} tabIndex={-1} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => focusHandlers(e.currentTarget)}
                onBlur={(e) => blurHandlers(e.currentTarget)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: "var(--accent)", color: "#ffffff", boxShadow: "0 2px 8px -2px var(--accent)" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)"; }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</>
              ) : "Create Account"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <div className="relative flex items-center py-3">
              <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
              <span className="px-3 text-xs" style={{ color: "var(--text-muted)", backgroundColor: "var(--surface-raised)" }}>Already have an account?</span>
              <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
            </div>
            <Link href="/login" className="block w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all text-center" style={{ backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
