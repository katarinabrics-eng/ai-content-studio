'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type Pillar = { key: string; label: string; score: number; tone?: string }

type PostItem = {
  id: string
  type: string
  aspect: string
  duration?: string
  img: string
  title: string
}

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

// ─── Seed / defaults ──────────────────────────────────────────────────────────

const POSTS_SEED: PostItem[] = [
  {
    id: 'p1', type: 'Foto',    aspect: '9:16', duration: '15s',
    img: '/placeholders/stock-vizualni knihovna/K04/k04-006.png',
    title: 'Buďte autentičtí, nezapomenutelní',
  },
  {
    id: 'p2', type: 'Foto',    aspect: '9:16', duration: '12s',
    img: '/placeholders/stock-vizualni knihovna/K07/k07-085.jpeg',
    title: 'Otevřete dveře, které jste neviděli.',
  },
  {
    id: 'p3', type: 'Grafika', aspect: '1:1',  duration: undefined,
    img: '/placeholders/stock-vizualni knihovna/K04/k04-018.png',
    title: 'Buďte autentičtí, nezapomenutelní',
  },
  {
    id: 'p4', type: 'Grafika', aspect: '1:1',  duration: undefined,
    img: '/placeholders/stock-vizualni knihovna/K04/k04-019.png',
    title: 'Otevřete dveře, které jste neviděli, že existují.',
  },
]

const SCHEDULE_SEED = [
  { date: '22', type: 'Reel',     img: '/placeholders/stock-vizualni knihovna/K04/k04-006.png',  time: '09:00' },
  { date: '23', type: 'Carousel', img: '/placeholders/stock-vizualni knihovna/K04/k04-018.png',  time: '11:30' },
  { date: '24', type: 'Story',    img: '/placeholders/stock-vizualni knihovna/K04/k04-019.png',  time: '17:00' },
  { date: '25', type: 'Reel',     img: '/placeholders/stock-vizualni knihovna/K07/k07-085.jpeg', time: '18:30' },
  { date: '26', type: 'Post',     img: '/placeholders/stock-vizualni knihovna/K04/k04-006.png',  time: '10:00' },
  { date: '27', type: 'Story',    img: '/placeholders/stock-vizualni knihovna/K04/k04-018.png',  time: '20:00' },
  { date: '28', type: 'Reel',     img: '/placeholders/stock-vizualni knihovna/K04/k04-019.png',  time: '19:00' },
  { date: '30', type: 'Carousel', img: '/placeholders/stock-vizualni knihovna/K07/k07-085.jpeg', time: '11:00' },
  { date: '02', type: 'Post',     img: '/placeholders/stock-vizualni knihovna/K04/k04-006.png',  time: '09:30' },
  { date: '03', type: 'Reel',     img: '/placeholders/stock-vizualni knihovna/K04/k04-018.png',  time: '18:00' },
]

const LIBRARY_PREVIEW = [
  '/placeholders/stock-vizualni knihovna/K04/k04-006.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-018.png',
  '/placeholders/stock-vizualni knihovna/K04/k04-019.png',
]

const DEFAULT_PILLARS: Pillar[] = [
  { key: 'value',        label: 'Hodnota',     score: 8 },
  { key: 'energy',       label: 'Energie',      score: 7 },
  { key: 'architecture', label: 'Architektura', score: 7 },
  { key: 'identity',     label: 'Identita',     score: 6, tone: 'warn' },
  { key: 'trust',        label: 'Důvěra',       score: 5, tone: 'warn' },
]

const DEFAULT_PALETTE = [
  { hex: '#f0e8c8', label: 'Krémová' },
  { hex: '#e9d4c8', label: 'Pudrová' },
  { hex: '#f5ede4', label: 'Slonovina' },
  { hex: '#e8d0c0', label: 'Pšenice' },
  { hex: '#ddd0bc', label: 'Písek' },
  { hex: '#e8dcc8', label: 'Lněná' },
  { hex: '#f0e8d8', label: 'Mléčná' },
  { hex: '#e4d4bc', label: 'Karamel' },
  { hex: '#ecdcc0', label: 'Med' },
  { hex: '#f5e8d4', label: 'Marcipán' },
]

