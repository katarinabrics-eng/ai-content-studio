"use client";

import { tokens } from "@/lib/design-tokens";

/** Klikací pill tlačítko pro volby (single nebo multi). */
export function ChoiceButton({
  label,
  selected,
  onClick,
  disabled,
  multi,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        multi
          ? "manual-pill px-4 py-2.5 rounded-full text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          : "manual-pill px-4 py-2.5 rounded-full text-sm transition-all duration-200"
      }
      style={{
        background: selected ? tokens.colors.accentTint : "#f7f7f5",
        border: `1px solid ${selected ? tokens.colors.primary : "rgba(0,0,0,0.12)"}`,
        color: selected ? "#111" : tokens.colors.muted,
        boxShadow: selected ? `0 0 20px ${tokens.colors.accent}20` : "none",
      }}
    >
      {label}
    </button>
  );
}
