"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const QUIZ_STEPS = [
  {
    q: "Co je pro tebe v obsahu nejdůležitější?",
    opts: ["Autenticita a osobní příběh", "Odbornost a výsledky", "Vizuální dojem", "Komunita a vztahy"],
  },
  {
    q: "Jak často chceš publikovat?",
    opts: ["Každý den", "3–4× týdně", "1–2× týdně", "Nepravidelně"],
  },
  {
    q: "Co tě nejvíc blokuje v tvorbě obsahu?",
    opts: ["Nemám čas", "Nevím co psát", "Bojím se reakcí", "Chybí mi systém"],
  },
  {
    q: "Jaký typ zákazníka chceš přitáhnout?",
    opts: ["Motivovaný a akční", "Hledající porozumění", "Profesionál s cílem", "Kdokoli, kdo potřebuje pomoc"],
  },
];

const MESSAGES = [
  "Načítám tvůj web…",
  "Analyzuji vizuální identitu…",
  "Čtu Brand DNA…",
  "Vyhodnocuji 5 pilířů značky…",
  "Připravuji doporučení stratéga…",
  "Dokončuji analýzu…",
];

// Strategist data
const STRATEGISTS: Record<string, { emoji: string; name: string; tagline: string; desc: string; color: string }> = {
  ilumina: {
    emoji: "✨",
    name: "Ilumina",
    tagline: "Příběh & jasné sdělení",
    desc: "Pomůže ti komunikovat tak, aby zákazník okamžitě pochopil tvoji hodnotu. Mistryně brand storytellingu.",
    color: "#f0e6ff",
  },
  impuls: {
    emoji: "⚡",
    name: "Impuls",
    tagline: "Energie & dosah",
    desc: "Zaměří se na obsah, který šíří a zvyšuje dosah tvé značky. Mistr virálního obsahu a viditelnosti.",
    color: "#fff8e0",
  },
  katalyzator: {
    emoji: "🔥",
    name: "Katalyzátor",
    tagline: "Emoce & transformace",
    desc: "Propojí zákazníka s tvou značkou na hlubší úrovni. Mistr emocí, loajality a prodeje vztahem.",
    color: "#fff1ed",
  },
  architect: {
    emoji: "🏗",
    name: "The Architect",
    tagline: "Hodnotová nabídka",
    desc: "Vytvoří neodolatelnou nabídku postavenou na hodnotovém vzorci — zákazník kupuje výsledek, ne produkt.",
    color: "#f0fce0",
  },
  signal: {
    emoji: "📡",
    name: "Signal",
    tagline: "Hlas & niche",
    desc: "Pomůže ti najít tvůj jedinečný hlas a cílovou skupinu. Mistr pozicování a permission marketingu.",
    color: "#e8f4ff",
  },
  content_voice: {
    emoji: "✍️",
    name: "Content Voice",
    tagline: "Texty & brand hlas",
    desc: "Převede tvé Brand DNA do konkrétních textů, bio a social copy. Hlas a příběh tvé značky.",
    color: "#f5f3ee",
  },
};

// Map quiz answers to strategist scores
function getRecommendedStrategists(answers: string[]): [string, string] {
  const scores: Record<string, number> = {
    ilumina: 0, impuls: 0, katalyzator: 0,
    architect: 0, signal: 0, content_voice: 0,
  };

  // Q1: Co je pro tebe v obsahu nejdůležitější?
  const q1 = answers[0] ?? "";
  if (q1.includes("Autenticita")) { scores.ilumina += 3; scores.katalyzator += 2; }
  if (q1.includes("Odbornost")) { scores.architect += 3; scores.content_voice += 2; }
  if (q1.includes("Vizuální")) { scores.impuls += 3; scores.ilumina += 1; }
  if (q1.includes("Komunita")) { scores.katalyzator += 3; scores.signal += 2; }

  // Q2: Jak často chceš publikovat?
  const q2 = answers[1] ?? "";
  if (q2.includes("Každý den") || q2.includes("3–4")) { scores.impuls += 2; scores.content_voice += 1; }
  if (q2.includes("1–2") || q2.includes("Nepravidelně")) { scores.signal += 1; scores.architect += 1; }

  // Q3: Co tě nejvíc blokuje?
  const q3 = answers[2] ?? "";
  if (q3.includes("čas")) { scores.architect += 3; scores.impuls += 1; }
  if (q3.includes("Nevím co psát")) { scores.content_voice += 3; scores.ilumina += 2; }
  if (q3.includes("Bojím")) { scores.katalyzator += 3; scores.ilumina += 2; }
  if (q3.includes("systém")) { scores.architect += 3; scores.signal += 1; }

  // Q4: Jaký typ zákazníka?
  const q4 = answers[3] ?? "";
  if (q4.includes("Motivovaný")) { scores.impuls += 2; scores.katalyzator += 2; }
  if (q4.includes("porozumění")) { scores.ilumina += 2; scores.content_voice += 2; }
  if (q4.includes("Profesionál")) { scores.architect += 2; scores.signal += 2; }
  if (q4.includes("Kdokoli")) { scores.content_voice += 2; scores.ilumina += 1; }

  // Sort by score, return top 2
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0]];
}

function AnalyzingInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") || "web";
  const url = searchParams.get("url") || "";
  const name = searchParams.get("name") || "";
  const ton = searchParams.get("ton") || "";
  const what = searchParams.get("what") || "";

  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [showStrategist, setShowStrategist] = useState(false);
  const [chosenStrategist, setChosenStrategist] = useState<string | null>(null);
  const [recommendedPair, setRecommendedPair] = useState<[string, string]>(["ilumina", "architect"]);
  const doneRef = useRef(false);
  const strategistShownRef = useRef(false);

  // Progress bar — 90s total, accelerates after quiz done
  useEffect(() => {
    const totalMs = quizDone ? 3000 : 90000;
    const targetPct = quizDone ? 100 : 85;
    const startPct = progress;
    const startTime = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / totalMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(startPct + (targetPct - startPct) * eased);
      setProgress(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizDone]);

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => Math.min(i + 1, MESSAGES.length - 1));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Show strategist screen when done
  useEffect(() => {
    if (progress >= 100 && quizDone && !strategistShownRef.current) {
      strategistShownRef.current = true;
      const pair = getRecommendedStrategists(quizAnswers);
      setRecommendedPair(pair);
      setTimeout(() => setShowStrategist(true), 400);
    }
  }, [progress, quizDone, quizAnswers]);

  // Redirect after strategist chosen
  function handleContinue(stratId: string) {
    if (doneRef.current) return;
    doneRef.current = true;
    setChosenStrategist(stratId);
    setTimeout(() => {
      if (type === "manual") {
        const p = new URLSearchParams({ type: "manual", name, ton, what, autostart: "1", strateg: stratId });
        router.push(`/brand-scan?${p.toString()}`);
      } else {
        const p = new URLSearchParams({ url, autostart: "1", strateg: stratId });
        router.push(`/brand-scan?${p.toString()}`);
      }
    }, 500);
  }

  function handleAnswer(opt: string) {
    if (transitioning) return;
    setSelectedOpt(opt);
    setTransitioning(true);
    setTimeout(() => {
      const next = [...quizAnswers, opt];
      setQuizAnswers(next);
      setSelectedOpt(null);
      setTransitioning(false);
      if (next.length >= QUIZ_STEPS.length) {
        setQuizDone(true);
      } else {
        setQuizStep(s => s + 1);
      }
    }, 400);
  }

  const displayLabel = type === "manual" ? (name || "Tvoje značka") : (url || "Tvůj web");
  const currentQ = QUIZ_STEPS[quizStep];
  const [primary, secondary] = recommendedPair;
  const primaryS = STRATEGISTS[primary];
  const secondaryS = STRATEGISTS[secondary];

  // ── Strategist selection screen ──────────────────────────────
  if (showStrategist) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f3ee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "system-ui, sans-serif" }}>

        {/* Logo */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 56, display: "flex", alignItems: "center", padding: "0 32px", background: "rgba(245,243,238,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8e4dc", zIndex: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/placeholders/LUCIFERA-Logo-Left.png" alt="Lucifera" style={{ height: 28, width: "auto" }} />
        </div>

        <div style={{ maxWidth: 580, width: "100%", paddingTop: 40, animation: "fadeUp .5s ease" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fce0", border: "1px solid #d4f0a0", borderRadius: 20, padding: "8px 18px", fontSize: 12, color: "#5a7a00", fontWeight: 600, marginBottom: 20 }}>
              ✓ Analýza dokončena
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#111", lineHeight: 1.25, margin: "0 0 12px" }}>
              Doporučujeme ti stratéga
            </h1>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: 0 }}>
              Na základě tvých odpovědí jsme vybrali dva stratégy.<br />
              Zvol si, kdo povede tvůj obsah.
            </p>
          </div>

          {/* Strategist cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

            {/* Primary */}
            <div style={{ background: "#fff", borderRadius: 20, border: "2px solid #b7e94c", padding: "28px 24px", position: "relative", boxShadow: "0 8px 32px rgba(183,233,76,0.15)" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#b7e94c", color: "#111", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
                Nejlepší shoda
              </div>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: primaryS?.color ?? "#f0fce0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 16 }}>
                {primaryS?.emoji}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 4 }}>{primaryS?.name}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#5a7a00", marginBottom: 12 }}>{primaryS?.tagline}</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 20 }}>{primaryS?.desc}</div>
              <button
                onClick={() => handleContinue(primary)}
                disabled={!!chosenStrategist}
                style={{ width: "100%", background: chosenStrategist === primary ? "#5a7a00" : "#111", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 600, cursor: chosenStrategist ? "default" : "pointer", fontFamily: "inherit", transition: "background .2s" }}
              >
                {chosenStrategist === primary ? "✓ Vybráno" : "Pokračovat s tímto →"}
              </button>
            </div>

            {/* Secondary */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e8e4dc", padding: "28px 24px", opacity: chosenStrategist && chosenStrategist !== secondary ? 0.5 : 1, transition: "opacity .3s" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: secondaryS?.color ?? "#f5f3ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 16 }}>
                {secondaryS?.emoji}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 4 }}>{secondaryS?.name}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>{secondaryS?.tagline}</div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 20 }}>{secondaryS?.desc}</div>
              <button
                onClick={() => handleContinue(secondary)}
                disabled={!!chosenStrategist}
                style={{ width: "100%", background: chosenStrategist === secondary ? "#5a7a00" : "#f5f3ee", color: chosenStrategist === secondary ? "#fff" : "#555", border: "1px solid #e8e4dc", borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 600, cursor: chosenStrategist ? "default" : "pointer", fontFamily: "inherit", transition: "all .2s" }}
              >
                {chosenStrategist === secondary ? "✓ Vybráno" : "Vybrat tohoto"}
              </button>
            </div>
          </div>

          {/* Skip link */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => handleContinue("ilumina")}
              disabled={!!chosenStrategist}
              style={{ background: "none", border: "none", fontSize: 12, color: "#aaa", cursor: chosenStrategist ? "default" : "pointer", fontFamily: "inherit", textDecoration: "underline" }}
            >
              Přeskočit — rozhodnu se později
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 20 }}>
            Zdarma · Bez registrace · Data nejsou sdílena
          </p>
        </div>

        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </main>
    );
  }

  // ── Progress + Quiz screen ────────────────────────────────────
  return (
    <main style={{ minHeight: "100vh", background: "#f5f3ee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "system-ui, sans-serif" }}>

      {/* Logo */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 56, display: "flex", alignItems: "center", padding: "0 32px", background: "rgba(245,243,238,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8e4dc", zIndex: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/placeholders/LUCIFERA-Logo-Left.png" alt="Lucifera" style={{ height: 28, width: "auto" }} />
      </div>

      <div style={{ maxWidth: 560, width: "100%", paddingTop: 40 }}>

        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e8e4dc", borderRadius: 20, padding: "8px 18px", fontSize: 13, color: "#555" }}>
            {type === "manual" ? "✨" : type === "instagram" ? "📱" : "🌐"}
            <span style={{ fontWeight: 600, color: "#111", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayLabel}</span>
          </div>
        </div>

        {/* Progress card */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e8e4dc", padding: "32px 36px", marginBottom: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: "#555", fontWeight: 500 }}>{MESSAGES[msgIndex]}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{progress}<span style={{ fontSize: 13, fontWeight: 400, color: "#aaa" }}>%</span></div>
          </div>
          <div style={{ height: 8, background: "#f0efeb", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #b7e94c, #8fd020)", borderRadius: 8, transition: "width 0.6s ease" }} />
          </div>
          {progress >= 100 && (
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "#5a7a00", fontWeight: 600 }}>
              ✓ Analýza dokončena — připravuji doporučení…
            </div>
          )}
        </div>

        {/* Quiz card */}
        {!quizDone ? (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e8e4dc", padding: "28px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", animation: "fadeUp .4s ease" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#5a7a00", marginBottom: 10 }}>
              Zatímco analyzujeme — {quizStep + 1} / {QUIZ_STEPS.length}
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#111", lineHeight: 1.3, marginBottom: 20 }}>
              {currentQ.q}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentQ.opts.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={transitioning}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${selectedOpt === opt ? "#b7e94c" : "#e8e4dc"}`,
                    background: selectedOpt === opt ? "#f0fce0" : "#fafaf8",
                    fontSize: 14,
                    color: "#111",
                    cursor: transitioning ? "default" : "pointer",
                    fontFamily: "inherit",
                    transition: "all .15s",
                  }}
                >{opt}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: "#f0fce0", border: "1px solid rgba(183,233,76,.35)", borderRadius: 20, padding: "28px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🎯</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 6 }}>
              Výborně! Zpracováváme výsledky.
            </div>
            <div style={{ fontSize: 13, color: "#5a7a00" }}>Ještě moment — vybíráme tvého stratéga…</div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 20 }}>
          Zdarma · Bez registrace · Data nejsou sdílena
        </p>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense>
      <AnalyzingInner />
    </Suspense>
  );
}
