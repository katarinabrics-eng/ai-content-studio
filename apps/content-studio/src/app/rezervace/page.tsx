"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
// ─── CALENDLY (Brand – konzultace zdarma) ────────────────────────────────────
const CALENDLY: Record<string, string> = {
  brand: "https://calendly.com/lucifera/brand-konzultace",
};
// ─── INTEGRATIONS ────────────────────────────────────────────────────────────
async function submitToSmartMailing(data: Record<string, string>) {
  // TODO: POST https://app.smartmailing.cz/api/v3/contacts
  console.log("[SmartMailing]", data);
}
async function redirectToStripe(priceId: string) {
  // TODO: odkomentuj až bude /api/checkout hotové
  // const res = await fetch("/api/checkout", { method: "POST", body: JSON.stringify({ priceId }) });
  // const { url } = await res.json();
  // window.location.href = url;
  console.log("[Stripe stub]", priceId);
  alert(`Stripe: ${priceId} — doplň /api/checkout route.`);
}
// ─── TYPES ───────────────────────────────────────────────────────────────────
type Flow = "stripe" | "calendly";
interface Variant { label: string; price: number; stripeId: string; bullets?: string[]; sublabel?: string; }
interface Field { id: string; label: string; type: "text" | "radio"; placeholder?: string; options?: string[]; }
interface Service {
  id: string; emoji: string; title: string; tagline: string; priceFrom: number;
  highlights: string[];
  description: string; variants: Variant[];
  extras: { label: string; price: number }[];
  fields: Field[]; note: string; cta: string; flow: Flow;
}
// ─── PRODUCT DATA ─────────────────────────────────────────────────────────────
const SERVICES: Service[] = [
  {
    id: "portret",
    emoji: "◉",
    title: "Portrétní focení",
    tagline: "Autorský portrét v ateliéru",
    priceFrom: 4500,
    highlights: ["1–2 hodiny focení v ateliéru", "Základní retuše v ceně", "Výstup pro web i tisk"],
    description: "Profesionální portrétní focení v ateliéru (autorský portrét). Zahrnuje přípravu, focení cca 1–2 hodiny a základní retuše. Výstup: vybrané fotografie v rozlišení vhodném pro web a tisk.",
    variants: [
      { label: "Portrét – autorský portrét STUDIO", price: 4500, stripeId: "price_XXXX_portret" },
    ],
    extras: [
      { label: "Přejete si vizážistku?", price: 3500 },
    ],
    fields: [
      { id: "typ", label: "Typ portrétu", type: "radio", options: ["Podnikatelský portrét", "Umělecký portrét", "Herecký / profesní portrét"] },
    ],
    note: "Konzultace zde není – stačí vyplnit dotazník. Termín focení zvolíte po platbě.",
    cta: "Zaplatit a rezervovat termín",
    flow: "stripe",
  },
  {
    id: "rodina",
    emoji: "◈",
    title: "Rodinné focení",
    tagline: "Dokumentární nebo ateliérové",
    priceFrom: 4500,
    highlights: ["2–3 hodiny", "Analog nebo digitál", "Exteriér nebo ateliér"],
    description: "Dokumentární zachycení rodiny v přirozeném prostředí (exteriér nebo váš interiér). Cca 2–3 hodiny, digitální nebo analogové snímky dle domluvy. Základní retuše a předání vybraných fotografií.",
    variants: [
      { label: "Reportážní dokumentární focení", price: 5800, stripeId: "price_XXXX_rodina_report" },
      { label: "Ateliérové focení stylizace", price: 8500, stripeId: "price_XXXX_rodina_styl" },
      { label: "Ateliérový rodinný portrét", price: 4500, stripeId: "price_XXXX_rodina_portret" },
    ],
    extras: [
      { label: "Přejete si vizážistku?", price: 3500 },
      { label: "Pomoc s výběrem oblečení", price: 0 },
    ],
    fields: [
      { id: "kde", label: "Kde si přejete fotit?", type: "text", placeholder: "např. park, byt, ateliér" },
      { id: "pocet", label: "Kolik vás bude?", type: "text", placeholder: "např. 4 osoby, 2 dospělí + 2 děti" },
      { id: "medium", label: "Analog nebo digitál?", type: "radio", options: ["Analog", "Digitál"] },
    ],
    note: "Termín focení zvolíte po dokončení platby.",
    cta: "Zaplatit a rezervovat termín",
    flow: "stripe",
  },
  {
    id: "identita",
    emoji: "◎",
    title: "Prémiová vizuální identita",
    tagline: "Strategický hovor · Vizuální board · Focení",
    priceFrom: 9900,
    highlights: ["Strategický hovor 60 min", "Vizuální board + Canva šablony", "Plný komplet s focením od 39 900 Kč"],
    description: "Jasná cena. Bez překvapení. Začněte strategickým hovorem. Focení a autopilot jsou váš další krok — pokud budete chtít.",
    variants: [
      {
        label: "Krok 1 · Vstup",
        sublabel: "Strategický hovor 60 min + vizuální strategie",
        price: 9900,
        stripeId: "price_XXXX_vstup",
        bullets: [
          "Analýza vaší online přítomnosti",
          "Strategický hovor 60 minut",
          "20stránková prezentace — Marketingový plán a strategie",
          "Vizuální board vašich budoucích fotografií",
          "3 Canva šablony vycházející z vaší Brand DNA",
        ],
      },
      {
        label: "Krok 1 + 2 · Komplet",
        sublabel: "Hovor + den focení + všechny výstupy",
        price: 39900,
        stripeId: "price_XXXX_komplet",
        bullets: [
          "Vše ze Kroku 1",
          "Den focení v ateliéru Praha Kampa",
          "5 stylů focení — každý cca 20 fotografií",
          "10 faceless fotek pro grafiku a kampaně",
          "1 minuta b-rollu pro Reels a video",
          "Focení přesně dle vizuálního boardu",
          "Za příplatek: promo video, Reels, grafika",
          "Měsíc autopilota zdarma (vstup do naší aplikace)",
        ],
      },
    ],
    extras: [
      { label: "Přejete si vizážistku?", price: 3500 },
    ],
    fields: [
      { id: "url", label: "URL vašeho webu", type: "text", placeholder: "např. vasefirma.cz" },
    ],
    note: "Po výběru termínu budete přesměrováni na platbu. Hovor potvrdíme po připsání platby.",
    cta: "Zaplatit a rezervovat termín",
    flow: "stripe",
  },
  {
    id: "brand",
    emoji: "◆",
    title: "Brand focení",
    tagline: "3 hodiny · 15 fotek · 3 scény",
    priceFrom: 16900,
    highlights: ["30 min konzultace zdarma", "3 hodiny focení + 3 scény", "15 upravených fotek ve vysokém rozlišení"],
    description: "Komplexní brand session pro podnikatele a firmy. Začínáme bezplatnou 30minutovou konzultací. Výstup: 15 upravených fotografií ve 3 různých scénách, připravených pro web i sítě.",
    variants: [
      {
        label: "Brand focení STUDIO",
        sublabel: "3 hod · 15 fotek · 3 scény",
        price: 16900,
        stripeId: "price_XXXX_brand",
        bullets: [
          "30minutová konzultace zdarma (před focením)",
          "3 hodiny focení v ateliéru",
          "3 změny scény dle předem dohodnutého plánu",
          "15 upravených fotografií ve vysokém rozlišení",
          "Fotografie pro web, Instagram i LinkedIn",
        ],
      },
      {
        label: "Brand focení STUDIO + Video",
        sublabel: "Vše výše + 1 min b-roll pro Reels",
        price: 22900,
        stripeId: "price_XXXX_brand_video",
        bullets: [
          "30minutová konzultace zdarma (před focením)",
          "3 hodiny focení v ateliéru",
          "3 změny scény dle předem dohodnutého plánu",
          "15 upravených fotografií ve vysokém rozlišení",
          "1 minuta b-rollu pro Reels a video obsah",
        ],
      },
    ],
    extras: [
      { label: "Přejete si vizážistku?", price: 3500 },
      { label: "Vizuální board předem", price: 3500 },
    ],
    fields: [
      { id: "url", label: "URL vašeho webu", type: "text", placeholder: "např. vasefirma.cz" },
      { id: "pouziti", label: "Kde budete fotky používat?", type: "text", placeholder: "např. Instagram, web, LinkedIn" },
    ],
    note: "Nejprve zarezervujete bezplatnou 30minutovou konzultaci. Termín focení a platbu domluvíme společně po ní.",
    cta: "Rezervovat konzultaci zdarma",
    flow: "calendly",
  },
  {
    id: "content-starter",
    emoji: "▸",
    title: "Content Starter",
    tagline: "Návrh vizuálního stylu a první obsah.",
    priceFrom: 4900,
    highlights: [
      "Návrh vizuálního stylu",
      "5 krátkých video záběrů",
      "Návrhy příspěvků + texty",
    ],
    description: "Ideální vstupní bod — dostanete návrh vizuálního stylu, ilustrační vizuály, 5 krátkých video záběrů a návrhy příspěvků s texty. Výstup do 2 dnů, bez závazku focení.",
    variants: [
      {
        label: "Content Starter",
        sublabel: "Výstup do 2 dnů · bez závazku",
        price: 4900,
        stripeId: "price_content_starter",
        bullets: [
          "Návrh vizuálního stylu",
          "Ilustrační vizuály",
          "5 krátkých video záběrů",
          "Návrhy příspěvků + texty",
        ],
      },
    ],
    extras: [],
    fields: [
      {
        id: "url",
        label: "URL vašeho webu",
        type: "text",
        placeholder: "např. vasefirma.cz",
      },
    ],
    note: "Placeno předem · Výstup v ruce do 2 dní · Bez závazku focení",
    cta: "Zaplatit a rezervovat termín",
    flow: "stripe",
  },
];
// ─── COMPONENT ────────────────────────────────────────────────────────────────
function RezervaceContent() {
  const searchParams = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(() => {
    return null;
  });

  useEffect(() => {
    const open = searchParams.get("open");
    if (open) {
      setOpenId(open);
      setTimeout(() => {
        document.getElementById(`card-${open}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [extrasState, setExtrasState] = useState<Record<string, Record<number, boolean>>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string>>>({});
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const toggle = (id: string) => setOpenId((p) => (p === id ? null : id));
  const getPrice = (s: Service) => {
    const vIdx = selectedVariants[s.id] ?? 0;
    let total = s.variants[vIdx]?.price ?? s.priceFrom;
    s.extras.forEach((e, i) => { if (e.price > 0 && extrasState[s.id]?.[i]) total += e.price; });
    return total;
  };
  const canSubmit = () => contact.name.trim().length > 0 && contact.email.includes("@");
  const handleSubmit = async (service: Service) => {
    setLoading(true);
    const vIdx = selectedVariants[service.id] ?? 0;
    const variant = service.variants[vIdx];
    await submitToSmartMailing({ ...contact, service: service.id, variant: variant.label, price: String(getPrice(service)), ...(fieldValues[service.id] ?? {}) });
    if (service.flow === "stripe") {
      await redirectToStripe(variant.stripeId);
    } else {
      const params = new URLSearchParams({ name: contact.name, email: contact.email, a1: variant.label });
      window.open(`${CALENDLY[service.id]}?${params}`, "_blank");
    }
    setLoading(false);
  };
  const LIME = "#b7e94c";
  return (
    <>
      <style>{`
        .rez-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
          align-items: start;
        }
        .rez-card-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 32px;
        }
        @media (max-width: 900px) {
          .rez-grid { grid-template-columns: 1fr; padding: 0 16px; }
          .rez-card-inner { grid-template-columns: 1fr; gap: 0; }
        }
        @media (max-width: 600px) {
          .rez-grid { padding: 0 12px; gap: 12px; }
        }
        .rez-input {
          width: 100%;
          padding: 10px 13px;
          border: 1.5px solid #e3e2dc;
          border-radius: 9px;
          font-size: 13px;
          background: #fafaf8;
          box-sizing: border-box;
          outline: none;
          color: #333;
          font-family: inherit;
          transition: border-color 0.15s;
          display: block;
          margin-bottom: 8px;
        }
        .rez-input:focus { border-color: #b7e94c; }
        .rez-variant-label {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 11px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          gap: 10px;
          margin-bottom: 6px;
        }
        .rez-cta-btn {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.1s;
          font-family: inherit;
        }
        .rez-cta-btn:active { transform: scale(0.98); }
        .rez-cta-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
      <main style={{ minHeight: "100vh", background: "#f7f6f1", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", paddingBottom: 100 }}>
        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", padding: "72px 24px 44px" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", marginBottom: 16 }}>Lucifera Studio</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 900, color: "#111", margin: "0 0 14px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Spolupráce začíná jasností.
          </h1>
          <p style={{ fontSize: 16, color: "#888", margin: "0 auto", maxWidth: 520, lineHeight: 1.6 }}>
            Vyberte typ spolupráce. Každá služba má jiný proces —<br />provedeme vás krok za krokem.
          </p>
        </div>
        {/* ── INFO STRIP ── */}
        <div style={{ maxWidth: 820, margin: "0 auto 52px", padding: "0 32px" }}>
          <div style={{ border: "1px solid #e6e5df", borderRadius: 16, padding: "20px 28px", background: "#fff", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 40px" }}>
            {[
              { label: "Co se zde odehrává", text: "Zvolte typ spolupráce, vyplňte základní údaje. Portrét, rodinné focení a prémiová identita se hradí online ihned. Brand focení začíná bezplatnou konzultací." },
              { label: "Co potřebujete k zahájení", text: "U prémiové identity a brand focení: URL vašeho webu. U ostatních stačí vyplnit krátký dotazník a zaplatit — termín zvolíte hned po platbě." },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c0bfb8", margin: "0 0 6px" }}>{item.label}</p>
                <p style={{ fontSize: 13, color: "#777", margin: 0, lineHeight: 1.65 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        {/* ── CARDS ── */}
        <div className="rez-grid">
          {SERVICES.map((service) => {
            const isOpen = openId === service.id;
            const isStripe = service.flow === "stripe";
            const price = getPrice(service);
            const activeV = selectedVariants[service.id] ?? 0;
            return (
              <div key={service.id} id={`card-${service.id}`} style={{
                background: "#fff",
                borderRadius: 20,
                border: `2px solid ${isOpen ? LIME : "transparent"}`,
                boxShadow: isOpen ? "0 16px 48px rgba(0,0,0,0.11)" : "0 2px 16px rgba(0,0,0,0.06)",
                transition: "border-color 0.2s, box-shadow 0.3s",
                overflow: "hidden",
              }}>
                {/* ── CARD HEADER (always visible) ── */}
                <button onClick={() => toggle(service.id)} style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  textAlign: "left", padding: "28px 28px 0",
                }}>
                  {/* Top row: badges */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                      background: isStripe ? "#111" : "#f0efea",
                      color: isStripe ? "#fff" : "#888",
                      padding: "4px 12px", borderRadius: 20,
                    }}>
                      {isStripe ? "💳 Platba online" : "📅 Konzultace zdarma"}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 800,
                      background: isOpen ? LIME : "#f4f3ee",
                      color: isOpen ? "#111" : "#777",
                      padding: "4px 14px", borderRadius: 20,
                      transition: "background 0.2s, color 0.2s",
                    }}>
                      od {service.priceFrom.toLocaleString("cs-CZ")} Kč
                    </span>
                  </div>
                  {/* Title + tagline */}
                  <div style={{ marginBottom: 16 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 5px", letterSpacing: "-0.01em" }}>
                      {service.title}
                    </h2>
                    <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>{service.tagline}</p>
                  </div>
                  {/* Highlights (closed preview) */}
                  {!isOpen && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 22 }}>
                      {service.highlights.map((h) => (
                        <div key={h} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#666" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: LIME, flexShrink: 0, display: "inline-block" }} />
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Toggle indicator */}
                  <div style={{
                    borderTop: "1px solid #f0efea",
                    padding: "12px 0",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: isOpen ? "#8ab830" : "#ccc", transition: "color 0.2s" }}>
                      {isOpen ? "Zavřít" : "Otevřít a rezervovat"}
                    </span>
                    <span style={{ fontSize: 14, color: isOpen ? "#8ab830" : "#ccc", transition: "color 0.2s, transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</span>
                  </div>
                </button>
                {/* ── EXPANDED BODY ── */}
                {isOpen && (
                  <div style={{ padding: "0 28px 32px" }}>
                    <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, margin: "0 0 24px" }}>
                      {service.description}
                    </p>
                    <div className="rez-card-inner">
                      {/* LEFT: variants + extras + fields */}
                      <div>
                        {/* Variants */}
                        <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c0bfb8", margin: "0 0 8px" }}>Vyberte variantu</p>
                        {service.variants.map((v, i) => {
                          const active = activeV === i;
                          return (
                            <div key={i}>
                              <label className="rez-variant-label" style={{
                                border: `1.5px solid ${active ? LIME : "#e8e7e2"}`,
                                background: active ? "#f6ffde" : "#fafaf8",
                              }}>
                                <span style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                  <input type="radio" name={`${service.id}-v`} checked={active}
                                    onChange={() => setSelectedVariants((s) => ({ ...s, [service.id]: i }))}
                                    style={{ accentColor: LIME, marginTop: 3, flexShrink: 0 }}
                                  />
                                  <span>
                                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: "#111", display: "block" }}>{v.label}</span>
                                    {v.sublabel && <span style={{ fontSize: 11, color: "#aaa", display: "block", marginTop: 2 }}>{v.sublabel}</span>}
                                  </span>
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: "#111", whiteSpace: "nowrap", flexShrink: 0 }}>
                                  {v.price.toLocaleString("cs-CZ")} Kč
                                </span>
                              </label>
                              {/* Bullets for active variant */}
                              {active && Array.isArray(v.bullets) && (
                                <div style={{ margin: "-3px 0 8px", padding: "10px 14px 12px", border: `1.5px solid ${LIME}`, borderTop: "none", borderRadius: "0 0 10px 10px", background: "#f9ffe8" }}>
                                  {v.bullets.map((b, bi) => (
                                    <div key={bi} style={{ display: "flex", gap: 8, fontSize: 12, color: "#555", marginBottom: 4, alignItems: "flex-start" }}>
                                      <span style={{ color: "#8ab830", fontWeight: 700, flexShrink: 0 }}>✓</span>{b}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {/* Extras */}
                        {service.extras.length > 0 && (
                          <div style={{ marginTop: 14 }}>
                            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c0bfb8", margin: "0 0 8px" }}>Volitelné doplňky</p>
                            {service.extras.map((extra, i) => (
                              <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#555", marginBottom: 7, cursor: "pointer", userSelect: "none" }}>
                                <input type="checkbox" checked={extrasState[service.id]?.[i] ?? false}
                                  onChange={(e) => setExtrasState((prev) => ({ ...prev, [service.id]: { ...(prev[service.id] ?? {}), [i]: e.target.checked } }))}
                                  style={{ accentColor: LIME, width: 15, height: 15 }}
                                />
                                <span style={{ flex: 1 }}>{extra.label}</span>
                                {extra.price > 0 && <span style={{ color: "#aaa", fontSize: 12, fontWeight: 600 }}>+ {extra.price.toLocaleString("cs-CZ")} Kč</span>}
                              </label>
                            ))}
                          </div>
                        )}
                        {/* Dynamic fields */}
                        {service.fields.length > 0 && (
                          <div style={{ marginTop: 16 }}>
                            {service.fields.map((field) => (
                              <div key={field.id} style={{ marginBottom: 14 }}>
                                <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c0bfb8", margin: "0 0 6px" }}>{field.label}</p>
                                {field.type === "text" && (
                                  <input className="rez-input" type="text" placeholder={field.placeholder}
                                    value={fieldValues[service.id]?.[field.id] ?? ""}
                                    onChange={(e) => setFieldValues((p) => ({ ...p, [service.id]: { ...(p[service.id] ?? {}), [field.id]: e.target.value } }))}
                                  />
                                )}
                                {field.type === "radio" && (
                                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {field.options?.map((opt) => {
                                      const sel = (fieldValues[service.id]?.[field.id] ?? "") === opt;
                                      return (
                                        <label key={opt} style={{
                                          display: "flex", alignItems: "center", gap: 7,
                                          padding: "7px 14px", border: `1.5px solid ${sel ? LIME : "#e8e7e2"}`,
                                          borderRadius: 8, cursor: "pointer", fontSize: 13,
                                          background: sel ? "#f6ffde" : "#fafaf8",
                                          color: "#333",
                                          fontWeight: sel ? 600 : 400, transition: "all 0.15s",
                                        }}>
                                          <input type="radio" name={`${service.id}-${field.id}`} value={opt} checked={sel}
                                            onChange={() => setFieldValues((p) => ({ ...p, [service.id]: { ...(p[service.id] ?? {}), [field.id]: opt } }))}
                                            style={{ accentColor: LIME }}
                                          />
                                          {opt}
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* RIGHT: contact + price + CTA */}
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ position: "sticky", top: 20 }}>
                          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c0bfb8", margin: "0 0 8px" }}>Vaše kontaktní údaje</p>
                          {[
                            { key: "name", placeholder: "Jméno a příjmení *", type: "text" },
                            { key: "email", placeholder: "E-mail *", type: "email" },
                            { key: "phone", placeholder: "Telefon (nepovinné)", type: "tel" },
                          ].map((f) => (
                            <input key={f.key} className="rez-input" type={f.type} placeholder={f.placeholder}
                              value={contact[f.key as keyof typeof contact]}
                              onChange={(e) => setContact((p) => ({ ...p, [f.key]: e.target.value }))}
                            />
                          ))}
                          {/* Price summary */}
                          <div style={{ background: "#f7f6f1", borderRadius: 12, padding: "16px 18px", margin: "18px 0 16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                              <span style={{ fontSize: 11, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                {isStripe ? "Celkem k úhradě" : "Konzultace"}
                              </span>
                              <span style={{ fontSize: 26, fontWeight: 900, color: "#111", letterSpacing: "-0.02em" }}>
                                {isStripe ? `${price.toLocaleString("cs-CZ")} Kč` : "Zdarma"}
                              </span>
                            </div>
                            {isStripe && extrasState[service.id] && Object.values(extrasState[service.id]).some(Boolean) && (
                              <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>Včetně vybraných doplňků</p>
                            )}
                          </div>
                          {/* CTA */}
                          <button className="rez-cta-btn"
                            onClick={() => handleSubmit(service)}
                            disabled={loading || !canSubmit()}
                            style={{ background: canSubmit() ? LIME : "#e5e4de", color: canSubmit() ? "#111" : "#aaa" }}
                          >
                            {loading ? "Ukládám…" : isStripe ? `💳 ${service.cta}` : `📅 ${service.cta}`}
                          </button>
                          {!canSubmit() && (contact.name || contact.email) && (
                            <p style={{ fontSize: 12, color: "#e07b5a", marginTop: 8, textAlign: "center" }}>
                              Vyplňte jméno a e-mail pro pokračování.
                            </p>
                          )}
                          {service.note && (
                            <p style={{ fontSize: 11.5, color: "#bbb", fontStyle: "italic", marginTop: 12, lineHeight: 1.55, textAlign: "center" }}>
                              {service.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* ── DOTAZ SEKCE ── */}
        <AskSection />
      </main>
    </>
  );
}

export default function RezervacePage() {
  return (
    <Suspense fallback={null}>
      <RezervaceContent />
    </Suspense>
  );
}
// ─── ASK SECTION ─────────────────────────────────────────────────────────────
function AskSection() {
  const LIME = "#b7e94c";
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const canSend = form.name.trim().length > 0 && form.email.includes("@") && form.message.trim().length > 0;
  const handleSend = async () => {
    setLoading(true);
    // TODO: POST na SmartMailing nebo vlastní endpoint
    // await submitToSmartMailing({ ...form, type: "dotaz" });
    console.log("[Dotaz]", form);
    await new Promise((r) => setTimeout(r, 600)); // simulace
    setSent(true);
    setLoading(false);
  };
  const topics = [
    "Portrétní focení",
    "Rodinné focení",
    "Prémiová vizuální identita",
    "Brand focení",
    "Něco jiného",
  ];
  return (
    <div style={{ maxWidth: 1100, margin: "72px auto 0", padding: "0 32px" }}>
      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", marginBottom: 10 }}>
          Chci se jen zeptat
        </p>
        <h2 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 900, color: "#111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Nejste si jisti? Zeptejte se.
        </h2>
        <p style={{ fontSize: 15, color: "#888", margin: "0 auto", maxWidth: 440, lineHeight: 1.6 }}>
          Odpovídáme osobně do 48 hodin. Žádné automatické prodejní sekvence.
        </p>
      </div>
      {/* Form card */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        padding: "40px 40px 36px",
        maxWidth: 640,
        margin: "0 auto",
      }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 8px" }}>Zpráva odeslána</h3>
            <p style={{ fontSize: 14, color: "#888", margin: 0, lineHeight: 1.6 }}>
              Ozveme se vám osobně do 48 hodin.<br />Žádné automatické zprávy, obdržíte přímou odpověď.
            </p>
          </div>
        ) : (
          <>
            {/* 2-col row: name + email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Jméno *</label>
                <input className="rez-input" type="text" placeholder="Jana Nováková"
                  value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>E-mail *</label>
                <input className="rez-input" type="email" placeholder="jana@firma.cz"
                  value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>
            {/* 2-col row: phone + topic */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px", marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Telefon <span style={{ color: "#ccc" }}>(nepovinné)</span></label>
                <input className="rez-input" type="tel" placeholder="+420 777 000 000"
                  value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div>
                <label style={labelStyle}>Téma dotazu</label>
                <select
                  value={form.topic}
                  onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 13px", border: "1.5px solid #e3e2dc",
                    borderRadius: 9, fontSize: 13, background: "#fafaf8",
                    boxSizing: "border-box" as const, outline: "none", color: form.topic ? "#333" : "#aaa",
                    fontFamily: "inherit", appearance: "none" as const,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 13px center",
                    cursor: "pointer",
                  }}
                >
                  <option value="">— vyberte —</option>
                  {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {/* Message */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Zpráva *</label>
              <textarea
                className="rez-input"
                placeholder="Napište nám, co vás zajímá nebo čeho chcete dosáhnout..."
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                rows={5}
                style={{
                  resize: "vertical", fontFamily: "inherit", lineHeight: 1.6,
                  marginBottom: 0, minHeight: 120,
                }}
              />
            </div>
            {/* CTA */}
            <button
              className="rez-cta-btn"
              onClick={handleSend}
              disabled={loading || !canSend}
              style={{ background: canSend ? LIME : "#e5e4de", color: canSend ? "#111" : "#aaa" }}
            >
              {loading ? "Odesílám…" : "Odeslat dotaz →"}
            </button>
            {!canSend && (form.name || form.email || form.message) && (
              <p style={{ fontSize: 12, color: "#e07b5a", marginTop: 8, textAlign: "center" }}>
                Vyplňte jméno, e-mail a zprávu.
              </p>
            )}
            <p style={{ fontSize: 12, color: "#ccc", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
              Odpovídáme osobně do 48 hodin.<br />Žádné automatické prodejní sekvence.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#c0bfb8",
  marginBottom: 6,
};
