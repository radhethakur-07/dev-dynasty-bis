"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle,
  FlaskConical,
  Info,
  Menu,
  X,
} from "lucide-react";
import { checkBackendHealth } from "@/lib/api";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const navLinks = [
  { name: "Assistant", href: "/assistant", icon: Sparkles },
  { name: "Standards", href: "/finder", icon: BookOpen },
  { name: "Certification", href: "/certification", icon: Award },
  { name: "Hallmarking", href: "/hallmarking", icon: CheckCircle },
  { name: "Laboratories", href: "/laboratories", icon: FlaskConical },
  { name: "About", href: "/about", icon: Info },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    checkBackendHealth()
      .then((res) => {
        setBackendStatus(res.status === "ok" ? "online" : "offline");
      })
      .catch(() => setBackendStatus("offline"));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const statusConfig = {
    online: { color: "bg-emerald-500", pulse: true, label: "Connected" },
    checking: { color: "bg-amber-400", pulse: false, label: "Connecting" },
    offline: { color: "bg-slate-500", pulse: false, label: "Offline mode" },
  };
  const status = statusConfig[backendStatus];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "border-b shadow-sm"
          : "border-b"
      }`}
      style={{
        backgroundColor: "var(--surface-raised)",
        borderColor: "var(--border)",
        boxShadow: scrolled ? "0 1px 3px 0 rgb(0 0 0 / 0.08)" : undefined,
      }}
    >
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: "var(--surface-raised)", opacity: 0.92 }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group flex-shrink-0"
          aria-label="BIS Intelligence Assistant — Home"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-4.5 h-4.5" style={{ width: "18px", height: "18px" }} />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span
                className="font-bold text-sm tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                BIS Intelligence
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold border"
                style={{
                  backgroundColor: "var(--accent-subtle)",
                  color: "var(--accent)",
                  borderColor: "var(--accent-border)",
                }}
              >
                SIH
              </span>
            </div>
            <div className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
              Dev Dynasty • AI Assistant
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5" role="navigation" aria-label="Main navigation">
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive ? "" : "hover:opacity-90"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--accent-subtle)",
                        color: "var(--accent)",
                      }
                    : {
                        color: "var(--text-muted)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  }
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{item.name}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status Badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium"
            style={{
              backgroundColor: "var(--surface-overlay)",
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
            title={`Backend ${backendStatus}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.color} ${
                status.pulse ? "animate-pulse" : ""
              }`}
            />
            <span>{status.label}</span>
          </div>

          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t animate-slide-down"
          style={{
            backgroundColor: "var(--surface-raised)",
            borderColor: "var(--border)",
          }}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={
                    isActive
                      ? {
                          backgroundColor: "var(--accent-subtle)",
                          color: "var(--accent)",
                        }
                      : {
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Status in mobile */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${status.color} ${
                  status.pulse ? "animate-pulse" : ""
                }`}
              />
              <span>Backend: {status.label}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
