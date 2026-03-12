"use client";

const client = {
  name: "Jana Procházková",
  subtitle: "Před focením · Lucifera Studio",
  brandScore: 87,
  shots: [
    {
      id: 1,
      label: "TMAVÉ SAKO · ATELIÉR KAMPA · ZÁBĚR Č. 1",
      outfit: "Outfit A · Tmavě zelená",
      src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80",
      span: "main",
    },
    {
      id: 2,
      label: "Detail · ruce + notes",
      src: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&q=80",
      span: "small",
    },
    {
      id: 3,
      label: "Faceless záběr",
      quote: "Vaše vize.",
      src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
      span: "small",
    },
    {
      id: 4,
      label: "SVĚTLÝ KABÁT · EXTERIÉR · ZÁBĚR Č. 2",
      outfit: "Outfit B · Krémová",
      src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&q=80",
      span: "main",
    },
    {
      id: 5,
      label: "Portrét blízko",
      src: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=600&q=80",
      span: "small",
    },
    {
      id: 6,
      label: "Pohybový záběr",
      src: "https://images.unsplash.com/photo-1614289371518-722f2615943d?w=600&q=80",
      span: "small",
    },
  ],
  palette: [
    { name: "Hluboká zelená", hex: "#1C2E25", role: "Hlavní" },
    { name: "Krémová", hex: "#E8DFC8", role: "Světlý akcent" },
    { name: "Zlatavá", hex: "#C9A84C", role: "Detail" },
    { name: "Antracit", hex: "#2A2A2A", role: "Neutrál" },
    { name: "Bílá plátna", hex: "#F5F3EE", role: "Pozadí" },
  ],
};

export default function VizualniBoardPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0E0E0E", color: "#F0EDE6", fontFamily: "'Inter', sans-serif", padding: "48px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#A8EB12", marginBottom: 8 }}>
              Vizuální board
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "#F0EDE6" }}>{client.name}</h1>
            <p style={{ fontSize: 14, color: "#888", marginTop: 6 }}>{client.subtitle}</p>
          </div>
          <div style={{
            background: "#161616",
            border: "1px solid #2a2a2a",
            borderRadius: 16,
            padding: "16px 24px",
            textAlign: "center",
            minWidth: 100,
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#A8EB12", lineHeight: 1 }}>{client.brandScore}</div>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#666", marginTop: 6, textTransform: "uppercase" }}>Brand skóre</div>
          </div>
        </div>

        {/* Shot grid – block 1 */}
        <ShotBlock shots={client.shots.slice(0, 3)} />

        {/* Palette */}
        <div style={{ margin: "36px 0" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 16 }}>
            Barevná paleta
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {client.palette.map((c) => (
              <div key={c.hex} style={{ flex: "1 1 120px" }}>
                <div style={{
                  width: "100%",
                  height: 64,
                  borderRadius: 12,
                  background: c.hex,
                  border: "1px solid rgba(255,255,255,0.06)",
                  marginBottom: 8,
                }} />
                <div style={{ fontSize: 12, color: "#ccc", fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{c.hex} · {c.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Shot grid – block 2 */}
        <ShotBlock shots={client.shots.slice(3, 6)} />

        {/* Footer note */}
        <div style={{
          marginTop: 48,
          borderTop: "1px solid #1f1f1f",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <p style={{ fontSize: 12, color: "#444", margin: 0 }}>
            Tento board je interní dokument studia · Lucifera Studio 2026
          </p>
          <span style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#A8EB12",
            background: "rgba(168,235,18,0.08)",
            padding: "4px 12px",
            borderRadius: 20,
          }}>
            Ke schválení
          </span>
        </div>
      </div>
    </div>
  );
}

function ShotBlock({ shots }: { shots: typeof client.shots }) {
  const [main, ...rest] = shots;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "340px 240px", gap: 12, marginBottom: 12 }}>
      {/* Main shot */}
      <div style={{ gridRow: "1 / 3", position: "relative", borderRadius: 20, overflow: "hidden", background: "#1a1a1a" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main.src} alt={main.label} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)",
        }} />
        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", margin: 0 }}>
            {main.label}
          </p>
        </div>
        {main.outfit && (
          <div style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
            padding: "6px 14px", borderRadius: 20,
            fontSize: 12, color: "#F0EDE6", fontWeight: 500,
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
            {main.outfit}
          </div>
        )}
      </div>

      {/* Small shots */}
      {rest.map((shot) => (
        <div key={shot.id} style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "#1a1a1a" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shot.src} alt={shot.label} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
          <div style={{
            position: "absolute", inset: 0,
            background: shot.quote
              ? "linear-gradient(to top, rgba(10,30,18,0.85) 0%, rgba(10,30,18,0.4) 100%)"
              : "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)",
          }} />
          <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
            {shot.quote && (
              <p style={{ fontSize: 18, fontStyle: "italic", color: "#F0EDE6", margin: "0 0 4px 0" }}>
                &ldquo;{shot.quote}&rdquo;
              </p>
            )}
            <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", margin: 0 }}>
              {shot.label}
            </p>
          </div>
          {shot.outfit && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
              padding: "4px 12px", borderRadius: 20,
              fontSize: 11, color: "#F0EDE6",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              {shot.outfit}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
