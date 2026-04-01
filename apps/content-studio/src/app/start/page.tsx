'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const COLORS = [
  { hex: '#E8B4B8', label: 'Teplá' },
  { hex: '#F5F0E8', label: 'Luxusní' },
  { hex: '#E8E8E0', label: 'Minimal' },
  { hex: '#B8D4C8', label: 'Fresh' },
  { hex: '#2C2C2C', label: 'Bold' },
  { hex: '#D4B896', label: 'Zemitá' },
  { hex: '#A8C4D4', label: 'Klidná' },
  { hex: '#E8D4B8', label: 'Jemná' },
]

const GRID_ITEMS = [
  { label: 'Teplá', color: '#E8B4B8' },
  { label: 'Luxusní', color: '#F5F0E8' },
  { label: 'Minimal', color: '#E8E8E0' },
  { label: 'Fresh', color: '#B8D4C8' },
  { label: 'Bold', color: '#2C2C2C' },
  { label: 'Zemitá', color: '#D4B896' },
]

export default function StartPage() {
  const router = useRouter()
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [bgTint, setBgTint] = useState<string>('transparent')
  const [webUrl, setWebUrl] = useState('')
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  function handleColorSelect(hex: string) {
    setSelectedColor(hex)
    setBgTint(hex + '0f')
  }

  function handleAnalyze() {
    const url = webUrl.trim()
    if (!url) return
    const withProtocol = url.startsWith('http') ? url : 'https://' + url
    router.push('/brand-scan?url=' + encodeURIComponent(withProtocol))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAnalyze()
  }

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .start-page {
          min-height: 100vh;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .start-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 0.5px solid #e8e4dc;
          padding: 16px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .start-header-logo {
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.12em;
          color: #111;
        }

        .start-header-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .start-header-link {
          font-size: 14px;
          color: #555;
          text-decoration: none;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
        }

        .start-header-link:hover { color: #111; }

        .start-header-cta {
          font-size: 14px;
          color: #111;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
        }

        .start-hero {
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 48px 64px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        .start-h1 {
          font-family: 'Playfair Display', serif;
          font-size: 52px;
          font-weight: 600;
          line-height: 1.15;
          color: #111;
        }

        .start-subtitle {
          font-size: 17px;
          color: #666;
          line-height: 1.6;
          margin-top: 16px;
        }

        .start-glass-card {
          margin-top: 32px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 20px;
          padding: 28px;
        }

        .start-input-row {
          display: flex;
          gap: 10px;
        }

        .start-url-input {
          flex: 1;
          border: 1px solid #e8e4dc;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          color: #111;
          background: white;
          outline: none;
          transition: border-color 150ms;
        }

        .start-url-input:focus { border-color: #b7e94c; }
        .start-url-input::placeholder { color: #bbb; }

        .start-analyze-btn {
          background: #111;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: background 150ms;
        }

        .start-analyze-btn:hover { background: #333; }

        .start-checklist {
          display: flex;
          gap: 16px;
          margin-top: 16px;
          font-size: 12px;
          color: #888;
          flex-wrap: wrap;
        }

        .start-microcopy {
          margin-top: 12px;
          font-size: 12px;
          color: #aaa;
        }

        .start-secondary-link {
          display: inline-block;
          margin-top: 16px;
          font-size: 13px;
          color: #888;
          text-decoration: underline;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
        }

        .start-secondary-link:hover { color: #555; }

        .start-browser-mock {
          border-radius: 12px;
          border: 1px solid #e8e4dc;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          position: relative;
        }

        .start-browser-bar {
          background: #f5f5f5;
          padding: 10px 16px;
          border-bottom: 1px solid #e8e4dc;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .start-browser-dots {
          display: flex;
          gap: 6px;
        }

        .start-browser-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .start-browser-url {
          font-size: 12px;
          color: #888;
          font-family: 'DM Sans', sans-serif;
        }

        .start-browser-content {
          background: white;
          padding: 20px;
          min-height: 280px;
          position: relative;
        }

        .start-browser-lines {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .start-browser-line {
          height: 10px;
          border-radius: 4px;
          background: #f0f0f0;
        }

        .start-overlay-card {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: white;
          border-radius: 10px;
          padding: 12px 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          min-width: 180px;
        }

        .start-overlay-label {
          font-size: 11px;
          color: #888;
          margin-bottom: 4px;
        }

        .start-overlay-score {
          font-size: 18px;
          font-weight: 600;
          color: #e05a5a;
          line-height: 1.2;
        }

        .start-overlay-hint {
          font-size: 11px;
          color: #888;
          margin-top: 6px;
        }

        .start-palette-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 64px 48px;
          text-align: center;
        }

        .start-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 600;
          color: #111;
        }

        .start-section-sub {
          font-size: 14px;
          color: #888;
          margin-top: 8px;
        }

        .start-color-row {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .start-color-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .start-color-dot {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: box-shadow 150ms, transform 150ms;
        }

        .start-color-dot:hover { transform: scale(1.1); }

        .start-color-label {
          font-size: 10px;
          color: #888;
        }

        .start-grid-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 48px 80px;
        }

        .start-visual-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .start-grid-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          aspect-ratio: 4/5;
          transition: transform 200ms;
        }

        .start-grid-card:hover { transform: scale(1.02); }

        .start-grid-bg {
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
        }

        .start-grid-label {
          position: absolute;
          bottom: 12px;
          left: 12px;
          font-size: 11px;
          background: rgba(255,255,255,0.85);
          padding: 4px 10px;
          border-radius: 6px;
          color: #333;
          font-family: 'DM Sans', sans-serif;
        }

        .start-grid-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 200ms;
        }

        .start-grid-overlay-btn {
          background: white;
          color: #111;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .start-header { padding: 14px 20px; }
          .start-hero {
            grid-template-columns: 1fr;
            padding: 48px 20px 40px;
            gap: 32px;
          }
          .start-h1 { font-size: 36px; }
          .start-browser-mock { display: none; }
          .start-palette-section { padding: 40px 20px; }
          .start-grid-section { padding: 0 20px 60px; }
          .start-visual-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div
        className="start-page"
        style={{
          backgroundColor: bgTint !== 'transparent' ? bgTint : '#ffffff',
          transition: 'background-color 300ms ease, opacity 400ms ease',
          opacity: mounted ? 1 : 0,
        }}
      >
        {/* HEADER */}
        <header className="start-header">
          <span className="start-header-logo">LUCIFERA</span>
          <nav className="start-header-nav">
            <button className="start-header-link">Jak to funguje</button>
            <button
              className="start-header-cta"
              onClick={() => router.push('/client/pristup')}
            >
              Přihlásit se →
            </button>
          </nav>
        </header>

        {/* HERO */}
        <section className="start-hero">
          {/* Levý sloupec */}
          <div>
            <h1 className="start-h1">
              Poznej svou značku<br />
              během minut.
            </h1>
            <p className="start-subtitle">
              Zadej web — nebo začni tvořit rovnou.<br />
              Ukážeme ti, co funguje. A co tě brzdí.
            </p>

            <div className="start-glass-card">
              <div className="start-input-row">
                <input
                  type="url"
                  className="start-url-input"
                  placeholder="např. lucifera.cz"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="start-analyze-btn" onClick={handleAnalyze}>
                  Spustit analýzu →
                </button>
              </div>

              <div className="start-checklist">
                <span>✓ Screenshot webu</span>
                <span>✓ Analýza textu</span>
                <span>✓ Brand DNA</span>
                <span>✓ Skóre značky</span>
              </div>

              <p className="start-microcopy">
                Zdarma · Bez registrace · Výsledek během minuty
              </p>

              <button
                className="start-secondary-link"
                onClick={() => router.push('/client/magnet/rtg/onboarding')}
              >
                nebo začni bez analýzy →
              </button>
            </div>
          </div>

          {/* Pravý sloupec — mock browser */}
          <div className="start-browser-mock">
            <div className="start-browser-bar">
              <div className="start-browser-dots">
                <div className="start-browser-dot" style={{ background: '#FF5F57' }} />
                <div className="start-browser-dot" style={{ background: '#FFBD2E' }} />
                <div className="start-browser-dot" style={{ background: '#28C840' }} />
              </div>
              <span className="start-browser-url">studiolucifera.cz</span>
            </div>

            <div className="start-browser-content">
              <div className="start-browser-lines">
                {/* Simulace hero sekce */}
                <div className="start-browser-line" style={{ width: '60%', height: 14, background: '#e8e4dc' }} />
                <div className="start-browser-line" style={{ width: '80%' }} />
                <div className="start-browser-line" style={{ width: '70%' }} />
                <div style={{ height: 12 }} />
                <div className="start-browser-line" style={{ width: '45%' }} />
                <div className="start-browser-line" style={{ width: '55%' }} />
                <div style={{ height: 12 }} />
                {/* Simulace obrázků */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, height: 80, borderRadius: 6, background: '#f0ede8' }} />
                  <div style={{ flex: 1, height: 80, borderRadius: 6, background: '#ebe8e2' }} />
                  <div style={{ flex: 1, height: 80, borderRadius: 6, background: '#f5f2ed' }} />
                </div>
                <div style={{ height: 12 }} />
                <div className="start-browser-line" style={{ width: '50%' }} />
                <div className="start-browser-line" style={{ width: '65%' }} />
              </div>

              {/* Overlay karta */}
              <div className="start-overlay-card">
                <div className="start-overlay-label">Nejslabší místo</div>
                <div className="start-overlay-score">Důvěra · 4/10</div>
                <div className="start-overlay-hint">AI doporučení připraveno →</div>
              </div>
            </div>
          </div>
        </section>

        {/* BAREVNÁ PALETA */}
        <section className="start-palette-section">
          <h2 className="start-section-title">Takhle může tvoje značka působit</h2>
          <p className="start-section-sub">
            Vyber tón — a uvidíš jak může vypadat tvůj obsah
          </p>

          <div className="start-color-row">
            {COLORS.map((c) => (
              <div
                key={c.hex}
                className="start-color-item"
                onClick={() => handleColorSelect(c.hex)}
              >
                <div
                  className="start-color-dot"
                  style={{
                    background: c.hex,
                    border: c.hex === '#F5F0E8' || c.hex === '#E8E8E0' || c.hex === '#E8D4B8'
                      ? '1px solid #e0ddd8'
                      : 'none',
                    boxShadow: selectedColor === c.hex
                      ? '0 0 0 3px white, 0 0 0 5px #111'
                      : 'none',
                  }}
                />
                <span className="start-color-label">{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* VIZUÁLNÍ GRID */}
        <section className="start-grid-section">
          <div className="start-visual-grid">
            {GRID_ITEMS.map((item, i) => (
              <div
                key={i}
                className="start-grid-card"
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => router.push('/client/magnet/rtg/onboarding')}
              >
                {/* Barevné pozadí jako placeholder */}
                <div
                  className="start-grid-bg"
                  style={{ background: item.color }}
                />

                {/* Dekorativní prvky simulující obsah */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{
                    height: 10,
                    borderRadius: 4,
                    background: item.color === '#2C2C2C'
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.1)',
                    width: '70%',
                  }} />
                  <div style={{
                    height: 8,
                    borderRadius: 4,
                    background: item.color === '#2C2C2C'
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(0,0,0,0.07)',
                    width: '50%',
                  }} />
                  <div style={{
                    height: 8,
                    borderRadius: 4,
                    background: item.color === '#2C2C2C'
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(0,0,0,0.07)',
                    width: '60%',
                  }} />
                </div>

                <span className="start-grid-label">{item.label}</span>

                {/* Hover overlay */}
                <div
                  className="start-grid-overlay"
                  style={{ opacity: hoveredCard === i ? 1 : 0 }}
                >
                  <button className="start-grid-overlay-btn">
                    Vytvořit příspěvek →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
