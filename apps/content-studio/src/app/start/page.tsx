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

const ROTATING_SENTENCES = [
  "Tvoříš. Ale zákazník neví proč jít za tebou.",
  "Máš jasno. Chceš rovnou tvořit.",
  "Web máš. Výsledky chybí.",
  "Nechceš řešit strategii. Chceš výsledek.",
  "Vypadá to dobře. Ale něco nesedí.",
  "Obsah potřebuješ teď. Ne za týden.",
]

const K04_PHOTOS = [
  '/placeholders/stock-vizualni knihovna/K04/k04-001.jpeg',
  '/placeholders/stock-vizualni knihovna/K04/k04-002.jpeg',
  '/placeholders/stock-vizualni knihovna/K04/k04-003.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-004.jpeg',
  '/placeholders/stock-vizualni knihovna/K04/k04-005.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-006.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-007.jpeg',
  '/placeholders/stock-vizualni knihovna/K04/k04-008.png',
]

export default function StartPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [activePhotos, setActivePhotos] = useState<string[]>([])
  const [gridLoading, setGridLoading] = useState(true)
  const [selectedHex, setSelectedHex] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState('transparent')
  const fetchRef = useRef(0)

  // Typewriter
  const [displayText, setDisplayText] = useState('')
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Slides
  const [activeSlide, setActiveSlide] = useState(0)
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startSlideInterval() {
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current)
    slideIntervalRef.current = setInterval(() => {
      setActiveSlide(i => (i + 1) % 6)
    }, 6000)
  }

  function goToSlide(i: number) {
    setActiveSlide(i)
    startSlideInterval()
  }

  // Typewriter effect
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const currentSentence = ROTATING_SENTENCES[sentenceIndex]

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, 2500)
      return () => clearTimeout(timeout)
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false)
        setSentenceIndex(i => (i + 1) % ROTATING_SENTENCES.length)
        return
      }
      timeout = setTimeout(() => {
        setDisplayText(t => t.slice(0, -1))
      }, 30)
    } else {
      if (displayText.length === currentSentence.length) {
        setIsPaused(true)
        return
      }
      timeout = setTimeout(() => {
        setDisplayText(currentSentence.slice(0, displayText.length + 1))
      }, 50)
    }

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, isPaused, sentenceIndex])

  useEffect(() => {
    setMounted(true)
    loadCollections()
    startSlideInterval()
    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current)
    }
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
          min-height: 100vh;
          display: flex;
          align-items: center;
          width: 100%;
          padding: 80px 0;
        }
        .start-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          width: 100%;
        }
        .start-hero-left { max-width: 480px; }

        /* TYPEWRITER */
        .typewriter-block {
          min-height: 120px;
          overflow: hidden;
        }
        .typewriter-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(1.8rem, 2.8vw, 2.4rem);
          font-weight: 700;
          color: #111;
          line-height: 1.3;
        }
        .typewriter-cursor {
          display: inline-block;
          width: 2px;
          height: 1.1em;
          background: #111;
          margin-left: 3px;
          vertical-align: text-bottom;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* PEVNÝ PODTEXT */
        .hero-subtitle {
          margin-top: 24px;
          font-size: 16px;
          color: #555;
          line-height: 1.7;
        }

        /* CTA BLOK */
        .hero-cta-block {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .hero-cta-primary {
          background: #111;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 150ms;
        }
        .hero-cta-primary:hover { background: #333; }
        .hero-cta-secondary {
          margin-top: 12px;
          font-size: 14px;
          color: #888;
          text-decoration: underline;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
        }
        .hero-cta-secondary:hover { color: #555; }

        /* PRAVÝ SLOUPEC */
        .start-hero-right {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* SLIDES WRAPPER */
        .slides-outer {
          position: relative;
          width: 100%;
          height: 480px;
          overflow: hidden;
        }
        .slide-item {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transition: opacity 1.2s ease;
          pointer-events: none;
        }
        .slide-item.active {
          opacity: 1;
          pointer-events: auto;
        }
        .slide-item.inactive { opacity: 0; }

        /* BROWSER WINDOW */
        .browser-window {
          background: white;
          border-radius: 12px;
          border: 1px solid #e8e4dc;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .browser-bar {
          background: #f5f5f5;
          padding: 10px 16px;
          border-bottom: 1px solid #e8e4dc;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .browser-dot {
          width: 10px; height: 10px; border-radius: 50%;
          display: inline-block; flex-shrink: 0;
        }
        .browser-content {
          flex: 1;
          overflow: hidden;
          padding: 14px;
        }

        /* AB KARTY */
        .ab-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }
        .ab-card {
          border: 1.5px solid #e8e4dc;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 200ms;
          background: white;
        }
        .ab-card:hover { border-color: #b7e94c; }
        .ab-card-img {
          width: 100%;
          max-height: 200px;
          aspect-ratio: 9/16;
          object-fit: cover;
          display: block;
        }
        .ab-card-label {
          padding: 6px 10px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #888;
          text-align: center;
        }
        .ab-approve-btn {
          width: 100%;
          background: #b7e94c;
          color: #111;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 150ms;
        }
        .ab-approve-btn:hover { background: #a0d63a; }

        /* DOTS NAVIGACE */
        .slide-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 16px;
          align-items: center;
        }
        .slide-dot {
          height: 8px;
          width: 8px;
          border-radius: 4px;
          background: #e8e4dc;
          cursor: pointer;
          transition: width 300ms ease, background 300ms ease;
          border: none;
          padding: 0;
        }
        .slide-dot.active {
          background: #111;
          width: 20px;
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
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.4rem, 4vw, 3.6rem);
          font-weight: 700;
          color: #111;
          text-align: center;
          line-height: 1.2;
        }
        .start-section-sub {
          font-size: 16px;
          color: #888;
          margin-top: 12px;
          text-align: center;
          line-height: 1.6;
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
          .start-hero-inner { gap: 48px; padding: 0 48px; }
          .start-visual-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 768px) {
          .start-header { padding: 14px 20px; }
          .start-hero { min-height: auto; padding: 60px 0 40px; }
          .start-hero-inner { grid-template-columns: 1fr; gap: 40px; padding: 0 20px; }
          .start-hero-left { max-width: 100%; }
          .slides-outer { height: 360px; }
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
        <section className="start-hero">
          <div className="start-hero-inner">

            {/* LEVÝ SLOUPEC */}
            <div className="start-hero-left">

              {/* 1. Typewriter */}
              <div className="typewriter-block">
                <span className="typewriter-text">
                  {displayText}
                  <span className="typewriter-cursor" />
                </span>
              </div>

              {/* 2. Pevný podtext */}
              <p className="hero-subtitle">
                Hybridní tvorba pod lidským dohledem.<br />
                AI + profesionální fotografie + tvůj výběr.<br />
                Vizuální obsah na míru tvé značce.
              </p>

              {/* 3. CTA blok */}
              <div className="hero-cta-block">
                <button
                  className="hero-cta-primary"
                  onClick={() => router.push('/brand-scan')}
                >
                  Zjisti, kde ti unikají klienti →
                </button>
                <button
                  className="hero-cta-secondary"
                  onClick={() => router.push('/client/magnet/rtg/onboarding')}
                >
                  nebo začni tvořit rovnou →
                </button>
              </div>
            </div>

            {/* PRAVÝ SLOUPEC */}
            <div className="start-hero-right">
              <div className="slides-outer">

                {/* Slide 0: DiagnostikaDemo */}
                <div className={`slide-item ${activeSlide === 0 ? 'active' : 'inactive'}`}>
                  <DiagnostikaDemo hideHeader hideFooter />
                </div>

                {/* Slide 1: A/B schvalování */}
                <div className={`slide-item ${activeSlide === 1 ? 'active' : 'inactive'}`}>
                  <div className="browser-window">
                    <div className="browser-bar">
                      <span className="browser-dot" style={{ background: '#ff5f57' }} />
                      <span className="browser-dot" style={{ background: '#ffbd2e' }} />
                      <span className="browser-dot" style={{ background: '#28ca41' }} />
                      <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px', flex: 1 }}>ready-to-go · klientský portál</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>Veronika Novotná</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px', overflow: 'hidden' }}>
                      <div style={{ fontSize: '11px', color: '#9a9a90', marginBottom: '10px' }}>KE SCHVÁLENÍ · VARIANTA A vs B</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1, minHeight: 0 }}>

                        {/* Karta A */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#fff', border: '2px solid #111', borderRadius: '12px', padding: '12px', overflow: 'hidden' }}>
                          <div style={{ flexShrink: 0, width: '80px', aspectRatio: '9/16', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                            <video autoPlay muted loop playsInline poster="/images/demo/demo-video-a.jpg"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                              <source src="/images/demo/demo-video-a.mp4" type="video/mp4" />
                            </video>
                            <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '8px', padding: '1px 5px', borderRadius: '10px' }}>▶ 15s · Reels</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '9px', fontWeight: 600, color: '#b7e94c', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>VIDEO · Reels</div>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '4px' }}>&ldquo;Ráno. Okno. Ticho před dnem.&rdquo;</p>
                            <p style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>Storytelling · přirozený moment</p>
                            <div style={{ fontSize: '10px', color: '#555', background: '#f5f3ee', borderRadius: '4px', padding: '5px 7px', lineHeight: 1.5 }}>Každé ráno si říkám – dneska to zvládnu...</div>
                            <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                              <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', background: '#f0f0f0', color: '#666' }}>Varianta A</span>
                              <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', background: '#f0f0f0', color: '#666' }}>Instagram</span>
                            </div>
                          </div>
                        </div>

                        {/* Karta B */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#fff', border: '1px solid #e8e4dc', borderRadius: '12px', padding: '12px', overflow: 'hidden' }}>
                          <div style={{ flexShrink: 0, width: '80px', aspectRatio: '9/16', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                            <video autoPlay muted loop playsInline poster="/images/demo/demo-video-b.jpg"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                              <source src="/images/demo/demo-video-b.mp4" type="video/mp4" />
                            </video>
                            <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '8px', padding: '1px 5px', borderRadius: '10px' }}>▶ 12s · Reels</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '9px', fontWeight: 600, color: '#b7e94c', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>VIDEO · Reels</div>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '4px' }}>&ldquo;Tohle ti nikdo neřekne.&rdquo;</p>
                            <p style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>Hook přímý · osobní tón</p>
                            <div style={{ fontSize: '10px', color: '#555', background: '#f5f3ee', borderRadius: '4px', padding: '5px 7px', lineHeight: 1.5 }}>Strávila jsem hodiny přemýšlením co postovat...</div>
                            <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                              <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', background: '#f0f0f0', color: '#666' }}>Varianta B</span>
                              <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', background: '#f0f0f0', color: '#666' }}>Instagram</span>
                            </div>
                          </div>
                        </div>

                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8e8e4', flexShrink: 0 }}>
                        <div style={{ fontSize: '11px', color: '#9a9a90' }}>Klikni na variantu → schval</div>
                        <button style={{ background: '#b7e94c', color: '#111', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Schválit vybranou →</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide 2: Vizuální knihovna grid */}
                <div className={`slide-item ${activeSlide === 2 ? 'active' : 'inactive'}`}>
                  <div className="browser-window">
                    <div className="browser-bar">
                      <span className="browser-dot" style={{ background: '#ff5f57' }} />
                      <span className="browser-dot" style={{ background: '#ffbd2e' }} />
                      <span className="browser-dot" style={{ background: '#28ca41' }} />
                      <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px', flex: 1 }}>Vizuální knihovna</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {['#E8B4B8', '#E8E4DC', '#4A9B8E', '#2C2C2C', '#8B7355'].map(hex => (
                          <div key={hex} style={{ width: 14, height: 14, borderRadius: '50%', background: hex, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                        ))}
                      </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', flex: 1, minHeight: 0 }}>
                        {K04_PHOTOS.map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', display: 'block' }} />
                        ))}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '10px', flexShrink: 0 }}>
                        247 vizuálů · AI + profesionální fotografie · tvůj výběr
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide 3: Kalendář */}
                <div className={`slide-item ${activeSlide === 3 ? 'active' : 'inactive'}`}>
                  <div className="browser-window">
                    <div className="browser-bar">
                      <span className="browser-dot" style={{ background: '#ff5f57' }} />
                      <span className="browser-dot" style={{ background: '#ffbd2e' }} />
                      <span className="browser-dot" style={{ background: '#28ca41' }} />
                      <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px', flex: 1 }}>Duben 2026</span>
                      <span style={{ fontSize: '11px', color: '#5a7a00', fontWeight: 500 }}>+ Naplánovat</span>
                    </div>
                    <div style={{ flex: 1, padding: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexShrink: 0 }}>
                        {['Instagram', 'Facebook', 'LinkedIn'].map((s, i) => (
                          <span key={s} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', background: i === 0 ? '#f3fbdc' : '#f5f5f5', color: i === 0 ? '#5a7a00' : '#888', border: i === 0 ? '0.5px solid rgba(183,233,76,0.4)' : '0.5px solid #e8e4dc' }}>{s}</span>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px', fontSize: '11px', flex: 1 }}>
                        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => (
                          <div key={d} style={{ textAlign: 'center', color: '#aaa', padding: '5px 0', fontWeight: 500 }}>{d}</div>
                        ))}
                        {[
                          { d: 1, e: null }, { d: 2, e: 'Reels' }, { d: 3, e: null }, { d: 4, e: 'Grafika' }, { d: 5, e: null }, { d: 6, e: null }, { d: 7, e: 'Stories' },
                          { d: 8, e: null }, { d: 9, e: 'Newsletter' }, { d: 10, e: null }, { d: 11, e: 'Reels' }, { d: 12, e: null }, { d: 13, e: null }, { d: 14, e: 'Carousel' },
                          { d: 15, e: 'Grafika' }, { d: 16, e: null }, { d: 17, e: null }, { d: 18, e: 'Reels' }, { d: 19, e: null }, { d: 20, e: null }, { d: 21, e: 'Stories' },
                        ].map((item, i) => (
                          <div key={i} style={{
                            textAlign: 'center', padding: '4px 2px', borderRadius: '5px',
                            background: item.e ? '#f3fbdc' : 'transparent',
                            border: item.e ? '0.5px solid rgba(183,233,76,0.4)' : 'none',
                          }}>
                            <div style={{ color: '#111', fontWeight: item.e ? 600 : 400, fontSize: '11px' }}>{item.d}</div>
                            {item.e && <div style={{ fontSize: '9px', color: '#5a7a00', marginTop: '2px' }}>{item.e}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide 4: Hotový příspěvek */}
                <div className={`slide-item ${activeSlide === 4 ? 'active' : 'inactive'}`}>
                  <div className="browser-window">
                    <div className="browser-bar">
                      <span className="browser-dot" style={{ background: '#ff5f57' }} />
                      <span className="browser-dot" style={{ background: '#ffbd2e' }} />
                      <span className="browser-dot" style={{ background: '#28ca41' }} />
                      <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>Hotový příspěvek</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
                        <div style={{ width: '180px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/images/demo/demo-grafika-a.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: '#b7e94c', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>GRAFIKA · INSTAGRAM</div>
                          <p style={{ fontSize: '16px', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '8px' }}>&ldquo;Ráno. Okno. Ticho před dnem.&rdquo;</p>
                          <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, marginBottom: '12px' }}>
                            Každé ráno si říkám — dneska to zvládnu. A pak přijde ten moment, kdy všechno zpomalí.
                          </p>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
                            #osobnirozvoj #mindset #rannirutina #zivotniStyl
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '8px', background: '#b7e94c', border: 'none', fontWeight: 500, cursor: 'pointer' }}>Použít →</button>
                            <button style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '8px', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>Upravit</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide 5: Brand DNA */}
                <div className={`slide-item ${activeSlide === 5 ? 'active' : 'inactive'}`}>
                  <div className="browser-window">
                    <div className="browser-bar">
                      <span className="browser-dot" style={{ background: '#ff5f57' }} />
                      <span className="browser-dot" style={{ background: '#ffbd2e' }} />
                      <span className="browser-dot" style={{ background: '#28ca41' }} />
                      <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>Brand DNA · diagnostika</span>
                    </div>
                    <div style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                          <div style={{ fontSize: '48px', fontWeight: 700, color: '#111', lineHeight: 1 }}>74</div>
                          <div style={{ fontSize: '13px', color: '#888', margin: '5px 0 3px' }}>Index značky</div>
                          <div style={{ fontSize: '13px', color: '#5a7a00', fontWeight: 500 }}>↑ Nad průměrem oboru</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                          {['Soft feminine', 'Klidná', 'Pečující', 'Estetická'].map(t => (
                            <span key={t} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', background: '#f3fbdc', border: '0.5px solid rgba(183,233,76,0.4)', color: '#5a7a00' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      {[
                        { name: 'Hodnota', score: 8, color: '#b7e94c' },
                        { name: 'Pozice', score: 7, color: '#b7e94c' },
                        { name: 'Architektura', score: 8, color: '#b7e94c' },
                        { name: 'Identita', score: 9, color: '#b7e94c' },
                        { name: 'Důvěra', score: 4, color: '#e05a5a' },
                      ].map(p => (
                        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <div style={{ width: '90px', fontSize: '13px', color: '#555' }}>{p.name}</div>
                          <div style={{ flex: 1, height: '6px', background: '#f0ece4', borderRadius: '3px' }}>
                            <div style={{ width: `${p.score * 10}%`, height: '6px', background: p.color, borderRadius: '3px' }} />
                          </div>
                          <div style={{ fontSize: '12px', color: p.color === '#e05a5a' ? '#e05a5a' : '#5a7a00', fontWeight: 600, width: '32px' }}>{p.score}/10</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>{/* /slides-outer */}

              {/* DOTS */}
              <div className="slide-dots">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    className={`slide-dot${activeSlide === i ? ' active' : ''}`}
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
            <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 48 }}>
              <h2 className="start-section-title">Vyber styl. Začni tvořit.</h2>
              <p className="start-section-sub">Klikni na barvu — uvidíš obsah který sedí tvé náladě.</p>
            </div>
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