function parseBrand(project: Project): BrandData {
  const sr = (project.scan_result as Record<string, unknown>) ?? {}
  // Handle both root-level (DEMO) and nested under result (pipeline projects)
  const srData = (sr.result as Record<string, unknown>) ?? sr
  const bs = (srData.brandScore as Record<string, unknown>) ?? {}
  const dna = (srData.brandDna as Record<string, unknown>) ?? {}
  const pillarAnalysis = srData.pillarAnalysis as Record<string, { score?: number }> | undefined
  const pillars = (srData.pillars as { key: string; label: string; score: number }[] | undefined)
    ?? (pillarAnalysis ? [
      { key: 'light',        label: 'Hodnota',      score: (pillarAnalysis.light?.score        ?? 0) * 10 },
      { key: 'energy',       label: 'Energie',      score: (pillarAnalysis.energy?.score       ?? 0) * 10 },
      { key: 'architecture', label: 'Architektura', score: (pillarAnalysis.architecture?.score ?? 0) * 10 },
      { key: 'identity',     label: 'Identita',     score: (pillarAnalysis.identity?.score     ?? 0) * 10 },
      { key: 'trust',        label: 'Důvěra',       score: (pillarAnalysis.trust?.score        ?? 0) * 10 },
    ] : DEFAULT_PILLARS)
  const rawPalette = (srData.palette ?? sr.palette) as { hex: string; label?: string }[] | undefined
  const rawArchetype = (srData.archetype ?? dna.archetype ?? sr.archetype) as string | undefined

  return {
    name: project.client_name ?? 'Studio Lucifera',
    handle: ((srData.website ?? sr.website) as string) ?? 'studiolucifera.cz',
    score: (bs.total as number) ?? (srData.score as number) ?? 0,
    archetype: rawArchetype ?? 'Kreátor',
    pillars: pillars?.length ? pillars : DEFAULT_PILLARS,
    palette: rawPalette?.length ? rawPalette : DEFAULT_PALETTE,
    positioning: (dna.positioning as string) ?? 'Profesionální portréty pro herce a podnikatele',
    tone: (dna.tone as string) ?? 'Osobní a profesionální',
    targetAudience: (dna.targetAudience as string) ?? 'Herci a podnikatelé',
  }
}

// ─── SpiderChart ──────────────────────────────────────────────────────────────

