/**
 * Design system tokens – jednotné barvy, radius a fonty napříč diagnostikou a start flow.
 */
export const tokens = {
  colors: {
    bg: "#0a0a0a",
    card: "#111111",
    border: "#222222",
    primary: "#A8EB12", // Lucifera lime – CTA, sjednoceno s globals.css
    accent: "#A8EB12", // Lucifera lime – aktivní stav (selected)
    text: "#ffffff",
    muted: "#888888",
    warning: "#f5c842", // žlutá – skóre pod 70
    success: "#22c55e",
    error: "#ef4444",
  },
  radius: {
    card: "1rem", // rounded-2xl ~16px
    pill: "9999px", // rounded-full
    input: "0.75rem", // 12px
  },
  font: "var(--font-geist-sans), 'Inter', system-ui, sans-serif",
} as const;
