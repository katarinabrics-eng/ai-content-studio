"use client";
import { useState } from "react";
// ─── CALENDLY (jen Brand – konzultace zdarma před focením) ───────────────────
const CALENDLY: Record<string, string> = {
  brand: "https://calendly.com/lucifera/brand-konzultace", // ← doplň
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
  console.log("[Stripe stub] priceId:", priceId);
  alert(`Stripe: ${priceId} — doplň /api/checkout route.`);
}
// ─── TYPES ────────────────────────────────────────────────────────────────────
type Flow = "stripe" | "calendly";
interface Variant { label: string; price: number; stripeId: string; bullets?: string[]; sublabel?: string; }
interface Field { id: string; label: string; type: "text" | "radio"; placeholder?: string; options?: string[]; }
interface Service {
  id: string; emoji: string; title: string; tagline: string; priceFrom: number;
  description: string; variants: Variant[]; extras: { label: string; price: number }[];
  fields: Field[]; note: string; cta: string; flow: Flow; color: string;
}
// ─── PRODUCT DATA ─────────────────────────────────────────────────────────────
const SERVICES: Service[] = [
  // ── 1. PORTRÉTNÍ FOCENÍ ───────────────────────────────────────────────────
  {
    id: "portret",
    emoji: "◉",
    title: "Portrétní focení",
    tagline: "Autorský portrét v ateliéru · platba online",
    priceFrom: 4500,
    description:
      "Profesionální portrétní focení v ateliéru (autorský portrét). Zahrnuje přípravu, focení cca 1–2 hodiny a základní retuše. Výstup: vybrané fotografie v rozlišení vhodném pro web a tisk.",
    variants: [
      { label: "Portrét – autorský portrét STUDIO", price: 4500, stripeId: "price_XXXX_portret" },
    ],
    extras: [
      { label: "Přejete si vizážistku?", price: 3500 },
    ],
    fields: [
      {
        id: "typ",
        label: "Typ portrétu",
        type: "radio",
        options: ["Podnikatelský portrét", "Umělecký portrét", "Herecký / profesní portrét"],
      },
    ],
    note: "Konzultace zde není – stačí vyplnit dotazník. Termín focení zvolíte po platbě.",
    cta: "Zaplatit a rezervovat termín",
    flow: "stripe",
    color: "#b7e94c",
  },
  // ── 2. RODINNÉ FOCENÍ ─────────────────────────────────────────────────────
  {
    id: "rodina",
    emoji: "◈",
    title: "Rodinné focení",
    tagline: "Dokumentární nebo ateliérové · platba online",
    priceFrom: 4500,
    description:
      "Dokumentární zachycení rodiny v přirozeném prostředí (exteriér nebo váš interiér). Cca 2–3 hodiny, digitální nebo analogové snímky dle domluvy. Zahrnuje základní retuše a předání vybraných fotografií.",
    variants: [
      { label: "Reportážní dokumentární focení", price: 5800, stripeId: "price_XXXX_rodina_report" },
      { label: "Ateliérové focení stylizace", price: 8500, stripeId: "price_XXXX_rodina_styl" },
      { label: "Ateliérový rodinný portrét", price: 4500, stripeId: "price_XXXX_rodina_portret" },
    ],
    extras: [
      { label: "Přejete si vizážistku?", price: 3500 },
      { label: "Chcete pomoct s výběrem oblečení?", price: 0 },
    ],
    fields: [
      { id: "kde", label: "Kde si přejete fotit?", type: "text", placeholder: "např. park, byt, ateliér" },
      { id: "pocet", label: "Kolik vás bude?", type: "text", placeholder: "např. 4 osoby, 2 dospělí + 2 děti" },
      { id: "medium", label: "Preferujete fotky na analog nebo digitál?", type: "radio", options: ["Analog", "Digitál"] },
    ],
    note: "Termín focení zvolíte po dokončení platby.",
    cta: "Zaplatit a rezervovat termín",
    flow: "stripe",
    color: "#b7e94c",
  },
  // ── 3. PRÉMIOVÁ VIZUÁLNÍ IDENTITA ─────────────────────────────────────────
  {
    id: "identita",
    emoji: "◎",
    title: "Prémiová vizuální identita",
    tagline: "Strategický hovor · Vizuální board · Focení",
    priceFrom: 9900,
    description:
      "Jasná cena. Bez překvapení. Začněte strategickým hovorem. Focení a autopilot jsou váš další krok — pokud budete chtít.",
    variants: [
      {
        label: "Krok 1 · Vstup — Strategický hovor + Vizuální board",
        sublabel: "Strategický hovor 60 min + vizuální strategie",
        price: 9900,
        stripeId: "price_XXXX_vstup",
        bullets: [
          "Analýza vaší online přítomnosti",
          "Strategický hovor 60 minut",
          "20stránková prezentace – Marketingový plán a strategie",
          "Vizuál board vašich budoucích fotografií",
          "3 Canva šablony vycházející z vaší Brand DNA",
        ],
      },
      {
        label: "Krok 1 + 2 · Komplet — Hovor + Focení + Výstupy",
        sublabel: "Kompletní brand identita včetně dne focení",
        price: 39900,
        stripeId: "price_XXXX_komplet",
        bullets: [
          "Vše ze Kroku 1",
          "Den focení v ateliéru Praha Kampa",
          "5 stylů focení — každý cca 20 fotografií",
          "10 faceless fotek pro grafiku a kampaně",
          "1 minuta b-rollu pro Reels a video",
          "Focení přesně dle vizuálního boardu",
          "Prostor pro improvizaci a nápady",
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
    color: "#b7e94c",
  },
  // ── 4. BRAND FOCENÍ ───────────────────────────────────────────────────────
  {
    id: "brand",
    emoji: "◆",
    title: "Brand focení",
    tagline: "3 hodiny · 15 fotek · 3 scény · od 16 900 Kč",
    priceFrom: 16900,
    description:
      "Komplexní brand session pro podnikatele a firmy. Začínáme bezplatnou 30minutovou konzultací — pak teprve termín focení. Výstup: 15 upravených fotografií ve 3 různých scénách.",
    variants: [
      {
        label: "Brand focení STUDIO",
        sublabel: "3 hodiny · 15 upravených fotek · 3 změny scény",
        price: 16900,
        stripeId: "price_XXXX_brand",
        bullets: [
          "30minutová konzultace zdarma (před focením)",
          "3 hodiny focení v ateliéru",
          "3 změny scény dle předem dohodnutého plánu",
          "15 upravených fotografií ve vysokém rozlišení",
          "Fotografie připravené pro web, Instagram i LinkedIn",
        ],
      },
      {
        label: "Brand focení STUDIO + Video",
        sublabel: "Vše výše + 1 minuta b-rollu pro Reels",
        price: 22900,
        stripeId: "price_XXXX_brand_video",
        bullets: [
          "30minutová konzultace zdarma (před focením)",
          "3 hodiny focení v ateliéru",
          "3 změny scény dle předem dohodnutého plánu",
          "15 upravených fotografií ve vysokém rozlišení",
          "1 minuta b-rollu pro Reels a video obsah",
          "Fotografie i video připravené pro web a sítě",
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
    note: "Nejprve si zarezervujete bezplatnou 30minutovou konzultaci. Termín focení a platbu domluvíme společně po ní.",
    cta: "Rezervovat konzultaci zdarma",
    flow: "calendly",
    color: "#b7e94c",
  },
];
// ─── INPUT STYLE ─────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 11px",
  border: "1px solid #e3e2dc",
  borderRadius: 8,
  fontSize: 12.5,
  background: "#fafaf8",
  boxSizing: "border-box",
  outline: "none",
  color: "#333",
};
// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function RezervacePage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [extrasState, setExtrasState] = useState<Record<string, Record<number, boolean>>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string>>>({});
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));
  const getPrice = (service: Service) => {
    const vIdx = selectedVariants[service.id] ?? 0;
    let total = service.variants[vIdx]?.price ?? service.priceFrom;
    service.extras.forEach((e, i) => {
      if (e.price > 0 && extrasState[service.id]?.[i]) total += e.price;
    });
    return total;
  };
  const canSubmit = () => contact.name.trim().length > 0 && contact.email.includes("@");
  const handleSubmit = async (service: Service) => {
    setLoading(true);
    const vIdx = selectedVariants[service.id] ?? 0;
    const variant = service.variants[vIdx];
    const fields = fieldValues[service.id] ?? {};
    await submitToSmartMailing({
      ...contact,
      service: service.id,
      variant: variant.label,
      price: String(getPrice(service)),
      ...fields,
    });
    if (service.flow === "stripe") {
      await redirectToStripe(variant.stripeId);
    } else {
      const base = CALENDLY[service.id];
      const params = new URLSearchParams({ name: contact.name, email: contact.email, a1: variant.label });
      window.open(`${base}?${params.toString()}`, "_blank");
    }
    setLoading(false);
  };
  return (
    <main style={{ minHeight: "100vh", background: "#f7f6f1", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", padding: "0 0 100px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "64px 24px 40px" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#aaa", marginBottom: 14 }}>
          Lucifera Studio
        </p>
        <h1 style={{ fontSize: "clamp(26px, 4.5vw, 46px)", fontWeight: 800, color: "#111", margin: "0 0 10px", lineHeight: 1.1 }}>
          Spolupráce začíná jasností.
        </h1>
        <p style={{ fontSize: 15, color: "#777", margin: "0 auto", maxWidth: 500 }}>
          Vyberte typ spolupráce. Každá služba má jiný proces — provedeme vás krok za krokem.
        </p>
      </div>
      {/* Info strip */}
      <div style={{ maxWidth: 800, margin: "0 auto 48px", padding: "0 24px" }}>
        <div style={{
          border: "1px solid #e3e2dc", borderRadius: 14, padding: "18px 24px", background: "#fff",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px",
        }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#bbb", margin: "0 0 5px" }}>Co se zde odehrává</p>
            <p style={{ fontSize: 12.5, color: "#666", margin: 0, lineHeight: 1.65 }}>
              Zvolte typ spolupráce, vyplňte základní údaje. Portrét, rodinné focení a prémiová identita se hradí online. Brand focení začíná bezplatnou konzultací.
            </p>
          </div>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#bbb", margin: "0 0 5px" }}>Co potřebujete k zahájení</p>
            <p style={{ fontSize: 12.5, color: "#666", margin: 0, lineHeight: 1.65 }}>
              U prémiové identity a brand focení: URL vašeho webu. U ostatních stačí vyplnit krátký dotazník a zaplatit online.
            </p>
          </div>
        </div>
      </div>
      {/* Cards */}
      <div style={{
        maxWidth: 1180, margin: "0 auto", padding: "0 24px",
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))",
        gap: 14, alignItems: "start",
      }}>
        {SERVICES.map((service) => {
          const isOpen = openId === service.id;
          const isStripe = service.flow === "stripe";
          const price = getPrice(service);
          return (
            <div key={service.id} style={{
              background: "#fff", borderRadius: 18,
              border: `2px solid ${isOpen ? service.color : "transparent"}`,
              boxShadow: isOpen ? "0 12px 40px rgba(0,0,0,0.10)" : "0 2px 14px rgba(0,0,0,0.055)",
              transition: "border-color 0.2s, box-shadow 0.25s", overflow: "hidden",
            }}>
              {/* Card header */}
              <button onClick={() => toggle(service.id)} style={{
                width: "100%", padding: "20px 20px 14px", background: "none",
                border: "none", cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>{service.emoji}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {isStripe ? (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", background: "#111", color: "#fff", padding: "2px 8px", borderRadius: 20 }}>
                        💳 PLATBA ONLINE
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", background: "#f0efea", color: "#888", padding: "2px 8px", borderRadius: 20 }}>
                        📅 KONZULTACE ZDARMA
                      </span>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                      background: isOpen ? service.color : "#f0efea",
                      color: isOpen ? "#111" : "#999",
                      padding: "3px 10px", borderRadius: 20, transition: "background 0.2s, color 0.2s",
                    }}>
                      od {service.priceFrom.toLocaleString("cs-CZ")} Kč
                    </span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 3px" }}>{service.title}</p>
                  <p style={{ fontSize: 12, color: "#999", margin: 0, lineHeight: 1.4 }}>{service.tagline}</p>
                </div>
                <p style={{
                  fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase",
                  fontWeight: 600, color: isOpen ? "#8ab830" : "#ccc", margin: "4px 0 0", transition: "color 0.2s",
                }}>
                  {isOpen ? "▲ Zavřít" : "▼ Otevřít a rezervovat"}
                </p>
              </button>
              {/* Expanded */}
              {isOpen && (
                <div style={{ padding: "0 20px 24px", borderTop: "1px solid #f2f1ec" }}>
                  <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: "16px 0 18px" }}>
                    {service.description}
                  </p>
                  {/* Variants */}
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#bbb", margin: "0 0 7px" }}>
                      Vyberte variantu
                    </p>
                    {service.variants.map((v, i) => {
                      const active = (selectedVariants[service.id] ?? 0) === i;
                      const hasBullets = Array.isArray(v.bullets);
                      return (
                        <div key={i} style={{ marginBottom: 7 }}>
                          <label style={{
                            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                            padding: "10px 12px",
                            border: `1.5px solid ${active ? service.color : "#e8e7e2"}`,
                            borderRadius: hasBullets && active ? "9px 9px 0 0" : 9,
                            cursor: "pointer",
                            background: active ? "#f6ffde" : "#fafaf8",
                            transition: "all 0.15s", gap: 8,
                          }}>
                            <span style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                              <input
                                type="radio"
                                name={`${service.id}-variant`}
                                checked={active}
                                onChange={() => setSelectedVariants((s) => ({ ...s, [service.id]: i }))}
                                style={{ accentColor: service.color, marginTop: 3, flexShrink: 0 }}
                              />
                              <span>
                                <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: "#111", display: "block", lineHeight: 1.3 }}>{v.label}</span>
                                {v.sublabel && <span style={{ fontSize: 11, color: "#999", display: "block", marginTop: 2 }}>{v.sublabel}</span>}
                              </span>
                            </span>
                            <span style={{ fontWeight: 800, color: "#111", whiteSpace: "nowrap", paddingLeft: 8, fontSize: 14, flexShrink: 0 }}>
                              {v.price.toLocaleString("cs-CZ")} Kč
                            </span>
                          </label>
                          {hasBullets && active && (
                            <div style={{
                              padding: "10px 12px 12px",
                              border: `1.5px solid ${service.color}`, borderTop: "none",
                              borderRadius: "0 0 9px 9px", background: "#f9ffe8",
                            }}>
                              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                                {v.bullets!.map((b, bi) => (
                                  <li key={bi} style={{ fontSize: 12, color: "#555", marginBottom: 4, display: "flex", gap: 7, alignItems: "flex-start" }}>
                                    <span style={{ color: "#8ab830", flexShrink: 0, marginTop: 1, fontWeight: 700 }}>✓</span>
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Extras */}
                  {service.extras.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      {service.extras.map((extra, i) => (
                        <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#666", marginBottom: 6, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={extrasState[service.id]?.[i] ?? false}
                            onChange={(e) => setExtrasState((prev) => ({ ...prev, [service.id]: { ...(prev[service.id] ?? {}), [i]: e.target.checked } }))}
                            style={{ accentColor: service.color }}
                          />
                          {extra.label}
                          {extra.price > 0 && <span style={{ color: "#aaa", marginLeft: "auto" }}>+ {extra.price.toLocaleString("cs-CZ")} Kč</span>}
                        </label>
                      ))}
                    </div>
                  )}
                  {/* Fields */}
                  {service.fields.map((field) => (
                    <div key={field.id} style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#bbb", margin: "0 0 5px" }}>{field.label}</p>
                      {field.type === "text" && (
                        <input
                          type="text" placeholder={field.placeholder}
                          value={fieldValues[service.id]?.[field.id] ?? ""}
                          onChange={(e) => setFieldValues((prev) => ({ ...prev, [service.id]: { ...(prev[service.id] ?? {}), [field.id]: e.target.value } }))}
                          style={inputStyle}
                        />
                      )}
                      {field.type === "radio" && field.options?.map((opt) => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#555", marginBottom: 5, cursor: "pointer" }}>
                          <input
                            type="radio" name={`${service.id}-${field.id}`} value={opt}
                            checked={(fieldValues[service.id]?.[field.id] ?? "") === opt}
                            onChange={() => setFieldValues((prev) => ({ ...prev, [service.id]: { ...(prev[service.id] ?? {}), [field.id]: opt } }))}
                            style={{ accentColor: service.color }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ))}
                  {service.note && (
                    <p style={{ fontSize: 11.5, color: "#aaa", fontStyle: "italic", margin: "10px 0 0", lineHeight: 1.55 }}>
                      {service.note}
                    </p>
                  )}
                  <div style={{ borderTop: "1px solid #f0efea", margin: "16px 0 14px" }} />
                  {/* Contact */}
                  <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#bbb", margin: "0 0 8px" }}>
                    Vaše kontaktní údaje
                  </p>
                  {[
                    { key: "name", placeholder: "Jméno a příjmení *", type: "text" },
                    { key: "email", placeholder: "E-mail *", type: "email" },
                    { key: "phone", placeholder: "Telefon (nepovinné)", type: "tel" },
                  ].map((f) => (
                    <input
                      key={f.key} type={f.type} placeholder={f.placeholder}
                      value={contact[f.key as keyof typeof contact]}
                      onChange={(e) => setContact((p) => ({ ...p, [f.key]: e.target.value }))}
                      style={{ ...inputStyle, marginBottom: 6 }}
                    />
                  ))}
                  {/* Price + CTA */}
                  <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    {isStripe ? (
                      <div>
                        <p style={{ fontSize: 10, color: "#ccc", margin: "0 0 1px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Celkem</p>
                        <p style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: 0 }}>{price.toLocaleString("cs-CZ")} Kč</p>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: 10, color: "#ccc", margin: "0 0 1px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Konzultace</p>
                        <p style={{ fontSize: 18, fontWeight: 900, color: "#111", margin: 0 }}>Zdarma</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleSubmit(service)}
                      disabled={loading || !canSubmit()}
                      style={{
                        background: canSubmit() ? service.color : "#e5e4de",
                        color: canSubmit() ? "#111" : "#aaa",
                        border: "none", borderRadius: 10, padding: "12px 20px",
                        fontSize: 13, fontWeight: 700,
                        cursor: canSubmit() ? "pointer" : "not-allowed",
                        display: "flex", alignItems: "center", gap: 6,
                        whiteSpace: "nowrap", transition: "background 0.2s, color 0.2s",
                      }}
                    >
                      {loading ? "Ukládám…" : isStripe ? `💳 ${service.cta}` : `📅 ${service.cta}`}
                    </button>
                  </div>
                  {!canSubmit() && (contact.name || contact.email) && (
                    <p style={{ fontSize: 11, color: "#e07b5a", marginTop: 8, textAlign: "right" }}>
                      Vyplňte jméno a e-mail pro pokračování.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
