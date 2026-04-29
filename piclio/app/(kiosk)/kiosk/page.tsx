'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Step = 'email' | 'selfie' | 'confirm'

function KioskFlow() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') ?? ''

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [hasCaptured, setHasCaptured] = useState(false)
  const [badgeNumber, setBadgeNumber] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      setError('Nepodařilo se spustit kameru. Zkontrolujte oprávnění.')
    }
  }, [])

  // Start camera when entering selfie step (and not yet captured)
  useEffect(() => {
    if (step === 'selfie' && !hasCaptured) {
      startCamera()
    }
    return () => {
      if (step === 'selfie') stopCamera()
    }
  }, [step, hasCaptured, startCamera, stopCamera])

  // Countdown + auto-reset on confirm step
  useEffect(() => {
    if (step !== 'confirm') return
    setCountdown(10)
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(id)
          resetFlow()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const resetFlow = () => {
    setStep('email')
    setEmail('')
    setEmailError('')
    setPhotoBase64(null)
    setHasCaptured(false)
    setBadgeNumber(null)
    setError('')
  }

  const handleEmailSubmit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Zadejte platnou e-mailovou adresu')
      return
    }
    setEmailError('')
    setStep('selfie')
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    // Draw mirrored to match what user sees
    const ctx = canvas.getContext('2d')!
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    setPhotoBase64(canvas.toDataURL('image/jpeg', 0.85))
    setHasCaptured(true)
    stopCamera()
  }

  const retakePhoto = () => {
    setPhotoBase64(null)
    setHasCaptured(false)
    setError('')
    startCamera()
  }

  const confirmPhoto = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/kiosk/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventId, faceBase64: photoBase64 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Chyba registrace')
      setBadgeNumber(data.badgeNumber)
      setStep('confirm')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1225' }}>
        <p className="text-white/50 text-xl">Chybí parametr eventId v URL</p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between p-8 text-white select-none"
      style={{ background: '#1a1225' }}
    >
      {/* Logo */}
      <span className="mt-2 text-xl font-semibold tracking-[0.3em] text-white/40 uppercase">
        Piclio
      </span>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg gap-8">

        {/* ── KROK 1: Email ── */}
        {step === 'email' && (
          <>
            <h1 className="text-6xl font-bold text-center">Vítejte</h1>
            <p className="text-xl text-white/50 text-center">
              Zadejte svůj e-mail pro přijetí fotek
            </p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
              placeholder="vas@email.cz"
              autoFocus
              autoComplete="off"
              className="w-full text-2xl text-center bg-white/10 rounded-2xl px-6 py-5 outline-none border-2 border-transparent focus:border-[#b7e94c] placeholder:text-white/25 transition-colors"
            />
            {emailError && (
              <p className="text-red-400 text-lg -mt-4">{emailError}</p>
            )}
            <button
              onClick={handleEmailSubmit}
              className="w-full text-2xl font-bold py-5 rounded-2xl transition active:scale-95"
              style={{ background: '#b7e94c', color: '#1a1225' }}
            >
              Pokračovat
            </button>
          </>
        )}

        {/* ── KROK 2: Selfie ── */}
        {step === 'selfie' && (
          <>
            <h1 className="text-6xl font-bold text-center">Nyní selfie</h1>
            <p className="text-xl text-white/50 text-center">
              Podívejte se do kamery
            </p>

            {/* Viewfinder */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black/50">
              {!hasCaptured ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                photoBase64 && (
                  <img
                    src={photoBase64}
                    alt="náhled selfie"
                    className="w-full h-full object-cover"
                  />
                )
              )}
              {/* Oval face guide */}
              {!hasCaptured && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-64 rounded-full border-2 border-[#b7e94c]/60" />
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {error && <p className="text-red-400 text-lg text-center">{error}</p>}

            {!hasCaptured ? (
              <button
                onClick={capturePhoto}
                className="w-full text-2xl font-bold py-5 rounded-2xl transition active:scale-95"
                style={{ background: '#b7e94c', color: '#1a1225' }}
              >
                Vyfotit
              </button>
            ) : (
              <div className="flex gap-4 w-full">
                <button
                  onClick={retakePhoto}
                  className="flex-1 text-xl font-semibold py-5 rounded-2xl border-2 border-white/20 transition active:scale-95"
                >
                  Zkusit znovu
                </button>
                <button
                  onClick={confirmPhoto}
                  disabled={loading}
                  className="flex-1 text-xl font-bold py-5 rounded-2xl transition active:scale-95 disabled:opacity-50"
                  style={{ background: '#b7e94c', color: '#1a1225' }}
                >
                  {loading ? 'Ukládám…' : 'Potvrdit'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── KROK 3: Potvrzení ── */}
        {step === 'confirm' && badgeNumber !== null && (
          <>
            <div
              className="text-[10rem] font-black leading-none tabular-nums"
              style={{ color: '#b7e94c' }}
            >
              {badgeNumber}
            </div>
            <h1 className="text-4xl font-bold text-center">
              Vezměte si odznak č.&nbsp;{badgeNumber}
            </h1>
            <p className="text-xl text-white/50 text-center">
              Zkontrolujte že číslo souhlasí
            </p>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                style={{ background: '#b7e94c', width: `${(countdown / 10) * 100}%` }}
              />
            </div>
            <p className="text-white/30 text-lg -mt-4">
              Resetuje se za {countdown} s
            </p>
          </>
        )}
      </div>

      <div className="h-10" />
    </div>
  )
}

export default function KioskPage() {
  return (
    <Suspense>
      <KioskFlow />
    </Suspense>
  )
}
