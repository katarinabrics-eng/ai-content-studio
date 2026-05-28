'use client'

import type { GalleryPhoto } from '@/lib/types'

interface PhotoGridProps {
  photos: GalleryPhoto[]
  onPhotoClick: (index: number) => void
  newPhotoIds?: Set<string>
  onDownload?: (photo: GalleryPhoto) => void
}

export function PhotoGrid({ photos, onPhotoClick, newPhotoIds, onDownload }: PhotoGridProps) {
  return (
    <>
      <style>{`
        @keyframes piclio-fadein {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 600px) {
          .piclio-photo-item img { height: 180px !important; }
        }
      `}</style>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="piclio-photo-item"
            style={{
              position: 'relative',
              animation: newPhotoIds?.has(photo.id) ? 'piclio-fadein 0.5s ease' : 'none',
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={photo.url}
              alt={photo.filename}
              loading="lazy"
              onClick={() => onPhotoClick(index)}
              style={{ height: 340, width: 'auto', display: 'block', borderRadius: 8, transition: 'opacity 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            />
            {onDownload && (
              <button
                onClick={e => { e.stopPropagation(); onDownload(photo) }}
                title="Stáhnout"
                style={{
                  position: 'absolute', bottom: 8, right: 8,
                  background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 6,
                  color: '#fff', width: 32, height: 32, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, lineHeight: 1,
                }}
              >
                ↓
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
