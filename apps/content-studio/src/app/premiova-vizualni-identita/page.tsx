"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "../components/Header";

// ─────────────────────────────────────────────
// VIZUÁLNÍ BOARD DEMO — contact-sheet overlay
// ─────────────────────────────────────────────
const CONTACT_SHOTS = [
  { id: 1, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/01.jpg", label: "Portrét · Tmavé sako", outfit: "Outfit A · Tmavě zelená", score: 87, main: true },
  { id: 2, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/02.jpg", label: "Detail · ruce + notes", outfit: "Outfit A", main: false },
  { id: 3, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/03.jpg", label: "Faceless záběr", quote: "Vaše vize.", main: false },
  { id: 4, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/04.jpg", label: "Exteriér · Kampa", outfit: "Outfit B · Krémová", score: 92, main: true },
  { id: 5, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/05.jpg", label: "Portrét blízko", main: false },
  { id: 6, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/06.jpg", label: "Pohybový záběr", main: false },
  { id: 7, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/07.jpg", label: "Pracovní detail", outfit: "Outfit C · Antracit", main: false },
];

const PALETTE = [
  { name: "Hluboká zelená", hex: "#1C2E25", role: "Hlavní" },
  { name: "Krémová", hex: "#E8DFC8", role: "Světlý akcent" },
  { name: "Zlatavá", hex: "#C9A84C", role: "Detail" },
  { name: "Antracit", hex: "#2A2A2A", role: "Neutrál" },
  { name: "Plátno", hex: "#F5F3EE", role: "Pozadí" },
];

function VizualniDashboard({ onClose }: { onClose: () => void }) {
  const [activeShot, setActiveShot] = useState(0);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setAnimIn(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const shot = CONTACT_SHOTS[activeShot];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(8,8,8,0.92)", backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      opacity: animIn ? 1 : 0, transition: "opacity 0.35s ease",
    }}>
      <style>{`
        .vbd-window {
          background: #0e0e0e;
          border-radius: 20px;
          width: 100%;
          max-width: 1120px;
          max-height: calc(100vh - 48px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06);
          transform: ${animIn ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)"};
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .vbd-titlebar {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .vbd-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .vbd-title { font-size: 12px; color: rgba(255,255,255,0.22); margin-left: 10px; letter-spacing: 0.05em; }
        .vbd-body { display: flex; flex: 1; overflow: hidden; min-height: 0; }
        .vbd-sidebar {
          width: 240px; flex-shrink: 0; border-right: 1px solid rgba(255,255,255,0.06);
          overflow-y: auto; padding: 16px 12px; display: flex; flex-direction: column; gap: 6px;
        }
        .vbd-sidebar::-webkit-scrollbar { width: 4px; }
        .vbd-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .vbd-thumb {
          border-radius: 10px; overflow: hidden; cursor: pointer;
          position: relative; aspect-ratio: 4/3;
          border: 2px solid transparent; transition: border-color 0.15s, transform 0.15s;
          background: #1a1a1a;
        }
        .vbd-thumb:hover { transform: scale(1.02); }
        .vbd-thumb.active { border-color: rgba(180,232,66,0.7); }
        .vbd-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .vbd-thumb-label {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          padding: 12px 8px 6px;
          font-size: 9px; color: rgba(255,255,255,0.6); letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .vbd-thumb-num {
          position: absolute; top: 6px; left: 8px;
          font-size: 9px; color: rgba(255,255,255,0.3); font-weight: 700;
        }
        .vbd-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .vbd-preview { flex: 1; position: relative; overflow: hidden; background: #111; min-height: 0; }
        .vbd-preview img {
          width: 100%; height: 100%; object-fit: cover; object-position: center top;
          display: block;
          transition: opacity 0.3s ease;
        }
        .vbd-preview-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 40%, transparent 70%);
          pointer-events: none;
        }
        .vbd-preview-info {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 24px 28px;
          display: flex; align-items: flex-end; justify-content: space-between;
        }
        .vbd-shot-label {
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(255,255,255,0.6); margin-bottom: 4px;
        }
        .vbd-shot-quote {
          font-family: var(--font-playfair),serif;
          font-size: 22px; font-style: italic; color: rgba(255,255,255,0.85);
        }
        .vbd-outfit-pill {
          background: rgba(0,0,0,0.65); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 6px 14px; border-radius: 20px;
          font-size: 11px; color: rgba(255,255,255,0.75); white-space: nowrap;
        }
        .vbd-score-badge {
          background: #0e0e0e; border: 1px solid rgba(180,232,66,0.3);
          border-radius: 12px; padding: 12px 16px; text-align: center;
          position: absolute; top: 20px; right: 20px;
        }
        .vbd-score-num {
          font-family: var(--font-playfair),serif;
          font-size: 32px; font-weight: 700; color: #a8eb12; line-height: 1;
        }
        .vbd-score-lbl {
          font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,255,255,0.25); margin-top: 4px;
        }
        .vbd-bottom {
          flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.06);
          padding: 16px 20px; display: flex; gap: 12px; align-items: center;
        }
        .vbd-palette-swatch {
          width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.07); flex-shrink: 0;
          cursor: default; position: relative;
          transition: transform 0.15s;
        }
        .vbd-palette-swatch:hover { transform: scale(1.15); }
        .vbd-palette-swatch:hover .vbd-swatch-tip {
          opacity: 1; transform: translateY(-4px);
        }
        .vbd-swatch-tip {
          position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%) translateY(0);
          background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; padding: 4px 8px; white-space: nowrap;
          font-size: 9px; color: rgba(255,255,255,0.6); letter-spacing: 0.05em;
          opacity: 0; transition: opacity 0.15s, transform 0.15s;
          pointer-events: none;
        }
        .vbd-bottomlabel {
          font-size: 10px; color: rgba(255,255,255,0.2);
          letter-spacing: 0.12em; text-transform: uppercase; margin-right: 4px;
        }
        .vbd-stats {
          margin-left: auto; display: flex; gap: 20px; align-items: center;
        }
        .vbd-stat { text-align: center; }
        .vbd-stat-num {
          font-family: var(--font-playfair),serif;
          font-size: 20px; font-weight: 700; color: #a8eb12; line-height: 1;
        }
        .vbd-stat-lbl { font-size: 9px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px; }
        .vbd-nav-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.12); color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 14px; transition: background 0.15s;
          z-index: 2;
        }
        .vbd-nav-btn:hover { background: rgba(0,0,0,0.75); }
        .vbd-nav-prev { left: 14px; }
        .vbd-nav-next { right: 14px; }
        .vbd-close {
          position: absolute; top: 14px; right: 14px; z-index: 10;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); cursor: pointer; display: flex;
          align-items: center; justify-content: center; font-size: 16px;
          transition: background 0.15s, color 0.15s;
        }
        .vbd-close:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .vbd-header-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
        .vbd-badge-live {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; color: rgba(180,232,66,0.7); letter-spacing: 0.1em;
        }
        .vbd-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #a8eb12;
          animation: vbdPulse 1.8s ease infinite;
        }
        @keyframes vbdPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .vbd-side-section { margin-top: 8px; }
        .vbd-side-lbl {
          font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.2); padding: 0 4px; margin-bottom: 6px;
        }
      `}</style>

      {/* Backdrop click to close */}
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div className="vbd-window" style={{ position: "relative" }}>
        {/* Titlebar */}
        <div className="vbd-titlebar">
          <div className="vbd-dot" style={{ background: "#ff5f57" }} onClick={onClose} title="Zavřít" role="button" tabIndex={0} />
          <div className="vbd-dot" style={{ background: "#ffbd2e" }} />
          <div className="vbd-dot" style={{ background: "#28c940" }} />
          <div className="vbd-title">Vizuální board · Jana Procházková · Před focením · Lucifera Studio</div>
          <div className="vbd-header-right">
            <div className="vbd-badge-live"><span className="vbd-live-dot" />Ukázka výstupu</div>
            <button className="vbd-close" onClick={onClose} aria-label="Zavřít">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="vbd-body">
          {/* Sidebar — contact sheet thumbnails */}
          <div className="vbd-sidebar">
            <div className="vbd-side-lbl">Kontaktní sheet</div>
            {CONTACT_SHOTS.map((s, i) => (
              <div
                key={s.id}
                className={`vbd-thumb${activeShot === i ? " active" : ""}`}
                onClick={() => setActiveShot(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={s.label} />
                <div className="vbd-thumb-num">#{String(s.id).padStart(2, "0")}</div>
                <div className="vbd-thumb-label">{s.label}</div>
              </div>
            ))}
            <div className="vbd-side-section">
              <div className="vbd-side-lbl" style={{ marginTop: 12 }}>Barevná paleta</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 4px" }}>
                {PALETTE.map((c) => (
                  <div key={c.hex} className="vbd-palette-swatch" style={{ background: c.hex, width: 28, height: 28 }}>
                    <div className="vbd-swatch-tip">{c.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main preview */}
          <div className="vbd-main">
            <div className="vbd-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={shot.src} src={shot.src} alt={shot.label} />
              <div className="vbd-preview-overlay" />

              {/* Nav arrows */}
              <button
                className="vbd-nav-btn vbd-nav-prev"
                onClick={() => setActiveShot((i) => (i - 1 + CONTACT_SHOTS.length) % CONTACT_SHOTS.length)}
                aria-label="Předchozí"
              >‹</button>
              <button
                className="vbd-nav-btn vbd-nav-next"
                onClick={() => setActiveShot((i) => (i + 1) % CONTACT_SHOTS.length)}
                aria-label="Další"
              >›</button>

              {/* Score badge */}
              {shot.score && (
                <div className="vbd-score-badge">
                  <div className="vbd-score-num">{shot.score}</div>
                  <div className="vbd-score-lbl">Brand skóre</div>
                </div>
              )}

              {/* Bottom info */}
              <div className="vbd-preview-info">
                <div>
                  <div className="vbd-shot-label">#{String(shot.id).padStart(2, "0")} · {shot.label}</div>
                  {shot.quote && <div className="vbd-shot-quote">&ldquo;{shot.quote}&rdquo;</div>}
                </div>
                {shot.outfit && <div className="vbd-outfit-pill">{shot.outfit}</div>}
              </div>
            </div>

            {/* Bottom bar — palette + stats */}
            <div className="vbd-bottom">
              <span className="vbd-bottomlabel">Paleta</span>
              {PALETTE.map((c) => (
                <div key={c.hex} className="vbd-palette-swatch" style={{ background: c.hex }}>
                  <div className="vbd-swatch-tip">{c.name} · {c.role}</div>
                </div>
              ))}
              <div className="vbd-stats">
                <div className="vbd-stat"><div className="vbd-stat-num">7</div><div className="vbd-stat-lbl">záběrů</div></div>
                <div className="vbd-stat"><div className="vbd-stat-num">3</div><div className="vbd-stat-lbl">outfity</div></div>
                <div className="vbd-stat"><div className="vbd-stat-num" style={{ fontSize: 14 }}>Ke schválení</div><div className="vbd-stat-lbl">status</div></div>
                <div style={{
                  background: "rgba(180,232,66,0.1)", border: "1px solid rgba(180,232,66,0.25)",
                  borderRadius: 8, padding: "8px 16px",
                  fontSize: 12, fontWeight: 600, color: "#a8eb12", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                  onClick={onClose}
                >
                  Chci taky takový board →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CAROUSEL_PHOTOS = [
  "/placeholders/UKAZKY BRANDU/01.JPG",
  "/placeholders/UKAZKY BRANDU/02.JPG",
  "/placeholders/UKAZKY BRANDU/04.JPG",
  "/placeholders/UKAZKY BRANDU/05.JPG",
  "/placeholders/UKAZKY BRANDU/06.JPG",
  "/placeholders/UKAZKY BRANDU/07.JPG",
  "/placeholders/UKAZKY BRANDU/08.JPG",
  "/placeholders/UKAZKY BRANDU/09.JPG",
];

export default function PremiovaVizualniIdentita() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  const openDashboard = useCallback(() => setShowDashboard(true), []);
  const closeDashboard = useCallback(() => setShowDashboard(false), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((i) => (i + 1) % CAROUSEL_PHOTOS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("vis");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
    {showDashboard && <VizualniDashboard onClose={closeDashboard} />}
    <Header />
    <div className="pvi-page">
      <style>{`
        .pvi-page {
          --lime:#b4e842; --lime-dark:#8fb82e; --lime-bg:rgba(180,232,66,0.08); --lime-border:rgba(180,232,66,0.25);
          --black:#0e0e0e; --dark:#1a1a1a; --cream:#f5f4ef; --sand:#ece9e1; --white:#fff;
          --gray:#888; --gray-light:#e0ddd5; --warm:#c9a96e;
          --r:16px;
          font-family:var(--font-dm-sans),sans-serif;
          background:var(--cream);
          color:var(--black);
          overflow-x:hidden;
        }
        html { scroll-behavior:smooth; }

        /* ── HERO ── */
        .pvi-page .hero{
          position:relative;min-height:100vh;
          display:flex;align-items:center;overflow:hidden;
        }
        .pvi-page .hero-container{
          width:100%;max-width:1360px;margin:0 auto;
          padding:80px 40px;position:relative;z-index:2;
        }
        .pvi-page .hero-left{
          display:flex;flex-direction:column;max-width:540px;
        }
        .pvi-page .hero-right{
          position:absolute;right:0;top:0;bottom:0;width:50%;
          background:var(--black);overflow:hidden;
        }
        .pvi-page .hero-badge{
          display:inline-flex;align-items:center;gap:6px;
          font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
          color:var(--lime-dark);margin-bottom:24px;
        }
        .pvi-page .hero-badge::before{content:'';width:24px;height:1px;background:var(--lime-dark);}
        .pvi-page h1{
          font-family:var(--font-playfair),serif;
          font-size:clamp(40px,4.8vw,66px);font-weight:700;line-height:1.05;
          letter-spacing:-0.03em;
          margin-bottom:24px;
        }
        .pvi-page h1 em{font-style:italic;font-weight:400;color:var(--lime-dark);}
        .pvi-page .hero-sub{font-size:16px;color:#555;line-height:1.7;max-width:440px;margin-bottom:36px;}
        .pvi-page .hero-actions{display:flex;flex-direction:column;gap:10px;}
        .pvi-page .btn-primary{
          display:inline-flex;align-items:center;gap:10px;
          background:var(--black);color:#fff;
          padding:16px 32px;border-radius:10px;
          font-size:15px;font-weight:600;border:none;cursor:pointer;
          width:fit-content;transition:all 0.2s;
        }
        .pvi-page .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,0.2);}
        .pvi-page .btn-secondary{
          display:inline-flex;align-items:center;gap:8px;
          color:var(--gray);font-size:13px;cursor:pointer;
          border:none;background:none;padding:0;
          transition:color 0.2s;width:fit-content;
        }
        .pvi-page .btn-secondary:hover{color:var(--black);}
        .pvi-page .hero-note{font-size:12px;color:#bbb;margin-top:6px;}

        /* HERO RIGHT — CROSSFADE CAROUSEL */
        .pvi-page .carousel-img{
          position:absolute;inset:0;width:100%;height:100%;
          object-fit:cover;object-position:center top;
          opacity:0;transition:opacity 1.4s ease;
          pointer-events:none;
        }
        .pvi-page .carousel-img.active{opacity:1;}
        .pvi-page .carousel-overlay{
          position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(to right,rgba(0,0,0,0.18) 0%,transparent 40%),
                      linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 50%);
        }

        /* FLOATING CARDS */
        .pvi-page .float-card{
          position:absolute;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);
          border-radius:12px;padding:14px 18px;box-shadow:0 8px 32px rgba(0,0,0,0.25);
        }
        .pvi-page .fc-1{bottom:80px;left:32px;animation:float1 4s ease-in-out infinite;}
        .pvi-page .fc-2{top:100px;right:32px;animation:float2 5s ease-in-out infinite;}
        .pvi-page .fc-3{bottom:160px;right:28px;animation:float3 4.5s ease-in-out infinite;}
        @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
        @keyframes float3{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .pvi-page .fc-dot{width:7px;height:7px;border-radius:50%;background:var(--lime);display:inline-block;margin-right:6px;animation:pulse 1.8s ease infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .pvi-page .fc-title{font-size:11px;font-weight:700;color:var(--black);margin-bottom:2px;}
        .pvi-page .fc-sub{font-size:10px;color:var(--gray);}
        .pvi-page .fc-num{font-family:var(--font-playfair),serif;font-size:28px;font-weight:700;color:var(--lime-dark);line-height:1;}

        /* ── SECTION BASE ── */
        .pvi-page section{padding:96px 80px;}
        .pvi-page .label{font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--lime-dark);margin-bottom:10px;}
        .pvi-page h2{font-family:var(--font-playfair),serif;font-size:clamp(32px,3.5vw,48px);font-weight:700;line-height:1.15;margin-bottom:16px;}
        .pvi-page h2 em{font-style:italic;font-weight:300;}
        .pvi-page .section-sub{font-size:15px;color:var(--gray);line-height:1.7;max-width:580px;}

        /* ── PROBLEM ── */
        .pvi-page .problem{background:var(--black);padding:96px 80px;}
        .pvi-page .problem-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;max-width:1200px;margin:0 auto;}
        .pvi-page .problem-left h2{color:#fff;}
        .pvi-page .problem-left h2 em{color:var(--lime);}
        .pvi-page .problem-quote{
          font-family:var(--font-playfair),serif;font-size:28px;font-style:italic;
          color:rgba(255,255,255,0.4);line-height:1.4;
          border-left:2px solid var(--lime-border);padding-left:24px;margin-top:32px;
        }
        .pvi-page .problem-list{list-style:none;display:flex;flex-direction:column;gap:16px;}
        .pvi-page .problem-list li{
          display:flex;gap:14px;align-items:flex-start;
          font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;
        }
        .pvi-page .pl-icon{
          width:32px;height:32px;border-radius:8px;flex-shrink:0;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
          display:flex;align-items:center;justify-content:center;font-size:14px;
        }

        /* ── WOW ── */
        .pvi-page .wow{background:var(--cream);padding:96px 80px;max-width:none;}
        .pvi-page .wow-inner{max-width:1200px;margin:0 auto;}
        .pvi-page .wow-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;margin-top:56px;}

        /* BOARD MOCKUP */
        .pvi-page .board-mockup{
          background:var(--black);border-radius:20px;padding:24px;
          box-shadow:0 32px 80px rgba(0,0,0,0.2);position:relative;overflow:hidden;
        }
        .pvi-page .bm-header{display:flex;align-items:center;gap:6px;margin-bottom:18px;}
        .pvi-page .bm-dot{width:9px;height:9px;border-radius:50%;}
        .pvi-page .bm-title{font-size:11px;color:rgba(255,255,255,0.25);margin-left:8px;letter-spacing:0.06em;}
        .pvi-page .bm-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .pvi-page .bm-cell{border-radius:12px;overflow:hidden;position:relative;}
        .pvi-page .bm-cell-main{grid-column:span 2;height:200px;}
        .pvi-page .bm-cell-sub{height:120px;}
        .pvi-page .bc-1{background:radial-gradient(ellipse at 35% 40%,#c9a96e 0%,#1a1208 70%);display:flex;align-items:flex-end;padding:12px;}
        .pvi-page .bc-2{background:linear-gradient(135deg,#e8d5b0 0%,#c9a96e 100%);}
        .pvi-page .bc-3{background:#1a2820;display:flex;align-items:center;justify-content:center;}
        .pvi-page .bc-label{font-size:10px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:0.08em;text-transform:uppercase;}
        .pvi-page .bm-outfit-tag{
          position:absolute;top:10px;right:10px;
          background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);
          padding:4px 10px;border-radius:6px;font-size:10px;color:rgba(255,255,255,0.7);
        }
        .pvi-page .bm-score{
          position:absolute;bottom:16px;right:16px;
          background:var(--black);border:1px solid var(--lime-border);
          border-radius:10px;padding:10px 14px;text-align:center;
        }
        .pvi-page .bm-score-num{font-family:var(--font-playfair),serif;font-size:26px;font-weight:700;color:var(--lime);}
        .pvi-page .bm-score-label{font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.08em;}

        /* WOW TEXT */
        .pvi-page .wow-text .label{margin-bottom:8px;}
        .pvi-page .wow-text h2{margin-bottom:16px;}
        .pvi-page .wow-text .section-sub{margin-bottom:32px;}
        .pvi-page .wow-steps{display:flex;flex-direction:column;gap:14px;margin-bottom:32px;}
        .pvi-page .ws{display:flex;gap:14px;align-items:flex-start;}
        .pvi-page .ws-num{
          width:28px;height:28px;border-radius:7px;flex-shrink:0;
          background:var(--lime-bg);border:1px solid var(--lime-border);
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;color:var(--lime-dark);
        }
        .pvi-page .ws-text{font-size:14px;color:#555;line-height:1.6;padding-top:4px;}
        .pvi-page .ws-text strong{color:var(--black);font-weight:600;}

        /* ── PROCESS ── */
        .pvi-page .process{background:var(--sand);padding:96px 80px;}
        .pvi-page .process-inner{max-width:1200px;margin:0 auto;}
        .pvi-page .process-phases{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:56px;}
        .pvi-page .phase-card{border-radius:20px;overflow:hidden;}
        .pvi-page .ph-0{background:var(--white);border:1px solid var(--gray-light);padding:36px;}
        .pvi-page .ph-1{background:var(--black);padding:36px;}
        .pvi-page .ph-2{background:#111827;padding:36px;border:1px solid rgba(180,232,66,0.08);}
        .pvi-page .ph-badge{
          display:inline-flex;align-items:center;gap:6px;
          padding:4px 12px;border-radius:10px;font-size:10px;font-weight:700;
          letter-spacing:0.1em;text-transform:uppercase;margin-bottom:20px;
        }
        .pvi-page .pb-light{background:var(--sand);color:#888;}
        .pvi-page .pb-dark{background:var(--lime-bg);color:var(--lime);}
        .pvi-page .pb-violet{background:rgba(167,139,250,0.1);color:#a78bfa;}
        .pvi-page .ph-when{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;}
        .pvi-page .ph-0 .ph-when{color:#bbb;}
        .pvi-page .ph-1 .ph-when,.pvi-page .ph-2 .ph-when{color:rgba(255,255,255,0.25);}
        .pvi-page .ph-title{font-family:var(--font-playfair),serif;font-size:24px;font-weight:700;line-height:1.2;margin-bottom:6px;}
        .pvi-page .ph-0 .ph-title{color:var(--black);}
        .pvi-page .ph-1 .ph-title,.pvi-page .ph-2 .ph-title{color:#fff;}
        .pvi-page .ph-price{font-size:13px;font-weight:600;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid;}
        .pvi-page .ph-0 .ph-price{color:var(--black);border-color:var(--gray-light);}
        .pvi-page .ph-1 .ph-price{color:var(--lime);border-color:rgba(255,255,255,0.08);}
        .pvi-page .ph-2 .ph-price{color:#a78bfa;border-color:rgba(255,255,255,0.06);}
        .pvi-page .ph-items{list-style:none;display:flex;flex-direction:column;gap:10px;}
        .pvi-page .ph-items li{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.55;}
        .pvi-page .ph-0 .ph-items li{color:#555;}
        .pvi-page .ph-1 .ph-items li,.pvi-page .ph-2 .ph-items li{color:rgba(255,255,255,0.45);}
        .pvi-page .ph-0 .ph-items li::before{content:'·';color:var(--lime-dark);font-size:16px;line-height:1;flex-shrink:0;}
        .pvi-page .ph-1 .ph-items li::before,.pvi-page .ph-2 .ph-items li::before{content:'·';color:var(--lime);font-size:16px;line-height:1;flex-shrink:0;}
        .pvi-page .ph-items li strong{font-weight:600;}
        .pvi-page .ph-0 .ph-items li strong{color:var(--black);}
        .pvi-page .ph-1 .ph-items li strong,.pvi-page .ph-2 .ph-items li strong{color:#fff;}

        /* ── DELIVERABLES ── */
        .pvi-page .deliverables{padding:96px 80px;background:var(--cream);}
        .pvi-page .del-inner{max-width:1200px;margin:0 auto;}
        .pvi-page .del-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px;}
        .pvi-page .del-card{
          background:var(--white);border:1px solid var(--gray-light);
          border-radius:16px;padding:24px;
          transition:transform 0.25s,box-shadow 0.25s;
        }
        .pvi-page .del-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.08);}
        .pvi-page .del-icon{font-size:28px;margin-bottom:14px;}
        .pvi-page .del-num{font-family:var(--font-playfair),serif;font-size:36px;font-weight:700;color:var(--lime-dark);line-height:1;margin-bottom:4px;}
        .pvi-page .del-unit{font-size:11px;color:var(--gray);margin-bottom:10px;}
        .pvi-page .del-title{font-size:14px;font-weight:600;margin-bottom:6px;}
        .pvi-page .del-desc{font-size:12px;color:var(--gray);line-height:1.6;}
        .pvi-page .extras{
          margin-top:32px;padding:24px;background:var(--sand);
          border-radius:14px;border:1px solid var(--gray-light);
        }
        .pvi-page .extras-label{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray);margin-bottom:12px;}
        .pvi-page .extras-row{display:flex;gap:10px;flex-wrap:wrap;}
        .pvi-page .extra-tag{
          padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;
          background:var(--white);color:#555;border:1px solid var(--gray-light);
        }
        .pvi-page .extra-tag span{color:var(--lime-dark);font-weight:600;}

        /* ── PRICING ── */
        .pvi-page .pricing{background:var(--black);padding:96px 80px;}
        .pvi-page .pricing-inner{max-width:900px;margin:0 auto;text-align:center;}
        .pvi-page .pricing-inner h2{color:#fff;}
        .pvi-page .pricing-inner h2 em{color:var(--lime);}
        .pvi-page .pricing-inner .section-sub{color:rgba(255,255,255,0.35);margin:0 auto 56px;}
        .pvi-page .price-cards{display:grid;grid-template-columns:1fr 1fr;gap:20px;text-align:left;margin-bottom:32px;}
        .pvi-page .price-card{border-radius:18px;padding:32px;}
        .pvi-page .pc-entry{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);}
        .pvi-page .pc-full{background:var(--lime-bg);border:1px solid var(--lime-border);}
        .pvi-page .pc-badge{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;}
        .pvi-page .pc-entry .pc-badge{color:rgba(255,255,255,0.3);}
        .pvi-page .pc-full .pc-badge{color:var(--lime);}
        .pvi-page .pc-price{font-family:var(--font-playfair),serif;font-size:48px;font-weight:700;line-height:1;margin-bottom:6px;}
        .pvi-page .pc-entry .pc-price{color:#fff;}
        .pvi-page .pc-full .pc-price{color:var(--lime);}
        .pvi-page .pc-period{font-size:13px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid;}
        .pvi-page .pc-entry .pc-period{color:rgba(255,255,255,0.3);border-color:rgba(255,255,255,0.08);}
        .pvi-page .pc-full .pc-period{color:rgba(180,232,66,0.5);border-color:var(--lime-border);}
        .pvi-page .pc-items{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:24px;}
        .pvi-page .pc-items li{font-size:13px;display:flex;align-items:center;gap:8px;}
        .pvi-page .pc-entry .pc-items li{color:rgba(255,255,255,0.45);}
        .pvi-page .pc-full .pc-items li{color:rgba(255,255,255,0.7);}
        .pvi-page .pc-items li::before{content:'✓';font-size:11px;font-weight:700;flex-shrink:0;}
        .pvi-page .pc-entry .pc-items li::before{color:rgba(255,255,255,0.2);}
        .pvi-page .pc-full .pc-items li::before{color:var(--lime);}
        .pvi-page .pc-btn{
          width:100%;padding:13px;border-radius:10px;font-size:13px;font-weight:600;
          cursor:pointer;border:none;transition:all 0.2s;
        }
        .pvi-page .pc-entry .pc-btn{background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.1);}
        .pvi-page .pc-entry .pc-btn:hover{background:rgba(255,255,255,0.1);}
        .pvi-page .pc-full .pc-btn{background:var(--lime);color:var(--black);}
        .pvi-page .pc-full .pc-btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(180,232,66,0.25);}
        .pvi-page .pricing-note{font-size:12px;color:rgba(255,255,255,0.2);text-align:center;}

        /* ── SCAN CTA ── */
        .pvi-page .scan-cta{background:var(--cream);padding:96px 80px;text-align:center;}
        .pvi-page .scan-inner{max-width:700px;margin:0 auto;}
        .pvi-page .scan-inner h2{margin-bottom:12px;}
        .pvi-page .scan-inner .section-sub{margin:0 auto 40px;}
        .pvi-page .scan-input-wrap{
          display:flex;gap:10px;background:var(--white);
          border:1px solid var(--gray-light);border-radius:14px;
          padding:8px 8px 8px 20px;
          box-shadow:0 4px 24px rgba(0,0,0,0.06);
          max-width:540px;margin:0 auto;
        }
        .pvi-page .scan-input{
          flex:1;border:none;background:none;font-size:14px;
          font-family:var(--font-dm-sans),sans-serif;outline:none;color:var(--black);
        }
        .pvi-page .scan-input::placeholder{color:#bbb;}
        .pvi-page .scan-btn{
          background:var(--black);color:#fff;padding:12px 24px;
          border-radius:9px;font-size:14px;font-weight:600;border:none;cursor:pointer;
          white-space:nowrap;transition:all 0.2s;
        }
        .pvi-page .scan-btn:hover{background:var(--dark);}
        .pvi-page .scan-note{font-size:12px;color:#bbb;margin-top:12px;}

        /* ── TEAM ── */
        .pvi-page .team{background:var(--black);padding:96px 80px;}
        .pvi-page .team-inner{max-width:1200px;margin:0 auto;}
        .pvi-page .team-inner h2{color:#fff;text-align:center;margin-bottom:8px;}
        .pvi-page .team-inner .section-sub{color:rgba(255,255,255,0.3);text-align:center;margin:0 auto 56px;}
        .pvi-page .team-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;}
        .pvi-page .team-card{
          background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
          border-radius:18px;padding:32px;text-align:center;
        }
        .pvi-page .team-avatar{
          width:80px;height:80px;border-radius:50%;margin:0 auto 16px;
          display:flex;align-items:center;justify-content:center;font-size:32px;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
        }
        .pvi-page .team-name{font-family:var(--font-playfair),serif;font-size:22px;font-weight:600;color:#fff;margin-bottom:4px;}
        .pvi-page .team-role{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--lime);margin-bottom:12px;}
        .pvi-page .team-desc{font-size:13px;color:rgba(255,255,255,0.35);line-height:1.65;}

        /* ── FOOTER CTA ── */
        .pvi-page .footer-cta{
          background:var(--cream);padding:120px 80px;text-align:center;
          position:relative;overflow:hidden;
        }
        .pvi-page .footer-cta::before{
          content:'';position:absolute;width:600px;height:600px;border-radius:50%;
          background:radial-gradient(circle,rgba(180,232,66,0.06),transparent 70%);
          top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;
        }
        .pvi-page .footer-cta h2{font-size:clamp(40px,5vw,72px);margin-bottom:16px;position:relative;}
        .pvi-page .footer-cta h2 em{color:var(--lime-dark);}
        .pvi-page .footer-cta .section-sub{margin:0 auto 48px;position:relative;}
        .pvi-page .footer-cta .btn-primary{margin:0 auto;font-size:16px;padding:18px 40px;}
        .pvi-page .footer-note{font-size:12px;color:#bbb;margin-top:16px;position:relative;}
        .pvi-page .footer-bottom{
          background:var(--black);padding:24px 80px;
          display:flex;align-items:center;justify-content:space-between;
        }
        .pvi-page .fb-logo{font-family:var(--font-playfair),serif;font-size:16px;font-weight:600;color:#fff;letter-spacing:0.06em;}
        .pvi-page .fb-logo span{color:var(--lime);}
        .pvi-page .fb-note{font-size:12px;color:rgba(255,255,255,0.2);}

        /* ── SCROLL REVEAL ── */
        .pvi-page .reveal{opacity:0;transform:translateY(28px);transition:opacity 0.7s ease,transform 0.7s ease;}
        .pvi-page .reveal.vis{opacity:1;transform:translateY(0);}
        .pvi-page .reveal-d1{transition-delay:0.1s;}
        .pvi-page .reveal-d2{transition-delay:0.2s;}
        .pvi-page .reveal-d3{transition-delay:0.3s;}
        .pvi-page .reveal-d4{transition-delay:0.4s;}
      `}</style>

      {/* HERO */}
      <section className="hero" style={{padding:0}}>
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-badge">Prémiová vizuální identita · Praha, Kampa</div>
            <h1>Jeden den.<br /><em>Obsah na měsíce dopředu.</em></h1>
            <p className="hero-sub">Přijdete do ateliéru. Odejdete s cca 150 pečlivě vybranými fotografiemi, jasnou strategií a systémem který tvoří obsah každý týden za vás.</p>
            <div className="hero-actions">
              <button className="btn-primary">Spustit bezplatnou analýzu značky →</button>
              <button className="btn-secondary">nebo Rezervovat strategický hovor ↓</button>
              <div className="hero-note">Analýza webu · Zdarma · Výsledky za 2 minuty</div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          {CAROUSEL_PHOTOS.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className={`carousel-img${i === activeIdx ? " active" : ""}`}
            />
          ))}
          <div className="carousel-overlay" />
          <div className="float-card fc-1">
            <div><span className="fc-dot"></span><span className="fc-title">Systém aktivní</span></div>
            <div className="fc-sub">Právě připravuje obsah</div>
          </div>
          <div className="float-card fc-2" style={{textAlign:"center"}}>
            <div className="fc-num">~150</div>
            <div className="fc-sub">fotek pečlivě vybraných</div>
          </div>
          <div className="float-card fc-3">
            <div className="fc-title" style={{marginBottom:"4px"}}>Týdenní výstupy</div>
            <div className="fc-sub">Příspěvky · Vizuály · Reels</div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem">
        <div className="problem-grid">
          <div className="problem-left">
            <div className="label" style={{color:"rgba(180,232,66,0.6)"}}>Problém který znáte</div>
            <h2>Vaše práce je skvělá.<br /><em>Ale nikdo to nevidí.</em></h2>
            <div className="problem-quote">&ldquo;Tohle není problém tvorby. Je to problém obrazu.&rdquo;</div>
          </div>
          <div>
            <ul className="problem-list">
              <li><div className="pl-icon">📱</div>Web říká jedno, Instagram druhé, LinkedIn třetí. Zákazník neví jestli jste to vy — a odejde.</li>
              <li><div className="pl-icon">⏰</div>Tvoříte obsah místo toho abyste dělali svou práci. Každý týden znovu od nuly.</li>
              <li><div className="pl-icon">🤖</div>20 aplikací na generování, texty, plánování. Místo tvorby řešíte systémy.</li>
              <li><div className="pl-icon">📷</div>Fotky z loňska. Styl který vás nepředstavuje. Vizuál který neodpovídá vaší ceně.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* WOW — VIZUÁLNÍ BOARD */}
      <section className="wow">
        <div className="wow-inner">
          <div className="label reveal">Naše největší přednost</div>
          <h2 className="reveal">Víte jak budete vypadat<br /><em>ještě před focením.</em></h2>
          <div className="wow-grid">
            <div className="board-mockup reveal">
              <div className="bm-header">
                <div className="bm-dot" style={{background:"#ff5f57"}}></div>
                <div className="bm-dot" style={{background:"#ffbd2e"}}></div>
                <div className="bm-dot" style={{background:"#28c940"}}></div>
                <div className="bm-title">Vizuální board · Jana Procházková · Před focením</div>
              </div>
              <div className="bm-grid">
                <div className="bm-cell bm-cell-main bc-1">
                  <div className="bc-label">Tmavé sako · Ateliér Kampa · Záběr č. 1</div>
                  <div className="bm-outfit-tag">Outfit A · Tmavě zelená</div>
                  <div className="bm-score">
                    <div className="bm-score-num">87</div>
                    <div className="bm-score-label">Brand skóre</div>
                  </div>
                </div>
                <div className="bm-cell bm-cell-sub bc-2">
                  <div className="bm-outfit-tag" style={{color:"rgba(0,0,0,0.5)"}}>Detail · ruce + notes</div>
                </div>
                <div className="bm-cell bm-cell-sub bc-3">
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"var(--font-playfair),serif",fontSize:"16px",color:"rgba(255,255,255,0.5)",fontStyle:"italic"}}>&ldquo;Vaše vize.&rdquo;</div>
                    <div style={{fontSize:"10px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>Faceless záběr</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="wow-text reveal reveal-d2">
              <div className="label">Vizuální board s vaší podobou</div>
              <h2>AI náhledovky.<br /><em>Váš obličej. Váš styl.</em></h2>
              <p className="section-sub" style={{marginBottom:"28px"}}>Ještě před tím než vstoupíte do ateliéru víte přesně jak výsledek bude vypadat. Modré sako nebo hnědé? Kampa nebo interiér? Vše vidíte dopředu — na sobě.</p>
              <div className="wow-steps">
                <div className="ws"><div className="ws-num">1</div><div className="ws-text"><strong>Pošlete fotografie.</strong> Stačí několik běžných fotek.</div></div>
                <div className="ws"><div className="ws-num">2</div><div className="ws-text"><strong>AI vás zasadí do scén.</strong> Různé outfity, prostory, rekvizity — přesně podle strategie vaší značky.</div></div>
                <div className="ws"><div className="ws-num">3</div><div className="ws-text"><strong>Vyberete co se vám líbí.</strong> A přesně tak pak focení proběhne.</div></div>
                <div className="ws"><div className="ws-num">4</div><div className="ws-text"><strong>Výsledek je garantovaný.</strong> Žádné překvapení. Žádné fotky které pak nechcete použít.</div></div>
              </div>
              <button className="btn-primary" onClick={openDashboard}>Chci vidět ukázku →</button>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="process">
        <div className="process-inner">
          <div className="reveal">
            <div className="label">Jak to funguje</div>
            <h2>Tři kroky.<br /><em>Jeden výsledek.</em></h2>
          </div>
          <div className="process-phases">
            <div className="phase-card ph-0 reveal reveal-d1">
              <div className="ph-badge pb-light">Před focením</div>
              <div className="ph-when">Krok 1 · Strategický hovor</div>
              <div className="ph-title">Pochopíme vaši značku.</div>
              <div className="ph-price">9 900 Kč · Bez závazku focení</div>
              <ul className="ph-items">
                <li><strong>Analýza vaší online přítomnosti</strong> — web, Instagram, LinkedIn</li>
                <li><strong>Strategický hovor 60 minut</strong> — co chcete říkat a komu</li>
                <li><strong>20stránková prezentace</strong> rozvoje značky a kampaní</li>
                <li><strong>Vizuální board s vaší podobou</strong> — náhledovky jak budete vypadat</li>
                <li><strong>3 Canva šablony na míru</strong> s ukázkou v reálných příspěvcích</li>
              </ul>
            </div>
            <div className="phase-card ph-1 reveal reveal-d2">
              <div className="ph-badge pb-dark">Den focení · Praha Kampa</div>
              <div className="ph-when">Krok 2 · Reálný obsah</div>
              <div className="ph-title" style={{color:"#fff"}}>Přijdete jednou.<br />Obsah na měsíce.</div>
              <div className="ph-price">Cena dle rozsahu</div>
              <ul className="ph-items">
                <li><strong>5 stylů focení</strong> — každý cca 20 fotografií</li>
                <li><strong>10 faceless fotek</strong> pro grafiku a kampaně</li>
                <li><strong>1 minuta b-rollu</strong> pro Reels a LinkedIn video</li>
                <li>Focení přesně dle vizuálního boardu</li>
                <li>Prostor pro improvizaci a nápady</li>
                <li>Za příplatek: promo video, Reels, grafika</li>
              </ul>
            </div>
            <div className="phase-card ph-2 reveal reveal-d3">
              <div className="ph-badge pb-violet">Po focení · Autopilot</div>
              <div className="ph-when">Krok 3 · Systém za vás</div>
              <div className="ph-title" style={{color:"#fff"}}>Značka pracuje.<br />Vy žijete.</div>
              <div className="ph-price">Měsíční spolupráce</div>
              <ul className="ph-items">
                <li>Aplikace která <strong>zná vaši značku</strong></li>
                <li>Hotové příspěvky, vizuály, Reels — každý týden</li>
                <li>Vy schválíte. Systém publikuje.</li>
                <li>Kurátor hlídá strategii a náladu</li>
                <li>Obsah který vypadá jako vy — protože je to vy</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className="deliverables">
        <div className="del-inner">
          <div className="reveal">
            <div className="label">Co konkrétně dostanete</div>
            <h2>Čísla. Ne přísliby.</h2>
          </div>
          <div className="del-grid">
            <div className="del-card reveal reveal-d1">
              <div className="del-icon">📷</div>
              <div className="del-num">~150</div>
              <div className="del-unit">fotek pečlivě vybraných</div>
              <div className="del-title">5 stylů · cca 20 fotek každý</div>
              <div className="del-desc">Portréty, pracovní momenty, detail záběry, faceless — vše pečlivě vybrané dle vizuálního boardu.</div>
            </div>
            <div className="del-card reveal reveal-d2">
              <div className="del-icon">🎬</div>
              <div className="del-num">1 min</div>
              <div className="del-unit">b-roll video záběrů</div>
              <div className="del-title">Reels, LinkedIn, stories</div>
              <div className="del-desc">Autentické klipy pro Reels a video obsah. Teplý grading dle vaší palety.</div>
            </div>
            <div className="del-card reveal reveal-d3">
              <div className="del-icon">🎨</div>
              <div className="del-num">3</div>
              <div className="del-unit">Canva šablony na míru</div>
              <div className="del-title">Grafika připravená k použití</div>
              <div className="del-desc">Ukázka jak fotky žijí v reálných příspěvcích — fonty, barvy, styl.</div>
            </div>
            <div className="del-card reveal reveal-d4">
              <div className="del-icon">📋</div>
              <div className="del-num">20</div>
              <div className="del-unit">stran strategické prezentace</div>
              <div className="del-title">Rozvoj značky + kampaně</div>
              <div className="del-desc">Positioning, cílová skupina, obsahový plán, todolist — vše konkrétní.</div>
            </div>
          </div>
          <div className="extras reveal" style={{marginTop:"20px"}}>
            <div className="extras-label">Za příplatek</div>
            <div className="extras-row">
              <div className="extra-tag">Promo video <span>+</span></div>
              <div className="extra-tag">Reels produkce <span>+</span></div>
              <div className="extra-tag">Grafika kampaní <span>+</span></div>
              <div className="extra-tag">Měsíční autopilot <span>+</span></div>
              <div className="extra-tag">AI avatar <span>+</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing">
        <div className="pricing-inner">
          <div className="label" style={{color:"var(--lime)",textAlign:"center"}}>Investice</div>
          <h2>Jasná cena.<br /><em>Bez překvapení.</em></h2>
          <p className="section-sub">Začněte strategickým hovorem. Focení a autopilot jsou váš další krok — pokud budete chtít.</p>
          <div className="price-cards">
            <div className="price-card pc-entry">
              <div className="pc-badge">Krok 1 · Vstup</div>
              <div className="pc-price">9 900</div>
              <div className="pc-period">Kč · Strategický hovor + Vizuální board</div>
              <ul className="pc-items">
                <li>Analýza vaší online přítomnosti</li>
                <li>Strategický hovor 60 minut</li>
                <li>20stránková prezentace – Marketingový plán a strategie</li>
                <li>Vizuál board vašich budoucích fotografií</li>
                <li>3 Canva šablony vycházející z vaší Brand DNA</li>
              </ul>
              <button className="pc-btn">Rezervovat hovor →</button>
            </div>
            <div className="price-card pc-full">
              <div className="pc-badge">Krok 1 + 2 · Komplet</div>
              <div className="pc-price">39 900</div>
              <div className="pc-period">Kč · Hovor + Focení + Výstupy</div>
              <ul className="pc-items">
                <li>Vše ze Kroku 1</li>
                <li>Den focení v ateliéru Praha Kampa</li>
                <li>5 stylů focení — každý cca 20 fotografií</li>
                <li>10 faceless fotek pro grafiku a kampaně</li>
                <li>1 minuta b-rollu pro Reels a video</li>
                <li>Focení přesně dle vizuálního boardu!</li>
                <li>Prostor pro improvizaci a nápady</li>
                <li>Za příplatek: promo video, Reels, grafika</li>
                <li>Měsíc autopilota zdarma (vstup do naší aplikace)</li>
              </ul>
              <button className="pc-btn">Chci kompletní spolupráci →</button>
            </div>
          </div>
          <div className="pricing-note">Autopilot — měsíční spolupráce — domlouváme individuálně. Žádné dlouhodobé závazky.</div>
        </div>
      </section>

      {/* BRAND SCAN CTA */}
      <section className="scan-cta">
        <div className="scan-inner">
          <div className="label reveal">Začněte zdarma</div>
          <h2 className="reveal">Zjistěte kde vaše značka<br /><em>ztrácí zákazníky.</em></h2>
          <p className="section-sub reveal">Zadejte adresu webu. Za dvě minuty víte přesně na čem pracovat — a zda má smysl se potkat.</p>
          <div className="scan-input-wrap reveal">
            <input className="scan-input" type="url" placeholder="vasweb.cz" />
            <button className="scan-btn">Spustit analýzu →</button>
          </div>
          <div className="scan-note reveal">Zdarma · Bez registrace · Výsledky okamžitě</div>
        </div>
      </section>

      {/* TEAM */}
      <section className="team">
        <div className="team-inner">
          <div className="label" style={{color:"var(--lime)",textAlign:"center"}}>Za Luciferous stojí</div>
          <h2>52 let zkušeností.<br /><em>Nejsme agentura. Jsme studio.</em></h2>
          <p className="section-sub">Fyzický svět fotoateliéru na Kampě. Digitální ekosystém AI. Jedno místo kde se to celé skládá dohromady.</p>
          <div className="team-grid">
            <div className="team-card reveal reveal-d1">
              <div className="team-avatar">📷</div>
              <div className="team-name">Katarína</div>
              <div className="team-role">Obraz &amp; Strategie</div>
              <div className="team-desc">26 let fotografie, videa a vizuální identity. Stovky značek. Komerční banka, Vodafone, Oriflame. Ateliér na Praze Kampě.</div>
            </div>
            <div className="team-card reveal reveal-d2">
              <div className="team-avatar">⚡</div>
              <div className="team-name">Luboš</div>
              <div className="team-role">Systémy &amp; AI</div>
              <div className="team-desc">26 let v technologiích. Skládá desítky AI nástrojů do jednoho funkčního celku. Systém který pracuje místo vás.</div>
            </div>
            <div className="team-card reveal reveal-d3">
              <div className="team-avatar">✨</div>
              <div className="team-name">Eska</div>
              <div className="team-role">Duše &amp; Kresba</div>
              <div className="team-desc">Kousek skutečného života který dává obsahu duši. Ilustrace, kresby, vizuální svět který AI sama nevymyslí.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="footer-cta">
        <div className="label reveal">Jeden krok</div>
        <h2 className="reveal">Váš obsah nemůže čekat,<br /><em>až ho zákazník pochopí.</em></h2>
        <p className="section-sub reveal">Strategický hovor trvá 60 minut. Výsledek pracuje za vás měsíce dopředu.</p>
        <button className="btn-primary reveal">Rezervovat hovor · 9 900 Kč →</button>
        <div className="footer-note reveal">nebo začněte bezplatnou analýzou značky — žádný závazek</div>
      </section>

      <div className="footer-bottom">
        <div className="fb-logo">△ <span>LUCIFERA</span> · Studio</div>
        <div className="fb-note">Praha, Kampa · studio@lucifera.cz · Prémiová vizuální identita pro osobní značky</div>
      </div>
    </div>
    </>
  );
}
