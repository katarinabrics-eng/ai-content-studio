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
  { name: 'Zemitá zelená',    hex: '#2d3d1e', folder: 'K01', offset: 0 },
  { name: 'Lesní oliva',      hex: '#4a5c2a', folder: 'K01', offset: 1 },
  { name: 'Mechová',          hex: '#6b7d3a', folder: 'K01', offset: 2 },

  { name: 'Ocelová modrá',    hex: '#3a4d5e', folder: 'K02', offset: 0 },
  { name: 'Chladná šedá',     hex: '#5a6d7e', folder: 'K02', offset: 1 },
  { name: 'Světlá břidlice',  hex: '#8a9db0', folder: 'K02', offset: 2 },

  { name: 'Čistá bílá',       hex: '#e8e8e4', folder: 'K03', offset: 0 },
  { name: 'Minimální šedá',   hex: '#d0d0cc', folder: 'K03', offset: 1 },
  { name: 'Vzdušná',          hex: '#f2f2f0', folder: 'K03', offset: 2 },

  { name: 'Pudrovka',         hex: '#e8b4c0', folder: 'K04', offset: 0 },
  { name: 'Blush růžová',     hex: '#d4909c', folder: 'K04', offset: 1 },
  { name: 'Levandulová',      hex: '#c4a8d0', folder: 'K04', offset: 2 },

  { name: 'Zlatý jantar',     hex: '#c47820', folder: 'K05', offset: 0 },
  { name: 'Teplé zlato',      hex: '#d4942a', folder: 'K05', offset: 1 },
  { name: 'Tmavý bronz',      hex: '#8b5010', folder: 'K05', offset: 2 },

  { name: 'Karmínová',        hex: '#8b0a14', folder: 'K07', offset: 0 },
  { name: 'Burgundy',         hex: '#5c0810', folder: 'K07', offset: 1 },
  { name: 'Tmavá třešeň',     hex: '#a01828', folder: 'K07', offset: 2 },

  { name: 'Teplá slonovina',  hex: '#c8b89a', folder: 'K08', offset: 0 },
  { name: 'Krémová béžová',   hex: '#d8c8a8', folder: 'K08', offset: 1 },
  { name: 'Světlý karamel',   hex: '#e0ceb0', folder: 'K08', offset: 2 },

  { name: 'Šalvějová',        hex: '#4a8a80', folder: 'K09', offset: 0 },
  { name: 'Tyrkysová tichá',  hex: '#5aa090', folder: 'K09', offset: 1 },
  { name: 'Mlhavá modrá',     hex: '#7ab0b0', folder: 'K09', offset: 2 },

  { name: 'Teplá bílá',       hex: '#e8e0d0', folder: 'K10', offset: 0 },
  { name: 'Mandlová',         hex: '#d8cbb8', folder: 'K10', offset: 1 },
  { name: 'Jemná béžová',     hex: '#c8b8a0', folder: 'K10', offset: 2 },
]

const K10_PHOTOS = [
  '/placeholders/stock-vizualni knihovna/K10/k11-001.jpeg',
  '/placeholders/stock-vizualni knihovna/K10/k11-002.jpeg',
  '/placeholders/stock-vizualni knihovna/K10/k11-003.jpeg',
  '/placeholders/stock-vizualni knihovna/K10/k11-004.jpeg',
  '/placeholders/stock-vizualni knihovna/K10/k11-005.jpeg',
  '/placeholders/stock-vizualni knihovna/K10/k11-006.jpeg',
  '/placeholders/stock-vizualni knihovna/K10/k11-007.jpeg',
  '/placeholders/stock-vizualni knihovna/K10/k11-008.jpeg',
]

const K10_PALETTE = ['#d8c4ad', '#e7dfd2', '#c1aa94', '#b4a592', '#98806d']

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

const TONES = [
  { id:'editorial', e:'🤍', name:'Klidně a s rozvahou',
    example:'"Někdy stačí zastavit se. Dát si prostor. A odpověď přijde sama."',
    img:'/placeholders/stock-vizualni knihovna/K03/k03-007.jpeg' },
  { id:'bold', e:'⚡', name:'Silně a přímo',
    example:'"Přestaň čekat na správný moment. Správný moment jsi ty."',
    img:'/placeholders/stock-vizualni knihovna/K02/k02-007.jpeg' },
  { id:'golden', e:'✨', name:'Osobně a příběhem',
    example:'"Před rokem jsem nevěděla jak dál. Dnes vím, že to byl začátek."',
    img:'/placeholders/stock-vizualni knihovna/K04/k04-007.jpeg' },
  { id:'disruptor', e:'🔥', name:'Nekonvenčně',
    example:'"Všichni ti říkají buď trpělivý. Já ti říkám: ne. Jednej teď."',
    img:'/placeholders/stock-vizualni knihovna/K07/k07-083.jpeg' },
  { id:'educator', e:'📐', name:'Odborně a strukturovaně',
    example:'"3 kroky jak zlepšit engagement o 40 %: 1) Hook 2) Hodnota 3) CTA"',
    img:'/placeholders/stock-vizualni knihovna/K01/k01-007.jpeg' },
]

const AUDIENCES = [
  { id:'personal',  e:'👤', bg:'#f0e8f8', name:'Osobní značka',       desc:'Budují kariéru nebo vlastní podnikání', tag:'Jednotlivci' },
  { id:'business',  e:'💼', bg:'#e8f0f8', name:'Podnikatelé & firmy', desc:'Hledají růst, efektivitu a výsledky',   tag:'B2B & B2C' },
  { id:'creative',  e:'🎨', bg:'#f8f0e8', name:'Kreativci & freelanceři', desc:'Umělci, designéři, fotografové',   tag:'Tvůrčí obor' },
  { id:'beginners', e:'🌱', bg:'#e8f8ec', name:'Začátečníci',         desc:'Teprve startují, hledají cestu',        tag:'Nový start' },
  { id:'family',    e:'👨‍👩‍👧', bg:'#fef8e8', name:'Rodiny & rodiče',  desc:'Rovnováha práce a rodiny',             tag:'Životní styl' },
  { id:'health',    e:'🏃', bg:'#f8eae8', name:'Sportovci & zdraví',  desc:'Fitness, výživa, wellbeing',            tag:'Zdraví' },
]

const COLOR_STYLES = [
  { id:'prirodni', name:'Zemitá zelená',    desc:'Přírodní, organická', img:'/placeholders/stock-vizualni knihovna/K01/k01-008.jpeg', folder:'K01' },
  { id:'kremova',  name:'Krémová & blush',  desc:'Jemná, teplá',       img:'/placeholders/stock-vizualni knihovna/K04/k04-008.png',  folder:'K04' },
  { id:'bordo',    name:'Bordó & dramatická',desc:'Silná, luxusní',    img:'/placeholders/stock-vizualni knihovna/K07/k07-084.jpeg', folder:'K07' },
  { id:'minimalni',name:'Světlá & minimální',desc:'Čistá, vzdušná',    img:'/placeholders/stock-vizualni knihovna/K03/k03-008.jpeg', folder:'K03' },
  { id:'zlata',    name:'Teplá zlatá',      desc:'Energie, slunce',    img:'/placeholders/stock-vizualni knihovna/K05/k05-008.png',  folder:'K05' },
  { id:'moderni',  name:'Chladná & moderní',desc:'Profesionální',      img:'/placeholders/stock-vizualni knihovna/K02/k02-008.jpeg', folder:'K02' },
]

const FORMATS = [
  { id:'instagram',  e:'📸', name:'Instagram post', desc:'Fotka + caption + hashtagy' },
  { id:'reels',      e:'🎬', name:'Reels / Video',  desc:'Skript + hook + CTA' },
  { id:'facebook',   e:'💬', name:'Facebook post',  desc:'Delší text, komunita' },
  { id:'linkedin',   e:'💼', name:'LinkedIn',       desc:'Odborný příspěvek' },
  { id:'newsletter', e:'📧', name:'Newsletter',     desc:'Email pro odběratele' },
  { id:'stories',    e:'✨', name:'Stories',        desc:'Krátký obsah, 24h' },
]

const MOODS = [
  { id: 'prirodni',   name: 'Zemitý & přírodní',  desc: 'Organický, zelený, klidný',    folder: 'K01', img: '/placeholders/stock-vizualni knihovna/K01/k01-006.jpeg' },
  { id: 'kremovy',    name: 'Krémový & jemný',     desc: 'Blush, růžová, teplá bílá',    folder: 'K04', img: '/placeholders/stock-vizualni knihovna/K04/k04-006.png' },
  { id: 'dramaticky', name: 'Tmavý & dramatický',  desc: 'Burgundy, bordeaux, síla',      folder: 'K07', img: '/placeholders/stock-vizualni knihovna/K07/k07-083.jpeg' },
  { id: 'minimalni',  name: 'Světlý & minimální',  desc: 'Čistá bílá, vzdušný prostor',  folder: 'K03', img: '/placeholders/stock-vizualni knihovna/K03/k03-006.png' },
  { id: 'zlaty',      name: 'Teplý & zlatý',       desc: 'Jantar, karamel, slunce',       folder: 'K05', img: '/placeholders/stock-vizualni knihovna/K05/k05-006.png' },
  { id: 'moderni',    name: 'Chladný & moderní',   desc: 'Oceánová šedá, kovový',         folder: 'K02', img: '/placeholders/stock-vizualni knihovna/K02/k02-006.png' },
]

