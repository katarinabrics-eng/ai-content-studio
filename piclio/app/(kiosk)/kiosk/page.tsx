'use client'

import { useEffect, useRef, useState } from 'react'

export default function KioskPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [badgeNumber, setBadgeNumber] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [photoBase64, setPhotoBase64] = useState('')
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera when entering step 2
  useEffect(() => {
    if (step !== 2) return
    startCamera()
    return () => stopCamera()
  }, [step])

  // Countdown + auto-reset on step 3
  useEffect(() => {
    if (step !== 3) return
    setCountdown(10)
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(id)
          resetAll()
          return 10
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [step])

  function resetAll() {
    setStep(1)
    setEmail('')
    setEmailError('')
    setBadgeNumber(null)
    setPhotoTaken(false)
    setPhotoBase64('')
    setCountdown(10)
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      // camera permission denied — user can still skip
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  function handleEmailContinue() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Zadejte platný e-mail')
      return
    }
    setEmailError('')
    setStep(2)
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')!
    // Mirror to match what the user sees
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    setPhotoBase64(canvas.toDataURL('image/jpeg', 0.8))
    setPhotoTaken(true)
    stopCamera()
  }

  async function retakePhoto() {
    setPhotoTaken(false)
    setPhotoBase64('')
    await startCamera()
  }

  async function handleRegister() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/kiosk/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          faceImageBase64: photoBase64 || null,
        }),
      })
      const data = await res.json()
      if (data.badgeNumber) {
        setBadgeNumber(data.badgeNumber)
        stopCamera()
        setStep(3)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const btnPrimary: React.CSSProperties = {
    background: '#b7e94c',
    color: '#1a1225',
    border: 'none',
    borderRadius: 16,
    minHeight: 52,
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
  }

  const btnSecondary: React.CSSProperties = {
    flex: 1,
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.15)',
    borderRadius: 16,
    minHeight: 52,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  }

  return (
    <div style={{ background: '#1a1225', minHeight: '100dvh', color: 'white' }}>
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '24px 20px',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.2em' }}>PICLIO</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '0.05em' }}>
            by Lucifera Studio
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '20px 0' }}>
          {([1, 2, 3] as const).map(n => (
            <div
              key={n}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: step === n ? '#b7e94c' : 'rgba(255,255,255,0.18)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          {/* ── KROK 1: Email ── */}
          {step === 1 && (
            <>
              <h1 style={{ fontSize: 42, fontWeight: 700, textAlign: 'center', margin: 0 }}>
                Vítejte
              </h1>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 18, margin: 0 }}>
                Zadejte svůj e-mail pro přijetí fotek z večera
              </p>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
                onKeyDown={e => e.key === 'Enter' && handleEmailContinue()}
                placeholder="vas@email.cz"
                autoFocus
                autoComplete="off"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '2px solid rgba(255,255,255,0.12)',
                  borderRadius: 16,
                  padding: '0 20px',
                  minHeight: 52,
                  fontSize: 16,
                  color: 'white',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#b7e94c')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              {emailError && (
                <p style={{ color: '#ff6b6b', textAlign: 'center', margin: 0, fontSize: 15 }}>
                  {emailError}
                </p>
              )}
              <button onClick={handleEmailContinue} style={btnPrimary}>
                Pokračovat →
              </button>
            </>
          )}

          {/* ── KROK 2: Selfie ── */}
          {step === 2 && (
            <>
              <h1 style={{ fontSize: 42, fontWeight: 700, textAlign: 'center', margin: 0 }}>
                Nyní selfie
              </h1>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 18, margin: 0 }}>
                Podívejte se do kamery
              </p>

              {/* Viewfinder */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {!photoTaken ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      border: '3px solid rgba(255,255,255,0.15)',
                      background: 'rgba(0,0,0,0.3)',
                    }}
                  />
                ) : (
                  <img
                    src={photoBase64}
                    alt="selfie náhled"
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #b7e94c',
                    }}
                  />
                )}
              </div>

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {!photoTaken ? (
                <button onClick={capturePhoto} style={btnPrimary}>
                  Vyfotit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={retakePhoto} style={btnSecondary}>
                    Zkusit znovu
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={isLoading}
                    style={{ ...btnPrimary, flex: 1, width: 'auto', opacity: isLoading ? 0.7 : 1 }}
                  >
                    {isLoading ? 'Ukládám…' : 'Potvrdit'}
                  </button>
                </div>
              )}

              <button
                onClick={() => handleRegister()}
                disabled={isLoading}
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.35)',
                  border: 'none',
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: 8,
                  textDecoration: 'underline',
                }}
              >
                Přeskočit
              </button>
            </>
          )}

          {/* ── KROK 3: Potvrzení ── */}
          {step === 3 && badgeNumber !== null && (
            <>
              {/* Check icon */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" stroke="#b7e94c" strokeWidth="4" />
                  <polyline
                    points="22,40 34,52 58,28"
                    stroke="#b7e94c"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', margin: 0 }}>
                Váš odznak
              </h1>

              <div
                style={{
                  fontSize: 80,
                  fontWeight: 800,
                  color: '#b7e94c',
                  textAlign: 'center',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {badgeNumber}
              </div>

              <p style={{ textAlign: 'center', fontSize: 20, margin: 0 }}>
                Vezměte si odznak č.&nbsp;<strong>{badgeNumber}</strong> ze stojanu
              </p>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
                Zkontrolujte že číslo souhlasí
              </p>

              {/* Progress bar countdown */}
              <div>
                <p
                  style={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 13,
                    marginBottom: 10,
                  }}
                >
                  Automatický reset za {countdown} sekund
                </p>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    height: 6,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      background: '#b7e94c',
                      height: '100%',
                      width: `${(countdown / 10) * 100}%`,
                      transition: 'width 1s linear',
                      borderRadius: 4,
                    }}
                  />
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
