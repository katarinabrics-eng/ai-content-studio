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

/** Doplňující otázky s klikacími volbami (žádné textové inputy). */
export function GapQuestions({
  questions,
  answers,
  onAnswer,
  confirmLabel,
  onConfirm,
}: {
  questions: GapQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, value: string) => void;
  confirmLabel: string;
  onConfirm: () => void;
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
          {q.options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onAnswer(q.id, o)}
              style={btnStyle(answers[q.id] === o)}
            >
              {o}
            </button>
          ))}
        </div>
      ))}
      <p style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>
        Všechny volby jsou dobrovolné. Nic nevyberete? Pokračujeme s rozumným předpokladem.
      </p>
      <button
        type="button"
        onClick={onConfirm}
        style={{
          width: "100%",
          padding: 13,
          background: "#a8e063",
          color: "#000",
          fontWeight: 700,
          fontSize: 14,
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          marginTop: 10,
          opacity: 1,
        }}
      >
        {confirmLabel}
      </button>
    </>
  );
}
