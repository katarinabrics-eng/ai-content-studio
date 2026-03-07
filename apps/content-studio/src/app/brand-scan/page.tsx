"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { StartAnalyzer } from "../start/StartAnalyzer";

// CSS proměnné podle specu
const LIME = "#b7e94c";
const LIME2 = "#d0ec78";
const LIME3 = "#d3ee7f";
const LIME_DARK = "#5a8a00";
const PINK = "#d4457a";
const YELLOW = "#c9960a";
const PURPLE = "#7c4dbe";
const TEXT = "#111";
const MUTED = "#555";
const FAINT = "#999";
const BORDER = "rgba(0,0,0,0.09)";
const BORDER2 = "rgba(0,0,0,0.14)";
const BG = "#fff";
const BG1 = "#f7f7f5";
const BG2 = "#f0efeb";

const navItems = [
  { href: "/brand-scan", label: "Brand Scan" },
  { href: "/#sluzby", label: "Služby" },
  { href: "/portrety", label: "Portréty" },
  { href: "/premiova-vizualni-identita", label: "Prémiová identita" },
  { href: "/#zaver", label: "Kontakt" },
];

const PROBLEM_CARDS = [
  { accent: PINK, title: "Web říká jedno. Sítě druhé.", text: "Zákazník přijde a odejde — ne proto že ho to nezajímá, ale proto že to nebylo jasné." },
  { accent: YELLOW, title: "Máš nástroje. Nemáš systém.", text: "Jeden píše, druhý generuje, třetí analyzuje. Sedíte uprostřed a místo tvorby řešíte nástroje." },
  { accent: PURPLE, title: "Tohle není problém tvorby.", text: "Je to problém strategie. Brand Scan ukáže přesně kde — v číslech, ne v obecných radách." },
];

const PILLARS = [
  { icon: "💡", title: "Hodnota", desc: "Jak jasná je vaše nabídka zákazníkovi." },
  { icon: "⚡", title: "Pozice", desc: "Jak silné je vaše místo na trhu." },
  { icon: "🏗", title: "Architektura", desc: "Jak dobře vedete zákazníka k akci." },
  { icon: "🎯", title: "Identita", desc: "Jak rozpoznatelná je vaše značka." },
  { icon: "🤝", title: "Důvěra", desc: "Proč by vám zákazník měl věřit." },
];

const STEPS = [
  { num: "01", title: "Zadáte web", text: "Stačí URL. AI udělá screenshot, přečte texty, analyzuje vizuální identitu a Brand DNA." },
  { num: "02", title: "Systém analyzuje", text: "Pět pilířů, celkové skóre, Brand DNA. Konkrétní čísla — ne obecné rady." },
  { num: "03", title: "Vidíte kde stojíte", text: "Přesné slabiny, silné stránky, doporučení AI stratéga. Výsledky které zůstanou." },
];

const BENEFITS = [
  "Celkové skóre značky (0–100)",
  "Hodnocení pěti pilířů s komentářem",
  "Brand DNA — positioning, tón, hodnota",
  "Doporučení AI stratéga pro tvoji značku",
  "Cílová skupina a jak ji oslovit",
  "Uložené výsledky — kdykoli se vrátíš",
];

const HERO_CHECKLIST = ["Screenshot webu", "Analýza textu", "Brand DNA", "Skóre čitelnosti"];

const ORANGE_REF = "#e87040";
const YELLOW_REF = "#e8c000";
const TAG_RED = "#c03030";
const MOCKUP_PILLARS = [
  { icon: "💡", label: "Světlo", color: LIME, value: 6, pct: 60 },
  { icon: "⚡", label: "Energie", color: YELLOW_REF, value: 5, pct: 50 },
  { icon: "🏗", label: "Architektura", color: ORANGE_REF, value: 4, pct: 40 },
  { icon: "🎯", label: "Identita", color: PURPLE, value: 7, pct: 70 },
  { icon: "🤝", label: "Důvěra", color: LIME, value: 5, pct: 55 },
];
const MOCKUP_DOMAIN = "contentpro.cz";

