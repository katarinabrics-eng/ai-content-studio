'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

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

type Status = 'pending' | 'approved' | 'rejected' | 'published' | 'downloaded'

type ScheduledPost = { postIdx: number; hook: string; img: string; type: string; date: string; month: number; year: number; time: string }

// ─── Inner component ──────────────────────────────────────────────────────────

function PrispevkyInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectCode = params.projectCode as string
  const token = searchParams.get('token') ?? ''

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [statuses, setStatuses] = useState<Record<number, Status>>({})
  const [editing, setEditing] = useState(false)
  const [drafts, setDrafts] = useState<Record<number, { hook: string; body: string }>>({})
  // UI-only states
  const [showKampan, setShowKampan] = useState(false)
  const [visualSource, setVisualSource] = useState<'web' | 'drive' | 'ai'>('web')
  const [showPreview, setShowPreview] = useState(false)
  const [planModal, setPlanModal] = useState<number | null>(null)
  const [planDate, setPlanDate] = useState('')
  const [planTime, setPlanTime] = useState('09:00')
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])


  useEffect(() => {
    if (!projectCode) return
    ;(async () => {
      try {
        const r = await fetch(
          `/api/client/project?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}&_=${Date.now()}`,
          { cache: 'no-store' }
        )
        const d = await r.json()
        if (!d.project?.scan_result) { setLoading(false); return }

        const sr = d.project.scan_result as Record<string, unknown>

        // scrapedImages — filter logo URLs
        const rawImgs = (sr.scrapedImages as string[] | undefined) ?? []
        const imgs = rawImgs.filter(
          (u) => {
            const lower = u.toLowerCase()
            return !lower.includes('logo') &&
                   !lower.includes('lucifera-logo') &&
                   !lower.endsWith('.png') &&
                   !lower.endsWith('.svg') &&
                   !lower.includes('icon') &&
                   !lower.includes('badge') &&
                   !lower.includes('watermark')
          }
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
        // Načti uložené statusy z DB (postStatuses v raw_analysis)
        const savedStatuses = (sr.postStatuses as Record<string, string>) ?? {}
        const initialStatuses: Record<number, Status> = {}
        const savedScheduled = (sr.scheduledPosts as unknown[]) ?? []
        setScheduledPosts(savedScheduled as ScheduledPost[])
        savedScheduled.forEach((sp: unknown) => {
          const s = sp as ScheduledPost
          if (s.postIdx !== undefined && s.postIdx >= 0) {
            initialStatuses[s.postIdx] = 'published'
          }
        })
        Object.entries(savedStatuses).forEach(([k, v]) => {
          const idx = Number(k)
          if (idx >= 0) initialStatuses[idx] = v as Status
        })
        const savedDrafts = (sr.postDrafts as Record<string, { hook: string; body: string }>) ?? {}
        const initialDrafts: Record<number, { hook: string; body: string }> = {}
        mapped.forEach((p, i) => {
          initialDrafts[i] = savedDrafts[String(i)] ?? { hook: p.hook, body: p.body }
        })
        setDrafts(initialDrafts)
        console.log('FINAL STATUSES:', initialStatuses)
        console.log('DB postStatuses:', savedStatuses)
        console.log('Scheduled:', savedScheduled)
        setStatuses(initialStatuses)
      } catch {
        // fetch failed — empty state
      } finally {
        setLoading(false)
      }
    })()
  }, [projectCode, token])

  const saveDraft = async (idx: number) => {
    console.log('SAVE DRAFT CALLED:', { projectCode, token, idx, draft: drafts[idx] })
    const draft = drafts[idx]
    if (!draft) return
    await fetch('/api/client/post-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectCode,
        token,
        postIndex: idx,
        status: statuses[idx] ?? 'pending',
        hook: draft.hook,
        body: draft.body,
      }),
    })
  }

  const setStatus = async (idx: number, s: Status) => {
    console.log('SET STATUS CALLED:', { idx, s, projectCode, token: token?.slice(0,8) })
    setStatuses(prev => ({ ...prev, [idx]: s }))
    setEditing(false)
    const result = await fetch('/api/client/post-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectCode, token, postIndex: idx, status: s }),
    })
    const resultJson = await result.json()
    console.log('SET STATUS RESPONSE:', resultJson)
  }

  const handleDownload = async (idx: number) => {
    const post = posts[idx]
    const draft = drafts[idx]
    const img = post.img ?? ''

    // Stáhni text
    const text = `HOOK:\n${draft?.hook ?? post.hook ?? ''}\n\nCAPTION:\n${draft?.body ?? post.body ?? ''}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prispevek-${idx + 1}.txt`
    a.click()
    URL.revokeObjectURL(url)

    // Stáhni obrázek pokud existuje
    if (img) {
      try {
        const res = await fetch(img)
        const imgBlob = await res.blob()
        const imgUrl = URL.createObjectURL(imgBlob)
        const b = document.createElement('a')
        b.href = imgUrl
        b.download = `prispevek-${idx + 1}.jpg`
        b.click()
        URL.revokeObjectURL(imgUrl)
      } catch {}
    }

    setStatus(idx, 'downloaded')
  }

  const handleDuplicate = (idx: number) => {
    const post = posts[idx]
    const draft = drafts[idx]
    const newPost = { ...post, hook: draft?.hook ?? post.hook, body: draft?.body ?? post.body }
    setPosts(prev => [...prev, newPost])
    const newIdx = posts.length
    setDrafts(prev => ({ ...prev, [newIdx]: { hook: newPost.hook ?? '', body: newPost.body ?? '' } }))
    setStatuses(prev => ({ ...prev, [newIdx]: 'pending' }))
    setSelectedIdx(newIdx)
  }

  const pendingCount  = posts.filter((_, i) => !statuses[i] || statuses[i] === 'pending').length
  const approvedCount = posts.filter((_, i) => statuses[i] === 'approved').length

  const sel = posts[selectedIdx]
  const selStatus = statuses[selectedIdx] ?? 'pending'
  const selDraft = drafts[selectedIdx] ?? { hook: '', body: '' }
  const isSelVideo = sel?.type?.toLowerCase() === 'video'

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

  // ── Helpers ──
  const eyebrowStyle = {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase' as const, color: '#8a8680',
  }
  const previewW = isSelVideo ? 160 : 200

  return (
    <div style={{ padding: '28px 24px 80px', maxWidth: 1280, margin: '0 auto', background: '#f5f2ec', minHeight: '100vh' }}>

      {/* ── Hlavička ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 22 }}>
        <div>
          <div style={{ ...eyebrowStyle, marginBottom: 6 }}>Příspěvky · ochutnávka</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 500, color: '#111', margin: 0, lineHeight: 1.1 }}>
            Schval svůj obsah
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
          <span style={{ padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#fff', border: '1px solid #e8e4dc', color: '#555' }}>
            {pendingCount} čeká
          </span>
          <span style={{ padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#f0fce0', border: '1px solid #b7e94c', color: '#3d6b00' }}>
            {approvedCount} schváleno
          </span>
          <div style={{ width: 1, height: 20, background: '#e8e4dc' }} />
          <button style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid #e8e4dc', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#333', display: 'flex', alignItems: 'center', gap: 5 }}>
            + Nový příspěvek
          </button>
          <button
            onClick={() => setShowKampan(true)}
            style={{ padding: '8px 14px', borderRadius: 9, border: 'none', background: '#111', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            ✦ Navrhnout kampaň
          </button>
        </div>
      </div>

      {/* ── Hlavný grid: 200px | 1fr ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12, alignItems: 'start' }}>

        {/* ── LEVÝ PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* A) Ke schválení — pending + rejected */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e4dc', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ padding: '9px 12px 7px', ...eyebrowStyle, borderBottom: '1px solid #f0ece4' }}>
              Ke schválení
            </div>
            <div style={{ padding: '6px 4px' }}>
              {posts.map((post, i) => {
                if (statuses[i] === 'approved' || statuses[i] === 'published' || statuses[i] === 'downloaded') return null
                const isSel = selectedIdx === i
                const isVideo = post.type.toLowerCase() === 'video'
                return (
                  <div
                    key={i}
                    onClick={() => { setSelectedIdx(i); setEditing(false) }}
                    style={{
                      display: 'flex', gap: 8, padding: '6px 8px', cursor: 'pointer',
                      borderRadius: 8, margin: '0 0 2px',
                      border: isSel ? '1.5px solid #b7e94c' : '1.5px solid transparent',
                      background: isSel ? '#f9fce8' : 'transparent',
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      width: isVideo ? 30 : 36,
                      height: isVideo ? 42 : 36,
                      borderRadius: 4, flexShrink: 0,
                      backgroundImage: post.img ? `url(${post.img})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      backgroundColor: '#2a1a3a',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        display: 'inline-block', marginBottom: 3,
                        fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 999,
                        background: isVideo ? '#111' : '#b7e94c',
                        color: isVideo ? '#fff' : '#111',
                        letterSpacing: '.04em', textTransform: 'uppercase',
                      }}>{post.label}</span>
                      <div style={{
                        fontSize: 11, fontWeight: 500, color: '#111', lineHeight: 1.3,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as never, overflow: 'hidden',
                      }}>
                        {drafts[i]?.hook || post.hook}
                      </div>
                    </div>
                    {statuses[i] === 'rejected' && (
                      <div style={{ position: 'absolute', top: 4, right: 6, fontSize: 10, color: '#aaa', fontWeight: 700 }}>×</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* B) Schváleno · připraveno — approved */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e4dc', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ padding: '9px 12px 7px', ...eyebrowStyle, borderBottom: '1px solid #f0ece4', color: '#3d6b00' }}>
              Schváleno · připraveno
            </div>
            {approvedCount === 0 ? (
              <div style={{ padding: '12px', fontSize: 11, color: '#b0aea8', textAlign: 'center' }}>
                Žádné schválené příspěvky
              </div>
            ) : (
              <div style={{ padding: '6px 4px' }}>
                {posts.map((post, i) => {
                  if (statuses[i] !== 'approved') return null
                  const isSel = selectedIdx === i
                  const isVideo = post.type.toLowerCase() === 'video'
                  return (
                    <div
                      key={i}
                      onClick={() => { setSelectedIdx(i); setEditing(false) }}
                      style={{
                        display: 'flex', gap: 8, padding: '6px 8px', cursor: 'pointer',
                        borderRadius: 8, margin: '0 0 2px',
                        border: isSel ? '1.5px solid #b7e94c' : '1.5px solid transparent',
                        background: isSel ? '#f9fce8' : 'transparent',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{
                        width: isVideo ? 30 : 36,
                        height: isVideo ? 42 : 36,
                        borderRadius: 4, flexShrink: 0,
                        backgroundImage: post.img ? `url(${post.img})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        backgroundColor: '#2a1a3a',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 500, color: '#111', lineHeight: 1.3,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {drafts[i]?.hook || post.hook}
                        </div>
                        <div style={{ fontSize: 9.5, color: '#3d6b00', fontWeight: 600 }}>Schváleno ✓</div>
                      </div>
                      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                        <button
                          onClick={e => { e.stopPropagation(); handleDownload(i) }}
                          title="Stáhnout"
                          style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #e8e4dc', background: '#f0ede8', fontSize: 16, lineHeight: '1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: '#111' }}
                        >⬇</button>
                        <button
                          onClick={e => { e.stopPropagation(); setPlanModal(i) }}
                          title="Naplánovat"
                          style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #e8e4dc', background: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >📅</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* C) Historie — published + downloaded */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e4dc', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ padding: '9px 12px 7px', ...eyebrowStyle, borderBottom: '1px solid #f0ece4' }}>
              Historie
            </div>
            {posts.every((_, i) => statuses[i] !== 'published' && statuses[i] !== 'downloaded') ? (
              <div style={{ padding: '14px 12px', fontSize: 11, color: '#b0aea8', textAlign: 'center' }}>—</div>
            ) : (
              <div style={{ padding: '6px 4px' }}>
                {posts.map((post, i) => {
                  if (statuses[i] !== 'published' && statuses[i] !== 'downloaded') return null
                  const isSel = selectedIdx === i
                  return (
                    <div
                      key={i}
                      onClick={() => { setSelectedIdx(i); setEditing(false) }}
                      style={{
                        display: 'flex', gap: 8, padding: '5px 8px', alignItems: 'center', cursor: 'pointer',
                        borderRadius: 8, margin: '0 0 2px', opacity: 0.75,
                        border: isSel ? '1.5px solid #e8e4dc' : '1.5px solid transparent',
                        background: isSel ? '#f9f8f5' : 'transparent',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 4, flexShrink: 0,
                        backgroundImage: post.img ? `url(${post.img})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        backgroundColor: '#f0efeb',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {drafts[i]?.hook || post.hook}
                        </div>
                        <div style={{ fontSize: 9, color: '#8a8680' }}>
                          <span style={{
                            display: 'inline-block', padding: '0 5px', borderRadius: 999,
                            background: statuses[i] === 'downloaded' ? '#f0efeb' : '#f0fce0',
                            color: statuses[i] === 'downloaded' ? '#555' : '#3d6b00',
                            fontSize: 8.5, fontWeight: 600,
                          }}>
                            {statuses[i] === 'downloaded' ? 'Staženo' :
                             statuses[i] === 'published' ? `Naplánováno · ${(() => {
                               const sp = scheduledPosts.find((s: ScheduledPost) => s.postIdx === i)
                               if (!sp) return ''
                               return `${sp.date}. ${sp.month + 1}. ${sp.year} ${sp.time}`
                             })()}` : 'Zveřejněno'}
                          </span>
                          {' · dnes'}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleDuplicate(i) }}
                        style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, border: '1px solid #e8e4dc', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', color: '#555', flexShrink: 0, whiteSpace: 'nowrap' }}
                      >
                        Duplikovat
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── HLAVNÍ OKNO ── */}
        {sel && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: 20,
            border: '1px solid #e8e4dc', boxShadow: '0 1px 3px rgba(0,0,0,.07)',
            display: 'flex', gap: 20,
          }}>

            {/* VLEVO — náhled */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>

              {/* Preview image — kliknutí otevře fullscreen náhled */}
              {isSelVideo ? (
                <div
                  onClick={() => setShowPreview(true)}
                  style={{
                    width: 160, height: 284, borderRadius: 12, overflow: 'hidden',
                    backgroundImage: sel.img ? `url(${sel.img})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: '#1a0a2e', position: 'relative', flexShrink: 0,
                    cursor: 'pointer',
                  }}>
                  <span style={{
                    position: 'absolute', top: 8, left: 8,
                    fontSize: 8.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                    background: 'rgba(17,17,17,.75)', color: '#fff',
                    letterSpacing: '.06em', textTransform: 'uppercase',
                  }}>REELS</span>
                  {sel.duration && (
                    <span style={{
                      position: 'absolute', top: 8, right: 8,
                      fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                      background: 'rgba(17,17,17,.7)', color: '#fff',
                    }}>▶ {sel.duration}</span>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
                  <div style={{
                    position: 'absolute', bottom: 8, left: 8, right: 8,
                    color: '#fff', fontSize: 11, fontWeight: 600, lineHeight: 1.3,
                  }}>{selDraft.hook}</div>
                  <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.45)', borderRadius: 4, padding: '2px 5px', fontSize: 11, color: '#fff' }}>⛶</div>
                </div>
              ) : (
                <div
                  onClick={() => setShowPreview(true)}
                  style={{
                    width: 200, height: 200, borderRadius: 12, overflow: 'hidden',
                    backgroundImage: sel.img ? `url(${sel.img})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: '#f0efeb', flexShrink: 0,
                    cursor: 'pointer', position: 'relative',
                  }}>
                  <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.4)', borderRadius: 4, padding: '2px 5px', fontSize: 11, color: '#fff' }}>⛶</div>
                </div>
              )}

              <div style={{ fontSize: 10, color: '#8a8680', fontWeight: 500 }}>
                {isSelVideo ? '9 : 16 · Reels' : '1 : 1 · Grafika'}
              </div>

              {/* Zdroj vizuálu */}
              <div style={{
                width: previewW, border: '1px solid #e8e4dc', borderRadius: 8,
                padding: 10, background: '#faf8f3',
              }}>
                <div style={{ ...eyebrowStyle, textAlign: 'center', marginBottom: 8 }}>Zdroj vizuálu</div>
                {(['web', 'drive', 'ai'] as const).map(src => (
                  <label key={src} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#555', marginBottom: 5, cursor: 'pointer' }}>
                    <input
                      type="radio" name="visualSource" value={src}
                      checked={visualSource === src}
                      onChange={() => setVisualSource(src)}
                      style={{ accentColor: '#b7e94c' }}
                    />
                    {src === 'web' ? 'Z webu klienta' : src === 'drive' ? 'Z Drive knihovny' : 'AI generovaný'}
                  </label>
                ))}
                <button style={{
                  width: '100%', marginTop: 7, padding: '7px 0', borderRadius: 6,
                  border: 'none', background: '#b7e94c', color: '#1a2a00',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  ✦ Změnit vizuál
                </button>
              </div>
            </div>

            {/* VPRAVO — text a akce */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

              {/* Hook */}
              <div>
                <div style={{ ...eyebrowStyle, marginBottom: 6 }}>Hook</div>
                {editing ? (
                  <textarea
                    value={selDraft.hook}
                    onChange={e => setDrafts(prev => ({ ...prev, [selectedIdx]: { ...selDraft, hook: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', border: '1px solid #e8e4dc', borderRadius: 8, fontSize: 15, fontFamily: 'inherit', fontWeight: 500, minHeight: 64, resize: 'vertical', background: '#faf8f3', color: '#111', outline: 'none' }}
                  />
                ) : (
                  <div style={{ fontSize: 17, fontWeight: 500, color: '#111', lineHeight: 1.35 }}>
                    {selDraft.hook || '—'}
                  </div>
                )}
              </div>

              {/* Caption */}
              <div>
                <div style={{ ...eyebrowStyle, marginBottom: 6 }}>Caption</div>
                {editing ? (
                  <textarea
                    value={selDraft.body}
                    onChange={e => setDrafts(prev => ({ ...prev, [selectedIdx]: { ...selDraft, body: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', border: '1px solid #e8e4dc', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', minHeight: 90, resize: 'vertical', background: '#faf8f3', color: '#555', outline: 'none' }}
                  />
                ) : (
                  <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                    {selDraft.body || '—'}
                  </div>
                )}
              </div>

              {/* Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ border: '1px solid #e8e4dc', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#555' }}>Instagram</span>
                <span style={{ border: '1px solid #e8e4dc', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#555' }}>Varianta A</span>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={async () => { if (editing) await saveDraft(selectedIdx); setEditing(e => !e) }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e8e4dc', background: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}>
                  ✎ {editing ? 'Hotovo' : 'Upravit text'}
                </button>
                <button onClick={() => setPlanModal(selectedIdx)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e8e4dc', background: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}>
                  📅 Naplánovat
                </button>
              </div>

              {/* ── Podmíněná spodní tlačítka ── */}

              {/* pending / rejected → Odmítnout + Schválit */}
              {(selStatus === 'pending' || selStatus === 'rejected') && (
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                  <button
                    onClick={() => setStatus(selectedIdx, 'rejected')}
                    style={{ flex: 1, padding: '11px 12px', borderRadius: 10, border: '1.5px solid #e8e4dc', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}
                  >
                    Odmítnout
                  </button>
                  <button
                    onClick={() => setStatus(selectedIdx, 'approved')}
                    style={{ flex: 2, padding: '11px 12px', borderRadius: 10, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Schválit ✓
                  </button>
                </div>
              )}

              {/* approved → Odmítnout (vrátit) + Stáhnout + Naplánovat */}
              {selStatus === 'approved' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                  <button
                    onClick={() => setStatus(selectedIdx, 'pending')}
                    style={{ flex: 1, padding: '11px 12px', borderRadius: 10, border: '1.5px solid #e8e4dc', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}
                  >
                    Odmítnout
                  </button>
                  <button
                    onClick={() => handleDownload(selectedIdx)}
                    style={{ flex: 1, padding: '11px 12px', borderRadius: 10, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    ⬇ Stáhnout
                  </button>
                  <button
                    onClick={() => setPlanModal(selectedIdx)}
                    style={{ flex: 1, padding: '11px 12px', borderRadius: 10, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    📅 Naplánovat
                  </button>
                </div>
              )}

              {/* downloaded / published → Duplikovat */}
              {(selStatus === 'downloaded' || selStatus === 'published') && (
                <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#8a8680', marginBottom: 8, textAlign: 'center' }}>
                    Příspěvek byl použit · dnes
                  </div>
                  <button
                    onClick={() => handleDuplicate(selectedIdx)}
                    style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1.5px solid #e8e4dc', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#333' }}
                  >
                    Duplikovat příspěvek
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Fullscreen náhled ── */}
      {showPreview && sel && (
        <div
          onClick={() => setShowPreview(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            {/* Zavřít */}
            <button
              onClick={() => setShowPreview(false)}
              style={{ position: 'absolute', top: -48, right: 0, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
            >×</button>

            {/* Video / Reels */}
            {isSelVideo && (
              <div style={{ position: 'relative', height: 'min(82vh, 560px)', aspectRatio: '9/16', borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
                {sel.img
                  ? <img src={sel.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', background: '#1a0a2e' }} />
                }
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)' }} />
                {/* Play button */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', paddingLeft: 4 }}>▶</div>
                </div>
                {sel.duration && (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>▶ {sel.duration}</span>
                )}
                <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>
                  {selDraft.hook}
                </div>
              </div>
            )}

            {/* Carousel */}
            {!isSelVideo && sel.type.toLowerCase() === 'carousel' && (
              <div style={{ position: 'relative', width: 'min(82vh, 540px)', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
                {sel.img
                  ? <img src={sel.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', background: '#f0efeb' }} />
                }
                {/* Slide dots */}
                <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                  <div style={{ width: 20, height: 4, borderRadius: 2, background: '#fff' }} />
                  <div style={{ width: 8, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)' }} />
                  <div style={{ width: 8, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)' }} />
                </div>
                {/* Navigace šipky */}
                <button style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                <button style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              </div>
            )}

            {/* Grafika 1:1 */}
            {!isSelVideo && sel.type.toLowerCase() !== 'carousel' && (
              <div style={{ width: 'min(82vh, 540px)', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
                {sel.img
                  ? <img src={sel.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', background: '#f0efeb' }} />
                }
              </div>
            )}

            {/* Hook text pod obrázkem */}
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 500, maxWidth: 480, textAlign: 'center', lineHeight: 1.45, opacity: 0.92 }}>
              {selDraft.hook}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Naplánovat příspěvek ── */}
      {planModal !== null && posts[planModal] && (() => {
        const p = posts[planModal]
        const draft = drafts[planModal] ?? { hook: p.hook, body: p.body }
        return (
          <div
            onClick={() => setPlanModal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 16, width: 420, padding: 28, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                  <div style={{ ...eyebrowStyle, marginBottom: 5 }}>Naplánovat příspěvek</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {draft.hook || p.hook}
                  </div>
                </div>
                <button
                  onClick={() => setPlanModal(null)}
                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888', padding: '0 0 0 8px', flexShrink: 0, lineHeight: 1 }}
                >×</button>
              </div>

              {/* Thumbnail */}
              {p.img && (
                <div style={{
                  width: '100%', height: 110, borderRadius: 10, overflow: 'hidden', marginBottom: 20,
                  backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
                }} />
              )}

              {/* Datum + Čas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                <div>
                  <div style={{ ...eyebrowStyle, marginBottom: 6 }}>Datum</div>
                  <input
                    type="date"
                    value={planDate}
                    onChange={e => setPlanDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', boxSizing: 'border-box', border: '1px solid #e8e4dc', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#faf8f3', color: '#111', outline: 'none' }}
                  />
                </div>
                <div>
                  <div style={{ ...eyebrowStyle, marginBottom: 6 }}>Čas</div>
                  <input
                    type="time"
                    value={planTime}
                    onChange={e => setPlanTime(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', boxSizing: 'border-box', border: '1px solid #e8e4dc', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#faf8f3', color: '#111', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Tlačítka */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setPlanModal(null)}
                  style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e8e4dc', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}
                >
                  Zrušit
                </button>
                <button
                  onClick={async () => {
                    if (!planDate) return
                    const idx = planModal
                    const d = new Date(planDate)
                    const entry: ScheduledPost = {
                      postIdx: Number(idx),
                      hook: draft.hook || p.hook,
                      img: p.img ?? '',
                      type: p.type,
                      date: String(d.getDate()),
                      month: d.getMonth(),
                      year: d.getFullYear(),
                      time: planTime,
                    }
                    const updated = [...scheduledPosts.filter(s => s.postIdx !== idx), entry]
                    setScheduledPosts(updated)
                    // Nejdřív ulož status 'published' s scheduledPosts najednou
                    setStatuses(prev => ({ ...prev, [Number(idx)]: 'published' }))
                    setEditing(false)
                    console.log('PLAN MODAL SAVING:', {
                      idx,
                      entry,
                      updated,
                      scheduledPostsCount: scheduledPosts.length
                    })
                    await fetch('/api/client/post-status', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ projectCode, token, postIndex: Number(idx), status: 'published', scheduledPosts: updated }),
                    })
                    console.log('PLAN MODAL SAVED')
                    setPlanModal(null)
                    setTimeout(() => {
                      router.push(`/client/${projectCode}/planovac?token=${token}`)
                    }, 800)
                  }}
                  style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  📅 Naplánovat
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Modal: Navrhnout kampaň ── */}
      {showKampan && (
        <div
          onClick={() => setShowKampan(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: 680, maxHeight: '85vh', overflowY: 'auto', padding: 28 }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ ...eyebrowStyle, color: '#b7a000', marginBottom: 6 }}>Stratég Katalyzátor · doporučuje</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: '#111', margin: '0 0 8px', lineHeight: 1.2 }}>
                  Tvá značka je připravená na kampaň.
                </h2>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, maxWidth: 460 }}>
                  Nastal čas posunout <strong>pilíř důvěry</strong> na novou úroveň a oslovit zákazníky, kteří na tebe čekají.
                </div>
              </div>
              <button
                onClick={() => setShowKampan(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888', lineHeight: 1, padding: '4px 8px', flexShrink: 0 }}
              >×</button>
            </div>

            {/* Tarify — 3 sloupce */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>

              {/* START */}
              <div style={{ border: '2px solid #b7e94c', borderRadius: 12, padding: 16, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#b7e94c', color: '#111', fontSize: 9, fontWeight: 700, padding: '2px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  Doporučeno
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 4 }}>RTG · Start</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: '#111', lineHeight: 1 }}>2 900 Kč</div>
                <div style={{ fontSize: 11, color: '#8a8680', marginBottom: 10 }}>/měs</div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 14 }}>2 videa + 8 grafik / měsíc</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {['AI zpracování videa', 'Hook + grafika overlay', 'Střih na max 45s', 'Stažení nebo plánování', 'Drive archiv', 'Vizuální banka'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 11.5, color: '#444' }}>
                      <span style={{ color: '#3d6b00', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Vezmi a použij →
                </button>
              </div>

              {/* PLUS */}
              <div style={{ border: '1px solid #e8e4dc', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 4 }}>RTG · Plus</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: '#111', lineHeight: 1 }}>4 900 Kč</div>
                <div style={{ fontSize: 11, color: '#8a8680', marginBottom: 10 }}>/měs</div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 14 }}>4 videa + 16 grafik / měsíc</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {['Vše ze Start', '4 carousely', 'A/B varianty', 'Měsíční report'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 11.5, color: '#444' }}>
                      <span style={{ color: '#3d6b00', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e8e4dc', background: '#fff', color: '#111', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Vybrat Plus
                </button>
              </div>

              {/* PRO */}
              <div style={{ border: '1px solid #e8e4dc', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a8680', marginBottom: 4 }}>RTG · Pro</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: '#111', lineHeight: 1 }}>7 900 Kč</div>
                <div style={{ fontSize: 11, color: '#8a8680', marginBottom: 10 }}>/měs</div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 14 }}>8 videí + 30 grafik / měsíc</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {['Vše z Plus', '8 carouselů', 'Prioritní podpora', 'Stratég na míru'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 11.5, color: '#444' }}>
                      <span style={{ color: '#3d6b00', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e8e4dc', background: '#fff', color: '#111', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Vybrat Pro
                </button>
              </div>
            </div>

            {/* Rozložení kampaně */}
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 10 }}>
              Jak chceš kampaň rozložit?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { title: 'Buduju komunitu postupně', desc: '1–2 příspěvky týdně, AI sleduje reakce a optimalizuje obsah průběžně.', chip: 'Vhodné pro: dlouhodobý růst' },
                { title: 'Mám launch nebo událost', desc: 'Vše naraz — maximální dopad v krátkém čase. Kampaň na 2–4 týdny.', chip: 'Vhodné pro: spuštění, akce' },
              ].map(opt => (
                <div key={opt.title} style={{ border: '1px solid #e8e4dc', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 6 }}>{opt.title}</div>
                  <div style={{ fontSize: 11.5, color: '#555', lineHeight: 1.55, marginBottom: 10 }}>{opt.desc}</div>
                  <span style={{ border: '1px solid #e8e4dc', borderRadius: 20, padding: '2px 9px', fontSize: 10.5, color: '#8a8680' }}>{opt.chip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
