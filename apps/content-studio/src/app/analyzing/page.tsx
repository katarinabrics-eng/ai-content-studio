"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type QuizOpt = {
  img?: string;
  bg?: string;
  e?: string;
  text: string;
  desc: string;
};

const QUIZ_STEPS: { q: string; opts: QuizOpt[] }[] = [
  {
    q: "Co je pro tebe v obsahu nejdůležitější?",
    opts: [
      { img: '/placeholders/stock-vizualni knihovna/K03/k03-001.jpeg', text: 'Autenticita a osobní příběh', desc: 'Být sám sebou, sdílet cestu' },
      { img: '/placeholders/stock-vizualni knihovna/K02/k02-001.jpeg', text: 'Odbornost a výsledky', desc: 'Ukázat expertízu a výsledky' },
      { img: '/placeholders/stock-vizualni knihovna/K04/k04-001.jpeg', text: 'Vizuální dojem', desc: 'Estetika, styl, první dojem' },
      { img: '/placeholders/stock-vizualni knihovna/K01/k01-001.jpeg', text: 'Komunita a vztahy', desc: 'Budovat spojení a důvěru' },
    ],
  },
  {
    q: "Pro koho tvoříš obsah?",
    opts: [
      { bg: '#f0e8f8', e: '👤', text: 'Osobní značky', desc: 'Koučové, lektoři, konzultanti' },
      { bg: '#e8f0f8', e: '💼', text: 'Podnikatelé & firmy', desc: 'Hledají růst a výsledky' },
      { bg: '#f8f0e8', e: '🎨', text: 'Kreativci', desc: 'Umělci, designéři, fotografové' },
      { bg: '#e8f8ec', e: '🌱', text: 'Začátečníci', desc: 'Teprve budují svůj brand' },
    ],
  },
  {
    q: "Jakým stylem chceš komunikovat?",
    opts: [
      { img: '/placeholders/stock-vizualni knihovna/K04/k04-007.jpeg', text: 'Průvodce ✨', desc: '"Každý krok tě přiblíží." — příběhem' },
      { img: '/placeholders/stock-vizualni knihovna/K07/k07-083.jpeg', text: 'Aktivátor ⚡', desc: '"Přestaň čekat. Jednej." — silně' },
      { img: '/placeholders/stock-vizualni knihovna/K03/k03-007.jpeg', text: 'Architekt 🏗', desc: '"3 kroky jak zlepšit X." — strukturovaně' },
      { img: '/placeholders/stock-vizualni knihovna/K05/k05-007.png', text: 'Disruptor 🔥', desc: '"Všichni říkají X. Já ne." — provokativně' },
    ],
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

type Strategist = {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  desc: string;
  color: string;
};

const STRATEGIST_LIST: Strategist[] = [
  { id: "ilumina",     emoji: "✨", name: "Ilumina",       tagline: "Brand storytelling",     color: "#f5e6ff", desc: "Brand storytelling, zákazník jako hrdina. Pomůže ti komunikovat tak, aby zákazník okamžitě pochopil tvoji hodnotu." },
  { id: "impuls",      emoji: "⚡", name: "Impuls",         tagline: "Content systém & dosah", color: "#fff8e1", desc: "Content systém, viditelnost a dosah. Zaměří se na obsah, který šíří a zvyšuje dosah tvé značky." },
  { id: "katalyzator", emoji: "🔥", name: "Katalyzátor",    tagline: "Emoce & transformace",   color: "#fff0e6", desc: "Emocionální triggery, prodej a akce. Propojí zákazníka s tvou značkou na hlubší úrovni." },
  { id: "architect",   emoji: "🏗", name: "Architekt",      tagline: "Hodnotová nabídka",      color: "#e6f0ff", desc: "Value stack, jasná nabídka a pozicionování. Vytvoří neodolatelnou nabídku postavenou na hodnotovém vzorci." },
  { id: "signal",      emoji: "📡", name: "Signál",         tagline: "Pozicionování & niche",  color: "#e6fff0", desc: "Jasné pozicionování, niche expertíza. Pomůže ti najít tvůj jedinečný hlas a cílovou skupinu." },
  { id: "voice",       emoji: "✍️", name: "Content Voice",  tagline: "Hlas & texty",           color: "#fff5e6", desc: "Hlas značky, texty a claims. Převede tvé Brand DNA do konkrétních textů, bio a social copy." },
];

function getRecommendedIds(answers: string[]): [string, string] {
  const scores: Record<string, number> = {
    ilumina: 0, impuls: 0, katalyzator: 0, architect: 0, signal: 0, voice: 0,
  };

  const q1 = answers[0] ?? "";
  if (q1.includes("Autenticita")) { scores.ilumina += 3; scores.katalyzator += 2; }
  if (q1.includes("Odbornost"))   { scores.architect += 3; scores.voice += 2; }
  if (q1.includes("Vizuální"))    { scores.impuls += 3; scores.ilumina += 1; }
  if (q1.includes("Komunita"))    { scores.katalyzator += 3; scores.signal += 2; }

  const q2 = answers[1] ?? "";
  if (q2.includes("Osobní značky"))   { scores.ilumina += 2; scores.voice += 2; }
  if (q2.includes("Podnikatelé"))     { scores.architect += 2; scores.impuls += 2; }
  if (q2.includes("Kreativci"))       { scores.impuls += 2; scores.ilumina += 1; }
  if (q2.includes("Začátečníci"))     { scores.signal += 2; scores.katalyzator += 1; }

  const q3 = answers[2] ?? "";
  if (q3.includes("Průvodce"))  { scores.ilumina += 3; scores.voice += 1; }
  if (q3.includes("Aktivátor")) { scores.impuls += 3; scores.katalyzator += 2; }
  if (q3.includes("Architekt")) { scores.architect += 3; scores.signal += 1; }
  if (q3.includes("Disruptor")) { scores.katalyzator += 3; scores.signal += 2; }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0]];
}

