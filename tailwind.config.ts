import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        gold: {
          DEFAULT: "#fbbf24",
          dark: "#f59e0b",
        },
      },
      backgroundImage: {
        "app-gradient":
          "linear-gradient(135deg, #0a0e27 0%, #1a1147 50%, #2d1b4e 100%)",
        "gold-gradient": "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease-out both",
        shine: "shine 3s linear infinite",
        slowSpin: "slowSpin 2.5s linear infinite",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shine: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        slowSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
