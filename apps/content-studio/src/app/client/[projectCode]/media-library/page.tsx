'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaLibraryPage() {
  const params = useParams()
  const projectCode = params.projectCode as string

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
  const [activeTab, setActiveTab] = useState<'moje' | 'banka'>('moje')
  const [vbFiles, setVbFiles] = useState<VBFile[]>([])
  const [vbFolders, setVbFolders] = useState<VBFolder[]>([])
  const [vbTotal, setVbTotal] = useState(0)
  const [vbStyle, setVbStyle] = useState('')
  const [vbLoading, setVbLoading] = useState(false)
  const [vbError, setVbError] = useState<string | null>(null)

  useEffect(() => {
    fetchMedia('all')
  }, [projectCode])

  useEffect(() => {
    if (activeTab === 'banka') fetchVB(vbStyle)
  }, [activeTab])

  async function fetchMedia(type: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/client/media?projectCode=${projectCode}&type=${type}`)
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

  async function fetchVB(style: string) {
    setVbLoading(true)
    setVbError(null)
    try {
      const url = `/api/client/visual-bank?limit=48${style ? `&style=${encodeURIComponent(style)}` : ''}`
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

  function switchStyle(style: string) {
    setVbStyle(style)
    fetchVB(style)
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

      {/* Hlavní tabs: Moje média / Vizuální banka */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e4', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 0 }}>
        {([['moje', 'Moje média'], ['banka', 'Vizuální banka']] as const).map(([key, label]) => (
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
          {/* Style pills */}
          <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e4', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => switchStyle('')}
              style={{
                padding: '6px 14px', borderRadius: 100, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
                border: vbStyle === '' ? '1.5px solid #111' : '1px solid #e8e8e4',
                background: vbStyle === '' ? '#111' : '#fff',
                color: vbStyle === '' ? '#fff' : '#555',
                fontWeight: vbStyle === '' ? 600 : 400,
              }}
            >
              Vše
            </button>
            {vbFolders.map(f => (
              <button
                key={f.name}
                onClick={() => switchStyle(f.style)}
                style={{
                  padding: '6px 14px', borderRadius: 100, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
                  border: vbStyle === f.style ? '1.5px solid #111' : '1px solid #e8e8e4',
                  background: vbStyle === f.style ? '#111' : '#fff',
                  color: vbStyle === f.style ? '#fff' : '#555',
                  fontWeight: vbStyle === f.style ? 600 : 400,
                }}
              >
                {f.style}
              </button>
            ))}
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
                <div style={{ fontSize: 12, color: '#9a9a90', marginBottom: 16 }}>{vbTotal} fotek{vbStyle && ` · ${vbStyle}`}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {vbFiles.map(f => (
                    <div key={f.id} style={{ borderRadius: 10, overflow: 'hidden', position: 'relative', cursor: 'pointer', aspectRatio: '4/3' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.thumbnailUrl}
                        alt={f.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      {f.style && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 10px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.4))' }}>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{f.style}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

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
