"use client";

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
  { accent: PINK, title: "Web říká jedno. Sítě druhé.", text: "Zákazník přijde a odejde. Nezachytil co nabízíš — ne proto že ho to nezajímá, ale proto že to nebylo jasné." },
  { accent: YELLOW, title: "Máš 20 nástrojů. A stále nemáš systém.", text: "Jeden píše, druhý generuje, třetí analyzuje. Sedíš uprostřed a místo tvorby řešíš nástroje." },
  { accent: PURPLE, title: "Tohle není problém tvorby.", text: "Je to problém strategie. Brand Scan ukáže přesně kde — v číslech, ne v obecných radách." },
];

const PILLARS = [
  { icon: "💡", title: "Světlo", desc: "Jak jasná je tvoje hodnota zákazníkovi." },
  { icon: "⚡", title: "Energie", desc: "Jak silná je tvoje pozice na trhu." },
  { icon: "🏗", title: "Architektura", desc: "Jak dobře vedeš zákazníka k akci." },
  { icon: "🎯", title: "Identita", desc: "Jak rozpoznatelná je tvoje značka." },
  { icon: "🤝", title: "Důvěra", desc: "Proč by ti zákazník měl věřit." },
];

const STEPS = [
  { num: "01", title: "Zadáš web", text: "Stačí URL. AI udělá screenshot, přečte texty, analyzuje vizuální identitu a Brand DNA." },
  { num: "02", title: "Systém analyzuje", text: "Pět pilířů, celkové skóre, Brand DNA. Konkrétní čísla — ne obecné rady." },
  { num: "03", title: "Vidíš kde stojíš", text: "Přesné slabiny, silné stránky, doporučení AI stratéga. Výsledky které zůstanou." },
];

const BENEFITS = [
  "Celkové skóre značky (0–100)",
  "Hodnocení pěti pilířů s komentářem",
  "Brand DNA — positioning, tón, hodnota",
  "Doporučení AI stratéga pro tvoji značku",
  "Cílová skupina a jak ji oslovit",
  "Uložené výsledky — kdykoli se vrátíš",
];

const analyzerWrapperStyle: React.CSSProperties = {
  background: BG1,
  border: `1px solid ${BORDER}`,
  borderRadius: 18,
  padding: "28px 32px",
  boxShadow: "0 2px 20px rgba(0,0,0,0.05)",
};

