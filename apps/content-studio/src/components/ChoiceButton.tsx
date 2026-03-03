"use client";

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
      className={multi ? "manual-pill px-4 py-2.5 rounded-full text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed" : "manual-pill px-4 py-2.5 rounded-full text-sm transition-all duration-200"}
      style={{
        background: selected ? "rgba(168,224,99,0.18)" : "rgba(255,255,255,0.06)",
        border: "1px solid " + (selected ? "rgba(168,224,99,0.35)" : "rgba(255,255,255,0.08)"),
        color: selected ? "#a8e063" : "#a1a1aa",
        boxShadow: selected ? "0 0 20px rgba(168,224,99,0.12)" : "none",
      }}
    >
      {label}
    </button>
  );
}
