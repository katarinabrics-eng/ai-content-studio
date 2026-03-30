"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "../components/Header";
import ReferenceSekce from "@/components/ReferenceSekce";
import DiagnostikaDemo from "@/components/DiagnostikaDemo";
// PostUkazky import removed — component kept in src/components/PostUkazky.tsx for use elsewhere

// ─────────────────────────────────────────────
// VIZUÁLNÍ BOARD DEMO — contact-sheet overlay
// ─────────────────────────────────────────────
const CONTACT_SHOTS = [
  {
    id: 1, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/01.jpg",
    label: "Portrét · Tmavé sako", outfit: "Outfit A · Tmavě zelená", score: 87, main: true,
    palette: [
      { name: "Forest", hex: "#3B5240", role: "Hlavní" },
      { name: "Sage", hex: "#8B9E7A", role: "Akcent" },
      { name: "Cream", hex: "#F5EFE0", role: "Pozadí" },
      { name: "Walnut", hex: "#7C5C3E", role: "Detail" },
      { name: "Slate", hex: "#4A4A52", role: "Neutrál" },
    ],
    outfits: ["Tmavě zelené sako", "Béžová halenka", "Přírodní tóny"],
    props: ["Přirozené světlo", "Minimalistické pozadí", "Křeslo"],
    mood: ["Sebejistá", "Profesionální", "Elegantní"],
  },
  {
    id: 2, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/02.jpg",
    label: "Detail · ruce + notes", outfit: "Outfit A", main: false,
    palette: [
      { name: "Linen", hex: "#E8DDD0", role: "Hlavní" },
      { name: "Walnut", hex: "#7C5C3E", role: "Detail" },
      { name: "Ivory", hex: "#FAF6EE", role: "Pozadí" },
      { name: "Sage", hex: "#8B9E7A", role: "Akcent" },
      { name: "Ink", hex: "#2C2C2E", role: "Neutrál" },
    ],
    outfits: ["Tmavě zelené sako", "Jemný rukáv"],
    props: ["Zápisník", "Pero", "Přirozené světlo", "Dřevěný stůl"],
    mood: ["Soustředěná", "Kreativní", "Klidná"],
  },
  {
    id: 3, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/03.jpg",
    label: "Faceless záběr", quote: "Vaše vize.", main: false,
    palette: [
      { name: "Cream", hex: "#F5EFE0", role: "Hlavní" },
      { name: "Sage", hex: "#8B9E7A", role: "Akcent" },
      { name: "Blush", hex: "#D4B5A8", role: "Světlý" },
      { name: "Linen", hex: "#E8DDD0", role: "Pozadí" },
      { name: "Slate", hex: "#4A4A52", role: "Neutrál" },
    ],
    outfits: ["Světlá halenka", "Přírodní látky"],
    props: ["Zápisník", "Rostliny", "Okno", "Difuzní světlo"],
    mood: ["Tajemná", "Artistická", "Svobodná"],
  },
  {
    id: 4, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/04.jpg",
    label: "Exteriér · světlé tóny", outfit: "Outfit B · Krémová", score: 92, main: true,
    palette: [
      { name: "Cream", hex: "#F5EFE0", role: "Hlavní" },
      { name: "Moss", hex: "#7A8C60", role: "Příroda" },
      { name: "Sand", hex: "#C9B99A", role: "Akcent" },
      { name: "Sky", hex: "#D6E4EE", role: "Pozadí" },
      { name: "Bark", hex: "#6B4F3A", role: "Detail" },
    ],
    outfits: ["Krémové šaty", "Lněná blůza", "Béžová"],
    props: ["Přirozené světlo", "Zeleň", "Vzduch", "Exteriér"],
    mood: ["Svobodná", "Přirozená", "Svěží"],
  },
  {
    id: 5, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/05.jpg",
    label: "Portrét blízko", main: false,
    palette: [
      { name: "Blush", hex: "#D4B5A8", role: "Hlavní" },
      { name: "Ivory", hex: "#FAF6EE", role: "Pozadí" },
      { name: "Terracotta", hex: "#B5705A", role: "Akcent" },
      { name: "Linen", hex: "#E8DDD0", role: "Světlý" },
      { name: "Espresso", hex: "#3C2A1E", role: "Neutrál" },
    ],
    outfits: ["Krémová blůza", "Přirozený look"],
    props: ["Přirozené světlo", "Jemné pozadí"],
    mood: ["Autentická", "Upřímná", "Blízká"],
  },
  {
    id: 6, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/06.jpg",
    label: "Pohybový záběr", main: false,
    palette: [
      { name: "Cream", hex: "#F5EFE0", role: "Hlavní" },
      { name: "Sage", hex: "#8B9E7A", role: "Akcent" },
      { name: "Sand", hex: "#C9B99A", role: "Detail" },
      { name: "Pearl", hex: "#F0EBE3", role: "Pozadí" },
      { name: "Slate", hex: "#4A4A52", role: "Neutrál" },
    ],
    outfits: ["Vzdušný outfit", "Světlé tóny"],
    props: ["Pohyb", "Vzduch", "Přirozené světlo"],
    mood: ["Dynamická", "Energická", "Živá"],
  },
  {
    id: 7, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/07.jpg",
    label: "Pracovní detail", outfit: "Outfit C · Antracit", main: false,
    palette: [
      { name: "Anthracite", hex: "#3A3A3C", role: "Hlavní" },
      { name: "White", hex: "#FAFAFA", role: "Kontrast" },
      { name: "Steel", hex: "#8A8A8E", role: "Akcent" },
      { name: "Cream", hex: "#F5EFE0", role: "Světlý" },
      { name: "Ink", hex: "#1C1C1E", role: "Neutrál" },
    ],
    outfits: ["Antracitový blazer", "Bílá košile", "Minimalistický look"],
    props: ["Notebook", "Káva", "Pracovní stůl", "Pero"],
    mood: ["Cílevědomá", "Efektivní", "Silná"],
  },
  {
    id: 8, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/08.jpg",
    label: "Atmosferický záběr", main: false,
    palette: [
      { name: "Burgundy", hex: "#7D0021", role: "Hlavní" },
      { name: "Amber", hex: "#C8873A", role: "Teplý" },
      { name: "Shadow", hex: "#2A1F1A", role: "Tmavý" },
      { name: "Gold", hex: "#D4A857", role: "Světlo" },
      { name: "Ash", hex: "#5A5050", role: "Neutrál" },
    ],
    outfits: ["Tmavý outfit", "Burgundy tóny"],
    props: ["Svíčky", "Teplé světlo", "Textury", "Interiér"],
    mood: ["Mystická", "Hluboká", "Poetická"],
  },
  {
    id: 9, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/09.jpg",
    label: "Portrét · přírodní světlo", main: false,
    palette: [
      { name: "Honey", hex: "#D4A857", role: "Světlo" },
      { name: "Blush", hex: "#D4B5A8", role: "Hlavní" },
      { name: "Cream", hex: "#F5EFE0", role: "Pozadí" },
      { name: "Sand", hex: "#C9B99A", role: "Akcent" },
      { name: "Espresso", hex: "#3C2A1E", role: "Neutrál" },
    ],
    outfits: ["Béžová halenka", "Přirozený look"],
    props: ["Přirozené světlo", "Okno", "Čisté pozadí"],
    mood: ["Přirozená", "Teplá", "Klidná"],
  },
  {
    id: 10, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/10.jpg",
    label: "Detail · emocí", main: false,
    palette: [
      { name: "Rose", hex: "#C4897A", role: "Hlavní" },
      { name: "Ivory", hex: "#FAF6EE", role: "Pozadí" },
      { name: "Blush", hex: "#D4B5A8", role: "Akcent" },
      { name: "Linen", hex: "#E8DDD0", role: "Světlý" },
      { name: "Bark", hex: "#6B4F3A", role: "Neutrál" },
    ],
    outfits: ["Jemná halenka", "Přirozené tóny"],
    props: ["Přirozené světlo", "Jemné pozadí"],
    mood: ["Emotivní", "Upřímná", "Hloubavá"],
  },
  {
    id: 11, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/11.jpg",
    label: "Interiér · tmavý tón", outfit: "Outfit D", main: false,
    palette: [
      { name: "Noir", hex: "#1A1A1E", role: "Hlavní" },
      { name: "Burgundy", hex: "#7D0021", role: "Akcent" },
      { name: "Gold", hex: "#C9A84C", role: "Detail" },
      { name: "Ash", hex: "#5A5050", role: "Střední" },
      { name: "Ivory", hex: "#FAF6EE", role: "Kontrast" },
    ],
    outfits: ["Tmavé sako", "Elegantní look", "Outfit D"],
    props: ["Křeslo", "Teplé světlo", "Luxusní interiér", "Svíčky"],
    mood: ["Luxusní", "Klidná", "Sebejistá"],
  },
  {
    id: 12, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/12.jpg",
    label: "Záběr z profilu", main: false,
    palette: [
      { name: "Pearl", hex: "#F0EBE3", role: "Pozadí" },
      { name: "Blush", hex: "#D4B5A8", role: "Hlavní" },
      { name: "Sage", hex: "#8B9E7A", role: "Akcent" },
      { name: "Linen", hex: "#E8DDD0", role: "Světlý" },
      { name: "Slate", hex: "#4A4A52", role: "Neutrál" },
    ],
    outfits: ["Světlý outfit", "Jemné barvy"],
    props: ["Okno", "Boční světlo", "Čisté pozadí"],
    mood: ["Kontemplativní", "Jemná", "Poetická"],
  },
  {
    id: 13, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/13.jpg",
    label: "Detail rukou", main: false,
    palette: [
      { name: "Linen", hex: "#E8DDD0", role: "Hlavní" },
      { name: "Walnut", hex: "#7C5C3E", role: "Detail" },
      { name: "Ivory", hex: "#FAF6EE", role: "Pozadí" },
      { name: "Sand", hex: "#C9B99A", role: "Akcent" },
      { name: "Ink", hex: "#2C2C2E", role: "Neutrál" },
    ],
    outfits: ["Jemný rukáv", "Přírodní tóny"],
    props: ["Zápisník", "Pero", "Prsteny", "Dřevěná plocha"],
    mood: ["Kreativní", "Detailní", "Jemná"],
  },
  {
    id: 14, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/14.jpg",
    label: "Portrét · přímý pohled", main: false,
    palette: [
      { name: "Cream", hex: "#F5EFE0", role: "Pozadí" },
      { name: "Terracotta", hex: "#B5705A", role: "Hlavní" },
      { name: "Blush", hex: "#D4B5A8", role: "Akcent" },
      { name: "Linen", hex: "#E8DDD0", role: "Světlý" },
      { name: "Espresso", hex: "#3C2A1E", role: "Neutrál" },
    ],
    outfits: ["Čistý look", "Přirozené tóny"],
    props: ["Přirozené světlo", "Neutrální pozadí"],
    mood: ["Odvážná", "Přímá", "Charismatická"],
  },
  {
    id: 15, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/15.jpg",
    label: "Výrazný výraz", main: false,
    palette: [
      { name: "Shadow", hex: "#2A1F1A", role: "Hlavní" },
      { name: "Burgundy", hex: "#7D0021", role: "Akcent" },
      { name: "Ash", hex: "#5A5050", role: "Střední" },
      { name: "Blush", hex: "#D4B5A8", role: "Světlý" },
      { name: "Ink", hex: "#1C1C1E", role: "Neutrál" },
    ],
    outfits: ["Tmavý outfit", "Dramatický look"],
    props: ["Dramatické světlo", "Tmavé pozadí"],
    mood: ["Výrazná", "Silná", "Dramatická"],
  },
  {
    id: 16, src: "/placeholders/VIZUALBOARD-CONTACTSHEET/16.jpg",
    label: "Celková kompozice", main: false,
    palette: [
      { name: "Cream", hex: "#F5EFE0", role: "Hlavní" },
      { name: "Sage", hex: "#8B9E7A", role: "Akcent" },
      { name: "Sand", hex: "#C9B99A", role: "Detail" },
      { name: "Linen", hex: "#E8DDD0", role: "Světlý" },
      { name: "Slate", hex: "#4A4A52", role: "Neutrál" },
    ],
    outfits: ["Kompletní look", "Přírodní tóny"],
    props: ["Celkový prostor", "Přirozené světlo", "Interiér"],
    mood: ["Vyvážená", "Kompletní", "Harmonická"],
  },
];


