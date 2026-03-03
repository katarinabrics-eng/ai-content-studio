"use client";

export type GapQuestion = {
  id: string;
  question: string;
  options: string[];
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: 20,
  marginBottom: 12,
};

const btnStyle = (selected: boolean): React.CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "9px 13px",
  borderRadius: 8,
  border: selected ? "1px solid #a8e063" : "1px solid rgba(255,255,255,0.07)",
  background: selected ? "rgba(168,224,99,0.07)" : "rgba(255,255,255,0.02)",
  color: selected ? "#a8e063" : "#666",
  fontSize: 12,
  cursor: "pointer",
  marginBottom: 5,
});

/** Doplňující otázky s klikacími volbami. Single-select: klik na stejnou volbu = odznačí. */
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
      {questions.map((q, i) => (
        <div key={q.id} style={cardStyle}>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(168,224,99,0.1)",
                color: "#a8e063",
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
            <p style={{ fontSize: 13, color: "#ddd", lineHeight: 1.5 }}>{q.question}</p>
          </div>
          {q.options.map((o) => {
            const selected = answers[q.id] === o;
            return (
              <button
                key={o}
                type="button"
                onClick={() => onAnswer(q.id, selected ? "" : o)}
                style={btnStyle(selected)}
              >
                {o}
              </button>
            );
          })}
        </div>
      ))}
      <p style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>
        Všechny volby jsou dobrovolné. Nic nevyberete? Pokračujeme s rozumným předpokladem.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        {onSkipAll && (
          <button
            type="button"
            onClick={onSkipAll}
            style={{
              padding: "12px 18px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              color: "#888",
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
            background: "#a8e063",
            color: "#000",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            opacity: 1,
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </>
  );
}
