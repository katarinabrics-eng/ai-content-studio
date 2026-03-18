"use client";
import { useEffect, useRef, useState } from "react";

const PILLARS = [
  { name: "Vizuální konzistence", score: 82 },
  { name: "Tón komunikace",       score: 58 },
  { name: "Online přítomnost",    score: 74 },
  { name: "Storytelling",         score: 41 },
  { name: "Brand DNA",            score: 67 },
  { name: "Zákaznická cesta",     score: 53 },
];
const TOTAL = Math.round(PILLARS.reduce((a, p) => a + p.score, 0) / PILLARS.length);
const STAGE_DURATION = [2800, 3200, 2800, 3400, 4200, 5000];
const STAGES = 6;
const POST_TEXT =
  "Věděli jste, že první dojem trvá méně než 50 ms?\n\nVaše vizuální identita buď prodává — nebo odpuzuje. Bez jediného slova.\n\n→ Diagnostika značky zdarma v odkazu v biu.";
const LIME = "#b7e94c";
const CIRC = 2 * Math.PI * 54;

export default function DiagnostikaDemo() {
  const [stage, setStage]           = useState(0);
  const [visible, setVisible]       = useState(true);
  const [ringVal, setRingVal]       = useState(0);
  const [pillarsVis, setPillarsVis] = useState(false);
  const [urlText, setUrlText]       = useState("");
  const [postText, setPostText]     = useState("");
  const [scanPct, setScanPct]       = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ivRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const iv2Ref   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setStage((s) => (s + 1) % STAGES);
        setVisible(true);
      }, 350);
    }, STAGE_DURATION[stage]);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [stage]);

  useEffect(() => {
    setRingVal(0); setPillarsVis(false); setUrlText(""); setPostText(""); setScanPct(0);
    if (ivRef.current)  clearInterval(ivRef.current);
    if (iv2Ref.current) clearInterval(iv2Ref.current);
    if (stage === 0) {
      const url = "studiolucifera.cz"; let i = 0;
      ivRef.current = setInterval(() => {
        if (i >= url.length) { clearInterval(ivRef.current!); return; }
        setUrlText(url.slice(0, ++i));
      }, 65);
    }
    if (stage === 1) {
      let p = 0;
      ivRef.current = setInterval(() => {
        p = Math.min(p + 1, 100);
        setScanPct(p);
        if (p >= 100) clearInterval(ivRef.current!);
      }, 28);
    }
    if (stage === 2) {
      let v = 0;
      ivRef.current = setInterval(() => {
        v = Math.min(v + 1.4, TOTAL);
        setRingVal(Math.round(v));
        if (v >= TOTAL) clearInterval(ivRef.current!);
      }, 22);
    }
    if (stage === 3) { setTimeout(() => setPillarsVis(true), 80); }
    if (stage === 5) {
      let i = 0;
      ivRef.current = setInterval(() => {
        if (i >= POST_TEXT.length) { clearInterval(ivRef.current!); return; }
        setPostText(POST_TEXT.slice(0, (i += 2)));
      }, 28);
    }
    return () => {
      if (ivRef.current)  clearInterval(ivRef.current);
      if (iv2Ref.current) clearInterval(iv2Ref.current);
    };
  }, [stage]);

  const scanTags = [
    { label: "Vizuální identita", threshold: 25 },
    { label: "Tón komunikace",    threshold: 50 },
    { label: "Konzistence",       threshold: 70 },
    { label: "Brand DNA",         threshold: 88 },
  ];

  return (
    <section style={{
      background: "transparent",
      padding: "0",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes diagBlink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes diagPulse  { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes hexSpin    { to{transform:rotate(360deg)} }
      `}</style>
      <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8fb82e", textAlign: "center", margin: "0 0 10px" }}>
        Jak diagnostika funguje
      </p>
      <h3 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 800, color: "#111", textAlign: "center", margin: "0 0 40px", lineHeight: 1.2 }}>
        Za 2 minuty víte, kde vaše značka stojí.
      </h3>

      <div style={{
        maxWidth: 760, margin: "0 auto", minHeight: 360,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}>
        {stage === 0 && (
          <div>
            <StepLabel step={1} text="Zadejte URL webu" />
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e3e2dc", borderRadius: 12, padding: "11px 15px", background: "#fff", margin: "14px 0 18px" }}>
              <GlobeIcon />
              <span style={{ fontSize: 14, color: "#555", flex: 1, fontFamily: "monospace" }}>
                {urlText}
                <span style={{ display: "inline-block", width: 2, height: 16, background: "#111", marginLeft: 1, verticalAlign: "middle", animation: "diagBlink 1s step-end infinite" }} />
              </span>
            </div>
            <Chips items={["Web", "Instagram", "LinkedIn", "Tón komunikace"]} dark />
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.65, marginTop: 14 }}>
              Analyzujeme vizuální komunikaci, styl obsahu a celkový dojem vaší značky.
            </p>
          </div>
        )}

        {stage === 1 && (
          <div>
            <StepLabel step={2} text="Analyzuji web..." />
            <div style={{ border: "1px solid #e6e5df", borderRadius: 14, overflow: "hidden", background: "#fff", margin: "14px 0 14px", position: "relative" }}>
              <div style={{ background: "#f7f6f1", borderBottom: "1px solid #e6e5df", padding: "7px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#f87171", "#fbbf24", LIME].map((c) => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
                </div>
                <div style={{ flex: 1, background: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#aaa", border: "1px solid #e6e5df" }}>
                  studiolucifera.cz
                </div>
              </div>
              <div style={{ height: 200, position: "relative", overflow: "hidden", background: "#000" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/placeholders/diagnostika-scan.jpg"
                  alt="web scan"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", pointerEvents: "none" }}
                />
                {/* scan line overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(183,233,76,.04), transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", left: 0, right: 0, height: 3, background: "linear-gradient(to bottom,transparent,rgba(183,233,76,.85),transparent)", top: `${scanPct}%`, transition: "top .12s linear", pointerEvents: "none" }} />
                {/* progress bar */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(0,0,0,0.4)" }}>
                  <div style={{ height: 3, background: LIME, width: `${scanPct}%`, transition: "width .12s linear" }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {scanTags.map((t) => (
                <span key={t.label} style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 11px", borderRadius: 20,
                  background: scanPct >= t.threshold ? "#111" : "#f0efea",
                  color: scanPct >= t.threshold ? LIME : "#bbb",
                  transition: "background .4s, color .4s",
                }}>
                  {scanPct >= t.threshold ? `✓ ${t.label}` : t.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {stage === 2 && (
          <div style={{ textAlign: "center" }}>
            <StepLabel step={3} text="Celkové skóre" />
            <div style={{ display: "flex", justifyContent: "center", margin: "18px 0 8px" }}>
              <svg width="144" height="144" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="54" fill="none" stroke="#e6e5df" strokeWidth="9" />
                <circle cx="72" cy="72" r="54" fill="none" stroke={LIME} strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${CIRC}`}
                  strokeDashoffset={CIRC * (1 - ringVal / 100)}
                  transform="rotate(-90 72 72)"
                  style={{ transition: "stroke-dashoffset 0.06s linear" }}
                />
                <text x="72" y="68" textAnchor="middle" fontSize="28" fontWeight="700" fill="#111" fontFamily="inherit">{ringVal}</text>
                <text x="72" y="88" textAnchor="middle" fontSize="12" fill="#aaa" fontFamily="inherit">ze 100</text>
              </svg>
            </div>
            <p style={{ fontSize: 14, color: "#666", maxWidth: 340, margin: "0 auto", lineHeight: 1.65 }}>
              Průměr přes 6 klíčových pilířů vaší vizuální značky.
            </p>
          </div>
        )}

        {stage === 3 && (
          <div>
            <StepLabel step={4} text="Výsledky podle pilířů" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginTop: 14 }}>
              {PILLARS.map((p, i) => (
                <div key={p.name} style={{
                  background: "#fff", border: "1px solid #e6e5df", borderRadius: 12, padding: "11px 12px",
                  opacity: pillarsVis ? 1 : 0,
                  transform: pillarsVis ? "translateY(0)" : "translateY(14px)",
                  transition: `opacity .4s ease ${i * 0.07}s, transform .4s ease ${i * 0.07}s`,
                }}>
                  <div style={{ fontSize: 10.5, color: "#aaa", marginBottom: 5, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>{p.score}</div>
                  <div style={{ height: 4, borderRadius: 2, background: "#f0efea", marginTop: 6 }}>
                    <div style={{ height: 4, borderRadius: 2, background: LIME, width: pillarsVis ? `${p.score}%` : "0%", transition: `width 1.1s ease ${i * 0.07 + 0.15}s` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === 4 && (
          <div>
            <StepLabel step={5} text="Váš vizuální archetyp" />
            <div style={{ background: "#111", borderRadius: 18, padding: "24px 22px", marginTop: 14, textAlign: "center" }}>
              <svg width="56" height="56" viewBox="0 0 60 60" style={{ margin: "0 auto 14px", display: "block" }}>
                <polygon points="30,3 57,17 57,43 30,57 3,43 3,17" fill="none" stroke={LIME} strokeWidth="1.5" />
                <polygon points="30,12 48,22 48,38 30,48 12,38 12,22" fill={LIME} opacity=".12" />
                <circle cx="30" cy="30" r="9" fill={LIME} opacity=".9" />
              </svg>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 7 }}>Vizionář</div>
              <div style={{ fontSize: 13, color: LIME, opacity: .85, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
                Vaše značka mluví s předstihem. Komunikace potřebuje více příběhu a emoce.
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 16, flexWrap: "wrap" }}>
                {["Strategický", "Originální", "Autoritativní"].map((t) => (
                  <span key={t} style={{ fontSize: 11, background: "rgba(183,233,76,.12)", color: LIME, padding: "4px 13px", borderRadius: 20, border: "1px solid rgba(183,233,76,.3)" }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 9, marginTop: 12 }}>
              {[{ label: "Nejsilnější pilíř", name: "Vizuální konzistence", val: "82", color: LIME },
                { label: "Příležitost", name: "Storytelling", val: "41", color: "#888" }].map((c) => (
                <div key={c.label} style={{ flex: 1, background: "#fff", border: "1px solid #e6e5df", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "#aaa", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{c.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: c.color, marginTop: 2 }}>{c.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === 5 && (
          <div>
            <StepLabel step={6} text="Tvorba příspěvku" />
            <div style={{ display: "flex", gap: 12, marginTop: 14, alignItems: "flex-start" }}>
              <div style={{ width: 160, flexShrink: 0, background: "#fff", border: "1px solid #e6e5df", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", borderBottom: "1px solid #f0efea" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: LIME, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#111" }}>L</div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#111", lineHeight: 1.2 }}>studiolucifera</div>
                    <div style={{ fontSize: 9, color: "#aaa" }}>Praha, Kampa</div>
                  </div>
                </div>
                <div style={{ height: 160, background: "#0d0d1a", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: "60px solid rgba(90,40,140,.35)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                  <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", border: "35px solid rgba(120,50,180,.2)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                  <div style={{ position: "absolute", top: 10, right: 10, opacity: .6, animation: "hexSpin 8s linear infinite" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke={LIME} strokeWidth="1.2" fill="none" />
                    </svg>
                  </div>
                  <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "rgba(183,233,76,.25)", top: "38%" }} />
                  <div style={{ position: "relative", textAlign: "center", padding: "0 12px" }}>
                    <div style={{ fontSize: 8, letterSpacing: ".18em", textTransform: "uppercase", color: LIME, marginBottom: 7 }}>Studio Lucifera</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.25, letterSpacing: "-.01em" }}>
                      Vaše tvář<br />je vaše<br /><span style={{ color: LIME }}>značka.</span>
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)", marginTop: 8 }}>#branding #fotografie</div>
                  </div>
                  <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <svg width="7" height="7" viewBox="0 0 12 12"><polygon points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1" /></svg>
                    <span style={{ fontSize: 7, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.35)" }}>lucifera.studio</span>
                  </div>
                </div>
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 5, opacity: .6 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12S1.5 8.5 1.5 4.5A2.5 2.5 0 0 1 7 3.8 2.5 2.5 0 0 1 12.5 4.5C12.5 8.5 7 12 7 12Z" stroke="currentColor" strokeWidth="1" fill="none" /></svg>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1" fill="none" strokeLinejoin="round" /></svg>
                  </div>
                  <div style={{ fontSize: 9, color: "#666", lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700, color: "#111" }}>studiolucifera </span>
                    {postText.slice(0, 55)}{postText.length > 55 ? "..." : ""}
                    {postText.length < POST_TEXT.length && <span style={{ display: "inline-block", width: 1.5, height: 10, background: "#111", verticalAlign: "middle", animation: "diagBlink 1s step-end infinite" }} />}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, background: "#fff", border: "1px solid #e6e5df", borderRadius: 12, padding: "14px 15px", minHeight: 175 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f0efea" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L7.5 4.5H11L8.25 6.75L9.5 11L6 8.5L2.5 11L3.75 6.75L1 4.5H4.5L6 1Z" fill={LIME} /></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#111", flex: 1 }}>AI stratég píše příspěvek</span>
                  <span style={{ fontSize: 10, color: LIME, fontWeight: 600, animation: "diagPulse 1.5s ease-in-out infinite" }}>● aktivní</span>
                </div>
                <pre style={{ fontSize: 12, color: "#555", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>
                  {postText}
                  {postText.length < POST_TEXT.length && <span style={{ display: "inline-block", width: 2, height: 14, background: "#111", verticalAlign: "middle", animation: "diagBlink 1s step-end infinite" }} />}
                </pre>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, background: "#111", color: LIME, padding: "3px 11px", borderRadius: 20 }}>Brand DNA</span>
                  <span style={{ fontSize: 11, fontWeight: 600, background: "#111", color: LIME, padding: "3px 11px", borderRadius: 20 }}>Vizionář</span>
                  <span style={{ fontSize: 11, fontWeight: 600, background: "#f0efea", color: "#aaa", padding: "3px 11px", borderRadius: 20 }}>Instagram</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 32 }}>
        {Array.from({ length: STAGES }).map((_, i) => (
          <div key={i} style={{ height: 7, borderRadius: 4, width: i === stage ? 22 : 7, background: i === stage ? LIME : "rgba(255,255,255,0.15)", transition: "width .3s, background .3s" }} />
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <a href="/diagnostika" style={{ display: "inline-block", background: LIME, color: "#111", fontWeight: 800, fontSize: 15, padding: "14px 36px", borderRadius: 12, textDecoration: "none", letterSpacing: "-0.01em" }}>
          Spustit vlastní diagnostiku →
        </a>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>Zdarma · Bez registrace · Výsledky za 2 minuty</p>
      </div>
    </section>
  );
}

function StepLabel({ step, text }: { step: number; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#b7e94c", color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{step}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{text}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{step} / {STAGES}</span>
    </div>
  );
}

function Chips({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
      {items.map((t) => (
        <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: "3px 11px", borderRadius: 20, background: dark ? "#111" : "#f0efea", color: dark ? "#b7e94c" : "#aaa" }}>{t}</span>
      ))}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: .4 }}>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 1C6 3.5 5 5.5 5 8s1 4.5 3 7M8 1c2 2.5 3 4.5 3 7s-1 4.5-3 7M1 8h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
