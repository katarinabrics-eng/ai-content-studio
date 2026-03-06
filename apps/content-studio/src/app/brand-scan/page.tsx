"use client";

import Link from "next/link";
import { StartAnalyzer } from "../start/StartAnalyzer";

const LIME = "#c8ff00";
const BORDER = "#1f1f1f";
const BG_DARK = "#0a0a0a";
const HERO_BG = "#080808";
const CARD_BG = "#111";
const PINK = "#e879a0";
const YELLOW = "#e8d44d";
const PURPLE = "#b57bee";

export default function BrandScanPage() {
  return (
    <main className="min-h-screen text-white light-theme" style={{ background: BG_DARK }}>
      {/* SEKCE 1 — HERO: full viewport, centrováno */}
      <section
        className="flex min-h-[100vh] flex-col items-center justify-center px-6 py-12"
        style={{ background: HERO_BG }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <span
            className="inline-block rounded-full border px-5 py-2 text-[10px] font-semibold uppercase"
            style={{
              borderColor: "rgba(200,255,0,0.4)",
              color: LIME,
              letterSpacing: "0.15em",
              marginBottom: 40,
            }}
          >
            BRAND SCAN · ZDARMA
          </span>
          {/* Nadpis h1: Playfair, poslední slovo italic + lime */}
          <h1
            className="font-serif font-bold text-white"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(56px, 8vw, 96px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              maxWidth: 800,
            }}
          >
            Víš jak tvoje značka vypadá{" "}
            <span style={{ fontStyle: "italic", color: LIME }}>zvenku?</span>
          </h1>
          {/* Podnadpis */}
          <p
            className="font-sans mx-auto mt-6 max-w-[560px] text-center text-[18px]"
            style={{
              color: "#555",
              lineHeight: 1.7,
              marginTop: 24,
              marginBottom: 48,
            }}
          >
            Zadej web. Za pár minut máš konkrétní čísla — kde ztrácíš zákazníky dřív než tě vůbec poznají.
          </p>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <StartAnalyzer diagnostika />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[720px] px-6 py-12 md:py-20">

        {/* SEKCE 2 — PROBLÉM */}
        <section className="py-16 border-t border-white/10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-10">
            Máš značku. Ale nikdo to nevidí tak, jak ty.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[#111] border border-[#1f1f1f] border-l-4" style={{ borderLeftColor: PINK, background: CARD_BG, borderColor: BORDER }}>
              <h3 className="font-bold text-white mb-2">Web říká jedno. Sítě druhé.</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Zákazník přijde a odejde. Ne proto že ho nezajímáš — ale proto že nezachytil co nabízíš.</p>
            </div>
            <div className="p-5 rounded-xl bg-[#111] border border-[#1f1f1f] border-l-4" style={{ borderLeftColor: YELLOW, background: CARD_BG, borderColor: BORDER }}>
              <h3 className="font-bold text-white mb-2">Máš 20 nástrojů. A stále nemáš systém.</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Jeden píše, druhý generuje, třetí analyzuje. Sedíš uprostřed a místo tvorby řešíš nástroje.</p>
            </div>
            <div className="p-5 rounded-xl bg-[#111] border border-[#1f1f1f] border-l-4" style={{ borderLeftColor: PURPLE, background: CARD_BG, borderColor: BORDER }}>
              <h3 className="font-bold text-white mb-2">Tohle není problém tvorby.</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Je to problém strategie. A Brand Scan ti ukáže přesně kde.</p>
            </div>
          </div>
        </section>

        {/* SEKCE 3 — CO MĚŘÍME */}
        <section className="py-16 border-t border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-10" style={{ color: LIME, letterSpacing: "0.1em" }}>
            PĚT PILÍŘŮ KTERÉ ROZHODUJÍ
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: "💡", title: "Světlo", desc: "Jak jasná je tvoje hodnota zákazníkovi." },
              { icon: "⚡", title: "Energie", desc: "Jak silná je tvoje pozice na trhu." },
              { icon: "🏗", title: "Architektura", desc: "Jak dobře vedeš zákazníka k akci." },
              { icon: "🎯", title: "Identita", desc: "Jak rozpoznatelná a konzistentní je tvoje značka." },
              { icon: "🤝", title: "Důvěra", desc: "Proč by ti zákazník měl věřit." },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border" style={{ background: CARD_BG, borderColor: BORDER }}>
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEKCE 4 — JAK TO FUNGUJE */}
        <section className="py-16 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white mb-10">Tři kroky. Výsledky hned.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-black text-zinc-500 mb-2">01</div>
              <h3 className="font-bold text-white mb-2">Zadáš web</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Stačí URL. AI udělá screenshot, přečte texty, analyzuje vizuální identitu.</p>
            </div>
            <div>
              <div className="text-3xl font-black text-zinc-500 mb-2">02</div>
              <h3 className="font-bold text-white mb-2">Systém analyzuje</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Brand DNA, pět pilířů, celkové skóre. Konkrétní čísla, ne obecné rady.</p>
            </div>
            <div>
              <div className="text-3xl font-black text-zinc-500 mb-2">03</div>
              <h3 className="font-bold text-white mb-2">Vidíš kde stojíš</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Přesné slabiny, silné stránky, jeden jasný směr. Výsledky které zůstanou.</p>
            </div>
          </div>
        </section>

        {/* SEKCE 5 — CO DOSTANEŠ */}
        <section className="py-16 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white mb-8">Výsledky Brand Scan zahrnují:</h2>
          <ul className="space-y-3">
            {[
              "Celkové skóre značky (0–100)",
              "Hodnocení pěti pilířů s komentářem",
              "Brand DNA — positioning, tón, hodnota, cílová skupina",
              "Doporučení AI stratéga pro tvoji značku",
              "Uložené výsledky — kdykoli se vrátíš, vše bude na místě",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-300">
                <span className="shrink-0 mt-0.5" style={{ color: LIME }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* SEKCE 6 — PŘECHOD NA PREMIUM */}
        <section className="py-16 border-t border-white/10">
          <div className="max-w-[640px] mx-auto p-6 rounded-xl bg-[#111] border border-[#1f1f1f] border-l-4" style={{ borderLeftColor: LIME, background: CARD_BG, borderColor: BORDER }}>
            <h2 className="text-xl font-bold text-white mb-4">Výsledky jsou jen začátek.</h2>
            <p className="text-zinc-400 leading-relaxed mb-6">
              Pokud chceš vědět co s tím — rezervuj Premium Brand hovor. Hodina která změní jak o značce přemýšlíš. Positioning, vizuální směr, obsahový rámec. Vše na míru.
            </p>
            <p className="text-sm text-zinc-500 mb-1">7 800 Kč · strategický hovor · vizuální board · 3 Canva šablony na míru</p>
            <p className="text-sm text-zinc-500 mb-6">Pokud nebudete spokojeni — vrátíme celou částku. Obsah vám zůstane.</p>
            <Link
              href="/premiova-vizualni-identita"
              className="inline-block px-6 py-3 rounded-lg font-semibold border-2"
              style={{ borderColor: LIME, color: LIME }}
            >
              Zjistit více o Premium Brand →
            </Link>
          </div>
        </section>

        {/* SEKCE 7 — ZÁVĚREČNÉ CTA */}
        <section className="py-16 border-t border-white/10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
            Než investuješ do obsahu — zjisti co skutečně nefunguje.
          </h2>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <StartAnalyzer diagnostika />
          </div>
          <p className="mt-8 text-sm text-zinc-500">
            Studio Lucifera · Kampa, Praha · AI u nás vychází z reálných fotek.
          </p>
        </section>

        <div className="pt-12 border-t border-white/10">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 underline underline-offset-2">
            ← Zpět na úvod
          </Link>
        </div>
      </div>
    </main>
  );
}
