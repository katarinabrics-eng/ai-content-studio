"use client";
import { useState } from "react";
import Link from "next/link";
// ─── INTEGRATION STUB ─────────────────────────────────────────────────────────
async function submitContactForm(data: Record<string, string>) {
  // TODO: POST https://app.smartmailing.cz/api/v3/contacts
  // přidej tag "kontakt-dotaz" nebo "kontakt-rezervace" dle type
  console.log("[SmartMailing kontakt]", data);
}
// ─── LÁKADLA DATA ─────────────────────────────────────────────────────────────
const CARDS = [
  {
    id: "diagnostika",
    tag: "Zdarma",
    tagColor: "#b7e94c",
    tagText: "#111",
    icon: "◎",
    title: "Diagnostika značky",
    description: "Za 3 minuty zjistíte, kde vaše vizuální komunikace stojí a co řeší nejdříve. Výsledek okamžitě.",
    cta: "Spustit diagnostiku →",
    href: "/diagnostika",
    external: false,
  },
  {
    id: "identita",
    tag: "9 900 Kč",
    tagColor: "#111",
    tagText: "#fff",
    icon: "◉",
    title: "Prémiová vizuální identita",
    description: "Strategický hovor 60 minut + vizuální board + 3 Canva šablony. Jasná cena, žádná překvapení.",
    cta: "Zjistit víc →",
    href: "/rezervace",
    external: false,
  },
  {
    id: "brand",
    tag: "od 16 900 Kč",
    tagColor: "#f4f3ee",
    tagText: "#666",
    icon: "◆",
    title: "Brand focení",
    description: "3 hodiny v ateliéru · 15 upravených fotek · 3 scény. Začínáme 30minutovou konzultací zdarma.",
    cta: "Rezervovat konzultaci →",
    href: "/rezervace",
    external: false,
  },
];
const TOPICS = [
  "Portrétní focení",
  "Rodinné focení",
  "Prémiová vizuální identita",
  "Brand focení",
  "AI Content Studio",
  "Diagnostika značky",
  "Něco jiného",
];
// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function KontaktPage() {
  const LIME = "#b7e94c";
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const canSend = form.name.trim().length > 0 && form.email.includes("@") && form.message.trim().length > 0;
  const handleSend = async () => {
    setLoading(true);
    await submitContactForm({ ...form, type: "kontakt-dotaz" });
    await new Promise((r) => setTimeout(r, 500));
    setSent(true);
    setLoading(false);
  };
  return (
    <>
      <style>{`
        .kt-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e3e2dc;
          border-radius: 10px;
          font-size: 13px;
          background: #fafaf8;
          box-sizing: border-box;
          outline: none;
          color: #333;
          font-family: inherit;
          transition: border-color 0.15s;
          display: block;
        }
        .kt-input:focus { border-color: #b7e94c; }
        .kt-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #c0bfb8;
          margin-bottom: 6px;
        }
        .kt-card-link {
          text-decoration: none;
          display: block;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .kt-card-link:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.10) !important;
        }
        .kt-cta-btn {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 15px 20px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.1s;
          font-family: inherit;
          letter-spacing: -0.01em;
        }
        .kt-cta-btn:active { transform: scale(0.98); }
        .kt-cta-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .kt-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 16px;
        }
        .kt-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        @media (max-width: 900px) {
          .kt-cards-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .kt-cards-grid { grid-template-columns: 1fr; }
          .kt-grid-2 { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>
      <main style={{ minHeight: "100vh", background: "#f7f6f1", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", paddingBottom: 100 }}>
        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", padding: "72px 24px 52px" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", marginBottom: 16 }}>
            Lucifera Studio
          </p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 900, color: "#111", margin: "0 0 14px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Pojďme si promluvit.
          </h1>
          <p style={{ fontSize: 16, color: "#888", margin: "0 auto", maxWidth: 460, lineHeight: 1.65 }}>
            Napište nám, co vás zajímá. Odpovídáme osobně do 48 hodin — žádné automatické sekvence.
          </p>
        </div>
        {/* ── LÁKADLA ── */}
        <div style={{ maxWidth: 1100, margin: "0 auto 64px", padding: "0 32px" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", marginBottom: 20, textAlign: "center" }}>
            Než napíšete — možná najdete odpověď tady
          </p>
          <div className="kt-cards-grid">
            {CARDS.map((card) => {
              const inner = (
                <div style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: "24px 22px 22px",
                  boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
                  height: "100%",
                  boxSizing: "border-box" as const,
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 0,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 22 }}>{card.icon}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                      background: card.tagColor, color: card.tagText,
                      padding: "3px 11px", borderRadius: 20,
                    }}>
                      {card.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 8px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: 13, color: "#777", margin: "0 0 20px", lineHeight: 1.65, flex: 1 }}>
                    {card.description}
                  </p>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#b7e94c", flexShrink: 0 }} />
                    {card.cta}
                  </div>
                </div>
              );
              return card.external ? (
                <a key={card.id} href={card.href} target="_blank" rel="noopener noreferrer" className="kt-card-link" style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.06)", borderRadius: 18 }}>
                  {inner}
                </a>
              ) : (
                <Link key={card.id} href={card.href} className="kt-card-link" style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.06)", borderRadius: 18 }}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
        {/* ── DIVIDER ── */}
        <div style={{ maxWidth: 640, margin: "0 auto 56px", padding: "0 32px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#e6e5df" }} />
          <p style={{ fontSize: 13, color: "#bbb", margin: 0, whiteSpace: "nowrap" }}>nebo nám napište přímo</p>
          <div style={{ flex: 1, height: 1, background: "#e6e5df" }} />
        </div>
        {/* ── FORMULÁŘ ── */}
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 32px" }}>
          <div style={{
            background: "#fff", borderRadius: 20,
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            padding: "40px 40px 36px",
          }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "#b7e94c", display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", fontSize: 24,
                }}>✓</div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
                  Zpráva odeslána
                </h3>
                <p style={{ fontSize: 14, color: "#888", margin: 0, lineHeight: 1.7 }}>
                  Ozveme se vám osobně do 48 hodin.<br />
                  Žádné automatické zprávy — dostanete přímou odpověď.
                </p>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
                  Napište nám
                </h2>
                <p style={{ fontSize: 13, color: "#aaa", margin: "0 0 28px" }}>
                  Povinná pole jsou označena *
                </p>
                {/* Jméno + email */}
                <div className="kt-grid-2" style={{ marginBottom: 16 }}>
                  <div>
                    <label className="kt-label">Jméno *</label>
                    <input className="kt-input" type="text" placeholder="Jana Nováková"
                      value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="kt-label">E-mail *</label>
                    <input className="kt-input" type="email" placeholder="jana@firma.cz"
                      value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                {/* Telefon + téma */}
                <div className="kt-grid-2" style={{ marginBottom: 16 }}>
                  <div>
                    <label className="kt-label">Telefon <span style={{ color: "#ddd" }}>(nepovinné)</span></label>
                    <input className="kt-input" type="tel" placeholder="+420 777 000 000"
                      value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="kt-label">Téma dotazu</label>
                    <select
                      value={form.topic}
                      onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                      style={{
                        width: "100%", padding: "11px 14px", border: "1.5px solid #e3e2dc",
                        borderRadius: 10, fontSize: 13, background: "#fafaf8",
                        boxSizing: "border-box" as const, outline: "none",
                        color: form.topic ? "#333" : "#aaa", fontFamily: "inherit",
                        appearance: "none" as const, cursor: "pointer",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23bbb' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center",
                      }}
                    >
                      <option value="">— vyberte —</option>
                      {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                {/* Zpráva */}
                <div style={{ marginBottom: 28 }}>
                  <label className="kt-label">Zpráva *</label>
                  <textarea
                    className="kt-input"
                    placeholder="Napište nám, co vás zajímá nebo čeho chcete dosáhnout..."
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    rows={5}
                    style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.65, minHeight: 130 }}
                  />
                </div>
                {/* Submit */}
                <button
                  className="kt-cta-btn"
                  onClick={handleSend}
                  disabled={loading || !canSend}
                  style={{ background: canSend ? LIME : "#e5e4de", color: canSend ? "#111" : "#aaa" }}
                >
                  {loading ? "Odesílám…" : "Odeslat zprávu →"}
                </button>
                {!canSend && (form.name || form.email || form.message) && (
                  <p style={{ fontSize: 12, color: "#e07b5a", marginTop: 10, textAlign: "center" }}>
                    Vyplňte jméno, e-mail a zprávu.
                  </p>
                )}
                <p style={{ fontSize: 12, color: "#ccc", textAlign: "center", marginTop: 16, lineHeight: 1.7 }}>
                  Odpovídáme osobně do 48 hodin.<br />Žádné automatické prodejní sekvence.
                </p>
              </>
            )}
          </div>
          {/* Přímý kontakt */}
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 28, flexWrap: "wrap" }}>
            {[
              { label: "E-mail", value: "ahoj@studiolucifera.cz", href: "mailto:ahoj@studiolucifera.cz" },
              { label: "Telefon", value: "+420 724 192 403", href: "tel:+420724192403" },
            ].map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: "none", textAlign: "center" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c0bfb8", margin: "0 0 4px" }}>{item.label}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#444", margin: 0 }}>{item.value}</p>
              </a>
            ))}
          </div>
          {/* Adresa */}
          <div style={{ marginTop: 36, textAlign: "center" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c0bfb8", margin: "0 0 12px" }}>
              Provozovna
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#333", margin: "0 0 4px" }}>
              Studio Lucifera
            </p>
            <p style={{ fontSize: 13, color: "#999", margin: "0 0 2px" }}>
              Katarína Brič & Luboš Novotný
            </p>
            <p style={{ fontSize: 13, color: "#999", margin: "0 0 2px" }}>
              Všehrdova 10
            </p>
            <p style={{ fontSize: 13, color: "#999", margin: 0 }}>
              Praha 1, 118 00
            </p>
            <a
              href="https://maps.google.com/?q=Všehrdova+10,+Praha+1"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "#b7e94c", fontWeight: 700, textDecoration: "none", letterSpacing: "0.05em" }}
            >
              Zobrazit na mapě →
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
