import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        lucifera: {
          lime: "#9FCF00",
          "lime-dim": "#7ba800",
          "lime-glow": "rgba(159, 207, 0, 0.4)",
          dark: "#0d1210",
          "dark-green": "#0a0f0d",
          anthracite: "#1a1f1d",
        },
      },
      boxShadow: {
        "lime-glow": "0 0 20px rgba(159, 207, 0, 0.3)",
        "lime-glow-strong": "0 0 40px rgba(159, 207, 0, 0.4)",
        "glass-lime": "inset 0 0 0 1px rgba(159, 207, 0, 0.15), 0 0 30px rgba(159, 207, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
