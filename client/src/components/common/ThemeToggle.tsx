"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { toggleTheme, isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-8 h-8 rounded-xl ${className}`}
        style={{ backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border)" }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${className}`}
      style={{
        backgroundColor: "var(--surface-overlay)",
        border: "1px solid var(--border)",
        color: "var(--text-muted)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--border)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-overlay)";
      }}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300" />
      )}
    </button>
  );
};
