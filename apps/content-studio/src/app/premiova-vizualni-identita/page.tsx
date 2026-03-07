"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { VibeSection } from "../components/VibeSection";

// barevná paleta
const LIME = "#b7e94c";
const LIME2 = "#d0ec78";
const LIME_DARK = "#5a8a00";
const TEXT = "#111";
const MUTED = "#555";
const FAINT = "#999";
const BG = "#fff";
const BG1 = "#f7f7f5";
const BORDER = "rgba(0,0,0,0.09)";
const BORDER2 = "rgba(0,0,0,0.13)";
const GLOW_LIME = "rgba(183,233,76,0.18)";
const GLOW_STRONG = "rgba(183,233,76,0.32)";

const glassStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const heroCardGlass: React.CSSProperties = {
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
};

const faqs = [
  { q: "Musím začít vstupním hovorem?", a: "Ano. Je to povinný první krok — bez něj nedokážeme nastavit správný vizuální směr. Zároveň má vstupní hovor samostatnou hodnotu: dostanete vizuální board a Canva šablony bez ohledu na to, zda se rozhodnete pokračovat do Fáze 1." },
  { q: "Co dostanu po dvou měsících?", a: "Vytrénovaného AI agenta vaší značky, vizuální banku a systém pro publikování. Agent zná vaši strategii, tón a vizuální standard. Funguje bez vaší neustálé přítomnosti — vy pouze kontrolujete a schvalujete výstupy." },
  { q: "Je v ceně focení?", a: "Ano. Foto/video den v ateliéru na Kampě je součástí Fáze 1 (49 000 Kč). Tvoříme vizuální banku — ne jednotlivé snímky, ale obsah který funguje jako systém." },
  { q: "Pracujete jen s ženami?", a: "Ne. Přístup je genderově neutrální — záleží na typu značky a úrovni podnikání, ne na pohlaví." },
  { q: "Co když budu chtít pokračovat po dvou měsících?", a: "Většina klientů přechází do formátu kurátorského dohledu. Značka není jednorázový počin — je to živý systém. Rádi se domluvíme na pokračující spolupráci." },
];

const PRO_KOHO_ITEMS = [
  "Vaše ceny rostou — ale váš obraz ještě ne.",
  "Přerostli jste vizuál z počátků podnikání.",
  "Trávíte hodiny v nástrojích místo ve své práci.",
  "Chcete hybridní přístup — vaše tvář, vaše světlo, AI která to zesiluje.",
  "Hledáte systém který pracuje i když vy právě nepracujete.",
];

const FASE1_ITEMS = [
  "Strategický plán + Brand DNA",
  "Foto/video den v ateliéru na Kampě",
  "Vstup do aplikace Lucifera",
  "2měsíční výcvik AI agenta vaší značky",
  "Tvorba příspěvků a textů dle strategie",
  "Vlastní vizuální agentura — agent plánuje, připravuje, publikuje",
  "2měsíční kurátorování obsahu",
];

