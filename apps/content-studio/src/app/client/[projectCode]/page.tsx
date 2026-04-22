'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type VBFile = {
  id: string
  name: string
  thumbnailUrl: string
  style: string
  type: 'photo' | 'video'
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLE_FILTERS = [
  'Vše', 'Lifestyle', 'Fashion', 'Minimal', 'Bold', 'Nature', 'Business', 'Portrait',
]

const COLOR_FILTERS = [
  { style: 'Cool Business / Modern Office',    color: '#4A6FA5', label: 'K02' },
  { style: 'Clean Minimal / Light Aesthetic',  color: '#D8D4CC', label: 'K03' },
  { style: 'Soft Feminine / Pastel / Care',    color: '#E8B4B8', label: 'K04' },
  { style: 'Edgy Feminine',                   color: '#2C2C2C', label: 'K05' },
  { style: 'Raw Feminine',                    color: '#8B7355', label: 'K06' },
  { style: 'Teal Lifestyle Balance',          color: '#4A9B8E', label: 'K09' },
]

const PLANS = ['Start', 'Plus', 'Pro']
const FORMATS = ['9:16', '1:1', '16:9', '4:5']
const STYLE_OPTIONS = [
  'Minimalist', 'Bold & Bright', 'Earthy Tones',
  'Dark & Moody', 'Pastel Vibes', 'Clean Corporate',
]

const VB_LABELS = [
  'Reels vibe', 'Carousel BG', 'Quote post',
  'Story moment', 'Feed lifestyle', 'Reels portrait', 'Brand detail',
]
const HOOK_TEXTS: Record<string, string> = {
  'Reels vibe':      'Každé ráno si říkám…',
  'Carousel BG':     'Tři věci které změnily vše.',
  'Quote post':      'Jedna věc která změnila vše.',
  'Story moment':    'Tohle nikdo nevidí. Ale cítím to.',
  'Feed lifestyle':  'Takhle vypadá můj svět.',
  'Reels portrait':  'Tohle mi trvalo roky pochopit.',
  'Brand detail':    'Detail který říká vše.',
}

// ─── PhotoCard ────────────────────────────────────────────────────────────────

function PhotoCard({ photo, index }: { photo: VBFile; index: number }) {
  const [hovered, setHovered] = useState(false)
  const [liked, setLiked] = useState(false)
  const label = VB_LABELS[index % VB_LABELS.length]
  const hook = HOOK_TEXTS[label] ?? ''

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
        cursor: 'pointer',
        breakInside: 'avoid',
        display: 'block',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.thumbnailUrl}
        alt={photo.name}
        loading="lazy"
        style={{
          width: '100%',
          display: 'block',
          borderRadius: 10,
          transition: 'transform 0.25s ease',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      />

      {/* Bottom label */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(4px)',
          color: '#111',
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 6,
          pointerEvents: 'none',
        }}
      >
        {label}
      </div>

      {/* Heart button */}
      <button
        onClick={(e) => { e.stopPropagation(); setLiked(!liked) }}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '50%',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 14,
          opacity: hovered || liked ? 1 : 0.6,
          transition: 'opacity 0.15s',
          color: liked ? '#e05a5a' : '#555',
        }}
      >
        {liked ? '♥' : '♡'}
      </button>

      {/* Hover overlay */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0 12px 12px',
            gap: 5,
          }}
        >
          <button
            style={{
              background: '#fff',
              color: '#111',
              border: 'none',
              borderRadius: 8,
              padding: '8px 0',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Vytvořit příspěvek
          </button>
          {hook && (
            <span
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 10,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              „{hook}"
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PhotoSkeleton() {
  const heights = ['140px', '200px', '170px', '230px', '160px', '190px',
                   '150px', '220px', '175px', '210px', '155px', '185px']
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ columns: 3, columnGap: 10 }}>
        {heights.map((h, i) => (
          <div
            key={i}
            style={{
              borderRadius: 10,
              height: h,
              background: 'linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite',
              marginBottom: 10,
              breakInside: 'avoid',
            }}
          />
        ))}
      </div>
    </>
  )
}

// ─── Tweaks panel ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8, fontWeight: 500, letterSpacing: '0.01em' }}>
      {children}
    </div>
  )
}

