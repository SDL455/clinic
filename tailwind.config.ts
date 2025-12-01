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
        // Primary Color Palette - Soft Medical Blue
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Clinic Theme Colors
        clinic: {
          // === Background & Surface ===
          bg: "#fafbfc",           // Very light blue-gray background
          surface: "#ffffff",       // Pure white for cards
          "surface-hover": "#f8fafc", // Subtle hover state
          border: "#e1e8ed",       // Soft blue-gray border
          muted: "#f1f5f9",        // Muted background areas
          
          // === Text Colors ===
          text: "#1e293b",         // Dark slate for primary text
          "text-muted": "#64748b", // Medium gray for secondary text
          "text-light": "#94a3b8", // Light gray for tertiary text
          
          // === Primary Brand Colors ===
          primary: "#0ea5e9",      // Sky blue - main brand color
          "primary-light": "#38bdf8",
          "primary-dark": "#0284c7",
          
          // === Secondary Brand Colors ===
          secondary: "#8b5cf6",    // Soft purple
          "secondary-light": "#a78bfa",
          "secondary-dark": "#7c3aed",
          
          // === Accent Colors (Modern & Soft) ===
          accent: "#06b6d4",       // Cyan - for highlights
          "accent-purple": "#a78bfa", // Soft purple accent
          "accent-pink": "#f472b6",   // Soft pink accent
          "accent-teal": "#14b8a6",   // Teal accent
          
          // === Sidebar Gradient (Soft Blue to Purple) ===
          "sidebar-from": "#0ea5e9",  // Sky blue
          "sidebar-via": "#3b82f6",   // Blue
          "sidebar-to": "#8b5cf6",    // Purple
          
          // === Status Colors (Softer Versions) ===
          success: "#10b981",      // Emerald green
          "success-light": "#34d399",
          "success-bg": "#d1fae5",
          
          warning: "#f59e0b",      // Amber
          "warning-light": "#fbbf24",
          "warning-bg": "#fef3c7",
          
          error: "#ef4444",        // Red
          "error-light": "#f87171",
          "error-bg": "#fee2e2",
          
          info: "#3b82f6",         // Blue
          "info-light": "#60a5fa",
          "info-bg": "#dbeafe",
          
          // === Utility Colors ===
          purple: "#a78bfa",       // Soft purple
          pink: "#f472b6",         // Soft pink
          blue: "#60a5fa",         // Soft blue
          cyan: "#22d3ee",         // Bright cyan
          teal: "#2dd4bf",         // Teal
          green: "#34d399",        // Soft green
          yellow: "#fbbf24",       // Soft yellow
          orange: "#fb923c",       // Soft orange
          red: "#f87171",          // Soft red
          indigo: "#818cf8",       // Soft indigo
          
          // === Shadow Colors ===
          "shadow-sm": "rgba(15, 23, 42, 0.04)",
          "shadow-md": "rgba(15, 23, 42, 0.08)",
          "shadow-lg": "rgba(15, 23, 42, 0.12)",
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

