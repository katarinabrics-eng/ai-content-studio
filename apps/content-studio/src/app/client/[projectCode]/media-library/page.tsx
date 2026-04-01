'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { HexColorPicker } from 'react-colorful'

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaFile = {
  id: string
  name: string
  fileType: string
  mimeType: string
  thumbnailUrl: string | null
  webViewLink: string | null
  subfolder: string | null
}

type VBFile = {
  id: string
  name: string
  thumbnailUrl: string
  style: string
  type: 'photo' | 'video'
}

type VBFolder = {
  id: string
  name: string
  style: string
}

type ProjectInfo = {
  id: string
  name: string
  brandColors: string[]
}

type Stats = {
  total: number
  photos: number
  videos: number
  broll: number
  illustrations: number
  templates: number
}

const TYPE_LABELS: Record<string, string> = {
  all: 'Vše',
  photo: 'Fotky',
  video: 'Videa',
  broll: 'B-roll',
  illustration: 'Ilustrace',
  template: 'Šablony',
}

// Barevná paleta složek pro vizuální banku
const STYLE_COLORS: { style: string; color: string; label: string }[] = [
  { style: 'Cool Business / Modern Office', color: '#4A6FA5', label: 'K02' },
  { style: 'Clean Minimal / Light Aesthetic', color: '#D8D4CC', label: 'K03' },
  { style: 'Soft Feminine / Pastel / Care', color: '#E8B4B8', label: 'K04' },
  { style: 'Edgy Feminine', color: '#2C2C2C', label: 'K05' },
  { style: 'Raw Feminine', color: '#8B7355', label: 'K06' },
  { style: 'Teal Lifestyle Balance', color: '#4A9B8E', label: 'K09' },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: 10,
            aspectRatio: '4/3',
            background: 'linear-gradient(90deg, #f0f0ec 25%, #e8e8e4 50%, #f0f0ec 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }}
        />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}

const VB_LABELS = ['Reels vibe', 'Carousel BG', 'Quote post', 'Story moment', 'Feed lifestyle', 'Reels portrait', 'Brand detail']

const HOOK_TEXTS: Record<string, string> = {
  'Reels vibe': 'Každé ráno si říkám…',
  'Carousel BG': 'Tři věci které změnily vše.',
  'Quote post': 'Jedna věc která změnila vše.',
  'Story moment': 'Tohle nikdo nevidí. Ale cítím to.',
  'Feed lifestyle': 'Takhle vypadá můj svět.',
  'Reels portrait': 'Tohle mi trvalo roky pochopit.',
  'Brand detail': 'Detail který říká vše.',
}

// ─── VB Photo Card s hover overlay ───────────────────────────────────────────