function TweaksPanel({
  activePlan, setActivePlan,
  activeStyle, setActiveStyle,
  activeFormat, setActiveFormat,
}: {
  activePlan: string | null; setActivePlan: (p: string) => void
  activeStyle: string; setActiveStyle: (s: string) => void
  activeFormat: string; setActiveFormat: (f: string) => void
}) {
  const btnBase: React.CSSProperties = {
    borderRadius: 8,
    border: '1px solid #e8e4dc',
    background: '#fff',
    color: '#555',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  }
  const activeCss: React.CSSProperties = {
    border: '1.5px solid #b7e94c',
    background: '#f0fce0',
    color: '#3d6b00',
    fontWeight: 600,
  }

  return (
    <div
      style={{
        width: 228,
        borderLeft: '1px solid #e8e4dc',
        background: '#fafaf8',
        padding: '24px 16px',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#bbb',
          marginBottom: 22,
        }}
      >
        Tweaks
      </div>

      {/* Tarif */}
      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Tarif</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {PLANS.map((p) => (
            <button
              key={p}
              onClick={() => setActivePlan(p)}
              style={{
                ...btnBase,
                ...(activePlan === p ? activeCss : {}),
                padding: '8px 12px',
                fontSize: 13,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {p}
              {p === 'Plus' && (
                <span style={{ fontSize: 9, color: activePlan === p ? '#5a7a00' : '#aaa', fontWeight: 600 }}>
                  popular
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Styl */}
      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Styl</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STYLE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStyle(s)}
              style={{
                ...btnBase,
                ...(activeStyle === s ? activeCss : {}),
                padding: '7px 12px',
                fontSize: 12,
                textAlign: 'left',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Formát */}
      <div style={{ marginBottom: 8 }}>
        <SectionLabel>Formát</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFormat(f)}
              style={{
                ...btnBase,
                ...(activeFormat === f ? activeCss : {}),
                padding: '8px 6px',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

function DashboardInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectCode = params.projectCode as string
  const token = searchParams.get('token') ?? ''

  // Inspirace state
  const [photos, setPhotos] = useState<VBFile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Vše')
  const [activeColor, setActiveColor] = useState<string | null>(null)

  // Tweaks state
  const [activePlan, setActivePlan] = useState<string | null>(null)
  const [tweakStyle, setTweakStyle] = useState('Minimalist')
  const [tweakFormat, setTweakFormat] = useState('4:5')

  // Load current plan from API
  useEffect(() => {
    if (!projectCode || !token) return
    fetch(
      `/api/client/rtg/batches?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`
    )
      .then((r) => r.json())
      .then((data) => {
        const raw = data.project?.plan ?? data.project?.rtg_plan
        if (raw) {
          setActivePlan(raw.charAt(0).toUpperCase() + raw.slice(1))
        }
      })
      .catch(() => {})
  }, [projectCode, token])

  // Fetch visual bank photos
  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    try {
      const colorParam = activeColor
        ? `&color=${encodeURIComponent(activeColor)}`
        : ''
      const styleParam =
        activeFilter !== 'Vše'
          ? `&style=${encodeURIComponent(activeFilter)}`
          : ''
      const res = await fetch(
        `/api/client/visual-bank?limit=40${colorParam}${styleParam}`
      )
      const data = await res.json()
      if (data.files) setPhotos(data.files)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [activeFilter, activeColor])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 56px)' }}>
      {/* ── Main content ── */}
      <div
        style={{
          flex: 1,
          padding: '28px 24px 32px',
          overflowY: 'auto',
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#111',
              margin: 0,
              fontFamily: 'Playfair Display, Georgia, serif',
            }}
          >
            Inspirace
          </h1>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
            Vyber vizuál pro svůj obsah
          </p>
        </div>

        {/* Style filter pills */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          {STYLE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '5px 13px',
                borderRadius: 20,
                border:
                  activeFilter === f
                    ? '1.5px solid #b7e94c'
                    : '1px solid #e8e4dc',
                background: activeFilter === f ? '#f0fce0' : '#fff',
                color: activeFilter === f ? '#3d6b00' : '#555',
                fontSize: 12,
                fontWeight: activeFilter === f ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Color palette circles */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 11, color: '#bbb', marginRight: 2 }}>
            Paleta
          </span>
          {/* "All" reset */}
          <button
            onClick={() => setActiveColor(null)}
            title="Vše"
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background:
                'conic-gradient(#4A6FA5, #D8D4CC, #E8B4B8, #2C2C2C, #8B7355, #4A9B8E)',
              border: activeColor === null
                ? '2.5px solid #b7e94c'
                : '2px solid rgba(0,0,0,0.12)',
              cursor: 'pointer',
              outline: 'none',
              transform: activeColor === null ? 'scale(1.25)' : 'scale(1)',
              transition: 'transform 0.15s',
            }}
          />
          {COLOR_FILTERS.map((c) => (
            <button
              key={c.label}
              onClick={() =>
                setActiveColor(activeColor === c.style ? null : c.style)
              }
              title={c.style}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: c.color,
                border:
                  activeColor === c.style
                    ? '2.5px solid #b7e94c'
                    : '2px solid rgba(0,0,0,0.12)',
                cursor: 'pointer',
                outline: 'none',
                transform: activeColor === c.style ? 'scale(1.25)' : 'scale(1)',
                transition: 'transform 0.15s',
              }}
            />
          ))}
        </div>

        {/* Photo grid */}
        {loading ? (
          <PhotoSkeleton />
        ) : photos.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#aaa',
              fontSize: 14,
              paddingTop: 60,
            }}
          >
            Žádné fotky nenalezeny
          </div>
        ) : (
          <div style={{ columns: 3, columnGap: 10 }}>
            {photos.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Tweaks panel ── */}
      <TweaksPanel
        activePlan={activePlan}
        setActivePlan={setActivePlan}
        activeStyle={tweakStyle}
        setActiveStyle={setTweakStyle}
        activeFormat={tweakFormat}
        setActiveFormat={setTweakFormat}
      />
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ClientDashboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100%', background: '#f5f3ee' }} />}>
      <DashboardInner />
    </Suspense>
  )
}
