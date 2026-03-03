"use client";

import { ChoiceButton } from "@/components/ChoiceButton";
import { tokens } from "@/lib/design-tokens";

export type GapQuestion = {
  id: string;
  question: string;
  options: string[];
};

const cardStyle: React.CSSProperties = {
  background: tokens.colors.card,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: 16,
  padding: 20,
};

/** Doplňující otázky: nadpis + 4 ChoiceButton, single-select (klik = odznačit). Sticky tlačítko dole. */
export function GapQuestions({
  questions,
  answers,
  onAnswer,
  confirmLabel,
  onConfirm,
  onSkipAll,
}: {
  questions: GapQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, value: string) => void;
  confirmLabel: string;
  onConfirm: () => void;
  onSkipAll?: () => void;
}) {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {questions.map((q, i) => (
          <div key={q.id} style={cardStyle}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: `${tokens.colors.accent}20`,
                  color: tokens.colors.accent,
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: 13, color: tokens.colors.text, lineHeight: 1.5 }}>{q.question}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {q.options.map((o) => {
                const selected = answers[q.id] === o;
                return (
                  <ChoiceButton
                    key={o}
                    label={o}
                    selected={selected}
                    onClick={() => onAnswer(q.id, selected ? "" : o)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: tokens.colors.muted, marginTop: 4, marginBottom: 12 }}>
        Všechny volby jsou dobrovolné. Nic nevyberete? Pokračujeme s rozumným předpokladem.
      </p>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          paddingTop: 12,
          paddingBottom: 24,
          background: `linear-gradient(to top, ${tokens.colors.bg} 60%, transparent)`,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {onSkipAll && (
          <button
            type="button"
            onClick={onSkipAll}
            style={{
              padding: "12px 18px",
              background: "transparent",
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 10,
              color: tokens.colors.muted,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Přeskočit vše
          </button>
        )}
        <button
          type="button"
          onClick={onConfirm}
          style={{
            flex: 1,
            minWidth: 200,
            padding: 13,
            background: tokens.colors.primary,
            color: "#000",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </>
  );
}
