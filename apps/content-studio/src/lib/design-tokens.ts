/**
 * Design system tokens – jednotné barvy, radius a fonty napříč diagnostikou a start flow.
 * Light theme.
 */
export const tokens = {
  colors: {
    bg: "#ffffff",
    card: "#f7f7f5",
    cardAlt: "#f0efeb",
    border: "rgba(0,0,0,0.09)",
    borderStrong: "rgba(0,0,0,0.12)",
    primary: "#b7e94c",
    accent: "#b7e94c",
    accentHover: "#d0ec78",
    accentTint: "rgba(183,233,76,0.12)",
    accentBorder: "rgba(183,233,76,0.4)",
    accentDark: "#5a8a00",
    text: "#111111",
    muted: "#555555",
    mutedSoft: "#777777",
    placeholder: "#bbbbbb",
    warning: "#f5c842",
    success: "#22c55e",
    error: "#ef4444",
  },
  radius: {
    card: "1rem",
    pill: "9999px",
    input: "0.75rem",
  },
  font: "var(--font-dm-sans), system-ui, sans-serif",
} as const;
