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
  const [addModal, setAddModal] = useState<{ date: string } | null>(null)
  const [addType, setAddType] = useState('Reel')
  const [addTime, setAddTime] = useState('09:00')

  useEffect(() => {
    if (!projectCode) return
    ;(async () => {
      try {
        const r = await fetch(
          `/api/client/project?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`
        )
        const d = await r.json()
        const sr = d.project?.scan_result as Record<string, unknown> | undefined
        const sp = (sr?.scheduledPosts as ScheduledPost[] | undefined) ?? []
        setScheduled(sp)
      } catch {
        // fetch failed — empty state
      } finally {
        setLoading(false)
      }
    })()
  }, [projectCode, token])

  const saveSchedule = async (newScheduled: ScheduledPost[]) => {
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

  // ── Kalendář: generuj 42 buněk ──────────────────────────────────────────────
  const firstWeekday = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7 // Po=0
  const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate()
  const prevDays     = new Date(currentYear, currentMonth, 0).getDate()

  const prevM = currentMonth === 0  ? 11 : currentMonth - 1
  const prevY = currentMonth === 0  ? currentYear - 1 : currentYear
  const nextM = currentMonth === 11 ?  0 : currentMonth + 1
  const nextY = currentMonth === 11 ? currentYear + 1 : currentYear

  type Cell = { day: string; month: number; year: number; inCurrent: boolean }
  const cells: Cell[] = []

  for (let i = firstWeekday - 1; i >= 0; i--)
    cells.push({ day: String(prevDays - i), month: prevM, year: prevY, inCurrent: false })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: String(d), month: currentMonth, year: currentYear, inCurrent: true })
  let nd = 1
  while (cells.length < 42)
    cells.push({ day: String(nd++), month: nextM, year: nextY, inCurrent: false })

  const findPost = (day: string, month: number, year: number) =>
    scheduled.find(s => s.date === day && s.month === month && s.year === year) ?? null

  // ── Navigace měsíce ─────────────────────────────────────────────────────────
  const goPrev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const goNext = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const openEdit = (post: ScheduledPost) => {
    setEditModal(post)
    setEditDate(`${post.year}-${String(post.month + 1).padStart(2, '0')}-${String(post.date).padStart(2, '0')}`)
    setEditTime(post.time)
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

  const eyebrowStyle = {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase' as const, color: '#8a8680',
  }

  return (
    <div style={{ padding: '28px 24px 80px', maxWidth: 1280, margin: '0 auto', background: '#f5f2ec', minHeight: '100vh' }}>

      {/* ── Hlavička ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 22 }}>
        <div>
          <div style={{ ...eyebrowStyle, marginBottom: 6 }}>Plánovač</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 500, color: '#111', margin: '0 0 6px', lineHeight: 1.1 }}>
            Kalendář obsahu
          </h1>
          <div style={{ fontSize: 13, color: '#8a8680', lineHeight: 1.5 }}>
            Klikni na den s obrázkem pro úpravu, nebo na prázdný slot pro přidání postu.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
          <button style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid #e8e4dc', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#333', display: 'flex', alignItems: 'center', gap: 5 }}>
            ⬇ Export .ics
          </button>
          <button
            onClick={() => router.push(`/client/${projectCode}/prispevky?token=${token}`)}
            style={{ padding: '8px 14px', borderRadius: 9, border: 'none', background: '#111', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            + Nový příspěvek
          </button>
        </div>
      </div>

      {/* ── Kalendář karta ── */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e4dc', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>

        {/* Navigace měsíce */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={goPrev}
              style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e8e4dc', background: '#fff', fontSize: 17, cursor: 'pointer', lineHeight: 1, color: '#555' }}
            >‹</button>
            <div style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 500, color: '#111', minWidth: 220, textAlign: 'center' }}>
              {MESICE[currentMonth]} {currentYear}
            </div>
            <button
              onClick={goNext}
              style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e8e4dc', background: '#fff', fontSize: 17, cursor: 'pointer', lineHeight: 1, color: '#555' }}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 6, fontWeight: 600 }}>
          {DNY.map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Grid buněk */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {cells.map((cell, ci) => {
            const post = findPost(cell.day, cell.month, cell.year)
            const clickable = !!(post || cell.inCurrent)
            return (
              <div
                key={ci}
                onClick={() => {
                  if (post) openEdit(post)
                  else if (cell.inCurrent) { setAddModal({ date: cell.day }); setAddType('Reel'); setAddTime('09:00') }
                }}
                style={{
                  aspectRatio: '1',
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid #e8e4dc',
                  background: post ? 'transparent' : '#f0efeb',
                  position: 'relative',
                  cursor: clickable ? 'pointer' : 'default',
                  opacity: !cell.inCurrent ? 0.45 : 1,
                  transition: 'transform .12s',
                }}
                onMouseEnter={e => { if (clickable) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
              >
                {post ? (
                  <>
                    {/* Obrázek */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: post.img ? `url(${post.img})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      backgroundColor: '#1a0a2e',
                    }} />
                    {/* Gradient */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,.45) 0%, transparent 38%, transparent 52%, rgba(0,0,0,.65) 100%)',
                    }} />
                    {/* Datum */}
                    <div style={{ position: 'absolute', top: 6, left: 8, color: '#fff', fontSize: 13, fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,.6)' }}>
                      {cell.day}
                    </div>
                    {/* Type badge */}
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      background: '#b7e94c', color: '#1a2a00',
                      fontSize: 8, fontWeight: 700, letterSpacing: '.04em',
                      padding: '2px 5px', borderRadius: 4, textTransform: 'uppercase',
                    }}>{post.type}</div>
                    {/* Čas + hook */}
                    <div style={{ position: 'absolute', bottom: 6, left: 8, right: 8, color: '#fff' }}>
                      <div style={{ fontSize: 9.5, opacity: .85 }}>{post.time}</div>
                      <div style={{
                        fontSize: 10, lineHeight: 1.25, marginTop: 1,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as never, overflow: 'hidden',
                      }}>{post.hook}</div>
                    </div>
                  </>
                ) : (
                  <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 13, color: '#888', fontWeight: 500 }}>
                    {cell.day}
                  </div>
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: 520, maxHeight: '85vh', overflowY: 'auto', padding: 24 }}
          >
            {/* Hlavička */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ ...eyebrowStyle, marginBottom: 4 }}>Upravit plán</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: '#111', margin: 0 }}>
                  {editModal.date}. {MESICE[editModal.month]} {editModal.year}
                </h3>
              </div>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888', padding: '4px 8px', lineHeight: 1 }}>×</button>
            </div>

            {/* Obrázek */}
            {editModal.img && (
              <div style={{
                width: '100%', height: 200,
                backgroundImage: `url(${editModal.img})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                borderRadius: 10, marginBottom: 14,
              }} />
            )}

            {/* Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{ border: '1px solid #e8e4dc', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#555' }}>{editModal.type}</span>
              <span style={{ border: '1px solid #e8e4dc', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#555' }}>{editModal.time}</span>
            </div>

            {/* Hook */}
            <div style={{ fontSize: 15, fontFamily: "'Playfair Display', serif", lineHeight: 1.35, color: '#111', marginBottom: 18 }}>
              „{editModal.hook}"
            </div>

            {/* Datum + čas inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: '#8a8680' }}>
                Datum
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #e8e4dc', borderRadius: 8, background: '#faf8f3', fontSize: 13, color: '#111', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </label>
              <label style={{ fontSize: 11, color: '#8a8680' }}>
                Čas
                <input
                  type="time"
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #e8e4dc', borderRadius: 8, background: '#faf8f3', fontSize: 13, color: '#111', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </label>
            </div>

            {/* Akce */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, paddingTop: 14, borderTop: '1px solid #f0ece4' }}>
              <button
                onClick={() => {
                  const updated = scheduled.filter(
                    s => !(s.date === editModal.date && s.month === editModal.month && s.year === editModal.year)
                  )
                  setScheduled(updated)
                  saveSchedule(updated)
                  setEditModal(null)
                }}
                style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid #e8e4dc', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#e05a5a' }}
              >
                Odstranit
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setEditModal(null)}
                  style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid #e8e4dc', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}
                >
                  Zrušit
                </button>
                <button
                  onClick={() => {
                    const updated = scheduled.map(s => {
                      if (s.date === editModal.date && s.month === editModal.month && s.year === editModal.year) {
                        const parsed = editDate ? new Date(editDate) : null
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
                    setScheduled(updated)
                    saveSchedule(updated)
                    setEditModal(null)
                  }}
                  style={{ padding: '10px 18px', borderRadius: 9, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: 460, padding: 24 }}
          >
            {/* Hlavička */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ ...eyebrowStyle, marginBottom: 4 }}>Nový příspěvek</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: '#111', margin: 0 }}>
                  {addModal.date}. {MESICE[currentMonth]}
                </h3>
              </div>
              <button onClick={() => setAddModal(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888', padding: '4px 8px', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ fontSize: 12, color: '#8a8680', marginBottom: 14 }}>
              Naplánuj nový post — vyber typ a čas.
            </div>

            {/* Typ výběr */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {['Reel', 'Carousel', 'Post', 'Story'].map(t => (
                <button
                  key={t}
                  onClick={() => setAddType(t)}
                  style={{
                    padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                    border: addType === t ? 'none' : '1px solid #e8e4dc',
                    background: addType === t ? '#111' : '#fff',
                    color: addType === t ? '#fff' : '#333',
                    transition: 'all .12s',
                  }}
                >{t}</button>
              ))}
            </div>

            {/* Čas */}
            <label style={{ fontSize: 11, color: '#8a8680', display: 'block', marginBottom: 16 }}>
              Čas
              <input
                type="time"
                value={addTime}
                onChange={e => setAddTime(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #e8e4dc', borderRadius: 8, background: '#faf8f3', fontSize: 13, color: '#111', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </label>

            {/* Akce */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 14, borderTop: '1px solid #f0ece4' }}>
              <button
                onClick={() => setAddModal(null)}
                style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid #e8e4dc', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}
              >
                Zrušit
              </button>
              <button
                onClick={() => {
                  router.push(
                    `/client/${projectCode}/prispevky?token=${token}` +
                    `&scheduleDate=${addModal.date}&scheduleMonth=${currentMonth}` +
                    `&scheduleYear=${currentYear}&scheduleType=${addType}&scheduleTime=${encodeURIComponent(addTime)}`
                  )
                }}
                style={{ padding: '10px 18px', borderRadius: 9, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Pokračovat →
              </button>
            </div>
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
