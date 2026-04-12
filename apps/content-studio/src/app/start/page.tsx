'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DiagnostikaDemo from '@/components/DiagnostikaDemo'
import { StartAnalyzer } from './StartAnalyzer'
import type { VisualPhoto } from '@/lib/getVisualLibraryImages'

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
  "Nechceš řešit strategii.\nChceš výsledek.",
  "Tvoříš. Ale zákazník\nneví proč jít za tebou.",
  "Máš jasno.\nChceš rovnou tvořit.",
  "Web máš.\nVýsledky chybí.",
  "Vypadá to dobře.\nAle něco nesedí.",
  "Obsah potřebuješ\nteď. Ne za týden.",
]


const colorGroups = [
  { name: 'Teplá zemitá',      colors: ['#8B6F47','#A0845C','#C4A882','#6B4F35'] },
  { name: 'Chladná modrá',     colors: ['#4A6FA5','#5B7FBE','#3D5A8A','#6B9FD4'] },
  { name: 'Světlá neutrální',  colors: ['#D4C5B0','#E8DDD0','#F0E8DC','#BDB0A0'] },
  { name: 'Růžová',            colors: ['#E8A0A0','#D4787A','#F0C0C0','#C89090'] },
  { name: 'Černá a grafitová', colors: ['#1C1C1C','#2D2D2D','#404040','#555555'] },
  { name: 'Červená',           colors: ['#8B1A1A','#C0392B','#E74C3C','#922B21'] },
  { name: 'Zelená',            colors: ['#1B4D3E','#2E7D5E','#3DAA7D','#52C49A'] },
  { name: 'Tyrkysová',         colors: ['#0097A7','#00BCD4','#26C6DA','#4DD0E1'] },
  { name: 'Světlá bílá',       colors: ['#F5F2EC','#EDE8E0','#E5DFD5','#D8D0C5'] },
]

