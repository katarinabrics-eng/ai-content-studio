'use client'

import { useEffect } from 'react'
import type { GalleryPhoto } from '@/lib/types'

interface LightboxProps {
  photos: GalleryPhoto[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export function PhotoLightbox({ photos, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const photo = photos[currentIndex]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onNext, onPrev, onClose])

  if (!photo) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.95)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,0.12)', border: 'none',
          color: 'white', width: 44, height: 44,
          borderRadius: '50%', cursor: 'pointer', fontSize: 22, lineHeight: 1,
        }}
      >
        ×
      </button>

      {/* Counter */}
      <div style={{
        position: 'absolute', top: 26, left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.5)', fontSize: 13,
      }}>
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Prev */}
      {currentIndex > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onPrev() }}
          style={{
            position: 'absolute', left: 16,
            background: 'rgba(255,255,255,0.12)', border: 'none',
            color: 'white', width: 48, height: 48,
            borderRadius: '50%', cursor: 'pointer', fontSize: 26,
          }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      <img
        src={photo.url}
        alt={photo.filename}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 'calc(100vw - 128px)',
          maxHeight: 'calc(100vh - 80px)',
          objectFit: 'contain',
          borderRadius: 8,
          userSelect: 'none',
        }}
      />

      {/* Next */}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNext() }}
          style={{
            position: 'absolute', right: 16,
            background: 'rgba(255,255,255,0.12)', border: 'none',
            color: 'white', width: 48, height: 48,
            borderRadius: '50%', cursor: 'pointer', fontSize: 26,
          }}
        >
          ›
        </button>
      )}
    </div>
  )
}
