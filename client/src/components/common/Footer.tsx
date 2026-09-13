"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, ExternalLink, AlertTriangle } from "lucide-react";

export const Footer: React.FC = () => {
  const pathname = usePathname();
  // Full-height chat page — no footer
  if (pathname === "/assistant") return null;

  return (
    <footer
      className="w-full border-t py-6 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "var(--surface-overlay)",
        borderColor: "var(--border)",
        color: "var(--text-muted)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: "var(--accent-subtle)",
                border: "1px solid var(--accent-border)",
              }}
            >
              <Shield className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            </div>
            <div className="text-xs">
              <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                Dev Dynasty
              </span>
              <span style={{ color: "var(--text-muted)" }}> · BIS Intelligence Platform · </span>
              <span
                className="font-mono text-[10px]"
                style={{ color: "var(--text-placeholder)" }}
              >
                SIH267107
              </span>
            </div>
          </div>

          {/* Links */}
          <div
            className="flex items-center gap-5 text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            <a
              href="https://www.bis.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
              }
            >
              <span>BIS Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.manakonline.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
              }
            >
              <span>Manakonline</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link
              href="/about"
              className="transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Scope &amp; Boundaries
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="flex items-start gap-2.5 p-3 rounded-xl text-[11px] leading-relaxed"
          style={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          <AlertTriangle
            className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--warning)" }}
          />
          <p>
            <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
              Disclaimer:{" "}
            </span>
            Independent AI prototype for SIH267107. Not an official BIS authority. Verify certifications
            through authorized BIS offices and official Gazette notifications.
          </p>
        </div>

        {/* Copyright */}
        <div
          className="mt-4 text-center text-[10px]"
          style={{ color: "var(--text-placeholder)" }}
        >
          © 2026 Dev Dynasty · Built with Next.js, FastAPI, Gemini &amp; Supabase pgvector
        </div>
      </div>
    </footer>
  );
};