const FIXED_PALETTE = [
  { name: "Linen",  hex: "#E8D0D0" },
  { name: "Walnut", hex: "#7C5C3E" },
  { name: "Ivory",  hex: "#FAF8EE" },
  { name: "Sage",   hex: "#8B9E7A" },
  { name: "Ink",    hex: "#2C2C2E" },
];
const FIXED_OUTFITS = ["Lněné oblečení", "Přírodní tóny", "Casual styl"];
const FIXED_PROPS   = ["Zápisník", "Káva", "Přirozené světlo", "Rostliny"];
const FIXED_MOOD    = ["Autentická", "Klidná", "Přirozená"];

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
      padding: "clamp(0px, 3vw, 24px)",
      opacity: animIn ? 1 : 0, transition: "opacity 0.35s ease",
    }}>
      <style>{`
        .vbd-window {
          background: #0e0e0e;
          border-radius: 20px;
          width: calc(100vw - 48px);
          max-width: 1480px;
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
          width: 210px; flex-shrink: 0; border-right: 1px solid rgba(255,255,255,0.06);
          overflow-y: auto; padding: 16px 10px; display: flex; flex-direction: column; gap: 6px;
        }
        .vbd-sidebar::-webkit-scrollbar { width: 4px; }
        .vbd-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .vbd-thumb {
          border-radius: 10px; overflow: hidden; cursor: pointer;
          position: relative; aspect-ratio: 4/3;
          border: none; transition: outline-color 0.15s, transform 0.15s;
          outline: 2px solid transparent; outline-offset: 2px;
          background: #1a1a1a;
        }
        .vbd-thumb:hover { transform: scale(1.02); }
        .vbd-thumb.active { outline-color: rgba(180,232,66,0.7); }
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
          font-size: 8px; color: rgba(255,255,255,0.25);
          letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 5px;
        }
        .vbd-bottom-block {
          display: flex; flex-direction: column; flex-shrink: 0;
        }
        .vbd-bottom-sep {
          width: 1px; background: rgba(255,255,255,0.07); align-self: stretch; flex-shrink: 0;
        }
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

        @media (max-width: 700px) {
          .vbd-window {
            width: 100vw;
            max-width: 100vw;
            max-height: 100dvh;
            border-radius: 0;
          }
          /* Sidebar schovat — thumbnails nahradit dots navigací */
          .vbd-sidebar { display: none; }
          .vbd-body { flex-direction: column; }
          .vbd-main { min-height: 0; flex: 1; }

          /* Bottom bar — scroll horizontálně */
          .vbd-bottom {
            padding: 12px 16px;
            gap: 8px;
            overflow-x: auto;
            flex-wrap: nowrap;
            -webkit-overflow-scrolling: touch;
          }
          .vbd-bottom-sep { display: none; }
          .vbd-palette-swatch { width: 28px; height: 28px; }

          /* Preview info — zjednodušit */
          .vbd-preview-info { padding: 16px; flex-direction: column; align-items: flex-start; gap: 8px; }
          .vbd-shot-quote { font-size: 16px; }
          .vbd-outfit-pill { display: none; }
          .vbd-score-badge { top: 12px; right: 12px; padding: 8px 12px; }
          .vbd-score-num { font-size: 22px; }

          /* Titlebar */
          .vbd-title { font-size: 10px; }
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
          <div className="vbd-title">Vizuální board · Veronika · Před focením · Lucifera Studio</div>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 4px" }}>
                {FIXED_PALETTE.map((c) => (
                  <div key={c.hex} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="vbd-palette-swatch" style={{ background: c.hex, width: 28, height: 28, flexShrink: 0 }}>
                      <div className="vbd-swatch-tip">{c.name} · {c.role}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.04em" }}>{c.name}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>{c.hex}</div>
                    </div>
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
                  {shot.quote && <div className="vbd-shot-quote">&ldquo;{shot.quote}&rdquo;</div>}
                </div>
                {shot.outfit && <div className="vbd-outfit-pill">{shot.outfit}</div>}
              </div>
            </div>

            {/* Bottom bar — outfits / props / mood / CTA */}
            <div className="vbd-bottom">

              {/* Paleta */}
              <div className="vbd-bottom-block">
                <div className="vbd-bottomlabel">Paleta</div>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {FIXED_PALETTE.map((c) => (
                    <div key={c.hex} className="vbd-palette-swatch" style={{ background: c.hex, width: 22, height: 22, borderRadius: 6 }}>
                      <div className="vbd-swatch-tip">{c.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="vbd-bottom-sep" />

              {/* Outfity */}
              <div className="vbd-bottom-block">
                <div className="vbd-bottomlabel">Outfity</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {FIXED_OUTFITS.map((o) => (
                    <span key={o} style={{
                      fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.65)",
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 20, padding: "3px 9px", whiteSpace: "nowrap",
                    }}>{o}</span>
                  ))}
                </div>
              </div>

              <div className="vbd-bottom-sep" />

              {/* Rekvizity */}
              <div className="vbd-bottom-block">
                <div className="vbd-bottomlabel">Rekvizity</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {FIXED_PROPS.map((r) => (
                    <span key={r} style={{
                      fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.65)",
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 20, padding: "3px 9px", whiteSpace: "nowrap",
                    }}>{r}</span>
                  ))}
                </div>
              </div>

              <div className="vbd-bottom-sep" />

              {/* Nálada */}
              <div className="vbd-bottom-block">
                <div className="vbd-bottomlabel">Nálada</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {FIXED_MOOD.map((n) => (
                    <span key={n} style={{
                      fontSize: 10, fontWeight: 600, color: "rgba(180,232,66,0.7)",
                      background: "rgba(180,232,66,0.06)", border: "1px solid rgba(180,232,66,0.15)",
                      borderRadius: 20, padding: "3px 9px", whiteSpace: "nowrap",
                    }}>{n}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                <div style={{
                  background: "rgba(180,232,66,0.1)", border: "1px solid rgba(180,232,66,0.25)",
                  borderRadius: 8, padding: "9px 18px",
                  fontSize: 12, fontWeight: 600, color: "#a8eb12", cursor: "pointer",
                  whiteSpace: "nowrap", transition: "background 0.15s",
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

const WOW_PHOTOS = [
  "/placeholders/VIZUALBOARD-CONTACTSHEET/01.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/02.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/03.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/04.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/05.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/06.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/07.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/08.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/09.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/10.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/11.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/12.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/13.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/14.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/15.jpg",
  "/placeholders/VIZUALBOARD-CONTACTSHEET/16.jpg",
];

const CAROUSEL_PHOTOS = [
  "/placeholders/ukazky-brandu-new/Coverpremium01.jpg",
  "/placeholders/ukazky-brandu-new/Coverpremium02.jpg",
  "/placeholders/ukazky-brandu-new/Coverpremium03.jpg",
  "/placeholders/ukazky-brandu-new/Coverpremium04.jpg",
  "/placeholders/ukazky-brandu-new/Coverpremium05.jpg",
  "/placeholders/ukazky-brandu-new/Coverpremium06.jpg",
  "/placeholders/ukazky-brandu-new/Coverpremium07.jpg",
  "/placeholders/ukazky-brandu-new/Coverpremium08.jpg",
  "/placeholders/ukazky-brandu-new/Coverpremium09.jpg",
  "/placeholders/ukazky-brandu-new/Coverpremium10.jpg",
  "/placeholders/ukazky-brandu-new/Coverpremium11.jpg",
];

export default function PremiovaVizualniIdentita() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [wowIdx, setWowIdx] = useState(0);
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
    const timer = setInterval(() => {
      setWowIdx((i) => (i + 1) % WOW_PHOTOS.length);
    }, 3200);
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
          position:absolute;inset:0;width:100%;
          background:var(--cream);overflow:hidden;
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
          background:
            linear-gradient(to right, var(--cream) 0%, var(--cream) 28%, rgba(245,244,239,0.85) 42%, rgba(245,244,239,0.2) 58%, transparent 72%),
            linear-gradient(to top, rgba(245,244,239,0.4) 0%, transparent 40%);
        }

        /* FLOATING CARDS */
        .pvi-page .float-card{
          position:absolute;background:rgba(255,255,255,0.97);backdrop-filter:blur(16px);
          border-radius:16px;padding:18px 24px;box-shadow:0 16px 48px rgba(0,0,0,0.28),0 2px 8px rgba(0,0,0,0.1);
          min-width:160px;
        }
        .pvi-page .fc-1{bottom:80px;left:50%;animation:float1 4s ease-in-out infinite;}
        .pvi-page .fc-2{top:120px;right:80px;animation:float2 5s ease-in-out infinite;}
        .pvi-page .fc-3{bottom:180px;right:72px;animation:float3 4.5s ease-in-out infinite;}
        @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
        @keyframes float3{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .pvi-page .fc-dot{width:9px;height:9px;border-radius:50%;background:var(--lime);display:inline-block;margin-right:8px;animation:pulse 1.8s ease infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .pvi-page .fc-title{font-size:13px;font-weight:700;color:var(--black);margin-bottom:3px;}
        .pvi-page .fc-sub{font-size:12px;color:var(--gray);}
        .pvi-page .fc-num{font-family:var(--font-playfair),serif;font-size:38px;font-weight:700;color:var(--lime-dark);line-height:1;}

        /* ── SECTION BASE ── */
        .pvi-page section{padding:96px 80px;}
        .pvi-page .label{font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--lime-dark);margin-bottom:10px;}
        .pvi-page h2{font-family:var(--font-playfair),serif;font-size:clamp(32px,3.5vw,48px);font-weight:700;line-height:1.15;margin-bottom:16px;}
        .pvi-page h2 em{font-style:italic;font-weight:300;}
        .pvi-page .section-sub{font-size:15px;color:var(--gray);line-height:1.7;max-width:580px;margin-left:auto;margin-right:auto;}

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
        .pvi-page .wow{background:var(--cream);padding:40px 80px;max-width:none;}
        .pvi-page .wow-inner{max-width:1200px;margin:0 auto;}
        .pvi-page .wow-grid{display:grid;grid-template-columns:1fr 1.4fr;gap:48px;align-items:center;margin-top:40px;}

        /* WOW FRAME WRAPPER — before photos + arrows */
        .pvi-page .wow-frame-wrap{
          position:relative;
          padding-left:0;
          padding-right:120px;
          width:100%;
          min-width:500px;
          overflow:visible;
        }
        .pvi-page .wow-pred-card{
          position:absolute;
          background:#fff;
          padding:7px 7px 30px 7px;
          border-radius:4px;
          box-shadow:0 12px 36px rgba(0,0,0,0.22),0 3px 10px rgba(0,0,0,0.1);
          width:160px;
          z-index:10;
        }
        .pvi-page .wow-pred-card img{
          width:100%;height:148px;
          object-fit:cover;object-position:center top;
          display:block;
        }
        .pvi-page .wow-pred-label{
          text-align:center;font-size:9px;font-weight:700;
          letter-spacing:0.1em;color:#bbb;text-transform:uppercase;
          margin-top:7px;
        }
        .pvi-page .wow-pred-1{
          top:40px;right:-100px;left:auto;
          transform:rotate(7deg);
          animation:float1 4.5s ease-in-out infinite;
        }
        .pvi-page .wow-pred-2{
          top:220px;left:8px;
          transform:rotate(5deg);
          animation:float2 5s ease-in-out infinite;
        }
        .pvi-page .wow-arrow{
          position:absolute;z-index:11;pointer-events:none;overflow:visible;
        }
        .pvi-page .wow-arrow-1{top:120px;right:28px;left:auto;width:80px;height:56px;}
        .pvi-page .wow-arrow-2{top:300px;left:96px;width:72px;height:52px;}

        /* WOW PHOTO FRAME — Mac-style */
        .pvi-page .wow-frame{
          width:100%;
          max-width:none;
          min-width:400px;
          border-radius:16px;
          overflow:hidden;
          background:#1c1c1e;
          box-shadow:0 40px 100px rgba(0,0,0,0.28);
          position:relative;
        }
        .pvi-page .wf-titlebar{
          display:flex;align-items:center;gap:6px;
          padding:11px 16px;background:#2a2a2c;
          border-bottom:1px solid rgba(255,255,255,0.06);
        }
        .pvi-page .wf-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
        .pvi-page .wf-label{
          flex:1;text-align:center;font-size:11px;letter-spacing:0.04em;
          color:rgba(255,255,255,0.25);margin-left:-28px;
        }
        .pvi-page .wf-photos{
          position:relative;
          width:100%;
          aspect-ratio:4/3;
          background:#111;
          overflow:hidden;
        }
        .pvi-page .wf-photo{
          position:absolute;inset:0;width:100%;height:100%;
          object-fit:cover;object-position:center top;
          opacity:0;transition:opacity 1.1s ease;
        }
        .pvi-page .wf-photo.active{opacity:1;}
        .pvi-page .wf-overlay{
          position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 55%);
        }
        .pvi-page .wf-caption{
          position:absolute;bottom:14px;left:16px;right:16px;
          display:flex;align-items:center;justify-content:space-between;
        }
        .pvi-page .wf-cap-label{
          font-size:10px;letter-spacing:0.12em;text-transform:uppercase;
          color:rgba(255,255,255,0.55);font-weight:600;
        }
        .pvi-page .wf-dots{display:flex;gap:5px;align-items:center;}
        .pvi-page .wf-dot-nav{
          width:5px;height:5px;border-radius:50%;
          background:rgba(255,255,255,0.25);transition:all 0.3s;cursor:pointer;border:none;padding:0;
        }
        .pvi-page .wf-dot-nav.active{background:#fff;width:16px;border-radius:3px;}
        .pvi-page .wf-badge{
          position:absolute;top:14px;right:14px;
          background:rgba(0,0,0,0.55);backdrop-filter:blur(12px);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:8px;padding:7px 12px;text-align:center;
          z-index:10;
        }
        .pvi-page .wf-badge-num{font-family:var(--font-playfair),serif;font-size:22px;font-weight:700;color:var(--lime);line-height:1;}
        .pvi-page .wf-badge-lbl{font-size:8px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-top:2px;}

        /* BOARD MOCKUP (kept for possible reuse) */
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
        .pvi-page .ph-lime .ph-items li::before{content:'·';color:rgba(0,0,0,0.4);font-size:16px;line-height:1;flex-shrink:0;}
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
        .pvi-page .team-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:800px;margin:0 auto;}
        .pvi-page .team-card{
          background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
          border-radius:18px;padding:36px;text-align:center;
        }
        .pvi-page .team-avatar{
          width:180px;height:180px;border-radius:50%;margin:0 auto 20px;
          overflow:hidden;border:2px solid rgba(255,255,255,0.1);
          background:#111;
        }
        .pvi-page .team-avatar img{
          width:100%;height:100%;object-fit:cover;object-position:center top;display:block;
        }
        .pvi-page .team-name{font-family:var(--font-playfair),serif;font-size:24px;font-weight:600;color:#fff;margin-bottom:6px;}
        .pvi-page .team-role{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--lime);margin-bottom:14px;}
        .pvi-page .team-desc{font-size:13px;color:rgba(255,255,255,0.4);line-height:1.7;}

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
        .pvi-page .fb-logo img{height:32px;width:auto;display:block;opacity:0.9;}
        .pvi-page .fb-note{font-size:12px;color:rgba(255,255,255,0.2);}

        /* ── SCROLL REVEAL ── */
        .pvi-page .reveal{opacity:0;transform:translateY(28px);transition:opacity 0.7s ease,transform 0.7s ease;}
        .pvi-page .reveal.vis{opacity:1;transform:translateY(0);}
        .pvi-page .reveal-d1{transition-delay:0.1s;}
        .pvi-page .reveal-d2{transition-delay:0.2s;}
        .pvi-page .reveal-d3{transition-delay:0.3s;}
        .pvi-page .reveal-d4{transition-delay:0.4s;}

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          /* Hero */
          .pvi-page .hero{ min-height:100svh; }
          .pvi-page .hero-container{ padding:100px 24px 60px; }
          .pvi-page .hero-left{ max-width:100%; }
          .pvi-page h1{ font-size:clamp(34px,9vw,52px); }
          .pvi-page .hero-sub{ font-size:15px; }
          .pvi-page .hero-right{
            position:absolute;inset:0;
            background:linear-gradient(to bottom, rgba(245,244,239,0) 0%, var(--cream) 75%);
            z-index:1;
          }
          .pvi-page .hero-container{ z-index:2; }
          .pvi-page .carousel-overlay{
            background:
              linear-gradient(to bottom, rgba(245,244,239,0.1) 0%, var(--cream) 65%),
              linear-gradient(to right, var(--cream) 0%, transparent 100%);
          }
          /* Skrýt levitující okýnka na mobilu */
          .pvi-page .float-card{ display:none !important; }

          /* Sekce */
          .pvi-page section{ padding:56px 24px; }
          .pvi-page .problem{ padding:56px 24px; }
          .pvi-page .problem-grid{ grid-template-columns:1fr; gap:40px; }
          .pvi-page .wow-inner{ grid-template-columns:1fr; gap:32px; }
          .pvi-page .process-phases{ grid-template-columns:1fr; gap:20px; }
          .pvi-page .deliverables-grid{ grid-template-columns:1fr 1fr; gap:12px; }
          .pvi-page .pricing-cards{ grid-template-columns:1fr !important; gap:16px; }
          .pvi-page .team-grid{ grid-template-columns:1fr !important; gap:32px; }
          .pvi-page .footer-cta{ padding:72px 24px; }
          .pvi-page .footer-bottom{ padding:20px 24px; flex-direction:column; gap:10px; text-align:center; }

          /* Typografie */
          .pvi-page h2{ font-size:clamp(26px,7vw,38px); }
          .pvi-page .footer-cta h2{ font-size:clamp(28px,8vw,48px); }
          .pvi-page .btn-primary{ font-size:14px; padding:14px 24px; width:100%; justify-content:center; }

          /* DiagnostikaDemo */
          .pvi-page section.process > div > section {
            margin-left: -24px !important;
            margin-right: -24px !important;
            border-radius: 0 !important;
            padding: 40px 20px 36px !important;
          }

          /* Sekce 3 — Výsledek */
          .pvi-page .result-section{ padding:56px 24px !important; }
          .pvi-page .result-grid{ grid-template-columns:1fr !important; gap:40px !important; }

          /* Wow sekce — vizuální board */
          .pvi-page .wow{ padding:56px 24px; }
          .pvi-page .wow-grid{ grid-template-columns:1fr; gap:32px; margin-top:24px; }
          .pvi-page .wow-frame-wrap{ padding-right:0; padding-left:0; min-width:0; display:flex; flex-direction:column; }
          .pvi-page .wow-pred-card{
            position:static;
            width:90px;
            transform:none;
            animation:none;
            margin:0 auto 12px auto;
          }
          .pvi-page .wow-pred-card img{ height:80px; }
          .pvi-page .wow-arrow{ display:none; }
          .pvi-page .wow-frame{ min-width:0; }

          /* Sekce 8 — Jak spolupráce probíhá */
          .pvi-page .pricing{ padding:56px 24px !important; }
          .pvi-page .pricing-main-block{ grid-template-columns:1fr !important; gap:24px !important; padding:28px 24px !important; }
          .pvi-page .pricing-bullets{ grid-template-columns:1fr !important; }
          .pvi-page .pricing-cards-grid{ grid-template-columns:1fr !important; }

          /* Galerie — 2 sloupce na tabletu */
          .pvi-page .codostanete-columns{ grid-template-columns:repeat(2,1fr) !important; }
        }

        @media (max-width: 480px) {
          .pvi-page .hero-container{ padding:90px 20px 52px; }
          .pvi-page h1{ font-size:clamp(30px,10vw,44px); }
          .pvi-page .deliverables-grid{ grid-template-columns:1fr; }
          .pvi-page section{ padding:48px 20px; }
          .pvi-page .problem{ padding:48px 20px; }

          /* Galerie — 1 sloupec na telefonu */
          .pvi-page .codostanete-columns{ grid-template-columns:1fr !important; }
        }
        .codostanete-item:hover .overlay-default { opacity: 0 !important; }
        .codostanete-item:hover .overlay-hover { opacity: 1 !important; }
      `}</style>

      {/* SEKCE 1 — HERO (krémová) */}
      <section className="hero" style={{padding:0}}>
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-badge">Content Day · Praha, Kampa</div>
            <h1>Jeden den focení.<br /><em>Obsah na 3–6 měsíců dopředu.</em></h1>
            <p className="hero-sub">Přijdete do ateliéru. Odejdete s fotografiemi, které odpovídají vaší značce — a konkrétním plánem, jak je používat v příspěvcích, na webu i v kampaních.</p>
            <div className="hero-actions">
              <a href="#jak-to-funguje" className="btn-primary" style={{textDecoration:"none"}}>Chci obsah na měsíce →</a>
              <a href="/diagnostika" className="btn-secondary" style={{textDecoration:"none"}}>Zkontrolovat moji značku →</a>
              <div className="hero-note">Zdarma · bez registrace · výsledek za 2 minuty</div>
            </div>
            <div style={{marginTop:20,fontSize:12,color:"#aaa",letterSpacing:"0.05em"}}>~150 fotografií · příspěvky · reels · vizuály</div>
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

      {/* SEKCE 2 — PROBLÉM (černá) */}
      <section style={{background:"#111", padding:"48px 0"}}>
        <div style={{maxWidth:"800px", margin:"0 auto", textAlign:"center", padding:"0 40px"}}>
          <p style={{
            fontFamily:"var(--font-display)",
            fontSize:"clamp(22px, 3vw, 38px)",
            fontWeight:400,
            color:"#fafaf7",
            lineHeight:1.3,
            fontStyle:"italic",
          }}>
            "Vaše značka roste. Vizuál ji buď zrychlí, nebo brzdí."
          </p>
        </div>
      </section>

      {/* SEKCE 3 — VÝSLEDEK (bílá) */}
      <section className="result-section" style={{background:"#ffffff",padding:"96px 80px"}}>
        <style>{`
          .del-mockup-scene { position: relative; width: 100%; }
          .del-mockup-scene img { width: 100%; display: block; }
          .del-chip {
            position: absolute;
            background: #fff;
            border-radius: 14px;
            box-shadow: 0 6px 28px rgba(0,0,0,0.10);
            border: 1px solid rgba(0,0,0,0.06);
            padding: 10px 14px;
            display: flex;
            align-items: center;
            gap: 9px;
            white-space: nowrap;
            animation: floatChip 4s ease-in-out infinite;
          }
          .del-chip .dc-icon {
            width: 28px; height: 28px; border-radius: 7px;
            background: #f0fad0;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; flex-shrink: 0;
          }
          .del-chip .dc-text { font-size: 11px; font-weight: 600; color: #111; line-height: 1.3; }
          .dc-1 { top: 2%;  left: -8%;  animation-delay: 0s;   animation-duration: 4.2s; }
          .dc-2 { top: 38%; left: -10%; animation-delay: 1.3s; animation-duration: 5.7s; }
          .dc-3 { top: 76%; left: -4%;  animation-delay: 0.7s; animation-duration: 3.9s; }
          .dc-4 { top: 5%;  right: -8%; animation-delay: 0.4s; animation-duration: 4.9s; }
          .dc-5 { top: 38%; right: -10%; animation-delay: 2.1s; animation-duration: 6.1s; }
          .dc-6 { top: 72%; right: -6%; animation-delay: 0.9s; animation-duration: 4.4s; }
          @media (max-width: 1100px) { .del-chip { display: none; } }
        `}</style>
        <div style={{maxWidth:1360,margin:"0 auto"}}>
          <div className="result-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}>

            {/* Levý sloupec — mockup s čipy */}
            <div style={{position:"relative",paddingLeft:16}}>
              <div className="del-mockup-scene reveal reveal-d2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/placeholders/mocuppremium.jpg" alt="Ukázka výstupů" />
                <div className="del-chip dc-1"><div className="dc-icon">📷</div><div className="dc-text">100–150 fotografií</div></div>
                <div className="del-chip dc-2"><div className="dc-icon">🔍</div><div className="dc-text">Návrh obsahu a použití</div></div>
                <div className="del-chip dc-3"><div className="dc-icon">📸</div><div className="dc-text">5 typů záběrů</div></div>
                <div className="del-chip dc-4"><div className="dc-icon">🎨</div><div className="dc-text">3 Canva šablony</div></div>
                <div className="del-chip dc-5"><div className="dc-icon">🖼️</div><div className="dc-text">Vizuální návrh focení</div></div>
                <div className="del-chip dc-6"><div className="dc-icon">🎬</div><div className="dc-text">Video záběry pro Reels</div></div>
              </div>
            </div>

            {/* Pravý sloupec — text + bullets */}
            <div>
              <div className="label">Výsledek</div>
              <h2>Po jednom dni máte jasno.</h2>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:18,marginTop:36}}>
                {[
                  "100–150 použitelných fotografií",
                  "sjednocený vizuální styl",
                  "konkrétní typy příspěvků",
                  "obsah pro web, sítě i kampaně",
                ].map((item) => (
                  <li key={item} style={{display:"flex",gap:14,alignItems:"flex-start",fontSize:17,color:"#222",lineHeight:1.6}}>
                    <span style={{color:"var(--lime-dark)",fontWeight:700,fontSize:22,lineHeight:1.1,flexShrink:0}}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p style={{marginTop:44,fontFamily:"var(--font-playfair),serif",fontStyle:"italic",fontSize:19,color:"var(--lime-dark)"}}>Neřešíte co přidat. Jen vybíráte.</p>
            </div>

          </div>
        </div>
      </section>

      {/* SEKCE 4 — VIZUÁLNÍ BOARD (krémová) */}
      <section className="wow" style={{background:"var(--cream)"}}>
        <div className="wow-inner">
          <div className="wow-grid">
            <div className="wow-text reveal">
              <div className="label">Vizuální board s vaší podobou</div>
              <h2>Dopředu víte,<br /><em>co jdete fotit.</em></h2>
              <p className="section-sub" style={{marginBottom:"20px"}}>Ještě před focením uvidíte:</p>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
                {["jaké oblečení zvolit","v jakém prostředí budete","jaký styl budeme tvořit"].map(t=>(
                  <li key={t} style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:14,color:"#555",lineHeight:1.6}}>
                    <span style={{color:"var(--lime-dark)",fontWeight:700,fontSize:18,lineHeight:1.1,flexShrink:0}}>·</span>{t}
                  </li>
                ))}
              </ul>
              <p className="section-sub" style={{marginBottom:"28px",fontWeight:600,color:"var(--black)"}}>Na focení jdete připravená. Ne improvizovat.</p>
              <button className="btn-primary" style={{textDecoration:"none",border:"none",cursor:"pointer"}} onClick={openDashboard}>Chci vidět ukázku →</button>
              <div style={{fontSize:12,color:"#bbb",marginTop:8}}>Návrh připravíme před focením</div>
            </div>
            <div className="wow-frame-wrap reveal reveal-d2">
              {/* Before photo */}
              <div className="wow-pred-card wow-pred-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/placeholders/VIZUALBOARD-CONTACTSHEET/veru-pred.jpg" alt="Veronika před focením" />
                <div className="wow-pred-label">Před</div>
              </div>
              {/* Arrow */}
              <svg className="wow-arrow wow-arrow-1" viewBox="0 0 80 56" fill="none">
                <path d="M72,48 C60,48 42,14 8,10" stroke="#8fb82e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M15,4 L6,11 L17,17" stroke="#8fb82e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              {/* Mac window frame */}
              <div className="wow-frame">
                <div className="wf-titlebar">
                  <div className="wf-dot" style={{background:"#ff5f57"}}/>
                  <div className="wf-dot" style={{background:"#ffbd2e"}}/>
                  <div className="wf-dot" style={{background:"#28c940"}}/>
                  <div className="wf-label">Veronika</div>
                </div>
                <div className="wf-photos">
                  {WOW_PHOTOS.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" className={`wf-photo${i === wowIdx ? " active" : ""}`} />
                  ))}
                  <div className="wf-overlay"/>
                  <div className="wf-caption">
                    <span className="wf-cap-label">Vizuální board · ukázka</span>
                    <div className="wf-dots">
                      {WOW_PHOTOS.map((_, i) => (
                        <button key={i} className={`wf-dot-nav${i === wowIdx ? " active" : ""}`} onClick={() => setWowIdx(i)} aria-label={`Foto ${i + 1}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCE 6 — JAK TO FUNGUJE (černá) */}
      <section className="process" id="jak-to-funguje" style={{background:"var(--black)"}}>
        <div className="process-inner">
          <div className="reveal">
            <div className="label" style={{color:"var(--lime)"}}>Jak to funguje</div>
            <h2 style={{color:"#fff"}}>Tři kroky.<br /><em style={{color:"var(--lime)"}}>Jeden výsledek.</em></h2>
          </div>
          <div className="process-phases">
            <div className="phase-card ph-1 reveal reveal-d1" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <div className="ph-badge pb-dark">Před focením</div>
              <div className="ph-when">Krok 1 · 45–60 min online</div>
              <div className="ph-title" style={{color:"#fff"}}>Návrh focení.</div>
              <div className="ph-price" style={{borderColor:"rgba(255,255,255,0.08)"}}>Připravíme vše dopředu</div>
              <ul className="ph-items">
                <li>styl</li>
                <li>outfit</li>
                <li>prostředí</li>
                <li>typy záběrů</li>
              </ul>
            </div>
            <div className="phase-card ph-lime reveal reveal-d2" style={{
              background:"#b7e94c",padding:36,borderRadius:20,
              boxShadow:"0 8px 48px rgba(183,233,76,0.30)",
              transform:"translateY(-10px)",
            }}>
              <div style={{
                display:"inline-flex",alignItems:"center",gap:6,
                padding:"4px 12px",borderRadius:10,fontSize:10,fontWeight:700,
                letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:20,
                background:"rgba(0,0,0,0.10)",color:"#111",
              }}>Den focení · Praha Kampa</div>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6,color:"rgba(0,0,0,0.35)"}}>Krok 2 · Reálný obsah</div>
              <div style={{fontFamily:"var(--font-playfair),serif",fontSize:24,fontWeight:700,lineHeight:1.2,marginBottom:6,color:"#111"}}>Přijdete jednou.<br />Obsah na měsíce.</div>
              <div style={{fontSize:13,fontWeight:600,marginBottom:20,paddingBottom:20,borderBottom:"1px solid rgba(0,0,0,0.12)",color:"#333"}}>Content Day</div>
              <ul className="ph-items">
                <li style={{color:"rgba(0,0,0,0.6)"}}>portréty</li>
                <li style={{color:"rgba(0,0,0,0.6)"}}>pracovní momenty</li>
                <li style={{color:"rgba(0,0,0,0.6)"}}>lifestyle</li>
                <li style={{color:"rgba(0,0,0,0.6)"}}>obsah pro sítě</li>
              </ul>
            </div>
            <div className="phase-card ph-2 reveal reveal-d3">
              <div className="ph-badge pb-violet">Po focení</div>
              <div className="ph-when">Krok 3 · Výstupy</div>
              <div className="ph-title" style={{color:"#fff"}}>Vše připravené<br />k použití.</div>
              <ul className="ph-items" style={{marginTop:28}}>
                <li>fotografie</li>
                <li>video záběry</li>
                <li>šablony a doporučení</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCE 7 — CO DOSTANETE */}
      <section className="deliverables" style={{background:"#fafaf7", padding:"80px 0"}}>
        <div style={{textAlign:"center", marginBottom:"48px", padding:"0 48px", maxWidth:"800px", marginLeft:"auto", marginRight:"auto"}}>
          <div className="label">ukázky výstupů · prémiová identita</div>
          <h2 style={{marginTop:"12px", marginBottom:"12px"}}>Výstupy, které mění to,<br /><em>jak vás svět vidí.</em></h2>
          <p className="section-sub">Vizuální identita · brand strategie · grafické šablony · obsah · fotoplán. Vše co potřebujete pro silnou vizuální značku.</p>
        </div>
        <div className="codostanete-columns" style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", padding:"0 10px"}}>
          {[
            {src:"/placeholders/CO%20DOSTANETE/vizual%20board%20vyber.jpg", pill:"Vizuální board", title:"Výběr vašeho stylu", sub:"Ještě před focením víte přesně jak budete vypadat", desc:"Ještě před focením uvidíte přesně jak budete vypadat. Outfity, prostředí, nálada, kompozice — vše promyšlené dopředu. Na focení přijdete připravená. Žádná improvizace, žádná nejistota."},
            {src:"/placeholders/CO%20DOSTANETE/BrandDna.jpg", pill:"Brand DNA", title:"Archetyp · tón · strategie", sub:"Průvodce pro obsah a komunikaci", desc:"Strategický dokument který popisuje kdo jste, jak komunikujete a pro koho tvoříte. Váš archetyp, tón hlasu, klíčová témata. Základ pro veškerý obsah — fotky, texty, sítě."},
            {src:"/placeholders/CO%20DOSTANETE/Reels.jpg", pill:"Reels · video", title:"Video záběry s hookem", sub:"Střihový brief · 15s formát", desc:"Krátké autentické videozáběry připravené k publikaci. Teplý grading dle vašeho vizuálního stylu. Hotové pro Instagram, LinkedIn i Stories — stačí zveřejnit."},
            {src:"/placeholders/CO%20DOSTANETE/vizual%20board.jpg", pill:"Vizuální board", title:"Contact sheet s vaší podobou", sub:"Outfit plán · nálada · prostředí", desc:"Kontaktní sheet vašich fotografií roztříděný dle scény, nálady a záběru. Vždy víte co máte k dispozici a pro jaký příspěvek to použít."},
            {src:"/placeholders/CO%20DOSTANETE/Canva%20sablony.jpg", pill:"Canva šablony", title:"10 šablon na míru", sub:"Vaše barvy · fonty · ikony", desc:"Deset grafických šablon nastavených přesně na váš brand — vaše barvy, fonty, styl. Otevřete v Canva, upravíte text a máte hotový příspěvek za minutu."},
            {src:"/placeholders/CO%20DOSTANETE/Strategie.jpg", pill:"Strategie", title:"Komunikační rámec", sub:"Témata · plán obsahu · scénáře", desc:"Měsíční obsahový cyklus s tématy pro každý týden. Nikdy nebudete stát nad prázdnou stránkou a přemýšlet co zveřejnit. Každý příspěvek má jasný záměr."},
            {src:"/placeholders/CO%20DOSTANETE/Prispevky.jpg", pill:"Příspěvky na sítě", title:"Obsah připravený k použití", sub:"Instagram · LinkedIn · Facebook", desc:"Konkrétní návrhy příspěvků — témata, hooky, texty. Víte přesně co publikovat, kde a kdy. Obsah který přitahuje správné klienty, ne jen lajky."},
            {src:"/placeholders/CO%20DOSTANETE/vizualni%20banka.jpg", pill:"Vizuální banka", title:"Knihovna vašich fotek", sub:"Tříděno dle scény a nálady", desc:"Roztříděná knihovna vašich fotografií dle scény, nálady a záběru. Vždy víte kde hledat správnou fotku pro každý příspěvek. ✦ Přístup do stocku fotografií je součástí Content Day."},
          ].map((item, i) => (
            <div key={i} className="codostanete-item" style={{
              borderRadius:"10px",
              overflow:"hidden",
              position:"relative",
              cursor:"pointer",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.title}
                style={{
                  width:"100%",
                  display:"block",
                  aspectRatio:"4/3",
                  objectFit:"cover",
                }}
              />
              {/* Default overlay — viditelný, skryje se při hover */}
              <div className="overlay-default" style={{
                position:"absolute",
                inset:0,
                display:"flex",
                flexDirection:"column",
                justifyContent:"flex-end",
                padding:"16px",
                background:"linear-gradient(to top, rgba(17,17,17,0.55) 0%, transparent 50%)",
                opacity:1,
                transition:"opacity 0.35s ease",
              }}>
                <span style={{
                  display:"inline-block",
                  fontSize:"9px",
                  letterSpacing:".1em",
                  textTransform:"uppercase",
                  padding:"3px 10px",
                  borderRadius:"100px",
                  background:"rgba(250,250,247,0.85)",
                  color:"rgba(17,17,17,0.55)",
                  marginBottom:"6px",
                  width:"fit-content",
                }}>{item.pill}</span>
                <div style={{
                  fontFamily:"var(--font-display, Georgia, serif)",
                  fontSize:"17px",
                  fontWeight:400,
                  color:"#FAF7F2",
                  lineHeight:1.25,
                  marginBottom:"3px",
                }}>{item.title}</div>
                <div style={{
                  fontSize:"11px",
                  color:"rgba(250,247,242,0.6)",
                }}>{item.sub}</div>
              </div>
              {/* Hover overlay — zelený, viditelný při hover */}
              <div className="overlay-hover" style={{
                position:"absolute",
                inset:0,
                display:"flex",
                flexDirection:"column",
                justifyContent:"center",
                alignItems:"center",
                textAlign:"center",
                padding:"24px",
                background:"rgba(208,236,120,0.93)",
                opacity:0,
                transition:"opacity 0.35s ease",
              }}>
                <span style={{
                  display:"inline-block",
                  fontSize:"10px",
                  fontWeight:700,
                  letterSpacing:".12em",
                  textTransform:"uppercase",
                  padding:"4px 14px",
                  borderRadius:"100px",
                  background:"rgba(17,17,17,0.15)",
                  color:"rgba(17,17,17,0.75)",
                  border:"1px solid rgba(17,17,17,0.18)",
                  marginBottom:"14px",
                }}>{item.pill}</span>
                <div style={{
                  fontFamily:"var(--font-display, Georgia, serif)",
                  fontSize:"22px",
                  fontWeight:400,
                  color:"#111",
                  lineHeight:1.2,
                  marginBottom:"10px",
                }}>{item.title}</div>
                <div style={{
                  width:"32px",
                  height:"1px",
                  background:"rgba(17,17,17,0.25)",
                  margin:"0 auto 12px",
                }}></div>
                <div style={{
                  fontSize:"13px",
                  color:"rgba(17,17,17,0.65)",
                  lineHeight:1.6,
                  fontWeight:300,
                  maxWidth:"220px",
                }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEKCE 8 — CENA (krémová) */}
      <section className="pricing" style={{background:"var(--cream)",padding:"96px 80px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div className="label" style={{color:"var(--lime-dark)",textAlign:"center"}}>Jak spolupráce probíhá</div>
          <h2 style={{color:"var(--black)",textAlign:"center"}}>Vyberte si,<br /><em style={{color:"var(--black)"}}>kde chcete začít.</em></h2>

          {/* BLOCK 1 — hlavní nabídka */}
          <div className="pricing-main-block" style={{
            background:"var(--black)",borderRadius:20,padding:"40px 48px",
            marginBottom:24,display:"grid",gridTemplateColumns:"1fr auto",gap:48,alignItems:"center",
          }}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--lime)",marginBottom:8}}>Content Day · od 39 900 Kč</div>
              <div style={{fontFamily:"var(--font-playfair),serif",fontSize:"clamp(26px,3vw,36px)",fontWeight:700,color:"#fff",lineHeight:1.2,marginBottom:12}}>Obsah na měsíce dopředu</div>
              <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.7,marginBottom:20,maxWidth:480}}>Přijdete jednou. Odejdete s obsahem na 3–6 měsíců.</p>
              <div className="pricing-bullets" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 32px",marginBottom:28}}>
                {[
                  "100–150 fotografií",       "kompletní návrh focení",
                  "5 stylů focení",           "vizuální náhledy",
                  "video záběry",             "obsahový plán",
                  "sjednocený vizuální styl", "Canva šablony",
                ].map(i=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:"rgba(255,255,255,0.55)"}}>
                    <span style={{color:"var(--lime)",fontWeight:700,flexShrink:0}}>✓</span>{i}
                  </div>
                ))}
              </div>
              <a href="/rezervace" style={{
                display:"inline-flex",alignItems:"center",gap:8,
                background:"#b7e94c",color:"#111",
                padding:"14px 28px",borderRadius:10,
                fontSize:14,fontWeight:700,textDecoration:"none",
              }}>Chci obsah na měsíce →</a>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:10}}>Nejčastější volba klientek</div>
            </div>
            <div style={{
              background:"rgba(180,232,66,0.06)",border:"1px solid rgba(180,232,66,0.15)",
              borderRadius:16,padding:"28px 32px",textAlign:"center",minWidth:180,flexShrink:0,
            }}>
              <div style={{fontFamily:"var(--font-playfair),serif",fontSize:52,fontWeight:700,color:"var(--lime)",lineHeight:1,display:"flex",alignItems:"baseline",gap:6,justifyContent:"center"}}>39 900 <span style={{fontSize:22,fontWeight:500}}>Kč</span></div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:6}}>Content Day</div>
            </div>
          </div>

          {/* BLOCK 2 — vstupní balíčky */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:"#888",textAlign:"center",marginBottom:16}}>Nejste si jistá? Začněte tady.</div>
            <div className="pricing-cards-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

              {/* Magnet — zdarma */}
              <div style={{background:"#fff",border:"2px solid var(--lime)",borderRadius:18,padding:"28px 32px",position:"relative"}}>
                <div style={{
                  position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",
                  background:"var(--lime)",color:"#111",
                  fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                  padding:"4px 14px",borderRadius:20,whiteSpace:"nowrap",
                }}>Začni zdarma</div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#aaa",marginBottom:12}}>Vyzkoušej zdarma</div>
                <div style={{fontFamily:"var(--font-playfair),serif",fontSize:36,fontWeight:700,color:"var(--black)",lineHeight:1,marginBottom:6,display:"flex",alignItems:"baseline",gap:5}}>
                  0 <span style={{fontSize:16,fontWeight:400,color:"#aaa"}}>Kč</span>
                </div>
                <div style={{fontSize:13,color:"#888",marginBottom:20,paddingBottom:20,borderBottom:"1px solid var(--gray-light)"}}>3 posty připravené přesně pro tvou značku. Bez závazku.</div>
                <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
                  {["3 hotové příspěvky","Tvůj styl a tón","Náhled okamžitě","Stažení po aktivaci tarifu"].map(i=>(
                    <li key={i} style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:"#555"}}>
                      <span style={{color:"var(--lime-dark)",fontWeight:700}}>✓</span>{i}
                    </li>
                  ))}
                </ul>
                <a href="/ready-to-go/register" style={{
                  display:"block",textAlign:"center",
                  background:"var(--lime)",color:"#111",
                  padding:"12px",borderRadius:10,
                  fontSize:13,fontWeight:700,textDecoration:"none",
                }}>Chci 3 posty zdarma →</a>
                <div style={{fontSize:11,color:"#bbb",textAlign:"center",marginTop:8}}>Zdarma · náhled s vodoznakem · stažení po aktivaci</div>
              </div>

              {/* Content Starter */}
              <div style={{background:"#fff",border:"1px solid var(--gray-light)",borderRadius:18,padding:"28px 32px"}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#aaa",marginBottom:12}}>Content Starter</div>
                <div style={{fontFamily:"var(--font-playfair),serif",fontSize:36,fontWeight:700,color:"var(--black)",lineHeight:1,marginBottom:20,paddingBottom:20,borderBottom:"1px solid var(--gray-light)",display:"flex",alignItems:"baseline",gap:5}}>4 900 <span style={{fontSize:16,fontWeight:400,color:"#aaa"}}>Kč</span></div>
                <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
                  {["návrh vizuálního stylu","ilustrační vizuály","5 krátkých video záběrů","návrhy příspěvků + texty"].map(i=>(
                    <li key={i} style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:"#555"}}>
                      <span style={{color:"var(--lime-dark)",fontWeight:700}}>✓</span>{i}
                    </li>
                  ))}
                </ul>
                <a href="/rezervace" style={{
                  display:"block",textAlign:"center",
                  background:"var(--black)",color:"#fff",
                  padding:"12px",borderRadius:10,
                  fontSize:13,fontWeight:600,textDecoration:"none",
                }}>Chci začít →</a>
                <div style={{fontSize:11,color:"#bbb",textAlign:"center",marginTop:8}}>Výstup do 2 dnů · bez závazku</div>
              </div>
            </div>
          </div>

          {/* BLOCK 3 — Content Autopilot RTG */}
          <div style={{
            background:"var(--black)",border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:16,padding:"32px 40px",
          }}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",marginBottom:6}}>Chcete to bez starostí?</div>
              <div style={{fontSize:22,fontWeight:700,color:"#fff",marginBottom:4}}>Content Autopilot — Ready to Go</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>Pravidelný obsah · publikace · správa</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:24}}>
              {[
                {name:"Start",price:"2 900",desc:"2 videa · 8 grafik"},
                {name:"Plus",price:"4 900",desc:"4 videa · 16 grafik · carousely",featured:true},
                {name:"Pro",price:"7 900",desc:"8 videí · 30 grafik · agent"},
              ].map(t=>(
                <div key={t.name} style={{
                  background: t.featured ? "rgba(183,233,76,0.08)" : "rgba(255,255,255,0.04)",
                  border: t.featured ? "1px solid rgba(183,233,76,0.25)" : "1px solid rgba(255,255,255,0.07)",
                  borderRadius:12,padding:"18px 20px",textAlign:"center",
                }}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color: t.featured ? "var(--lime)" : "rgba(255,255,255,0.3)",marginBottom:6}}>{t.name}</div>
                  <div style={{fontFamily:"var(--font-playfair),serif",fontSize:28,fontWeight:700,color: t.featured ? "var(--lime)" : "#fff",lineHeight:1,marginBottom:4}}>{t.price} <span style={{fontSize:13,fontWeight:400}}>Kč</span></div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>/ měsíc</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:6}}>{t.desc}</div>
                </div>
              ))}
            </div>
            <div style={{textAlign:"center"}}>
              <a href="/ready-to-go" style={{
                display:"inline-flex",alignItems:"center",gap:8,
                background:"#b7e94c",color:"#111",
                padding:"13px 28px",borderRadius:10,
                fontSize:13,fontWeight:700,textDecoration:"none",
              }}>Zjistit více o RTG →</a>
            </div>
          </div>

          <div style={{fontSize:12,color:"#bbb",textAlign:"center",marginTop:24}}>Žádné dlouhodobé závazky · domlouváme individuálně</div>
        </div>
      </section>

      {/* SEKCE 9 — REFERENCE (bílá) */}
      <div style={{background:"#ffffff"}}>
        <ReferenceSekce />
      </div>

      {/* SEKCE 10 — O NÁS (černá) */}
      <section className="team">
        <div className="team-inner">
          <div className="label" style={{color:"var(--lime)",textAlign:"center"}}>Kdo jsme</div>
          <h2 style={{color:"#fff",textAlign:"center",marginBottom:8}}>52 let zkušeností.<br /><em style={{color:"var(--lime)"}}>Nejsme agentura. Jsme studio.</em></h2>
          <p className="section-sub" style={{textAlign:"center",maxWidth:620,margin:"0 auto 16px"}}>Fyzický svět fotoateliéru na Kampě. Digitální ekosystém AI.<br />Jedno místo, kde se to celé skládá dohromady.</p>
          <p className="section-sub" style={{textAlign:"center",maxWidth:560,margin:"0 auto 56px",fontStyle:"italic",color:"rgba(255,255,255,0.35)"}}>Lucifera je nositelkou světla. Přinášíme ho tam, kde má vaše práce začít zářit.</p>
          <div className="team-grid">
            <div className="team-card reveal reveal-d1">
              <div className="team-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/placeholders/KDOJSEM_04.png" alt="Katarína" />
              </div>
              <div className="team-name">Katarína</div>
              <div className="team-role">Obraz · Strategie · AI</div>
              <div className="team-desc">26 let práce s fotografií a vizuální tvorbou. Projekce pro divadla, festivaly a konference. Dnes propojuje vizuální tvorbu s AI technologiemi a vytváří procesy, které klientům šetří čas a zjednodušují práci s obsahem.</div>
            </div>
            <div className="team-card reveal reveal-d2">
              <div className="team-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/placeholders/KDOJSEM_05.png" alt="Luboš" />
              </div>
              <div className="team-name">Luboš</div>
              <div className="team-role">Světlo · Kompozice · Technologie</div>
              <div className="team-desc">26 let ve fotografii, filmu a postprodukci. Technický fotograf, který řeší světlo, kompozici a kvalitu obrazu – aby každý výstup fungoval profesionálně v každém médiu.</div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCE 11 — DIAGNOSTIKA (krémová) */}
      <section style={{background:"var(--cream)",padding:"96px 80px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <DiagnostikaDemo />
        </div>
      </section>

      {/* SEKCE 12 — FINÁLNÍ CTA (černá) */}
      <section className="footer-cta" style={{background:"var(--black)"}}>
        <div className="label reveal" style={{color:"rgba(180,232,66,0.6)"}}>Jeden krok</div>
        <h2 className="reveal" style={{color:"#fff"}}>Přijdete jednou.<br /><em style={{color:"var(--lime)"}}>Obsah máte na měsíce.</em></h2>
        <p className="section-sub reveal" style={{color:"rgba(255,255,255,0.35)"}}>Jeden den focení. Měsíce obsahu připraveného dopředu.</p>
        <div className="reveal" style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginTop:8}}>
          <div style={{textAlign:"center"}}>
            <a
              href="/rezervace"
              style={{
                display:"inline-flex",alignItems:"center",gap:10,
                background:"#b7e94c",color:"#111",
                padding:"16px 32px",borderRadius:10,
                fontSize:15,fontWeight:700,textDecoration:"none",
              }}
            >
              Chci termín focení →
            </a>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.2)",marginTop:8}}>Ozveme se do 24 hodin · nezávazně</div>
          </div>
          <div style={{textAlign:"center"}}>
            <a
              href="/diagnostika"
              style={{
                display:"inline-flex",alignItems:"center",gap:10,
                background:"transparent",color:"rgba(255,255,255,0.6)",
                padding:"16px 32px",borderRadius:10,
                fontSize:15,fontWeight:500,textDecoration:"none",
                border:"1px solid rgba(255,255,255,0.15)",
              }}
            >
              Zkontrolovat moji značku →
            </a>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.2)",marginTop:8}}>Zdarma · bez registrace · výsledek za 2 minuty</div>
          </div>
        </div>
        <div className="footer-note reveal" style={{color:"rgba(255,255,255,0.15)",marginTop:32}}>Placeno předem · Výstup v ruce do 2 dní · Bez závazku focení</div>
      </section>

      <div className="footer-bottom">
        <div className="fb-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/placeholders/LUCIFERA-Logo-Left-Neg.webp" alt="Lucifera Studio" />
        </div>
        <div className="fb-note">Praha, Kampa · studio@lucifera.cz · Prémiová vizuální identita pro osobní značky</div>
      </div>
    </div>
    </>
  );
}
