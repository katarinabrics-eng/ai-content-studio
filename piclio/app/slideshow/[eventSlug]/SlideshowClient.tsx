'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface SlideshowPhoto {
  id: string
  url: string
  filename: string
  uploaded_at: string
}

interface SlideshowEvent {
  id: string
  name: string
  slideshow_welcome_text?: string | null
  event_category?: string | null
  client_logo_url?: string | null
  client_name?: string | null
  slideshow_bg?: string | null
  slideshow_bar_color?: string | null
  slideshow_bar_enabled?: boolean | null
  brand_color?: string | null
  slideshow_overlay_url?: string | null
  slideshow_overlay_mode?: string | null
}

interface SlideshowSettings {
  interval: number
  animation: 'fade' | 'slide' | 'none'
  layout: 'single' | 'kenburns' | 'slide' | 'grid'
}

interface Props {
  eventSlug: string
  initialEvent: SlideshowEvent
  initialPhotos: SlideshowPhoto[]
  initialSettings: SlideshowSettings
}

export function SlideshowClient({ eventSlug, initialEvent, initialPhotos, initialSettings }: Props) {
  const [photos, setPhotos] = useState<SlideshowPhoto[]>(initialPhotos)
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [visible, setVisible] = useState(true)
  const [showIntro, setShowIntro] = useState(true)
  const [introDismissed, setIntroDismissed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set(photos.map(p => p.id)))
  const [slideshowContent, setSlideshowContent] = useState<'all' | 'selected' | 'by-guest'>('all')

  const activePhotos = slideshowContent === 'selected'
    ? photos.filter(p => selectedPhotoIds.has(p.id))
    : slideshowContent === 'by-guest'
    ? photos.filter(p => selectedPhotoIds.has(p.id))
    : photos
  const [slideshowOrder, setSlideshowOrder] = useState<'random' | 'newest' | 'oldest'>('random')
  const [slideshowEffect, setSlideshowEffect] = useState<'fade' | 'slide' | 'kenburns' | 'none'>('fade')
  const [slideshowInterval, setSlideshowInterval] = useState(5)
  const [slideshowLayout, setSlideshowLayout] = useState<'single' | 'carousel'>('single')
  const [animating, setAnimating] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const photosRef = useRef(photos)
  const orderedPhotos = useMemo(() => {
    const arr = [...activePhotos]
    if (slideshowOrder === 'newest') return arr.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    if (slideshowOrder === 'oldest') return arr.sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime())
    return arr.sort(() => Math.random() - 0.5)
  }, [activePhotos, slideshowOrder])

  useEffect(() => { photosRef.current = orderedPhotos }, [orderedPhotos])

  const intervalMs = slideshowInterval * 1000

  const supabase = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  ).current

  useEffect(() => {
    const channel = supabase
      .channel(`slideshow-${eventSlug}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photo_guests' }, async () => {
        const res = await fetch(`/api/slideshow/${eventSlug}`)
        const data = await res.json()
        if (data.photos?.length > 0) setPhotos(data.photos)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [eventSlug, supabase])

  useEffect(() => {
    fetch(`/api/slideshow/${eventSlug}`)
      .then(r => r.json())
      .then(data => {
        if (data.photos?.length > 0) setPhotos(data.photos)
      })
  }, [eventSlug])

  // Intro se nezavírá automaticky — uživatel klikne na Spustit

  const advance = useCallback((dir: 1 | -1 = 1) => {
    if (photosRef.current.length === 0) return
    if (slideshowEffect === 'fade') {
      setVisible(false)
      setTimeout(() => {
        setCurrent(i => (i + dir + photosRef.current.length) % photosRef.current.length)
        setTimeout(() => setVisible(true), 50)
      }, 400)
    } else if (slideshowEffect === 'slide') {
      setAnimating(true)
      setTimeout(() => {
        setCurrent(i => (i + dir + photosRef.current.length) % photosRef.current.length)
        setAnimating(false)
      }, 500)
    } else {
      setCurrent(i => (i + dir + photosRef.current.length) % photosRef.current.length)
    }
  }, [slideshowEffect])

  useEffect(() => {
    if (!playing || orderedPhotos.length <= 1) return
    const id = setInterval(() => advance(1), intervalMs)
    return () => clearInterval(id)
  }, [playing, orderedPhotos.length, intervalMs, advance])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (showIntro) return  // blokuj všechny klávesy na intro/nastavení obrazovce
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setPlaying(p => !p) }
      if (e.key === 'ArrowRight') advance(1)
      if (e.key === 'ArrowLeft') advance(-1)
      if (e.key === 'f' || e.key === 'F') {
        document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
      }
      if (e.key === 'Escape' && !document.fullscreenElement) window.history.back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance])

  function resetHideTimer() {
    setShowControls(true)
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000)
  }
  useEffect(() => {
    resetHideTimer()
    return () => { if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const n = Math.max(orderedPhotos.length, 1)

  function renderContent() {
    if (orderedPhotos.length === 0) {
      return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(183,233,76,0.25)', fontSize: 16, letterSpacing: '0.1em' }}>
          Čeká se na fotky…
        </div>
      )
    }

    const topOffset = initialEvent.slideshow_bar_enabled ? 76 : 16

    if (slideshowLayout === 'carousel') {
      const items = [-2, -1, 0, 1, 2].map(offset => {
        const idx = (current + offset + orderedPhotos.length) % orderedPhotos.length
        return { photo: orderedPhotos[idx], offset }
      })
      return (
        <div style={{
          position: 'absolute', top: topOffset, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {items.map(({ photo: p, offset }) => {
            const isCenter = offset === 0
            const scale = isCenter ? 1 : Math.abs(offset) === 1 ? 0.72 : 0.52
            const translateX = offset * 36
            const opacity = Math.abs(offset) === 2 ? 0.25 : Math.abs(offset) === 1 ? 0.6 : 1
            const zIdx = isCenter ? 5 : Math.abs(offset) === 1 ? 3 : 1
            return (
              <div key={p?.id ?? offset} style={{
                position: 'absolute',
                transform: `translateX(${translateX}%) scale(${scale})`,
                transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease',
                opacity, zIndex: zIdx,
                width: '55%', maxHeight: '80%',
                borderRadius: 16, overflow: 'hidden',
                boxShadow: isCenter ? '0 16px 48px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.2)',
              }}>
                {p && <img src={p.url} alt="" style={{ width: '100%', height: 'auto', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />}
              </div>
            )
          })}
        </div>
      )
    }

    // single layout
    const photo = orderedPhotos[current]
    return (
      <>
        <img key={photo?.id} src={photo?.url} alt=""
          style={{
            position: 'absolute', top: topOffset, left: 16, right: 16, bottom: 16,
            width: 'calc(100% - 32px)', height: `calc(100% - ${topOffset + 16}px)`,
            objectFit: 'contain', borderRadius: 16,
            opacity: slideshowEffect === 'fade' ? (visible ? 1 : 0) : 1,
            transition: slideshowEffect === 'fade' ? 'opacity 0.8s ease-in-out' : 'none',
            animation: slideshowEffect === 'kenburns' ? 'kenburns 10s ease-in-out infinite alternate' : 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
        />
      </>
    )
  }

  const bgColor = (() => {
    if (initialEvent.slideshow_bg === 'light') return '#ffffff'
    if (initialEvent.slideshow_bg === 'brand') return initialEvent.brand_color ?? '#000000'
    return '#000000' // dark (default)
  })()

  const barColor = (() => {
    if (initialEvent.slideshow_bar_color === 'brand') return initialEvent.brand_color ?? '#1a1225'
    if (initialEvent.slideshow_bar_color === 'transparent') return 'transparent'
    if (initialEvent.slideshow_bar_color === '#ffffff') return '#ffffff'
    if (initialEvent.slideshow_bar_color === '#000000') return '#000000'
    return 'transparent'
  })()

  const textColor = initialEvent.slideshow_bg === 'light' ? '#111827' : '#ffffff'
  const overlayUrl = initialEvent.slideshow_overlay_url ?? null
  const overlayMode = initialEvent.slideshow_overlay_mode ?? 'none'

  return (
  <div
    style={{ height: '100vh', background: bgColor, position: 'relative', overflow: 'hidden' }}
    onMouseMove={resetHideTimer}
  >
    <style>{`
      @keyframes kenburns {
        0%   { transform: scale(1) translate(0, 0); }
        100% { transform: scale(1.08) translate(-1.5%, -1%); }
      }
      @keyframes slideInRight {
        from { transform: translateX(105%); opacity: 0; }
        to   { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to   { transform: translateX(-105%); opacity: 0; }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
    `}</style>

    {/* OBRAZOVKA 1 — Uvítání */}
    {showIntro && !showSettings && (
      <div style={{
        position: 'absolute', inset: 0, background: '#000',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: '40px 20px',
      }}>
        <div style={{ position: 'absolute', top: 20, left: 24 }}>
          <img src="/logo01.png" alt="Piclio" style={{ height: 32, objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', maxWidth: 800 }}>
          {initialEvent.event_category && (
            <div style={{ display: 'inline-block', background: 'rgba(183,233,76,0.12)', border: '1px solid rgba(183,233,76,0.3)', borderRadius: 20, padding: '5px 16px', fontSize: 11, color: '#b7e94c', letterSpacing: '0.15em', marginBottom: 28 }}>
              {initialEvent.event_category.toUpperCase()}
            </div>
          )}
          <div style={{ fontSize: 'clamp(32px, 6vw, 72px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            {initialEvent.name}
          </div>
          {initialEvent.slideshow_welcome_text && (
            <div style={{ fontSize: 'clamp(14px, 2vw, 20px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 48, whiteSpace: 'pre-line' }}>
              {initialEvent.slideshow_welcome_text}
            </div>
          )}

          {/* Shrnutí nastavení */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            {[
              { label: 'OBSAH', value: slideshowContent === 'all' ? 'Všechny fotky' : slideshowContent === 'selected' ? 'Výběr fotek' : 'Dle hosta' },
              { label: 'EFEKT', value: slideshowEffect === 'fade' ? 'Prolínačka' : slideshowEffect === 'slide' ? 'Kolotoč' : slideshowEffect === 'kenburns' ? 'Zoom' : 'Bez efektu' },
              { label: 'INTERVAL', value: `${slideshowInterval} sekund` },
              { label: 'LAYOUT', value: slideshowLayout === 'single' ? 'Jedna fotka' : 'Kolotoč' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 20px', minWidth: 120 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Tlačítka */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowSettings(true)}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '14px 32px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
              >
                Nastavení
              </button>
              <button
                onClick={() => { setShowIntro(false); setIntroDismissed(true); setPlaying(true) }}
                style={{ background: '#b7e94c', color: '#1a1225', border: 'none', borderRadius: 8, padding: '14px 40px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >
                Spustit slideshow
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>nebo stiskni Enter</div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 20, right: 24, opacity: 0.3 }}>
          <img src="/logo01.png" alt="Piclio" style={{ height: 24, objectFit: 'contain' }} />
        </div>
      </div>
    )}

    {/* OBRAZOVKA 2 — Nastavení */}
    {showIntro && showSettings && (
      <div style={{
        position: 'absolute', inset: 0, background: '#000',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: '28px 20px', overflowY: 'auto',
      }}>
        <div style={{ position: 'absolute', top: 20, left: 24 }}>
          <img src="/logo01.png" alt="Piclio" style={{ height: 32, objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{initialEvent.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Nastavení slideshow</div>
        </div>

        <div style={{ display: 'flex', gap: 14, width: '100%', maxWidth: 700, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 10, color: '#b7e94c', letterSpacing: '0.12em', marginBottom: 16, fontWeight: 700 }}>NASTAVENÍ</div>

            {/* Obsah */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Obsah</div>
              {(['all', 'by-guest'] as const).map(val => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }} onClick={() => setSlideshowContent(val)}>
                  <div style={{ width: 13, height: 13, borderRadius: '50%', background: slideshowContent === val ? '#b7e94c' : 'transparent', border: slideshowContent === val ? 'none' : '1px solid rgba(255,255,255,0.25)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: slideshowContent === val ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                    {val === 'all' ? 'Všechny fotky' : 'Dle galerie hosta'}
                  </span>
                </label>
              ))}
              <label key="selected" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }} onClick={() => setSlideshowContent('selected')}>
                <div style={{ width: 13, height: 13, borderRadius: '50%', background: slideshowContent === 'selected' ? '#b7e94c' : 'transparent', border: slideshowContent === 'selected' ? 'none' : '1px solid rgba(255,255,255,0.25)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: slideshowContent === 'selected' ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                  Výběr fotek
                  <span
                    onClick={(e) => { e.stopPropagation(); setShowPhotoModal(true) }}
                    style={{ color: '#b7e94c', fontSize: 11, marginLeft: 6, cursor: 'pointer' }}
                  >
                    → otevřít výběr
                  </span>
                </span>
              </label>
            </div>

            {/* Pořadí */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Pořadí</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {([['random', 'Náhodné'], ['newest', 'Nejnovější'], ['oldest', 'Nejstarší']] as const).map(([val, label]) => (
                  <div key={val} onClick={() => setSlideshowOrder(val)}
                    style={{ background: slideshowOrder === val ? '#b7e94c' : 'rgba(255,255,255,0.08)', color: slideshowOrder === val ? '#1a1225' : 'rgba(255,255,255,0.5)', borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: slideshowOrder === val ? 700 : 400, cursor: 'pointer' }}>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Režim prezentace + Efekt */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Režim prezentace</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {([
                  { key: 'single', label: 'Jedna fotka', desc: 'Fotky sa striedajú na celej ploche' },
                  { key: 'carousel', label: 'Kolotoč', desc: 'Pas fotek posúvajúci sa do strany' },
                ] as const).map(opt => (
                  <div key={opt.key} onClick={() => setSlideshowLayout(opt.key)}
                    style={{
                      background: slideshowLayout === opt.key ? 'rgba(183,233,76,0.12)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${slideshowLayout === opt.key ? '#b7e94c' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                    }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: slideshowLayout === opt.key ? '#b7e94c' : '#fff', marginBottom: 3 }}>{opt.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{opt.desc}</div>
                  </div>
                ))}
              </div>
              {slideshowLayout === 'single' && (
                <>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Efekt přechodu</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {([
                      ['fade', 'Prolínačka'],
                      ['kenburns', 'Zoom'],
                      ['none', 'Bez efektu'],
                    ] as const).map(([val, label]) => (
                      <div key={val} onClick={() => setSlideshowEffect(val)}
                        style={{
                          background: slideshowEffect === val ? '#b7e94c' : 'rgba(255,255,255,0.08)',
                          color: slideshowEffect === val ? '#1a1225' : 'rgba(255,255,255,0.5)',
                          borderRadius: 6, padding: '4px 12px', fontSize: 11,
                          fontWeight: slideshowEffect === val ? 700 : 400, cursor: 'pointer',
                        }}>
                        {label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Interval */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Interval</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[3, 4, 5, 7, 10].map(s => (
                  <div key={s} onClick={() => setSlideshowInterval(s)}
                    style={{ background: slideshowInterval === s ? '#b7e94c' : 'rgba(255,255,255,0.08)', color: slideshowInterval === s ? '#1a1225' : 'rgba(255,255,255,0.5)', borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: slideshowInterval === s ? 700 : 400, cursor: 'pointer' }}>
                    {s} s
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
            <button
              onClick={() => { setShowIntro(false); setIntroDismissed(true); setPlaying(true) }}
              style={{ background: '#b7e94c', color: '#1a1225', border: 'none', borderRadius: 8, padding: '13px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}
            >
              ▶ Spustit
            </button>
            <button
              onClick={() => setShowSettings(false)}
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: 'pointer', width: '100%' }}
            >
              ← Zpět
            </button>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 10, marginTop: 4 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textAlign: 'center' }}>NÁHLED</div>
              <div style={{ width: '100%', height: 70, background: 'rgba(255,255,255,0.06)', borderRadius: 4, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {slideshowLayout === 'single' && <div style={{ width: '70%', height: '75%', background: 'rgba(255,255,255,0.12)', borderRadius: 3 }} />}
                {slideshowLayout === 'carousel' && <div style={{ display: 'flex', gap: 3, alignItems: 'center', width: '90%', height: '70%' }}><div style={{ flex: 1, height: '60%', background: 'rgba(255,255,255,0.07)', borderRadius: 2 }} /><div style={{ flex: 2, height: '100%', background: 'rgba(255,255,255,0.12)', borderRadius: 3 }} /><div style={{ flex: 1, height: '60%', background: 'rgba(255,255,255,0.07)', borderRadius: 2 }} /></div>}
              </div>
              <div style={{ marginTop: 5, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                <span>{slideshowEffect} · {slideshowInterval}s</span>
                <span>{slideshowOrder === 'random' ? 'Náh.' : slideshowOrder === 'newest' ? 'Nej.' : 'Star.'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 16, right: 20, opacity: 0.3 }}>
          <img src="/logo01.png" alt="Piclio" style={{ height: 24, objectFit: 'contain' }} />
        </div>
      </div>
    )}

    {/* SLIDESHOW — fotky */}
    {!showIntro && (
      <>
        {overlayUrl && overlayMode === 'under' && (
          <img src={overlayUrl} alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', pointerEvents: 'none', zIndex: 1,
          }} />
        )}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          {renderContent()}
        </div>
        {overlayUrl && overlayMode === 'over' && (
          <img src={overlayUrl} alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', pointerEvents: 'none', zIndex: 3,
          }} />
        )}
      </>
    )}

    {/* Horní lišta s logem */}
    {!showIntro && initialEvent.slideshow_bar_enabled && (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        background: barColor,
        backdropFilter: barColor === 'transparent' ? 'blur(8px)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', height: 60,
        borderBottom: barColor === 'transparent' ? '1px solid rgba(255,255,255,0.1)' : 'none',
      }}>
        {initialEvent.client_logo_url
          ? <img src={initialEvent.client_logo_url} alt="" style={{ height: 36, objectFit: 'contain', maxWidth: 180 }} />
          : <span style={{ color: textColor, fontWeight: 800, fontSize: 16, letterSpacing: '0.1em' }}>PICLIO</span>
        }
        <span style={{ color: textColor, fontSize: 14, fontWeight: 600, opacity: 0.7 }}>
          {initialEvent.name}
        </span>
      </div>
    )}

    {/* Event name */}
    {!showIntro && (
      <div style={{ position: 'absolute', top: 16, left: 20, color: 'rgba(183,233,76,0.5)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', pointerEvents: 'none', opacity: showControls ? 1 : 0, transition: 'opacity 0.4s' }}>
        {initialEvent.name}
      </div>
    )}

    {/* Keyboard hint */}
    {!showIntro && (
      <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 11, color: 'rgba(255,255,255,0.2)', pointerEvents: 'none', opacity: showControls ? 1 : 0, transition: 'opacity 0.4s' }}>
        Space · ← → · F · ESC
      </div>
    )}

    {/* Controls */}
    {!showIntro && (
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: '8px 18px', opacity: showControls ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: showControls ? 'auto' : 'none', zIndex: 10 }}>
        <button onClick={() => advance(-1)} style={ctrlBtn}>‹</button>
        <button onClick={() => setPlaying(p => !p)} style={ctrlBtn}>{playing ? '⏸' : '▶'}</button>
        <button onClick={() => advance(1)} style={ctrlBtn}>›</button>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: '0 4px', userSelect: 'none' }}>
          {activePhotos.length > 0 ? `${current + 1} / ${activePhotos.length}` : '0'}
        </span>
        <button onClick={() => window.location.reload()} style={ctrlBtn} title="Reload">↺</button>
        <button onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()} style={ctrlBtn} title="Fullscreen">⛶</button>
      </div>
    )}

    {/* Logo klienta vlevo nahoře během projekce */}
    {!showIntro && (
      <div style={{ position: 'absolute', top: 16, left: 20, opacity: 0.5, pointerEvents: 'none', userSelect: 'none' }}>
        {initialEvent.client_logo_url
          ? <img src={initialEvent.client_logo_url} alt="" style={{ height: 32, objectFit: 'contain', maxWidth: 140 }} />
          : <span style={{ color: '#b7e94c', fontWeight: 800, fontSize: 12, letterSpacing: '0.15em' }}>PICLIO</span>
        }
      </div>
    )}

    {/* Modal — výběr fotek */}
    {showPhotoModal && (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12, padding: 24, width: '90%', maxWidth: 600,
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 15, color: '#fff', fontWeight: 700 }}>Výběr fotek do slideshow</div>
            <button onClick={() => setShowPhotoModal(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
            Kliknutím vyberte fotky. Zelené = zařazeny do slideshow.
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {photos.map(photo => {
                const isSelected = selectedPhotoIds.has(photo.id)
                return (
                  <div key={photo.id}
                    onClick={() => {
                      setSelectedPhotoIds(prev => {
                        const next = new Set(prev)
                        next.has(photo.id) ? next.delete(photo.id) : next.add(photo.id)
                        return next
                      })
                    }}
                    style={{
                      aspectRatio: '1', borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                      border: `2px solid ${isSelected ? '#b7e94c' : 'transparent'}`,
                      position: 'relative', background: 'rgba(255,255,255,0.05)',
                    }}>
                    <img src={photo.url} alt={photo.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 4, right: 4,
                        background: '#b7e94c', borderRadius: '50%',
                        width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: '#1a1225', fontWeight: 700,
                      }}>✓</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: '#b7e94c' }}>Vybráno: {selectedPhotoIds.size} fotek</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setSelectedPhotoIds(new Set(photos.map(p => p.id)))}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 11, cursor: 'pointer' }}>
                Vybrat vše
              </button>
              <button onClick={() => { setSlideshowContent('selected'); setShowPhotoModal(false) }}
                style={{ background: '#b7e94c', color: '#1a1225', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                Potvrdit výběr
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)

}

const ctrlBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: '#fff',
  cursor: 'pointer', fontSize: 20, padding: '2px 6px',
  lineHeight: 1, borderRadius: 6,
}
