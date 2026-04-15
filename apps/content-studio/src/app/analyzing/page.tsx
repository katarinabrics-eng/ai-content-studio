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
  const doneRef = useRef(false);

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

  // Redirect when done
  useEffect(() => {
    if (progress >= 100 && quizDone && !doneRef.current) {
      doneRef.current = true;
      setTimeout(() => {
        if (type === "manual") {
          const p = new URLSearchParams({ type: "manual", name, ton, what, autostart: "1" });
          router.push(`/brand-scan?${p.toString()}`);
        } else {
          const p = new URLSearchParams({ url, autostart: "1" });
          router.push(`/brand-scan?${p.toString()}`);
        }
      }, 600);
    }
  }, [progress, quizDone, type, url, name, ton, what, router]);

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
              ✓ Analýza dokončena — přesměrovávám…
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
            <div style={{ fontSize: 13, color: "#5a7a00" }}>Ještě moment — dokončujeme analýzu…</div>
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
