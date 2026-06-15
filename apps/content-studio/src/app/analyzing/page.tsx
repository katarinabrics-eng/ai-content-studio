"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const STEPS = [
  { id: "vizualni", label: "Vizuální identita" },
  { id: "ton", label: "Tón komunikace" },
  { id: "konzistence", label: "Konzistence" },
  { id: "dna", label: "Brand DNA" },
];

const MESSAGES = [
  "Načítám tvůj web…",
  "Čteme obsah stránek…",
  "Hledáme ceny a služby…",
  "Analyzujeme reference klientů…",
  "Mapujeme vizuální identitu…",
  "Hodnotíme strukturu webu…",
  "Analyzujeme cílovou skupinu…",
  "Sestavujeme Brand DNA…",
  "Vybíráme stratéga…",
  "Připravujeme výsledky…",
  "Finalizujeme výsledky…",
];

type Strategist = {
  id: string;
  icon: string;
  name: string;
  tagline: string;
  desc: string;
};

const STRATEGIST_LIST: Strategist[] = [
  { id: "ilumina",     icon: "/constantina/ikonky bez pozadi/05.png",  name: "Ilumina",      tagline: "Brand storytelling",     desc: "Brand storytelling, zákazník jako hrdina. Pomůže ti komunikovat tak, aby zákazník okamžitě pochopil tvoji hodnotu." },
  { id: "impuls",      icon: "/constantina/ikonky bez pozadi/03.png",  name: "Impuls",       tagline: "Content systém & dosah", desc: "Content systém, viditelnost a dosah. Zaměří se na obsah, který šíří a zvyšuje dosah tvé značky." },
  { id: "katalyzator", icon: "/constantina/ikonky bez pozadi/01.png",  name: "Katalyzátor",  tagline: "Emoce & transformace",   desc: "Emocionální triggery, prodej a akce. Propojí zákazníka s tvou značkou na hlubší úrovni." },
  { id: "architect",   icon: "/constantina/ikonky bez pozadi/09.png",  name: "Architekt",    tagline: "Hodnotová nabídka",      desc: "Value stack, jasná nabídka a pozicionování. Vytvoří neodolatelnou nabídku postavenou na hodnotovém vzorci." },
  { id: "signal",      icon: "/constantina/ikonky bez pozadi/04.png",  name: "Signál",       tagline: "Pozicionování & niche",  desc: "Jasné pozicionování, niche expertíza. Pomůže ti najít tvůj jedinečný hlas a cílovou skupinu." },
  { id: "voice",       icon: "/constantina/ikonky bez pozadi/14.png",  name: "Content Voice", tagline: "Hlas & texty",          desc: "Hlas značky, texty a claims. Převede tvé Brand DNA do konkrétních textů, bio a social copy." },
];

function getRecommendedId(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("coach") || u.includes("mentor") || u.includes("kouč")) return "ilumina";
  if (u.includes("design") || u.includes("kreativ") || u.includes("foto")) return "impuls";
  if (u.includes("prodej") || u.includes("shop") || u.includes("eshop")) return "katalyzator";
  return "architect";
}

function Logo() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, display: "flex", alignItems: "center", padding: "0 40px", background: "rgba(250,250,246,0.97)", backdropFilter: "blur(12px)", borderBottom: "3px solid #000", zIndex: 10 }}>
      <img src="/constantina/Constant_logo_black.png" alt="Constantina" style={{ height: 44, width: "auto" }} />
    </div>
  );
}