const SAMPLE_POSTS = [
  {
    type: 'video',
    label: 'VIDEO · REELS',
    variant: 'Varianta A',
    platform: 'Instagram',
    duration: '15s · Reels',
    style: 'Storytelling · přirozený moment',
    title: '"Ráno. Okno. Ticho před dnem."',
    body: `Každé ráno si říkám – dneska to zvládnu.\nA pak přijde ten moment, kdy všechno zpomalí.\nOkno. Světlo. Ticho.\n\nTo je tvůj obsah. Každý týden. Bez námahy.`,
    img: '/placeholders/stock-vizualni knihovna/K04/k04-006.png',
    selected: true,
  },
  {
    type: 'video',
    label: 'VIDEO · REELS',
    variant: 'Varianta B',
    platform: 'Instagram',
    duration: '12s · Reels',
    style: 'Hook přímý · osobní tón',
    title: '"Tohle ti nikdo neřekne."',
    body: `Strávila jsem hodiny přemýšlením co postovat.\nPak jsem to vzdala.\nA nechala systém pracovat za mě.\n\n3 posty týdně. Hotovo za 5 minut.`,
    img: '/placeholders/stock-vizualni knihovna/K07/k07-085.jpeg',
    selected: false,
  },
  {
    type: 'grafika',
    label: 'GRAFIKA',
    variant: null,
    platform: 'Instagram',
    duration: null,
    style: 'Soft feminine · lifestyle',
    title: '"Kdy jsi naposledy stála a jen… byla?"',
    body: `Obsah který mluví za tebe.\nBez zbytečného přemýšlení.`,
    img: '/placeholders/stock-vizualni knihovna/K04/k04-018.png',
    selected: false,
  },
  {
    type: 'grafika',
    label: 'GRAFIKA',
    variant: null,
    platform: 'Instagram',
    duration: null,
    style: 'Editorial · atmosféra',
    title: '"Volnost má svůj rytmus."',
    body: `Vizuál připravený k použití.\nStačí schválit a zveřejnit.`,
    img: '/placeholders/stock-vizualni knihovna/K04/k04-019.png',
    selected: false,
  },
];

