/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e293b", // Azul oscuro
          light: "#334155", // Slate-700
          dark: "#0f172a", // Slate-900
        },
        success: {
          DEFAULT: "#10b981",
          light: "#6ee7b7",
          dark: "#047857",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#fca5a5",
          dark: "#b91c1c",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fde68a",
          dark: "#b45309",
        },
        dark: {
          DEFAULT: "#111827",
          light: "#374151",
          dark: "#030712",
        },
        white: "#ffffff",
        // Colores centralizados para la web
        accent: {
          DEFAULT: "#22c55e", // Verde principal
          light: "#4ade80",
          dark: "#15803d",
        },
        secondary: {
          DEFAULT: "#2563eb", // Azul secundario
          light: "#60a5fa",
          dark: "#1e40af",
        },
        neutral: {
          DEFAULT: "#f3f4f6",
          dark: "#d1d5db",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        yellow: {
          DEFAULT: "#facc15",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
