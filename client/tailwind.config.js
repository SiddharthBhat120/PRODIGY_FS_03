/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Rajdhani'", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Orbitron'", "sans-serif"],
      },
      colors: {
        bg: "#070a12",
        surface: "#0c1018",
        card: "#111827",
        border: "#1f2937",
        accent: "#6366f1",
        "accent-2": "#8b5cf6",
        neon: "#22d3ee",
        "neon-2": "#a78bfa",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#374151",
        dim: "#6b7280",
        gold: "#fbbf24",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #070a12 0%, #0f0c29 50%, #070a12 100%)",
        "card-gradient": "linear-gradient(135deg, #111827, #1a1f2e)",
        "accent-gradient": "linear-gradient(135deg, #6366f1, #8b5cf6)",
        "neon-gradient": "linear-gradient(135deg, #22d3ee, #6366f1)",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideIn: { "0%": { opacity: "0", transform: "translateX(-10px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        glow: { "0%": { boxShadow: "0 0 5px #6366f1, 0 0 10px #6366f1" }, "100%": { boxShadow: "0 0 15px #6366f1, 0 0 30px #6366f1, 0 0 60px #6366f1" } },
        pulseNeon: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
        float: { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
      },
    },
  },
  plugins: [],
};
