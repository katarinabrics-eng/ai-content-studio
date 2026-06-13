'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Photo {
  id: string
  url: string
  filename: string
  taken_at: string | null
  uploaded_at: string
}

interface EventInfo {
  id: string
  name: string
  slug: string
  date: string
  brand_color: string
  client_logo_url: string | null
}

type ModalState =
  | { type: 'closed' }
  | { type: 'form'; photoId: string }
  | { type: 'success'; galleryToken: string }
  | { type: 'error'; message: string }

export default function PublicGalleryPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>()
  const [event, setEvent] = useState<EventInfo | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({ type: 'closed' })
  const [claimEmail, setClaimEmail] = useState('')
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimError, setClaimError] = useState('')

  useEffect(() => {
    if (!eventSlug) return
    fetch(`/api/event/${eventSlug}/public-gallery`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setEvent(data.event)
        setPhotos(data.photos ?? [])
      })
      .catch(() => setError('Nepodařilo se načíst galerii'))
      .finally(() => setLoading(false))
  }, [eventSlug])

  function openClaim(photoId: string) {
    setClaimEmail('')
    setClaimError('')
    setModal({ type: 'form', photoId })
  }

  function closeModal() {
    setModal({ type: 'closed' })
    setClaimError('')
  }

  async function submitClaim() {
    if (modal.type !== 'form') return
    if (!claimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claimEmail)) {
      setClaimError('Zadejte platný e-mail'); return
    }
    setClaimLoading(true); setClaimError('')
    try {
      const res = await fetch(`/api/event/${eventSlug}/claim-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: claimEmail, photoId: modal.photoId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setClaimError(data.error ?? 'Nepodařilo se přidat fotku')
      } else {
        setModal({ type: 'success', galleryToken: data.galleryToken })
      }
    } catch {
      setClaimError('Chyba připojení')
    } finally {
      setClaimLoading(false)
    }
  }

  const brandColor = event?.brand_color ?? '#b7e94c'
  const APP_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ''

  if (loading) return (
    <div style={{ background: '#1a1225', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Načítám galerii…</div>
    </div>
  )

  if (error) return (
    <div style={{ background: '#1a1225', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }}>🔒</div>
      <div style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{error}</div>
    </div>
  )

  return (
    <div style={{ background: '#1a1225', minHeight: '100dvh', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#0f0b1a', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{event?.name}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
            Veřejná galerie · {photos.length} fotografií
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', paddingTop: 80, fontSize: 16 }}>
            Zatím žádné fotografie
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {photos.map(photo => (
              <div key={photo.id} style={{
                borderRadius: 14, overflow: 'hidden',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                position: 'relative',
              }}>
                <img
                  src={photo.url}
                  alt={photo.filename}
                  style={{ width: '100%', aspectRatio: '3/2', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '12px 14px 14px' }}>
                  <button
                    onClick={() => openClaim(photo.id)}
                    style={{
                      width: '100%', background: brandColor, color: '#1a1225',
                      border: 'none', borderRadius: 10, padding: '10px 0',
                      fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    To jsem já
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {modal.type !== 'closed' && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1e1530', borderRadius: 20, padding: '32px 28px',
              width: '100%', maxWidth: 420,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {modal.type === 'form' && (
              <>
                <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>To jsem já!</h2>
                <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6 }}>
                  Zadejte e-mail, který jste použili při registraci na akci. Fotka se přidá do vaší galerie.
                </p>
                <input
                  type="email"
                  value={claimEmail}
                  onChange={e => { setClaimEmail(e.target.value); setClaimError('') }}
                  onKeyDown={e => e.key === 'Enter' && submitClaim()}
                  placeholder="vas@email.cz"
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.08)',
                    border: `2px solid ${claimError ? '#ff6b6b' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: 12, padding: '0 16px', height: 48,
                    fontSize: 16, color: 'white', outline: 'none', marginBottom: 8,
                  }}
                  onFocus={e => { if (!claimError) e.currentTarget.style.borderColor = brandColor }}
                  onBlur={e => { if (!claimError) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                />
                {claimError && (
                  <p style={{ color: '#ff6b6b', fontSize: 13, margin: '0 0 12px' }}>{claimError}</p>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={closeModal} style={{
                    flex: 1, background: 'rgba(255,255,255,0.08)', color: 'white',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
                    height: 46, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Zrušit
                  </button>
                  <button onClick={submitClaim} disabled={claimLoading || !claimEmail} style={{
                    flex: 2, background: brandColor, color: '#1a1225',
                    border: 'none', borderRadius: 12, height: 46,
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    opacity: (claimLoading || !claimEmail) ? 0.6 : 1,
                  }}>
                    {claimLoading ? 'Přidávám…' : 'Přidat do mé galerie →'}
                  </button>
                </div>
              </>
            )}

            {modal.type === 'success' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="30" stroke={brandColor} strokeWidth="3" />
                    <polyline points="18,32 27,41 46,22" stroke={brandColor} strokeWidth="4"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, textAlign: 'center' }}>Fotka přidána!</h2>
                <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.55)', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
                  Fotka byla přidána do vaší galerie.
                </p>
                <a
                  href={`/gallery/${modal.galleryToken}`}
                  style={{
                    display: 'block', background: brandColor, color: '#1a1225',
                    borderRadius: 12, padding: '13px 0', fontSize: 15, fontWeight: 700,
                    textAlign: 'center', textDecoration: 'none',
                  }}
                >
                  Otevřít moji galerii →
                </a>
                <button onClick={closeModal} style={{
                  width: '100%', marginTop: 10, background: 'transparent',
                  border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14,
                  cursor: 'pointer', padding: 8,
                }}>
                  Zpět na galerii
                </button>
              </>
            )}

            {modal.type === 'error' && (
              <>
                <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700 }}>Chyba</h2>
                <p style={{ color: '#ff6b6b', fontSize: 15 }}>{modal.message}</p>
                <button onClick={closeModal} style={{
                  width: '100%', background: brandColor, color: '#1a1225',
                  border: 'none', borderRadius: 12, height: 46,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16,
                }}>
                  Zavřít
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
