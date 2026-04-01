'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DiagnostikaDemo from '@/components/DiagnostikaDemo'

type Collection = {
  id: string
  label: string
  hex: string[]
  mood: string[]
  idealFor: string[]
  photos: string[]
  folder: string
}

export default function StartPage() {
  const router = useRouter()
  const [webUrl, setWebUrl] = useState('')
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [activePhotos, setActivePhotos] = useState<string[]>([])
  const [gridLoading, setGridLoading] = useState(true)
  const [selectedHex, setSelectedHex] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState('transparent')
  const fetchRef = useRef(0)

  useEffect(() => {
    setMounted(true)
    loadCollections()
  }, [])

  async function loadCollections() {
    const id = ++fetchRef.current
    setGridLoading(true)
    try {
      const res = await fetch('/api/landing/collections')
      const data = await res.json()
      if (id !== fetchRef.current) return
      const cols: Collection[] = data.collections ?? []
      setCollections(cols)
      // Zobraz fotky ze všech kolekcí dohromady (max 16)
      const all = cols.flatMap(c => c.photos).slice(0, 16)
      setActivePhotos(all)
    } catch {
      if (id === fetchRef.current) setActivePhotos([])
    } finally {
      if (id === fetchRef.current) setGridLoading(false)
    }
  }

  function handleDotClick(hex: string, col: Collection) {
    setSelectedHex(hex)
    setBgColor(hex + '18')
    setGridLoading(true)
    // Krátký fade — pak nové fotky
    setTimeout(() => {
      setActivePhotos(col.photos.slice(0, 16))
      setGridLoading(false)
    }, 250)
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
          background: #ffffff;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #111;
          overflow-x: hidden;
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
          transition: background-color 0.8s ease;
        }

        .start-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }

        .start-hero-left { max-width: 520px; }

        .start-h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 700;
          line-height: 1.1;
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

        .start-hero-right { position: relative; }

        /* PALETA + GRID SEKCE */
        .start-gallery-section {
          width: 100%;
          padding: 64px 0 80px;
          transition: background-color 0.8s ease;
        }

        .start-gallery-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }

        .start-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 600;
          color: #111;
          text-align: center;
        }

        .start-section-sub {
          font-size: 14px;
          color: #888;
          margin-top: 8px;
          text-align: center;
        }

        /* PALETTE — všechny hex ze všech kolekcí, celá šířka */
        .start-palette-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          margin-top: 28px;
          padding: 4px 24px;
          justify-content: center;
          flex-wrap: wrap;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
        }
        .start-palette-row::-webkit-scrollbar { display: none; }

        .start-palette-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
          cursor: pointer;
          transition: box-shadow 150ms, transform 150ms;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .start-palette-dot:hover { transform: scale(1.15); }
        .start-palette-dot.active {
          box-shadow: 0 0 0 2px white, 0 0 0 4px #111;
        }

        /* Kolekce label pod paletou */
        .start-collection-label {
          text-align: center;
          margin-top: 12px;
          font-size: 13px;
          color: #888;
          min-height: 20px;
          transition: opacity 300ms;
        }

        /* GRID — 8 sloupců, celá šířka */
        .start-visual-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 6px;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          padding: 24px 0 0;
          transition: opacity 0.4s ease;
        }

        .start-grid-card {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          background: #f0ede8;
        }

        .start-grid-img {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          display: block;
          border-radius: 4px;
        }

        .start-grid-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.38);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 200ms;
          border-radius: 4px;
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
          aspect-ratio: 3/4;
          border-radius: 4px;
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
          .start-visual-grid { grid-template-columns: repeat(4, 1fr); }
        }

        @media (max-width: 768px) {
          .start-header { padding: 14px 20px; }
          .start-hero { padding: 60px 20px 40px; }
          .start-hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .start-hero-left { max-width: 100%; }
          .start-gallery-section { padding: 40px 0 60px; }
          .start-gallery-inner { padding: 0 20px; }
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
        <section className="start-hero" style={{ backgroundColor: bgColor }}>
          <div className="start-hero-inner">
            <div className="start-hero-left">
              <h1 className="start-h1">
                Vypadá to dobře.<br />
                Ale něco nesedí.
              </h1>
              <p className="start-subtitle">
                Z toho, co dáváš ven, není úplně jasné co děláš,
                pro koho to je a proč by si tě měl někdo vybrat.
                Zadej svůj web — uvidíš to očima klienta.
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

            <div className="start-hero-right">
              <DiagnostikaDemo hideHeader hideFooter />
            </div>
          </div>
        </section>

        {/* MOST MEZI HERO A KNIHOVNOU */}
        <div style={{ textAlign: 'center', padding: '48px 0 0', maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontSize: '13px', color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            nebo
          </p>
          <p style={{ fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#111', marginBottom: '8px' }}>
            Nechceš to řešit. Chceš rovnou tvořit.
          </p>
          <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
            Tady máš obsah, který můžeš vzít a použít.<br />
            Bez přemýšlení. Bez začátků od nuly.
          </p>
        </div>

        {/* PALETA + GRID */}
        <section className="start-gallery-section" style={{ backgroundColor: bgColor }}>
          <div className="start-gallery-inner">
            <h2 className="start-section-title">Vyber styl. Začni tvořit.</h2>
            <p className="start-section-sub">Klikni na barvu — uvidíš obsah který sedí tvé náladě.</p>
          </div>

          {/* Kroužky ze všech kolekcí */}
          <div className="start-palette-row">
            {collections.map(col =>
              col.hex.map(hex => (
                <div
                  key={`${col.id}-${hex}`}
                  className={`start-palette-dot${selectedHex === hex ? ' active' : ''}`}
                  style={{ background: hex }}
                  title={col.label}
                  onClick={() => handleDotClick(hex, col)}
                />
              ))
            )}
          </div>

          {/* Aktivní kolekce label */}
          <div className="start-collection-label">
            {selectedHex
              ? collections.find(c => c.hex.includes(selectedHex))?.label ?? ''
              : 'Všechny styly'}
          </div>

          {/* Foto grid */}
          <div
            className="start-visual-grid"
            style={{ opacity: gridLoading ? 0.3 : 1 }}
          >
            {activePhotos.length > 0
              ? activePhotos.slice(0, 16).map((src, i) => (
                  <div
                    key={src}
                    className="start-grid-card"
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => router.push('/client/magnet/rtg/onboarding')}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="start-grid-img" />
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
              : Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="start-grid-placeholder" />
                ))}
          </div>
        </section>
      </div>
    </div>
  )
}
