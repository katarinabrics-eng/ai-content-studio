'use client'

import { useState, useRef, useCallback } from 'react'

interface PhotoUploaderProps {
  eventId: string
  onUploadComplete: (count: number) => void
}

type FileStatus = 'pending' | 'uploading' | 'processing' | 'done' | 'error'

interface FileItem {
  id: string
  file: File
  status: FileStatus
  progress: number
  error?: string
}

const UPLOAD_URL = 'https://piclio-backend.fly.dev/upload'
const MAX_CONCURRENT = 3
const TIMEOUT_MS = 30_000

export function PhotoUploader({ eventId, onUploadComplete }: PhotoUploaderProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const activeUploads = useRef(0)
  const uploadQueue = useRef<FileItem[]>([])
  const doneCountRef = useRef(0)

  function updateFile(id: string, update: Partial<FileItem>) {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...update } : f))
  }

  function processQueue() {
    while (activeUploads.current < MAX_CONCURRENT && uploadQueue.current.length > 0) {
      const item = uploadQueue.current.shift()!
      startUpload(item)
    }
  }

  function startUpload(item: FileItem) {
    activeUploads.current++
    updateFile(item.id, { status: 'uploading', progress: 0 })

    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', item.file)
    if (eventId) formData.append('event_id', eventId)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        updateFile(item.id, { progress: Math.round((e.loaded / e.total) * 100) })
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        updateFile(item.id, { status: 'processing', progress: 100 })
        setTimeout(() => {
          updateFile(item.id, { status: 'done' })
          doneCountRef.current++
          onUploadComplete(doneCountRef.current)
        }, 1500)
      } else {
        updateFile(item.id, { status: 'error', error: `HTTP ${xhr.status}` })
      }
      activeUploads.current--
      processQueue()
    }

    xhr.onerror = () => {
      updateFile(item.id, { status: 'error', error: 'Chyba připojení' })
      activeUploads.current--
      processQueue()
    }

    xhr.ontimeout = () => {
      updateFile(item.id, { status: 'error', error: 'Timeout' })
      activeUploads.current--
      processQueue()
    }

    xhr.timeout = TIMEOUT_MS
    xhr.open('POST', UPLOAD_URL)
    xhr.send(formData)
  }

  function addFiles(rawFiles: File[]) {
    const valid = rawFiles
      .filter(f => /\.(jpe?g|png)$/i.test(f.name))
      .slice(0, 50)

    if (valid.length === 0) return

    const items: FileItem[] = valid.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      status: 'pending',
      progress: 0,
    }))

    setFiles(prev => [...prev, ...items])
    uploadQueue.current.push(...items)
    processQueue()
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }, [])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const doneCount = files.filter(f => f.status === 'done').length
  const errorCount = files.filter(f => f.status === 'error').length
  const inProgress = files.some(f => f.status === 'uploading' || f.status === 'processing')
  const allDone = files.length > 0 && !inProgress && files.every(f => f.status === 'done' || f.status === 'error')

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: `2px dashed ${isDragging ? '#b7e94c' : '#d1d5db'}`,
          borderRadius: 12,
          padding: '44px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'rgba(183,233,76,0.06)' : '#fafafa',
          transition: 'border-color 0.15s, background 0.15s',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: 48, height: 48, margin: '0 auto 14px',
          background: isDragging ? '#b7e94c' : '#e5e7eb',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 16.5V19a1 1 0 001 1h14a1 1 0 001-1v-2.5" stroke={isDragging ? '#1a1225' : '#6b7280'} strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 4v11M8.5 7.5L12 4l3.5 3.5" stroke={isDragging ? '#1a1225' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
          Přetáhněte fotky sem nebo klikněte pro výběr
        </div>
        <div style={{ fontSize: 13, color: '#9ca3af' }}>
          JPG, JPEG, PNG · max 50 souborů najednou
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          multiple
          style={{ display: 'none' }}
          onChange={e => {
            addFiles(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: 20 }}>

          {/* Summary bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
              {doneCount}/{files.length} nahráno
              {errorCount > 0 && (
                <span style={{ color: '#dc2626', fontWeight: 500, marginLeft: 10 }}>
                  {errorCount} {errorCount === 1 ? 'chyba' : 'chyby'}
                </span>
              )}
            </div>
            {allDone && errorCount === 0 && (
              <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                ✓ {doneCount} {doneCount === 1 ? 'fotka nahrána' : doneCount < 5 ? 'fotky nahrány' : 'fotek nahráno'}, čeká na zpracování OCR
              </div>
            )}
            {inProgress && (
              <div style={{ fontSize: 13, color: '#2563eb' }}>
                Nahrávám…
              </div>
            )}
          </div>

          {/* File rows */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            maxHeight: 360, overflowY: 'auto',
            paddingRight: 2,
          }}>
            {files.map(item => (
              <FileRow key={item.id} item={item} />
            ))}
          </div>

          {/* Clear button when done */}
          {allDone && (
            <button
              onClick={() => {
                setFiles([])
                doneCountRef.current = 0
              }}
              style={{
                marginTop: 14,
                background: 'none', border: '1px solid #d1d5db',
                borderRadius: 8, padding: '7px 16px',
                fontSize: 13, color: '#6b7280', cursor: 'pointer',
              }}
            >
              Vymazat seznam
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FileRow({ item }: { item: FileItem }) {
  const colors: Record<FileStatus, string> = {
    pending:    '#9ca3af',
    uploading:  '#2563eb',
    processing: '#d97706',
    done:       '#16a34a',
    error:      '#dc2626',
  }

  const labels: Record<FileStatus, string> = {
    pending:    'Čeká',
    uploading:  `${item.progress} %`,
    processing: 'Zpracovává…',
    done:       'Hotovo',
    error:      item.error ?? 'Chyba',
  }

  const showBar = item.status === 'uploading' || item.status === 'processing'
  const barColor = item.status === 'uploading' ? '#b7e94c' : '#fbbf24'
  const barWidth = item.status === 'processing' ? 100 : item.progress

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#fff', borderRadius: 8, padding: '9px 14px',
      border: `1px solid ${item.status === 'error' ? '#fecaca' : item.status === 'done' ? '#bbf7d0' : '#e5e7eb'}`,
    }}>
      {/* Status icon */}
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
        background: item.status === 'done' ? '#dcfce7' : item.status === 'error' ? '#fee2e2' : '#f3f4f6',
        color: colors[item.status],
      }}>
        {item.status === 'done' ? '✓' : item.status === 'error' ? '✕' : item.status === 'uploading' ? '↑' : item.status === 'processing' ? '⟳' : '·'}
      </div>

      {/* Filename + bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: '#374151',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.file.name}
        </div>
        {showBar && (
          <div style={{
            marginTop: 4, height: 3, borderRadius: 99,
            background: '#e5e7eb', overflow: 'hidden',
          }}>
            <div style={{
              width: `${barWidth}%`, height: '100%',
              background: barColor,
              transition: 'width 0.1s ease',
            }} />
          </div>
        )}
      </div>

      {/* Status label */}
      <div style={{
        fontSize: 12, fontWeight: 600, color: colors[item.status],
        flexShrink: 0, minWidth: 72, textAlign: 'right',
      }}>
        {labels[item.status]}
      </div>
    </div>
  )
}