export default function PremioveVizualniIdentitaPage() {
  const parallaxRefs = useRef<HTMLElement[]>([]);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [parallaxTransforms, setParallaxTransforms] = useState<Record<number, string>>({});

  useEffect(() => {
    const reveal = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    reveal.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      const next: Record<number, string> = {};
      parallaxRefs.current.forEach((el, i) => {
        if (el) {
          const m = (i + 1) * 4;
          next[i] = `translate(${dx * m}px, ${dy * m}px)`;
        }
      });
      setParallaxTransforms(next);
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const container = statsRef.current;
    if (!container) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const box = entry.target as HTMLElement;
          const stats = box.querySelectorAll(".stat-num[data-idx]");
          const values = [25, 500];
          stats.forEach((el, i) => {
            const target = values[i];
            if (!target || (el as HTMLElement).dataset.animated === "1") return;
            (el as HTMLElement).dataset.animated = "1";
            const start = performance.now();
            const anim = (now: number) => {
              const t = Math.min((now - start) / 1200, 1);
              const ease = 1 - Math.pow(1 - t, 3);
              const v = Math.round(target * ease);
              const span = el.querySelector("span:first-child");
              if (span) span.textContent = String(v);
              if (t < 1) requestAnimationFrame(anim);
            };
            requestAnimationFrame(anim);
          });
        });
      },
      { threshold: 0.5 }
    );
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  return (
    <main style={{ background: BG, color: TEXT }}>
      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-30px,20px) scale(1.05)} 66%{transform:translate(20px,-15px) scale(0.97)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-30px)} }
        @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-15px,20px) scale(1.1)} }
        @keyframes floatBadge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatBadge2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes float1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes float2 { 0%,100%{transform:translateY(4px)} 50%{transform:translateY(-6px)} }
        @keyframes float3 { 0%,100%{transform:translateY(2px)} 50%{transform:translateY(-10px)} }
        @keyframes float4 { 0%,100%{transform:translateY(3px)} 50%{transform:translateY(-7px)} }
        @keyframes pulseDot { 0%{box-shadow:0 0 0 0 rgba(183,233,76,.5)} 70%{box-shadow:0 0 0 8px rgba(183,233,76,0)} 100%{box-shadow:0 0 0 0 rgba(183,233,76,0)} }
        @keyframes ringGlow { 0%,100%{box-shadow:0 0 16px rgba(183,233,76,.32),inset 0 0 12px rgba(183,233,76,.1)} 50%{box-shadow:0 0 28px rgba(183,233,76,.5),inset 0 0 18px rgba(183,233,76,.2)} }
        @keyframes barGrow { from{width:30px} to{width:60px} }
        @keyframes barGrow2 { from{width:50px} to{width:25px} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineGrow { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1)} }
        .premiove-hero-entry{opacity:0;transform:translateY(20px);animation:fadeUp .7s ease forwards}
        .premiove-hero-entry.delay-0{animation-delay:0s}
        .premiove-hero-entry.delay-1{animation-delay:.08s}
        .premiove-hero-entry.delay-2{animation-delay:.16s}
        .premiove-hero-entry.delay-3{animation-delay:.24s}
        .premiove-hero-entry.delay-4{animation-delay:.32s}
        .premiove-hero-entry.delay-5{animation-delay:.4s}
        .premiove-hero-entry.delay-6{animation-delay:.48s}
        .premiove-hero-entry.delay-7{animation-delay:.56s}
        .reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .reveal-delay-1{transition-delay:.1s}
        .reveal-delay-2{transition-delay:.2s}
        .reveal-delay-3{transition-delay:.3s}
        .faq-details summary::-webkit-details-marker{display:none}
        .faq-details summary{position:relative;padding-right:40px}
        .faq-details summary::after{content:'+';position:absolute;right:30px;top:50%;transform:translateY(-50%);font-size:18px;font-weight:400;transition:transform .25s ease}
        .faq-details details[open] summary{background:rgba(183,233,76,.06)}
        .faq-details details[open] summary::after{transform:translateY(-50%) rotate(45deg)}
        .faq-details summary:hover{background:rgba(183,233,76,.05);color:#5a8a00}
        @media (max-width: 900px) {
          .premiove-hero{min-height:auto;padding:0 !important;background-position:0 0, right bottom !important;}
          .premiove-hero .hero-mobile-overlay{display:block !important;}
          .premiove-hero .hero-content{grid-template-columns:1fr !important;padding:100px 24px 60px !important;}
          .premiove-hero .hero-cards-wrap{min-height:180px;position:relative;}
          .premiove-hero .hero-card-3,.premiove-hero .hero-card-4{display:none !important;}
        }
      `}</style>

      <Header />

      {/* HERO — pozadí hlavnycover_02, gradient zleva, text vlevo, plovoucí kartičky vpravo */}
      <section
        className="premiove-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          backgroundColor: BG,
          backgroundImage: `linear-gradient(95deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.90) 35%, rgba(255,255,255,0.40) 55%, transparent 70%), url("/placeholders/hlavnycover_02.png")`,
          backgroundSize: "auto, contain",
          backgroundPosition: "0 0, right center",
          backgroundRepeat: "no-repeat, no-repeat",
        }}
      >
        {/* Mobil: overlay zesvětlí shora */}
        <div
          className="hero-mobile-overlay"
          aria-hidden
          style={{
            display: "none",
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.2) 50%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <div
          className="hero-content"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1440,
            margin: "0 auto",
            paddingLeft: 80,
            paddingRight: 80,
            paddingTop: 120,
            paddingBottom: 80,
            minHeight: "100vh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div
              className="premiove-hero-entry delay-0"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                letterSpacing: ".12em",
                color: "#7ab82e",
                marginBottom: 28,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7ab82e", animation: "pulseDot 2s infinite", flexShrink: 0 }} />
              prémiová vizuální identita
            </div>

            <h1
              className="premiove-hero-entry delay-1"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(40px, 5vw, 68px)",
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-.03em",
                marginBottom: 24,
              }}
            >
              Jeden den focení.
              <br />
              <em style={{ fontStyle: "italic", color: LIME_DARK }}>Obsah na měsíce dopředu.</em>
            </h1>

            <p
              className="premiove-hero-entry delay-2"
              style={{ fontSize: 17, color: MUTED, lineHeight: 1.7, maxWidth: 480, marginBottom: 36 }}
            >
              Fotografie, video, AI agent natrénovaný na vaši značku a dva měsíce kurátorovaného obsahu — vše z jedné spolupráce.
            </p>

            <div className="premiove-hero-entry delay-3" style={{ display: "flex", gap: 14, marginBottom: 24 }}>
              <a
                href="/rezervace"
                style={{
                  background: LIME,
                  color: TEXT,
                  borderRadius: 11,
                  padding: "15px 28px",
                  fontSize: 15,
                  fontWeight: 700,
                  boxShadow: `0 4px 24px ${GLOW_STRONG}`,
                  textDecoration: "none",
                }}
              >
                Rezervovat vstupní hovor →
              </a>
              <a
                href="#jak-to-funguje"
                style={{
                  background: "transparent",
                  border: "1.5px solid rgba(0,0,0,.2)",
                  borderRadius: 11,
                  padding: "14px 24px",
                  fontSize: 15,
                  color: MUTED,
                  textDecoration: "none",
                }}
              >
                Jak to funguje
              </a>
            </div>

            <p className="premiove-hero-entry delay-4" style={{ fontSize: 12, color: FAINT }}>
              Vstupní hovor · 7 800 Kč · Bez závazku Fáze 1
            </p>
          </div>

          <div
            className="hero-cards-wrap"
            style={{ position: "relative", minHeight: 420 }}
          >
            <div
              className="hero-float-card hero-card-1 premiove-hero-entry delay-5"
              style={{
                position: "absolute",
                top: 24,
                left: 0,
                borderRadius: 18,
                padding: "14px 20px",
                animation: "float1 3.5s ease-in-out infinite",
                zIndex: 3,
                ...heroCardGlass,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: LIME, animation: "pulseDot 2s infinite" }} />
                <strong style={{ fontSize: 13 }}>Agent aktivní</strong>
              </div>
              <span style={{ fontSize: 11, color: FAINT }}>Právě připravuje obsah</span>
            </div>

            <div
              className="hero-float-card hero-card-2 premiove-hero-entry delay-5"
              style={{
                position: "absolute",
                top: 24,
                right: 0,
                borderRadius: 18,
                padding: "16px 20px",
                textAlign: "center",
                animation: "float2 4s ease-in-out 0.8s infinite",
                zIndex: 3,
                ...heroCardGlass,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: "3px solid " + LIME,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  animation: "ringGlow 3s infinite",
                }}
              >
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, fontWeight: 900, color: TEXT }}>87</span>
              </div>
              <span style={{ fontSize: 10, color: FAINT }}>Brand skóre</span>
            </div>

            <div
              className="hero-float-card hero-card-3 premiove-hero-entry delay-6"
              style={{
                position: "absolute",
                bottom: 100,
                left: 20,
                borderRadius: 18,
                padding: "16px 22px",
                animation: "float3 4.5s ease-in-out 1.5s infinite",
                zIndex: 3,
                ...heroCardGlass,
              }}
            >
              <div style={{ fontSize: 10, textTransform: "uppercase", color: FAINT, marginBottom: 8 }}>Týdenní výstupy</div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: TEXT }}>Příspěvky</span>
                <div style={{ height: 4, background: LIME, borderRadius: 2, marginTop: 4, width: 60, animation: "barGrow 2s infinite alternate" }} />
              </div>
              <div>
                <span style={{ fontSize: 12, color: TEXT }}>Vizuály</span>
                <div style={{ height: 4, background: "rgba(183,233,76,.35)", borderRadius: 2, marginTop: 4, width: 50, animation: "barGrow2 2.5s infinite alternate" }} />
              </div>
            </div>

            <div
              className="hero-float-card hero-card-4 premiove-hero-entry delay-7"
              style={{
                position: "absolute",
                bottom: 200,
                right: 24,
                borderRadius: 14,
                padding: "14px 18px",
                animation: "float4 3.8s ease-in-out 0.4s infinite",
                zIndex: 3,
                ...heroCardGlass,
              }}
            >
              <div style={{ fontSize: 10, textTransform: "uppercase", color: FAINT, marginBottom: 4 }}>Výstupy</div>
              <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 22, fontWeight: 900, color: LIME_DARK }}>500+ fotek</span>
              <div style={{ fontSize: 11, color: FAINT, marginTop: 4 }}>z jednoho dne</div>
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ height: 1, background: "linear-gradient(to right, transparent, #b7e94c, rgba(183,233,76,.3), transparent)" }} />

      <VibeSection />

      {/* SEKCE PROBLÉM */}
      <section style={{ background: BG1, padding: "96px 80px", maxWidth: 1260, margin: "0 auto", position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(183,233,76,.08), transparent)",
            top: -100,
            right: "10%",
            filter: "blur(80px)",
          }}
        />
        <p className="reveal" style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>Problém</p>
        <h2 className="reveal reveal-delay-1" style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px,3vw,42px)", fontWeight: 900, color: TEXT, marginBottom: 48, letterSpacing: "-.02em", lineHeight: 1.15 }}>
          Za tři sekundy si o vás udělají názor. Otázka je, jaký.
        </h2>
        <p className="reveal reveal-delay-2" style={{ fontSize: 17, color: MUTED, marginBottom: 40 }}>Trh nečte co umíte. Čte co vidí.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div
            className="reveal reveal-delay-3"
            style={{
              gridColumn: "1 / -1",
              background: "#111",
              borderRadius: 24,
              padding: 52,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px,3vw,42px)", color: "#fff", position: "relative", zIndex: 1 }}>
              Web říká jedno. Fotky druhé. Příspěvky <em style={{ color: LIME, fontStyle: "italic" }}>třetí.</em>
            </h3>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", maxWidth: 600, marginTop: 16, position: "relative", zIndex: 1 }}>
              Zákazník přijde, nepochopí — a odejde. Ne proto že ho to nezajímá. Ale proto že za tři sekundy neviděl důvod zůstat. To není problém tvorby. Je to problém systému.
            </p>
          </div>
          <div
            className="reveal"
            style={{
              background: BG,
              border: `1px solid ${BORDER2}`,
              borderRadius: 20,
              padding: 36,
              overflow: "hidden",
            }}
          >
            <p style={{ fontSize: 11, color: FAINT, marginBottom: 8 }}>01 ·</p>
            <h4 style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 10 }}>Vaše ceny rostou. Váš obraz ne.</h4>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>Trh vás vidí tak, jak se prezentujete. Pokud vaše vizuální úroveň zaostává za cenou — ztrácíte důvěru.</p>
          </div>
          <div
            className="reveal"
            style={{
              background: BG,
              border: `1px solid ${BORDER2}`,
              borderRadius: 20,
              padding: 36,
              overflow: "hidden",
            }}
          >
            <p style={{ fontSize: 11, color: FAINT, marginBottom: 8 }}>02 ·</p>
            <h4 style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 10 }}>Hodiny v nástrojích místo v práci.</h4>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>Jedna AI píše, druhá generuje obrázky. Vy sedíte uprostřed a místo strategie řešíte nástroje.</p>
          </div>
        </div>
      </section>

      {/* SEKCE PRO KOHO */}
      <section style={{ background: BG, padding: "96px 80px", maxWidth: 1260, margin: "0 auto", position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            background: "radial-gradient(circle, rgba(183,233,76,.07), transparent)",
            bottom: -50,
            right: -50,
            filter: "blur(40px)",
            animation: "orbFloat2 9s infinite",
          }}
        />
        <p className="reveal" style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>Pro koho</p>
        <h2 className="reveal reveal-delay-1" style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 900, color: TEXT, marginBottom: 48 }}>
          Tato spolupráce je pro vás, pokud:
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            {PRO_KOHO_ITEMS.map((item, i) => (
              <div
                key={i}
                className="reveal"
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "18px 20px",
                  background: BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(183,233,76,.15)",
                    border: "1px solid rgba(183,233,76,.4)",
                    color: LIME_DARK,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
                <span style={{ fontSize: 14, color: TEXT }}>{item}</span>
              </div>
            ))}
            <div
              style={{
                marginTop: 20,
                background: "rgba(0,0,0,.03)",
                borderLeft: "3px solid rgba(0,0,0,.1)",
                padding: "18px 22px",
              }}
            >
              <p style={{ fontSize: 14, color: MUTED }}>Není pro vás</p>
              <p style={{ fontSize: 13, color: FAINT, marginTop: 4 }}>Hledáte jen hezké fotky nebo rychlé, jednorázové řešení.</p>
            </div>
          </div>
          <div className="reveal reveal-delay-2" style={{ position: "relative" }}>
            <img
              src="/placeholders/KDOJSEM_01.png"
              alt=""
              style={{
                width: "100%",
                maxHeight: "75vh",
                objectFit: "contain",
                objectPosition: "center",
                borderRadius: 22,
                boxShadow: "0 16px 50px rgba(0,0,0,.1)",
              }}
            />
          </div>
        </div>
      </section>

      {/* SEKCE FÁZE */}
      <section id="faze" style={{ background: BG1, padding: "96px 80px", maxWidth: 1260, margin: "0 auto" }}>
        <p className="reveal" style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>Struktura spolupráce</p>
        <h2 className="reveal reveal-delay-1" style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 900, color: TEXT, marginBottom: 16 }}>
          Jedna investice. Dvě fáze. Výsledek který zůstane.
        </h2>
        <p className="reveal reveal-delay-2" style={{ fontSize: 16, color: MUTED, marginBottom: 48 }}>
          Celková investice 56 800 Kč rozdělená do dvou po sobě jdoucích fází.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div
            className="reveal"
            style={{
              borderRadius: 24,
              padding: 48,
              background: "rgba(255,255,255,.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(183,233,76,.25)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <p style={{ fontSize: 11, textTransform: "uppercase", color: FAINT, marginBottom: 12 }}>Fáze 0 · Vstupní hovor</p>
            <p style={{ fontFamily: "var(--font-playfair), serif", fontSize: 38, fontWeight: 900, color: TEXT, marginBottom: 8 }}>7 800 Kč</p>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>Samostatná hodnota · Povinný první krok</p>
            <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 22, fontWeight: 900, color: TEXT, marginBottom: 20 }}>Strategický rozhovor o vaší značce.</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Vstupní strategický rozhovor (56 min)", "Vizuální board — kam vaše značka směřuje", "3 Canva šablony připravené na míru", "Podklad pro Fázi 1"].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: LIME, boxShadow: `0 0 8px ${GLOW_LIME}` }} />
                  <span style={{ fontSize: 14, color: TEXT }}>{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/rezervace"
              style={{
                display: "inline-block",
                marginTop: 24,
                background: LIME,
                color: TEXT,
                borderRadius: 11,
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Rezervovat vstupní hovor →
            </a>
          </div>

          <div
            className="reveal reveal-delay-1"
            style={{
              borderRadius: 24,
              padding: 48,
              background: "#111",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 12 }}>Fáze 1 · Luxus Vizuál Content</p>
            <p style={{ fontFamily: "var(--font-playfair), serif", fontSize: 38, fontWeight: 900, color: LIME, textShadow: "0 0 24px rgba(183,233,76,.3)", marginBottom: 8 }}>49 000 Kč</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 24 }}>Navazuje na Fázi 0</p>
            <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 20 }}>Systém který pracuje za vás.</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {FASE1_ITEMS.map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: LIME }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,.6)" }}>{item}</span>
                </li>
              ))}
            </ul>
            <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 20, marginTop: 20 }}>
              <p style={{ fontFamily: "var(--font-playfair), serif", fontSize: 30, fontWeight: 900, color: "#fff" }}>56 800 Kč</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCE JAK TO FUNGUJE */}
      <section id="jak-to-funguje" style={{ background: BG, padding: "96px 80px", maxWidth: 1260, margin: "0 auto", position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(183,233,76,.09), transparent)",
            top: -50,
            left: "50%",
            transform: "translateX(-50%)",
            filter: "blur(40px)",
            animation: "orbFloat3 9s infinite",
          }}
        />
        <p className="reveal" style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>Co se změní</p>
        <h2 className="reveal reveal-delay-1" style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 900, color: TEXT, marginBottom: 16 }}>
          Co se stane po dvou měsících.
        </h2>
        <p className="reveal reveal-delay-2" style={{ fontSize: 17, color: MUTED, marginBottom: 56 }}>
          Vytrénovaný agent zná vaši značku, váš hlas a vaši strategii.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { num: "01", title: "Zadáte co potřebujete.", text: "Žádné briefy, žádné vysvětlování. Agent zná vaši strategii, tón i vizuální standard." },
            { num: "02", title: "Agent naplánuje a připraví.", text: "Každý týden dostanete hotové výstupy — příspěvky, texty, vizuály." },
            { num: "03", title: "Vy zkontrolujete a schválíte.", text: "Vaše role je kontrolní. Přestanete řídit obsah. Začnete řídit značku." },
          ].map((s, i) => (
            <div
              key={s.num}
              className="reveal"
              style={{
                background: BG,
                border: `1px solid ${BORDER2}`,
                borderRadius: 20,
                padding: 34,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  border: "2px solid " + LIME,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: LIME_DARK,
                  marginBottom: 20,
                }}
              >
                {s.num}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEKCE KATARÍNA */}
      <section style={{ background: BG1, padding: "96px 80px", maxWidth: 1260, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "center" }}>
          <div>
            <p className="reveal" style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>Kdo za tím stojí</p>
            <h2 className="reveal reveal-delay-1" style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 900, color: TEXT, marginBottom: 24 }}>
              25 let práce s obrazem. Reálné značky.
            </h2>
            <p className="reveal reveal-delay-2" style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, marginBottom: 16 }}>
              Spolupracovala jsem s Komerční bankou, Vodafone, Oriflame. Dnes pracuji s lídry a podnikateli, kteří vědí že vizuální prezentace je součást ceny, kterou si účtují.
            </p>
            <p className="reveal reveal-delay-3" style={{ fontSize: 16, color: MUTED }}>
              Technologie navrhuje. Zkušenost vybírá. AI používám jako nástroj — ne jako náhradu za úsudek který se nedá naučit za týden.
            </p>

            <div
              ref={statsRef}
              className="katarina-stats"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 36 }}
            >
              <div
                className="stat-num"
                data-idx="0"
                style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px" }}
              >
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 900, color: TEXT }}>0</span>
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 900, color: LIME_DARK }}>+</span>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>let práce s obrazem</div>
              </div>
              <div
                className="stat-num"
                data-idx="1"
                style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px" }}
              >
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 900, color: TEXT }}>0</span>
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 900, color: LIME_DARK }}>+</span>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>realizovaných projektů</div>
              </div>
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px" }}>
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 900, color: TEXT }}>2</span>
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 900, color: LIME_DARK }}>měs</span>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>výcvik AI agenta</div>
              </div>
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px" }}>
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 900, color: TEXT }}>1</span>
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 900, color: LIME_DARK }}>systém</span>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>který pracuje za vás</div>
              </div>
            </div>
          </div>
          <div className="reveal reveal-delay-3" style={{ position: "relative" }}>
            <img
              src="/placeholders/KDOJSEM_01.png"
              alt=""
              style={{
                width: "100%",
                maxHeight: "75vh",
                objectFit: "contain",
                borderRadius: 22,
                boxShadow: "0 16px 60px rgba(0,0,0,.1)",
              }}
            />
          </div>
        </div>
      </section>

      {/* SEKCE FAQ */}
      <section style={{ background: BG, padding: "96px 80px", maxWidth: 1260, margin: "0 auto" }}>
        <p className="reveal" style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: LIME_DARK, marginBottom: 14 }}>FAQ</p>
        <h2 className="reveal reveal-delay-1" style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 900, color: TEXT, marginBottom: 48 }}>
          Nejčastější otázky.
        </h2>

        <div className="faq-details" style={{ border: `1px solid ${BORDER2}`, borderRadius: 20, overflow: "hidden" }}>
          {faqs.map((faq, i) => (
            <details
              key={faq.q}
              style={{
                borderBottom: i < faqs.length - 1 ? `1px solid ${BORDER}` : "none",
              }}
            >
              <summary
                style={{
                  padding: "24px 30px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  listStyle: "none",
                }}
              >
                {faq.q}
              </summary>
              <p
                className="faq-answer"
                style={{
                  padding: "0 30px 24px",
                  fontSize: 14,
                  color: MUTED,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        style={{
          background: "#111",
          textAlign: "center",
          padding: "110px 80px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(183,233,76,.1), transparent)",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            filter: "blur(60px)",
            animation: "orbFloat1 10s infinite",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(183,233,76,.07), transparent)",
            bottom: -80,
            right: "10%",
            filter: "blur(60px)",
            animation: "orbFloat2 8s infinite",
          }}
        />
        <h2
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(28px,3.5vw,52px)",
            fontWeight: 900,
            maxWidth: 700,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.35)", fontStyle: "normal" }}>Silná značka nepracuje hlasitěji.</span>
          <br />
          <em style={{ color: LIME, fontStyle: "italic", textShadow: "0 0 30px rgba(183,233,76,.4)" }}>Tvořte chytřeji.</em>
        </h2>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,.5)", marginBottom: 44, position: "relative", zIndex: 1 }}>
          První krok je vstupní hovor. 56 minut které změní způsob, jakým o své značce přemýšlíte.
        </p>
        <a
          href="/rezervace"
          style={{
            display: "inline-block",
            background: LIME,
            color: TEXT,
            borderRadius: 11,
            padding: "18px 40px",
            fontSize: 16,
            fontWeight: 700,
            boxShadow: "0 0 40px rgba(183,233,76,.35)",
            textDecoration: "none",
            position: "relative",
            zIndex: 1,
          }}
        >
          Rezervovat vstupní hovor →
        </a>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.25)", marginTop: 24, position: "relative", zIndex: 1 }}>7 800 Kč · Bez závazku Fáze 1</p>
      </section>

      <footer
        style={{
          borderTop: `1px solid ${BORDER}`,
          padding: "24px 40px",
          textAlign: "center",
          fontSize: 12,
          color: FAINT,
        }}
      >
        <a href="/obchodni-podminky" style={{ color: FAINT, textDecoration: "underline" }}>Obchodní podmínky</a>
        <span style={{ margin: "0 8px" }}>·</span>
        <a href="/gdpr" style={{ color: FAINT, textDecoration: "underline" }}>Ochrana osobních údajů</a>
        <span style={{ margin: "0 8px" }}>·</span>
        © {new Date().getFullYear()} Studio Lucifera
      </footer>
    </main>
  );
}