const FORMAT_IDS = ['instagram', 'reels', 'facebook', 'linkedin', 'newsletter', 'stories'];

function Logo() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 56, display: "flex", alignItems: "center", padding: "0 32px", background: "rgba(245,243,238,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8e4dc", zIndex: 10 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/placeholders/LUCIFERA-Logo-Left.png" alt="Lucifera" style={{ height: 28, width: "auto" }} />
    </div>
  );
}

function AnalyzingInner() {
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "web";
  const url  = searchParams.get("url")  || "";
  const name = searchParams.get("name") || "";
  const ton  = searchParams.get("ton")  || "";
  const what = searchParams.get("what") || "";

  const [progress, setProgress]           = useState(0);
  const [msgIndex, setMsgIndex]           = useState(0);
  const [quizStep, setQuizStep]           = useState(0);
  const [quizAnswers, setQuizAnswers]     = useState<string[]>([]);
  const [quizDone, setQuizDone]           = useState(false);
  const [selectedOpt, setSelectedOpt]     = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [showStrategist, setShowStrategist] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<[string, string]>(["ilumina", "architect"]);
  const [selectedStrateg, setSelectedStrateg] = useState<Strategist | null>(null);
  // ZMENA 1 — rozšírený phase type
  const [phase, setPhase] = useState<"analyzing" | "formats" | "strategist" | "done">("analyzing");
  // ZMENA 2 — analysisResult state
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const analysisStarted = useRef(false);
  const doneRef             = useRef(false);
  const strategistShownRef  = useRef(false);

  useEffect(() => {
    const totalMs  = quizDone ? 3000 : 90000;
    const targetPct = quizDone ? 100 : 85;
    const startPct  = progress;
    const startTime = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t    = Math.min(1, elapsed / totalMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next  = Math.round(startPct + (targetPct - startPct) * eased);
      setProgress(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizDone]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => Math.min(i + 1, MESSAGES.length - 1));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && quizDone && !strategistShownRef.current) {
      strategistShownRef.current = true;
      const ids = getRecommendedIds(quizAnswers);
      setRecommendedIds(ids);
      setTimeout(() => setShowStrategist(true), 400);
    }
  }, [progress, quizDone, quizAnswers]);

  // ZMENA 3 — API useEffect
  useEffect(() => {
    if (analysisStarted.current) return;
    analysisStarted.current = true;
    async function run() {
      try {
        const isManual = type === 'manual';
        const body = isManual
          ? { manualData: `Název: ${name}\nTyp: ${what}\nTón: ${ton}`, format: 'diagnostika' }
          : { url, format: 'diagnostika' };
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Analýza selhala');
        const data = await res.json();
        setAnalysisResult(data);
      } catch (e: any) {
        setAnalysisError(e.message || 'Chyba analýzy');
      }
    }
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChooseStrateg(s: Strategist) {
    if (doneRef.current) return;
    doneRef.current = true;
    setSelectedStrateg(s);
    setTimeout(() => setPhase("done"), 400);
  }

  function handleAnswer(text: string) {
    if (transitioning) return;
    setSelectedOpt(text);
    setTransitioning(true);
    setTimeout(() => {
      const next = [...quizAnswers, text];
      setQuizAnswers(next);
      setSelectedOpt(null);
      setTransitioning(false);
      if (next.length >= QUIZ_STEPS.length) {
        // ZMENA 4 — rozvetvenie podľa type
        setQuizDone(true);
        if (type !== 'manual') {
          setPhase('formats');
        }
      } else {
        setQuizStep(s => s + 1);
      }
    }, 400);
  }

  const displayLabel = type === "manual" ? (name || "Tvoje značka") : (url || "Tvůj web");
  const currentQ     = QUIZ_STEPS[quizStep];
  const [primaryId, secondaryId] = recommendedIds;

  // ZMENA 5 — formats screen
  if (phase === 'formats') {
    const selectedFormats = quizAnswers.filter(a => FORMAT_IDS.includes(a));
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0ede6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: '#aaa' }}>LUCIFERA</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f2ec', borderRadius: 20, padding: '5px 14px' }}>
            <div style={{ width: 70, height: 4, background: '#e8e4dc', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#b7e94c', borderRadius: 4, width: '90%', transition: 'width 1s' }} />
            </div>
            <div style={{ fontSize: 11, color: '#5a7a00', fontWeight: 600 }}>Výběr formátů…</div>
          </div>
        </div>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7a00', marginBottom: 8, textAlign: 'center' }}>
            Poslední krok
          </div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#111', marginBottom: 6, textAlign: 'center', lineHeight: 1.3 }}>
            Co chceš dostávat?
          </div>
          <div style={{ fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 28 }}>
            Vyber formáty — AI připraví obsah přesně pro tebe.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { id: 'instagram', e: '📸', name: 'Instagram post', desc: 'Fotka + caption + hashtagy' },
              { id: 'reels',     e: '🎬', name: 'Reels / Video',  desc: 'Skript + hook + CTA' },
              { id: 'facebook',  e: '💬', name: 'Facebook post',  desc: 'Delší text, komunita' },
              { id: 'linkedin',  e: '💼', name: 'LinkedIn',       desc: 'Odborný příspěvek' },
              { id: 'newsletter',e: '📧', name: 'Newsletter',     desc: 'Email pro odběratele' },
              { id: 'stories',   e: '✨', name: 'Stories',        desc: 'Krátký obsah, 24h' },
            ].map(f => {
              const isSel = quizAnswers.includes(f.id);
              return (
                <div
                  key={f.id}
                  onClick={() => {
                    setQuizAnswers(prev =>
                      prev.includes(f.id)
                        ? prev.filter(x => x !== f.id)
                        : [...prev, f.id]
                    );
                  }}
                  style={{
                    border: `1.5px solid ${isSel ? '#b7e94c' : '#e8e4dc'}`,
                    borderRadius: 12, padding: '13px 14px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    background: isSel ? '#f0fce0' : '#fff',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ fontSize: 22, flexShrink: 0 }}>{f.e}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{f.desc}</div>
                  </div>
                  {isSel && <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: '#b7e94c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#1a2a00', flexShrink: 0 }}>✓</div>}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', marginBottom: 16 }}>
            {selectedFormats.length === 0
              ? 'Vyber aspoň jeden formát'
              : `${selectedFormats.length} formátů vybráno`}
          </div>
          <button
            onClick={() => setPhase('strategist')}
            style={{
              width: '100%', background: '#111', color: '#fff',
              border: 'none', borderRadius: 12, padding: 14,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Zobrazit výsledky →
          </button>
        </div>
      </div>
    );
  }

  // ── DONE SCREEN ──────────────────────────────────────────────
  if (phase === "done") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f3ee", fontFamily: "system-ui, sans-serif" }}>
        <Logo />
        <div style={{ width: "100%", maxWidth: "none", padding: "80px 48px 48px", animation: "fadeUp .4s ease" }}>

          {/* Stratég badge */}
          {selectedStrateg && (
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{selectedStrateg.emoji}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fce0", border: "1px solid #d4f0a0", borderRadius: 20, padding: "7px 16px", fontSize: 12, color: "#5a7a00", fontWeight: 600, marginBottom: 4 }}>
                ✓ Stratég vybrán
              </div>
              <div style={{ fontSize: 13, color: "#5a7a00", fontWeight: 600, marginTop: 6 }}>
                Tvůj stratég: {selectedStrateg.name}
              </div>
            </div>
          )}

          {/* Label */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#5a7a00", marginBottom: 12 }}>
            Tvůj obsah připravený k použití
          </div>

          {/* Unified grid — video + grafika */}
          <div className="results-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
            {SAMPLE_POSTS.map((post, i) =>
              post.type === "video" ? (
                <div key={i} style={{ display: "flex", gap: 0, background: "#fff", border: post.selected ? "1px solid #111" : "1px solid #e8e4dc", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ flexShrink: 0, width: 220, position: "relative", overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 9, padding: "2px 7px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
                      ▶ {post.duration}
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#b7e94c", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>{post.label}</div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111", lineHeight: 1.4, margin: "0 0 6px" }}>{post.title}</p>
                    <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>{post.style}</p>
                    <div style={{ fontSize: 11, color: "#555", background: "#f5f3ee", borderRadius: 6, padding: "8px 10px", lineHeight: 1.6, whiteSpace: "pre-line", marginBottom: 10 }}>
                      {post.body}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {post.variant && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "#f0f0f0", color: "#666" }}>{post.variant}</span>}
                      <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "#f0f0f0", color: "#666" }}>{post.platform}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={i} style={{ background: "#fff", border: "1px solid #e8e8e4", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ width: "100%", height: 320, overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: "inline-flex", fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "#dcfce7", color: "#15803d", letterSpacing: ".06em", marginBottom: 8 }}>
                      □ {post.label}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#111", lineHeight: 1.4, marginBottom: 2 }}>{post.title}</div>
                    <div style={{ fontSize: 10, color: "#9a9a90" }}>{post.style}</div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* ZMENA 6 — Brand DNA s reálnymi dátami */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#5a7a00", marginBottom: 12 }}>
            Tvá Brand DNA strategie
          </div>
          <div style={{ position: "relative", borderRadius: 12, border: "1px solid #e8e4dc", background: "#fff", overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "20px 20px 0" }}>
              {analysisResult?.result?.brandScore?.total && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "12px 16px", background: "#f5f2ec", borderRadius: 10 }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: "#111", lineHeight: 1 }}>
                    {analysisResult.result.brandScore.total}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Index značky</div>
                    <div style={{ fontSize: 12, color: "#777" }}>
                      {analysisResult.result.brandScore.total >= 70 ? '↑ Nad průměrem oboru' : 'Prostor pro růst'}
                    </div>
                  </div>
                </div>
              )}
              {analysisResult?.result?.brandDna?.positioning && (
                <div style={{ fontSize: 13, color: "#333", lineHeight: 1.8, marginBottom: 8 }}>
                  <strong style={{ color: "#111" }}>Pozicionování: </strong>
                  {analysisResult.result.brandDna.positioning}
                </div>
              )}
              {analysisResult?.result?.brandDna?.tone && (
                <div style={{ fontSize: 13, color: "#333", lineHeight: 1.8, marginBottom: 8 }}>
                  <strong style={{ color: "#111" }}>Tón komunikace: </strong>
                  {analysisResult.result.brandDna.tone}
                </div>
              )}
              {analysisResult?.result?.brandDna?.targetAudience && (
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>
                  <strong style={{ color: "#111" }}>Cílová skupina: </strong>
                  {analysisResult.result.brandDna.targetAudience}
                </div>
              )}
              {!analysisResult && (
                <div style={{ fontSize: 13, color: "#aaa", paddingBottom: 16 }}>
                  {analysisError ? 'Analýza webu sa nezdařila.' : 'Brand DNA sa připravuje…'}
                </div>
              )}
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 140, background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111", marginBottom: 3, textAlign: "center" }}>Odemkni plnou Brand DNA strategii</div>
              <div style={{ fontSize: 11, color: "#888", textAlign: "center" }}>Pozicionování · Pilíře · Archetyp · Stratég</div>
            </div>
            <div style={{ height: 160 }} />
          </div>

          {/* Zamknuté príspevky */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
            {[4, 5, 6].map(i => (
              <div key={i} style={{ background: "#f7f5f0", border: "1px solid #e8e4dc", borderRadius: 10, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 80, gap: 6 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <div style={{ fontSize: 11, color: "#ccc" }}>Příspěvek {i}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginBottom: 24 }}>
            Předplať si a získej obsah každý týden →
          </div>

          {/* CTA */}
          <div style={{ background: "#f5f2ec", borderRadius: 12, padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 3 }}>Ulož výsledky zdarma</div>
              <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>Brand DNA, 3 příspěvky ke stažení a vizuální knihovna.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
              <button style={{ background: "#111", color: "#fff", border: "none", borderRadius: 9, padding: "11px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                Vytvořit účet zdarma →
              </button>
              <button style={{ background: "none", border: "none", fontSize: 11, color: "#aaa", cursor: "pointer", fontFamily: "inherit" }}>
                Pokračovat bez účtu
              </button>
            </div>
          </div>

        </div>
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
          @media (max-width: 768px) {
            .results-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>
    );
  }

  // ── STRATEGIST SELECTION SCREEN ──────────────────────────────
  if (showStrategist) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f3ee", display: "flex", flexDirection: "column", justifyContent: "flex-start", padding: "80px 40px 48px", fontFamily: "system-ui, sans-serif" }}>
        <Logo />
        <div style={{ width: "100%", animation: "fadeUp .5s ease" }}>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fce0", border: "1px solid #d4f0a0", borderRadius: 20, padding: "8px 18px", fontSize: 12, color: "#5a7a00", fontWeight: 600, marginBottom: 16 }}>
              ✓ Analýza dokončena
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#111", lineHeight: 1.25, margin: "0 0 10px" }}>
              Vyber si svého stratéga
            </h1>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: 0 }}>
              Na základě tvých odpovědí doporučujeme <strong style={{ color: "#111" }}>
                {STRATEGIST_LIST.find(s => s.id === primaryId)?.name}
              </strong>.<br />
              Můžeš vybrat i jiného — kdo tě osloví.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {STRATEGIST_LIST.map(s => {
              const isTop = s.id === primaryId;
              const isSecond = s.id === secondaryId;
              return (
                <button
                  key={s.id}
                  onClick={() => handleChooseStrateg(s)}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: isTop ? "2px solid #b7e94c" : isSecond ? "1.5px solid #d4f0a0" : "1px solid #e8e4dc",
                    padding: "20px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    position: "relative",
                    boxShadow: isTop ? "0 6px 24px rgba(183,233,76,0.18)" : "none",
                    transition: "transform .15s, box-shadow .15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = isTop ? "0 6px 24px rgba(183,233,76,0.18)" : "none"; }}
                >
                  {isTop && (
                    <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#b7e94c", color: "#111", fontSize: 9, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                      Doporučeno
                    </div>
                  )}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>
                    {s.emoji}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 3 }}>{s.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: isTop ? "#5a7a00" : "#aaa", marginBottom: 8 }}>{s.tagline}</div>
                  <div style={{ fontSize: 11, color: "#666", lineHeight: 1.5 }}>{s.desc}</div>
                </button>
              );
            })}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => handleChooseStrateg(STRATEGIST_LIST[0])}
              style={{ background: "none", border: "none", fontSize: 12, color: "#aaa", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}
            >
              Přeskočit — rozhodnu se později
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 20 }}>
            Zdarma · Bez registrace · Data nejsou sdílena
          </p>
        </div>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </main>
    );
  }

  // ── PROGRESS + QUIZ SCREEN ────────────────────────────────────
  return (
    <main style={{ minHeight: "100vh", background: "#f5f3ee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px 48px", fontFamily: "system-ui, sans-serif" }}>
      <Logo />

      <div style={{ width: "100%", maxWidth: 960, paddingTop: 16 }}>

        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e8e4dc", borderRadius: 20, padding: "8px 18px", fontSize: 13, color: "#555" }}>
            {type === "manual" ? "✨" : type === "instagram" ? "📱" : "🌐"}
            <span style={{ fontWeight: 600, color: "#111", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayLabel}</span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="analyzing-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>

          {/* Left panel — orb + progress */}
          <div className="left-panel">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, position: "relative" }}>
              <div style={{ position: "relative", width: 120, height: 120 }}>
                <div style={{
                  position: "absolute", inset: -16, borderRadius: "50%",
                  border: "1px solid rgba(183,233,76,0.25)",
                  animation: "orbRing 3s ease-in-out infinite",
                }} />
                <div style={{
                  position: "absolute", inset: -8, borderRadius: "50%",
                  border: "1px solid rgba(183,233,76,0.4)",
                  animation: "orbRing 3s ease-in-out infinite .4s",
                }} />
                <div style={{
                  width: 120, height: 120, borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #d3ee7f, #b7e94c 45%, #8fd020)",
                  boxShadow: "0 0 40px rgba(183,233,76,0.5), 0 0 80px rgba(183,233,76,0.25)",
                  animation: "orbPulse 3s ease-in-out infinite",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }} />
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8e4dc", padding: "20px 22px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 13, color: "#555", fontWeight: 500, marginBottom: 12, minHeight: 36, lineHeight: 1.4 }}>
                {MESSAGES[msgIndex]}
              </div>
              <div style={{ height: 6, background: "#f0efeb", borderRadius: 6, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #b7e94c, #8fd020)", borderRadius: 6, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#111", textAlign: "right", marginBottom: 16 }}>
                {progress}<span style={{ fontSize: 12, fontWeight: 400, color: "#aaa" }}>%</span>
              </div>

              <div style={{ borderTop: "1px solid #f0efeb", paddingTop: 14 }}>
                {MESSAGES.map((msg, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", opacity: i <= msgIndex ? 1 : 0.3, transition: "opacity .4s" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: i < msgIndex ? "#b7e94c" : i === msgIndex ? "#111" : "#ddd", transition: "background .4s" }} />
                    <span style={{ fontSize: 11, color: i < msgIndex ? "#5a7a00" : i === msgIndex ? "#111" : "#bbb", lineHeight: 1.4 }}>{msg}</span>
                  </div>
                ))}
              </div>

              {progress >= 100 && (
                <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: "#5a7a00", fontWeight: 600, background: "#f0fce0", borderRadius: 8, padding: "8px 12px" }}>
                  ✓ Dokončeno — připravuji doporučení…
                </div>
              )}
            </div>
          </div>

          {/* Right panel — quiz */}
          <div>
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
                      key={opt.text}
                      onClick={() => handleAnswer(opt.text)}
                      disabled={transitioning}
                      style={{
                        textAlign: "left",
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${selectedOpt === opt.text ? "#b7e94c" : "#e8e4dc"}`,
                        background: selectedOpt === opt.text ? "#f0fce0" : "#fafaf8",
                        cursor: transitioning ? "default" : "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      {opt.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={opt.img} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 52, height: 52, borderRadius: 8, background: opt.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                          {opt.e}
                        </div>
                      )}
                      <div>
                        <strong style={{ display: "block", fontSize: 14, color: "#111", fontWeight: 600, marginBottom: 2 }}>{opt.text}</strong>
                        <span style={{ fontSize: 12, color: "#888" }}>{opt.desc}</span>
                      </div>
                    </button>
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
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 20 }}>
          Zdarma · Bez registrace · Data nejsou sdílena
        </p>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(183,233,76,.5), 0 0 80px rgba(183,233,76,.25); }
          50% { transform: scale(1.06); box-shadow: 0 0 60px rgba(183,233,76,.7), 0 0 110px rgba(183,233,76,.35); }
        }
        @keyframes orbRing {
          0%, 100% { transform: scale(1); opacity: .3; }
          50% { transform: scale(1.18); opacity: .65; }
        }
        @media (max-width: 768px) {
          .results-grid { grid-template-columns: 1fr !important; }
          .analyzing-layout { grid-template-columns: 1fr !important; }
          .left-panel { display: none !important; }
        }
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
