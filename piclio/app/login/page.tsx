'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()

  // ── Photographer state ───────────────────────────────────────────
  const [photoEmail, setPhotoEmail] = useState('')
  const [photoPassword, setPhotoPassword] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [photoLoading, setPhotoLoading] = useState(false)

  async function handlePhotographerLogin(e: React.FormEvent) {
    e.preventDefault()
    setPhotoLoading(true); setPhotoError('')
    const res = await fetch('/api/photographer/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: photoEmail, password: photoPassword }),
    })
    if (res.ok) {
      router.push('/dashboard/photographer')
    } else {
      const d = await res.json()
      setPhotoError(d.error ?? 'Chyba přihlášení')
    }
    setPhotoLoading(false)
  }

  // ── Client / Producer state ──────────────────────────────────────
  const [clientEmail, setClientEmail] = useState('')
  const [clientSent, setClientSent] = useState(false)
  const [clientError, setClientError] = useState('')
  const [clientLoading, setClientLoading] = useState(false)

  async function handleClientMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setClientLoading(true); setClientError('')
    const res = await fetch('/api/auth/client-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clientEmail }),
    })
    const d = await res.json()
    if (res.ok && d.sent) {
      setClientSent(true)
    } else {
      setClientError(d.error ?? 'Email nebyl nalezen')
    }
    setClientLoading(false)
  }

  // ── Guest state ──────────────────────────────────────────────────
  const [guestEmail, setGuestEmail] = useState('')
  const [guestEvent, setGuestEvent] = useState('')
  const [guestError, setGuestError] = useState('')
  const [guestLoading, setGuestLoading] = useState(false)

  async function handleGuestSearch(e: React.FormEvent) {
    e.preventDefault()
    setGuestLoading(true); setGuestError('')
    const res = await fetch('/api/find-gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: guestEmail }),
    })
    const d = await res.json()
    if (d.found && d.galleryToken) {
      router.push(`/gallery/${d.galleryToken}`)
    } else {
      setGuestError('Email nenalezen. Zkontrolujte adresu nebo se zaregistrujte u vchodu.')
    }
    setGuestLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1225',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '48px 20px 64px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <style>{`
        .login-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
          max-width: 1000px;
        }
        @media (max-width: 768px) {
          .login-grid { grid-template-columns: 1fr; max-width: 440px; }
        }
        .login-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: white;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .login-input:focus { border-color: #b7e94c; }
        .login-input::placeholder { color: rgba(255,255,255,0.28); }
      `}</style>

      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <Image src="/logo01.png" alt="Piclio" width={140} height={47} priority />
      </div>

      <div className="login-grid">

        {/* ── SEKCE 1: Fotograf ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16, padding: '28px 24px',
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b7e94c', marginBottom: 8 }}>
              Fotograf / Studio
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Přihlaste se</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>do svého účtu</p>
          </div>

          <form onSubmit={handlePhotographerLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className="login-input" type="email" required
              placeholder="email@studio.cz" value={photoEmail}
              onChange={e => { setPhotoEmail(e.target.value); setPhotoError('') }}
            />
            <input
              className="login-input" type="password" required
              placeholder="heslo" value={photoPassword}
              onChange={e => { setPhotoPassword(e.target.value); setPhotoError('') }}
            />
            {photoError && (
              <div style={{ fontSize: 13, color: '#ff6b6b', padding: '8px 0' }}>{photoError}</div>
            )}
            <button type="submit" disabled={photoLoading} style={{
              background: photoLoading ? 'rgba(183,233,76,0.5)' : '#b7e94c',
              color: '#1a1225', border: 'none', borderRadius: 10,
              padding: '12px', fontSize: 15, fontWeight: 700,
              cursor: photoLoading ? 'not-allowed' : 'pointer', marginTop: 4,
            }}>
              {photoLoading ? 'Přihlašuji…' : 'Přihlásit se'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
                Vytvořit účet — dostupné od 17.&nbsp;6.
              </span>
            </div>
          </form>
        </div>

        {/* ── SEKCE 2: Zadavatel / Produkce ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16, padding: '28px 24px',
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              Zadavatel / Produkce
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Přistoupit k projektu</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Zadejte email z pozvánky od fotografa
            </p>
          </div>

          {clientSent ? (
            <div style={{
              background: 'rgba(183,233,76,0.1)', border: '1px solid rgba(183,233,76,0.3)',
              borderRadius: 10, padding: '16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✉️</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#b7e94c', marginBottom: 4 }}>
                Odkaz byl odeslán
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                Zkontrolujte svůj email a klikněte na odkaz pro přihlášení.
              </div>
            </div>
          ) : (
            <form onSubmit={handleClientMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="login-input" type="email" required
                placeholder="email@firma.cz" value={clientEmail}
                onChange={e => { setClientEmail(e.target.value); setClientError('') }}
              />
              {clientError && (
                <div style={{ fontSize: 13, color: '#ff6b6b', padding: '4px 0' }}>{clientError}</div>
              )}
              <button type="submit" disabled={clientLoading} style={{
                background: clientLoading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.12)',
                color: 'white', border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 700,
                cursor: clientLoading ? 'not-allowed' : 'pointer', marginTop: 4,
              }}>
                {clientLoading ? 'Odesílám…' : 'Přistoupit k projektu'}
              </button>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 4 }}>
                Na email vám přijde odkaz pro přihlášení
              </div>
            </form>
          )}
        </div>

        {/* ── SEKCE 3: Hosté ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16, padding: '28px 24px',
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              Hosté
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Hledat fotografie</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Zadejte email použitý při registraci
            </p>
          </div>

          <form onSubmit={handleGuestSearch} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className="login-input" type="email" required
              placeholder="váš@email.cz" value={guestEmail}
              onChange={e => { setGuestEmail(e.target.value); setGuestError('') }}
            />
            <input
              className="login-input" type="text"
              placeholder="např. firemní večírek" value={guestEvent}
              onChange={e => setGuestEvent(e.target.value)}
            />
            {guestError && (
              <div style={{ fontSize: 13, color: '#ff6b6b', padding: '4px 0' }}>{guestError}</div>
            )}
            <button type="submit" disabled={guestLoading} style={{
              background: 'transparent',
              color: guestLoading ? 'rgba(255,255,255,0.4)' : 'white',
              border: '1.5px solid rgba(255,255,255,0.25)',
              borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 700,
              cursor: guestLoading ? 'not-allowed' : 'pointer', marginTop: 4,
              transition: 'border-color 0.15s',
            }}>
              {guestLoading ? 'Hledám…' : 'Hledat →'}
            </button>
          </form>
        </div>

      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
        Piclio by Lucifera Studio
      </div>
    </div>
  )
}