function VBCard({ file, index, isFaved, onToggleFav }: {
  file: VBFile
  index: number
  isFaved: boolean
  onToggleFav: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const label = VB_LABELS[index % VB_LABELS.length]
  const hookText = HOOK_TEXTS[label] ?? 'Tvůj příspěvek z tohoto vizuálu.'

  return (
    <div
      style={{
        breakInside: 'avoid',
        marginBottom: 8,
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        cursor: 'pointer',
        borderRadius: 8,
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={file.thumbnailUrl}
        alt={file.name}
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.style.display = 'none'
        }}
      />

      {/* Label v levém dolním rohu */}
      {!hovered && (
        <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 2 }}>
          <span style={{
            fontSize: 9, fontWeight: 500, padding: '2px 8px', borderRadius: 10,
            background: 'rgba(255,255,255,0.85)', color: '#333',
          }}>
            {label}
          </span>
        </div>
      )}

      {/* Srdíčko — vpravo nahoře */}
      <div
        title="Uložit do oblíbených"
        onClick={(e) => { e.stopPropagation(); onToggleFav(file.id) }}
        style={{
          position: 'absolute', top: 8, right: 8,
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          opacity: hovered || isFaved ? 1 : 0,
          transition: 'opacity 0.2s, transform 0.15s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          zIndex: 4,
        }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.15)'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24"
          fill={isFaved ? '#e05a5a' : 'none'}
          stroke="#e05a5a" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </div>

      {/* Hover overlay — gradient + tlačítko + hook text */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        paddingBottom: 14,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.2s',
        borderRadius: 8,
      }}>
        <button
          title="Vytvořím z toho příspěvek"
          onClick={(e) => { e.stopPropagation(); alert('Brzy: vytvoření příspěvku z této fotky') }}
          style={{ background: 'rgba(255,255,255,0.95)', color: '#111', fontSize: 12, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.15)', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Vytvořit příspěvek
        </button>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', marginTop: 6, maxWidth: 140, textAlign: 'center', margin: '6px 0 0' }}>
          {hookText}
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaLibraryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectCode = params.projectCode as string
  const token = searchParams.get('token') ?? ''

  // Client media tab state
  const [media, setMedia] = useState<MediaFile[]>([])
  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeType, setActiveType] = useState('all')
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  // Visual bank tab state
  const [activeTab, setActiveTab] = useState<'banka' | 'moje' | 'oblibene'>('banka')
  const [vbFiles, setVbFiles] = useState<VBFile[]>([])
  const [vbFolders, setVbFolders] = useState<VBFolder[]>([])
  const [vbTotal, setVbTotal] = useState(0)
  const [vbStyle, setVbStyle] = useState('')
  const [vbColor, setVbColor] = useState('')
  const [vbLoading, setVbLoading] = useState(false)
  const [vbError, setVbError] = useState<string | null>(null)
  const [vbColumns, setVbColumns] = useState(8)
  const [vbSearch, setVbSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedHexColor, setSelectedHexColor] = useState('')
  const colorPickerRef = useRef<HTMLDivElement>(null)

  // Zavři color picker při kliknutí mimo
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false)
      }
    }
    if (showColorPicker) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showColorPicker])

  // Načti oblíbené z localStorage
  useEffect(() => {
    if (!projectCode) return
    try {
      const stored = localStorage.getItem(`favorites_${projectCode}`)
      if (stored) setFavorites(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [projectCode])

  useEffect(() => {
    fetchMedia('all')
    fetchVB('') // načti banku hned na startu
  }, [projectCode])

  useEffect(() => {
    if (activeTab === 'moje') fetchMedia(activeType)
  }, [activeTab])

  async function fetchMedia(type: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/client/media?projectCode=${projectCode}&token=${encodeURIComponent(token)}&type=${type}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMedia(data.media)
      setProject(data.project)
      setStats(data.stats)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Chyba')
    } finally {
      setLoading(false)
    }
  }

  async function fetchVB(style: string, hexColor: string = '') {
    setVbLoading(true)
    setVbError(null)
    try {
      const url = `/api/client/visual-bank?limit=48${style ? `&style=${encodeURIComponent(style)}` : ''}${hexColor ? `&color=${encodeURIComponent(hexColor)}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      setVbFiles(data.files ?? [])
      setVbFolders(data.folders ?? [])
      setVbTotal(data.total ?? 0)
    } catch {
      setVbError('Vizuální banka není dostupná.')
    } finally {
      setVbLoading(false)
    }
  }

  function toggleFavorite(fileId: string) {
    setFavorites(prev => {
      const next = prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
      try { localStorage.setItem(`favorites_${projectCode}`, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  function switchStyle(style: string, color: string = '') {
    setVbStyle(style)
    setVbColor(color)
    setSelectedHexColor('')
    fetchVB(style)
  }

  function applyHexColor(hex: string) {
    setSelectedHexColor(hex)
    setVbStyle('')
    setVbColor('')
    fetchVB('', hex)
  }

  function switchType(type: string) {
    setActiveType(type)
    fetchMedia(type)
    setSelected([])
  }

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filtered = media.filter(m =>
    search === '' || m.name.toLowerCase().includes(search.toLowerCase())
  )

  const getThumb = (m: MediaFile) => {
    if (m.thumbnailUrl) return m.thumbnailUrl
    return `/api/client/media/proxy?fileId=${m.id}&mimeType=${encodeURIComponent(m.mimeType)}`
  }

  const typeIcon: Record<string, string> = {
    photo: '📷', video: '▶', broll: '🎬', illustration: '✦', template: '◻', other: '·',
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans, DM Sans, sans-serif)', background: '#fafaf7', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e4', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Vizuální knihovna</div>
          <div style={{ fontSize: 12, color: '#9a9a90', marginTop: 2 }}>{project?.name || '...'}</div>
        </div>
        {stats && (
          <div style={{ display: 'flex', gap: 20 }}>
            {[{ label: 'Celkem', value: stats.total }, { label: 'Fotky', value: stats.photos }, { label: 'Videa', value: stats.videos }].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#111' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#9a9a90' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paleta projektu */}
      {project?.brandColors && project.brandColors.length > 0 && (
        <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e4', padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#c0c0b8' }}>Paleta projektu</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {project.brandColors.map((c: string, i: number) => (
              <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.08)' }} title={c} />
            ))}
          </div>
        </div>
      )}

      {/* Nadpis knihovny */}
      <div style={{ padding: '20px 32px 4px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: '#111', margin: 0, marginBottom: 4 }}>Vyber vizuál pro svůj obsah</h1>
        <p style={{ fontSize: 13, color: '#888', margin: 0, marginBottom: 16 }}>Ulož si co se ti líbí, nebo rovnou tvoř příspěvek</p>
      </div>

      {/* Hlavní tabs */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e4', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 0 }}>
        {([['banka', 'Inspirace'], ['moje', 'Moje fotky'], ['oblibene', 'Oblíbené ❤️']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '12px 20px', fontSize: 13, fontFamily: 'inherit',
              background: 'transparent', border: 'none',
              borderBottom: activeTab === key ? '2px solid #111' : '2px solid transparent',
              color: activeTab === key ? '#111' : '#9a9a90',
              cursor: 'pointer', fontWeight: activeTab === key ? 600 : 400, marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── MOJE MÉDIA ─────────────────────────────────────────────────────────── */}
      {activeTab === 'moje' && (
        <>
          {/* Type tabs */}
          <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e4', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 4 }}>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => switchType(key)}
                style={{
                  padding: '10px 14px', fontSize: 12, fontFamily: 'inherit',
                  background: 'transparent', border: 'none',
                  borderBottom: activeType === key ? '2px solid #111' : '2px solid transparent',
                  color: activeType === key ? '#111' : '#9a9a90',
                  cursor: 'pointer', fontWeight: activeType === key ? 500 : 400, marginBottom: -1,
                }}
              >
                {label}
                {stats && key !== 'all' && (
                  <span style={{ fontSize: 10, background: '#f0f0ec', padding: '1px 6px', borderRadius: 100, marginLeft: 6, color: '#9a9a90' }}>
                    {stats[key as keyof Stats]}
                  </span>
                )}
              </button>
            ))}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Hledat..."
              style={{ marginLeft: 'auto', height: 30, borderRadius: 8, border: '0.5px solid #e8e8e4', padding: '0 12px', fontSize: 12, background: '#fafaf7', color: '#111', fontFamily: 'inherit', outline: 'none' }}
            />
          </div>

          <div style={{ padding: '24px 32px' }}>
            {loading && <Skeleton />}
            {error && <div style={{ textAlign: 'center', padding: 40, color: '#e24b4a', fontSize: 13 }}>Chyba: {error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: '#9a9a90', fontSize: 14 }}>Žádná média nenalezena.</div>
            )}
            {!loading && !error && filtered.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: '#9a9a90', marginBottom: 16 }}>
                  {filtered.length} médií {search && `· filtrováno "${search}"`}
                </div>
                <div style={{ columns: 4, columnGap: 10 }}>
                  {filtered.map(m => (
                    <div
                      key={m.id}
                      onClick={() => toggleSelect(m.id)}
                      style={{ breakInside: 'avoid', marginBottom: 10, borderRadius: 10, overflow: 'hidden', position: 'relative', cursor: 'pointer', outline: selected.includes(m.id) ? '2px solid #111' : 'none', outlineOffset: 2 }}
                    >
                      {m.fileType === 'video' || m.fileType === 'broll' ? (
                        <div style={{ width: '100%', aspectRatio: '16/9', background: '#1e1e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)' }}>▶</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '.04em' }}>{m.name}</span>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={getThumb(m)} alt={m.name} style={{ width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const el = e.currentTarget
                            el.style.display = 'none'
                            if (el.parentElement) {
                              el.parentElement.style.background = '#E8EDE3'
                              el.parentElement.style.aspectRatio = '4/3'
                            }
                          }}
                        />
                      )}
                      <div style={{ position: 'absolute', top: 8, left: 8 }}>
                        <span style={{ fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 100, background: 'rgba(250,250,247,0.9)', color: 'rgba(17,17,17,0.6)' }}>
                          {typeIcon[m.fileType]} {m.subfolder || m.fileType}
                        </span>
                      </div>
                      {selected.includes(m.id) && (
                        <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── VIZUÁLNÍ BANKA ──────────────────────────────────────────────────────── */}
      {activeTab === 'banka' && (
        <>
          {/* Search nad galerií */}
          <div style={{ background: '#fff', padding: '12px 32px 0', display: 'flex', alignItems: 'center' }}>
            <input
              value={vbSearch}
              onChange={e => setVbSearch(e.target.value)}
              placeholder="Hledat vizuály..."
              style={{ width: '100%', maxWidth: 340, height: 32, borderRadius: 8, border: '0.5px solid #e8e8e4', padding: '0 12px', fontSize: 12, background: '#fafaf7', color: '#111', fontFamily: 'inherit', outline: 'none' }}
            />
          </div>

          {/* Barevné kroužky */}
          <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e4', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: '#c0c0b8', marginRight: 4 }}>Styl</span>
            {/* Kroužek "Vše" */}
            <div
              onClick={() => switchStyle('', '')}
              title="Vše"
              style={{
                width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                background: 'linear-gradient(135deg, #4A6FA5 0%, #E8B4B8 33%, #4A9B8E 66%, #2C2C2C 100%)',
                border: vbColor === '' ? '2.5px solid #111' : '2px solid transparent',
                boxShadow: vbColor === '' ? '0 0 0 1px #fff inset' : 'none',
                flexShrink: 0,
              }}
            />
            {STYLE_COLORS.map(({ style, color, label }) => (
              <div
                key={style}
                onClick={() => switchStyle(style, color)}
                title={label + ' · ' + style}
                style={{
                  width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                  background: color,
                  border: vbColor === color ? '2.5px solid #111' : '2px solid rgba(0,0,0,0.1)',
                  boxShadow: vbColor === color ? '0 0 0 2px #fff inset' : 'none',
                  flexShrink: 0,
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.15)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
              />
            ))}

            {/* Rainbow color picker kroužek */}
            <div style={{ position: 'relative', flexShrink: 0 }} ref={colorPickerRef}>
              <div
                title="Vlastní barva"
                onClick={() => setShowColorPicker(prev => !prev)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                  background: selectedHexColor || 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #c77dff)',
                  border: selectedHexColor ? '2.5px solid #111' : '2px solid transparent',
                  boxShadow: selectedHexColor ? '0 0 0 2px #fff inset' : 'none',
                  flexShrink: 0,
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.15)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
              />
              {showColorPicker && (
                <div style={{
                  position: 'absolute', top: 40, left: 0,
                  background: '#fff',
                  border: '0.5px solid #e8e4dc',
                  borderRadius: 12,
                  padding: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  zIndex: 100,
                }}>
                  <HexColorPicker
                    color={selectedHexColor || '#4A9B8E'}
                    onChange={(hex) => setSelectedHexColor(hex)}
                  />
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>{selectedHexColor || '#------'}</span>
                    <button
                      onClick={() => { applyHexColor(selectedHexColor); setShowColorPicker(false) }}
                      style={{ marginLeft: 'auto', padding: '5px 14px', borderRadius: 7, border: 'none', background: '#111', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Použít
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Style text pills z API */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 8, borderLeft: '0.5px solid #e8e8e4', paddingLeft: 12 }}>
              {vbFolders.map(f => (
                <button
                  key={f.name}
                  onClick={() => switchStyle(f.style, '')}
                  style={{
                    padding: '4px 12px', borderRadius: 100, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
                    border: vbStyle === f.style && !vbColor ? '1.5px solid #111' : '1px solid #e8e8e4',
                    background: vbStyle === f.style && !vbColor ? '#111' : '#fff',
                    color: vbStyle === f.style && !vbColor ? '#fff' : '#555',
                  }}
                >
                  {f.style}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '24px 32px' }}>
            {vbLoading && <Skeleton />}
            {vbError && <div style={{ textAlign: 'center', padding: 40, color: '#e24b4a', fontSize: 13 }}>{vbError}</div>}
            {!vbLoading && !vbError && vbFiles.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: '#9a9a90', fontSize: 14 }}>
                Žádné fotky nenalezeny.{vbFolders.length === 0 && ' Vizuální banka se načítá nebo je prázdná.'}
              </div>
            )}
            {!vbLoading && !vbError && vbFiles.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#9a9a90' }}>
                    {vbTotal} fotek{vbStyle && ` · ${vbStyle}`}
                  </div>
                  {/* Přepínač počtu sloupců */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, color: '#ccc', marginRight: 4 }}>Sloupce</span>
                    {[2, 3, 4, 5, 6, 8].map(n => (
                      <button
                        key={n}
                        onClick={() => setVbColumns(n)}
                        style={{
                          width: 26, height: 26, borderRadius: 6, border: 'none',
                          background: vbColumns === n ? '#111' : '#f0f0ec',
                          color: vbColumns === n ? '#fff' : '#666',
                          fontSize: 11, fontWeight: vbColumns === n ? 600 : 400,
                          cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ columns: vbColumns, columnGap: 8, width: '100%' }}>
                  {vbFiles
                    .filter(f => !vbSearch || f.name.toLowerCase().includes(vbSearch.toLowerCase()) || f.style.toLowerCase().includes(vbSearch.toLowerCase()))
                    .map((f, i) => <VBCard key={f.id} file={f} index={i} isFaved={favorites.includes(f.id)} onToggleFav={toggleFavorite} />)}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── OBLÍBENÉ ────────────────────────────────────────────────────────────── */}
      {activeTab === 'oblibene' && (() => {
        const favFiles = vbFiles.filter(f => favorites.includes(f.id))
        if (favFiles.length === 0) return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', gap: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 40, opacity: 0.25 }}>❤️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#555' }}>Zatím nemáš žádné oblíbené</div>
            <div style={{ fontSize: 13, color: '#aaa', maxWidth: 320, lineHeight: 1.6 }}>
              Klikni ❤️ na fotce v Inspiraci pro přidání do oblíbených.
            </div>
            <button
              onClick={() => setActiveTab('banka')}
              style={{ marginTop: 8, padding: '9px 20px', borderRadius: 8, border: '1px solid #e8e8e4', background: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}
            >
              Procházet Inspiraci →
            </button>
          </div>
        )
        return (
          <div style={{ padding: '24px 32px' }}>
            <div style={{ fontSize: 12, color: '#9a9a90', marginBottom: 16 }}>{favFiles.length} oblíbených fotek</div>
            <div style={{ columns: vbColumns, columnGap: 8, width: '100%' }}>
              {favFiles.map((f, i) => <VBCard key={f.id} file={f} index={i} isFaved={true} onToggleFav={toggleFavorite} />)}
            </div>
          </div>
        )
      })()}

      {/* Selection bar */}
      {selected.length > 0 && (
        <div style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '0.5px solid #e8e8e4', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: '#555' }}>Vybráno: <strong>{selected.length}</strong> médií</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setSelected([])} style={{ padding: '7px 16px', borderRadius: 8, border: '0.5px solid #e8e8e4', background: 'transparent', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}>Zrušit</button>
            <button style={{ padding: '7px 16px', borderRadius: 8, border: '0.5px solid #e8e8e4', background: 'transparent', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}>Stáhnout</button>
            <button style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Do kolekce</button>
          </div>
        </div>
      )}

    </div>
  )
}
