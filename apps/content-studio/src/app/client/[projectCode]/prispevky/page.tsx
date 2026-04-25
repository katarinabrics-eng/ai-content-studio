'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

// ─── Types ─────────────────────────────────────────────────────────────────────

type RawPost = {
  type?: string
  label?: string
  hook?: string
  title?: string
  body?: string
  caption?: string
  style?: string
  duration?: string
  platform?: string
  variant?: string
}

type Post = {
  idx: number
  type: string        // 'video' | 'grafika' | ...
  label: string       // display label
  aspect: string      // '9:16' | '1:1'
  hook: string
  body: string
  img: string
  duration?: string
}

type Status = 'pending' | 'approved' | 'rejected'

// ─── Inner component ──────────────────────────────────────────────────────────

function PrispevkyInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectCode = params.projectCode as string
  const token = searchParams.get('token') ?? ''

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [statuses, setStatuses] = useState<Record<number, Status>>({})
  const [editing, setEditing] = useState(false)
  const [drafts, setDrafts] = useState<Record<number, { hook: string; body: string }>>({})

  useEffect(() => {
    if (!projectCode) return
    ;(async () => {
      try {
        const r = await fetch(
          `/api/client/project?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`
        )
        const d = await r.json()
        if (!d.project?.scan_result) { setLoading(false); return }

        const sr = d.project.scan_result as Record<string, unknown>

        // scrapedImages — filter logo URLs
        const rawImgs = (sr.scrapedImages as string[] | undefined) ?? []
        const imgs = rawImgs.filter(
          (u) => !u.toLowerCase().includes('logo') && !u.toLowerCase().includes('lucifera-logo')
        )

        // generatedPosts
        const gp = (sr.generatedPosts as RawPost[] | undefined) ?? []

        const mapped: Post[] = gp.map((p, i) => {
          const isVideo = (p.type ?? '').toLowerCase() === 'video'
          return {
            idx: i,
            type: p.type ?? 'grafika',
            label: p.label ?? (isVideo ? 'VIDEO · REELS' : 'GRAFIKA'),
            aspect: isVideo ? '9:16' : '1:1',
            hook: p.hook ?? p.title ?? '',
            body: p.body ?? p.caption ?? p.style ?? '',
            img: imgs.length > 0 ? imgs[i % imgs.length] : '',
            duration: p.duration,
          }
        })

        setPosts(mapped)
        setStatuses(Object.fromEntries(mapped.map((_, i) => [i, 'pending' as Status])))
        setDrafts(Object.fromEntries(mapped.map((p, i) => [i, { hook: p.hook, body: p.body }])))
      } catch {
        // fetch failed — empty state
      } finally {
        setLoading(false)
      }
    })()
  }, [projectCode, token])

  const setStatus = (idx: number, s: Status) => {
    setStatuses(prev => ({ ...prev, [idx]: s }))
    setEditing(false)
  }

  const pendingCount  = Object.values(statuses).filter(s => s === 'pending').length
  const approvedCount = Object.values(statuses).filter(s => s === 'approved').length

  const sel = posts[selectedIdx]
  const selStatus = statuses[selectedIdx] ?? 'pending'
  const selDraft = drafts[selectedIdx] ?? { hook: '', body: '' }

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

  // ── Empty state ──
  if (posts.length === 0) {
    return (
      <div style={{ padding: '40px 32px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 8 }}>
          Příspěvky · ochutnávka
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 500, color: '#111', margin: '0 0 8px' }}>
          Schval svůj obsah
        </h1>
        <div style={{ fontSize: 13, color: '#8a8680', marginTop: 16, lineHeight: 1.6 }}>
          Po dokončení diagnostiky zde uvidíš příspěvky navržené pro tvou značku.
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 28px 80px', maxWidth: 1280, margin: '0 auto', background: '#f5f2ec', minHeight: '100vh' }}>

      {/* ── Hlavička ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 8 }}>
            Příspěvky · ochutnávka
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 500, color: '#111', margin: '0 0 8px', lineHeight: 1.1 }}>
            Schval svůj obsah
          </h1>
          <div style={{ fontSize: 13, color: '#8a8680' }}>
            Zkontroluj příspěvky navržené pro tvou značku.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: '#ffffff', border: '1px solid #e8e4dc', color: '#555',
          }}>
            {pendingCount} čeká
          </span>
          <span style={{
            padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: '#f0fce0', border: '1px solid #c6e88a', color: '#3d6b00',
          }}>
            {approvedCount} schváleno
          </span>
        </div>
      </div>

      {/* ── Hlavný grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>

        {/* LEFT — detail */}
        {sel && (
          <div style={{
            background: '#ffffff', border: '1px solid #e8e4dc',
            borderRadius: 16, padding: 22,
            boxShadow: '0 1px 3px rgba(0,0,0,.07)',
            position: 'sticky', top: 88, alignSelf: 'start',
          }}>

            {/* Obrázok */}
            <div style={{
              aspectRatio: sel.aspect === '9:16' ? '9/14' : '1/1',
              borderRadius: 12, overflow: 'hidden',
              backgroundImage: sel.img ? `url(${sel.img})` : 'none',
              backgroundSize: 'cover', backgroundPosition: 'center',
              background: sel.img ? undefined : '#f0efeb',
              marginBottom: 18,
              border: '1px solid #e8e4dc',
            }}>
              {sel.duration && (
                <div style={{
                  margin: 10, float: 'right',
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(17,17,17,.7)', color: '#fff',
                  fontSize: 10, fontWeight: 600,
                }}>
                  ▶ {sel.duration}
                </div>
              )}
            </div>

            {/* Hook */}
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 6 }}>
              Hook
            </div>
            {editing ? (
              <textarea
                value={selDraft.hook}
                onChange={e => setDrafts(prev => ({ ...prev, [selectedIdx]: { ...selDraft, hook: e.target.value } }))}
                style={{
                  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                  border: '1px solid #e8e4dc', borderRadius: 8,
                  fontSize: 14, fontFamily: 'inherit', fontWeight: 600,
                  minHeight: 60, resize: 'vertical', background: '#faf8f3',
                  color: '#111', outline: 'none',
                }}
              />
            ) : (
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 14, lineHeight: 1.35 }}>
                {selDraft.hook || '—'}
              </div>
            )}

            {/* Caption */}
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8680', marginTop: 14, marginBottom: 6 }}>
              Caption
            </div>
            {editing ? (
              <textarea
                value={selDraft.body}
                onChange={e => setDrafts(prev => ({ ...prev, [selectedIdx]: { ...selDraft, body: e.target.value } }))}
                style={{
                  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                  border: '1px solid #e8e4dc', borderRadius: 8,
                  fontSize: 12.5, fontFamily: 'inherit',
                  minHeight: 90, resize: 'vertical', background: '#faf8f3',
                  color: '#555', outline: 'none',
                }}
              />
            ) : (
              <div style={{ fontSize: 12.5, color: '#555', lineHeight: 1.6, marginBottom: 4 }}>
                {selDraft.body || '—'}
              </div>
            )}

            {/* Edit toggle */}
            <button
              onClick={() => setEditing(e => !e)}
              style={{
                fontSize: 11, color: '#8a8680', marginTop: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, padding: 0,
              }}
            >
              ✎ {editing ? 'Hotovo' : 'Upravit text'}
            </button>

            {/* Akčné tlačidlá */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setStatus(selectedIdx, 'rejected')}
                style={{
                  flex: 1, padding: '11px 12px', borderRadius: 10,
                  border: '1.5px solid #e8e4dc', background: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  color: '#555',
                }}
              >
                Odmítnout
              </button>
              <button
                onClick={() => setStatus(selectedIdx, 'approved')}
                style={{
                  flex: 2, padding: '11px 12px', borderRadius: 10,
                  border: 'none',
                  background: selStatus === 'approved' ? '#b7e94c' : '#111',
                  color: selStatus === 'approved' ? '#111' : '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {selStatus === 'approved' ? 'Schváleno ✓' : 'Schválit ✓'}
              </button>
            </div>

          </div>
        )}

        {/* RIGHT — zoznam náhľadov (1 stĺpec) */}
        <div style={{
          background: '#ffffff', border: '1px solid #e8e4dc',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,.07)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 1, background: '#e8e4dc' }}>
            {posts.map((post, i) => {
              const isSel = selectedIdx === i
              const status = statuses[i] ?? 'pending'
              const isVideo = post.type.toLowerCase() === 'video'
              return (
                <div
                  key={i}
                  onClick={() => { setSelectedIdx(i); setEditing(false) }}
                  style={{
                    background: '#ffffff',
                    cursor: 'pointer',
                    position: 'relative',
                    outline: isSel ? '2px solid #b7e94c' : 'none',
                    outlineOffset: '-2px',
                  }}
                >
                  {/* Thumbnail — full width */}
                  <div style={{
                    width: '100%',
                    height: isVideo ? 120 : 80,
                    backgroundImage: post.img ? `url(${post.img})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: post.img ? undefined : '#f0efeb',
                    borderRadius: 8,
                    position: 'relative',
                  }}>
                    {/* Type badge */}
                    <span style={{
                      position: 'absolute', top: 6, left: 6,
                      fontSize: 8.5, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
                      background: isVideo ? '#111' : '#b7e94c',
                      color: isVideo ? '#fff' : '#111',
                      letterSpacing: '.04em', textTransform: 'uppercase' as const,
                    }}>{post.label}</span>
                    {/* Status ikonka */}
                    {status !== 'pending' && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 18, height: 18, borderRadius: 50,
                        background: status === 'approved' ? '#b7e94c' : 'rgba(255,255,255,.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                        color: status === 'approved' ? '#111' : '#888',
                      }}>
                        {status === 'approved' ? '✓' : '×'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function PrispevkyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f5f2ec' }} />}>
      <PrispevkyInner />
    </Suspense>
  )
}
