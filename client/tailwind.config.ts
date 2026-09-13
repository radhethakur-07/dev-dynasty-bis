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
      },
      colors: {
        // BIS Brand Blue — professional, trustworthy
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Surface tokens — used consistently across light/dark
        surface: {
          // Dark
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
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
        "pulse-ring": "pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "dots": "dots 1.2s steps(5, end) infinite",
        "shimmer": "shimmer 2s linear infinite",
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
      },
      boxShadow: {
        "glow-blue": "0 0 20px -5px rgb(37 99 235 / 0.3)",
        "glow-sm": "0 0 10px -3px rgb(37 99 235 / 0.2)",
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "card-dark": "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
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
