'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

// ─── Types ─────────────────────────────────────────────────────────────────────

type ScheduledPost = {
  date: string      // "26" — číslo dne
  month: number     // 0-11
  year: number
  type: string      // Reel / Carousel / Post / Story
  hook: string
  img: string
  time: string
  postIdx?: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MESICE = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
const DNY = ['Po','Út','St','Čt','Pá','So','Ne']

// ─── Inner component ──────────────────────────────────────────────────────────

function PlanovacInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectCode = params.projectCode as string
  const token = searchParams.get('token') ?? ''

  const now = new Date()
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [editModal, setEditModal] = useState<ScheduledPost | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [addModal, setAddModal] = useState<{ date: string; month: number; year: number } | null>(null)

  useEffect(() => {
    if (!projectCode) return
    ;(async () => {
      try {
        const r = await fetch(
          `/api/client/project?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`
        )
        const d = await r.json()
        const sr = d.project?.scan_result as Record<string, unknown> | undefined
        const rawScheduled = (sr?.scheduledPosts as unknown[]) ?? []
        const normalized = rawScheduled.map((s: unknown) => {
          const sp = s as Record<string, unknown>
          return {
            ...sp,
            date: String(sp.date),
            month: Number(sp.month),
            year: Number(sp.year),
            postIdx: sp.postIdx !== undefined ? Number(sp.postIdx) : undefined,
          } as ScheduledPost
        })
        setScheduled(normalized)
      } catch {
        // fetch failed
      } finally {
        setLoading(false)
      }
    })()
  }, [projectCode, token])

  const saveSchedule = async (newScheduled: ScheduledPost[]) => {
    setScheduled(newScheduled)
    await fetch('/api/client/post-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectCode,
        token,
        postIndex: -1,
        status: 'pending',
        scheduledPosts: newScheduled,
      }),
    })
  }

  const openEdit = (post: ScheduledPost) => {
    setEditModal(post)
    setEditDate(`${post.year}-${String(post.month + 1).padStart(2, '0')}-${String(post.date).padStart(2, '0')}`)
    setEditTime(post.time)
  }

  // ── Kalendář: 42 buněk ─────────────────────────────────────────────────────
  const firstWeekday = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7  // Po = 0
  const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate()
  const prevDays     = new Date(currentYear, currentMonth, 0).getDate()
  const prevM = currentMonth === 0  ? 11 : currentMonth - 1
  const prevY = currentMonth === 0  ? currentYear - 1 : currentYear
  const nextM = currentMonth === 11 ?  0 : currentMonth + 1
  const nextY = currentMonth === 11 ? currentYear + 1 : currentYear

  type Cell = { dayNum: number; month: number; year: number; inCurrent: boolean }
  const cells: Cell[] = []
  for (let i = firstWeekday - 1; i >= 0; i--)
    cells.push({ dayNum: prevDays - i, month: prevM, year: prevY, inCurrent: false })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ dayNum: d, month: currentMonth, year: currentYear, inCurrent: true })
  let nd = 1
  while (cells.length < 42)
    cells.push({ dayNum: nd++, month: nextM, year: nextY, inCurrent: false })

  const findPost = (dayNum: number, month: number, year: number) =>
    scheduled.find(s => String(s.date) === String(dayNum) && s.month === month && s.year === year) ?? null

  const goPrev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const goNext = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const scheduledThisMonth = scheduled.filter(s => s.month === currentMonth && s.year === currentYear).length

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ padding: '40px 32px' }}>
        <div style={{ height: 28, width: 260, background: '#f0efeb', borderRadius: 8, marginBottom: 12, animation: 'shimmer 1.4s infinite' }} />
        <div style={{ height: 16, width: 200, background: '#f0efeb', borderRadius: 6 }} />
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      </div>
    )
  }

  const eyebrow: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#8a8680',
  }

  return (
    <div style={{ padding: '28px 24px 80px', maxWidth: 1280, margin: '0 auto', background: '#f5f2ec', minHeight: '100vh' }}>

      {/* ── Hlavička ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 22 }}>
        <div>
          <div style={{ ...eyebrow, marginBottom: 6 }}>Plánovač</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 500, color: '#111', margin: '0 0 6px', lineHeight: 1.1 }}>
            Kalendář obsahu
          </h1>
          <div style={{ fontSize: 13, color: '#8a8680', lineHeight: 1.5 }}>
            Klikni na den s příspěvkem pro úpravu, nebo na prázdný slot pro přidání.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
          <button style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid #e8e4dc', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#333' }}>
            ⬇ Export .ics
          </button>
          <button
            onClick={() => router.push(`/client/${projectCode}/prispevky?token=${token}`)}
            style={{ padding: '8px 14px', borderRadius: 9, border: 'none', background: '#111', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Nový příspěvek
          </button>
        </div>
      </div>

      {/* ── Kalendář karta ── */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e4dc', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>

        {/* Navigace měsíce */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={goPrev}
              style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e8e4dc', background: '#fff', fontSize: 17, cursor: 'pointer', color: '#555', lineHeight: 1 }}
            >‹</button>
            <div style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 500, color: '#111', minWidth: 180, textAlign: 'center' }}>
              {MESICE[currentMonth]} {currentYear}
            </div>
            <button
              onClick={goNext}
              style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e8e4dc', background: '#fff', fontSize: 17, cursor: 'pointer', color: '#555', lineHeight: 1 }}
            >›</button>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#8a8680', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#b7e94c', display: 'inline-block' }} />
              {scheduledThisMonth} naplánováno
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f0efeb', border: '1px solid #e8e4dc', display: 'inline-block' }} />
              Volné sloty
            </div>
          </div>
        </div>

        {/* Hlavičky dní */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 5, fontWeight: 600 }}>
          {DNY.map(d => <div key={d} style={{ textAlign: 'center', padding: '3px 0' }}>{d}</div>)}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
          {cells.map((cell, ci) => {
            const post = findPost(cell.dayNum, cell.month, cell.year)
            return (
              <div
                key={ci}
                onClick={() => {
                  if (post) openEdit(post)
                  else if (cell.inCurrent) setAddModal({ date: String(cell.dayNum), month: currentMonth, year: currentYear })
                }}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #e8e4dc',
                  background: post ? 'transparent' : '#f5f2ec',
                  position: 'relative',
                  cursor: post || cell.inCurrent ? 'pointer' : 'default',
                  opacity: !cell.inCurrent ? 0.3 : 1,
                  transition: 'transform .1s',
                }}
                onMouseEnter={e => { if (post || cell.inCurrent) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
              >
                {post ? (
                  <>
                    {post.img && (
                      <img src={post.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.15))' }} />
                    <div style={{ position: 'absolute', top: 5, left: 6, color: '#fff', fontSize: 12, fontWeight: 600 }}>{cell.dayNum}</div>
                    <div style={{ position: 'absolute', top: 5, right: 5, background: '#b7e94c', color: '#1a2a00', fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '.03em' }}>{post.type}</div>
                    <div style={{ position: 'absolute', bottom: 5, left: 5, right: 5 }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', marginBottom: 1 }}>{post.time}</div>
                      <div style={{ fontSize: 10, color: '#fff', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as never, overflow: 'hidden' }}>{post.hook}</div>
                    </div>
                  </>
                ) : (
                  <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 12, color: '#888', fontWeight: 500 }}>{cell.dayNum}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editModal && (
        <div
          onClick={() => setEditModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: 480, overflow: 'hidden' }}
          >
            {/* Obrázek */}
            {editModal.img && (
              <div style={{ height: 180, backgroundImage: `url(${editModal.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}

            <div style={{ padding: 20 }}>
              {/* Type badge + close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ background: '#b7e94c', color: '#1a2a00', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>{editModal.type}</span>
                <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888', lineHeight: 1, padding: '2px 6px' }}>×</button>
              </div>

              {/* Hook */}
              <div style={{ fontSize: 16, fontWeight: 500, color: '#111', lineHeight: 1.35, marginBottom: 16 }}>
                {editModal.hook}
              </div>

              {/* Datum + čas */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #e8e4dc', borderRadius: 8, background: '#faf8f3', fontSize: 13, color: '#111', fontFamily: 'inherit' }}
                />
                <input
                  type="time"
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #e8e4dc', borderRadius: 8, background: '#faf8f3', fontSize: 13, color: '#111', fontFamily: 'inherit' }}
                />
              </div>

              {/* Akce */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    const updated = scheduled.filter(
                      s => !(s.date === editModal.date && s.month === editModal.month && s.year === editModal.year)
                    )
                    saveSchedule(updated)
                    setEditModal(null)
                  }}
                  style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1px solid #e8e4dc', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#e05a5a' }}
                >
                  Odstranit
                </button>
                <button
                  onClick={() => {
                    const parsed = editDate ? new Date(editDate) : null
                    const updated = scheduled.map(s => {
                      if (s.date === editModal.date && s.month === editModal.month && s.year === editModal.year) {
                        return {
                          ...s,
                          date: parsed ? String(parsed.getDate()) : s.date,
                          month: parsed ? parsed.getMonth() : s.month,
                          year: parsed ? parsed.getFullYear() : s.year,
                          time: editTime || s.time,
                        }
                      }
                      return s
                    })
                    saveSchedule(updated)
                    setEditModal(null)
                  }}
                  style={{ flex: 2, padding: '11px', borderRadius: 9, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Uložit změny
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Modal ── */}
      {addModal && (
        <div
          onClick={() => setAddModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: 440, padding: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ ...eyebrow, marginBottom: 4 }}>Nový příspěvek</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: '#111', margin: 0 }}>
                  Přidat příspěvek — {addModal.date}. {MESICE[addModal.month]}
                </h3>
              </div>
              <button onClick={() => setAddModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888', padding: '2px 6px', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ fontSize: 13, color: '#8a8680', marginBottom: 20, lineHeight: 1.5 }}>
              Vyber příspěvek ze schválených nebo vytvoř nový.
            </div>

            <button
              onClick={() => router.push(`/client/${projectCode}/prispevky?token=${token}&plan=${addModal.date}-${addModal.month}-${addModal.year}`)}
              style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}
            >
              Vybrat ze schválených →
            </button>
            <button
              onClick={() => setAddModal(null)}
              style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid #e8e4dc', background: '#fff', color: '#555', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function PlanovacPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f5f2ec' }} />}>
      <PlanovacInner />
    </Suspense>
  )
}
