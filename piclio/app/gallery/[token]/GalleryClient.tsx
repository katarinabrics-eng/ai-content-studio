'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { GalleryPhoto, Guest, PiclioEvent, UnmatchedPhoto } from '@/lib/types'
import { PhotoGrid } from '@/components/piclio/PhotoGrid'
import { PhotoLightbox } from '@/components/piclio/PhotoLightbox'

interface Props {
  token: string
  initialGuest: Guest
  initialEvent: PiclioEvent
  initialPhotos: GalleryPhoto[]
}

export function GalleryClient({ token, initialGuest, initialEvent, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState<'moje' | 'event'>('moje')
  const [eventPhotos, setEventPhotos] = useState<UnmatchedPhoto[]>([])
  const [claiming, setClaiming] = useState<string | null>(null)

  const supabase = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  ).current

  const fetchMyPhotos = useCallback(async () => {
    const res = await fetch(`/api/gallery/${token}`, { cache: 'no-store' })
    const data = await res.json()
    if (data.photos) setPhotos(data.photos)
  }, [token])

  const fetchEventPhotos = useCallback(async () => {
    const res = await fetch(`/api/gallery/${token}/unmatched?t=${Date.now()}`, { cache: 'no-store' })
    const data = await res.json()
    if (data.photos) setEventPhotos(data.photos)
  }, [token])

  useEffect(() => {
    fetchEventPhotos()
  }, [fetchEventPhotos])

  useEffect(() => {
    const channel = supabase
      .channel(`gallery-${token}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photo_guests' },
        async () => {
          await fetchMyPhotos()
          await fetchEventPhotos()
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [token, supabase, fetchMyPhotos, fetchEventPhotos])

  async function claimPhoto(photoId: string) {
    setClaiming(photoId)
    try {
      const res = await fetch(`/api/gallery/${token}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      })
      if (!res.ok) return
      await fetchMyPhotos()
      await fetchEventPhotos()
    } finally {
      setClaiming(null)
    }
  }

  async function downloadOne(photo: GalleryPhoto) {
    const res = await fetch(photo.url)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = photo.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadAll() {
    setDownloading(true)
    try {
      for (const photo of photos) {
        await downloadOne(photo)
        await new Promise(r => setTimeout(r, 300))
      }
    } finally {
      setDownloading(false)
    }
  }

  const brandColor = initialEvent.brand_color ?? '#111827'

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ background: brandColor, color: '#fff', padding: '24px 20px 20px' }}>
        {initialEvent.client_logo_url && (
          <img src={initialEvent.client_logo_url} alt={initialEvent.client_name ?? ''}
            style={{ height: 40, marginBottom: 12, objectFit: 'contain' }} />
        )}
        <div style={{ fontSize: 20, fontWeight: 700 }}>{initialEvent.name}</div>
        <div style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>
          {initialGuest.name ? `Ahoj, ${initialGuest.name}` : 'Vaše galerie'} · {photos.length} {photos.length === 1 ? 'fotka' : photos.length < 5 ? 'fotky' : 'fotek'}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        {(['moje', 'event'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '12px 0', border: 'none', background: 'none',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              borderBottom: activeTab === tab ? `3px solid ${brandColor}` : '3px solid transparent',
              color: activeTab === tab ? brandColor : '#6b7280',
            }}>
            {tab === 'moje' ? 'Moje fotky' : `Fotky z eventu${eventPhotos.length > 0 ? ` (${eventPhotos.length})` : ''}`}
          </button>
        ))}
      </div>

      {activeTab === 'moje' && (
        <>
          {photos.length > 0 && (
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={downloadAll} disabled={downloading}
                style={{ background: brandColor, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: downloading ? 0.6 : 1 }}>
                {downloading ? 'Stahuji…' : 'Stáhnout vše'}
              </button>
            </div>
          )}
          <div style={{ padding: '8px 12px 40px' }}>
            {photos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: 48 }}>📷</div>
                <div style={{ marginTop: 12, fontSize: 16 }}>Zatím žádné fotky</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Fotky se objeví automaticky po přiřazení</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {photos.map(photo => (
                  <div key={photo.id} style={{ position: 'relative' }}>
                    <div style={{ height: 220, background: '#f5f3ee', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      onClick={() => setLightboxIndex(photos.indexOf(photo))}>
                      <img
                        src={photo.url}
                        alt={photo.filename}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                      />
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (!confirm('Odebrat fotku z galerie?')) return
                        await fetch(`/api/gallery/${token}/remove`, {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ photoId: photo.id }),
                        })
                        setPhotos(prev => prev.filter(p => p.id !== photo.id))
                        await fetchEventPhotos()
                      }}
                      title="Odebrat z galerie"
                      style={{
                        position: 'absolute', top: 4, right: 4,
                        background: 'rgba(239,68,68,0.85)', border: 'none',
                        borderRadius: 6, padding: '4px 7px',
                        cursor: 'pointer', color: '#fff', fontSize: 13,
                      }}
                    >
                      🗑
                    </button>
                    <button
                      onClick={() => downloadOne(photo)}
                      title="Stáhnout"
                      style={{
                        position: 'absolute', bottom: 4, right: 4,
                        background: 'rgba(0,0,0,0.5)', border: 'none',
                        borderRadius: 6, padding: '4px 7px',
                        cursor: 'pointer', color: '#fff', fontSize: 13,
                      }}
                    >
                      ↓
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'event' && (
        <div style={{ padding: '8px 12px 40px' }}>
          {eventPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: 48 }}>🎉</div>
              <div style={{ marginTop: 12, fontSize: 16 }}>Žádné další fotky z eventu</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {eventPhotos.map(photo => (
                <div key={photo.id}>
                  <div style={{ height: 220, background: '#f5f3ee', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={photo.url} alt={photo.filename}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
                  </div>
                  <button onClick={() => claimPhoto(photo.id)} disabled={claiming === photo.id}
                    style={{ marginTop: 6, width: '100%', background: brandColor, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: claiming === photo.id ? 0.6 : 1 }}>
                    {claiming === photo.id ? '…' : 'Přidat do své galerie'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox photos={photos} currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex(i => Math.min(photos.length - 1, (i ?? 0) + 1))} />
      )}
    </div>
  )
}