const K04_PHOTOS = [
  { src: '/placeholders/stock-vizualni knihovna/K04/k04-001.jpeg', label: 'Reels vibe',    liked: true  },
  { src: '/placeholders/stock-vizualni knihovna/K04/k04-002.jpeg', label: 'Feed lifestyle', liked: false },
  { src: '/placeholders/stock-vizualni knihovna/K04/k04-003.png',  label: 'Story moment',  liked: true  },
  { src: '/placeholders/stock-vizualni knihovna/K04/k04-004.jpeg', label: 'Carousel BG',   liked: false },
  { src: '/placeholders/stock-vizualni knihovna/K04/k04-005.png',  label: 'Quote post',    liked: false },
  { src: '/placeholders/stock-vizualni knihovna/K04/k04-006.png',  label: 'Reels vibe',    liked: true  },
  { src: '/placeholders/stock-vizualni knihovna/K04/k04-007.jpeg', label: 'Feed lifestyle', liked: false },
  { src: '/placeholders/stock-vizualni knihovna/K04/k04-008.png',  label: 'Story moment',  liked: true  },
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

  // Typewriter — hero
  const [displayText, setDisplayText] = useState('')
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Slides
  const [activeSlide, setActiveSlide] = useState(0)
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-rotate barev a fotek
  const [autoColorIndex, setAutoColorIndex] = useState(0)
  const autoColorRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Vizuální knihovna — slide 2
  const [visualPhotos, setVisualPhotos] = useState<VisualPhoto[]>(K04_PHOTOS)

  function startSlideInterval() {
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current)
    slideIntervalRef.current = setInterval(() => {
      setActiveSlide(i => (i + 1) % 6)
    }, 8000)
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
    fetch('/api/landing/visual-library')
      .then(r => r.json())
      .then(d => { if (d.photos?.length) setVisualPhotos(d.photos) })
      .catch(() => {})
    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-rotate spustit jakmile jsou načteny kolekce
  useEffect(() => {
    if (collections.length === 0) return
    autoColorRef.current = setInterval(() => {
      setAutoColorIndex(i => (i + 1) % collections.length)
    }, 3000)
    return () => { if (autoColorRef.current) clearInterval(autoColorRef.current) }
  }, [collections])

  // Reagovat na změnu autoColorIndex — přepnout barvu + fotky
  useEffect(() => {
    if (collections.length === 0) return
    const col = collections[autoColorIndex]
    if (!col) return
    const hex = col.hex?.[0]
    if (hex) {
      setSelectedHex(hex)
      setBgColor(hex + '18')
    }
    setGridLoading(true)
    setTimeout(() => {
      setActivePhotos(col.photos.slice(0, 16))
      setGridLoading(false)
    }, 380)
  }, [autoColorIndex, collections])

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
    // Zastav auto-rotate při manuálním výběru
    if (autoColorRef.current) clearInterval(autoColorRef.current)
    const idx = collections.indexOf(col)
    if (idx !== -1) setAutoColorIndex(idx)
    setSelectedHex(hex)
    setBgColor(hex + '18')
    setGridLoading(true)
    setTimeout(() => {
      setActivePhotos(col.photos.slice(0, 16))
      setGridLoading(false)
    }, 380)
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
          display: flex;
          align-items: center;
          width: 100%;
          padding: 120px 0 100px;
          min-height: 90vh;
        }
        .start-hero-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 80px;
          display: grid;
          grid-template-columns: 1fr 1.8fr;
          gap: 80px;
          align-items: center;
          width: 100%;
        }
        .start-hero-left { max-width: 560px; }

        /* TYPEWRITER */
        .typewriter-block {
          min-height: 160px;
          overflow: hidden;
        }
        .typewriter-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.4rem, 3.6vw, 3.4rem);
          font-weight: 700;
          color: #111;
          line-height: 1.25;
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

        /* GLASS FRAME — obal okna */
        .hero-slide-frame {
          width: 100%;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.78);
          border-radius: 18px;
          box-shadow:
            0 16px 48px rgba(0, 0, 0, 0.08),
            0 1px 0 rgba(255, 255, 255, 0.95) inset;
          padding: 10px;
        }

        /* SLIDES WRAPPER */
        .slides-outer {
          position: relative;
          width: 100%;
          height: 520px;
          overflow: hidden;
          border-radius: 10px;
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
          background: rgba(250, 249, 247, 0.97);
          border-radius: 10px;
          border: 1px solid rgba(232, 228, 220, 0.6);
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .browser-bar {
          background: rgba(245, 244, 242, 0.9);
          padding: 8px 14px;
          border-bottom: 1px solid rgba(232, 228, 220, 0.5);
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
        }
        .browser-dot {
          width: 9px; height: 9px; border-radius: 50%;
          display: inline-block; flex-shrink: 0;
        }
        .browser-content {
          flex: 1;
          overflow: hidden;
          padding: 12px;
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
          -webkit-overflow-scrolling: touch;
          margin-top: 28px;
          padding: 4px 24px;
          justify-content: center;
          flex-wrap: nowrap;
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
          transition: opacity 0.35s ease;
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
          .start-hero-inner { grid-template-columns: 1fr 1.4fr; gap: 40px; padding: 0 48px; }
          .slides-outer { height: 260px; }
          .start-visual-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 768px) {
          .start-header { padding: 14px 20px; }
          .start-hero { min-height: auto; padding: 60px 0 40px; }
          .start-hero-inner { grid-template-columns: 1fr; gap: 40px; padding: 0 20px; }
          .start-hero-left { max-width: 100%; }
          .hero-slide-frame { padding: 8px; border-radius: 14px; }
          .slides-outer { height: 280px; border-radius: 8px; }
          .start-gallery-section { padding: 40px 0 60px; }
          .start-gallery-inner { padding: 0 20px; }
          .start-visual-grid { grid-template-columns: repeat(2, 1fr); }
        }
        /* ===== RTG SEKCE ===== */
        .rtg-section-light { background: #fafaf7; padding: 96px 40px; }
        .rtg-section-light.alt { background: #fff; }
        .rtg-container { max-width: 1040px; margin: 0 auto; }
        .rtg-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
          text-transform: uppercase; color: #6b6b6b;
          display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
        }
        .rtg-eyebrow::before { content: ''; width: 24px; height: 2px; background: #b5d45c; border-radius: 2px; }
        .rtg-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 5vw, 54px);
          font-weight: 800; line-height: 1.08;
          letter-spacing: -0.025em; color: #111; margin-bottom: 48px;
        }
        .rtg-h2 em { font-style: italic; }
        /* Pipeline */
        .rtg-pipeline { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; position: relative; }
        .rtg-pipeline::before {
          content: ''; position: absolute;
          top: 36px; left: calc(16.66% + 28px); right: calc(16.66% + 28px);
          height: 2px;
          background: linear-gradient(to right, #b5d45c, rgba(181,212,92,0.3));
        }
        .rtg-pipe-step { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 24px; }
        .rtg-pipe-num {
          width: 72px; height: 72px; background: #111; color: #d0ec78;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800;
          margin-bottom: 20px; position: relative; z-index: 1;
          box-shadow: 0 0 0 8px #fff;
        }
        .rtg-pipe-step h3 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #111; }
        .rtg-pipe-step p { font-size: 14px; color: #6b6b6b; line-height: 1.6; }
        .rtg-step-tag {
          display: inline-block; background: #f3fbdc; border: 1px solid #dff09a;
          padding: 4px 14px; border-radius: 100px; font-size: 12px;
          color: #3a6b0e; font-weight: 500; margin-top: 12px;
        }
        /* Bento */
        .rtg-bento { display: grid; grid-template-columns: 1.4fr 1fr 1fr; grid-template-rows: auto auto; gap: 12px; }
        .rtg-bento-card {
          background: #fff; border: 1px solid #e8e8e4;
          border-radius: 16px; padding: 28px;
          overflow: hidden; position: relative;
        }
        .rtg-bento-card.featured { background: #111; border-color: transparent; grid-column: 1; grid-row: 1/3; }
        .rtg-bento-icon { font-size: 28px; margin-bottom: 16px; display: block; }
        .rtg-bento-card h3 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #111; }
        .rtg-bento-card.featured h3 { color: #fff; }
        .rtg-bento-card p { font-size: 14px; color: #6b6b6b; line-height: 1.6; }
        .rtg-bento-card.featured p { color: rgba(255,255,255,0.5); }
        .rtg-bento-stat { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 800; color: #d0ec78; line-height: 1; margin-bottom: 8px; }
        /* Deliverables */
        .rtg-deliver-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .rtg-deliver-item {
          background: #fff; border: 1px solid #e8e8e4;
          border-radius: 14px; padding: 28px 24px;
        }
        .rtg-d-check { width: 32px; height: 32px; background: #d0ec78; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; margin-bottom: 16px; font-weight: 700; }
        .rtg-deliver-item h3 { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .rtg-deliver-item p { font-size: 14px; color: #6b6b6b; line-height: 1.6; }
        /* Pricing */
        .rtg-pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; align-items: start; }
        .rtg-plan { background: #fff; border: 1px solid #e8e8e4; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
        .rtg-plan.featured { border-color: #111; border-width: 2px; }
        .rtg-plan-head { padding: 24px 24px 16px; border-bottom: 1px solid #e8e8e4; }
        .rtg-plan-badge { display: inline-block; background: #d0ec78; color: #111; font-size: 10px; font-weight: 700; padding: 3px 12px; border-radius: 100px; letter-spacing: 0.06em; margin-bottom: 12px; }
        .rtg-plan-name { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; margin-bottom: 4px; }
        .rtg-plan-tag { font-size: 13px; color: #6b6b6b; font-style: italic; }
        .rtg-plan-counts { display: flex; gap: 6px; flex-wrap: wrap; padding: 14px 24px; border-bottom: 1px solid #e8e8e4; }
        .rtg-count-pill { font-size: 11px; font-weight: 500; padding: 4px 12px; border-radius: 100px; }
        .rtg-count-pill.v { background: #dbeafe; color: #1d4ed8; }
        .rtg-count-pill.g { background: #dcfce7; color: #15803d; }
        .rtg-plan-features { padding: 18px 24px; list-style: none; display: flex; flex-direction: column; gap: 9px; flex: 1; }
        .rtg-plan-features li { font-size: 13px; color: #111; display: flex; gap: 10px; line-height: 1.5; align-items: flex-start; }
        .rtg-ck { color: #b5d45c; flex-shrink: 0; font-weight: 700; }
        .rtg-pl { color: #aaa; flex-shrink: 0; }
        /* Testimonial */
        .rtg-testimonial {
          background: #111; padding: 64px 40px;
          display: flex; align-items: center; gap: 48px;
          position: relative; overflow: hidden;
        }
        .rtg-testimonial::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% 50%, rgba(208,236,120,0.07), transparent 60%);
          pointer-events: none;
        }
        .rtg-quote-mark { font-family: 'Playfair Display', serif; font-size: 80px; color: #d0ec78; opacity: 0.3; line-height: 1; flex-shrink: 0; margin-top: -20px; }
        .rtg-testimonial-text { font-family: 'Playfair Display', serif; font-size: clamp(18px, 2.5vw, 26px); font-weight: 700; font-style: italic; color: #fff; line-height: 1.4; }
        .rtg-testimonial-author { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 12px; }
        /* CTA dark */
        .rtg-cta-dark {
          background: #111; padding: 120px 40px; text-align: center;
          position: relative; overflow: hidden;
        }
        .rtg-cta-dark::before {
          content: ''; position: absolute;
          top: -200px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 600px;
          background: radial-gradient(ellipse, rgba(208,236,120,0.1), transparent 70%);
          pointer-events: none;
        }
        .rtg-cta-h2 { font-family: 'Playfair Display', serif; font-size: clamp(32px, 5vw, 54px); font-weight: 800; line-height: 1.08; letter-spacing: -0.025em; color: #fff; margin-bottom: 16px; }
        .rtg-cta-h2 em { font-style: italic; color: #d0ec78; }
        .rtg-cta-p { color: rgba(255,255,255,0.5); font-size: 18px; font-weight: 300; max-width: 480px; margin: 0 auto 48px; line-height: 1.7; }
        .rtg-cta-actions { display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .rtg-btn-lime { display: inline-block; background: #d0ec78; color: #111; padding: 16px 40px; border-radius: 8px; font-size: 15px; font-weight: 600; text-decoration: none; border: none; cursor: pointer; }
        .rtg-btn-ghost { display: inline-block; color: rgba(255,255,255,0.5); font-size: 14px; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 1px; background: none; border-top: none; border-left: none; border-right: none; cursor: pointer; }
        .rtg-cta-note { font-size: 12px; color: rgba(255,255,255,0.25); margin-top: 20px; }
        /* RTG Tab switcher */
        .rtg-tab-active { border-bottom: 2px solid #111 !important; color: #111 !important; }
        @media (max-width: 768px) {
          .rtg-section-light { padding: 64px 20px; }
          .rtg-pipeline { grid-template-columns: 1fr; }
          .rtg-pipeline::before { display: none; }
          .rtg-bento { grid-template-columns: 1fr; }
          .rtg-bento-card.featured { grid-column: 1; grid-row: auto; }
          .rtg-deliver-grid, .rtg-pricing-grid { grid-template-columns: 1fr; }
          .rtg-testimonial { flex-direction: column; padding: 48px 20px; }
        }
      `}</style>

      <div
        className="start-page"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 400ms ease' }}
      >
        {/* HEADER */}
        <header className="start-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/placeholders/LUCIFERA-Logo-Left.png" alt="Lucifera" style={{ height: '32px', width: 'auto' }} />
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
                <span className="typewriter-text" style={{ whiteSpace: 'pre-line' }}>
                  {displayText}
                  <span className="typewriter-cursor" />
                </span>
              </div>

              {/* 2. Pevný podtext */}
              <p style={{ fontSize: '17px', color: '#666', lineHeight: 1.7, marginTop: '24px' }}>
                Generativní obsah + profesionální fotografie + tvůj výběr.<br />
                Vizuální obsah, který dává smysl. Bez zbytečného vymýšlení.
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
              <div className="hero-slide-frame">
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
                          <div style={{ flexShrink: 0, width: '110px', aspectRatio: '9/16', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
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
                          <div style={{ flexShrink: 0, width: '110px', aspectRatio: '9/16', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
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
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        {['#1a1a1a','#3a5fa0','#d0cdc7','#e08080','#6a5a48','#4a7a70','#b7e94c'].map((c, i) => (
                          <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: i === 6 ? '1.5px solid #b7e94c' : '1.5px solid transparent', cursor: 'pointer' }} />
                        ))}
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '5px', flex: 1, overflow: 'hidden' }}>
                        {visualPhotos.slice(0, 24).map((photo, i) => (
                          <div key={i} style={{ borderRadius: '7px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.src} alt={photo.label ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            {photo.liked && (
                              <div style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: 'rgba(215,45,45,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', lineHeight: 1 }}>♥</div>
                            )}
                            {photo.label && (
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.58))', padding: '12px 5px 4px', fontSize: 7, color: '#fff' }}>{photo.label}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center', flexShrink: 0 }}>
                        +500 vizuálů · AI + profesionální fotografie · tvůj výběr
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
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexShrink: 0 }}>
                        {['Instagram', 'Facebook', 'LinkedIn'].map((s, i) => (
                          <span key={s} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', background: i === 0 ? '#f3fbdc' : '#f5f5f5', color: i === 0 ? '#5a7a00' : '#888', border: i === 0 ? '0.5px solid rgba(183,233,76,0.4)' : '0.5px solid #e8e4dc' }}>{s}</span>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '4px', flexShrink: 0 }}>
                        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => (
                          <div key={d} style={{ textAlign: 'center', color: '#aaa', padding: '3px 0', fontWeight: 500, fontSize: '10px' }}>{d}</div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gridAutoRows: '88px', gap: '4px', flex: 1, overflow: 'hidden' }}>
                        {[
                          { d: 1,  e: null },
                          { d: 2,  e: 'Reels',      src: '/images/demo/demo-grafika-a.jpg', v: '2.1k', l: '184' },
                          { d: 3,  e: null },
                          { d: 4,  e: 'Grafika',    src: '/images/demo/demo-video-a.jpg',   v: '1.8k', l: '231' },
                          { d: 5,  e: null },
                          { d: 6,  e: null },
                          { d: 7,  e: 'Stories',    src: '/images/demo/demo-grafika-a.jpg', v: '987',  l: '112' },
                          { d: 8,  e: null },
                          { d: 9,  e: 'Newsletter', src: '/images/demo/demo-video-a.jpg',   v: '640',  l: '88'  },
                          { d: 10, e: null },
                          { d: 11, e: 'Reels',      src: '/images/demo/demo-grafika-a.jpg', v: '3.4k', l: '302' },
                          { d: 12, e: null },
                          { d: 13, e: null },
                          { d: 14, e: 'Carousel',   src: '/images/demo/demo-video-a.jpg',   v: '1.1k', l: '159' },
                          { d: 15, e: 'Grafika',    src: '/images/demo/demo-grafika-a.jpg', v: '2.6k', l: '288' },
                          { d: 16, e: null },
                          { d: 17, e: null },
                          { d: 18, e: 'Reels',      src: '/images/demo/demo-video-a.jpg',   v: '4.0k', l: '411' },
                          { d: 19, e: null },
                          { d: 20, e: null },
                          { d: 21, e: 'Stories',    src: '/images/demo/demo-grafika-a.jpg', v: '750',  l: '94'  },
                        ].map((item, i) => (
                          <div key={i} style={{
                            borderRadius: '7px',
                            overflow: 'hidden',
                            background: item.e ? '#fff' : 'transparent',
                            border: item.e ? '0.5px solid #e8e4dc' : 'none',
                          }}>
                            {item.e && item.src ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.src} alt="" style={{ width: '100%', height: '52px', objectFit: 'cover', display: 'block' }} />
                                <div style={{ padding: '4px 5px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#111' }}>{item.d}</span>
                                    <span style={{ fontSize: '8px', color: '#5a7a00', fontWeight: 500 }}>{item.e}</span>
                                  </div>
                                  <div style={{ fontSize: '8px', color: '#bbb', marginTop: '2px', display: 'flex', gap: '5px' }}>
                                    <span>{item.v} views</span>
                                    <span>{item.l} likes</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div style={{ padding: '6px 4px', textAlign: 'center' }}>
                                <span style={{ fontSize: '11px', color: '#ccc' }}>{item.d}</span>
                              </div>
                            )}
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
                        <div style={{ width: '220px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden' }}>
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
              </div>{/* /hero-slide-frame */}

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
          style={{ backgroundColor: bgColor || '#fff', transition: 'background-color 1s ease' }}
        >
          <div className="start-gallery-inner">
            <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 48 }}>
              <h2 className="start-section-title">Inspirace seřazená podle pocitu.</h2>
              <p className="start-section-sub">Ukládej co tě baví — AI se naučí tvůj styl a tvoří obsah který můžeš hned použít.</p>
            </div>
          </div>

          {/* Kroužky */}
          <div className="start-palette-row">
            {colorGroups.map(group =>
              group.colors.map(hex => (
                <div
                  key={`${group.name}-${hex}`}
                  className={`start-palette-dot${selectedHex === hex ? ' active' : ''}`}
                  style={{ background: hex }}
                  title={group.name}
                  onClick={() => {
                    if (autoColorRef.current) clearInterval(autoColorRef.current)
                    setSelectedHex(hex)
                    setBgColor(hex + '18')
                  }}
                />
              ))
            )}
          </div>

          <div className="start-collection-label">
            {selectedHex
              ? colorGroups.find(g => g.colors.includes(selectedHex))?.name ?? ''
              : 'Všechny styly'}
          </div>

          {/* Foto grid */}
          <div
            className="start-visual-grid"
            style={{ opacity: gridLoading ? 0 : 1, transition: 'opacity 0.35s ease' }}
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

        {/* 02 · JAK TO FUNGUJE */}
        <section className="rtg-section-light alt" id="how">
          <div className="rtg-container">
            <div className="rtg-eyebrow">02 · jak to funguje</div>
            <h2 className="rtg-h2">Zadáš jednou.<br /><em>Schvaluješ navždy.</em></h2>
            <div className="rtg-pipeline">
              <div className="rtg-pipe-step">
                <div className="rtg-pipe-num">1</div>
                <h3>Zadáš web nebo Instagram</h3>
                <p>Systém si přečte tvou značku — styl, tón, témata, barvy. Jednou. Nikdy víckrát.</p>
                <span className="rtg-step-tag">⚡ Hotovo za 2 minuty</span>
              </div>
              <div className="rtg-pipe-step">
                <div className="rtg-pipe-num">2</div>
                <h3>AI připraví obsah každý týden</h3>
                <p>Videa, grafiky, texty — vždy ve dvou variantách. Systém ví co tvoří a nikdy neopakuje.</p>
                <span className="rtg-step-tag">🤖 Automaticky dle intervalu</span>
              </div>
              <div className="rtg-pipe-step">
                <div className="rtg-pipe-num">3</div>
                <h3>Ty jen vybereš a schválíš</h3>
                <p>Varianta A nebo B. Klikneš schválit. Stáhneš nebo naplánuješ. Hotovo.</p>
                <span className="rtg-step-tag">✓ Bez komunikace, bez briefů</span>
              </div>
            </div>
          </div>
        </section>

        {/* MAGNET INPUT */}
        <section style={{ padding: '80px 40px', textAlign: 'center', background: '#f5f3ee' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa', marginBottom: '12px' }}>
              Vyzkoušej pro svou značku
            </p>
            <h2 className="rtg-h2" style={{ marginBottom: '8px' }}>
              Zadej svůj web.<br />
              <em style={{ fontWeight: 400, color: '#555' }}>Ukážeme ti jak bude vypadat tvůj obsah.</em>
            </h2>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '28px' }}>
              Níže vidíš demo. Zadej svůj web a vygenerujeme 3 reálné posty pro tvou značku.
            </p>
            <div style={{ display: 'flex', gap: '10px', maxWidth: '720px', margin: '0 auto' }}>
              <input
                type="url"
                placeholder="vas-web.cz nebo instagram.com/vas-profil"
                style={{ flex: 1, padding: '18px 24px', border: '1.5px solid #e8e4dc', borderRadius: '10px', fontSize: '16px', outline: 'none', background: '#fff', color: '#111' }}
                onFocus={e => (e.target.style.borderColor = '#b7e94c')}
                onBlur={e => (e.target.style.borderColor = '#e8e4dc')}
              />
              <button
                onClick={() => router.push('/brand-scan')}
                style={{ padding: '18px 32px', background: '#b7e94c', color: '#111', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Vygenerovat →
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#bbb', marginTop: '12px' }}>
              Zdarma · 3 posty · náhled okamžitě
            </p>
          </div>
        </section>

        {/* 03 · CO VIDÍŠ V DASHBOARDU */}
        <section className="rtg-section-light">
          <div className="rtg-container">
            <div className="rtg-eyebrow" style={{ marginBottom: '24px' }}>03 · co vidíš v dashboardu</div>
            <h2 className="rtg-h2" style={{ marginBottom: '40px' }}>Vybereš variantu.<br /><em>Schválíš. Jdeš dál.</em></h2>

            <div style={{ maxWidth: '100%', margin: 0 }}>
              <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e8e8e4' }}>
                <div style={{ background: '#fafaf7', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e8e4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f57' }} />
                      <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e' }} />
                      <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#28c840' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#9a9a90', letterSpacing: '.02em' }}>Lucifera Light · klientský portál</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#9a9a90' }}>Veronika Novotná</div>
                </div>

                <div style={{ background: '#fafaf7', borderBottom: '1px solid #e8e8e4', display: 'flex', overflowX: 'auto' }}>
                  {['Ke schválení', 'Plánování', 'Vizuální knihovna', 'Texty', 'Archiv', 'Statistiky'].map((tab, i) => (
                    <div key={i} style={{ fontSize: '11px', padding: '9px 16px', color: i === 0 ? '#111' : '#9a9a90', cursor: 'pointer', borderBottom: i === 0 ? '2px solid #111' : '2px solid transparent', whiteSpace: 'nowrap', background: 'transparent' }}>{tab}</div>
                  ))}
                </div>

                <div style={{ background: '#fff', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>Ke schválení tento týden</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ height: '3px', width: '80px', background: '#e8e8e4', borderRadius: '2px' }}>
                        <div style={{ height: '3px', width: '20%', background: '#111', borderRadius: '2px' }} />
                      </div>
                      <div style={{ fontSize: '11px', color: '#9a9a90' }}>2 / 10</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#fff', border: '1px solid #111', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ flexShrink: 0, width: '140px', aspectRatio: '9/16', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                        <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} poster="/images/demo/demo-video-a.jpg">
                          <source src="/images/demo/demo-video-a.mp4" type="video/mp4" />
                        </video>
                        <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '9px', padding: '2px 7px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>▶ 15s · Reels</div>
                      </div>
                      <div style={{ flex: 1, paddingTop: '4px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#b7e94c', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>VIDEO · Reels</div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '6px' }}>&ldquo;Ráno. Okno. Ticho před dnem.&rdquo;</p>
                        <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Storytelling · přirozený moment</p>
                        <div style={{ fontSize: '11px', color: '#555', background: '#f5f3ee', borderRadius: '6px', padding: '8px 10px', lineHeight: 1.6 }}>
                          Každé ráno si říkám – dneska to zvládnu.<br />A pak přijde ten moment, kdy všechno zpomalí.<br />Okno. Světlo. Ticho.<br /><br />To je tvůj obsah. Každý týden. Bez námahy.
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: '#f0f0f0', color: '#666' }}>Varianta A</span>
                          <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: '#f0f0f0', color: '#666' }}>Instagram</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#fff', border: '1px solid #e8e4dc', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ flexShrink: 0, width: '140px', aspectRatio: '9/16', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                        <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} poster="/images/demo/demo-video-b.jpg">
                          <source src="/images/demo/demo-video-b.mp4" type="video/mp4" />
                        </video>
                        <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '9px', padding: '2px 7px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>▶ 12s · Reels</div>
                      </div>
                      <div style={{ flex: 1, paddingTop: '4px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#b7e94c', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>VIDEO · Reels</div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '6px' }}>&ldquo;Tohle ti nikdo neřekne.&rdquo;</p>
                        <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Hook přímý · osobní tón</p>
                        <div style={{ fontSize: '11px', color: '#555', background: '#f5f3ee', borderRadius: '6px', padding: '8px 10px', lineHeight: 1.6 }}>
                          Strávila jsem hodiny přemýšlením co postovat.<br />Pak jsem to vzdala.<br />A nechala systém pracovat za mě.<br /><br />3 posty týdně. Hotovo za 5 minut.
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: '#f0f0f0', color: '#666' }}>Varianta B</span>
                          <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: '#f0f0f0', color: '#666' }}>Instagram</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ background: '#fafaf7', border: '1px solid #e8e8e4', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'inline-flex', fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', background: '#dcfce7', color: '#15803d', letterSpacing: '.06em', marginBottom: '8px' }}>◻ GRAFIKA</div>
                      <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '10px', marginBottom: '8px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/demo/demo-grafika-a.jpg" alt="Grafika A" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '2px' }}>&ldquo;Kdy jsi naposledy stála a jen... byla?&rdquo;</div>
                      <div style={{ fontSize: '10px', color: '#9a9a90' }}>Soft feminine · lifestyle</div>
                    </div>
                    <div style={{ background: '#fafaf7', border: '1px solid #e8e8e4', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'inline-flex', fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', background: '#dcfce7', color: '#15803d', letterSpacing: '.06em', marginBottom: '8px' }}>◻ GRAFIKA</div>
                      <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '10px', marginBottom: '8px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/demo/demo-grafika-b.jpg" alt="Grafika B" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '2px' }}>&ldquo;Volnost má svůj rytmus.&rdquo;</div>
                      <div style={{ fontSize: '10px', color: '#9a9a90' }}>Editorial · atmosféra</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8e8e4' }}>
                    <div style={{ fontSize: '11px', color: '#9a9a90' }}>Klikni na variantu → schval</div>
                    <button style={{ background: '#111', color: '#fff', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Schválit →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <div className="rtg-testimonial">
          <div className="rtg-quote-mark">&ldquo;</div>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <div className="rtg-testimonial-text">Poprvé jsem měla pocit, že obsah skutečně mluví za mě — bez toho, abych u toho trávila hodiny.</div>
            <div className="rtg-testimonial-author">Veronika N. · wellness terapeutka · Praha · Lucifera Light Start plán</div>
          </div>
        </div>

        {/* 04 · CO DOSTANEŠ */}
        <section className="rtg-section-light alt">
          <div className="rtg-container">
            <div className="rtg-eyebrow">04 · co dostaneš</div>
            <h2 className="rtg-h2">Vše připravené<br /><em>k použití.</em></h2>
            <div className="rtg-deliver-grid">
              <div className="rtg-deliver-item">
                <div className="rtg-d-check">✔</div>
                <h3>Videa + Reels</h3>
                <p>AI zpracuje tvoje záběry nebo vybere z knihovny. Hook overlay, střih, 2 varianty připravené k publikaci.</p>
              </div>
              <div className="rtg-deliver-item">
                <div className="rtg-d-check">✔</div>
                <h3>Grafické příspěvky</h3>
                <p>Canva šablony na míru tvého brandu. Vlastní fotka nebo AI generovaný vizuál. Feed, Stories, LinkedIn.</p>
              </div>
              <div className="rtg-deliver-item">
                <div className="rtg-d-check">✔</div>
                <h3>Texty a hooky</h3>
                <p>Psané v tvém tónu. Systém ví co jsi už použila — nikdy neopakuje. Vždy 2 varianty.</p>
              </div>
              <div className="rtg-deliver-item">
                <div className="rtg-d-check">✔</div>
                <h3>Archiv na Google Drive</h3>
                <p>Každý výstup automaticky uložený ve tvé složce. Stahuj kdykoli, sdílej snadno.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 05 · PROČ LUCIFERA LIGHT — BENTO */}
        <section className="rtg-section-light">
          <div className="rtg-container">
            <div className="rtg-eyebrow">05 · proč Lucifera Light</div>
            <h2 className="rtg-h2">Systém který<br /><em>pracuje za tebe.</em></h2>
            <div className="rtg-bento">
              <div className="rtg-bento-card featured">
                <span className="rtg-bento-icon">⚡</span>
                <div className="rtg-bento-stat">0h</div>
                <h3>Žádná tvorba od nuly</h3>
                <p>Systém přečte tvůj brand jednou a pak generuje obsah každý týden automaticky. Ty jen schvaluješ.</p>
              </div>
              <div className="rtg-bento-card">
                <span className="rtg-bento-icon">🔄</span>
                <h3>Nikdy se neopakuje</h3>
                <p>AI pamatuje co jsi schválila. Každý týden nový obsah, žádné kopie.</p>
              </div>
              <div className="rtg-bento-card">
                <span className="rtg-bento-icon">🎯</span>
                <h3>Vždy 2 varianty</h3>
                <p>Ke každému příspěvku dostaneš A a B. Vyber co ti sedí víc.</p>
              </div>
              <div className="rtg-bento-card">
                <span className="rtg-bento-icon">📅</span>
                <h3>Interval dle tebe</h3>
                <p>Týdně, ob týden, měsíčně — nastav si jak ti vyhovuje.</p>
              </div>
              <div className="rtg-bento-card">
                <span className="rtg-bento-icon">☁️</span>
                <h3>Vše v Google Drive</h3>
                <p>Každý výstup automaticky uložený. Stáhni a publikuj.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 06 · PLÁNY / PRICING */}
        <section className="rtg-section-light alt" id="plans">
          <div className="rtg-container">
            <div className="rtg-eyebrow">06 · plány</div>
            <h2 className="rtg-h2" style={{ textAlign: 'center' }}>Vyber si,<br /><em>kde začneš.</em></h2>
            <div className="rtg-pricing-grid">
              <div className="rtg-plan">
                <div className="rtg-plan-head">
                  <div className="rtg-plan-name">Start</div>
                  <div className="rtg-plan-tag">Vezmi a použij.</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginTop: '14px', marginBottom: '3px' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 800, color: '#111' }}>2 900</div>
                    <div style={{ fontSize: '12px', color: '#6b6b6b' }}>Kč / měsíc</div>
                  </div>
                </div>
                <div className="rtg-plan-counts">
                  <span className="rtg-count-pill v">▶ 2 videa / měsíc</span>
                  <span className="rtg-count-pill g">◻ 8 grafik / měsíc</span>
                </div>
                <ul className="rtg-plan-features">
                  <li style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#c0c0b8', listStyle: 'none', marginBottom: '4px', display: 'block' }}>Videa</li>
                  <li><span className="rtg-ck">✔</span>AI zpracování nahraného videa</li>
                  <li><span className="rtg-ck">✔</span>Hook + grafika overlay</li>
                  <li><span className="rtg-ck">✔</span>Střih na max 45s</li>
                  <li style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#c0c0b8', listStyle: 'none', margin: '8px 0 4px', display: 'block' }}>Grafiky</li>
                  <li><span className="rtg-ck">✔</span>Fotka nebo AI obrázek + text</li>
                  <li style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#c0c0b8', listStyle: 'none', margin: '8px 0 4px', display: 'block' }}>Výstup</li>
                  <li><span className="rtg-ck">✔</span>Stažení nebo plánování</li>
                  <li><span className="rtg-ck">✔</span>Drive archiv</li>
                  <li><span className="rtg-ck">✔</span>Vizuální banka — výběr z kolekcí</li>
                  <li><span className="rtg-pl">+</span>Dokoupení extra grafik nebo videí kdykoli</li>
                </ul>
                <div style={{ padding: '14px 24px 18px' }}>
                  <button onClick={() => router.push('/client/magnet/rtg/onboarding')} style={{ display: 'block', width: '100%', padding: '11px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textAlign: 'center', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>Začít se Start →</button>
                  <div style={{ fontSize: '10px', color: '#c0c0b8', textAlign: 'center', marginTop: '5px' }}>Bez závazku · zrušení kdykoli</div>
                </div>
              </div>
              <div className="rtg-plan featured">
                <div className="rtg-plan-head">
                  <div className="rtg-plan-badge">NEJOBLÍBENĚJŠÍ</div>
                  <div className="rtg-plan-name">Plus</div>
                  <div className="rtg-plan-tag">Nahraješ → dostaneš.</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginTop: '14px', marginBottom: '3px' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 800, color: '#111' }}>4 900</div>
                    <div style={{ fontSize: '12px', color: '#6b6b6b' }}>Kč / měsíc</div>
                  </div>
                </div>
                <div className="rtg-plan-counts">
                  <span className="rtg-count-pill v">▶ 4 videa / měsíc</span>
                  <span className="rtg-count-pill g">◻ 16 grafik / měsíc</span>
                  <span className="rtg-count-pill" style={{ background: '#fef9c3', color: '#854d0e' }}>◻ 4 carousely / měsíc</span>
                </div>
                <ul className="rtg-plan-features">
                  <li style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#c0c0b8', listStyle: 'none', marginBottom: '4px', display: 'block' }}>Vše ze Start, navíc</li>
                  <li><span className="rtg-ck">✔</span>4 videa + 16 grafik + 4 carousely</li>
                  <li><span className="rtg-ck">✔</span>Prioritní zpracování</li>
                  <li><span className="rtg-ck">✔</span>Reels · Stories · Feed formáty</li>
                  <li style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#c0c0b8', listStyle: 'none', margin: '8px 0 4px', display: 'block' }}>Extra funkce</li>
                  <li><span className="rtg-ck">✔</span>Plánování na IG + FB + LI</li>
                  <li><span className="rtg-ck">✔</span>Analytika — co fungovalo</li>
                  <li><span className="rtg-pl">+</span>Dokoupení extra kreativy kdykoli</li>
                </ul>
                <div style={{ padding: '14px 24px 18px' }}>
                  <button onClick={() => router.push('/client/magnet/rtg/onboarding')} style={{ display: 'block', width: '100%', padding: '11px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textAlign: 'center', background: '#d0ec78', color: '#111', border: 'none', cursor: 'pointer' }}>Začít s Plus →</button>
                  <div style={{ fontSize: '10px', color: '#c0c0b8', textAlign: 'center', marginTop: '5px' }}>Bez závazku · zrušení kdykoli</div>
                </div>
              </div>
              <div className="rtg-plan">
                <div className="rtg-plan-head">
                  <div className="rtg-plan-name">Pro</div>
                  <div className="rtg-plan-tag">Maximální výstup.</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginTop: '14px', marginBottom: '3px' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 800, color: '#111' }}>7 900</div>
                    <div style={{ fontSize: '12px', color: '#6b6b6b' }}>Kč / měsíc</div>
                  </div>
                </div>
                <div className="rtg-plan-counts">
                  <span className="rtg-count-pill v">▶ 8 videí / měsíc</span>
                  <span className="rtg-count-pill g">◻ 30 grafik / měsíc</span>
                  <span className="rtg-count-pill" style={{ background: '#fef9c3', color: '#854d0e' }}>◻ 8 carouselů / měsíc</span>
                </div>
                <ul className="rtg-plan-features">
                  <li style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#c0c0b8', listStyle: 'none', marginBottom: '4px', display: 'block' }}>Vše z Plus, navíc</li>
                  <li><span className="rtg-ck">✔</span>Avatar výstupy</li>
                  <li><span className="rtg-ck">✔</span>Automatizace bez schvalování</li>
                  <li><span className="rtg-ck">✔</span>Pokročilé šablony na míru</li>
                  <li style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#c0c0b8', listStyle: 'none', margin: '8px 0 4px', display: 'block' }}>Dokoupení mimo kredit</li>
                  <li><span className="rtg-pl">+</span>Extra video <span style={{ fontSize: '11px', color: '#9a9a90' }}>+590 Kč</span></li>
                  <li><span className="rtg-pl">+</span>Extra grafika <span style={{ fontSize: '11px', color: '#9a9a90' }}>+290 Kč</span></li>
                  <li><span className="rtg-pl">+</span>Extra carousel <span style={{ fontSize: '11px', color: '#9a9a90' }}>+490 Kč</span></li>
                  <li><span className="rtg-pl">+</span>Avatar video — brzy <span style={{ fontSize: '11px', color: '#9a9a90' }}>+990 Kč</span></li>
                  <li><span className="rtg-pl">+</span>UGC video — brzy <span style={{ fontSize: '11px', color: '#9a9a90' }}>+790 Kč</span></li>
                </ul>
                <div style={{ padding: '14px 24px 18px' }}>
                  <button onClick={() => router.push('/client/magnet/rtg/onboarding')} style={{ display: 'block', width: '100%', padding: '11px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textAlign: 'center', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>Začít s Pro →</button>
                  <div style={{ fontSize: '10px', color: '#c0c0b8', textAlign: 'center', marginTop: '5px' }}>Bez závazku · zrušení kdykoli</div>
                </div>
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#6b6b6b' }}>
              Interval doručení (týdně / ob týden / měsíčně) nastavíte po registraci v portálu.{' '}
              <span style={{ color: '#6b7c2e', fontWeight: 500 }}>Ročně ušetříte 20 %.</span>
            </p>
            <div style={{ background: '#fff', border: '1px solid #e8e8e4', borderRadius: '12px', padding: '18px 22px', marginTop: '20px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#c0c0b8', marginBottom: '10px' }}>Příplatky pro všechny plány</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Střih Lucifera +490 Kč', 'Extra video +590 Kč', 'Extra grafika +290 Kč', 'Extra carousel +490 Kč', 'Avatar video — brzy +990 Kč', 'UGC video — brzy +790 Kč'].map((pill, i) => (
                  <div key={i} style={{ fontSize: '12px', padding: '5px 14px', borderRadius: '100px', border: '1px solid #e8e8e4', color: '#555', background: '#fafaf7' }}>{pill}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA DARK */}
        <section className="rtg-cta-dark" id="cta">
          <div className="rtg-container">
            <h2 className="rtg-cta-h2">Začni tvořit<br /><em>jednodušeji.</em></h2>
            <p className="rtg-cta-p">Bez chaosu. Bez složitého procesu. Bez hodin práce. Zadáš jednou — dostáváš každý týden.</p>
            <div className="rtg-cta-actions">
              <button className="rtg-btn-lime" onClick={() => router.push('/client/magnet/rtg/onboarding')}>Chci to vyzkoušet</button>
              <button className="rtg-btn-ghost" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>Jak to funguje →</button>
            </div>
            <div className="rtg-cta-note">Žádný závazek · Ozveme se do 24 hodin</div>
          </div>
        </section>

      </div>
    </div>
  )
}
