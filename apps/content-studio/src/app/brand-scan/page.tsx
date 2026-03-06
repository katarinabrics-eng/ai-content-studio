"use client";

import Link from "next/link";
import { StartAnalyzer } from "../start/StartAnalyzer";

const LIME = "#b7e94c";
const LIME_DARK = "#5a8a00";
const PINK = "#d4457a";
const YELLOW = "#c9960a";
const PURPLE = "#7c4dbe";
const ORANGE = "#e07c3c";
const TEXT = "#111111";
const MUTED = "#555555";
const FAINT = "#999999";
const BG = "#ffffff";
const BG1 = "#f7f7f5";
const BORDER = "rgba(0,0,0,0.09)";
const BORDER2 = "rgba(0,0,0,0.14)";

const navItems = [
  { href: "/brand-scan", label: "Brand Scan" },
  { href: "/#sluzby", label: "Služby" },
  { href: "/portrety", label: "Portréty" },
  { href: "/premiova-vizualni-identita", label: "Prémiová identita" },
  { href: "/#zaver", label: "Kontakt" },
];

const HERO_CHECKLIST = [
  "Screenshot webu",
  "Analýza textu",
  "Claude Vision",
  "Brand DNA",
];

const MOCKUP_PILLARS = [
  { icon: "🌟", label: "Světlo", color: LIME, value: 6 },
  { icon: "⚡", label: "Energie", color: YELLOW, value: 5 },
  { icon: "🏗", label: "Architektura", color: ORANGE, value: 4 },
  { icon: "🎯", label: "Identita", color: PURPLE, value: 7 },
  { icon: "🤝", label: "Důvěra", color: LIME, value: 5 },
];

