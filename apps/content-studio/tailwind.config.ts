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
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-playfair)", "var(--font-dm-sans)", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      colors: {
        lucifera: {
          lime: "#A8EB12",
          "lime-dim": "#7ba800",
          "lime-glow": "rgba(168, 235, 18, 0.4)",
          dark: "#0d1210",
          "dark-green": "#0a0f0d",
          anthracite: "#1a1f1d",
        },
        /* Sjednocení limetky (jako kruh na obrázku) i pro Tailwind třídy lime-* */
        lime: {
          400: "#A8EB12",
        },
      },
      boxShadow: {
        "lime-glow": "0 0 20px rgba(168, 235, 18, 0.3)",
        "lime-glow-strong": "0 0 40px rgba(168, 235, 18, 0.4)",
        "glass-lime": "inset 0 0 0 1px rgba(168, 235, 18, 0.15), 0 0 30px rgba(168, 235, 18, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
