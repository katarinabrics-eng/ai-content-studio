"use client";

import { useState } from "react";

const PLANS = [
  {
    id: "start",
    name: "Start",
    desc: "Ideální pro začátek — vezmi a použij.",
    counts: "2 videa + 2 grafiky / týden",
  },
  {
    id: "plus",
    name: "Plus",
    desc: "Nahraješ materiál → dostaneš hotový obsah.",
    counts: "4 videa + 4 grafiky / týden",
  },
  {
    id: "pro",
    name: "Pro",
    desc: "Maximální výstup pro aktivní tvůrce.",
    counts: "8 videí + 10 grafik / týden",
  },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<PlanId>("plus");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rtg/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), plan }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Něco se nepovedlo. Zkuste to znovu.");
        return;
      }
      setDone(true);
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "80px", paddingBottom: "60px", paddingLeft: "20px", paddingRight: "20px" }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <a href="/ready-to-go" style={{ fontSize: "13px", color: "#888", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
            ← Ready to Go
          </a>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "32px", fontWeight: 800, color: "#111", lineHeight: 1.1, marginBottom: "8px" }}>
            Mám zájem
          </h1>
          <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.6 }}>
            Vyplňte formulář a ozveme se do 24 hodin s přístupovým odkazem.
          </p>
        </div>

        {/* Potvrzení */}
        {done ? (
          <div style={{ background: "#f3fbdc", border: "1px solid #d0ec78", borderRadius: "12px", padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>✓</div>
            <p style={{ fontSize: "17px", fontWeight: 600, color: "#111", marginBottom: "8px" }}>
              Přihlášku jsme přijali!
            </p>
            <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.6 }}>
              Ozveme se do 24 hodin na <strong>{email}</strong> s přístupovým odkazem.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Jméno */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#111" }}>Jméno</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jana Nováková"
                style={{ fontSize: "15px", border: "1px solid #e8e8e4", borderRadius: "8px", padding: "12px 14px", outline: "none", color: "#111", background: "#fff" }}
                onFocus={(e) => (e.target.style.borderColor = "#d0ec78")}
                onBlur={(e) => (e.target.style.borderColor = "#e8e8e4")}
              />
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#111" }}>E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jana@example.cz"
                style={{ fontSize: "15px", border: "1px solid #e8e8e4", borderRadius: "8px", padding: "12px 14px", outline: "none", color: "#111", background: "#fff" }}
                onFocus={(e) => (e.target.style.borderColor = "#d0ec78")}
                onBlur={(e) => (e.target.style.borderColor = "#e8e8e4")}
              />
            </div>

            {/* Plán */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#111" }}>Plán</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    style={{
                      border: plan === p.id ? "2px solid #111" : "1px solid #e8e8e4",
                      background: plan === p.id ? "#f3fbdc" : "#fff",
                      borderRadius: "10px",
                      padding: "14px 12px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>{p.name}</div>
                    <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.4, marginBottom: "6px" }}>{p.desc}</div>
                    <div style={{ fontSize: "10px", color: "#888", fontWeight: 500 }}>{p.counts}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p style={{ fontSize: "13px", color: "#e53e3e", margin: 0 }}>{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#555" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "14px 24px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Odesílám…" : "Mám zájem →"}
            </button>

            <p style={{ fontSize: "12px", color: "#aaa", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
              Žádný závazek. Ozveme se do 24 hodin a domluvíme se na dalším kroku.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
