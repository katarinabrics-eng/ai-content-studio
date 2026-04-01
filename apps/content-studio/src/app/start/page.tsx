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

const HERO_VARIANTS = [
  {
    h1a: 'Vypadá to dobře.',
    h1b: 'Ale něco nesedí.',
    sub: 'Z toho co dáváš ven není jasné co děláš, pro koho to je a proč by si tě měl někdo vybrat.',
    cta: null,
  },
  {
    h1a: 'Nechceš to řešit.',
    h1b: 'Chceš rovnou tvořit.',
    sub: 'Tady máš obsah který můžeš vzít a použít. Bez přemýšlení. Bez začátků od nuly.',
    cta: 'Přejít do vizuální knihovny →',
  },
  {
    h1a: 'Tady je tvůj stock.',
    h1b: 'Připravený k použití.',
    sub: '247 vizuálů v 7 kolekcích. Vyber styl — a začni tvořit rovnou.',
    cta: 'Přejít do vizuální knihovny →',
  },
  {
    h1a: 'Naplánováno.',
    h1b: 'Celý měsíc.',
    sub: 'Obsah rozmístěný na týdny dopředu. Ty jen schvaluješ a jdeš dál.',
    cta: 'Přejít do vizuální knihovny →',
  },
  {
    h1a: 'Obsah je hotový.',
    h1b: 'Stačí ho vzít.',
    sub: 'Text, vizuál, hashtagy. Připraveno pro Instagram, Reels i Stories.',
    cta: 'Přejít do vizuální knihovny →',
  },
  {
    h1a: 'Tvoje značka',
    h1b: 'má směr.',
    sub: 'Brand DNA, skóre 74/100, 5 pilířů. Víš co funguje a co opravit.',
    cta: 'Spustit diagnostiku →',
  },
]