function AnalyzingInner() {
  const searchParams = useSearchParams();
  const url  = searchParams.get("url")  || "";
  const name = searchParams.get("name") || "";
  const type = searchParams.get("type") || "web";
  const ton  = searchParams.get("ton")  || "";
  const what = searchParams.get("what") || "";

  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [phase, setPhase] = useState<"analyzing" | "strategist" | "done">("analyzing");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedStrateg, setSelectedStrateg] = useState<Strategist | null>(null);
  const [creating, setCreating] = useState(false);
  const [preCreatedProject, setPreCreatedProject] = useState<{ projectCode: string; token: string } | null>(null);
  const [scanLinePos, setScanLinePos] = useState(0);
  const analysisStarted = useRef(false);
  const doneRef = useRef(false);
  const strategistShownRef = useRef(false);

  // Scanline animace
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLinePos(p => (p + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Progress animace
  useEffect(() => {
    const totalMs = 90000;
    const targetPct = analysisResult || analysisError ? 100 : 90;
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
  }, [analysisResult, analysisError]);

  // Messages + steps
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => Math.min(i + 1, MESSAGES.length - 1));
      setActiveStep(s => Math.min(s + 1, STEPS.length - 1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // API call
  useEffect(() => {
    if (analysisStarted.current) return;
    analysisStarted.current = true;
    async function run() {
      try {
        const isManual = type === "manual";
        const body = isManual
          ? { manualData: `Název: ${name}\nTyp: ${what}\nTón: ${ton}`, format: "diagnostika" }
          : { url, format: "diagnostika" };
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Analýza selhala");
        const data = await res.json();
        setAnalysisResult(data);
      } catch (e: any) {
        setAnalysisError(e.message || "Chyba analýzy");
      }
    }
    run();
  }, []);

  // Show strategist when done
  useEffect(() => {
    if (progress >= 90 && (analysisResult || analysisError) && !strategistShownRef.current) {
      strategistShownRef.current = true;
      setTimeout(() => setPhase("strategist"), 800);
    }
  }, [progress, analysisResult, analysisError]);

  // Auto-create projekt
  useEffect(() => {
    if (!analysisResult) return;
    fetch("/api/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url, name, website: url, analysisResult,
        generatedPosts: analysisResult?.generatedPosts ?? [],
        brand_name: analysisResult?.result?.brandDna?.name ?? name ?? url,
        industry: "Ostatní",
        communication_goal: analysisResult?.result?.brandDna?.positioning ?? "",
        tone_of_voice: analysisResult?.result?.brandDna?.tone ?? "",
        platforms: ["instagram"],
      }),
    })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        setPreCreatedProject({
          projectCode: data.projectCode ?? data.access?.code ?? "",
          token: data.access?.magicToken ?? "",
        });
      }
    });
  }, [analysisResult]);

  async function handleCreateProject() {
    if (creating) return;
    if (preCreatedProject?.projectCode) {
      window.location.href = `/client/${preCreatedProject.projectCode}?token=${preCreatedProject.token}`;
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url, name, website: url, analysisResult,
          generatedPosts: analysisResult?.generatedPosts ?? [],
          brand_name: analysisResult?.result?.brandDna?.name ?? name ?? url,
          industry: "Ostatní",
          communication_goal: analysisResult?.result?.brandDna?.positioning ?? "",
          tone_of_voice: analysisResult?.result?.brandDna?.tone ?? "",
          platforms: ["instagram"],
        }),
      });
      const data = await res.json();
      const token = data.access?.magicToken ?? "";
      const projectCode = data.projectCode ?? data.access?.code ?? "";
      window.location.href = `/client/${projectCode}?token=${token}`;
    } catch {
      setCreating(false);
    }
  }

  function handleChooseStrateg(s: Strategist) {
    if (doneRef.current) return;
    doneRef.current = true;
    setSelectedStrateg(s);
    setTimeout(() => setPhase("done"), 400);
  }

  const displayLabel = type === "manual" ? (name || "Tvoje značka") : (url || "Tvůj web");
  const recommendedId = getRecommendedId(url);

  // ── STRATEGIST SCREEN ──
  if (phase === "strategist") {
    return (
      <main style={{ minHeight: "100vh", background: "#fafaf6", fontFamily: "'Special Elite', monospace", paddingTop: 80 }}>
        <Logo />
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 40px" }}>

          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#c9f31d", border: "3px solid #000", borderRadius: 999, padding: "8px 20px", fontSize: 13, color: "#000", boxShadow: "3px 3px 0 #000", marginBottom: 20 }}>
              ✓ Analýza dokončena
            </div>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(32px,5vw,64px)", textTransform: "uppercase", color: "#000", margin: "0 0 10px", lineHeight: 1 }}>
              Vyber si stratéga
            </h1>
            <p style={{ fontFamily: "'Special Elite', monospace", fontSize: 15, color: "#555", margin: 0 }}>
              Na základě analýzy doporučujeme <strong style={{ color: "#000" }}>{STRATEGIST_LIST.find(s => s.id === recommendedId)?.name}</strong>
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {STRATEGIST_LIST.map(s => {
              const isTop = s.id === recommendedId;
              return (
                <button
                  key={s.id}
                  onClick={() => handleChooseStrateg(s)}
                  style={{
                    background: isTop ? "#c9f31d" : "#fff",
                    border: "3px solid #000",
                    padding: "20px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "'Special Elite', monospace",
                    position: "relative",
                    boxShadow: isTop ? "5px 5px 0 #000" : "3px 3px 0 #000",
                    transition: "transform .15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "translate(-2px,-2px)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "")}
                >
                  {isTop && (
                    <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#000", color: "#c9f31d", fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 999, whiteSpace: "nowrap", fontFamily: "'Anton', sans-serif" }}>
                      Doporučeno
                    </div>
                  )}
                  <img src={s.icon} alt="" style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 12, display: "block" }} />
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, textTransform: "uppercase", color: "#000", marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: isTop ? "#000" : "#888", marginBottom: 8 }}>{s.tagline}</div>
                  <div style={{ fontSize: 12, color: "#444", lineHeight: 1.5 }}>{s.desc}</div>
                </button>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button onClick={() => handleChooseStrateg(STRATEGIST_LIST[0])} style={{ background: "none", border: "none", fontSize: 12, color: "#aaa", cursor: "pointer", fontFamily: "'Special Elite', monospace", textDecoration: "underline" }}>
              Přeskočit — rozhodnu se později
            </button>
          </div>
        </div>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </main>
    );
  }

  // ── DONE SCREEN ──
  if (phase === "done") {
    const score = analysisResult?.result?.brandScore?.total ?? 72;
    const dna = analysisResult?.result?.brandDna ?? {};
    const risks = analysisResult?.result?.risks ?? [];
    const actions = analysisResult?.result?.immediateActions ?? [];
    const pillars = analysisResult?.result?.pillarAnalysis ?? {};
    const summary = analysisResult?.result?.summary ?? "";
    const posts = analysisResult?.generatedPosts ?? [];

    return (
      <main style={{ minHeight: "100vh", background: "#fafaf6", fontFamily: "'Special Elite', monospace", paddingTop: 80 }}>
        <Logo />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px 80px" }}>

          {/* Stratég badge */}
          {selectedStrateg && (
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <img src={selectedStrateg.icon} alt="" style={{ width: 56, height: 56, objectFit: "contain", marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#c9f31d", border: "3px solid #000", borderRadius: 999, padding: "6px 18px", fontSize: 13, color: "#000", fontFamily: "'Special Elite', monospace", boxShadow: "3px 3px 0 #000" }}>
                ✓ Tvůj stratég: {selectedStrateg.name}
              </div>
            </div>
          )}

          {/* Skóre + DNA */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 0, border: "3px solid #000", background: "#fff", marginBottom: 24, boxShadow: "5px 5px 0 #000" }}>
            <div style={{ background: "#c9f31d", padding: "32px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: "3px solid #000" }}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 80, color: "#000", lineHeight: 1 }}>{score}</div>
              <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#000" }}>Index značky</div>
              <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 11, color: "#333", marginTop: 4 }}>
                {score >= 70 ? "↑ Nad průměrem oboru" : "Prostor pro růst"}
              </div>
            </div>
            <div style={{ padding: "28px 32px" }}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "#000", marginBottom: 16, borderBottom: "2px solid #c9f31d", paddingBottom: 8 }}>Brand DNA</div>
              {dna.positioning && <div style={{ fontSize: 13, color: "#333", lineHeight: 1.8, marginBottom: 8 }}><strong style={{ color: "#000" }}>Pozicionování: </strong>{dna.positioning}</div>}
              {dna.tone && <div style={{ fontSize: 13, color: "#333", lineHeight: 1.8, marginBottom: 8 }}><strong style={{ color: "#000" }}>Tón komunikace: </strong>{dna.tone}</div>}
              {dna.targetAudience && <div style={{ fontSize: 13, color: "#333", lineHeight: 1.8, marginBottom: 8 }}><strong style={{ color: "#000" }}>Cílová skupina: </strong>{dna.targetAudience}</div>}
              {dna.strengths?.length > 0 && <div style={{ fontSize: 13, color: "#333", lineHeight: 1.8 }}><strong style={{ color: "#000" }}>Silné stránky: </strong><span style={{ color: "#5a7a00" }}>✓ </span>{dna.strengths.join(" · ")}</div>}
              {!analysisResult && <div style={{ fontSize: 13, color: "#aaa" }}>{analysisError ? "Analýza webu se nezdařila." : "Brand DNA se připravuje…"}</div>}
            </div>
          </div>

          {/* Pilíře */}
          {Object.keys(pillars).length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 0, border: "3px solid #000", background: "#fff", marginBottom: 24, boxShadow: "5px 5px 0 #000" }}>
              {Object.entries(pillars).map(([key, pillar]: [string, any], i) => {
                const names: Record<string, string> = { light: "Hodnota", energy: "Energie", architecture: "Archit.", identity: "Identita", trust: "Důvěra" };
                const color = pillar.score >= 8 ? "#c9f31d" : pillar.score >= 5 ? "#f0a500" : "#e05a5a";
                return (
                  <div key={key} style={{ padding: "20px 16px", textAlign: "center", borderRight: i < 4 ? "3px solid #000" : "none" }}>
                    <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>{names[key] || key}</div>
                    <div style={{ height: 48, background: "#f0ede6", border: "2px solid #000", position: "relative", overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: color, height: `${pillar.score * 10}%`, transition: "height .6s ease" }} />
                    </div>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color: "#000" }}>{pillar.score}/10</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rizika + akce */}
          {(risks.length > 0 || actions.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={{ border: "3px solid #000", padding: "24px", background: "#fff", boxShadow: "4px 4px 0 #000" }}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#e05a5a", marginBottom: 12 }}>3 klíčová rizika</div>
                {risks.map((r: string, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: "#555", marginBottom: 8, display: "flex", gap: 8, lineHeight: 1.5 }}>
                    <span style={{ color: "#e05a5a", flexShrink: 0 }}>—</span>{r}
                  </div>
                ))}
              </div>
              <div style={{ border: "3px solid #c9f31d", padding: "24px", background: "#fff", boxShadow: "4px 4px 0 #000" }}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", marginBottom: 12 }}>Okamžité akce</div>
                {actions.map((a: string, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: "#333", marginBottom: 8, display: "flex", gap: 8, lineHeight: 1.5 }}>
                    <span style={{ color: "#5a7a00", flexShrink: 0 }}>→</span>{a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div style={{ border: "3px solid #000", padding: "24px 28px", background: "#fff", marginBottom: 24, boxShadow: "4px 4px 0 #000", borderLeft: "6px solid #c9f31d" }}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", marginBottom: 10 }}>Doporučený strategický posun</div>
              <div style={{ fontSize: 14, color: "#333", lineHeight: 1.8 }}>{summary}</div>
            </div>
          )}

          {/* Posty */}
          {posts.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(18px,3vw,28px)", letterSpacing: ".02em", textTransform: "uppercase", color: "#000", marginBottom: 20, textAlign: "center" }}>
                Tvůj obsah připravený k použití
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                {posts.slice(0, 4).map((post: any, i: number) => (
                  <div key={i} style={{ border: "3px solid #000", background: "#fff", overflow: "hidden", boxShadow: "4px 4px 0 #000" }}>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block", borderBottom: "3px solid #000" }} />
                    )}
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", background: "#000", color: "#c9f31d", padding: "3px 10px", display: "inline-block", marginBottom: 10 }}>{post.label || post.type || "POST"}</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 16, color: "#000", marginBottom: 8, lineHeight: 1.3 }}>{post.title}</div>
                      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.7, whiteSpace: "pre-line" }}>{post.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ background: "#000", padding: "48px", textAlign: "center", boxShadow: "8px 8px 0 #c9f31d" }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(24px,3.5vw,44px)", color: "#fff", textTransform: "uppercase", lineHeight: 1, marginBottom: 12 }}>
              Inovativní strategický posun
            </div>
            <p style={{ fontFamily: "'Special Elite', monospace", fontSize: 15, color: "#ccc", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
              Tvoje značka má potenciál. Jeden den s Constantinou ho přemění na výsledky.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://constantina.cz#scan" style={{ background: "#c9f31d", color: "#000", border: "3px solid #c9f31d", padding: "16px 36px", fontFamily: "'Special Elite', monospace", fontWeight: "bold", fontSize: 16, textDecoration: "none", boxShadow: "4px 4px 0 rgba(201,243,29,.5)", display: "inline-block" }}>
                Rezervovat Content Day →
              </a>
              <button
                onClick={handleCreateProject}
                disabled={creating}
                style={{ background: "transparent", color: "#fff", border: "3px solid #fff", padding: "16px 36px", fontFamily: "'Special Elite', monospace", fontWeight: "bold", fontSize: 16, cursor: creating ? "wait" : "pointer", opacity: creating ? 0.7 : 1, display: "inline-block" }}
              >
                {creating ? "Vytvářím…" : "Odemknout plnou strategii →"}
              </button>
            </div>
          </div>

        </div>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </main>
    );
  }

  // ── ANALYZING SCREEN ──
  return (
    <main style={{ minHeight: "100vh", background: "#fafaf6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px 48px", fontFamily: "'Special Elite', monospace" }}>
      <Logo />

      <div style={{ width: "100%", maxWidth: 800, paddingTop: 16 }}>

        {/* Badge URL */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "3px solid #000", borderRadius: 999, padding: "8px 20px", fontSize: 13, color: "#000", boxShadow: "3px 3px 0 #000" }}>
            🌐 <span style={{ fontWeight: 600 }}>{displayLabel}</span>
          </div>
        </div>

        {/* Mac frame s webem */}
        <div style={{ border: "3px solid #000", background: "#1c1c1e", boxShadow: "8px 8px 0 #000", marginBottom: 24, overflow: "hidden" }}>
          {/* Titlebar */}
          <div style={{ background: "#2a2a2c", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "3px solid #000" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", flexShrink: 0 }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", flexShrink: 0 }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
            <div style={{ flex: 1, background: "#3a3a3c", borderRadius: 6, padding: "4px 14px", marginLeft: 8, fontFamily: "'Special Elite', monospace", fontSize: 12, color: "#888", textAlign: "center" }}>{displayLabel}</div>
          </div>
          {/* Web preview area */}
          <div style={{ height: 320, background: "#f0ede8", position: "relative", overflow: "hidden" }}>
            {/* Scrollující web mockup */}
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ height: 60, background: "#fff", borderBottom: "1px solid #e8e4dc", display: "flex", alignItems: "center", padding: "0 20px", gap: 12 }}>
                <div style={{ width: 100, height: 20, background: "#000", borderRadius: 2 }} />
                <div style={{ flex: 1 }} />
                <div style={{ width: 60, height: 28, background: "#c9f31d", border: "2px solid #000", borderRadius: 999 }} />
              </div>
              <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ height: 32, background: "#000", borderRadius: 2, width: "60%" }} />
                <div style={{ height: 16, background: "#e8e4dc", borderRadius: 2, width: "80%" }} />
                <div style={{ height: 16, background: "#e8e4dc", borderRadius: 2, width: "70%" }} />
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <div style={{ flex: 1, height: 80, background: "#d8d4cc", borderRadius: 4 }} />
                  <div style={{ flex: 1, height: 80, background: "#d8d4cc", borderRadius: 4 }} />
                  <div style={{ flex: 1, height: 80, background: "#d8d4cc", borderRadius: 4 }} />
                </div>
              </div>
            </div>
            {/* Limetkový scanner */}
            <div style={{
              position: "absolute",
              left: 0, right: 0,
              top: `${scanLinePos}%`,
              height: 3,
              background: "#c9f31d",
              boxShadow: "0 0 12px #c9f31d, 0 0 24px rgba(201,243,29,0.5)",
              transition: "top 0.03s linear",
              zIndex: 10,
            }} />
            {/* Scan label */}
            <div style={{ position: "absolute", bottom: 14, left: 16, background: "rgba(0,0,0,0.7)", color: "#c9f31d", fontSize: 11, padding: "4px 12px", fontFamily: "'Special Elite', monospace", letterSpacing: ".1em" }}>
              {MESSAGES[msgIndex]}
            </div>
          </div>
        </div>

        {/* Steps pills */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: i <= activeStep ? "#c9f31d" : "#fff",
              border: "3px solid #000",
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 12,
              fontFamily: "'Special Elite', monospace",
              color: "#000",
              fontWeight: i === activeStep ? 700 : 400,
              boxShadow: i <= activeStep ? "2px 2px 0 #000" : "none",
              transition: "all .4s",
            }}>
              {i < activeStep && <span>✓</span>}
              {step.label}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ border: "3px solid #000", background: "#fff", height: 20, overflow: "hidden", boxShadow: "3px 3px 0 #000", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#c9f31d", transition: "width 0.6s ease" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 12, color: "#555" }}>
            {MESSAGES[msgIndex]}
          </div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, color: "#000" }}>
            {progress}<span style={{ fontSize: 12, fontFamily: "'Special Elite', monospace", color: "#888" }}>%</span>
          </div>
        </div>

        <p style={{ textAlign: "center", fontFamily: "'Special Elite', monospace", fontSize: 11, color: "#bbb", marginTop: 24 }}>
          Zdarma · Bez registrace · Data nejsou sdílena
        </p>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
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
