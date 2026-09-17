"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, AlertTriangle } from "lucide-react";

/* Small gold-on-indigo seal emblem for footer */
const FooterSeal: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M18 3L4 8.5V18c0 7.5 5.8 14.2 14 16 8.2-1.8 14-8.5 14-16V8.5L18 3Z"
      fill="#253878"
    />
    <text
      x="18"
      y="22"
      textAnchor="middle"
      fontSize="10"
      fontWeight="700"
      fontFamily="Georgia, serif"
      fill="#B8860B"
      letterSpacing="0.5"
    >
      IS
    </text>
    <g fill="#B8860B" opacity="0.7">
      <circle cx="14" cy="26" r="1.1" />
      <circle cx="18" cy="26" r="1.1" />
      <circle cx="22" cy="26" r="1.1" />
    </g>
  </svg>
);

export const Footer: React.FC = () => {
  const pathname = usePathname();
  // Full-height chat page — no footer
  if (pathname === "/assistant") return null;

  return (
    <footer
      className="w-full border-t py-6 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "var(--surface-subtle)",
        borderColor: "var(--border)",
        color: "var(--text-muted)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          {/* Brand with seal */}
          <div className="flex items-center gap-2.5">
            <FooterSeal />
            <div className="text-xs">
              <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                Dev Dynasty
              </span>
              <span style={{ color: "var(--text-muted)" }}> · BIS Intelligence Platform · </span>
              <span
                className="font-mono text-[10px]"
                style={{ color: "var(--gold)", opacity: 0.85 }}
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
              className="flex items-center gap-1 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--accent)")
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
                ((e.currentTarget as HTMLElement).style.color = "var(--accent)")
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
