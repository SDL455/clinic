import type { Config } from "tailwindcss";

export default <Config>{
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        lao: ["Noto Sans Lao", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        clinic: {
          // Light theme colors
          bg: "#f8fafc",
          surface: "#ffffff",
          border: "#e2e8f0",
          muted: "#f1f5f9",
          // Text colors
          text: "#1e293b",
          "text-muted": "#64748b",
          // Accent colors
          accent: "#10b981",
          accent2: "#06b6d4",
          // Sidebar gradient
          "sidebar-from": "#ec4899",
          "sidebar-via": "#f97316",
          "sidebar-to": "#eab308",
          // Status colors
          purple: "#8b5cf6",
          pink: "#ec4899",
          orange: "#f97316",
          cyan: "#06b6d4",
          green: "#22c55e",
          red: "#ef4444",
          yellow: "#eab308",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

