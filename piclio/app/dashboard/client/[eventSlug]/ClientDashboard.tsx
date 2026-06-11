'use client'

import { useState, useRef, useEffect } from 'react'
import type { PiclioEvent, Guest, UnmatchedPhoto, PlaylistPhoto } from '@/lib/types'
import { StatCard } from '@/components/piclio/StatCard'

interface Stats {
  guestCount: number
  photoCount: number
  unmatchedCount: number
  deliveredCount: number
  avgPhotosPerGuest: number
  galleryOpenedCount: number
  publicPhotoCount: number
}

interface Props {
  event: PiclioEvent
  guests: Guest[]
  stats: Stats
  unmatchedPhotos: UnmatchedPhoto[]
  allPhotos: PlaylistPhoto[]
  eventSlug: string
}

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://piclio.cz'

type Tab = 'overview' | 'links' | 'albums' | 'branding' | 'photos'

interface Album {
  id: string
  name: string
  photoIds: string[]
}

export function ClientDashboard({ event, guests, stats, unmatchedPhotos, allPhotos, eventSlug }: Props) {
  const [tab, setTab] = useState<Tab>('overview')

  // ── Photos state ────────────────────────────────────────────────────────────
  const [eventPhotos, setEventPhotos] = useState<any[]>([])
  const [photosLoading, setPhotosLoading] = useState(false)

  useEffect(() => {
    if (tab !== 'photos') return
    setPhotosLoading(true)
    fetch(`/api/photographer/unmatched?eventId=${event.id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setEventPhotos(d.photos ?? []))
      .catch(() => setEventPhotos([]))
      .finally(() => setPhotosLoading(false))
  }, [tab, event.id])

  // ── Live state ──────────────────────────────────────────────────────────────
  const [liveStats, setLiveStats] = useState(stats)
  const [liveGuests, setLiveGuests] = useState(guests)

  // Poll stats + guests every 15s
  useEffect(() => {
    const tick = () =>
      fetch(`/api/client/${eventSlug}/live?include=stats,guests`)
        .then(r => r.json())
        .then(d => {
          if (d.stats) setLiveStats(d.stats)
          if (d.guests) setLiveGuests(d.guests)
        })
        .catch(() => {})
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [eventSlug])

  // ── Albums ──────────────────────────────────────────────────────────────────
  const [albums, setAlbums] = useState<Album[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem(`piclio-albums-${eventSlug}`) ?? '[]') } catch { return [] }
  })
  const [newAlbumName, setNewAlbumName] = useState('')
  const [editingAlbum, setEditingAlbum] = useState<string | null>(null)
  const [albumPhotos, setAlbumPhotos] = useState<PlaylistPhoto[]>(allPhotos)
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  useEffect(() => {
    if (tab !== 'albums') return
    setLoadingPhotos(true)
    fetch(`/api/events/${eventSlug}/gallery-photos`)
      .then(r => r.json())
      .then(d => { if (d.photos) setAlbumPhotos(d.photos) })
      .catch(() => {})
      .finally(() => setLoadingPhotos(false))
  }, [eventSlug, tab])

  function saveAlbums(next: Album[]) {
    setAlbums(next)
    localStorage.setItem(`piclio-albums-${eventSlug}`, JSON.stringify(next))
  }

  function createAlbum() {
    const name = newAlbumName.trim()
    if (!name) return
    const album: Album = { id: crypto.randomUUID(), name, photoIds: [] }
    saveAlbums([...albums, album])
    setNewAlbumName('')
    setEditingAlbum(album.id)
  }

  function deleteAlbum(id: string) {
    if (!confirm('Smazat album?')) return
    saveAlbums(albums.filter(a => a.id !== id))
    if (editingAlbum === id) setEditingAlbum(null)
  }

  function togglePhotoInAlbum(albumId: string, photoId: string) {
    saveAlbums(albums.map(a => {
      if (a.id !== albumId) return a
      const has = a.photoIds.includes(photoId)
      return { ...a, photoIds: has ? a.photoIds.filter(id => id !== photoId) : [...a.photoIds, photoId] }
    }))
  }

  // ── Branding state ──────────────────────────────────────────────────────────
  const [brandColor, setBrandColor] = useState(event.brand_color ?? '#1a1225')
  const [logoUrl, setLogoUrl] = useState(event.client_logo_url ?? '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [savingBranding, setSavingBranding] = useState(false)
  const [brandingMsg, setBrandingMsg] = useState('')
  const [description, setDescription] = useState((event as any).description ?? '')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoMsg, setInfoMsg] = useState('')
  const [overlayNotes, setOverlayNotes] = useState(event.overlay_notes ?? '')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const accent = brandColor

  // ── Handlers ────────────────────────────────────────────────────────────────

  function copyLink(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }

  async function saveInfo() {
    setSavingInfo(true); setInfoMsg('')
    try {
      const res = await fetch(`/api/client/${eventSlug}/branding`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setInfoMsg('✓ Uloženo')
    } catch (e: any) { setInfoMsg(`✗ ${e.message}`) }
    finally { setSavingInfo(false) }
  }

  async function saveBranding() {
    setSavingBranding(true); setBrandingMsg('')
    try {
      const form = new FormData()
      form.append('brand_color', brandColor)
      if (logoFile) form.append('logo', logoFile)
      else form.append('client_logo_url', logoUrl)
      const res = await fetch(`/api/client/${eventSlug}/branding`, { method: 'PUT', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      if (json.client_logo_url) setLogoUrl(json.client_logo_url)
      if (json.brand_color) setBrandColor(json.brand_color)
      setBrandingMsg('✓ Branding uložen')
      window.location.reload()
    } catch (e: any) { setBrandingMsg(`✗ Chyba: ${e.message}`) }
    finally { setSavingBranding(false) }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function statusBadge(status: string) {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      active:    { label: 'Aktivní',   bg: '#dcfce7', color: '#16a34a' },
      draft:     { label: 'Příprava',  bg: '#fef9c3', color: '#92400e' },
      paused:    { label: 'Pozastaveno', bg: '#fee2e2', color: '#dc2626' },
      completed: { label: 'Dokončeno', bg: '#f3f4f6', color: '#6b7280' },
      archived:  { label: 'Archiv',    bg: '#f3f4f6', color: '#9ca3af' },
    }
    const s = map[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' }
    return (
      <span style={{ display: 'inline-block', background: s.bg, color: s.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>
        {s.label}
      </span>
    )
  }

  const LINKS = [
    {
      key: 'kiosk',
      icon: '📱',
      label: 'Kiosk — registrace hostů',
      desc: 'Zobrazte na tabletu u vstupu. Hosté zadají e-mail a dostanou odznak.',
      url: `${APP_URL}/kiosk/${eventSlug}`,
    },
    {
      key: 'slideshow',
      icon: '▶',
      label: 'Slideshow — projekce',
      desc: event.slideshow_pin ? `PIN pro obsluhu: ${event.slideshow_pin}` : 'Živá projekce fotek na plátno nebo TV.',
      url: `${APP_URL}/slideshow/${eventSlug}`,
    },
    {
      key: 'gallery',
      icon: '🖼',
      label: 'Veřejná galerie eventu',
      desc: 'Odkaz pro sdílení — zobrazuje všechny spárované fotky bez přihlášení.',
      url: `${APP_URL}/event/${eventSlug}/gallery`,
    },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ee', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Header */}
      <div style={{ background: accent, padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {logoUrl && <img src={logoUrl} alt="" style={{ height: 36, objectFit: 'contain', borderRadius: 4 }} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{event.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
            {formatDate(event.date)}{event.location ? ` · ${event.location}` : ''}
          </div>
        </div>
        {statusBadge(event.status)}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#e8e5df', borderRadius: 12, padding: 4 }}>
          {([
            ['overview', 'Přehled'],
            ['links',    'Linky'],
            ['albums',   'Alba'],
            ['photos',   'Fotky z eventu'],
            ['branding', 'Branding'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: tab === key ? '#fff' : 'transparent',
              color: tab === key ? '#111827' : '#6b7280',
              boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── PŘEHLED ── */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Info o eventu */}
            <div style={card}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <InfoTile label="Název akce" value={event.name} />
                <InfoTile label="Datum" value={formatDate(event.date)} />
                {event.location && <InfoTile label="Místo" value={event.location} />}
                <InfoTile label="Max hostů" value={String(event.max_guests ?? '—')} />
                <InfoTile label="Stav" value={event.status} />
              </div>
            </div>

            {/* Stat karty */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              <StatCard label="Hosté celkem" value={liveStats.guestCount} />
              <StatCard label="Fotky celkem" value={liveStats.photoCount} />
              <StatCard label="Spárované" value={liveStats.publicPhotoCount} accent />
              <StatCard label="Doručeno" value={liveStats.deliveredCount} accent />
              <StatCard label="Ø fotky / host" value={liveStats.avgPhotosPerGuest} sublabel="průměr" />
              <StatCard label="Nespárované" value={liveStats.unmatchedCount} />
            </div>

            {/* Rychlé linky */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Rychlé linky</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LINKS.map(l => (
                  <div key={l.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9f8f5', borderRadius: 8 }}>
                    <span style={{ fontSize: 14, color: '#374151' }}>{l.icon} {l.label}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => copyLink(l.key, l.url)} style={btnOutline(accent)}>
                        {copiedKey === l.key ? '✓ Zkopírováno' : 'Kopírovat'}
                      </button>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ ...btnOutline(accent), textDecoration: 'none' }}>Otevřít →</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LINKY ── */}
        {tab === 'links' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {LINKS.map(l => (
              <div key={l.key} style={{ ...card, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fde8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {l.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{l.label}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{l.desc}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
                    <code style={{ fontSize: 12, background: '#f3f4f6', padding: '6px 10px', borderRadius: 6, color: '#374151', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {l.url}
                    </code>
                    <button onClick={() => copyLink(l.key, l.url)} style={btnPrimary(accent)}>
                      {copiedKey === l.key ? '✓ Zkopírováno' : 'Kopírovat'}
                    </button>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ ...btnOutline(accent), textDecoration: 'none' }}>
                      Otevřít →
                    </a>
                  </div>
                  {l.key === 'slideshow' && event.slideshow_pin && (
                    <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fde8', border: '1px solid #b7e94c', borderRadius: 8, padding: '6px 14px' }}>
                      <span style={{ fontSize: 11, color: '#4a7c00', fontWeight: 600, letterSpacing: '0.05em' }}>PIN:</span>
                      <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: 4, color: '#111827', fontFamily: 'monospace' }}>{event.slideshow_pin}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ALBA ── */}
        {tab === 'albums' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Vytvoření nového alba */}
            {editingAlbum === null && (
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Vytvořit album</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Název alba (např. Večeře, Tanec, VIP…)"
                    value={newAlbumName}
                    onChange={e => setNewAlbumName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createAlbum()}
                    style={inputStyle}
                  />
                  <button onClick={createAlbum} disabled={!newAlbumName.trim()} style={btnPrimary(accent)}>
                    + Vytvořit
                  </button>
                </div>
              </div>
            )}

            {/* Existující alba */}
            {albums.length === 0 && editingAlbum === null && (
              <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', background: '#fff', borderRadius: 12 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Zatím žádná alba</div>
                <div style={{ fontSize: 13 }}>Vytvořte album a přidejte do něj fotky z eventu.</div>
              </div>
            )}

            {editingAlbum === null && albums.map(album => (
              <div key={album.id} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{album.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{album.photoIds.length} fotek</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditingAlbum(album.id)} style={btnPrimary(accent)}>Upravit</button>
                    <button onClick={() => deleteAlbum(album.id)} style={{ ...btnOutline('#dc2626'), color: '#dc2626' }}>Smazat</button>
                  </div>
                </div>
                {album.photoIds.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {album.photoIds.slice(0, 8).map(pid => {
                      const p = albumPhotos.find(x => x.id === pid)
                      return p ? (
                        <img key={pid} src={p.url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                      ) : null
                    })}
                    {album.photoIds.length > 8 && (
                      <div style={{ width: 60, height: 60, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#6b7280', fontWeight: 700 }}>
                        +{album.photoIds.length - 8}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Editor alba */}
            {editingAlbum !== null && (() => {
              const album = albums.find(a => a.id === editingAlbum)
              if (!album) return null
              return (
                <div style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <button onClick={() => setEditingAlbum(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280', padding: 0 }}>←</button>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{album.name}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{album.photoIds.length} fotek vybráno</div>
                    </div>
                    <button onClick={() => setEditingAlbum(null)} style={{ marginLeft: 'auto', ...btnOutline(accent) }}>
                      ✓ Hotovo
                    </button>
                  </div>
                  {loadingPhotos ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Načítám fotky…</div>
                  ) : albumPhotos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Zatím nejsou k dispozici žádné fotky</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                      {albumPhotos.map(photo => {
                        const selected = album.photoIds.includes(photo.id)
                        return (
                          <div key={photo.id} onClick={() => togglePhotoInAlbum(album.id, photo.id)} style={{
                            borderRadius: 8, overflow: 'hidden', cursor: 'pointer', position: 'relative',
                            border: `2px solid ${selected ? accent : 'transparent'}`,
                            height: 220, background: '#f5f3ee',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <img src={photo.url} alt={photo.filename} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
                            {selected && (
                              <div style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#1a1225', fontWeight: 700 }}>
                                ✓
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {/* ── FOTKY Z EVENTU ── */}
        {tab === 'photos' && (
          <div style={{ padding: '24px 0' }}>
            {photosLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Načítám fotky…</div>
            ) : eventPhotos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                <div style={{ fontSize: 15 }}>Zatím žádné fotky z eventu</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                  Celkem {eventPhotos.length} fotek z eventu
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {eventPhotos.map((photo: any) => (
                    <div key={photo.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 220, background: '#f5f3ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={photo.url}
                        alt={photo.filename}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                      />
                      {photo.status === 'unmatched' && (
                        <div style={{
                          position: 'absolute', top: 4, left: 4,
                          background: '#f59e0b', color: '#fff',
                          fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        }}>
                          Bez galerie
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BRANDING ── */}
        {tab === 'branding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 0' }}>

            {/* Náhled grafiky pro fotky */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Grafika pro fotky</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>Náhled jak budou vypadat fotky s aplikovanou grafikou.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 400 }}>
                {event.overlay_portrait_url ? (
                  <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f9fafb', aspectRatio: '2/3', maxHeight: 160, maxWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={event.overlay_portrait_url} alt="Portrét overlay" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <div style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 10, color: '#6b7280', background: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: 4 }}>Portrét</div>
                  </div>
                ) : <div style={{ background: '#f9fafb', borderRadius: 8, aspectRatio: '2/3' as const, maxHeight: 160, maxWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9ca3af', textAlign: 'center' as const, padding: 12 }}>Portrét<br/>nenalezen</div>}
                {event.overlay_landscape_url ? (
                  <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f9fafb', aspectRatio: '3/2', maxHeight: 120, maxWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={event.overlay_landscape_url} alt="Krajina overlay" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <div style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 10, color: '#6b7280', background: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: 4 }}>Krajina</div>
                  </div>
                ) : <div style={{ background: '#f9fafb', borderRadius: 8, aspectRatio: '3/2' as const, maxHeight: 120, maxWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9ca3af', textAlign: 'center' as const, padding: 12 }}>Krajina<br/>nenalezena</div>}
              </div>
            </div>

            {/* Náhled emailu */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Náhled emailu pro hosty</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>Email který hosté obdrží s odkazem na galerii.</p>
              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', maxWidth: 480 }}>
                <div style={{ background: (event as any).email_header_color ?? '#1a1225', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 56 }}>
                  {event.client_logo_url
                    ? <img src={event.client_logo_url} alt="" style={{ maxHeight: 36, maxWidth: 160, objectFit: 'contain' }} />
                    : <span style={{ color: '#b7e94c', fontWeight: 700, fontSize: 16 }}>Piclio</span>}
                </div>
                <div style={{ height: 4, background: event.brand_color ?? '#b7e94c' }} />
                {(event as any).email_banner_url
                  ? <img src={(event as any).email_banner_url} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                  : <div style={{ height: 60, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 11, color: '#9ca3af' }}>banner eventu</span></div>}
                <div style={{ padding: '16px 20px', background: '#fff' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 10 }}>Vaše fotografie z akce {event.name} jsou připraveny</div>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, marginBottom: 14 }}>Dobrý den,<br/>připravili jsme pro vás fotografie z akce {event.name}.<br/>Klikněte na odkaz níže a prohlédněte si svoji galerii.</div>
                  <div style={{ background: event.brand_color ?? '#b7e94c', color: '#1a1225', padding: '10px 16px', borderRadius: 8, fontWeight: 700, textAlign: 'center' as const, fontSize: 13 }}>Otevřít galerii →</div>
                </div>
                <div style={{ padding: '10px 20px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', fontSize: 11, color: '#9ca3af', textAlign: 'center' as const }}>Piclio by Lucifera Studio</div>
              </div>
            </div>

            {/* Náhled slideshow */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Náhled slideshow / galerie</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>Vizuální styl projekce nastavený fotografem.</p>
              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', aspectRatio: '16/9', position: 'relative', background: (event as any).slideshow_bg === 'light' ? '#fff' : (event as any).slideshow_bg === 'brand' ? (event.brand_color ?? '#000') : '#000' }}>
                {(event as any).slideshow_bar_enabled && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, background: (event as any).slideshow_bar_color === 'brand' ? (event.brand_color ?? '#1a1225') : (event as any).slideshow_bar_color === 'transparent' ? 'rgba(0,0,0,0.3)' : ((event as any).slideshow_bar_color ?? '#1a1225'), display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
                    {event.client_logo_url
                      ? <img src={event.client_logo_url} alt="" style={{ height: 24, objectFit: 'contain', maxWidth: 100 }} />
                      : <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>LOGO</span>}
                    <span style={{ color: '#fff', fontSize: 11, opacity: 0.7 }}>{event.name}</span>
                  </div>
                )}
                {(event as any).slideshow_overlay_url && (
                  <img src={(event as any).slideshow_overlay_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.6 }} />
                )}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '40%', height: '70%', background: 'rgba(255,255,255,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>fotka</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Poznámky pro fotografa */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Poznámky pro fotografa</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>Zde můžete napsat požadavky nebo připomínky k zapracování.</p>
              <textarea
                rows={4}
                value={overlayNotes}
                onChange={e => setOverlayNotes(e.target.value)}
                placeholder="Např. Prosím o úpravu barvy loga, nebo jiné poznámky pro fotografa..."
                style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical' as const, outline: 'none' }}
              />
              <button
                onClick={async () => {
                  await fetch(`/api/client/${eventSlug}/approve-overlay`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ approved: true, notes: overlayNotes }),
                  })
                  setBrandingMsg('✓ Poznámky odeslány fotografovi')
                }}
                style={{ marginTop: 10, background: '#111827', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Odeslat poznámky fotografovi
              </button>
              {brandingMsg && <span style={{ marginLeft: 12, fontSize: 13, color: '#16a34a' }}>{brandingMsg}</span>}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

// ── Helper components ─────────────────────────────────────────────────────────

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f5f3ee', borderRadius: 8, padding: '10px 16px', minWidth: 130 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{value}</div>
    </div>
  )
}

// ── Style helpers ─────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}
const sectionTitle: React.CSSProperties = {
  fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
  borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
function btnPrimary(bg: string): React.CSSProperties {
  return { padding: '9px 18px', background: bg, color: bg === '#16a34a' ? '#fff' : '#1a1225', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' as const }
}
function btnOutline(color: string): React.CSSProperties {
  return { padding: '7px 14px', background: 'transparent', color, border: `1px solid ${color}`, borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }
}
const btnSecondary: React.CSSProperties = {
  padding: '9px 18px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb',
  borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
}