const analyzerWrapperStyle: React.CSSProperties = {
  maxWidth: 860,
  width: "100%",
  margin: "0 auto",
  background: "linear-gradient(180deg, #fafaf8 0%, #f5f4f0 100%)",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 20,
  padding: "32px 36px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.5) inset",
};

export default function BrandScanPage() {
  const stepsSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = stepsSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("steps-inview");
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="font-sans" style={{ background: BG, color: TEXT }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-left > * { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .hero-left > *:nth-child(1) { animation-delay: 0.05s; }
        .hero-left > *:nth-child(2) { animation-delay: 0.15s; }
        .hero-left > *:nth-child(3) { animation-delay: 0.25s; }
        .hero-left > *:nth-child(4) { animation-delay: 0.35s; }
        .hero-left > *:nth-child(5) { animation-delay: 0.42s; }
        .hero-left > *:nth-child(6) { animation-delay: 0.5s; }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes ringGlow {
          0%, 100% { box-shadow: 0 0 0 4px rgba(183,233,76,0.3), inset 0 0 12px rgba(183,233,76,0.08); }
          50% { box-shadow: 0 0 0 6px rgba(183,233,76,0.5), inset 0 0 16px rgba(183,233,76,0.12); }
        }
        .float-badge { animation: floatBadge 3s ease-in-out infinite; }
        .ring-glow { animation: ringGlow 2.5s ease-in-out infinite; }
        @media (max-width: 900px) {
          .hero-section { grid-template-columns: 1fr !important; padding: 100px 24px 60px !important; }
          .hero-section > div:last-child { order: -1; justify-self: center; max-width: 100%; }
        }
        @media (max-width: 640px) {
          .brand-scan-analyzer-card { padding: 24px 20px !important; border-radius: 16px !important; }
        }
        .steps-section .steps-card-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.55s ease, transform 0.55s ease, box-shadow 0.3s ease; }
        .steps-section.steps-inview .steps-card-reveal { opacity: 1; transform: translateY(0); }
        .steps-section.steps-inview .steps-card-reveal:nth-child(1) { transition-delay: 0.05s; }
        .steps-section.steps-inview .steps-card-reveal:nth-child(3) { transition-delay: 0.18s; }
        .steps-section.steps-inview .steps-card-reveal:nth-child(5) { transition-delay: 0.32s; }
        .steps-card-reveal:hover { transform: translateY(-5px) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .steps-section .step-num-reveal { opacity: 0; transform: scale(0.92); transition: opacity 0.4s ease, transform 0.4s ease; }
        .steps-section.steps-inview .step-num-reveal { opacity: 1; transform: scale(1); }
        .steps-section.steps-inview .steps-card-reveal:nth-child(1) .step-num-reveal { transition-delay: 0.12s; }
        .steps-section.steps-inview .steps-card-reveal:nth-child(3) .step-num-reveal { transition-delay: 0.28s; }
        .steps-section.steps-inview .steps-card-reveal:nth-child(5) .step-num-reveal { transition-delay: 0.45s; }
        .step-connector { display: flex; align-items: center; justify-content: center; color: rgba(183,233,76,0.6); font-size: 18px; font-weight: 300; }
        @media (max-width: 768px) { .step-connector { display: none !important; } .steps-cards-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* NAV */}
      <nav
        className="fixed left-0 right-0 top-0 z-50 flex h-[60px] items-center"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${BORDER}`,
          padding: "0 40px",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src="/placeholders/LUCIFERA-Logo-Left.png"
            alt="Lucifera"
            style={{ height: "32px", width: "auto" }}
          />
        </Link>
        <div className="hidden items-center lg:flex" style={{ gap: 26 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] no-underline transition-colors"
              style={{ color: MUTED, fontWeight: 500 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = TEXT; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-[7px] px-[13px] py-[7px] text-[13px] no-underline transition-colors"
            style={{ color: MUTED }}
            onMouseEnter={(e) => { e.currentTarget.style.background = BG2; e.currentTarget.style.color = TEXT; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = MUTED; }}
          >
            Pro klienty
          </Link>
          <Link
            href="/rezervace"
            className="rounded-[8px] px-[18px] py-2 text-[13px] font-bold no-underline transition-all duration-200"
            style={{ background: LIME, color: TEXT }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = LIME2;
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(183,233,76,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = LIME;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Domluvit konzultaci
          </Link>
        </div>
      </nav>

      {/* HERO — centrovaný grid, vyvážené rozestupy */}
      <section
        className="hero-section"
        style={{
          padding: "110px 48px 80px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          alignItems: "center",
          minHeight: "100vh",
          background: BG,
        }}
      >
        <div className="hero-left" style={{ display: "flex", flexDirection: "column" }}>
          <h1
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 1.1,
              color: TEXT,
              marginBottom: 18,
              letterSpacing: "-0.02em",
            }}
          >
            Zadáš web. Za pár minut víš, kde ztrácíš zákazníky.
          </h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.7, marginBottom: 24, maxWidth: 460 }}>
            Bezplatná diagnostika značky v konkrétních číslech. Bez registrace. Výsledky, které zůstanou.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {HERO_CHECKLIST.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: MUTED }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: LIME,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: TEXT,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#bbb", marginBottom: 28 }}>Zdarma · Bez registrace · Výsledky během minut</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="#analyzer"
              style={{
                background: LIME,
                color: TEXT,
                borderRadius: 8,
                padding: "12px 28px",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Spustit diagnostiku zdarma →
            </Link>
            <Link
              href="#jak-to-funguje"
              style={{
                background: "transparent",
                border: "1.5px solid " + BORDER,
                borderRadius: 8,
                padding: "9px 20px",
                fontSize: 13,
                fontWeight: 600,
                color: MUTED,
                textDecoration: "none",
              }}
            >
              Jak to funguje
            </Link>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          {/* Floating karta 1 — Identita nalezena */}
          <div
            className="float-badge"
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "12px 16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(183,233,76,0.1)",
                border: "1px solid rgba(183,233,76,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              🎯
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Identita nalezena</div>
              <div style={{ fontSize: 10, color: FAINT }}>Brand DNA kompletní</div>
            </div>
          </div>

          {/* Karta skóre */}
          <div
            style={{
              background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{MOCKUP_DOMAIN}</div>
                <span style={{ fontSize: 11, color: FAINT, display: "block", marginTop: 1 }}>Analýza dokončena · právě teď</span>
              </div>
              <div
                className="ring-glow"
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  border: "4px solid " + LIME,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(183,233,76,0.06)",
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 900, color: LIME_DARK, lineHeight: 1 }}>55</span>
                <span style={{ fontSize: 9, color: FAINT }}>/100</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {MOCKUP_PILLARS.map((p) => (
                <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 12, color: MUTED, width: 100, flexShrink: 0 }}>{p.icon} {p.label}</div>
                  <div style={{ flex: 1, height: 6, background: BG2, borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${p.pct}%`,
                        background: p.color,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TEXT, width: 18, textAlign: "right" }}>{p.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 100,
                  letterSpacing: "0.04em",
                  background: "rgba(183,233,76,0.12)",
                  color: LIME_DARK,
                  border: "1px solid rgba(183,233,76,0.3)",
                }}
              >
                ✓ Silná identita
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 100,
                  letterSpacing: "0.04em",
                  background: "rgba(220,60,60,0.08)",
                  color: TAG_RED,
                  border: "1px solid rgba(220,60,60,0.2)",
                }}
              >
                ↓ Slabá architektura
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 100,
                  letterSpacing: "0.04em",
                  background: BG1,
                  color: MUTED,
                  border: `1px solid ${BORDER}`,
                }}
              >
                Průměrná energie
              </span>
            </div>
          </div>

          {/* Floating karta 2 — Stratég doporučen */}
          <div
            className="float-badge"
            style={{
              position: "absolute",
              bottom: -16,
              left: -20,
              background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "12px 16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(183,233,76,0.1)",
                border: "1px solid rgba(183,233,76,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              🧠
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Stratég doporučen</div>
              <div style={{ fontSize: 10, color: FAINT }}>Architekt · 87% shoda</div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁŘ — Spustit analýzu */}
      <section
        id="analyzer"
        style={{
          background: BG1,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "80px 40px",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 12 }}>
            Spustit analýzu
          </p>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 38, fontWeight: 900, color: TEXT, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Zadejte web.
          </h2>
          <p style={{ fontSize: 16, color: MUTED, marginBottom: 32, lineHeight: 1.6 }}>Zbytek uděláme za vás.</p>
          <div style={analyzerWrapperStyle} className="brand-scan-analyzer-card">
            <StartAnalyzer diagnostika hideIntro />
          </div>
          <p style={{ fontSize: 12, color: "#ccc", marginTop: 12 }}>Zdarma · Bez registrace · Výsledky během minut</p>
        </div>
      </section>

      {/* SEKCE PROBLÉM */}
      <section
        style={{
          background: BG1,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "80px 40px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 12 }}>
            Problém
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: 36,
              fontWeight: 900,
              color: TEXT,
              marginBottom: 40,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Máš značku. Ale zákazník to nevidí.
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3" style={{ gap: 20 }}>
            {PROBLEM_CARDS.map((card, i) => (
              <div
                key={card.title}
                style={{
                  background: BG,
                  border: i === 2 ? "1px solid rgba(183,233,76,0.4)" : `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: 28,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                  ...(i === 2 && { background: "rgba(183,233,76,0.04)" }),
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, color: i === 2 ? LIME_DARK : TEXT, marginBottom: 10, lineHeight: 1.3 }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEKCE PILÍŘE */}
      <section style={{ background: BG, padding: "80px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 12 }}>
            Co měříme
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: 36,
              fontWeight: 900,
              color: TEXT,
              marginBottom: 40,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Pět pilířů které rozhodují.
          </h2>
          <p style={{ fontSize: 15, color: MUTED, marginTop: -28, marginBottom: 0, maxWidth: 560 }}>
            Každý pilíř říká něco konkrétního o tom proč zákazníci zůstávají — nebo odcházejí.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginTop: 40 }}>
            {PILLARS.map((item) => (
              <div
                key={item.title}
                style={{
                  background: BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "24px 18px",
                  textAlign: "center",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }} aria-hidden>{item.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEKCE JAK TO FUNGUJE */}
      <section
        ref={stepsSectionRef}
        id="jak-to-funguje"
        className="steps-section"
        style={{
          background: BG1,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "80px 40px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 12 }}>
            Jak to funguje
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: 36,
              fontWeight: 900,
              color: TEXT,
              marginBottom: 40,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Tři kroky. Výsledky hned.
          </h2>
          <p style={{ fontSize: 14, color: FAINT, marginTop: -28 }}>Žádná registrace. Žádné čekání. Jen URL a výsledky.</p>
          <div
            className="steps-cards-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr auto 1fr",
              gap: 20,
              alignItems: "stretch",
              marginTop: 40,
            }}
          >
            {STEPS.flatMap((step, i) => [
              <div
                key={step.num}
                className="steps-card-reveal"
                style={{
                  background: BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: 28,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="step-num-reveal"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: LIME,
                    color: TEXT,
                    fontSize: 14,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  {step.num}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{step.text}</p>
              </div>,
              ...(i < STEPS.length - 1 ? [<span key={`conn-${i}`} className="step-connector" aria-hidden>→</span>] : []),
            ])}
          </div>
        </div>
      </section>

      {/* SEKCE CO DOSTANEŠ */}
      <section style={{ background: BG1, borderTop: `1px solid ${BORDER}`, padding: "80px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 12 }}>
            Co dostaneš
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: 36,
              fontWeight: 900,
              color: TEXT,
              marginBottom: 40,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Výsledky Brand Scan.
          </h2>
          <p style={{ fontSize: 15, color: MUTED, marginTop: -28 }}>Kompletní obraz tvé značky — zdarma, bez závazku.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 40 }}>
            {[
              { icon: "📊", title: "Celkové skóre značky (0–100)", desc: "Hodnocení pěti pilířů s komentářem — konkrétní čísla, ne obecné rady." },
              { icon: "🧬", title: "Brand DNA", desc: "Positioning, tón komunikace, unikátní hodnota — přesně jak tě vidí zákazník." },
              { icon: "🎯", title: "Doporučení AI stratéga", desc: "Systém doporučí nejvhodnějšího stratéga pro tvoji značku a situaci." },
              { icon: "👥", title: "Cílová skupina", desc: "Kdo tě sleduje a jak ji oslovit — uložené výsledky, kdykoli se vrátíš." },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: 24,
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(183,233,76,0.1)",
                    border: "1px solid rgba(183,233,76,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 32,
              background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              padding: 36,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 24,
              alignItems: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 8 }}>Další krok</p>
              <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 26, fontWeight: 900, color: TEXT, marginBottom: 10, letterSpacing: "-0.02em" }}>Výsledky jsou jen začátek.</h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 12 }}>Pokud chceš vědět co s tím — rezervuj Premium Brand hovor. Hodina která změní jak o značce přemýšlíš.</p>
              <p style={{ fontSize: 12, color: FAINT }}>7 800 Kč · strategický hovor · vizuální board · 3 Canva šablony na míru</p>
              <p style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>Pokud nebudete spokojeni — vrátíme celou částku. Obsah vám zůstane.</p>
            </div>
            <Link
              href="/premiova-vizualni-identita"
              style={{
                padding: "13px 26px",
                fontSize: 14,
                fontWeight: 700,
                whiteSpace: "nowrap",
                background: LIME,
                color: TEXT,
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Zjistit více o Premium Brand →
            </Link>
          </div>
        </div>
      </section>

      {/* ZÁVĚREČNÉ CTA */}
      <section style={{ padding: "80px 40px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: 36,
            fontWeight: 900,
            color: TEXT,
            marginBottom: 16,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Než investuješ do obsahu — zjisti co skutečně nefunguje.
        </h2>
        <p style={{ fontSize: 16, color: MUTED, marginBottom: 32, lineHeight: 1.6 }}>Zdarma. Bez registrace. Výsledky do 2 minut.</p>
        <Link
          href="#analyzer"
          style={{
            display: "inline-block",
            padding: "14px 36px",
            fontSize: 16,
            fontWeight: 700,
            background: LIME,
            color: TEXT,
            borderRadius: 12,
            textDecoration: "none",
          }}
        >
          Spustit Brand Scan →
        </Link>
        <p style={{ fontSize: 12, color: FAINT, marginTop: 14 }}>Ukázková analýza je vstupní fází před strategickou konzultací.</p>
      </section>

      {/* FOOTER — tmavý jako v referenci */}
      <footer
        style={{
          background: "#111",
          color: "rgba(255,255,255,0.5)",
          padding: "32px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          fontSize: 12,
        }}
      >
        <div style={{ color: "white", fontWeight: 700, letterSpacing: "0.05em" }}>
          LUCIFERA <span style={{ color: LIME }}>·</span> AI Content System
        </div>
        <div>Studio Lucifera · Kampa, Praha · AI u nás vychází z reálných fotek</div>
        <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
          ← Zpět na úvod
        </Link>
      </footer>
    </main>
  );
}
