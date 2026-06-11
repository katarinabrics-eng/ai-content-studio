"use client";

import { useState } from "react";

type PlanInput = string | Record<string, unknown>;

function parsePlan(plan: PlanInput): Record<string, unknown> | null {
  if (typeof plan === "object" && plan !== null) return plan;
  if (typeof plan !== "string") return null;
  try {
    const parsed = JSON.parse(plan) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function StrategicPlanRenderer({
  plan,
  className = "",
}: {
  plan: PlanInput;
  className?: string;
}) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const parsed = parsePlan(plan);

  if (parsed === null) {
    const raw = typeof plan === "string" ? plan : JSON.stringify(plan);
    return (
      <div
        className={className}
        style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 16, maxHeight: 400, overflow: "auto" }}
      >
        <pre style={{ margin: 0, fontSize: 13, color: "#bbb", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
          {raw}
        </pre>
      </div>
    );
  }

  const executiveSummary = parsed.executive_summary;
  const verdictKeys = Object.keys(parsed).filter((k) => k.endsWith("_verdict"));
  const sectionKeys = Object.keys(parsed).filter(
    (k) =>
      k !== "executive_summary" &&
      !k.endsWith("_verdict") &&
      typeof parsed[k] === "string"
  );

  const renderBlock = (val: unknown): React.ReactNode => {
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val.join(", ");
    if (val !== null && typeof val === "object") return JSON.stringify(val, null, 2);
    return String(val ?? "");
  };

  return (
    <div
      className={className}
      style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 16, maxHeight: 400, overflow: "auto" }}
    >
      {executiveSummary != null && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Shrnutí
          </div>
          <div style={{ fontSize: 13, color: "#bbb", whiteSpace: "pre-wrap" }}>
            {renderBlock(executiveSummary)}
          </div>
        </div>
      )}
      {sectionKeys.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {sectionKeys.map((key) => {
            const isOpen = openSection === key;
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            return (
              <div key={key} style={{ borderBottom: "1px solid #222", marginBottom: 4 }}>
                <button
                  type="button"
                  onClick={() => setOpenSection(isOpen ? null : key)}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: "none",
                    border: "none",
                    color: "#e7e7ef",
                    fontSize: 13,
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{label}</span>
                  <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: 10 }}>▼</span>
                </button>
                {isOpen && (
                  <div style={{ paddingBottom: 12, fontSize: 13, color: "#bbb", whiteSpace: "pre-wrap" }}>
                    {renderBlock(parsed[key])}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {verdictKeys.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #222" }}>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Verdict
          </div>
          {verdictKeys.map((key) => (
            <div key={key} style={{ fontSize: 13, color: "#bbb", whiteSpace: "pre-wrap" }}>
              {renderBlock(parsed[key])}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
