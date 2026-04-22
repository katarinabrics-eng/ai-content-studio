'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type Pillar = { key: string; label: string; score: number; tone?: string }

type BrandData = {
  name: string
  handle: string
  score: number
  archetype: string
  pillars: Pillar[]
  palette: { hex: string; label?: string }[]
  positioning: string
  tone: string
  targetAudience: string
}

type Project = {
  rtg_plan: string | null
  pvi_active: boolean
  scan_result: Record<string, unknown> | null
  client_name: string | null
  pendingCount: number
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PILLARS: Pillar[] = [
  { key: 'value',        label: 'Hodnota',     score: 7 },
  { key: 'energy',       label: 'Energie',      score: 6 },
  { key: 'architecture', label: 'Architektura', score: 8 },
  { key: 'identity',     label: 'Identita',     score: 5, tone: 'warn' },
  { key: 'trust',        label: 'Důvěra',       score: 6, tone: 'warn' },
]

const DEFAULT_PALETTE = [
  '#c8b89a', '#d8c8a8', '#e0ceb0', '#b4a08c', '#a09070',
  '#e8e0d0', '#d0c8b8', '#c0b0a0', '#b8a898', '#a89880',
]

function parseBrand(project: Project): BrandData {
  const sr = project.scan_result as Record<string, unknown> | null ?? {}
  const bs = (sr.brandScore as Record<string, unknown>) ?? {}
  const dna = (sr.brandDna as Record<string, unknown>) ?? {}
  const rawPillars = sr.pillars as Pillar[] | undefined
  const rawPalette = sr.palette as { hex: string; label?: string }[] | undefined
  const rawArchetype = (sr.archetype ?? (dna.archetype)) as string | undefined

  return {
    name: project.client_name ?? 'Tvoje značka',
    handle: '',
    score: (bs.total as number) ?? 0,
    archetype: rawArchetype ?? '–',
    pillars: rawPillars?.length ? rawPillars : DEFAULT_PILLARS,
    palette: rawPalette?.length
      ? rawPalette
      : DEFAULT_PALETTE.map((hex) => ({ hex })),
    positioning: (dna.positioning as string) ?? '',
    tone: (dna.tone as string) ?? '',
    targetAudience: (dna.targetAudience as string) ?? '',
  }
}

// ─── Spider chart ─────────────────────────────────────────────────────────────

function SpiderChart({ pillars, size = 180 }: { pillars: Pillar[]; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38
  const n = pillars.length
  const pts = (scores: number[]) =>
    scores
      .map((s, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2
        const d = (s / 10) * r
        return `${cx + d * Math.cos(a)},${cy + d * Math.sin(a)}`
      })
      .join(' ')

  const axes = Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <polygon
          key={t}
          points={axes.map(({ x, y }) =>
            `${cx + (x - cx) * t},${cy + (y - cy) * t}`
          ).join(' ')}
          fill="none" stroke="#e8e4dc" strokeWidth="1"
        />
      ))}
      {axes.map(({ x, y }, i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e8e4dc" strokeWidth="1" />
      ))}
      <polygon
        points={pts(pillars.map((p) => p.score))}
        fill="rgba(183,233,76,0.25)" stroke="#b7e94c" strokeWidth="1.5"
      />
    </svg>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, suffix, trend, accent, subtle, muted,
}: {
  label: string
  value: string | number
  suffix?: string
  trend?: string
  accent?: boolean
  subtle?: boolean
  muted?: boolean
}) {
  return (
    <div style={{
      background: accent ? '#111' : '#fff',
      border: `1px solid ${accent ? 'transparent' : '#e8e4dc'}`,
      borderRadius: 14,
      padding: '20px 22px',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: accent ? '#b7e94c' : '#b0aea8',
        marginBottom: 10,
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: accent ? 42 : 32,
          fontWeight: 500,
          color: accent ? '#fff' : (muted ? '#ccc' : '#111'),
          lineHeight: 1,
        }}>{value}</span>
        {suffix && (
          <span style={{ fontSize: 13, color: accent ? 'rgba(255,255,255,.4)' : '#bbb' }}>
            {suffix}
          </span>
        )}
      </div>
      {trend && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#b7e94c', fontWeight: 500 }}>
          ↗ {trend}
        </div>
      )}
      {subtle && !accent && (
        <div style={{ marginTop: 6, fontSize: 10, color: '#aaa' }}>kreditů zbývá</div>
      )}
    </div>
  )
}

// ─── Dashboard Inner ──────────────────────────────────────────────────────────

function DashboardInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectCode = params.projectCode as string
  const token = searchParams.get('token') ?? ''

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectCode) return
    ;(async () => {
      let result: Project = {
        rtg_plan: null, pvi_active: false,
        scan_result: null, client_name: null, pendingCount: 0,
      }

      // RTG path
      try {
        const r = await fetch(
          `/api/client/rtg/batches?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`
        )
        const d = await r.json()
        if (d.ok && d.project) {
          result.rtg_plan = d.project.rtg_plan ?? d.project.plan ?? null
          result.client_name = d.project.client_name ?? null
          result.pvi_active = d.project.pvi_active ?? false
          if (d.posts) {
            result.pendingCount = (d.posts as Array<{ status: string }>)
              .filter((p) => p.status === 'client_review').length
          }
        }
      } catch { /* ignore */ }

      // Brand/PVI path
      try {
        const r = await fetch(
          `/api/client/project?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`
        )
        const d = await r.json()
        if (d.project) {
          result.scan_result = d.project.scan_result ?? null
          result.client_name = result.client_name ?? d.project.client_name ?? null
          result.pvi_active = result.pvi_active || d.project.pvi_active || false
          result.rtg_plan = result.rtg_plan ?? d.project.rtg_plan ?? null
        }
      } catch { /* ignore */ }

      setProject(result)
      setLoading(false)
    })()
  }, [projectCode, token])

  if (loading) {
    return (
      <div style={{ padding: '40px 32px' }}>
        <div style={{ height: 28, width: 240, background: '#f0efeb', borderRadius: 8, marginBottom: 12, animation: 'shimmer 1.4s infinite' }} />
        <div style={{ height: 16, width: 180, background: '#f0efeb', borderRadius: 6, animation: 'shimmer 1.4s infinite' }} />
        <style>{`@keyframes shimmer { 0%{opacity:1} 50%{opacity:.5} 100%{opacity:1} }`}</style>
      </div>
    )
  }

  const isFree = !project?.rtg_plan && !project?.pvi_active && !project?.scan_result?.brandScore
  const brand = parseBrand(project ?? {
    rtg_plan: null, pvi_active: false,
    scan_result: null, client_name: null, pendingCount: 0,
  })
  const hasScanData = !!(project?.scan_result)
  const pendingCount = project?.pendingCount ?? 0
  const hasRtg = !!(project?.rtg_plan)

  return (
    <div style={{ padding: '28px 32px 48px', maxWidth: 1200 }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#b0aea8', marginBottom: 6 }}>
            Dobré ráno
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 500, color: '#111', margin: 0, lineHeight: 1.2 }}>
            {brand.name}
          </h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
            {isFree
              ? 'Zkoumáme tvou značku — tvé výsledky budou plně aktivní po upgradu.'
              : hasRtg
              ? `Plán ${project?.rtg_plan?.toUpperCase()} · obsah na autopilotu`
              : 'Tvá prémiová identita roste. Tady je dnešní přehled.'}
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#111', color: '#fff', border: 'none',
          borderRadius: 10, padding: '11px 20px', fontSize: 13,
          fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ✦ Vytvořit příspěvek
        </button>
      </div>

      {/* ── Free trial banner ── */}
      {isFree && (
        <div style={{
          background: '#111', borderRadius: 16, padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, marginBottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#b7e94c', marginBottom: 8 }}>
              Free trial · 14 dní
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: '#fff', marginBottom: 6 }}>
              Tvé výsledky jsou dostupné ještě 14 dní.
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', maxWidth: 460, lineHeight: 1.6 }}>
              Po uplynutí doby se všechna data automaticky vymažou.
              Přihlaš se k odběru a pracuj s nimi dál.
            </div>
          </div>
          <button style={{
            background: '#b7e94c', color: '#111', border: 'none',
            borderRadius: 10, padding: '12px 22px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Přejít na placený plán →
          </button>
        </div>
      )}

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard
          label="Brand index"
          value={brand.score || '–'}
          suffix={brand.score ? '/100' : undefined}
          trend={brand.score ? '+6 tento měsíc' : undefined}
          accent
        />
        <StatCard label="Archetyp" value={brand.archetype} />
        <StatCard label="Příspěvky ke schválení" value={pendingCount} muted={pendingCount === 0} />
        <StatCard
          label={isFree ? 'Zbývá zdarma' : 'Kredit'}
          value={isFree ? '14 dní' : '4 200'}
          subtle
        />
      </div>

      {/* ── 2-col layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: Pilíře ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e4dc', padding: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#b0aea8', marginBottom: 6 }}>
                  Pilíře značky
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>
                  Pět sil, co drží tvou značku v rovnováze
                </h3>
              </div>
              <span style={{
                padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: isFree ? '#f5f3ee' : '#f0fce0',
                color: isFree ? '#888' : '#3d6b00',
              }}>
                {isFree ? 'Náhled' : 'Aktivní'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 24, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {brand.pillars.map((p) => (
                  <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 86, fontSize: 12, color: '#555', fontWeight: 500, flexShrink: 0 }}>
                      {p.label}
                    </div>
                    <div style={{
                      flex: 1, height: 6, background: '#f0efeb',
                      borderRadius: 999, overflow: 'hidden',
                      filter: isFree ? 'blur(2px)' : 'none',
                    }}>
                      <div style={{
                        width: `${p.score * 10}%`, height: '100%',
                        background: p.tone === 'warn' ? '#e0a24a' : '#b7e94c',
                        borderRadius: 999,
                        transition: 'width .6s ease',
                      }} />
                    </div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 16, fontWeight: 500, width: 18,
                      textAlign: 'right', color: '#111',
                      filter: isFree ? 'blur(4px)' : 'none',
                    }}>
                      {p.score}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'center',
                filter: isFree ? 'blur(3px)' : 'none',
                opacity: isFree ? .6 : 1,
              }}>
                <SpiderChart pillars={brand.pillars} size={200} />
              </div>
            </div>

            {isFree && (
              <div style={{
                marginTop: 20, padding: '12px 16px',
                background: '#f5f3ee', border: '1px solid #e8e4dc',
                borderRadius: 10, fontSize: 12, color: '#888',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>Plná analýza pilířů je odemčena v placeném tarifu.</span>
                <button style={{
                  background: 'none', border: '1px solid #e8e4dc', borderRadius: 7,
                  padding: '5px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', color: '#555',
                }}>
                  Odemknout →
                </button>
              </div>
            )}
          </div>

          {/* Ochutnávka / Obsah */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e4dc', padding: 26 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#b0aea8', marginBottom: 8 }}>
              {hasRtg ? 'Tvůj obsah' : 'Ochutnávka'}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#111', margin: '0 0 6px' }}>
              {hasRtg ? 'Připravený k použití' : '3 příspěvky zdarma čekají v knihovně'}
            </h3>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              {hasRtg
                ? 'Klikni pro schválení nebo úpravu textu.'
                : 'Vyber si fotku, kterou znáš — zbytek za tebe Lucifera dotvoří.'}
            </p>
            {/* Placeholder grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                '/placeholders/stock-vizualni knihovna/K04/k04-006.png',
                '/placeholders/stock-vizualni knihovna/K04/k04-018.png',
                '/placeholders/stock-vizualni knihovna/K04/k04-019.png',
              ].map((src, i) => (
                <div key={i} style={{ aspectRatio: '4/5', borderRadius: 10, overflow: 'hidden', background: '#f0efeb', position: 'relative', cursor: 'pointer' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                  {!hasRtg && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 11, background: 'rgba(255,255,255,.9)', color: '#111', padding: '4px 10px', borderRadius: 8, fontWeight: 500 }}>
                        Zdarma
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Brand DNA + Paleta + Stratég ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Brand DNA */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e4dc', padding: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#b0aea8', marginBottom: 12 }}>
              Brand DNA
            </div>
            {hasScanData && !isFree ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'POZICIONOVÁNÍ', value: brand.positioning },
                  { label: 'TÓN', value: brand.tone },
                  { label: 'CÍLOVÁ SKUPINA', value: brand.targetAudience },
                ].map(({ label, value }) => value ? (
                  <div key={label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8, alignItems: 'start' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: '#b0aea8', textTransform: 'uppercase', paddingTop: 2 }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{value}</span>
                  </div>
                ) : null)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['POZICIONOVÁNÍ', 'TÓN', 'CÍLOVÁ SKUPINA'].map((l) => (
                  <div key={l} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: '#b0aea8', textTransform: 'uppercase', paddingTop: 4 }}>{l}</span>
                    <div style={{ height: 14, background: '#f0efeb', borderRadius: 6, filter: 'blur(3px)' }} />
                  </div>
                ))}
              </div>
            )}
            <button style={{
              marginTop: 16, width: '100%', padding: '10px', background: '#f5f3ee',
              border: '1px solid #e8e4dc', borderRadius: 9, fontSize: 12, color: '#555',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              🔒 Odemknout celou strategii
            </button>
          </div>

          {/* Paleta */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e4dc', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#b0aea8', marginBottom: 6 }}>
                  Paleta
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#111', margin: 0 }}>
                  Krémová & jemná
                </h3>
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#b0aea8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              🌐 Z diagnostiky <strong style={{ color: '#888' }}>{brand.handle || 'tvého webu'}</strong>
              <span style={{ color: '#ccc' }}>· auto-extrakt</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 10 }}>
              {brand.palette.slice(0, 10).map((c, i) => (
                <div key={i} title={c.hex} style={{
                  aspectRatio: '1', borderRadius: 8,
                  background: c.hex,
                  border: '1px solid rgba(17,17,17,0.08)',
                }} />
              ))}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#ccc', lineHeight: 1.7, wordBreak: 'break-all' }}>
              {brand.palette.slice(0, 5).map((c) => `'${c.hex}'`).join(', ')} …
            </div>
          </div>

          {/* Stratég */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e4dc', padding: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#b0aea8', marginBottom: 14 }}>
              Doporučení stratéga
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#f0fce0', color: '#3d6b00',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>
                ✨
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 3 }}>Ilumina</div>
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>
                  Brand storytelling & jasné sdělení
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: 14 }}>
              Pomůže ti komunikovat tak, aby zákazník okamžitě pochopil tvoji hodnotu.
            </div>
            <button style={{
              width: '100%', padding: '10px', background: '#111',
              border: 'none', borderRadius: 9, fontSize: 12, color: '#fff',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            }}>
              Spustit strategii →
            </button>
          </div>

        </div>
      </div>
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