export default function BrandScanPage() {
  return (
    <main className="font-sans" style={{ background: BG, color: TEXT }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-child { animation: fadeUp 0.5s ease forwards; opacity: 0; }
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

      {/* HERO */}
      <section
        className="flex min-h-[100vh] flex-col items-center justify-center"
        style={{ padding: "110px 40px 80px", maxWidth: 920, margin: "0 auto", textAlign: "center", background: BG }}
      >
        <span
          className="hero-child inline-block rounded-full border uppercase"
          style={{
            background: "rgba(183,233,76,0.15)",
            border: "1px solid rgba(183,233,76,0.45)",
            borderRadius: 100,
            padding: "5px 14px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: LIME_DARK,
            marginBottom: 28,
            animationDelay: "0.05s",
          }}
        >
          ● BRAND SCAN · ZDARMA
        </span>
        <h1
          className="hero-child max-w-[820px] leading-tight"
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(42px, 7vw, 84px)",
            fontWeight: 900,
            color: TEXT,
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            marginBottom: 22,
            animationDelay: "0.15s",
          }}
        >
          Víš jak tvoje značka vypadá <em style={{ fontStyle: "italic", color: LIME_DARK }}>zvenku?</em>
        </h1>
        <p
          className="hero-child max-w-[580px]"
          style={{ fontSize: 18, color: MUTED, lineHeight: 1.7, marginBottom: 36, animationDelay: "0.25s" }}
        >
          Zadej web. Za pár minut máš konkrétní čísla — kde ztrácíš zákazníky dřív než tě vůbec poznají.
        </p>
        <div
          className="hero-child w-full max-w-[880px]"
          style={{ marginBottom: 18, animationDelay: "0.35s" }}
        >
          <div style={analyzerWrapperStyle}>
            <StartAnalyzer diagnostika hideIntro />
          </div>
        </div>
        <p
          className="hero-child text-[12px]"
          style={{ color: "#ccc", animationDelay: "0.5s" }}
        >
          Zdarma · Bez registrace · Výsledky během minut
        </p>
      </section>

      {/* DIVIDER */}
      <div style={{ padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 1, background: BORDER }} />
      </div>

      {/* SEKCE PROBLÉM */}
      <section
        style={{
          background: BG1,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>
            PROBLÉM
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 900,
              color: TEXT,
              marginBottom: 48,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Máš značku. Ale nikdo to nevidí tak, jak ty.
          </h2>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
            {PROBLEM_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-[16px] border bg-white transition-shadow duration-200"
                style={{
                  border: `1px solid ${BORDER2}`,
                  padding: 28,
                  borderLeft: `3px solid ${card.accent}`,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.04)"; }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEKCE PILÍŘE */}
      <section style={{ background: BG }}>
        <div style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>
            CO MĚŘÍME
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 900,
              color: TEXT,
              marginBottom: 48,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Pět pilířů které rozhodují.
          </h2>
          <div className="grid grid-cols-2 gap-[14px] lg:grid-cols-5">
            {PILLARS.map((item) => (
              <div
                key={item.title}
                className="rounded-[14px] border bg-white text-center transition-all duration-200"
                style={{
                  border: `1px solid ${BORDER2}`,
                  padding: "22px 16px",
                  boxShadow: "0 1px 5px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = LIME;
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.07)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER2;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 5px rgba(0,0,0,0.04)";
                }}
              >
                <span className="block text-[26px] mb-2.5" style={{ marginBottom: 10 }} aria-hidden>{item.icon}</span>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.55 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEKCE JAK TO FUNGUJE */}
      <section
        id="jak-to-funguje"
        style={{
          background: BG1,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>
            JAK TO FUNGUJE
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 900,
              color: TEXT,
              marginBottom: 48,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Tři kroky. Výsledky hned.
          </h2>
          <div
            className="mb-12 h-0.5 rounded-sm"
            style={{
              height: 2,
              borderRadius: 2,
              background: `linear-gradient(to right, ${LIME}, ${PURPLE}, ${PINK})`,
              opacity: 0.2,
            }}
            aria-hidden
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="rounded-[16px] border bg-white transition-all duration-200"
                style={{
                  border: `1px solid ${BORDER2}`,
                  padding: 28,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.04)";
                }}
              >
                <div
                  className="mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 font-bold"
                  style={{ borderColor: LIME, fontSize: 13, color: LIME_DARK }}
                >
                  {step.num}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEKCE CO DOSTANEŠ */}
      <section style={{ background: BG }}>
        <div style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>
            CO DOSTANEŠ
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 900,
              color: TEXT,
              marginBottom: 48,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Výsledky Brand Scan.
          </h2>
          <ul className="flex flex-col" style={{ gap: 12, maxWidth: 640 }}>
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-3" style={{ fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
                <span
                  className="flex shrink-0 items-center justify-center rounded-full font-bold"
                  style={{
                    width: 22,
                    height: 22,
                    background: "rgba(183,233,76,0.15)",
                    border: "1px solid rgba(183,233,76,0.4)",
                    fontSize: 11,
                    color: LIME_DARK,
                  }}
                >
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SEKCE PREMIUM CTA */}
      <section
        style={{
          background: BG1,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>
            DALŠÍ KROK
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 900,
              color: TEXT,
              marginBottom: 28,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Výsledky jsou jen začátek.
          </h2>
          <div
            className="grid grid-cols-1 gap-8 rounded-[20px] border md:grid-cols-[1fr_auto] md:items-center"
            style={{
              background: BG,
              border: `1px solid ${BORDER2}`,
              padding: 40,
              gap: 32,
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: 28,
                  fontWeight: 900,
                  color: TEXT,
                  marginBottom: 12,
                  letterSpacing: "-0.02em",
                }}
              >
                Premium Brand hovor.
              </h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, marginBottom: 12 }}>
                Pokud chceš vědět co s tím — rezervuj Premium Brand hovor. Hodina která změní jak o značce přemýšlíš.
              </p>
              <p style={{ fontSize: 13, color: FAINT, marginBottom: 6 }}>
                7 800 Kč · strategický hovor · vizuální board · 3 Canva šablony na míru
              </p>
              <p style={{ fontSize: 12, color: FAINT }}>
                Pokud nebudete spokojeni — vrátíme celou částku. <span style={{ color: LIME_DARK, fontWeight: 700 }}>Obsah vám zůstane.</span>
              </p>
            </div>
            <div>
              <Link
                href="/premiova-vizualni-identita"
                className="inline-block rounded-[10px] px-[22px] py-3 text-[13px] font-bold no-underline transition-colors"
                style={{ border: "1.5px solid " + LIME, color: LIME_DARK, background: "transparent" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = LIME;
                  e.currentTarget.style.color = TEXT;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = LIME_DARK;
                }}
              >
                Zjistit více o Premium Brand →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ZÁVĚREČNÉ CTA */}
      <section style={{ padding: "96px 24px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(26px, 3.5vw, 38px)",
            fontWeight: 900,
            color: TEXT,
            marginBottom: 32,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Než investuješ do obsahu —
          <br />
          zjisti co skutečně nefunguje.
        </h2>
        <div className="mx-auto w-full max-w-[600px] text-left" style={analyzerWrapperStyle}>
          <StartAnalyzer diagnostika hideIntro />
        </div>
        <p style={{ fontSize: 12, color: FAINT, marginTop: 16 }}>
          Studio Lucifera · Kampa, Praha · AI u nás vychází z reálných fotek
        </p>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${BORDER}`,
          padding: "24px 40px",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          fontSize: 12,
          color: FAINT,
        }}
      >
        <Link href="/" className="no-underline" style={{ color: FAINT }}>
          ← Zpět na úvod
        </Link>
        <span>© 2026 Studio Lucifera</span>
        <span>Brand Scan · Zdarma</span>
      </footer>
    </main>
  );
}