const SLIDES = [
  { visual: 'diagnostika' },
  { visual: 'approval' },
  { visual: 'library' },
  { visual: 'calendar' },
  { visual: 'post' },
  { visual: 'brand' },
]

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

  // Animovaný hero — crossfade bez blikání
  const [slideIndex, setSlideIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const heroVariant = slideIndex

  function startInterval() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setSlideIndex(i => (i + 1) % 6)
    }, 4000)
  }

  function goToSlide(i: number) {
    setSlideIndex(i)
    startInterval()
  }

  useEffect(() => {
    setMounted(true)
    loadCollections()
    startInterval()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function scrollToLibrary() {
    document.getElementById('vizualni-knihovna')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');

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
          font-size: 14px; color: #555; cursor: pointer;
          background: none; border: none; font-family: 'DM Sans', sans-serif;
        }
        .start-header-link:hover { color: #111; }
        .start-header-cta {
          font-size: 14px; color: #111; font-weight: 500; cursor: pointer;
          background: none; border: none; font-family: 'DM Sans', sans-serif;
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
        .start-hero-left { max-width: 460px; }

        /* TEXT CROSSFADE — wrapper fixná výška */
        .hero-text-outer {
          position: relative;
          min-height: 200px;
        }
        .hero-text-variant {
          position: absolute;
          top: 0; left: 0; width: 100%;
          transition: opacity 0.8s ease;
          pointer-events: none;
        }
        .hero-text-variant.active {
          opacity: 1;
          pointer-events: auto;
        }
        .hero-text-variant.inactive {
          opacity: 0;
        }

        .start-h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
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
          flex: 1; border: 1px solid #e8e4dc; border-radius: 10px;
          padding: 12px 16px; font-size: 15px; font-family: 'DM Sans', sans-serif;
          color: #111; background: white; outline: none; transition: border-color 150ms;
        }
        .start-url-input:focus { border-color: #b7e94c; }
        .start-url-input::placeholder { color: #bbb; }
        .start-analyze-btn {
          background: #b7e94c; color: #111; border: none;
          padding: 12px 24px; border-radius: 10px; font-size: 14px;
          font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; white-space: nowrap; transition: background 150ms;
        }
        .start-analyze-btn:hover { background: #a0d63a; }
        .start-checklist {
          display: flex; gap: 16px; margin-top: 16px;
          font-size: 12px; color: #5a7a00; flex-wrap: wrap;
        }
        .start-microcopy { margin-top: 12px; font-size: 12px; color: #aaa; }
        .start-secondary-link {
          display: inline-block; margin-top: 16px; font-size: 13px;
          color: #888; text-decoration: underline; cursor: pointer;
          background: none; border: none; font-family: 'DM Sans', sans-serif; padding: 0;
        }
        .start-secondary-link:hover { color: #5a7a00; }

        /* CTA pre variant 1 */
        .start-library-cta {
          display: inline-block;
          margin-top: 32px;
          background: #b7e94c;
          color: #111;
          border: none;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 150ms;
        }
        .start-library-cta:hover { background: #a0d63a; }

        /* PRAVÝ SLOUPEC */
        .start-hero-right {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* SLIDE CROSSFADE WRAPPER */
        .slides-outer {
          position: relative;
          width: 100%;
          min-height: 420px;
        }

        .slide-item {
          position: absolute;
          top: 0; left: 0; width: 100%;
          transition: opacity 1s ease;
          pointer-events: none;
        }
        .slide-item.active {
          opacity: 1;
          pointer-events: auto;
        }
        .slide-item.inactive {
          opacity: 0;
        }

        /* MOCK A/B KARTY */
        .ab-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .ab-card {
          border: 1.5px solid #e8e4dc;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 200ms, box-shadow 200ms;
          background: white;
        }
        .ab-card:hover, .ab-card.selected {
          border-color: #b7e94c;
          box-shadow: 0 0 0 3px rgba(183,233,76,0.2);
        }
        .ab-card-img {
          width: 100%;
          aspect-ratio: 9/16;
          object-fit: cover;
          display: block;
        }
        .ab-card-label {
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #888;
          text-align: center;
        }
        .ab-approve-btn {
          width: 100%;
          background: #b7e94c;
          color: #111;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 150ms;
        }
        .ab-approve-btn:hover { background: #a0d63a; }

        /* READY BANNER */
        .ready-banner {
          background: #f5fbea;
          border: 1.5px solid #b7e94c;
          border-radius: 20px;
          padding: 48px 32px;
          text-align: center;
        }
        .ready-banner-icon { font-size: 48px; margin-bottom: 16px; }
        .ready-banner-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #111;
          margin-bottom: 8px;
        }
        .ready-banner-sub { font-size: 14px; color: #666; margin-bottom: 24px; }
        .ready-banner-btn {
          background: #111;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
        }

        /* SLIDE DOTS */
        .slide-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 20px;
        }
        .slide-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0ddd8;
          cursor: pointer;
          transition: background 200ms, transform 200ms;
          border: none;
          padding: 0;
        }
        .slide-dot.active {
          background: #b7e94c;
          transform: scale(1.3);
        }

        /* GALERIE SEKCE */
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
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(2rem, 3vw, 2.8rem);
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

        /* PALETTE */
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
          width: 32px; height: 32px; border-radius: 50%;
          flex-shrink: 0; cursor: pointer;
          transition: box-shadow 150ms, transform 150ms;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .start-palette-dot:hover { transform: scale(1.15); }
        .start-palette-dot.active { box-shadow: 0 0 0 2px white, 0 0 0 4px #111; }

        .start-collection-label {
          text-align: center; margin-top: 12px;
          font-size: 13px; color: #888; min-height: 20px;
        }

        /* GRID */
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
          position: relative; border-radius: 4px;
          overflow: hidden; cursor: pointer; background: #f0ede8;
        }
        .start-grid-img {
          width: 100%; aspect-ratio: 3/4;
          object-fit: cover; display: block; border-radius: 4px;
        }
        .start-grid-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.38);
          display: flex; align-items: center; justify-content: center;
          transition: opacity 200ms; border-radius: 4px;
        }
        .start-grid-overlay-btn {
          background: white; color: #111; border: none;
          padding: 8px 14px; border-radius: 8px; font-size: 12px;
          font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer;
        }
        .start-grid-placeholder {
          width: 100%; aspect-ratio: 3/4; border-radius: 4px;
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

            {/* LEVÝ SLOUPEC — crossfade text */}
            <div className="start-hero-left">
              <div className="hero-text-outer">
                {HERO_VARIANTS.map((v, i) => (
                  <div
                    key={i}
                    className={`hero-text-variant ${heroVariant === i ? 'active' : 'inactive'}`}
                  >
                    <h1 className="start-h1">
                      {v.h1a}<br />{v.h1b}
                    </h1>
                    <p className="start-subtitle">{v.sub}</p>
                  </div>
                ))}
              </div>

              {/* Varianta 0: input karta */}
              {heroVariant === 0 && (
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
              )}

              {/* Varianty 1–4: CTA do knihovny, varianta 5: diagnostika */}
              {heroVariant >= 1 && heroVariant <= 4 && (
                <button className="start-library-cta" onClick={scrollToLibrary}>
                  Přejít do vizuální knihovny →
                </button>
              )}
              {heroVariant === 5 && (
                <button className="start-library-cta" onClick={handleAnalyze}>
                  Spustit diagnostiku →
                </button>
              )}
            </div>

            {/* PRAVÝ SLOUPEC — crossfade slides */}
            <div className="start-hero-right">
              <div className="slides-outer">

                {/* Slide 0: DiagnostikaDemo */}
                <div className={`slide-item ${slideIndex === 0 ? 'active' : 'inactive'}`}>
                  <DiagnostikaDemo hideHeader hideFooter />
                </div>

                {/* Slide 1: Mock A/B karty */}
                <div className={`slide-item ${slideIndex === 1 ? 'active' : 'inactive'}`}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#888', marginBottom: '12px' }}>
                    KOL 04 · VARIANTA A vs B
                  </div>
                  <div className="ab-cards">
                    <div className="ab-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/demo/demo-video-a.jpg" alt="Varianta A" className="ab-card-img" />
                      <div className="ab-card-label">VIDEO A</div>
                    </div>
                    <div className="ab-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/demo/demo-video-b.jpg" alt="Varianta B" className="ab-card-img" />
                      <div className="ab-card-label">VIDEO B</div>
                    </div>
                  </div>
                  <button className="ab-approve-btn" onClick={() => router.push('/client/magnet/rtg/onboarding')}>
                    Schválit vybranou →
                  </button>
                </div>

                {/* Slide 2: RTG dashboard — Ke schválení (mock) */}
                <div className={`slide-item ${slideIndex === 2 ? 'active' : 'inactive'}`}>
                  <div style={{ background: '#f5f3ee', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e8e4dc' }}>
                    {/* mini header */}
                    <div style={{ background: 'white', borderBottom: '0.5px solid #e8e4dc', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#888' }}>ready-to-go · klientský portál</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>Veronika Novotná</span>
                    </div>
                    {/* mini tabs */}
                    <div style={{ background: 'white', borderBottom: '0.5px solid #e8e4dc', padding: '0 14px', display: 'flex', gap: '16px' }}>
                      {['Ke schválení', 'Plánování', 'Vizuální knihovna'].map((t, i) => (
                        <div key={t} style={{ fontSize: '11px', padding: '8px 0', color: i === 0 ? '#111' : '#aaa', borderBottom: i === 0 ? '2px solid #111' : '2px solid transparent', cursor: 'pointer' }}>{t}</div>
                      ))}
                    </div>
                    {/* obsah */}
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>Ke schválení tento týden</span>
                        <span style={{ fontSize: '11px', color: '#aaa' }}>2 / 10</span>
                      </div>
                      {/* 2 VIDEO karty */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        {[
                          { src: '/images/demo/demo-video-a.jpg', label: 'VIDEO · REELS', title: '"Ráno. Okno. Ticho před dnem."', sub: 'Storytelling · přirozený moment', tag: 'Varianta A' },
                          { src: '/images/demo/demo-video-b.jpg', label: 'VIDEO · REELS', title: '"Tohle ti nikdo neřekne."', sub: 'Hook přímý · osobní tón', tag: 'Varianta B' },
                        ].map((card, i) => (
                          <div key={i} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e4dc', overflow: 'hidden' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={card.src} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                            <div style={{ padding: '8px' }}>
                              <div style={{ fontSize: '9px', color: '#b7e94c', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '3px' }}>{card.label}</div>
                              <div style={{ fontSize: '11px', fontWeight: 600, color: '#111', marginBottom: '2px', lineHeight: 1.3 }}>{card.title}</div>
                              <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px' }}>{card.sub}</div>
                              <span style={{ fontSize: '9px', padding: '2px 6px', background: '#f5f3ee', borderRadius: '4px', color: '#666' }}>{card.tag}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* 2 GRAFIKA karty — jen fotky */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {['/images/demo/demo-grafika-a.jpg', '/images/demo/demo-grafika-b.jpg'].map((src, i) => (
                          <div key={i} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e4dc', overflow: 'hidden' }}>
                            <div style={{ padding: '5px 8px', fontSize: '9px', fontWeight: 600, color: '#5a7a00', letterSpacing: '0.06em' }}>□ GRAFIKA</div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide 3: Kalendář */}
                <div className={`slide-item ${slideIndex === 3 ? 'active' : 'inactive'}`}>
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8e4dc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>Duben 2026</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#e8f4f8', color: '#2d7dd2' }}>Instagram</span>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#e8f0e8', color: '#2d7d2d' }}>Facebook</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', fontSize: '10px' }}>
                      {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => (
                        <div key={d} style={{ textAlign: 'center', color: '#aaa', padding: '4px 0', fontWeight: 500 }}>{d}</div>
                      ))}
                      {[
                        { d: 1, e: null }, { d: 2, e: 'Reels' }, { d: 3, e: null }, { d: 4, e: 'Grafika' }, { d: 5, e: null }, { d: 6, e: null }, { d: 7, e: 'Stories' },
                        { d: 8, e: null }, { d: 9, e: 'Post' }, { d: 10, e: null }, { d: 11, e: 'Reels' }, { d: 12, e: null }, { d: 13, e: null }, { d: 14, e: 'Carousel' },
                        { d: 15, e: 'Grafika' }, { d: 16, e: null }, { d: 17, e: null }, { d: 18, e: 'Reels' }, { d: 19, e: null }, { d: 20, e: null }, { d: 21, e: 'Stories' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          textAlign: 'center', padding: '3px 1px', borderRadius: '4px',
                          background: item.e ? '#f3fbdc' : 'transparent',
                          border: item.e ? '0.5px solid rgba(183,233,76,0.4)' : 'none',
                        }}>
                          <div style={{ color: '#111', fontWeight: item.e ? 500 : 400 }}>{item.d}</div>
                          {item.e && <div style={{ fontSize: '8px', color: '#5a7a00', marginTop: '1px' }}>{item.e}</div>}
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '11px', color: '#888', marginTop: '8px', textAlign: 'center' }}>
                      12 příspěvků naplánováno · 3 ke schválení
                    </p>
                  </div>
                </div>

                {/* Slide 4: Hotový příspěvek */}
                <div className={`slide-item ${slideIndex === 4 ? 'active' : 'inactive'}`}>
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8e4dc' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/demo/demo-grafika-a.jpg" alt="" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: '#b7e94c', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>GRAFIKA · INSTAGRAM</div>
                        <p style={{ fontSize: '12px', fontWeight: 500, color: '#111', marginBottom: '6px', lineHeight: 1.4 }}>&ldquo;Ráno. Okno. Ticho před dnem.&rdquo;</p>
                        <p style={{ fontSize: '11px', color: '#666', lineHeight: 1.5, marginBottom: '8px' }}>Každé ráno si říkám — dneska to zvládnu. A pak přijde ten moment.</p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', background: '#b7e94c', border: 'none', fontWeight: 500, cursor: 'pointer' }}>Použít →</button>
                          <button style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>Upravit</button>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f5f3ee', borderRadius: '8px', fontSize: '11px', color: '#888' }}>
                      #osobnirozvoj #mindset #rannirutina #zivotniStyl
                    </div>
                  </div>
                </div>

                {/* Slide 5: Brand DNA */}
                <div className={`slide-item ${slideIndex === 5 ? 'active' : 'inactive'}`}>
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8e4dc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>INDEX ZNAČKY</div>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: '#111', lineHeight: 1 }}>74</div>
                        <div style={{ fontSize: '11px', color: '#5a7a00' }}>↑ Nad průměrem oboru</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>BRAND DNA</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-end' }}>
                          {['Soft feminine', 'Klidná', 'Pečující', 'Estetická'].map(t => (
                            <span key={t} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#f3fbdc', border: '0.5px solid rgba(183,233,76,0.4)', color: '#5a7a00' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {[
                      { name: 'Hodnota', score: 8, color: '#b7e94c' },
                      { name: 'Pozice', score: 7, color: '#b7e94c' },
                      { name: 'Architektura', score: 8, color: '#b7e94c' },
                      { name: 'Identita', score: 9, color: '#b7e94c' },
                      { name: 'Důvěra', score: 4, color: '#e05a5a' },
                    ].map(p => (
                      <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ width: '80px', fontSize: '11px', color: '#555' }}>{p.name}</div>
                        <div style={{ flex: 1, height: '4px', background: '#f0ece4', borderRadius: '2px' }}>
                          <div style={{ width: `${p.score * 10}%`, height: '4px', background: p.color, borderRadius: '2px' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: p.color, fontWeight: 500, width: '28px' }}>{p.score}/10</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>{/* /slides-outer */}

              {/* DOTS — 6 slides */}
              <div className="slide-dots">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    className={`slide-dot${slideIndex === i ? ' active' : ''}`}
                    onClick={() => goToSlide(i)}
                  />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* VIZUÁLNÍ KNIHOVNA */}
        <section
          id="vizualni-knihovna"
          className="start-gallery-section"
          style={{ backgroundColor: bgColor }}
        >
          <div className="start-gallery-inner">
            <h2 className="start-section-title">Vyber styl. Začni tvořit.</h2>
            <p className="start-section-sub">Klikni na barvu — uvidíš obsah který sedí tvé náladě.</p>
          </div>

          {/* Kroužky */}
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
