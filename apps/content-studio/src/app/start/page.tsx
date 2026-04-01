'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DiagnostikaDemo from '@/components/DiagnostikaDemo'

const COLLECTIONS = [
  { hex: '#4A6FA5', label: 'Byznys',      style: 'K02' },
  { hex: '#E8E4DC', label: 'Minimální',   style: 'K03' },
  { hex: '#E8B4B8', label: 'Jemná',       style: 'K04' },
  { hex: '#2C2C2C', label: 'Výrazná',     style: 'K05' },
  { hex: '#8B7355', label: 'Přirozená',   style: 'K06' },
  { hex: '#4A9B8E', label: 'Lifestyle',   style: 'K09' },
]


type Photo = {
  id: string
  name: string
  thumbnailUrl: string | null
  webViewLink: string | null
  subfolder: string | null
}

export default function StartPage() {
  const router = useRouter()
  const [selectedStyle, setSelectedStyle] = useState<string>('K04')
  const [webUrl, setWebUrl] = useState('')
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [gridPhotos, setGridPhotos] = useState<Photo[]>([])
  const [gridLoading, setGridLoading] = useState(false)
  const [collectionThumbs, setCollectionThumbs] = useState<Record<string, string>>({})

  useEffect(() => {
    setMounted(true)
    loadCollection('K04', COLLECTIONS[2].hex)
    COLLECTIONS.forEach((c) => {
      fetch(`/api/client/visual-bank?limit=1&style=${c.style}`)
        .then((r) => r.json())
        .then((data) => {
          const first = data?.files?.[0]
          if (first?.thumbnailUrl) {
            setCollectionThumbs((prev) => ({ ...prev, [c.style]: first.thumbnailUrl }))
          }
        })
        .catch(() => {})
    })
  }, [])

  async function loadCollection(style: string, hex: string) {
    setGridLoading(true)
    setSelectedStyle(style)
    try {
      const res = await fetch(`/api/client/visual-bank?limit=6&style=${style}`)
      const data = await res.json()
      setGridPhotos(data?.files ?? [])
    } catch {
      setGridPhotos([])
    } finally {
      setGridLoading(false)
    }
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

  const activeCollection = COLLECTIONS.find((c) => c.style === selectedStyle)

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .start-page {
          min-height: 100vh;
          background: #ffffff;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #111;
        }

        /* HEADER */
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

        .start-header-nav { display: flex; align-items: center; gap: 24px; }

        .start-header-link {
          font-size: 14px;
          color: #555;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .start-header-link:hover { color: #111; }

        .start-header-cta {
          font-size: 14px;
          color: #111;
          font-weight: 500;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
        }

        /* HERO */
        .start-hero {
          width: 100%;
          padding: 120px 80px 80px;
          background: #ffffff;
        }

        .start-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }

        .start-hero-left {
          max-width: 520px;
        }

        .start-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 5vw, 4rem);
          font-weight: 600;
          line-height: 1.15;
          color: #111;
        }

        .start-subtitle {
          font-size: 18px;
          color: #555;
          line-height: 1.6;
          margin-top: 24px;
        }

        .start-glass-card {
          margin-top: 32px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid #e8e4dc;
          border-radius: 20px;
          padding: 28px 32px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
        }

        .start-input-row { display: flex; gap: 10px; }

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
          background: #b7e94c;
          color: #111;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: background 150ms;
        }
        .start-analyze-btn:hover { background: #a0d63a; }

        .start-checklist {
          display: flex;
          gap: 16px;
          margin-top: 16px;
          font-size: 12px;
          color: #5a7a00;
          flex-wrap: wrap;
        }

        .start-microcopy { margin-top: 12px; font-size: 12px; color: #aaa; }

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
        .start-secondary-link:hover { color: #5a7a00; }

        /* PRAVÝ SLOUPEC */
        .start-hero-right { position: relative; }

        /* MOCK BROWSER */
        .start-browser-mock {
          border-radius: 14px;
          border: 1px solid #e8e4dc;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          background: #ffffff;
        }

        .start-browser-bar {
          background: #f5f5f5;
          padding: 10px 16px;
          border-bottom: 1px solid #e8e4dc;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .start-browser-dots { display: flex; gap: 6px; }

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

        /* OBSAH MOCK BROWSERU */
        .start-mock-content {
          background: #ffffff;
          padding: 22px 24px 20px;
        }

        /* Score karta */
        .start-mock-score-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin-bottom: 20px;
        }

        .start-mock-score-num {
          font-family: 'Playfair Display', serif;
          font-size: 44px;
          font-weight: 600;
          color: #111;
          line-height: 1;
        }

        .start-mock-score-right {
          padding-bottom: 4px;
        }

        .start-mock-score-label {
          font-size: 11px;
          color: #888;
          margin-bottom: 2px;
        }

        .start-mock-score-sub {
          font-size: 12px;
          color: #5a7a00;
          font-weight: 500;
        }

        /* Pilíře */
        .start-mock-pillars {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-bottom: 18px;
        }

        .start-mock-pillar-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .start-mock-pillar-label {
          font-size: 11px;
          color: #555;
          width: 96px;
          flex-shrink: 0;
        }

        .start-mock-pillar-bar-bg {
          flex: 1;
          height: 6px;
          background: #f0ede8;
          border-radius: 3px;
          overflow: hidden;
        }

        .start-mock-pillar-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 600ms ease;
        }

        .start-mock-pillar-score {
          font-size: 11px;
          font-weight: 600;
          width: 28px;
          text-align: right;
          flex-shrink: 0;
        }

        /* Brand DNA */
        .start-mock-dna {
          border-top: 0.5px solid #e8e4dc;
          padding-top: 14px;
          font-size: 11px;
          color: #888;
        }

        .start-mock-dna-value {
          font-size: 12px;
          color: #111;
          font-weight: 500;
          margin-top: 3px;
        }

        /* LEVITUJÍCÍ KARTY */
        @keyframes float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .start-float-card {
          position: absolute;
          background: white;
          border-radius: 10px;
          padding: 8px 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          font-family: 'DM Sans', sans-serif;
          animation: float 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 10;
          white-space: nowrap;
        }

        .start-float-card-label { font-size: 10px; color: #aaa; margin-bottom: 2px; }
        .start-float-card-value { font-size: 15px; font-weight: 600; color: #111; line-height: 1.2; }

        /* PALETA */
        .start-palette-section {
          width: 100%;
          padding: 64px 48px 32px;
          text-align: center;
          background: #ffffff;
        }

        .start-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 600;
          color: #111;
          text-align: center;
        }

        .start-section-sub { font-size: 14px; color: #888; margin-top: 8px; }

        .start-color-row {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 28px;
          flex-wrap: wrap;
        }

        .start-color-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          cursor: pointer;
        }

        .start-color-dot {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          transition: box-shadow 150ms, transform 150ms;
        }
        .start-color-dot:hover { transform: scale(1.1); }
        .start-color-label { font-size: 10px; color: #888; white-space: nowrap; }

        /* KOLOTOČ */
        .start-carousel-wrap {
          width: 100%;
          padding: 24px 48px 0;
          overflow: hidden;
          background: #ffffff;
        }

        .start-carousel {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding-bottom: 8px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .start-carousel::-webkit-scrollbar { display: none; }

        .start-carousel-card {
          flex-shrink: 0;
          width: 120px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          transition: transform 150ms;
          border: 2px solid transparent;
        }
        .start-carousel-card:hover { transform: scale(1.03); }
        .start-carousel-card.active { border-color: #111; }

        .start-carousel-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
        }

        .start-carousel-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 4px 8px;
          font-size: 10px;
          font-weight: 500;
          color: white;
          background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%);
          font-family: 'DM Sans', sans-serif;
        }

        /* GRID */
        .start-grid-section {
          width: 100%;
          padding: 24px 48px 80px;
          background: #ffffff;
        }

        .start-visual-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          transition: opacity 200ms ease;
        }

        .start-grid-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          aspect-ratio: 4/5;
          transition: transform 200ms;
          background: #f0ede8;
        }
        .start-grid-card:hover { transform: scale(1.02); }

        .start-grid-img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .start-grid-label {
          position: absolute;
          bottom: 10px;
          left: 10px;
          font-size: 10px;
          background: rgba(255,255,255,0.85);
          padding: 3px 8px;
          border-radius: 5px;
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
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
        }

        .start-grid-placeholder {
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #f0ede8 25%, #e8e4dc 50%, #f0ede8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 1024px) {
          .start-hero { padding: 80px 48px 60px; }
          .start-hero-inner { gap: 48px; }
        }

        @media (max-width: 768px) {
          .start-header { padding: 14px 20px; }
          .start-hero { padding: 60px 20px 40px; }
          .start-hero-inner {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .start-hero-left { max-width: 100%; }
          .start-float-card { display: none; }
          .start-palette-section { padding: 40px 20px 20px; }
          .start-carousel-wrap { padding: 16px 20px 0; }
          .start-grid-section { padding: 16px 20px 60px; }
          .start-visual-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div
        className="start-page"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 400ms ease' }}
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
          <div className="start-hero-inner">
          {/* Levý sloupec */}
          <div className="start-hero-left">
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

          {/* Pravý sloupec — DiagnostikaDemo */}
          <div className="start-hero-right">
            <DiagnostikaDemo />
          </div>
          </div>
        </section>

        {/* BAREVNÁ PALETA — nadpis + kroužky + carousel v jedné sekci */}
        <section className="start-palette-section">
          <h2 className="start-section-title">Takhle může tvoje značka působit</h2>
          <p className="start-section-sub">
            Vyber styl — a uvidíš reálné fotky z dané kolekce
          </p>

          <div className="start-color-row">
            {COLLECTIONS.map((c) => (
              <div
                key={c.style}
                className="start-color-item"
                onClick={() => loadCollection(c.style, c.hex)}
              >
                <div
                  className="start-color-dot"
                  style={{
                    background: c.hex,
                    border: c.hex === '#E8E4DC' ? '1px solid #d0ccc4' : 'none',
                    boxShadow: selectedStyle === c.style
                      ? '0 0 0 3px white, 0 0 0 5px #111'
                      : 'none',
                  }}
                />
                <span className="start-color-label">{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* KOLOTOČ KOLEKCÍ — miniatury s fotkami */}
        <div className="start-carousel-wrap">
          <div className="start-carousel">
            {COLLECTIONS.map((c) => {
              const thumb = collectionThumbs[c.style]
              return (
                <div
                  key={c.style}
                  className={`start-carousel-card${selectedStyle === c.style ? ' active' : ''}`}
                  onClick={() => loadCollection(c.style, c.hex)}
                >
                  <div
                    className="start-carousel-bg"
                    style={{
                      backgroundColor: c.hex,
                      backgroundImage: thumb ? `url(${thumb})` : undefined,
                    }}
                  />
                  <span className="start-carousel-label">{c.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* VIZUÁLNÍ GRID */}
        <section className="start-grid-section">
          <div
            className="start-visual-grid"
            style={{ opacity: gridLoading ? 0.5 : 1 }}
          >
            {gridPhotos.length > 0
              ? gridPhotos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className="start-grid-card"
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => router.push('/client/magnet/rtg/onboarding')}
                  >
                    {photo.thumbnailUrl ? (
                      <img
                        src={photo.thumbnailUrl}
                        alt={photo.subfolder ?? activeCollection?.label ?? ''}
                        className="start-grid-img"
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: activeCollection?.hex ?? '#e8e4dc' }} />
                    )}
                    <span className="start-grid-label">{activeCollection?.label ?? ''}</span>
                    <div
                      className="start-grid-overlay"
                      style={{ opacity: hoveredCard === i ? 1 : 0 }}
                    >
                      <button className="start-grid-overlay-btn">
                        Vytvořit příspěvek →
                      </button>
                    </div>
                  </div>
                ))
              : Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="start-grid-card">
                    <div className="start-grid-placeholder" />
                  </div>
                ))}
          </div>
        </section>
      </div>
    </div>
  )
}
