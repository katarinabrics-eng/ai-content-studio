'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function FindGalleryPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Zadejte platný e-mail.')
      inputRef.current?.focus()
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/find-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()

      if (data.found && data.galleryToken) {
        router.push(`/gallery/${data.galleryToken}`)
      } else {
        setError('E-mail nenalezen. Zaregistrujte se u vchodu.')
        setLoading(false)
        inputRef.current?.focus()
      }
    } catch {
      setError('Chyba připojení. Zkuste to znovu.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1225',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'system-ui, sans-serif',
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ color: '#b7e94c', fontSize: 36, fontWeight: 700, letterSpacing: '-1px' }}>
          Piclio
        </div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>
          by Lucifera Studio
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#1a1225',
          margin: '0 0 10px',
          textAlign: 'center',
        }}>
          Najděte své fotografie
        </h1>
        <p style={{
          fontSize: 15,
          color: '#6b7280',
          textAlign: 'center',
          margin: '0 0 36px',
          lineHeight: 1.5,
        }}>
          Zadejte e-mail použitý při registraci
        </p>

        <form onSubmit={handleSearch}>
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="váš@email.cz"
            autoComplete="email"
            inputMode="email"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px 20px',
              fontSize: 18,
              border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: 12,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 16,
              color: '#1a1225',
              background: loading ? '#f9fafb' : '#fff',
              transition: 'border-color 0.15s',
            }}
          />

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 14,
              marginBottom: 16,
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            style={{
              width: '100%',
              padding: '18px',
              background: loading || !email.trim() ? '#e5e7eb' : '#b7e94c',
              color: loading || !email.trim() ? '#9ca3af' : '#1a1225',
              border: 'none',
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 700,
              cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 20, height: 20, border: '2px solid #9ca3af',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Hledám…
              </>
            ) : (
              'Hledat →'
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: 13,
          color: '#9ca3af',
          marginTop: 24,
          marginBottom: 0,
        }}>
          Ještě nejste registrováni?{' '}
          <a href="/kiosk" style={{ color: '#1a1225', fontWeight: 600, textDecoration: 'underline' }}>
            Zaregistrujte se
          </a>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #b7e94c !important; }
      `}</style>
    </div>
  )
}