export default function StartPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [activePhotos, setActivePhotos] = useState<string[]>([])
  const [prevPhotos, setPrevPhotos] = useState<string[]>([])
  const [fading, setFading] = useState(false)
  const [selectedHex, setSelectedHex] = useState<string | null>(colorGroups[0].hex)
  const [activeFolder, setActiveFolder] = useState(colorGroups[0].folder)
  const [bgColor, setBgColor] = useState(colorGroups[0].hex + '22')
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
  const [isMobile, setIsMobile] = useState(false)
  const [rtgActiveTab, setRtgActiveTab] = useState('obsah')
  const [rtgActiveCard, setRtgActiveCard] = useState<number | null>(0)
  const [rtgApproved, setRtgApproved] = useState(false)
  const [startEntryType, setStartEntryType] = useState<'web' | 'instagram' | 'manual' | null>(null)
  const [startInputValue, setStartInputValue] = useState('')
  const [startStep, setStartStep] = useState<'entry' | 'input' | 'mood' | 'formats' | 'analyzer'>('entry')
  const [startMoodSelected, setStartMoodSelected] = useState<string[]>([])
  const [tileIndex, setTileIndex] = useState(0)
  const [startFormats, setStartFormats] = useState<string[]>([])
  const [manualStep, setManualStep] = useState<'basic'|'ton'|'audience'|'colors'|'formats'>('basic')
  const [manualTon, setManualTon] = useState<string|null>(null)
  const [manualAudience, setManualAudience] = useState<string[]>([])
  const [manualColors, setManualColors] = useState<string[]>([])
  const [manualFormats, setManualFormats] = useState<string[]>([])
  const [manualName, setManualName] = useState('')
  const [manualWhat, setManualWhat] = useState<string[]>([])
  const [manualForWhom, setManualForWhom] = useState<string[]>([])
  const [manualPrice, setManualPrice] = useState<string|null>(null)
  const [manualPhase, setManualPhase] = useState<string|null>(null)
  const [manualGoal, setManualGoal] = useState<string|null>(null)
  const [manualDiff, setManualDiff] = useState('')
  const [manualFeel, setManualFeel] = useState('')

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

  // isMobile sledovanie
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Auto-rotate — len offset:0 skupiny (K01, K02, K03...)
  useEffect(() => {
    const autoIndexes = colorGroups
      .map((g, i) => ({ g, i }))
      .filter(({ g }) => g.offset === 0)
      .map(({ i }) => i)

    autoColorRef.current = setInterval(() => {
      setAutoColorIndex(prev => {
        const currentPos = autoIndexes.indexOf(prev)
        const nextPos = (currentPos + 1) % autoIndexes.length
        return autoIndexes[nextPos] ?? autoIndexes[0]
      })
    }, 6000)
    return () => { if (autoColorRef.current) clearInterval(autoColorRef.current) }
  }, [])

  // Reagovat na změnu autoColorIndex — přepnout barvu + folder + fotky s offsetom
  useEffect(() => {
    const group = colorGroups[autoColorIndex]
    if (!group) return
    setSelectedHex(group.hex)
    setActiveFolder(group.folder)
    setBgColor(group.hex + '22')
    const folderPhotos = collections
      .flatMap(c => c.photos)
      .filter(src => src.includes('/' + group.folder + '/'))
    const paged = getPagedPhotos(folderPhotos, group.offset)
    const next = paged.length > 0 ? paged : folderPhotos.slice(0, 16)
    if (next.length > 0) transitionToPhotos(next)
    setTimeout(scrollPaletteToActive, 50)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoColorIndex, collections])

  async function loadCollections() {
    const id = ++fetchRef.current
    try {
      const res = await fetch('/api/landing/collections')
      const data = await res.json()
      if (id !== fetchRef.current) return
      const cols: Collection[] = data.collections ?? []
      setCollections(cols)
      const all = cols.flatMap(c => c.photos)
      setActivePhotos(all)
    } catch {
      if (id === fetchRef.current) setActivePhotos([])
    }
  }

  function getPagedPhotos(allFolderPhotos: string[], offset: number, pageSize = 16): string[] {
    if (allFolderPhotos.length === 0) return []
    const start = offset * pageSize
    const end = start + pageSize
    const page = allFolderPhotos.slice(start, end)
    if (page.length === pageSize) return page
    const shuffled = [...allFolderPhotos].sort(() => Math.random() - 0.5)
    const combined = [...page, ...shuffled]
    const unique = combined.filter((src, i, arr) => arr.indexOf(src) === i)
    return unique.slice(0, pageSize)
  }

  function transitionToPhotos(newPhotos: string[]) {
    setPrevPhotos(activePhotos)
    setFading(true)
    setTimeout(() => {
      setActivePhotos(newPhotos)
      setFading(false)
      setPrevPhotos([])
    }, 800)
  }

  function scrollPaletteToActive() {
    const paletteRow = document.querySelector('.start-palette-row')
    const activeDot = paletteRow?.querySelector('.start-palette-dot.active')
    if (paletteRow && activeDot) {
      const dotLeft = (activeDot as HTMLElement).offsetLeft
      const rowWidth = paletteRow.clientWidth
      paletteRow.scrollTo({ left: dotLeft - rowWidth / 2 + 14, behavior: 'smooth' })
    }
  }

  function handleDotClick(group: { name: string; hex: string; folder: string; offset: number }) {
    if (autoColorRef.current) clearInterval(autoColorRef.current)
    const idx = colorGroups.findIndex(g => g.hex === group.hex)
    if (idx !== -1) setAutoColorIndex(idx)
    setSelectedHex(group.hex)
    setActiveFolder(group.folder)
    setBgColor(group.hex + '22')
    const folderPhotos = collections
      .flatMap(c => c.photos)
      .filter(src => src.includes('/' + group.folder + '/'))
    const paged = getPagedPhotos(folderPhotos, group.offset)
    const next = paged.length > 0 ? paged : folderPhotos.slice(0, 16)
    if (next.length > 0) transitionToPhotos(next)
    setTimeout(scrollPaletteToActive, 50)
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
        }
        .gallery-grid-wrap {
          position: relative;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          padding: 24px 0 0;
        }
        .gallery-layer {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 6px;
        }
        .gallery-layer.outgoing {
          position: absolute;
          inset: 0;
          z-index: 1;
          animation: gallery-fade-out 0.7s ease forwards;
        }
        .gallery-layer.incoming {
          opacity: 0;
          z-index: 2;
          animation: gallery-fade-in 0.7s ease 0.15s forwards;
        }
        @keyframes gallery-fade-out {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.02); }
        }
        @keyframes gallery-fade-in {
          0%   { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
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
        @keyframes entryFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
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
          .start-gallery-section { padding: 40px 0 60px; }
          .start-gallery-inner { padding: 0 20px; }
          .start-visual-grid { grid-template-columns: repeat(2, 1fr); }
          .start-palette-row { flex-wrap: wrap !important; justify-content: center !important; gap: 8px !important; padding: 0 20px !important; }
          .start-section-title { font-size: 32px !important; padding: 0 20px !important; text-align: center !important; }
          .slide-dots { bottom: -32px !important; }
          .hero-section {
            flex-direction: column !important;
            padding: 40px 20px 24px !important;
            gap: 24px !important;
            align-items: center !important;
          }
          .hero-section .hero-text {
            max-width: 100% !important;
            text-align: center !important;
          }
          .hero-slide-frame {
            width: 100% !important;
            max-width: 100% !important;
            padding: 8px !important;
            border-radius: 14px !important;
          }
          .slides-outer {
            height: 400px !important;
            border-radius: 8px !important;
          }
          .ab-grid { grid-template-columns: 1fr !important; }
          .gallery-grid { grid-template-columns: repeat(6, 1fr) !important; grid-template-rows: repeat(3, 1fr) !important; }
          .gallery-grid-wrap { margin: 0 !important; }
          .start-header-link-how { display: none !important; }
          .start-hero-left { text-align: center !important; align-items: center !important; }
          .hero-cta-block { align-items: center !important; width: 100% !important; }
          .hero-cta-primary { width: 100% !important; text-align: center !important; justify-content: center !important; }
          .hero-cta-secondary { text-align: center !important; }
          .hotovy-prispevek-layout { flex-direction: column !important; }
          .hotovy-prispevek-layout .foto { width: 100% !important; height: 200px !important; }
          .start-palette-row {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scroll-behavior: smooth !important;
            -webkit-overflow-scrolling: touch !important;
            justify-content: flex-start !important;
            padding: 8px 20px !important;
            gap: 10px !important;
            scrollbar-width: none !important;
          }
          .start-palette-row::-webkit-scrollbar { display: none !important; }
          .start-palette-dot { flex-shrink: 0 !important; }
          .palette-label { display: none !important; }
        }
        @media (max-width: 480px) {
          .slides-outer { height: 340px !important; }
          .gallery-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .hero-typewriter { font-size: 36px !important; }
          .start-entry-grid { grid-template-columns: 1fr !important; }
          .start-manual-grid { grid-template-columns: 1fr !important; }
        }
        /* ===== RTG DEMO FRAME ===== */
        .rtg-demo-frame * {
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
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
            <button className="start-header-link start-header-link-how">Jak to funguje</button>
            <button
              className="start-header-cta"
              onClick={() => router.push('/client/pristup')}
              style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              Přihlásit se →
            </button>
          </nav>
        </header>

        {/* HERO */}
        <section className="start-hero">
          <div className="start-hero-inner hero-section">

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
                  onClick={() => document.getElementById('vyzkousej')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Zjisti, kde ti unikají klienti →
                </button>
                <button
                  className="hero-cta-secondary"
                  onClick={() => document.getElementById('vyzkousej')?.scrollIntoView({ behavior: 'smooth' })}
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
                      <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px', flex: 1 }}>Lucifera Light · klientský portál</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>Veronika Novotná</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px', overflow: 'hidden', gap: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#9a9a90' }}>KE SCHVÁLENÍ · VARIANTA A vs B</div>

                      {/* Jedna karta — celá šírka */}
                      <div style={{ display: 'flex', gap: '14px', background: '#fff', border: '2px solid #111', borderRadius: '12px', padding: '14px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                        {/* Video 9:16 */}
                        <div style={{ flexShrink: 0, width: '130px', aspectRatio: '9/16', borderRadius: '8px', overflow: 'hidden', position: 'relative', background: '#e8e4dc' }}>
                          <video autoPlay muted loop playsInline poster="/images/demo/demo-video-a.jpg"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                            <source src="/images/demo/demo-video-a.mp4" type="video/mp4" />
                          </video>
                          <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '9px', padding: '2px 7px', borderRadius: '10px' }}>▶ 15s · Reels</div>
                        </div>
                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: '#b7e94c', letterSpacing: '0.1em', textTransform: 'uppercase' }}>VIDEO · Reels</div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', lineHeight: 1.4 }}>&ldquo;Ráno. Okno. Ticho před dnem.&rdquo;</p>
                          <p style={{ fontSize: '11px', color: '#888' }}>Storytelling · přirozený moment</p>
                          <div style={{ fontSize: '11px', color: '#555', background: '#f5f3ee', borderRadius: '6px', padding: '8px 10px', lineHeight: 1.6 }}>
                            Každé ráno si říkám – dneska to zvládnu. A pak přijde ten moment, kdy všechno zpomalí.
                          </div>
                          <div style={{ fontSize: '11px', color: '#aaa' }}>#osobnirozvoj #mindset #rannirutina</div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                            <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '10px', background: '#b7e94c', color: '#1a2a00', fontWeight: 600 }}>Varianta A</span>
                            <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '10px', background: '#f0f0f0', color: '#666' }}>Instagram</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #e8e8e4', flexShrink: 0 }}>
                        <div style={{ fontSize: '11px', color: '#9a9a90' }}>Klikni na variantu → schval</div>
                        <button style={{ background: '#b7e94c', color: '#111', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Schválit vybranou →</button>
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
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(8, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '5px', flex: 1, overflow: 'hidden' }}>
                        {visualPhotos.slice(0, isMobile ? 12 : 24).map((photo, i) => (
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
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4,1fr)' : 'repeat(7,1fr)', gap: '4px', marginBottom: '4px', flexShrink: 0 }}>
                        {(isMobile ? ['Po', 'Út', 'St', 'Čt'] : ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']).map(d => (
                          <div key={d} style={{ textAlign: 'center', color: '#aaa', padding: '3px 0', fontWeight: 500, fontSize: '10px' }}>{d}</div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4,1fr)' : 'repeat(7,1fr)', gridAutoRows: '88px', gap: '4px', flex: 1, overflow: 'hidden' }}>
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
                        ].slice(0, isMobile ? 8 : 21).map((item, i) => (
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
                      <div className="hotovy-prispevek-layout" style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
                        <div className="foto" style={{ width: '220px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden' }}>
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
            {colorGroups.map(group => (
              <div
                key={group.hex}
                className={`start-palette-dot${selectedHex === group.hex ? ' active' : ''}`}
                style={{ background: group.hex }}
                title={group.name}
                onClick={() => handleDotClick(group)}
              />
            ))}
          </div>

          <div className="start-collection-label palette-label">
            {selectedHex
              ? colorGroups.find(g => g.hex === selectedHex)?.name ?? ''
              : 'Všechny styly'}
          </div>

          {/* Foto grid */}
          <div className="gallery-grid-wrap" style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'relative' }}>

              {/* Spacer — drží výšku, nikdy nemizne */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '3px',
                visibility: 'hidden',
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: '9/16', width: '100%' }} />
                ))}
              </div>

              {/* Outgoing layer */}
              {prevPhotos.length > 0 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '3px',
                  alignContent: 'start',
                  opacity: fading ? 0 : 1,
                  transition: 'opacity 0.8s ease',
                }}>
                  {prevPhotos.slice(0, 16).map((src, i) => (
                    <div key={i} style={{ aspectRatio: '9/16', width: '100%', overflow: 'hidden', borderRadius: '4px', position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Incoming layer */}
              <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '3px',
                alignContent: 'start',
                opacity: fading ? 0 : 1,
                transition: 'opacity 0.8s ease 0.1s',
              }}>
                {activePhotos.slice(0, 16).map((src, i) => (
                  <div
                    key={i}
                    style={{ aspectRatio: '9/16', width: '100%', overflow: 'hidden', borderRadius: '4px', position: 'relative', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => document.getElementById('vyzkousej')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div className="start-grid-overlay" style={{ opacity: hoveredCard === i ? 1 : 0 }}>
                      <button className="start-grid-overlay-btn">Vytvořit příspěvek →</button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
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
        <section id="vyzkousej" style={{ padding: '80px 40px', background: '#f5f3ee' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {startStep === 'entry' ? (
              /* ── KROK 0: 3 dlaždice ── */
              <div style={{ animation: 'entryFadeIn 0.3s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#5a7a00', marginBottom: 10 }}>
                    Vyzkoušej si Lucifera AI Light
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: '#111', lineHeight: 1.2, marginBottom: 12 }}>
                    Kde začínáš?
                  </h2>
                  <p style={{ fontSize: 15, color: '#777', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
                    Zjisti jak je na tom tvá značka — za pár minut.
                  </p>
                </div>
                {(() => {
                  const TILES = [
                    { type: 'web' as const, emoji: '🌐', title: 'Mám web', desc: 'Zadej URL — analyzujeme ho za 60 sekund.', img: '/placeholders/stock-vizualni knihovna/K03/k03-001.jpeg' },
                    { type: 'instagram' as const, emoji: '📱', title: 'Mám Instagram', desc: 'Zadej @handle — přečteme tvůj styl.', img: '/placeholders/stock-vizualni knihovna/K09/k09-001.png' },
                    { type: 'manual' as const, emoji: '✨', title: 'Začínám od nuly', desc: 'Vyber z možností — jsme tu pro tebe.', img: '/placeholders/stock-vizualni knihovna/K01/k01-001.jpeg' },
                  ]
                  return (
                    <>
                      {/* Mobile carousel */}
                      {isMobile && (
                        <div style={{ marginBottom: 16 }}>
                          {TILES.map((item, i) => i === tileIndex && (
                            <div key={item.type} style={{ background: '#fff', border: '1.5px solid #e8e4dc', borderRadius: 18, overflow: 'hidden', animation: 'entryFadeIn .3s ease' }}>
                              <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,.92)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                  {item.emoji}
                                </div>
                              </div>
                              <div style={{ padding: 20 }}>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>{item.title}</div>
                                <div style={{ fontSize: 14, color: '#777', marginBottom: 16 }}>{item.desc}</div>
                                <button
                                  onClick={() => { setStartEntryType(item.type); setStartInputValue(''); setStartStep('input'); }}
                                  style={{ width: '100%', background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                                >Začít →</button>
                              </div>
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                            <button onClick={() => setTileIndex(i => Math.max(0, i - 1))}
                              style={{ background: 'none', border: '1.5px solid #e8e4dc', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, opacity: tileIndex === 0 ? .3 : 1 }}
                            >←</button>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {[0, 1, 2].map(i => (
                                <div key={i} onClick={() => setTileIndex(i)}
                                  style={{ width: i === tileIndex ? 16 : 6, height: 6, borderRadius: 9999, background: i === tileIndex ? '#111' : '#ccc', cursor: 'pointer', transition: 'all .3s' }}
                                />
                              ))}
                            </div>
                            <button onClick={() => setTileIndex(i => Math.min(2, i + 1))}
                              style={{ background: 'none', border: '1.5px solid #e8e4dc', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, opacity: tileIndex === 2 ? .3 : 1 }}
                            >→</button>
                          </div>
                        </div>
                      )}
                      {/* Desktop grid */}
                      {!isMobile && (
                        <div className="start-entry-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                          {TILES.map(item => (
                            <div
                              key={item.type}
                              onClick={() => { setStartEntryType(item.type); setStartInputValue(''); setStartStep('input'); }}
                              style={{ background: '#fff', border: '1.5px solid #e8e4dc', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#b7e94c'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4dc'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                              <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                  {item.emoji}
                                </div>
                              </div>
                              <div style={{ padding: '16px 18px 20px' }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6, fontFamily: "'Playfair Display',serif" }}>{item.title}</div>
                                <div style={{ fontSize: 13, color: '#777', lineHeight: 1.55, marginBottom: 14 }}>{item.desc}</div>
                                <div style={{ background: '#111', color: '#fff', padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 600, textAlign: 'center' as const }}>Začít →</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )
                })()}
                <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 16 }}>
                  Zdarma · Bez registrace · Výsledky během minut
                </p>
              </div>

            ) : startStep === 'input' ? (
              /* ── KROK 1: Input karta ── */
              <div style={{ animation: 'entryFadeIn 0.3s ease' }}>
                <button
                  onClick={() => { setStartStep('entry'); setStartEntryType(null); setStartInputValue(''); setStartManualChoice(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#777', marginBottom: 28, padding: 0 }}
                >
                  ← Zpět
                </button>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fce0', border: '1px solid rgba(183,233,76,0.4)', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#5a7a00', fontWeight: 600, marginBottom: 28 }}>
                  {startEntryType === 'web' && '🌐 Analýza webu'}
                  {startEntryType === 'instagram' && '📱 Analýza Instagramu'}
                  {startEntryType === 'manual' && '✨ Začínám od nuly'}
                </div>
                <div style={{ background: '#fff', border: '1.5px solid #e8e4dc', borderRadius: 20, padding: '32px 40px', maxWidth: '100%' }}>

                  {/* sec-web */}
                  {startEntryType === 'web' && (
                    <div>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 8, marginTop: 0 }}>Zadej URL svého webu</h3>
                      <p style={{ fontSize: 14, color: '#777', marginBottom: 24, lineHeight: 1.6 }}>Stačí adresa — AI udělá screenshot, přečte texty a analyzuje značku za ~60 sekund.</p>
                      <input
                        type="url"
                        value={startInputValue}
                        onChange={e => setStartInputValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && startInputValue.trim()) { const p = new URLSearchParams({ type: startEntryType || 'web', url: startInputValue, returnTo: '/start' }); window.location.href = `/analyzing?${p.toString()}`; } }}
                        placeholder="https://vaseweb.cz"
                        style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid #e8e4dc', fontSize: 15, color: '#111', outline: 'none', boxSizing: 'border-box' as const, marginBottom: 16 }}
                        autoFocus
                      />
                      <button
                        onClick={() => { if (startInputValue.trim()) { const p = new URLSearchParams({ type: startEntryType || 'web', url: startInputValue, returnTo: '/start' }); window.location.href = `/analyzing?${p.toString()}`; } }}
                        disabled={!startInputValue.trim()}
                        style={{ width: '100%', padding: '13px 0', borderRadius: 12, background: startInputValue.trim() ? '#b7e94c' : '#e8e4dc', color: '#111', border: 'none', fontSize: 15, fontWeight: 700, cursor: startInputValue.trim() ? 'pointer' : 'not-allowed', transition: 'background .2s' }}
                      >Analyzovat →</button>
                      <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 12 }}>Analýza trvá ~60 sekund · Zdarma</p>
                    </div>
                  )}

                  {/* sec-instagram */}
                  {startEntryType === 'instagram' && (
                    <div>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 8, marginTop: 0 }}>Zadej svůj Instagram</h3>
                      <p style={{ fontSize: 14, color: '#777', marginBottom: 24, lineHeight: 1.6 }}>Přečteme tvůj profil, styl a vizuální identitu — do pár minut máš přehled.</p>
                      <div style={{ position: 'relative', marginBottom: 16 }}>
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: 15, pointerEvents: 'none' as const }}>@</span>
                        <input
                          type="text"
                          value={startInputValue}
                          onChange={e => setStartInputValue(e.target.value.replace(/^@/, ''))}
                          onKeyDown={e => { if (e.key === 'Enter' && startInputValue.trim()) { const p = new URLSearchParams({ type: 'instagram', url: `https://www.instagram.com/${startInputValue.replace(/^@/, '')}`, returnTo: '/start' }); window.location.href = `/analyzing?${p.toString()}`; } }}
                          placeholder="vashandle"
                          style={{ width: '100%', padding: '13px 16px 13px 32px', borderRadius: 12, border: '1.5px solid #e8e4dc', fontSize: 15, color: '#111', outline: 'none', boxSizing: 'border-box' as const }}
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => { if (startInputValue.trim()) { const p = new URLSearchParams({ type: 'instagram', url: `https://www.instagram.com/${startInputValue.replace(/^@/, '')}`, returnTo: '/start' }); window.location.href = `/analyzing?${p.toString()}`; } }}
                        disabled={!startInputValue.trim()}
                        style={{ width: '100%', padding: '13px 0', borderRadius: 12, background: startInputValue.trim() ? '#b7e94c' : '#e8e4dc', color: '#111', border: 'none', fontSize: 15, fontWeight: 700, cursor: startInputValue.trim() ? 'pointer' : 'not-allowed', transition: 'background .2s' }}
                      >Analyzovat →</button>
                      <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 12 }}>Přečteme tvůj styl a vizuální identitu · Zdarma</p>
                    </div>
                  )}

                  {/* sec-manual — multi-step */}
                  {startEntryType === 'manual' && (
                    <div>
                      {/* Progress bar */}
                      <div style={{ display:'flex', gap:5, marginBottom:24 }}>
                        {['basic','ton','audience','colors','formats'].map((s,i) => (
                          <div key={s} style={{ flex:1, height:4, borderRadius:4,
                            background: manualStep === s ? '#b7e94c'
                              : ['basic','ton','audience','colors','formats'].indexOf(manualStep) > i ? '#5a7a00'
                              : '#e8e4dc'
                          }} />
                        ))}
                      </div>

                      {/* ── BASIC ── */}
                      {manualStep === 'basic' && (
                        <div>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase' as const, color:'#5a7a00', marginBottom:8 }}>Krok 1 z 5 — Tvoje základy</div>
                          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#111', marginBottom:6 }}>Řekni nám o své značce.</div>
                          <div style={{ fontSize:14, color:'#aaa', marginBottom:24 }}>Čím víc víme, tím přesnější obsah dostaneš.</div>

                          <div style={{ marginBottom:16 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:8, textTransform:'uppercase' as const, letterSpacing:'.06em' }}>Jak ti říkají?</div>
                            <input type="text" value={manualName} onChange={e => setManualName(e.target.value)}
                              placeholder="Jméno nebo název značky"
                              style={{ width:'100%', border:'1.5px solid #e8e4dc', borderRadius:10, padding:'12px 16px', fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' as const }}
                              onFocus={e => { e.currentTarget.style.borderColor='#b7e94c'; }}
                              onBlur={e => { e.currentTarget.style.borderColor='#e8e4dc'; }}
                            />
                          </div>

                          <div style={{ marginBottom:16 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:8, textTransform:'uppercase' as const, letterSpacing:'.06em' }}>Co nabízíš? (vyber 1–2)</div>
                            <div style={{ display:'flex', flexWrap:'wrap' as const, gap:7 }}>
                              {['Koučink','Terapie & poradenství','Kurzy & vzdělávání','Kreativní služba','Produkty & e-shop','Zdraví & péče','Konzultace','Řemeslo & výroba','Jiné'].map(t => {
                                const sel = manualWhat.includes(t)
                                return (
                                  <div key={t} onClick={() => setManualWhat(prev => sel ? prev.filter(x=>x!==t) : prev.length<2 ? [...prev,t] : prev)}
                                    style={{ padding:'7px 14px', borderRadius:20, border:`1.5px solid ${sel?'#b7e94c':'#e8e4dc'}`, fontSize:13, cursor:'pointer', background:sel?'#b7e94c':'#fff', color:sel?'#1a2a00':'#555', transition:'all .15s', userSelect:'none' as const }}
                                  >{t}</div>
                                )
                              })}
                            </div>
                          </div>

                          <div style={{ marginBottom:16 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:8, textTransform:'uppercase' as const, letterSpacing:'.06em' }}>Kde se nacházíš?</div>
                            <div style={{ display:'flex', flexDirection:'column' as const, gap:7 }}>
                              {['Začínám — buduju základ','Mám klienty, chci růst','Rebranding & nový směr','Škáluji a rozšiřuji'].map(t => (
                                <div key={t} onClick={() => setManualPhase(t)}
                                  style={{ padding:'10px 14px', borderRadius:10, border:`1.5px solid ${manualPhase===t?'#b7e94c':'#e8e4dc'}`, fontSize:13, cursor:'pointer', background:manualPhase===t?'#f0fce0':'#fff', color:'#333', transition:'all .15s', userSelect:'none' as const }}
                                >{t}</div>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginBottom:16 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:8, textTransform:'uppercase' as const, letterSpacing:'.06em' }}>Hlavní cíl na sítích?</div>
                            <div style={{ display:'flex', flexDirection:'column' as const, gap:7 }}>
                              {['Získávat nové klienty','Budovat důvěru & autoritu','Vzdělávat a inspirovat','Budovat komunitu','Prodávat produkty'].map(t => (
                                <div key={t} onClick={() => setManualGoal(t)}
                                  style={{ padding:'10px 14px', borderRadius:10, border:`1.5px solid ${manualGoal===t?'#b7e94c':'#e8e4dc'}`, fontSize:13, cursor:'pointer', background:manualGoal===t?'#f0fce0':'#fff', color:'#333', transition:'all .15s', userSelect:'none' as const }}
                                >{t}</div>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginBottom:16 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:8, textTransform:'uppercase' as const, letterSpacing:'.06em' }}>Čím se odlišuješ? <span style={{ fontWeight:400, color:'#bbb' }}>(volitelné)</span></div>
                            <textarea value={manualDiff} onChange={e => setManualDiff(e.target.value.slice(0,150))}
                              placeholder="Čím jsi jiný než ostatní ve svém oboru..."
                              rows={2}
                              style={{ width:'100%', border:'1.5px solid #e8e4dc', borderRadius:10, padding:'12px 16px', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' as const, resize:'none' as const }}
                              onFocus={e => { e.currentTarget.style.borderColor='#b7e94c'; }}
                              onBlur={e => { e.currentTarget.style.borderColor='#e8e4dc'; }}
                            />
                            <div style={{ fontSize:11, color:'#ccc', textAlign:'right' as const }}>{manualDiff.length}/150</div>
                          </div>

                          <div style={{ marginBottom:24 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:8, textTransform:'uppercase' as const, letterSpacing:'.06em' }}>Co chceš aby zákazník pocítil? <span style={{ fontWeight:400, color:'#bbb' }}>(volitelné)</span></div>
                            <textarea value={manualFeel} onChange={e => setManualFeel(e.target.value)}
                              placeholder="Inspiraci, důvěru, klid, odvahu..."
                              rows={2}
                              style={{ width:'100%', border:'1.5px solid #e8e4dc', borderRadius:10, padding:'12px 16px', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' as const, resize:'none' as const }}
                              onFocus={e => { e.currentTarget.style.borderColor='#b7e94c'; }}
                              onBlur={e => { e.currentTarget.style.borderColor='#e8e4dc'; }}
                            />
                          </div>

                          <button onClick={() => { if(manualName.trim()) setManualStep('ton') }}
                            disabled={!manualName.trim()}
                            style={{ width:'100%', padding:'13px 0', borderRadius:12, background:manualName.trim()?'#111':'#e8e4dc', color:manualName.trim()?'#fff':'#bbb', border:'none', fontSize:14, fontWeight:600, cursor:manualName.trim()?'pointer':'not-allowed', fontFamily:'inherit', transition:'all .2s' }}
                          >Pokračovat →</button>
                        </div>
                      )}

                      {/* ── TON ── */}
                      {manualStep === 'ton' && (
                        <div>
                          <button onClick={() => setManualStep('basic')}
                            style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#888', marginBottom:16, display:'flex', alignItems:'center', gap:6, padding:0, fontFamily:'inherit' }}
                          >← Zpět</button>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase' as const, color:'#5a7a00', marginBottom:8 }}>Krok 2 z 5 — Tón komunikace</div>
                          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#111', marginBottom:6 }}>Jak mluvíš ke svým zákazníkům?</div>
                          <div style={{ fontSize:14, color:'#aaa', marginBottom:20 }}>Každá karta ukazuje ukázku jak bude AI psát za tebe.</div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
                            {TONES.map(t => {
                              const sel = manualTon === t.id
                              return (
                                <div key={t.id} onClick={() => setManualTon(t.id)}
                                  style={{ border:`2px solid ${sel?'#b7e94c':'#e8e4dc'}`, borderRadius:14, overflow:'hidden', cursor:'pointer', background:sel?'#f0fce0':'#fff', transition:'all .2s' }}
                                >
                                  <div style={{ height:120, overflow:'hidden' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={t.img} alt={t.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                                  </div>
                                  <div style={{ padding:'12px 14px' }}>
                                    <div style={{ fontSize:13, fontWeight:700, color:'#111', marginBottom:6 }}>{t.e} {t.name}</div>
                                    <div style={{ fontSize:11, color:'#777', fontStyle:'italic', lineHeight:1.5, background:'#f7f7f5', padding:'8px 10px', borderRadius:8 }}>{t.example}</div>
                                  </div>
                                  {sel && (
                                    <div style={{ margin:'0 14px 12px', background:'#b7e94c', borderRadius:8, padding:'4px 0', textAlign:'center' as const, fontSize:11, fontWeight:700, color:'#1a2a00' }}>✓ Vybraný styl</div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <button onClick={() => { if(manualTon) setManualStep('audience') }}
                            disabled={!manualTon}
                            style={{ width:'100%', padding:'13px 0', borderRadius:12, background:manualTon?'#111':'#e8e4dc', color:manualTon?'#fff':'#bbb', border:'none', fontSize:14, fontWeight:600, cursor:manualTon?'pointer':'not-allowed', fontFamily:'inherit', transition:'all .2s' }}
                          >Pokračovat →</button>
                        </div>
                      )}

                      {/* ── AUDIENCE ── */}
                      {manualStep === 'audience' && (
                        <div>
                          <button onClick={() => setManualStep('ton')}
                            style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#888', marginBottom:16, display:'flex', alignItems:'center', gap:6, padding:0, fontFamily:'inherit' }}
                          >← Zpět</button>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase' as const, color:'#5a7a00', marginBottom:8 }}>Krok 3 z 5 — Cílová skupina</div>
                          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#111', marginBottom:6 }}>Pro koho tvoříš obsah?</div>
                          <div style={{ fontSize:14, color:'#aaa', marginBottom:20 }}>Vyber 1–2 skupiny — AI přizpůsobí jazyk.</div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
                            {AUDIENCES.map(a => {
                              const sel = manualAudience.includes(a.id)
                              return (
                                <div key={a.id} onClick={() => setManualAudience(prev => sel ? prev.filter(x=>x!==a.id) : prev.length<2 ? [...prev,a.id] : prev)}
                                  style={{ border:`2px solid ${sel?'#b7e94c':'transparent'}`, borderRadius:14, overflow:'hidden', cursor:'pointer', background:a.bg, padding:'16px', transition:'all .2s', position:'relative' as const }}
                                >
                                  <div style={{ fontSize:28, marginBottom:8 }}>{a.e}</div>
                                  <div style={{ fontSize:13, fontWeight:700, color:'#111', marginBottom:4 }}>{a.name}</div>
                                  <div style={{ fontSize:11, color:'#666', marginBottom:8, lineHeight:1.4 }}>{a.desc}</div>
                                  <div style={{ display:'inline-block', background:'rgba(183,233,76,0.25)', color:'#5a7a00', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20 }}>{a.tag}</div>
                                  {sel && <div style={{ position:'absolute', top:10, right:10, width:22, height:22, borderRadius:'50%', background:'#b7e94c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#1a2a00' }}>✓</div>}
                                </div>
                              )
                            })}
                          </div>
                          <button onClick={() => { if(manualAudience.length>0) setManualStep('colors') }}
                            disabled={manualAudience.length===0}
                            style={{ width:'100%', padding:'13px 0', borderRadius:12, background:manualAudience.length>0?'#111':'#e8e4dc', color:manualAudience.length>0?'#fff':'#bbb', border:'none', fontSize:14, fontWeight:600, cursor:manualAudience.length>0?'pointer':'not-allowed', fontFamily:'inherit', transition:'all .2s' }}
                          >Pokračovat →</button>
                        </div>
                      )}

                      {/* ── COLORS ── */}
                      {manualStep === 'colors' && (
                        <div>
                          <button onClick={() => setManualStep('audience')}
                            style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#888', marginBottom:16, display:'flex', alignItems:'center', gap:6, padding:0, fontFamily:'inherit' }}
                          >← Zpět</button>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase' as const, color:'#5a7a00', marginBottom:8 }}>Krok 4 z 5 — Vizuální styl</div>
                          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#111', marginBottom:6 }}>Která barevnost ti sedí?</div>
                          <div style={{ fontSize:14, color:'#aaa', marginBottom:20 }}>AI vybere vizuály ze správné kolekce.</div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
                            {COLOR_STYLES.map(c => {
                              const sel = manualColors.includes(c.id)
                              return (
                                <div key={c.id} onClick={() => setManualColors(prev => sel ? prev.filter(x=>x!==c.id) : prev.length<2 ? [...prev,c.id] : prev)}
                                  style={{ border:`2px solid ${sel?'#b7e94c':'#e8e4dc'}`, borderRadius:12, overflow:'hidden', cursor:'pointer', background:sel?'#f0fce0':'#fff', transition:'all .2s' }}
                                >
                                  <div style={{ height:90, overflow:'hidden' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={c.img} alt={c.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                                  </div>
                                  <div style={{ padding:'10px 12px' }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:'#111' }}>{c.name}</div>
                                    <div style={{ fontSize:11, color:'#888' }}>{c.desc}</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <button onClick={() => { if(manualColors.length>0) setManualStep('formats') }}
                            disabled={manualColors.length===0}
                            style={{ width:'100%', padding:'13px 0', borderRadius:12, background:manualColors.length>0?'#111':'#e8e4dc', color:manualColors.length>0?'#fff':'#bbb', border:'none', fontSize:14, fontWeight:600, cursor:manualColors.length>0?'pointer':'not-allowed', fontFamily:'inherit', transition:'all .2s' }}
                          >Pokračovat →</button>
                        </div>
                      )}

                      {/* ── FORMATS ── */}
                      {manualStep === 'formats' && (
                        <div>
                          <button onClick={() => setManualStep('colors')}
                            style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#888', marginBottom:16, display:'flex', alignItems:'center', gap:6, padding:0, fontFamily:'inherit' }}
                          >← Zpět</button>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase' as const, color:'#5a7a00', marginBottom:8 }}>Krok 5 z 5 — Formát obsahu</div>
                          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#111', marginBottom:6 }}>Co chceš dostávat?</div>
                          <div style={{ fontSize:14, color:'#aaa', marginBottom:20 }}>Vyber formáty — AI připraví obsah přesně pro tebe.</div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
                            {FORMATS.map(f => {
                              const sel = manualFormats.includes(f.id)
                              return (
                                <div key={f.id} onClick={() => setManualFormats(prev => prev.includes(f.id) ? prev.filter(x=>x!==f.id) : [...prev,f.id])}
                                  style={{ border:`1.5px solid ${sel?'#b7e94c':'#e8e4dc'}`, borderRadius:12, padding:'13px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:10, background:sel?'#f0fce0':'#fff', transition:'all .2s' }}
                                >
                                  <div style={{ fontSize:22, flexShrink:0 }}>{f.e}</div>
                                  <div style={{ flex:1 }}>
                                    <div style={{ fontSize:13, fontWeight:600, color:'#111' }}>{f.name}</div>
                                    <div style={{ fontSize:11, color:'#888' }}>{f.desc}</div>
                                  </div>
                                  {sel && <div style={{ width:20, height:20, borderRadius:'50%', background:'#b7e94c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#1a2a00', flexShrink:0 }}>✓</div>}
                                </div>
                              )
                            })}
                          </div>
                          <button onClick={() => { if(manualFormats.length>0) { const p = new URLSearchParams({ type: 'manual', name: manualName, what: manualWhat.join(','), ton: manualTon || '', returnTo: '/start' }); window.location.href = `/analyzing?${p.toString()}`; } }}
                            disabled={manualFormats.length===0}
                            style={{ width:'100%', padding:'13px 0', borderRadius:12, background:manualFormats.length>0?'#111':'#e8e4dc', color:manualFormats.length>0?'#fff':'#bbb', border:'none', fontSize:14, fontWeight:600, cursor:manualFormats.length>0?'pointer':'not-allowed', fontFamily:'inherit', transition:'all .2s' }}
                          >Spustit analýzu ✨</button>
                          <p style={{ textAlign:'center', fontSize:11, color:'#bbb', marginTop:10 }}>Zdarma · Bez webu · Výsledky během minut</p>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>

            ) : startStep === 'mood' ? (
              /* ── KROK 2: Mood board ── */
              <div style={{ animation: 'entryFadeIn 0.3s ease' }}>
                <button
                  onClick={() => setStartStep('input')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#777', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                >
                  ← Zpět
                </button>
                {/* Progress bar — 5 segmentů, krok 2 svítí */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 36 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i === 1 ? '#b7e94c' : '#e8e4dc', transition: 'background .3s' }} />
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#5a7a00', marginBottom: 12 }}>Krok 2 ze 5</div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: '#111', lineHeight: 1.2, marginBottom: 12 }}>
                    Jaký vizuální styl tě oslovuje?
                  </h2>
                  <p style={{ fontSize: 15, color: '#777', maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
                    Vyber až 2 nálady — pomůže nám to přesně nastavit tvůj brand styl.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
                  {MOODS.map(mood => {
                    const selected = startMoodSelected.includes(mood.id);
                    return (
                      <div
                        key={mood.id}
                        onClick={() => {
                          setStartMoodSelected(prev => {
                            if (prev.includes(mood.id)) return prev.filter(x => x !== mood.id);
                            if (prev.length >= 2) return prev;
                            return [...prev, mood.id];
                          });
                        }}
                        style={{
                          borderRadius: 16,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: selected ? '2px solid #b7e94c' : '2px solid transparent',
                          boxShadow: selected ? '0 0 0 2px rgba(183,233,76,0.27)' : '0 2px 12px rgba(0,0,0,0.06)',
                          transition: 'all 0.2s ease',
                          background: '#fff',
                        }}
                      >
                        <div style={{ height: 140, overflow: 'hidden', position: 'relative' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mood.img} alt={mood.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          {selected && (
                            <div style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', background: '#b7e94c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#1a2a00' }}>
                              ✓
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{mood.name}</div>
                          <div style={{ fontSize: 12, color: '#777' }}>{mood.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => { if (startMoodSelected.length > 0) setStartStep('formats'); }}
                  style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: startMoodSelected.length > 0 ? '#b7e94c' : '#e8e4dc', color: '#111', border: 'none', fontSize: 15, fontWeight: 700, cursor: startMoodSelected.length > 0 ? 'pointer' : 'not-allowed', transition: 'background .2s', fontFamily: 'inherit' }}
                >
                  {startMoodSelected.length > 0 ? 'Pokračovat →' : 'Vyber aspoň jednu náladu'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 10 }}>
                  Nebo{' '}
                  <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setStartStep('formats')}>přeskočit</span>
                </p>
              </div>

            ) : startStep === 'formats' ? (
              /* ── KROK 4: Formáty obsahu ── */
              <div style={{ animation: 'entryFadeIn .3s ease' }}>
                <button
                  onClick={() => setStartStep('mood')}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#888', marginBottom:20, display:'flex', alignItems:'center', gap:6, padding:0, fontFamily:'inherit' }}
                >← Zpět</button>

                <div style={{ display:'flex', gap:6, marginBottom:28 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ height:4, flex:1, borderRadius:4, background: i===3 ? '#b7e94c' : i<3 ? '#5a7a00' : '#e8e4dc' }} />
                  ))}
                </div>

                <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase' as const, color:'#5a7a00', marginBottom:8 }}>
                  Krok 4 z 5 — Formát obsahu
                </div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:'#111', marginBottom:6, lineHeight:1.25 }}>
                  Co chceš dostávat?
                </div>
                <div style={{ fontSize:14, color:'#aaa', marginBottom:24 }}>
                  Vyber formáty — AI připraví obsah přesně pro tebe.
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:20 }}>
                  {[
                    { id:'instagram', emoji:'📸', name:'Instagram post', desc:'Fotka + caption + hashtagy' },
                    { id:'reels',     emoji:'🎬', name:'Reels / Video',  desc:'Skript + hook + CTA' },
                    { id:'facebook',  emoji:'💬', name:'Facebook post',  desc:'Delší text, komunita' },
                    { id:'linkedin',  emoji:'💼', name:'LinkedIn',       desc:'Odborný příspěvek' },
                    { id:'newsletter',emoji:'📧', name:'Newsletter',     desc:'Email pro odběratele' },
                    { id:'stories',   emoji:'✨', name:'Stories',        desc:'Krátký obsah, 24h' },
                  ].map(f => {
                    const isSel = startFormats.includes(f.id)
                    return (
                      <div
                        key={f.id}
                        onClick={() => setStartFormats(prev =>
                          prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id]
                        )}
                        style={{
                          border: `1.5px solid ${isSel ? '#b7e94c' : '#e8e4dc'}`,
                          borderRadius:12, padding:'13px 14px',
                          cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                          background: isSel ? '#f0fce0' : '#fff',
                          transition:'all .2s',
                        }}
                      >
                        <div style={{ fontSize:22, flexShrink:0 }}>{f.emoji}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#111' }}>{f.name}</div>
                          <div style={{ fontSize:11, color:'#888' }}>{f.desc}</div>
                        </div>
                        {isSel && (
                          <div style={{ width:20, height:20, borderRadius:'50%', background:'#b7e94c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#1a2a00', flexShrink:0 }}>✓</div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div style={{ fontSize:12, color:'#bbb', textAlign:'center' as const, marginBottom:12 }}>
                  {startFormats.length === 0 && 'Vyber aspoň jeden formát'}
                  {startFormats.length > 0 && `${startFormats.length} formát${startFormats.length > 1 ? 'y' : ''} vybrán${startFormats.length > 1 ? 'y' : ''}`}
                </div>

                <button
                  onClick={() => { if(startFormats.length > 0) { const p = new URLSearchParams({ type: startEntryType || 'web', url: startInputValue, returnTo: '/start' }); window.location.href = `/analyzing?${p.toString()}`; } }}
                  style={{
                    width:'100%',
                    background: startFormats.length > 0 ? '#111' : '#e8e4dc',
                    color: startFormats.length > 0 ? '#fff' : '#bbb',
                    border:'none', borderRadius:12, padding:15,
                    fontSize:14, fontWeight:600,
                    cursor: startFormats.length > 0 ? 'pointer' : 'default',
                    fontFamily:'inherit', transition:'all .2s',
                  }}
                >
                  Spustit analýzu ✨
                </button>
              </div>

            ) : (
              /* ── KROK 5: StartAnalyzer ── */
              <div style={{ animation: 'entryFadeIn 0.3s ease' }}>
                <button
                  onClick={() => setStartStep('formats')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#777', marginBottom: 24, padding: 0 }}
                >
                  ← Zpět
                </button>
                <StartAnalyzer
                  diagnostika
                  hideIntro
                  initialUrl={
                    startEntryType === 'web'
                      ? startInputValue
                      : startEntryType === 'instagram'
                      ? `https://www.instagram.com/${startInputValue.replace(/^@/, '')}`
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        </section>

        {/* 03 · CO VIDÍŠ V DASHBOARDU */}
        <section className="rtg-section-light">
          <div className="rtg-container">
            <div className="rtg-eyebrow" style={{ marginBottom: '24px' }}>03 · co vidíš v dashboardu</div>
            <h2 className="rtg-h2" style={{ marginBottom: '40px' }}>Vybereš variantu.<br /><em>Schválíš. Jdeš dál.</em></h2>

            <div className="rtg-demo-frame" style={{ maxWidth: '100%', margin: 0 }}>
              <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e8e8e4', cursor: 'default' }}>
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
                  {[
                    { label: 'Ke schválení',     key: 'obsah'      },
                    { label: 'Plánování',         key: 'planovani'  },
                    { label: 'Vizuální knihovna', key: 'knihovna'   },
                    { label: 'Texty',             key: 'texty'      },
                    { label: 'Statistiky',        key: 'statistiky' },
                  ].map(tab => (
                    <div
                      key={tab.key}
                      onClick={() => setRtgActiveTab(tab.key)}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = '#111' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = rtgActiveTab === tab.key ? '#111' : '#888' }}
                      style={{
                        fontSize: '11px', padding: '9px 16px', whiteSpace: 'nowrap',
                        background: 'transparent', cursor: 'pointer',
                        borderBottom: rtgActiveTab === tab.key ? '2px solid #b7e94c' : '2px solid transparent',
                        color: rtgActiveTab === tab.key ? '#111' : '#888',
                        fontWeight: rtgActiveTab === tab.key ? 600 : 400,
                        fontFamily: 'inherit',
                      }}
                    >{tab.label}</div>
                  ))}
                </div>

                <div style={{ background: '#fff', padding: '16px' }}>

                  {/* TAB: Ke schválení */}
                  {rtgActiveTab === 'obsah' && (<>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>Ke schválení tento týden</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ height: '3px', width: '80px', background: '#e8e8e4', borderRadius: '2px' }}>
                          <div style={{ height: '3px', width: '20%', background: '#111', borderRadius: '2px' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#9a9a90' }}>2 / 10</div>
                      </div>
                    </div>

                    {/* Video karty A/B */}
                    <div className="ab-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginBottom: '12px' }}>
                      {[
                        { idx: 0, variant: 'A', hook: '"Ráno. Okno. Ticho před dnem."', sub: 'Storytelling · přirozený moment', body: <>Každé ráno si říkám – dneska to zvládnu.<br />A pak přijde ten moment, kdy všechno zpomalí.<br />Okno. Světlo. Ticho.<br /><br />To je tvůj obsah. Každý týden. Bez námahy.</>, poster: '/images/demo/demo-video-a.jpg', src: '/images/demo/demo-video-a.mp4', dur: '15s' },
                        { idx: 1, variant: 'B', hook: '"Tohle ti nikdo neřekne."',       sub: 'Hook přímý · osobní tón',       body: <>Strávila jsem hodiny přemýšlením co postovat.<br />Pak jsem to vzdala.<br />A nechala systém pracovat za mě.<br /><br />3 posty týdně. Hotovo za 5 minut.</>,                   poster: '/images/demo/demo-video-b.jpg', src: '/images/demo/demo-video-b.mp4', dur: '12s' },
                      ].map(card => (
                        <div
                          key={card.idx}
                          onClick={() => setRtgActiveCard(card.idx)}
                          onMouseEnter={e => { if (rtgActiveCard !== card.idx) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.005)' }}
                          onMouseLeave={e => { if (rtgActiveCard !== card.idx) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
                          style={{
                            display: 'flex', gap: '16px', alignItems: 'flex-start',
                            background: '#fff', borderRadius: '12px', padding: '14px',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            border: rtgActiveCard === card.idx ? '2px solid #111' : '1px solid #e8e4dc',
                            transform: rtgActiveCard === card.idx ? 'scale(1.01)' : 'scale(1)',
                          }}
                        >
                          <div style={{ flexShrink: 0, width: '140px', aspectRatio: '9/16', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                            <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} poster={card.poster}>
                              <source src={card.src} type="video/mp4" />
                            </video>
                            <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '9px', padding: '2px 7px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>▶ {card.dur} · Reels</div>
                          </div>
                          <div style={{ flex: 1, paddingTop: '4px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: '#b7e94c', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>VIDEO · Reels</div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '6px' }}>{card.hook}</p>
                            <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>{card.sub}</p>
                            <div style={{ fontSize: '11px', color: '#555', background: '#f5f3ee', borderRadius: '6px', padding: '8px 10px', lineHeight: 1.6 }}>{card.body}</div>
                            <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: rtgActiveCard === card.idx ? '#111' : '#f0f0f0', color: rtgActiveCard === card.idx ? '#fff' : '#666' }}>Varianta {card.variant}</span>
                              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: '#f0f0f0', color: '#666' }}>Instagram</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Grafiky */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                      {[
                        { idx: 2, src: '/images/demo/demo-grafika-a.jpg', pos: 'center top', text: '"Kdy jsi naposledy stála a jen... byla?"', sub: 'Soft feminine · lifestyle' },
                        { idx: 3, src: '/images/demo/demo-grafika-b.jpg', pos: 'center',     text: '"Volnost má svůj rytmus."',              sub: 'Editorial · atmosféra' },
                      ].map(card => (
                        <div
                          key={card.idx}
                          onClick={() => setRtgActiveCard(card.idx)}
                          onMouseEnter={e => { if (rtgActiveCard !== card.idx) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.005)' }}
                          onMouseLeave={e => { if (rtgActiveCard !== card.idx) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
                          style={{
                            background: '#fafaf7', borderRadius: '10px', padding: '12px',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            border: rtgActiveCard === card.idx ? '2px solid #111' : '1px solid #e8e8e4',
                            transform: rtgActiveCard === card.idx ? 'scale(1.01)' : 'scale(1)',
                          }}
                        >
                          <div style={{ display: 'inline-flex', fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', background: '#dcfce7', color: '#15803d', letterSpacing: '.06em', marginBottom: '8px' }}>◻ GRAFIKA</div>
                          <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '10px', marginBottom: '8px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={card.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: card.pos }} />
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '2px' }}>{card.text}</div>
                          <div style={{ fontSize: '10px', color: '#9a9a90' }}>{card.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8e8e4' }}>
                      <div style={{ fontSize: '11px', color: rtgApproved ? '#15803d' : '#9a9a90' }}>
                        {rtgApproved ? '✓ Varianta schválena' : 'Klikni na variantu → schval'}
                      </div>
                      <button
                        onClick={() => { if (rtgActiveCard !== null) setRtgApproved(true) }}
                        onMouseEnter={e => { if (!rtgApproved) { (e.currentTarget as HTMLButtonElement).style.background = '#a0d940'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)' } }}
                        onMouseLeave={e => { if (!rtgApproved) { (e.currentTarget as HTMLButtonElement).style.background = '#b7e94c'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' } }}
                        style={{ background: rtgApproved ? '#15803d' : '#b7e94c', color: rtgApproved ? '#fff' : '#111', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
                      >{rtgApproved ? 'Schváleno ✓' : 'Schválit vybranou →'}</button>
                    </div>
                  </>)}

                  {/* TAB: Plánování */}
                  {rtgActiveTab === 'planovani' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #e8e8e4', background: '#fff', color: '#9a9a90', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>‹</button>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: '#111' }}>Březen 2026</div>
                          <button style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #e8e8e4', background: '#fff', color: '#9a9a90', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>›</button>
                        </div>
                        <button style={{ background: '#111', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Naplánovat</button>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', border: '1px solid #111', background: '#fafaf7', cursor: 'pointer' }}><div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#1d4ed8' }} /><span style={{ fontSize: '11px', color: '#555' }}>Instagram</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', border: '1px solid #111', background: '#fafaf7', cursor: 'pointer' }}><div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#15803d' }} /><span style={{ fontSize: '11px', color: '#555' }}>Facebook</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', border: '1px solid #111', background: '#fafaf7', cursor: 'pointer' }}><div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6b7c2e' }} /><span style={{ fontSize: '11px', color: '#555' }}>LinkedIn</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', border: '1px solid #e8e8e4', cursor: 'pointer' }}><div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#993556' }} /><span style={{ fontSize: '11px', color: '#9a9a90' }}>Newsletter</span></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
                        {['Po','Út','St','Čt','Pá','So','Ne'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: '#9a9a90', padding: '6px 0' }}>{d}</div>)}
                        <div style={{ opacity: .4, minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>24</div></div>
                        <div style={{ opacity: .4, minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>25</div></div>
                        <div style={{ minHeight: '52px', background: '#f5f9f0', borderRadius: '6px', padding: '4px', border: '1px solid #b5d45c' }}><div style={{ fontSize: '11px', color: '#6b7c2e', fontWeight: 600 }}>26</div><div style={{ fontSize: '8px', padding: '1px 3px', borderRadius: '3px', background: '#fbeaf0', color: '#993556', marginTop: '2px' }}>Stories</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>27</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>28</div><div style={{ fontSize: '8px', padding: '1px 3px', borderRadius: '3px', background: '#dbeafe', color: '#1d4ed8', marginTop: '2px' }}>▶ Reels</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>29</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>30</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>31</div><div style={{ fontSize: '8px', padding: '1px 3px', borderRadius: '3px', background: '#dcfce7', color: '#15803d', marginTop: '2px' }}>Grafika</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>1</div><div style={{ fontSize: '8px', padding: '1px 3px', borderRadius: '3px', background: '#f0f7e0', color: '#6b7c2e', marginTop: '2px' }}>Newsletter</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>2</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>3</div><div style={{ fontSize: '8px', padding: '1px 3px', borderRadius: '3px', background: '#dbeafe', color: '#1d4ed8', marginTop: '2px' }}>▶ Reels</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>4</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>5</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>6</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>7</div><div style={{ fontSize: '8px', padding: '1px 3px', borderRadius: '3px', background: '#dcfce7', color: '#15803d', marginTop: '1px' }}>Carousel</div><div style={{ fontSize: '8px', padding: '1px 3px', borderRadius: '3px', background: '#fbeaf0', color: '#993556', marginTop: '1px' }}>Stories</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>8</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>9</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>10</div><div style={{ fontSize: '8px', padding: '1px 3px', borderRadius: '3px', background: '#dbeafe', color: '#1d4ed8', marginTop: '2px' }}>▶ Reels</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>11</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>12</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>13</div></div>
                        <div style={{ minHeight: '52px', background: '#fafaf7', borderRadius: '6px', padding: '4px', border: '1px solid #f0f0ec' }}><div style={{ fontSize: '11px', color: '#9a9a90' }}>14</div><div style={{ fontSize: '8px', padding: '1px 3px', borderRadius: '3px', background: '#f0f7e0', color: '#6b7c2e', marginTop: '2px' }}>Newsletter</div></div>
                      </div>
                    </div>
                  )}

                  {/* TAB: Vizuální knihovna */}
                  {rtgActiveTab === 'knihovna' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>Vizuální knihovna</div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '100px', border: '1px solid #111', background: '#111', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Vše</button>
                          <button style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '100px', border: '1px solid #e8e8e4', background: 'transparent', color: '#9a9a90', cursor: 'pointer', fontFamily: 'inherit' }}>Fotky</button>
                          <button style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '100px', border: '1px solid #e8e8e4', background: 'transparent', color: '#9a9a90', cursor: 'pointer', fontFamily: 'inherit' }}>Videa</button>
                          <button style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '100px', border: '1px solid #e8e8e4', background: 'transparent', color: '#9a9a90', cursor: 'pointer', fontFamily: 'inherit' }}>B-roll</button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '10px', color: '#c0c0b8', letterSpacing: '.06em', textTransform: 'uppercase', marginRight: '4px' }}>Paleta</span>
                        {K10_PALETTE.map((hex, i) => (
                          <div key={i} style={{ width: '18px', height: '18px', borderRadius: '50%', background: hex, cursor: 'pointer', border: i === 0 ? '2px solid #111' : '1.5px solid transparent' }} />
                        ))}
                      </div>
                      <div style={{ columns: '4', columnGap: '6px' }}>
                        {K10_PHOTOS.map((src, i) => (
                          <div key={i} style={{ breakInside: 'avoid', marginBottom: '6px', borderRadius: '8px', overflow: 'hidden', aspectRatio: '9/16', background: '#f0ede6' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '6px', border: '1px solid #e8e8e4', background: 'transparent', color: '#7a7a70', cursor: 'pointer', fontFamily: 'inherit' }}>+ Nahrát vlastní</button>
                        <button style={{ background: '#111', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Do kolekce</button>
                      </div>
                    </div>
                  )}

                  {/* TAB: Texty */}
                  {rtgActiveTab === 'texty' && (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#111', marginBottom: '10px' }}>Textová knihovna</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {[
                          { label: 'Hook · Reels',        text: '"Tohle mi trvalo 2 hodiny. Teď to zvládnu za 5 minut."' },
                          { label: 'Popisek · Instagram', text: '"Každé ráno si dávám 10 minut pro sebe. Ne pro email — jen pro sebe."' },
                          { label: 'Mail · Newsletter',   text: '"Ahoj, v tomto týdnu jsem pro tebe připravila jednu věc, která mi pomohla z přetížení..."' },
                          { label: 'CTA · Stories',       text: '"Uložit na później? Tap na hvězdičku. Zítra se ti to bude hodit."' },
                          { label: 'Hook · Carousel',     text: '"5 věcí které mě nikdo nenaučil o energii. Slide →"' },
                        ].map((item, i) => (
                          <div key={i} style={{ background: '#fafaf7', border: '1px solid #e8e8e4', borderRadius: '8px', padding: '9px 12px', cursor: 'pointer' }}>
                            <div style={{ fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#c0c0b8', marginBottom: '2px' }}>{item.label}</div>
                            <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.45 }}>{item.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: Statistiky */}
                  {rtgActiveTab === 'statistiky' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '14px' }}>
                        {[
                          { val: '2 340', label: 'Celkový dosah' },
                          { val: '4.2%',  label: 'Engagement' },
                          { val: '28',    label: 'Schválených výstupů' },
                          { val: '3',     label: 'Aktivní měsíce' },
                        ].map((item, i) => (
                          <div key={i} style={{ background: '#fafaf7', border: '1px solid #e8e8e4', borderRadius: '8px', padding: '10px 12px' }}>
                            <div style={{ fontSize: '20px', fontWeight: 500, color: '#111' }}>{item.val}</div>
                            <div style={{ fontSize: '10px', color: '#9a9a90', marginTop: '2px' }}>{item.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {[
                          { dot: '#6b7c2e', title: '"Tohle mi trvalo 2 hodiny..." · Reels', sub: 'Únor 2026 · video',    pct: '6.8 %' },
                          { dot: '#6b7c2e', title: 'Carousel · 5 věcí o energii',           sub: 'Leden 2026',          pct: '5.3 %' },
                          { dot: '#15803d', title: 'Stories · ranní rituál',                 sub: 'Prosinec 2025',       pct: '4.9 %' },
                        ].map((item, i) => (
                          <div key={i} style={{ background: '#fafaf7', border: '1px solid #e8e8e4', borderRadius: '8px', padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '11px', color: '#111' }}>{item.title}</div>
                                <div style={{ fontSize: '10px', color: '#9a9a90', marginTop: '1px' }}>{item.sub}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7c2e', flexShrink: 0 }}>{item.pct}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                  <button onClick={() => document.getElementById('vyzkousej')?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'block', width: '100%', padding: '11px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textAlign: 'center', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>Začít se Start →</button>
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
                  <button onClick={() => document.getElementById('vyzkousej')?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'block', width: '100%', padding: '11px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textAlign: 'center', background: '#d0ec78', color: '#111', border: 'none', cursor: 'pointer' }}>Začít s Plus →</button>
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
                  <button onClick={() => document.getElementById('vyzkousej')?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'block', width: '100%', padding: '11px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textAlign: 'center', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>Začít s Pro →</button>
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
              <button className="rtg-btn-lime" onClick={() => document.getElementById('vyzkousej')?.scrollIntoView({ behavior: 'smooth' })}>Chci to vyzkoušet</button>
              <button className="rtg-btn-ghost" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>Jak to funguje →</button>
            </div>
            <div className="rtg-cta-note">Žádný závazek · Ozveme se do 24 hodin</div>
          </div>
        </section>

      </div>
    </div>
  )
}