function SpiderChart({ pillars, size = 220 }: { pillars: Pillar[]; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38
  const n = pillars.length
  const pt = (s: number, i: number): [number, number] => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    const d = (s / 10) * r
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)]
  }
  const axes = Array.from({ length: n }, (_, i) => pt(10, i))
  const poly = pillars.map((p, i) => pt(p.score, i).join(',')).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <polygon
          key={t}
          points={axes.map(([x, y]) => `${cx + (x - cx) * t},${cy + (y - cy) * t}`).join(' ')}
          fill="none" stroke="#e8e4dc" strokeWidth="0.8"
        />
      ))}
      {axes.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e8e4dc" strokeWidth="0.6" opacity=".5" />
      ))}
      <polygon points={poly} fill="rgba(183,233,76,0.25)" stroke="#b7e94c" strokeWidth="1.5" />
      {pillars.map((p, i) => {
        const [x, y] = pt(p.score, i)
        return <circle key={p.key} cx={x} cy={y} r="3" fill="#b7e94c" />
      })}
      {pillars.map((p, i) => {
        const [x, y] = pt(11.5, i)
        return (
          <text key={p.key} x={x} y={y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9.5" fontWeight="600" fill="#8a8680"
            fontFamily="'DM Sans', system-ui, sans-serif">
            {p.label}
          </text>
        )
      })}
    </svg>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, suffix, trend, accent, muted, asDisplay,
}: {
  label: string
  value: string | number
  suffix?: string
  trend?: string
  accent?: boolean
  muted?: boolean
  asDisplay?: boolean
}) {
  return (
    <div style={{
      background: accent ? '#111111' : '#ffffff',
      border: `1px solid ${accent ? '#111111' : '#e8e4dc'}`,
      borderRadius: 16,
      padding: '18px 20px',
      color: accent ? '#f5f3ee' : '#111111',
      boxShadow: '0 1px 3px rgba(0,0,0,.07)',
    }}>
      <div style={{
        fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
        fontWeight: 600,
        color: accent ? '#b7e94c' : '#8a8680',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 8, lineHeight: 1 }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: asDisplay ? 22 : 34,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: muted ? '#b0aea8' : 'inherit',
        }}>{value}</span>
        {suffix && (
          <span style={{ fontSize: 14, color: accent ? '#888' : '#8a8680', fontWeight: 400 }}>
            {suffix}
          </span>
        )}
      </div>
      {trend && (
        <div style={{
          fontSize: 11, marginTop: 8,
          color: accent ? '#b7e94c' : '#3d6b00',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 17l6-6 4 4 8-8" />
          </svg>
          {trend}
        </div>
      )}
    </div>
  )
}

// ─── PostThumb ────────────────────────────────────────────────────────────────

function PostThumb({ post, onClick }: { post: PostItem; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        aspectRatio: post.aspect === '1:1' ? '1' : '9/14',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: `url(${post.img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        cursor: 'pointer',
        border: '1px solid #e8e4dc',
      }}
    >
      <div style={{
        position: 'absolute', top: 8, left: 8,
        fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
        padding: '3px 7px', borderRadius: 999,
        background: post.type === 'Grafika' || post.type === 'GRAFIKA' ? '#b7e94c' : 'rgba(255,255,255,.92)',
        color: '#111', textTransform: 'uppercase' as const,
      }}>{post.type}</div>
      {post.duration && (
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          fontSize: 10, fontWeight: 600,
          padding: '2px 7px', borderRadius: 999,
          background: 'rgba(17,17,17,.7)', color: '#fff',
          backdropFilter: 'blur(4px)',
        }}>{post.duration}</div>
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '8px 12px',
        fontSize: 13, color: '#fff', fontWeight: 600, lineHeight: 1.3,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as never,
      }}>{(post as PostItem & { hook?: string }).hook ?? post.title}</div>
    </div>
  )
}

// ─── BrandDNACard ─────────────────────────────────────────────────────────────

function BrandDNACard({ brand, locked }: { brand: BrandData; locked: boolean }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e8e4dc',
      borderRadius: 16, padding: 22,
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,.07)',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
        textTransform: 'uppercase' as const, color: '#8a8680',
        marginBottom: 10,
      }}>Brand DNA</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: 'Pozicionování', value: brand.positioning },
          { label: 'Tón',            value: brand.tone },
          { label: 'Cílová skupina', value: brand.targetAudience },
          { label: 'Archetyp',       value: brand.archetype, accent: true },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{
              fontSize: 10.5, color: '#b0aea8', width: 100, flexShrink: 0,
              letterSpacing: '0.08em', textTransform: 'uppercase' as const, paddingTop: 2,
            }}>{label}</span>
            <span style={{
              fontSize: accent ? 15 : 13,
              color: '#111111',
              fontWeight: accent ? 600 : 400,
              flex: 1,
              fontFamily: accent ? "'Playfair Display', serif" : 'inherit',
            }}>{value}</span>
          </div>
        ))}
      </div>
      {locked && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(250,248,243,0.96) 58%)',
          pointerEvents: 'none',
        }} />
      )}
      {locked && (
        <button style={{
          marginTop: 14, width: '100%', padding: '8px 12px', fontSize: 11.5,
          position: 'relative', zIndex: 2,
          background: '#ffffff', border: '1px solid #e8e4dc', borderRadius: 10,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          color: '#111',
        }}>
          🔒 Odemknout celou strategii
        </button>
      )}
    </div>
  )
}

// ─── ContentCalendar ─────────────────────────────────────────────────────────

function ContentCalendar() {
  const byDate = Object.fromEntries(SCHEDULE_SEED.map(s => [s.date, s]))
  const cells: { date: string; isMay: boolean; post?: typeof SCHEDULE_SEED[0] }[] = []
  const start = 21
  for (let w = 0; w < 4; w++) {
    for (let d = 0; d < 7; d++) {
      const num = start + w * 7 + d
      const date = num > 30 ? String(num - 30).padStart(2, '0') : String(num).padStart(2, '0')
      cells.push({ date, isMay: num > 30, post: byDate[date] })
    }
  }

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e8e4dc',
      borderRadius: 16, padding: 22,
      boxShadow: '0 1px 3px rgba(0,0,0,.07)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#8a8680', marginBottom: 4 }}>
            Obsahový plán
          </div>
          <div style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", color: '#111', fontWeight: 500 }}>
            Duben / Květen 2025
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['‹', '›'].map(ch => (
            <button key={ch} style={{
              padding: '5px 10px', fontSize: 11,
              background: '#ffffff', border: '1px solid #e8e4dc',
              borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
            }}>{ch}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginBottom: 5 }}>
        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10,
            letterSpacing: '.08em', textTransform: 'uppercase' as const,
            color: '#b0aea8', fontWeight: 600,
          }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
        {cells.map((c, idx) => (
          <div key={idx} style={{
            aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
            border: '1px solid #e8e4dc',
            background: c.post ? 'transparent' : '#faf8f3',
            position: 'relative', cursor: c.post ? 'pointer' : 'default',
            opacity: c.isMay && !c.post ? 0.45 : 1,
          }}>
            {c.post ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.post.img} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,.75) 100%)' }} />
                <div style={{ position: 'absolute', top: 4, left: 5, color: '#fff', fontSize: 10, fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,.4)' }}>
                  {c.date}
                </div>
                <div style={{ position: 'absolute', top: 4, right: 4, background: '#b7e94c', color: '#111', fontSize: 8, fontWeight: 700, letterSpacing: '.04em', padding: '2px 5px', borderRadius: 4, textTransform: 'uppercase' as const }}>
                  {c.post.type}
                </div>
                <div style={{ position: 'absolute', bottom: 3, left: 5, right: 5, color: '#fff', fontSize: 9, lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,.6)' }}>
                  {c.post.time}
                </div>
              </>
            ) : (
              <div style={{ position: 'absolute', top: 4, left: 5, fontSize: 10, color: '#b0aea8', fontWeight: 500 }}>
                {c.date}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 10.5, color: '#8a8680', flexWrap: 'wrap' as const, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#b7e94c', display: 'inline-block' }} />
          {SCHEDULE_SEED.length} naplánováno
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#faf8f3', border: '1px solid #e8e4dc', display: 'inline-block' }} />
          Volné sloty
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 10.5 }}>Klikni na den pro detail →</div>
      </div>
    </div>
  )
}

// ─── Strategist ───────────────────────────────────────────────────────────────

const STRATEGIST_MAP: Record<string, { name: string; bg: string; color: string; initials: string; desc: string }> = {
  ilumina:       { name: 'Ilumina',       bg: '#f5e6ff', color: '#6b00b3', initials: 'IL', desc: 'Mistryně příběhu a jasného sdělení. Pomůže komunikovat tak, aby zákazník okamžitě pochopil hodnotu.' },
  impuls:        { name: 'Impuls',        bg: '#fff8e1', color: '#b36b00', initials: 'IM', desc: 'Mistr energie, dosahu a viditelnosti. Zaměří se na obsah, který šíří a zvyšuje dosah značky.' },
  katalyzator:   { name: 'Katalyzátor',   bg: '#fff0e6', color: '#b34400', initials: 'KA', desc: 'Mistr emoce, transformace a prodeje. Propojí zákazníka se značkou na hlubší úrovni.' },
  architekt:     { name: 'Architekt',     bg: '#e6f0ff', color: '#003db3', initials: 'AR', desc: 'Vytvoří neodolatelnou nabídku postavenou na hodnotovém vzorci. Identifikuje co zákazník skutečně kupuje.' },
  signal:        { name: 'Signál',        bg: '#e6fff0', color: '#006b3d', initials: 'SI', desc: 'Mistr hlasu, niche a permission marketingu. Pomůže najít jedinečný hlas a cílovou skupinu.' },
  content_voice: { name: 'Content Voice', bg: '#fff5e6', color: '#b36b00', initials: 'CV', desc: 'Hlas a příběh značky — texty, bio, claims. Převede Brand DNA do konkrétních textů.' },
}

function getStrategist(sr: Record<string, unknown>) {
  const result = (sr.result as Record<string, unknown>) ?? sr
  const id = ((result.recommended_strategist ?? result.strategist_id) as string | undefined)?.toLowerCase()
    ?? ((result.suggested_strategists as {id?: string}[] | undefined)?.[0]?.id)?.toLowerCase()
  if (!id) return null
  const normalized = id
    .replace('the_catalyst', 'katalyzator')
    .replace('the_pathfinder', 'impuls')
    .replace('the_architect', 'architekt')
    .replace('the_illuminator', 'ilumina')
    .replace('the_signal', 'signal')
    .replace('the_voice', 'content_voice')
  return STRATEGIST_MAP[normalized] ?? STRATEGIST_MAP[id] ?? null
}

// ─── Dashboard Inner ──────────────────────────────────────────────────────────

function DashboardInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectCode = params.projectCode as string
  const token = searchParams.get('token') ?? ''

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [vbPreview, setVbPreview] = useState<{ id: string; thumbnailUrl: string }[]>([])

  useEffect(() => {
    fetch('/api/client/visual-bank?limit=3')
      .then(r => r.json())
      .then(d => { if (d.files?.length) setVbPreview(d.files.slice(0, 3)) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!projectCode) return
    ;(async () => {
      let result: Project = {
        rtg_plan: null, pvi_active: false,
        scan_result: null, client_name: null, pendingCount: 0,
      }
      try {
        const r = await fetch(`/api/client/rtg/batches?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`)
        const d = await r.json()
        if (d.ok && d.project) {
          result.rtg_plan = d.project.rtg_plan ?? d.project.plan ?? null
          result.client_name = d.project.client_name ?? null
          result.pvi_active = d.project.pvi_active ?? false
          if (d.posts) {
            result.pendingCount = (d.posts as Array<{ status: string }>).filter(p => p.status === 'client_review').length
          }
        }
      } catch { /* ignore */ }
      try {
        const r = await fetch(`/api/client/project?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`)
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
        <div style={{ height: 16, width: 180, background: '#f0efeb', borderRadius: 6 }} />
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      </div>
    )
  }

  const isFree  = !project?.rtg_plan && !project?.pvi_active
  const hasRtg  = !!(project?.rtg_plan)
  const hasPVI  = !!(project?.pvi_active)
  const brand   = parseBrand(project ?? { rtg_plan: null, pvi_active: false, scan_result: null, client_name: null, pendingCount: 0 })
  const pendingCount = project?.pendingCount ?? 0
  const creditsInit  = hasRtg
    ? project?.rtg_plan === 'pro' ? 22000 : project?.rtg_plan === 'plus' ? 12000 : 6000
    : 0

  // ── scraped images + generated posts → PostItem[]
  const scrapedImgs = ((project?.scan_result?.scrapedImages as string[]) ?? [])
    .filter((url: string) => !url.toLowerCase().includes('logo'))
  const gp = (project?.scan_result?.generatedPosts as { type?: string; label?: string; title?: string; body?: string; style?: string; duration?: string; platform?: string; variant?: string; hook?: string }[] | undefined) ?? []
  const imgFor = (i: number) => scrapedImgs[i] ?? POSTS_SEED[i % POSTS_SEED.length]?.img ?? ''

  const contentPosts: PostItem[] = gp.length > 0
    ? gp.slice(0, 4).map((post, i) => ({
        id: `gp-${i}`,
        type: post.label ?? (post.type === 'video' ? 'VIDEO · REELS' : 'GRAFIKA'),
        aspect: post.type === 'video' ? '9:16' : '1:1',
        duration: post.duration ?? (post.type === 'video' ? '15s · Reels' : undefined),
        img: imgFor(i),
        title: post.title ?? '',
      }))
    : POSTS_SEED.slice(0, 4).map((p, i) => ({
        ...p,
        img: scrapedImgs[i] ?? p.img,
      }))

  return (
    <div style={{ padding: '32px 28px 80px', maxWidth: 1280, margin: '0 auto', background: '#f5f2ec', minHeight: '100vh' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 8 }}>
            Dobré ráno, Kataríno
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#111', margin: '0 0 8px', lineHeight: 1.05 }}>
            {brand.name}
          </h1>
          <div style={{ fontSize: 14, color: '#8a8680', maxWidth: 560 }}>
            {isFree
              ? 'Zkoumáme tvou značku — tvé výsledky budou plně aktivní po upgradu.'
              : hasPVI
              ? 'Tvá prémiová identita roste. Tady je dnešní přehled.'
              : `Tempo ${project?.rtg_plan?.toUpperCase()} · obsah na autopilotu.`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!isFree && (
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: '#ffffff', border: '1px solid #e8e4dc', color: '#111',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 4v12"/><path d="M6 10l6 6 6-6"/><path d="M5 20h14"/></svg>
              Exportovat report
            </button>
          )}
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: '#111111', color: '#f5f3ee',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ✦ Vytvořit příspěvek
          </button>
        </div>
      </div>

      {/* ── Free trial banner ── */}
      {isFree && (
        <div style={{
          background: '#111111', borderRadius: 16, padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, marginBottom: 22,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#b7e94c', marginBottom: 6 }}>
              Free trial · 14 dní
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', color: '#f5f3ee' }}>
              Tvé výsledky jsou dostupné ještě 14 dní.
            </div>
            <div style={{ fontSize: 13, color: '#b0aea8', marginTop: 6, maxWidth: 480 }}>
              Po uplynutí doby se všechna data automaticky vymažou.
              Přihlaš se k odběru a pracuj s nimi dál.
            </div>
          </div>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: '#b7e94c', border: 'none', color: '#111',
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Přejít na placený plán
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
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
        <StatCard label="Archetyp" value={brand.archetype} asDisplay />
        <StatCard label="Příspěvky ke schválení" value={pendingCount} muted={pendingCount === 0} />
        <StatCard
          label={isFree ? 'Zbývá zdarma' : 'Kredit'}
          value={isFree ? '14 dní' : creditsInit.toLocaleString('cs')}
        />
      </div>

      {/* ── 2-col layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Brand pillars */}
          <div style={{ background: '#ffffff', border: '1px solid #e8e4dc', borderRadius: 16, padding: 26, boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 4 }}>
                  Pilíře značky
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: '#111', margin: '4px 0 0', letterSpacing: '-0.01em' }}>
                  Pět sil, co drží {brand.name} v rovnováze
                </h3>
              </div>
              <div style={{ padding: '6px 12px', borderRadius: 999, background: '#f0fce0', color: '#3d6b00', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {isFree ? 'Náhled' : 'Aktivní'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 26, marginTop: 22, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {brand.pillars.map((p) => (
                  <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 80, fontSize: 12, color: '#444444', fontWeight: 500, flexShrink: 0 }}>
                      {p.label}
                    </div>
                    <div style={{
                      flex: 1, height: 6, background: '#faf8f3',
                      borderRadius: 999, overflow: 'hidden',
                      filter: isFree ? 'blur(2px) opacity(.7)' : 'none',
                    }}>
                      <div style={{
                        width: `${p.score * 10}%`, height: '100%',
                        background: p.tone === 'warn' ? '#e0a24a' : '#b7e94c',
                        transition: 'width .6s ease',
                      }} />
                    </div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 16, fontWeight: 500, width: 20, textAlign: 'right' as const,
                      filter: isFree ? 'blur(3px)' : 'none', color: '#111',
                    }}>{p.score}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', filter: isFree ? 'blur(2.5px)' : 'none', opacity: isFree ? 0.6 : 1 }}>
                <SpiderChart pillars={brand.pillars} size={220} />
              </div>
            </div>

            {isFree && (
              <div style={{
                marginTop: 20, padding: 14,
                background: '#faf8f3', border: '1px solid #e8e4dc', borderRadius: 10,
                fontSize: 12, color: '#8a8680',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>Plná analýza pilířů je odemčena v placeném tarifu.</span>
                <button style={{
                  background: '#ffffff', border: '1px solid #e8e4dc', borderRadius: 7,
                  padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', color: '#111',
                }}>Odemknout →</button>
              </div>
            )}
          </div>

          {/* Content card — RTG/PVI: real posts; free: Ochutnávka with PostThumbs */}
          {(hasRtg || hasPVI) ? (
            <div style={{ background: '#ffffff', border: '1px solid #e8e4dc', borderRadius: 16, padding: 26, boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 4 }}>
                    Tvůj obsah
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, color: '#111', margin: '4px 0 0' }}>
                    Připravený k použití
                  </h3>
                </div>
                <button style={{ color: '#8a8680', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Vidět vše →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {contentPosts.slice(0, 4).map((p) => (
                  <PostThumb key={p.id} post={p} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: '#ffffff', border: '1px solid #e8e4dc', borderRadius: 16, padding: 26, boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 4 }}>
                Ochutnávka
              </div>
              {(() => {
                console.log('DEBUG scan_result keys:', Object.keys(project?.scan_result ?? {}))
                if (gp.length === 0) {
                  return (
                    <>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, color: '#111', margin: '4px 0 6px' }}>
                        Příspěvky se připravují
                      </h3>
                      <div style={{ fontSize: 13, color: '#8a8680', lineHeight: 1.6 }}>
                        Po dokončení diagnostiky zde uvidíš ukázku obsahu pro tvou značku.
                      </div>
                    </>
                  )
                }

                const videoPosts  = gp.filter(p => p.type === 'video').slice(0, 2)
                const grafikaPosts = gp.filter(p => p.type !== 'video').slice(0, 2)
                // helper: pick image from scrapedImgs with POSTS_SEED fallback
                const colImg = (idx: number) =>
                  scrapedImgs.length > 0
                    ? scrapedImgs[idx % scrapedImgs.length]
                    : POSTS_SEED[idx % POSTS_SEED.length].img

                return (
                  <>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, color: '#111', margin: '4px 0 18px' }}>
                      Příspěvky připravené pro tvou značku
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                      {/* VIDEO posts — split card: collage LEFT, text RIGHT */}
                      {videoPosts.map((post, i) => (
                        <div key={`video-${i}`} style={{
                          display: 'grid', gridTemplateColumns: '1fr 1fr',
                          borderRadius: 12, border: '1px solid #e8e4dc', overflow: 'hidden',
                        }}>
                          {/* 3×3 collage */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gridTemplateRows: 'repeat(3, 1fr)',
                            height: 220,
                          }}>
                            {Array.from({ length: 9 }, (_, j) => (
                              <div key={j} style={{
                                backgroundImage: `url(${colImg(i * 9 + j)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }} />
                            ))}
                          </div>
                          {/* text panel */}
                          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, background: '#faf9f7' }}>
                            <span style={{
                              alignSelf: 'flex-start', fontSize: 9, fontWeight: 700,
                              letterSpacing: '.1em', padding: '3px 8px', borderRadius: 999,
                              background: '#111', color: '#fff', textTransform: 'uppercase' as const,
                            }}>VIDEO · REELS</span>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 500, color: '#111', lineHeight: 1.35 }}>
                              {post.hook ?? post.title ?? ''}
                            </div>
                            <div style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                              {post.body ?? post.style ?? ''}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                              <span style={{ border: '1px solid #ddd', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#555' }}>
                                {post.platform ?? 'Instagram'}
                              </span>
                              <span style={{ border: '1px solid #ddd', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#555' }}>
                                {post.variant ?? 'Varianta A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* GRAFIKA posts — full-width image + text below */}
                      {grafikaPosts.map((post, i) => (
                        <div key={`grafika-${i}`} style={{
                          borderRadius: 12, border: '1px solid #e8e4dc', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: 180,
                            backgroundImage: `url(${colImg(videoPosts.length * 9 + i)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }} />
                          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <span style={{
                              alignSelf: 'flex-start', fontSize: 9, fontWeight: 700,
                              letterSpacing: '.1em', padding: '3px 8px', borderRadius: 999,
                              background: '#b7e94c', color: '#111', textTransform: 'uppercase' as const,
                            }}>GRAFIKA</span>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 500, color: '#111', lineHeight: 1.35 }}>
                              {post.title ?? post.hook ?? ''}
                            </div>
                            <div style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                              {post.body ?? post.style ?? ''}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                              <span style={{ border: '1px solid #ddd', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#555' }}>
                                {post.platform ?? 'Instagram'}
                              </span>
                              <span style={{ border: '1px solid #ddd', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#555' }}>
                                {post.variant ?? 'Varianta A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Fallback: if no typed posts were split, show PostThumb grid */}
                      {videoPosts.length === 0 && grafikaPosts.length === 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                          {contentPosts.slice(0, 4).map((post) => (
                            <PostThumb key={post.id} post={post} />
                          ))}
                        </div>
                      )}

                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>

        {/* RIGHT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <BrandDNACard brand={brand} locked={isFree} />

          {/* Paleta */}
          <div style={{ background: '#ffffff', border: '1px solid #e8e4dc', borderRadius: 16, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 4 }}>Paleta</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#111', margin: '4px 0 0', fontWeight: 500 }}>
                  Krémová & jemná
                </h3>
              </div>
              {!isFree && (
                <button style={{
                  padding: '5px 10px', fontSize: 10.5,
                  background: '#ffffff', border: '1px solid #e8e4dc',
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', gap: 5, color: '#111',
                }}>✦ Upravit</button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#8a8680', margin: '6px 0 12px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 4.5 6.5 4.5 9s-1.5 6-4.5 9M12 3c-3 3-4.5 6.5-4.5 9s1.5 6 4.5 9"/></svg>
              Z diagnostiky <strong style={{ color: '#444' }}>{brand.handle}</strong>
              <span style={{ color: '#b0aea8' }}>· auto-extrakt</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {brand.palette.slice(0, 10).map((c, i) => (
                <div key={i} title={c.label ?? c.hex} style={{
                  aspectRatio: '1', borderRadius: 8, background: c.hex,
                  border: '1px solid rgba(17,17,17,0.08)',
                }} />
              ))}
            </div>
            <div style={{ marginTop: 14, fontFamily: 'monospace', fontSize: 10, color: '#b0aea8', lineHeight: 1.7, letterSpacing: '-.01em', wordBreak: 'break-all' as const }}>
              {brand.palette.slice(0, 6).map(c => `'${c.hex}'`).join(', ')} …
            </div>
            {!isFree && (
              <div style={{ marginTop: 10, padding: '8px 10px', background: '#f0fce0', borderRadius: 6, fontSize: 10.5, color: '#3d6b00', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12l5 5L20 6"/></svg>
                Přepisovatelné — v plném tarifu si paletu upravíš ručně
              </div>
            )}
          </div>

          {/* Stratég */}
          {(() => {
            const sr = (project?.scan_result as Record<string, unknown>) ?? {}
            const strat = getStrategist(sr)
            return (
              <div style={{ background: '#ffffff', border: '1px solid #e8e4dc', borderRadius: 16, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 12 }}>
                  Doporučení stratéga
                </div>
                {strat ? (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 999, flexShrink: 0,
                      background: strat.bg, color: strat.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 13,
                    }}>{strat.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{strat.name}</div>
                      <div style={{ fontSize: 11, color: '#8a8680' }}>Brand strateg · fit {brand.score || 80}%</div>
                      <div style={{ fontSize: 12.5, color: '#444444', marginTop: 10, lineHeight: 1.6 }}>
                        {strat.desc}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#8a8680', lineHeight: 1.6 }}>
                    Stratég bude doporučen po dokončení analýzy.
                  </div>
                )}
              </div>
            )
          })()}

          {/* Obsahový plán — only for paid plans */}
          {!isFree && <ContentCalendar />}

        </div>
      </div>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ClientDashboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100%', background: '#f5f2ec' }} />}>
      <DashboardInner />
    </Suspense>
  )
}
