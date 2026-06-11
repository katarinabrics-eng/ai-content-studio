'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface Props {
  eventId: string
  eventName: string
  eventDate: string | null
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function KioskClient({ eventId, eventName, eventDate }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showEmailConfirm, setShowEmailConfirm] = useState(false)
  const [showReturningGuest, setShowReturningGuest] = useState(false)
  const [existingBadgeNumber, setExistingBadgeNumber] = useState<number | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [badgeNumber, setBadgeNumber] = useState<number | null>(null)
  const [gdprChecked, setGdprChecked] = useState(false)
  const [manualBadge, setManualBadge] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [photoBase64, setPhotoBase64] = useState('')
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (step !== 2) return
    startCamera()
    return () => stopCamera()
  }, [step])

  useEffect(() => {
    if (step !== 3) return
    setCountdown(10)
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(id); resetAll(); return 10 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [step])

  function resetAll() {
    setStep(1); setEmail(''); setEmailError(''); setShowEmailConfirm(false)
    setShowReturningGuest(false); setExistingBadgeNumber(null); setIsCheckingEmail(false)
    setBadgeNumber(null); setPhotoTaken(false)
    setPhotoBase64(''); setCountdown(10); setGdprChecked(false)
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch { /* camera denied — user can skip */ }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  async function handleEmailContinue() {
    if (!gdprChecked) {
      setEmailError('Prosím potvrďte souhlas se zpracováním osobních údajů'); return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Zadejte platný e-mail'); return
    }
    setIsCheckingEmail(true)
    try {
      const res = await fetch(`/api/kiosk/check-email?email=${encodeURIComponent(email)}&eventId=${eventId}`)
      const data = await res.json()
      if (data.exists) {
        setExistingBadgeNumber(data.badgeNumber)
        setShowReturningGuest(true)
      } else {
        setEmailError(''); setShowEmailConfirm(true)
      }
    } catch {
      setEmailError(''); setShowEmailConfirm(true)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  async function replaceBadge() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/kiosk/replace-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventId }),
      })
      const data = await res.json()
      if (data.badgeNumber) {
        setShowReturningGuest(false)
        setBadgeNumber(data.badgeNumber)
        setStep(3)
      }
    } catch {}
    setIsLoading(false)
  }

  function capturePhoto() {
    const video = videoRef.current; const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')!
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    setPhotoBase64(canvas.toDataURL('image/jpeg', 0.8))
    setPhotoTaken(true); stopCamera()
  }

  async function retakePhoto() {
    setPhotoTaken(false); setPhotoBase64(''); await startCamera()
  }

  async function handleRegister() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/kiosk/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          eventId,
          faceImageBase64: photoBase64 || null,
          manualBadgeNumber: manualBadge ? parseInt(manualBadge) : null,
        }),
      })
      const data = await res.json()
      if (data.badgeNumber) { setBadgeNumber(data.badgeNumber); stopCamera(); setStep(3) }
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const btnPrimary: React.CSSProperties = {
    background: '#b7e94c', color: '#1a1225', border: 'none',
    borderRadius: 16, minHeight: 52, fontSize: 18, fontWeight: 700,
    cursor: 'pointer', width: '100%',
  }
  const btnSecondary: React.CSSProperties = {
    flex: 1, background: 'rgba(255,255,255,0.08)', color: 'white',
    border: '2px solid rgba(255,255,255,0.15)', borderRadius: 16,
    minHeight: 52, fontSize: 16, fontWeight: 600, cursor: 'pointer',
  }

  return (
    <div style={{ background: '#1a1225', minHeight: '100dvh', color: 'white' }}>
      <div style={{
        maxWidth: 480, margin: '0 auto', padding: '24px 20px',
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          {/* 1. Logo */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/logo01.png" alt="Piclio" width={120} height={40} priority />
          </div>

          {/* 2. Mezera */}
          <div style={{ height: 20 }} />

          {/* 3. Název eventu */}
          <div style={{ fontSize: 22, fontWeight: 500, color: '#ffffff' }}>
            {eventName}
          </div>

          {/* 4. Datum */}
          {eventDate && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Datum konání: {formatDate(eventDate)}
            </div>
          )}

        </div>

        <div style={{ height: 8 }} />

        {/* Progress dots (step indicator) */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '8px 0' }}>
          {([1, 2, 3] as const).map(n => (
            <div key={n} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: step === n ? '#b7e94c' : 'rgba(255,255,255,0.18)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>

          {/* KROK 1: Email */}
          {step === 1 && !showEmailConfirm && !showReturningGuest && (
            <>
              {/* 7. Nadpis Vítejte */}
              <h1 style={{ fontSize: 42, fontWeight: 700, textAlign: 'center', margin: 0 }}>Vítejte</h1>
              {/* 8. Podtext */}
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 18, margin: 0 }}>
                Zadejte svůj e-mail pro přijetí fotek z večera
              </p>
              <input
                type="email" value={email}
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
                onKeyDown={e => e.key === 'Enter' && handleEmailContinue()}
                placeholder="vas@email.cz" autoFocus autoComplete="off"
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.12)',
                  borderRadius: 16, padding: '0 20px', minHeight: 52, fontSize: 16,
                  color: 'white', outline: 'none', width: '100%', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#b7e94c')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              {/* GDPR souhlas */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={gdprChecked}
                  onChange={e => { setGdprChecked(e.target.checked); setEmailError('') }}
                  style={{ width: 20, height: 20, marginTop: 2, accentColor: '#b7e94c', flexShrink: 0, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  Souhlasím se zpracováním osobních údajů (e-mail a fotografie) za účelem zaslání fotografií z akce v souladu s GDPR.
                </span>
              </label>
              {emailError && (
                <p style={{ color: '#ff6b6b', textAlign: 'center', margin: 0, fontSize: 15 }}>{emailError}</p>
              )}
              <button onClick={handleEmailContinue} disabled={isCheckingEmail || !gdprChecked}
                style={{ ...btnPrimary, opacity: (isCheckingEmail || !gdprChecked) ? 0.5 : 1 }}
              >
                {isCheckingEmail ? 'Kontroluji…' : 'Pokračovat →'}
              </button>
            </>
          )}

          {/* VRACAJÚCI SA HOST */}
          {step === 1 && showReturningGuest && (
            <>
              <h1 style={{ fontSize: 36, fontWeight: 700, textAlign: 'center', margin: 0 }}>Vítejte zpět!</h1>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 16, margin: 0 }}>
                Váš odznak má číslo
              </p>
              <div style={{
                fontSize: 80, fontWeight: 800, color: '#b7e94c',
                textAlign: 'center', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}>
                {existingBadgeNumber}
              </div>
              <button onClick={resetAll} style={btnPrimary}>Mám ho, děkuji</button>
              <button onClick={replaceBadge} disabled={isLoading}
                style={{ ...btnSecondary, width: '100%', flex: 'unset', opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Přiřazuji…' : 'Ztratil/a jsem ho'}
              </button>
            </>
          )}

          {/* POTVRDENIE EMAILU */}
          {step === 1 && showEmailConfirm && (
            <>
              <h1 style={{ fontSize: 36, fontWeight: 700, textAlign: 'center', margin: 0 }}>Je váš e-mail správný?</h1>
              <div style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 16,
                padding: '20px 24px', textAlign: 'center',
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#b7e94c', wordBreak: 'break-all' }}>{email}</span>
              </div>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 16, margin: 0 }}>
                Na tento e-mail vám pošleme odkaz na vaše fotografie z večera.
              </p>
              <button onClick={() => { setShowEmailConfirm(false); setStep(2) }} style={btnPrimary}>
                Ano, pokračovat →
              </button>
              <button onClick={() => setShowEmailConfirm(false)} style={{ ...btnSecondary, width: '100%', flex: 'unset' }}>
                Opravit e-mail
              </button>
            </>
          )}

          {/* KROK 2: Selfie */}
          {step === 2 && (
            <>
              <h1 style={{ fontSize: 42, fontWeight: 700, textAlign: 'center', margin: 0 }}>Nyní selfie</h1>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 18, margin: 0 }}>
                Podívejte se do kamery
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {!photoTaken ? (
                  <video ref={videoRef} autoPlay playsInline muted style={{
                    width: 200, height: 200, borderRadius: '50%', objectFit: 'cover',
                    transform: 'scaleX(-1)', border: '3px solid rgba(255,255,255,0.15)',
                    background: 'rgba(0,0,0,0.3)',
                  }} />
                ) : (
                  <img src={photoBase64} alt="selfie náhled" style={{
                    width: 200, height: 200, borderRadius: '50%',
                    objectFit: 'cover', border: '3px solid #b7e94c',
                  }} />
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {!photoTaken ? (
                <button onClick={capturePhoto} style={btnPrimary}>Vyfotit</button>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={retakePhoto} style={btnSecondary}>Zkusit znovu</button>
                  <button onClick={handleRegister} disabled={isLoading}
                    style={{ ...btnPrimary, flex: 1, width: 'auto', opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? 'Ukládám…' : 'Potvrdit'}
                  </button>
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <input
                  type="number"
                  placeholder="Číslo placky (volitelné — jen pro test)"
                  value={manualBadge}
                  onChange={e => setManualBadge(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.06)', color: '#fff',
                    fontSize: 16, boxSizing: 'border-box',
                  }}
                />
              </div>
              <button onClick={() => handleRegister()} disabled={isLoading} style={{
                background: 'transparent', color: 'rgba(255,255,255,0.35)',
                border: 'none', fontSize: 14, cursor: 'pointer', padding: 8, textDecoration: 'underline',
              }}>
                Přeskočit
              </button>
            </>
          )}

          {/* KROK 3: Potvrzení */}
          {step === 3 && badgeNumber !== null && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" stroke="#b7e94c" strokeWidth="4" />
                  <polyline points="22,40 34,52 58,28" stroke="#b7e94c" strokeWidth="5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', margin: 0 }}>Váš odznak</h1>
              <div style={{
                fontSize: 80, fontWeight: 800, color: '#b7e94c',
                textAlign: 'center', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}>
                {badgeNumber}
              </div>
              <p style={{ textAlign: 'center', fontSize: 20, margin: 0 }}>
                Vezměte si odznak č.&nbsp;<strong>{badgeNumber}</strong> ze stojanu
              </p>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
                Zkontrolujte že číslo souhlasí
              </p>
              <div>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 10 }}>
                  Automatický reset za {countdown} sekund
                </p>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    background: '#b7e94c', height: '100%',
                    width: `${(countdown / 10) * 100}%`, transition: 'width 1s linear', borderRadius: 4,
                  }} />
                </div>
              </div>
            </>
          )}
        </div>
        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}
