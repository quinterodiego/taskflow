/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Inter'", "sans-serif"],
      },
      colors: {
        surface: {
          0: "#0d0d0d",
          1: "#141414",
          2: "#1c1c1c",
          3: "#242424",
          4: "#2e2e2e",
        },
        ink: {
          DEFAULT: "#e8e8e8",
          muted: "#888888",
          faint: "#444444",
        },
        accent: "#e8ff4a",
        status: {
          pending: "#888888",
          done: "#4ade80",
          suspended: "#f87171",
        },
      },
      animation: {
        "slide-in": "slideIn 0.15s ease-out",
        "fade-in": "fadeIn 0.1s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(-6px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
