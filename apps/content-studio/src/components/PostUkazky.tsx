"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const LIME = "#b7e94c";

const POSTS = [
  {
    imgBefore: "/placeholders/pred-po/PRED.jpeg",
    imgAfter: "/placeholders/pred-po/PO.png",
    product: "START PACK –\n6 profesionálně\nretušovaných fotografií",
    caption: "studiolucifera První dojem rozhoduje za méně než 50 ms. Vaše fotka mluví dřív než vy. →",
  },
  {
    imgBefore: "/placeholders/pred-po/PRED2.jpeg",
    imgAfter: "/placeholders/pred-po/PO2.png",
    product: "START PACK –\n6 profesionálně\nretušovaných fotografií",
    caption: "studiolucifera LinkedIn s profesionální fotkou = 14× více zobrazení. Fakt. →",
  },
];

function BeforeAfterSlider({
  imgBefore,
  imgAfter,
}: {
  imgBefore: string;
  imgAfter: string;
}) {
  const [pos, setPos] = useState(45);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    updatePos(e.clientX);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    updatePos(e.touches[0].clientX);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) updatePos(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (dragging.current) updatePos(e.touches[0].clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updatePos]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        userSelect: "none",
        cursor: "col-resize",
        overflow: "hidden",
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* BEFORE — full image underneath */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgBefore}
        alt="před"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />

      {/* AFTER — clipped to right side */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 0 0 ${pos}%)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgAfter}
          alt="po"
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Divider line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${pos}%`,
          width: 2,
          background: "rgba(255,255,255,0.9)",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* Handle circle */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${pos}%`,
          transform: "translate(-50%, -50%)",
          width: 38,
          height: 38,
          background: "#fff",
          borderRadius: "50%",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          pointerEvents: "none",
        }}
      >
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
          <path d="M6 1L1 6l5 5" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
          <path d="M2 1l5 5-5 5" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* PŘED label */}
      <span
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          padding: "3px 7px",
          borderRadius: 4,
          opacity: pos > 14 ? 1 : 0,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}
      >
        PŘED
      </span>

      {/* PO label */}
      <span
        style={{
          position: "absolute",
          top: 10,
          right: 12,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          background: LIME,
          color: "#111",
          padding: "3px 7px",
          borderRadius: 4,
          opacity: pos < 86 ? 1 : 0,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}
      >
        PO
      </span>
    </div>
  );
}

export default function PostUkazky() {
  return (
    <section
      style={{
        background: "#f7f6f1",
        padding: "80px 80px",
      }}
    >
      <style>{`
        .post-ukazky-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        @media (max-width: 600px) {
          .post-ukazky-grid { grid-template-columns: 1fr; }
          .post-ukazky-wrap { padding: 48px 20px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#8ab830",
            margin: "0 0 10px",
            fontWeight: 700,
          }}
        >
          Ukázky výstupů
        </p>
        <h2
          style={{
            fontFamily: "var(--font-playfair, Georgia, serif)",
            fontSize: "clamp(26px, 3.5vw, 40px)",
            fontWeight: 700,
            color: "#111",
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Hotové brand reklamy.
        </h2>
        <p style={{ fontSize: 13, color: "#888", margin: "12px 0 0", fontStyle: "italic" }}>
          Posuňte posuvník a porovnejte před a po.
        </p>
      </div>

      {/* Cards grid */}
      <div className="post-ukazky-grid">
        {POSTS.map((post, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid #e8e7e2",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            }}
          >
            {/* IG Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderBottom: "1px solid #f2f1ec",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: LIME,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#111",
                  flexShrink: 0,
                }}
              >
                L
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111", lineHeight: 1.2 }}>
                  studiolucifera
                </div>
                <div style={{ fontSize: 10, color: "#aaa" }}>Praha, Kampa</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="4" cy="8" r="1.2" fill="#aaa" />
                  <circle cx="8" cy="8" r="1.2" fill="#aaa" />
                  <circle cx="12" cy="8" r="1.2" fill="#aaa" />
                </svg>
              </div>
            </div>

            {/* Photo with before/after slider — 4:5 ratio */}
            <div
              style={{
                position: "relative",
                paddingBottom: "125%",
                background: "#1a1a1a",
                overflow: "hidden",
              }}
            >
              <BeforeAfterSlider imgBefore={post.imgBefore} imgAfter={post.imgAfter} />

              {/* Bottom overlay — product + badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 65%)",
                  padding: "36px 16px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  pointerEvents: "none",
                }}
              >
                <pre
                  style={{
                    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 1.5,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    letterSpacing: "0.02em",
                  }}
                >
                  {post.product}
                </pre>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: LIME,
                    color: "#111",
                    padding: "4px 9px",
                    borderRadius: 6,
                    flexShrink: 0,
                    marginLeft: 10,
                  }}
                >
                  AI REKLAMA
                </span>
              </div>
            </div>

            {/* IG Footer */}
            <div style={{ padding: "10px 14px 12px" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 8, opacity: 0.55 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 17S2 12.5 2 7a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 10-8 10Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 3h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7l-4 3V4a1 1 0 0 1 1-1z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{ marginLeft: "auto" }}
                >
                  <path
                    d="M17 3 3 17M3 3l14 14"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p style={{ fontSize: 11, color: "#555", lineHeight: 1.55, margin: 0 }}>
                <span style={{ fontWeight: 700, color: "#111" }}>studiolucifera </span>
                {post.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
