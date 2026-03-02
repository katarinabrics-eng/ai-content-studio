"use client";

import { useState } from "react";

type BrandScore = {
  total?: number;
  hasHeadline?: boolean;
  hasOffer?: boolean;
  hasTargetAudience?: boolean;
  hasCTA?: boolean;
  hasVisualIdentity?: boolean;
  hasSocialProof?: boolean;
};
type BrandDna = Record<string, unknown>;

const C = {
  card: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
  },
  lbl: { fontSize: 9, color: "#444", textTransform: "uppercase" as const, letterSpacing: "0.15em", marginBottom: 5, display: "block" as const },
  inp: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  btn: {
    width: "100%",
    padding: 13,
    background: "#a8e063",
    color: "#000",
    fontWeight: 700,
    fontSize: 14,
    border: "none",
    borderRadius: 10,
    cursor: "pointer" as const,
    marginTop: 10,
  },
};

export function StrategicBooking({
  brandScore,
  brandDna,
  analyzedUrl,
}: {
  brandScore?: BrandScore;
  brandDna?: BrandDna;
  analyzedUrl?: string;
}) {
  const [email, setEmail] = useState("");
  const [consultationDate, setConsultationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!email.trim()) {
      setError("Zadejte e-mail.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/diagnostika/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          consultationDate: consultationDate.trim() || undefined,
          brandScore: brandScore ?? undefined,
          brandDna: brandDna ?? undefined,
          analyzedUrl: analyzedUrl ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chyba při vytváření platby");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("Chybí URL platby");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepodařilo se vytvořit platbu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...C.card, marginTop: 24, borderColor: "rgba(168,224,99,0.2)", background: "rgba(168,224,99,0.03)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#a8e063", marginBottom: 16 }}>
        Rezervace strategické konzultace
      </h3>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
        Vyberte preferovaný termín a e-mail. Po úhradě vám přijde přístup do klientského studia a potvrzení termínu.
      </p>
      <label style={C.lbl}>E-mail *</label>
      <input
        type="email"
        style={C.inp}
        placeholder="vas@email.cz"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label style={{ ...C.lbl, marginTop: 12 }}>Preferovaný termín konzultace</label>
      <input
        type="date"
        style={C.inp}
        value={consultationDate}
        onChange={(e) => setConsultationDate(e.target.value)}
      />
      {error && (
        <p style={{ marginTop: 10, fontSize: 13, color: "#e05a5a" }}>{error}</p>
      )}
      <button
        type="button"
        style={{ ...C.btn, opacity: loading ? 0.7 : 1 }}
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "Přesměrovávám na platbu…" : "Zaplatit a rezervovat termín"}
      </button>
    </div>
  );
}
