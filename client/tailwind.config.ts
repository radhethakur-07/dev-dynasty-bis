import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      colors: {
        // BIS Sovereign Indigo — deep authoritative blue
        primary: {
          50:  "#eef1f9",
          100: "#d6dcf1",
          200: "#adb9e3",
          300: "#8496d5",
          400: "#5b73c7",
          500: "#4F72C8",
          600: "#253878",
          700: "#1C2D65",
          800: "#162351",
          900: "#0F183D",
          950: "#080e29",
        },
        // Certification Gold — official, trustworthy
        gold: {
          50:  "#fdfaee",
          100: "#faf2cc",
          200: "#f5e38a",
          300: "#eece47",
          400: "#e5b820",
          500: "#D4A017",
          600: "#B8860B",
          700: "#9A7009",
          800: "#7c5a08",
          900: "#63490a",
          950: "#3b2a04",
        },
        // Surface tokens — dark mode
        surface: {
          950: "#080c14",
          900: "#0a0f1e",
          850: "#0d1424",
          800: "#111827",
          750: "#131c2e",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid-pattern":
          "linear-gradient(to right, rgb(30 41 59 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(30 41 59 / 0.08) 1px, transparent 1px)",
        "grid-pattern-light":
          "linear-gradient(to right, rgb(37 56 120 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(37 56 120 / 0.06) 1px, transparent 1px)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
        "pulse-ring": "pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "dots": "dots 1.2s steps(5, end) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gold-pulse": "goldPulse 2s ease-in-out infinite",
        "count-up": "countUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseRing: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        dots: {
          "0%, 20%": { color: "transparent", textShadow: "0.25em 0 0 transparent, 0.5em 0 0 transparent" },
          "40%": { color: "currentColor", textShadow: "0.25em 0 0 transparent, 0.5em 0 0 transparent" },
          "60%": { textShadow: "0.25em 0 0 currentColor, 0.5em 0 0 transparent" },
          "80%, 100%": { textShadow: "0.25em 0 0 currentColor, 0.5em 0 0 currentColor" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        goldPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(184, 134, 11, 0.3)" },
          "50%": { boxShadow: "0 0 0 6px rgba(184, 134, 11, 0)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "glow-indigo": "0 0 20px -5px rgba(37, 56, 120, 0.35)",
        "glow-gold": "0 0 20px -5px rgba(184, 134, 11, 0.35)",
        "glow-sm": "0 0 10px -3px rgba(37, 56, 120, 0.2)",
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
        "card-dark": "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
        "composer": "0 2px 12px -2px rgba(37, 56, 120, 0.12), 0 0 0 1px rgba(37, 56, 120, 0.08)",
        "composer-focus": "0 4px 20px -4px rgba(37, 56, 120, 0.2), 0 0 0 2px rgba(184, 134, 11, 0.25)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