export default function BrandScanPage() {
  return (
    <main className="font-sans" style={{ background: BG, color: TEXT }}>
      {/* 1. NAV — fixed, 60px */}
      <nav
        className="fixed left-0 right-0 top-0 z-50 flex h-[60px] items-center px-6 xl:px-10"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div className="mx-auto flex h-full w-full max-w-[1360px] items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3 no-underline">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] font-bold text-black"
              style={{ background: LIME, fontSize: 14, width: 28, height: 28 }}
            >
              L
            </div>
            <span
              className="font-bold"
              style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", color: TEXT }}
            >
              LUCIFERA
            </span>
          </Link>
          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 text-[13px] no-underline transition-colors"
                style={{ color: MUTED }}
                onMouseEnter={(e) => { e.currentTarget.style.color = TEXT; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            href="/rezervace"
            className="shrink-0 rounded-lg px-5 py-2.5 text-[13px] font-bold no-underline"
            style={{ background: LIME, color: "#111", fontWeight: 700 }}
          >
            Domluvit konzultaci
          </Link>
        </div>
      </nav>

      {/* 2. HERO — dvousloupcový layout */}
      <section
        className="flex min-h-[100vh] flex-col md:flex-row items-stretch gap-12 md:gap-16 pt-[120px] md:pt-[140px] pb-[110px] px-8 md:px-20"
        style={{ background: BG }}
      >
        {/* Levý sloupec */}
        <div className="flex flex-1 flex-col justify-center max-w-[520px]">
          <span
            className="mb-8 inline-flex w-fit rounded-full border px-[14px] py-[5px] uppercase"
            style={{
              background: "rgba(183,233,76,0.15)",
              border: "1px solid rgba(183,233,76,0.45)",
              borderRadius: 100,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: LIME_DARK,
            }}
          >
            BRAND SCAN · ZDARMA
          </span>
          <h1
            className="mb-6 leading-tight"
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(42px, 5vw, 72px)",
              fontWeight: 900,
              color: TEXT,
            }}
          >
            Víš jak tvoje značka vypadá{" "}
            <em style={{ fontStyle: "italic", color: LIME }}>zvenku?</em>
          </h1>
          <p className="mb-10 text-[16px] leading-relaxed" style={{ color: MUTED, maxWidth: 500 }}>
            Zadej web. Za pár minut máš konkrétní čísla — kde ztrácíš zákazníky dřív než tě vůbec poznají.
          </p>
          <ul className="space-y-4 mb-10">
            {HERO_CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ background: LIME, color: "#111", width: 20, height: 20 }}
                >
                  ✓
                </span>
                <span style={{ color: TEXT }}>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href="#analyzer"
              className="inline-flex items-center justify-center rounded-[10px] px-6 py-[13px] text-[15px] font-bold no-underline transition-opacity hover:opacity-90"
              style={{ background: LIME, color: "#111" }}
            >
              Analyzovat značku →
            </Link>
            <Link
              href="#jak-to-funguje"
              className="inline-flex items-center justify-center rounded-[10px] px-[22px] py-[13px] text-[15px] no-underline transition-colors"
              style={{
                background: "transparent",
                border: "1.5px solid rgba(0,0,0,0.18)",
                color: MUTED,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = TEXT;
                e.currentTarget.style.borderColor = BORDER;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = MUTED;
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.18)";
              }}
            >
              Jak to funguje
            </Link>
          </div>
          <p className="text-[12px]" style={{ color: FAINT }}>
            Zdarma · Bez registrace · Výsledky během minut
          </p>
        </div>

        {/* Pravý sloupec — mockup karta */}
        <div className="flex flex-1 items-center justify-center min-h-[400px]">
          <div
            className="relative w-full max-w-[420px] rounded-[20px] p-7"
            style={{
              background: BG,
              boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
              padding: 28,
            }}
          >
            <div
              className="absolute -top-3 right-4 rounded-[12px] px-4 py-2 text-[12px]"
              style={{
                background: BG,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              }}
            >
              🍎 Identita nalezena / Brand DNA kompletní
            </div>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[14px] font-semibold mb-1" style={{ color: TEXT }}>
                  contentpro.cz
                </p>
                <p className="text-[12px]" style={{ color: FAINT }}>
                  Analýza dokončena · právě teď
                </p>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-[3px]"
                  style={{ borderColor: LIME }}
                >
                  <span className="text-[20px] font-bold" style={{ color: TEXT }}>55</span>
                </div>
                <span className="text-[10px] mt-1" style={{ color: FAINT }}>/100</span>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              {MOCKUP_PILLARS.map((p) => (
                <div key={p.label} className="flex items-center gap-3">
                  <span className="text-base">{p.icon}</span>
                  <span className="flex-1 text-[13px]" style={{ color: TEXT }}>{p.label}</span>
                  <div
                    className="h-1.5 rounded-full overflow-hidden flex-1 max-w-[120px]"
                    style={{ background: "rgba(0,0,0,0.08)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(p.value / 10) * 100}%`,
                        background: p.color,
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-medium w-5" style={{ color: MUTED }}>{p.value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className="rounded-lg px-3 py-1.5 text-[11px]"
                style={{ background: "rgba(212,69,122,0.15)", color: PINK }}
              >
                ⚠ Slabá architektura
              </span>
              <span
                className="rounded-lg px-3 py-1.5 text-[11px]"
                style={{ background: "rgba(0,0,0,0.06)", color: MUTED }}
              >
                Průměrná energie
              </span>
            </div>
            <p className="text-[12px]" style={{ color: FAINT }}>
              🍊 Stratég doporučen / Architekt · 87% shoda
            </p>
          </div>
        </div>
      </section>

      {/* 2b. StartAnalyzer — beze změny */}
      <section id="analyzer" className="px-6 py-16 md:py-20" style={{ background: BG1 }}>
        <div
          className="mx-auto w-full max-w-[880px] rounded-[18px] border px-8 py-7"
          style={{ border: `1px solid ${BORDER}`, padding: "28px 32px" }}
        >
          <StartAnalyzer diagnostika hideIntro />
        </div>
        <p className="mt-5 text-center text-[12px]" style={{ color: FAINT }}>
          Zdarma · Bez registrace · Výsledky během minut
        </p>
      </section>

      {/* 3. DIVIDER */}
      <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", height: 1, background: BORDER }} />

      {/* 4. SEKCE PROBLÉM */}
      <section
        className="mx-auto max-w-[1100px] px-6 py-16 md:py-20"
        style={{ background: BG1, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}
      >
        <p
          className="mb-3 text-[9px] font-bold uppercase"
          style={{ letterSpacing: "0.16em", color: LIME_DARK }}
        >
          PROBLÉM
        </p>
        <h2
          className="font-serif font-black mb-4"
          style={{ fontSize: "clamp(28px, 4vw, 48px)", color: TEXT, marginBottom: 16 }}
        >
          Máš značku. Ale nikdo to nevidí tak, jak ty.
        </h2>
        <p className="mb-10 max-w-[480px] text-[16px]" style={{ color: MUTED, lineHeight: 1.65 }}>
          Tři typické pasti, které Brand Scan odhalí v číslech.
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { accent: PINK, title: "Web říká jedno. Sítě druhé.", text: "Zákazník přijde a odejde. Nezachytil co nabízíš — ne proto že ho to nezajímá, ale proto že to nebylo jasné." },
            { accent: YELLOW, title: "Máš 20 nástrojů. A stále nemáš systém.", text: "Jeden píše, druhý generuje, třetí analyzuje. Sedíš uprostřed a místo tvorby řešíš nástroje." },
            { accent: PURPLE, title: "Tohle není problém tvorby.", text: "Je to problém strategie. Brand Scan ukáže přesně kde — v číslech, ne v obecných radách." },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border bg-white p-7"
              style={{
                border: `1px solid ${BORDER2}`,
                borderRadius: 16,
                padding: 28,
                borderLeft: `3px solid ${card.accent}`,
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              }}
            >
              <h3 className="mb-2.5 text-[15px] font-semibold" style={{ color: TEXT }}>{card.title}</h3>
              <p className="text-[13px] leading-[1.7]" style={{ color: MUTED }}>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SEKCE PILÍŘE */}
      <section className="mx-auto max-w-[1100px] px-6 py-16 md:py-20" style={{ background: BG }}>
        <p
          className="mb-3 text-[9px] font-bold uppercase"
          style={{ letterSpacing: "0.16em", color: LIME_DARK }}
        >
          CO MĚŘÍME
        </p>
        <h2
          className="font-serif font-black mb-4"
          style={{ fontSize: "clamp(28px, 4vw, 48px)", color: TEXT, marginBottom: 16 }}
        >
          Pět pilířů které rozhodují.
        </h2>
        <p className="mb-10 max-w-[520px] text-[16px]" style={{ color: MUTED, lineHeight: 1.65 }}>
          Každý pilíř říká něco konkrétního o tom proč zákazníci zůstávají — nebo odcházejí.
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { icon: "💡", title: "Světlo", desc: "Jak jasná je tvoje hodnota zákazníkovi." },
            { icon: "⚡", title: "Energie", desc: "Jak silná je tvoje pozice na trhu." },
            { icon: "🏗", title: "Architektura", desc: "Jak dobře vedeš zákazníka k akci." },
            { icon: "🎯", title: "Identita", desc: "Jak rozpoznatelná je tvoje značka." },
            { icon: "🤝", title: "Důvěra", desc: "Proč by ti zákazník měl věřit." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[14px] border bg-white p-5 text-center transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: BG,
                border: `1px solid ${BORDER2}`,
                borderRadius: 14,
                padding: "22px 16px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = LIME;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER2;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span className="mb-3 block text-[26px]" aria-hidden>{item.icon}</span>
              <h3 className="mb-2 text-[13px] font-semibold" style={{ color: TEXT }}>{item.title}</h3>
              <p className="text-[11px] leading-[1.6]" style={{ color: MUTED }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SEKCE JAK TO FUNGUJE */}
      <section id="jak-to-funguje" className="relative mx-auto max-w-[1100px] px-6 py-16 md:py-20" style={{ background: BG1 }}>
        <p
          className="mb-3 text-[9px] font-bold uppercase"
          style={{ letterSpacing: "0.16em", color: LIME_DARK }}
        >
          JAK TO FUNGUJE
        </p>
        <h2
          className="font-serif font-black mb-4"
          style={{ fontSize: "clamp(28px, 4vw, 48px)", color: TEXT, marginBottom: 16 }}
        >
          Tři kroky. Výsledky hned.
        </h2>
        <p className="mb-12 max-w-[480px] text-[16px]" style={{ color: MUTED, lineHeight: 1.65 }}>
          Žádná registrace. Žádné čekání. Jen URL a výsledky.
        </p>
        <div
          className="absolute left-6 right-6 top-[7.5rem] hidden h-0.5 md:block"
          style={{
            background: `linear-gradient(90deg, ${LIME}, ${PURPLE}, ${PINK})`,
            opacity: 0.2,
            height: 2,
          }}
          aria-hidden
        />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {[
            { num: "01", title: "Zadáš web", text: "Stačí URL. AI udělá screenshot, přečte texty, analyzuje vizuální identitu a Brand DNA." },
            { num: "02", title: "Systém analyzuje", text: "Pět pilířů, celkové skóre, Brand DNA. Konkrétní čísla — ne obecné rady." },
            { num: "03", title: "Vidíš kde stojíš", text: "Přesné slabiny, silné stránky, doporučení AI stratéga. Výsledky které zůstanou." },
          ].map((step) => (
            <div key={step.num} className="relative z-10 flex flex-col items-center px-6 text-center">
              <div
                className="mb-5 flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 font-serif text-base font-bold"
                style={{ borderColor: LIME, color: LIME_DARK }}
              >
                {step.num}
              </div>
              <h3 className="mb-2 text-[15px] font-bold" style={{ color: TEXT }}>{step.title}</h3>
              <p className="text-[13px] leading-[1.7]" style={{ color: MUTED }}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SEKCE CO DOSTANEŠ */}
      <section className="mx-auto max-w-[1100px] px-6 py-16 md:py-20" style={{ background: BG }}>
        <p
          className="mb-3 text-[9px] font-bold uppercase"
          style={{ letterSpacing: "0.16em", color: LIME_DARK }}
        >
          CO DOSTANEŠ
        </p>
        <h2
          className="font-serif font-black mb-4"
          style={{ fontSize: "clamp(28px, 4vw, 48px)", color: TEXT, marginBottom: 16 }}
        >
          Výsledky Brand Scan.
        </h2>
        <p className="mb-10 max-w-[480px] text-[16px]" style={{ color: MUTED, lineHeight: 1.65 }}>
          Kompletní obraz tvé značky — zdarma, bez závazku.
        </p>
        <ul className="grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2" style={{ gap: 14 }}>
          {[
            "Celkové skóre značky (0–100)",
            "Hodnocení pěti pilířů s komentářem",
            "Brand DNA — positioning, tón, hodnota",
            "Doporučení AI stratéga pro tvoji značku",
            "Cílová skupina a jak ji oslovit",
            "Uložené výsledky — kdykoli se vrátíš",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-[14px]" style={{ color: TEXT }}>
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-bold"
                style={{
                  background: "rgba(183,233,76,0.15)",
                  border: `1px solid rgba(183,233,76,0.4)`,
                  color: LIME_DARK,
                }}
              >
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 8. SEKCE PREMIUM CTA */}
      <section className="px-6 py-16 md:py-20" style={{ background: BG1 }}>
        <div
          className="mx-auto grid max-w-[800px] grid-cols-1 gap-8 rounded-[20px] border p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10"
          style={{
            background: BG,
            border: `1px solid ${BORDER2}`,
            borderRadius: 20,
            padding: 40,
          }}
        >
          <div>
            <h3
              className="font-serif font-black mb-3"
              style={{ fontSize: 28, color: TEXT, marginBottom: 12 }}
            >
              Výsledky jsou jen začátek.
            </h3>
            <p className="mb-2 text-[15px]" style={{ color: MUTED, lineHeight: 1.6 }}>
              Pokud chceš vědět co s tím — rezervuj Premium Brand hovor. Hodina která změní jak o značce přemýšlíš.
            </p>
            <p className="text-[12px]" style={{ color: FAINT }}>
              7 800 Kč · strategický hovor · vizuální board · 3 Canva šablony na míru
            </p>
          </div>
          <div>
            <Link
              href="/premiova-vizualni-identita"
              className="inline-block rounded-xl border px-6 py-3 text-[13px] font-semibold no-underline transition-colors"
              style={{
                border: "1.5px solid " + LIME,
                color: LIME_DARK,
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = LIME;
                e.currentTarget.style.color = "#111";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = LIME_DARK;
              }}
            >
              Zjistit více o Premium Brand →
            </Link>
            <p className="mt-4 text-[12px]" style={{ color: FAINT }}>
              Pokud nebudete spokojeni — <span style={{ color: LIME_DARK }}>vrátíme celou částku</span>. Obsah vám zůstane.
            </p>
          </div>
        </div>
      </section>

      {/* 9. ZÁVĚREČNÉ CTA */}
      <section
        className="px-6 py-20 md:py-24"
        style={{ background: BG, textAlign: "center" }}
      >
        <h2
          className="font-serif font-black mx-auto mb-10 max-w-[600px]"
          style={{
            fontSize: "clamp(26px, 4vw, 44px)",
            color: TEXT,
            marginBottom: 40,
          }}
        >
          Než investuješ do obsahu —
          <br />
          zjisti co skutečně nefunguje.
        </h2>
        <div
          className="mx-auto w-full max-w-[600px] rounded-[18px] border px-8 py-7"
          style={{ background: BG1, border: `1px solid ${BORDER}`, padding: "28px 32px" }}
        >
          <StartAnalyzer diagnostika hideIntro />
        </div>
        <p className="mt-8 text-[12px]" style={{ color: FAINT, letterSpacing: "0.04em" }}>
          Studio Lucifera · Kampa, Praha · AI u nás vychází z reálných fotek
        </p>
      </section>

      {/* 10. FOOTER */}
      <footer
        className="border-t py-6 px-6 md:px-10"
        style={{ borderTop: `1px solid ${BORDER}`, padding: "24px 40px" }}
      >
        <div className="mx-auto flex max-w-[1100px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm no-underline"
            style={{ color: FAINT }}
          >
            ← Zpět na úvod
          </Link>
          <span className="text-[12px]" style={{ color: FAINT }}>
            © 2026 Studio Lucifera
          </span>
        </div>
      </footer>
    </main>
  );
}
