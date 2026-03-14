"use client";

const LIME = "#b7e94c";

const POSTS = [
  {
    img: "/placeholders/PRED:PO/PO.png",
    headline: "Vaše fotka je váš\nprvní dojem.\njako profík.",
    product: "START PACK –\n6 profesionálně\nretušovaných fotografií",
    caption: "studiolucifera První dojem rozhoduje za méně než 50 ms. Vaše fotka mluví dřív než vy. →",
  },
  {
    img: "/placeholders/PRED:PO/PO2.png",
    headline: "Už žádná trapná\nselfie na vašem\nLinkedIn profilu.",
    product: "START PACK –\n6 profesionálně\nretušovaných fotografií",
    caption: "studiolucifera LinkedIn s profesionální fotkou = 14× více zobrazení. Fakt. →",
  },
];

export default function PostUkazky() {
  return (
    <section style={{
      background: "#f7f6f1",
      padding: "80px 80px",
    }}>
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
        <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8ab830", margin: "0 0 10px", fontWeight: 700 }}>
          Ukázky výstupů
        </p>
        <h2 style={{
          fontFamily: "var(--font-playfair, Georgia, serif)",
          fontSize: "clamp(26px, 3.5vw, 40px)",
          fontWeight: 700,
          color: "#111",
          margin: 0,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}>
          Hotové brand reklamy.
        </h2>
      </div>

      {/* Cards grid */}
      <div className="post-ukazky-grid">
        {POSTS.map((post, i) => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #e8e7e2",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          }}>
            {/* IG Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderBottom: "1px solid #f2f1ec",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: LIME, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#111",
                flexShrink: 0,
              }}>L</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111", lineHeight: 1.2 }}>studiolucifera</div>
                <div style={{ fontSize: 10, color: "#aaa" }}>Praha, Kampa</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="4" cy="8" r="1.2" fill="#aaa"/>
                  <circle cx="8" cy="8" r="1.2" fill="#aaa"/>
                  <circle cx="12" cy="8" r="1.2" fill="#aaa"/>
                </svg>
              </div>
            </div>

            {/* Photo with overlay */}
            <div style={{
              position: "relative",
              paddingBottom: "125%", /* 4:5 ratio */
              background: "#1a1a1a",
              overflow: "hidden",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.img}
                alt=""
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* Top overlay — headline */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 60%)",
                padding: "18px 16px 40px",
              }}>
                <pre style={{
                  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize: "clamp(15px, 2.2vw, 20px)",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}>{post.headline}</pre>
              </div>
              {/* Bottom overlay — product + badge */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 65%)",
                padding: "36px 16px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "flex-end",
              }}>
                <pre style={{
                  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.5,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  letterSpacing: "0.02em",
                }}>{post.product}</pre>
                <span style={{
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
                }}>AI REKLAMA</span>
              </div>
            </div>

            {/* IG Footer */}
            <div style={{ padding: "10px 14px 12px" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 8, opacity: 0.55 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 17S2 12.5 2 7a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 10-8 10Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 3h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7l-4 3V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginLeft: "auto" }}>
                  <path d="M17 3 3 17M3 3l14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
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
