'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DiagnostikaDemo from '@/components/DiagnostikaDemo'

const PALETTE = [
  '#F5F0E8', '#E8E0D0', '#D4C4A8', '#C8B49C', '#B8A090',
  '#A8C4D4', '#7BAFC4', '#4A9B8E', '#6BAF9E', '#8DC4A8',
  '#E8B4B8', '#D4889C', '#C46880', '#E8C4A0', '#D4A870',
  '#C49050', '#A87840', '#2C2C2C', '#4A4A4A', '#888880',
  '#B7E94C', '#8BC43C', '#F0E84C', '#E8C43C',
]

const HEX_TO_STYLE: Record<string, string> = {
  '#A8C4D4': 'K02', '#4A9B8E': 'K09', '#E8B4B8': 'K04',
  '#2C2C2C': 'K05', '#A87840': 'K06', '#E8E0D0': 'K03',
}

type Photo = {
  id: string
  name: string
  thumbnailUrl: string | null
  webViewLink: string | null
  subfolder: string | null
}

export default function StartPage() {
  const router = useRouter()
  const [webUrl, setWebUrl] = useState('')
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [gridPhotos, setGridPhotos] = useState<Photo[]>([])
  const [gridLoading, setGridLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState('transparent')
  const fetchRef = useRef(0)

  useEffect(() => {
    setMounted(true)
    loadPhotos()
  }, [])

  async function loadPhotos() {
    const id = ++fetchRef.current
    setGridLoading(true)
    try {
      const res = await fetch('/api/client/visual-bank?limit=16')
      const data = await res.json()
      if (id !== fetchRef.current) return
      setGridPhotos(data?.files ?? [])
    } catch {
      if (id === fetchRef.current) setGridPhotos([])
    } finally {
      if (id === fetchRef.current) setGridLoading(false)
    }
  }

  function handleColorClick(hex: string) {
    setSelectedColor(hex)
    setBgColor(hex + '10')

    const style = HEX_TO_STYLE[hex] || ''
    const url = style
      ? `/api/client/visual-bank?limit=16&style=${style}`
      : '/api/client/visual-bank?limit=16'
    const id = ++fetchRef.current
    setGridLoading(true)
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (id !== fetchRef.current) return
        setGridPhotos(data?.files ?? [])
        setGridLoading(false)
      })
      .catch(() => {
        if (id === fetchRef.current) setGridLoading(false)
      })
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

        /* PALETTE ROW — celá šířka, zalomení do více řad */
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

        /* GRID — 8 sloupců, 2 řádky, celá šířka */
        .start-visual-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 6px;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          padding: 24px 0 0;
          transition: opacity 0.5s ease;
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
          .start-hero-inner {
            grid-template-columns: 1fr;
            gap: 40px;
          }
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

        {/* HERO — pozadí se mění s výběrem barvy */}
        <section
          className="start-hero"
          style={{ backgroundColor: bgColor }}
        >
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
              <DiagnostikaDemo hideHeader hideFooter />
            </div>
          </div>
        </section>

        {/* PALETA + GRID */}
        <section
          className="start-gallery-section"
          style={{ backgroundColor: bgColor }}
        >
          <div className="start-gallery-inner">
            <h2 className="start-section-title">Takhle může tvoje značka působit</h2>
            <p className="start-section-sub">
              Vyber barvu — a nech se inspirovat
            </p>
          </div>

          {/* Palette row — celá šířka, zalamuje */}
          <div className="start-palette-row">
            {PALETTE.map((hex) => (
              <div
                key={hex}
                className={`start-palette-dot${selectedColor === hex ? ' active' : ''}`}
                style={{ background: hex }}
                onClick={() => handleColorClick(hex)}
              />
            ))}
          </div>

          {/* Foto grid — 8 sloupců, 2 řádky, celá šířka */}
          <div
            className="start-visual-grid"
            style={{ opacity: gridLoading ? 0.4 : 1 }}
          >
            {gridPhotos.length > 0
              ? gridPhotos.slice(0, 16).map((photo, i) => (
                  <div
                    key={photo.id}
                    className="start-grid-card"
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => router.push('/client/magnet/rtg/onboarding')}
                  >
                    {photo.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.thumbnailUrl}
                        alt=""
                        className="start-grid-img"
                      />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '3/4', background: '#e8e4dc' }} />
                    )}
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
