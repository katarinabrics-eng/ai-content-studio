"use client";

import Link from "next/link";
import { StartAnalyzer } from "../start/StartAnalyzer";

const LIME_MAIN = "#b7e94c";
const LIME_HOVER = "#d0ec78";
const LIME_BG = "#d3ee7f";
const LIME_DARK = "#5a8a00";
const PINK = "#e879a0";
const YELLOW = "#e8d44d";
const PURPLE = "#b57bee";
const TEXT = "#111111";
const MUTED = "#555555";
const CARD_BG = "#ffffff";
const CARD_BORDER = "rgba(0,0,0,0.09)";
const SECTION_ALT_BG = "#f7f7f5";

const SECTION_DIVIDER_STYLE = {
  width: "100%",
  height: 1,
  background: "rgba(0,0,0,0.09)",
  maxWidth: 1100,
  margin: "0 auto",
};

export default function BrandScanPage() {
  return (
    <main
      className="font-sans"
      style={{ background: "#ffffff", color: TEXT }}
    >
      {/* ═══════════════════════════════════════ SEKCE 1 — HERO ═══════════════════════════════════════ */}
      <section
        className="relative flex min-h-[100vh] flex-col items-center justify-center overflow-hidden px-6 pt-[100px] pb-16 md:pt-[120px] md:pb-20"
      >
        {/* Světelný efekt pozadí */}
        <div
          className="pointer-events-none absolute left-1/2 top-[-200px] z-0 h-[800px] w-[800px] -translate-x-1/2"
          style={{
            background: `radial-gradient(circle, ${LIME_BG}40 0%, transparent 70%)`,
          }}
          aria-hidden
        />
        <div
          className="relative z-[1] flex w-full max-w-[920px] flex-col items-center text-center"
          style={{ maxWidth: 920 }}
        >
          {/* BADGE */}
          <span
            className="mb-9 inline-block rounded-full border px-[18px] py-[7px] text-[10px] font-semibold uppercase"
            style={{
              color: LIME_DARK,
              letterSpacing: "0.15em",
              background: "rgba(183,233,76,0.15)",
              borderColor: "rgba(183,233,76,0.45)",
              marginBottom: 36,
            }}
          >
            BRAND SCAN · ZDARMA
          </span>
          {/* NADPIS h1 */}
          <h1
            className="font-serif font-bold"
            style={{
              fontSize: "clamp(54px, 8vw, 92px)",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              maxWidth: 800,
              marginBottom: 0,
              color: TEXT,
            }}
          >
            Víš jak tvoje značka vypadá <em style={{ fontStyle: "italic", color: LIME_DARK }}>zvenku?</em>
          </h1>
          {/* PODNADPIS */}
          <p
            className="font-sans mx-auto max-w-[520px] text-center text-[17px]"
            style={{
              color: MUTED,
              lineHeight: 1.75,
              marginTop: 20,
              marginBottom: 44,
            }}
          >
            Zadej web. Za pár minut máš konkrétní čísla — kde ztrácíš zákazníky dřív než tě vůbec poznají.
          </p>
          {/* STARTANALYZER EMBED */}
          <div className="w-full rounded-xl border" style={{ maxWidth: 880, margin: "0 auto", background: SECTION_ALT_BG, border: `1px solid ${CARD_BORDER}` }}>
            <StartAnalyzer diagnostika hideIntro />
          </div>
          {/* POZNÁMKA pod formulářem */}
          <p
            className="mt-4 text-center text-[12px]"
            style={{ color: MUTED, marginTop: 16 }}
          >
            Zdarma{" "}
            <span style={{ color: MUTED }}>·</span>{" "}
            Bez registrace{" "}
            <span style={{ color: MUTED }}>·</span>{" "}
            Výsledky během minut
          </p>
        </div>
      </section>

      <div style={SECTION_DIVIDER_STYLE} />

      {/* ═══════════════════════════════════════ SEKCE 2 — PROBLÉM ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-[1100px] px-6 py-[100px]" style={{ background: SECTION_ALT_BG }}>
        <div style={{ width: "100%", height: 1, background: "rgba(0,0,0,0.09)", marginBottom: 16 }} />
        <p
          className="mb-4 text-[9px] font-bold uppercase"
          style={{ letterSpacing: "0.2em", color: LIME_DARK }}
        >
          PROBLÉM
        </p>
        <h2
          className="font-serif font-bold"
          style={{
            fontSize: "clamp(32px, 4vw, 52px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: 16,
            color: TEXT,
          }}
        >
          Máš značku. Ale nikdo to nevidí tak, jak ty.
        </h2>
        <p
          className="mb-[52px] max-w-[480px] text-[16px]"
          style={{ color: MUTED, lineHeight: 1.7 }}
        >
          Tři typické pasti, které Brand Scan odhalí v číslech.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              accent: PINK,
              title: "Web říká jedno. Sítě druhé.",
              text: "Zákazník přijde a odejde. Nezachytil co nabízíš — ne proto že ho to nezajímá, ale proto že to nebylo jasné.",
            },
            {
              accent: YELLOW,
              title: "Máš 20 nástrojů. A stále nemáš systém.",
              text: "Jeden píše, druhý generuje, třetí analyzuje. Sedíš uprostřed a místo tvorby řešíš nástroje.",
            },
            {
              accent: PURPLE,
              title: "Tohle není problém tvorby.",
              text: "Je to problém strategie. Brand Scan ukáže přesně kde — v číslech, ne v obecných radách.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-xl border p-7"
              style={{
                background: CARD_BG,
                borderColor: CARD_BORDER,
                padding: "28px 24px",
              }}
            >
              <span
                className="absolute left-0 top-0 h-full w-0.5"
                style={{ background: card.accent, width: 2 }}
                aria-hidden
              />
              <h3 className="mb-2.5 text-[15px] font-semibold" style={{ color: TEXT }}>{card.title}</h3>
              <p className="text-[13px] leading-[1.7]" style={{ color: MUTED }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div style={SECTION_DIVIDER_STYLE} />

      {/* ═══════════════════════════════════════ SEKCE 3 — PĚT PILÍŘŮ ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-[1100px] px-6 py-[100px]">
        <p
          className="mb-4 text-[9px] font-bold uppercase"
          style={{ letterSpacing: "0.2em", color: LIME_DARK }}
        >
          CO MĚŘÍME
        </p>
        <h2
          className="font-serif font-bold"
          style={{
            fontSize: "clamp(32px, 4vw, 52px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: 16,
            color: TEXT,
          }}
        >
          Pět pilířů které rozhodují.
        </h2>
        <p
          className="mb-10 max-w-[520px] text-[16px]"
          style={{ color: MUTED, lineHeight: 1.7, marginBottom: 40 }}
        >
          Každý pilíř říká něco konkrétního o tom proč zákazníci zůstávají — nebo odcházejí.
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { icon: "💡", title: "Světlo", desc: "Jak jasná je tvoje hodnota zákazníkovi." },
            { icon: "⚡", title: "Energie", desc: "Jak silná je tvoje pozice na trhu." },
            { icon: "🏗", title: "Architektura", desc: "Jak dobře vedeš zákazníka k akci." },
            { icon: "🎯", title: "Identita", desc: "Jak rozpoznatelná je tvoje značka." },
            { icon: "🤝", title: "Důvěra", desc: "Proč by ti zákazník měl věřit." },
          ].map((item) => (
            <div
              key={item.title}
              className="cursor-default rounded-xl border p-5 text-center transition-all duration-[250ms] hover:-translate-y-1"
              style={{
                background: CARD_BG,
                borderColor: CARD_BORDER,
                padding: "24px 20px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = LIME_MAIN;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = CARD_BORDER;
              }}
            >
              <span className="mb-3 block text-[26px]" aria-hidden>{item.icon}</span>
              <h3 className="mb-2 text-[13px] font-semibold" style={{ color: TEXT }}>{item.title}</h3>
              <p className="text-[11px] leading-[1.6]" style={{ color: MUTED }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div style={SECTION_DIVIDER_STYLE} />

      {/* ═══════════════════════════════════════ SEKCE 4 — JAK TO FUNGUJE ═══════════════════════════════════════ */}
      <section className="relative mx-auto max-w-[1100px] px-6 py-[100px]" style={{ background: SECTION_ALT_BG }}>
        <p
          className="mb-4 text-[9px] font-bold uppercase"
          style={{ letterSpacing: "0.2em", color: LIME_DARK }}
        >
          JAK TO FUNGUJE
        </p>
        <h2
          className="font-serif font-bold"
          style={{
            fontSize: "clamp(32px, 4vw, 52px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: 16,
            color: TEXT,
          }}
        >
          Tři kroky. Výsledky hned.
        </h2>
        <p
          className="mb-10 max-w-[480px] text-[16px]"
          style={{ color: MUTED, lineHeight: 1.7, marginBottom: 40 }}
        >
          Žádná registrace. Žádné čekání. Jen URL a výsledky.
        </p>
        {/* Spojovací linka — skrytá na mobilu */}
        <div
          className="absolute left-20 right-20 top-7 hidden h-px md:block"
          style={{
            background: "linear-gradient(90deg, #c8ff00, #b57bee, #e879a0)",
            opacity: 0.2,
          }}
          aria-hidden
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              num: "01",
              title: "Zadáš web",
              text: "Stačí URL. AI udělá screenshot, přečte texty, analyzuje vizuální identitu a Brand DNA.",
            },
            {
              num: "02",
              title: "Systém analyzuje",
              text: "Pět pilířů, celkové skóre, Brand DNA. Konkrétní čísla — ne obecné rady.",
            },
            {
              num: "03",
              title: "Vidíš kde stojíš",
              text: "Přesné slabiny, silné stránky, doporučení AI stratéga. Výsledky které zůstanou.",
            },
          ].map((step) => (
            <div key={step.num} className="relative z-[1] px-8 text-center">
              <div
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border font-serif text-[20px] font-bold"
                style={{
                  background: CARD_BG,
                  borderColor: LIME_MAIN,
                  color: LIME_DARK,
                }}
              >
                {step.num}
              </div>
              <h3 className="mb-2.5 text-[15px] font-semibold" style={{ color: TEXT }}>{step.title}</h3>
              <p className="text-[13px] leading-[1.7]" style={{ color: MUTED }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div style={SECTION_DIVIDER_STYLE} />

      {/* ═══════════════════════════════════════ SEKCE 5 — CO DOSTANEŠ ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-[1100px] px-6 py-[100px]">
        <p
          className="mb-4 text-[9px] font-bold uppercase"
          style={{ letterSpacing: "0.2em", color: LIME_DARK }}
        >
          CO DOSTANEŠ
        </p>
        <h2
          className="font-serif font-bold"
          style={{
            fontSize: "clamp(32px, 4vw, 52px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: 16,
            color: TEXT,
          }}
        >
          Výsledky Brand Scan.
        </h2>
        <p
          className="mb-10 max-w-[480px] text-[16px]"
          style={{ color: MUTED, lineHeight: 1.7, marginBottom: 40 }}
        >
          Kompletní obraz tvé značky — zdarma, bez závazku.
        </p>
        <ul className="grid max-w-[640px] grid-cols-1 gap-3.5 sm:grid-cols-2" style={{ gap: 14 }}>
          {[
            "Celkové skóre značky (0–100)",
            "Hodnocení pěti pilířů s komentářem",
            "Brand DNA — positioning, tón, hodnota",
            "Doporučení AI stratéga pro tvoji značku",
            "Cílová skupina a jak ji oslovit",
            "Uložené výsledky — kdykoli se vrátíš",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-[14px]"
              style={{ color: TEXT }}
            >
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[10px]"
                style={{
                  background: "rgba(183,233,76,0.15)",
                  borderColor: "rgba(183,233,76,0.4)",
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

      <div style={SECTION_DIVIDER_STYLE} />

      {/* ═══════════════════════════════════════ SEKCE 6 — PREMIUM BRAND ═══════════════════════════════════════ */}
      <section className="px-6 py-[100px] text-center" style={{ background: SECTION_ALT_BG }}>
        <div
          className="mx-auto max-w-[680px] rounded-2xl border border-l-2 px-6 py-8 text-center md:p-12"
          style={{
            background: CARD_BG,
            borderColor: CARD_BORDER,
            borderLeftColor: LIME_MAIN,
          }}
        >
          <p
            className="mb-4 text-center text-[9px] font-bold uppercase"
            style={{ letterSpacing: "0.2em", color: LIME_DARK }}
          >
            DALŠÍ KROK
          </p>
          <h2 className="font-serif font-bold" style={{ marginBottom: 28, color: TEXT }}>
            Výsledky jsou jen začátek.
          </h2>
          <p
            className="mx-auto mb-7 max-w-[440px] text-[15px]"
            style={{ color: MUTED, marginBottom: 28 }}
          >
            Pokud chceš vědět co s tím — rezervuj Premium Brand hovor. Hodina která změní jak o značce přemýšlíš.
          </p>
          <p
            className="mb-7 text-[12px]"
            style={{ color: MUTED, marginBottom: 28 }}
          >
            7 800 Kč · strategický hovor · vizuální board · 3 Canva šablony na míru
          </p>
          <Link
            href="/premiova-vizualni-identita"
            className="inline-block rounded-[10px] border px-7 py-3 text-[13px] font-semibold no-underline transition-colors duration-200 hover:bg-[#b7e94c] hover:text-[#111]"
            style={{ borderColor: LIME_MAIN, color: LIME_DARK, background: "transparent" }}
          >
            Zjistit více o Premium Brand →
          </Link>
          <p
            className="mt-4 text-[12px]"
            style={{ color: MUTED, marginTop: 16 }}
          >
            Pokud nebudete spokojeni — <span style={{ color: LIME_DARK }}>vrátíme celou částku</span>. Obsah vám zůstane.
          </p>
        </div>
      </section>

      <div style={SECTION_DIVIDER_STYLE} />

      {/* ═══════════════════════════════════════ SEKCE 7 — ZÁVĚREČNÉ CTA ═══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden px-6 py-[120px] text-center"
        style={{ padding: "120px 24px" }}
      >
        {/* Světelný efekt */}
        <div
          className="pointer-events-none absolute bottom-[-100px] left-1/2 h-[600px] w-[600px] -translate-x-1/2"
          style={{
            background: `radial-gradient(circle, ${LIME_BG}30 0%, transparent 70%)`,
          }}
          aria-hidden
        />
        <h2
          className="relative z-[1] mx-auto mb-11 font-serif font-bold"
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            maxWidth: 600,
            marginBottom: 44,
            color: TEXT,
          }}
        >
          Než investuješ do obsahu —
          <br />
          zjisti co skutečně nefunguje.
        </h2>
        <div className="relative z-[1] w-full rounded-xl border" style={{ maxWidth: 600, margin: "0 auto", background: SECTION_ALT_BG, border: `1px solid ${CARD_BORDER}` }}>
          <StartAnalyzer diagnostika hideIntro />
        </div>
        <p
          className="relative z-[1] mt-8 text-[11px]"
          style={{ color: MUTED, marginTop: 32, letterSpacing: "0.05em" }}
        >
          Studio Lucifera · Kampa, Praha · AI u nás vychází z reálných fotek
        </p>
      </section>

      {/* Zpět na úvod */}
      <div className="border-t py-8" style={{ borderColor: CARD_BORDER }}>
        <div className="mx-auto max-w-[1100px] px-6">
          <Link
            href="/"
            className="text-sm underline underline-offset-2 hover:text-[#111]"
            style={{ color: MUTED }}
          >
            ← Zpět na úvod
          </Link>
        </div>
      </div>
    </main>
  );
}
