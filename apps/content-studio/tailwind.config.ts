import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lucifera: {
          lime: "#C0FF00",
          "lime-dim": "#9acc00",
          "lime-glow": "rgba(192, 255, 0, 0.4)",
          dark: "#0d1210",
          "dark-green": "#0a0f0d",
          anthracite: "#1a1f1d",
        },
      },
      boxShadow: {
        "lime-glow": "0 0 20px rgba(192, 255, 0, 0.3)",
        "lime-glow-strong": "0 0 40px rgba(192, 255, 0, 0.4)",
        "glass-lime": "inset 0 0 0 1px rgba(192, 255, 0, 0.15), 0 0 30px rgba(192, 255, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
