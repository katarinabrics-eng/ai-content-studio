'use client'

import { useEffect, useRef, useState } from 'react'
import type { EventWithStats, Guest, UnmatchedPhoto } from '@/lib/types'
import { StatCard } from '@/components/piclio/StatCard'
import { Logo } from '@/components/piclio/Logo'
import { PhotoUploader } from '@/components/piclio/PhotoUploader'

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://piclio.cz'

type Tab = 'events' | 'guests' | 'unmatched' | 'upload' | 'project' | 'settings' | 'galerie'

interface GalleryPhoto {
  id: string
  url: string
  filename: string
  uploaded_at: string
  guest_id?: string
  guest_name?: string
  orientation?: 'portrait' | 'landscape'
}

export function PhotographerClient() {
  const [events, setEvents] = useState<EventWithStats[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventWithStats | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null)
  const [editingEmail, setEditingEmail] = useState('')
  const [unmatched, setUnmatched] = useState<UnmatchedPhoto[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [tab, setTab] = useState<Tab>('events')
  const [loading, setLoading] = useState(true)
  const [assigningPhoto, setAssigningPhoto] = useState<string | null>(null)
  const [assignTarget, setAssignTarget] = useState<Record<string, string>>({})
  const [uploadedCount, setUploadedCount] = useState(0)
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [form, setForm] = useState({
    name: '', date: '', location: '', maxGuests: '100',
    clientName: '', clientEmail: '', brandColor: '#b7e94c',
  })
  const [eventType, setEventType] = useState<'ai' | 'simple'>('ai')
  const [galleryPublic, setGalleryPublic] = useState(false)
  const [selectedUnmatched, setSelectedUnmatched] = useState<Set<string>>(new Set())
  const [deletingBulk, setDeletingBulk] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventWithStats | null>(null)
  const [editForm, setEditForm] = useState({
    name: '', date: '', location: '', maxGuests: '100',
    clientName: '', clientEmail: '', brandColor: '#b7e94c',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [overlayPortrait, setOverlayPortrait] = useState<{ file: File; preview: string } | null>(null)
  const [overlayLandscape, setOverlayLandscape] = useState<{ file: File; preview: string } | null>(null)
  const [overlayPortraitError, setOverlayPortraitError] = useState('')
  const [overlayLandscapeError, setOverlayLandscapeError] = useState('')
  const [overlayPortraitUrl, setOverlayPortraitUrl] = useState('')
  const [overlayLandscapeUrl, setOverlayLandscapeUrl] = useState('')
  const [overlayPortraitUploading, setOverlayPortraitUploading] = useState(false)
  const [overlayLandscapeUploading, setOverlayLandscapeUploading] = useState(false)
  const [overlayFullscreen, setOverlayFullscreen] = useState<'portrait' | 'landscape' | null>(null)
  const [overlayStatus, setOverlayStatus] = useState<'approved' | 'pending_client' | null>(null)
  const [overlayApproved, setOverlayApproved] = useState(false)
  const [overlayNotes, setOverlayNotes] = useState<string | null>(null)
  const [overlayMode, setOverlayMode] = useState<'custom' | 'piclio' | 'none'>('none')
  const [savingOverlayMode, setSavingOverlayMode] = useState(false)
  const [infoNotes, setInfoNotes] = useState<string | null>(null)
  const [overlayToast, setOverlayToast] = useState(false)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['podklady']))
  function toggleSection(key: string) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }
  const [inviteToast, setInviteToast] = useState<'ok' | 'error' | null>(null)
  const [sendingInvite, setSendingInvite] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const overlayApprovedRef = useRef(false)
  const emailLogoRef = useRef<HTMLInputElement>(null)
  const emailBannerRef = useRef<HTMLInputElement>(null)

  const [projectForm, setProjectForm] = useState({
    name: '', date: '', location: '', maxGuests: '', description: '', photographerNotes: '', eventCategory: '', slideshowWelcomeText: '',
  })
  const [projectSaving, setProjectSaving] = useState(false)
  const [projectSaveMsg, setProjectSaveMsg] = useState('')
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null)

  // Slideshow settings
  const [slideshowContent, setSlideshowContent] = useState<'photographer' | 'client' | 'random' | 'selected_guests'>('random')
  const [slideshowSelectedGuests, setSlideshowSelectedGuests] = useState<string[]>([])
  const [slideshowOutput, setSlideshowOutput] = useState<'slideshow' | 'download' | 'both'>('slideshow')
  const [slideshowInterval, setSlideshowInterval] = useState(5)
  const [slideshowAnimation, setSlideshowAnimation] = useState<'fade' | 'slide' | 'none'>('fade')
  const [slideshowLayout, setSlideshowLayout] = useState<'single' | 'kenburns' | 'grid'>('single')

  // Gallery tab
  const [galleryTab, setGalleryTab] = useState<'all' | 'by-guest' | 'unassigned'>('all')
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set())
  const [gallerySort, setGallerySort] = useState<'newest' | 'oldest'>('newest')
  const [playlistPhotos, setPlaylistPhotos] = useState<GalleryPhoto[]>([])
  const [selectedGuestFilter, setSelectedGuestFilter] = useState<string>('all')
  const [savingSlideshow, setSavingSlideshow] = useState(false)
  const [slideshowMsg, setSlideshowMsg] = useState('')

  // Email settings
  const [emailLogoFile, setEmailLogoFile] = useState<File | null>(null)
  const [emailLogoUrl, setEmailLogoUrl] = useState('')
  const [emailBannerFile, setEmailBannerFile] = useState<File | null>(null)
  const [emailBannerUrl, setEmailBannerUrl] = useState('')
  const [emailBrandColor, setEmailBrandColor] = useState('#b7e94c')
  const [emailBtnTextColor, setEmailBtnTextColor] = useState('#1a1225')
  const [emailHeaderColor, setEmailHeaderColor] = useState('#1a1225')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [savingEmailSettings, setSavingEmailSettings] = useState(false)
  const [emailSettingsMsg, setEmailSettingsMsg] = useState('')

  function updateProjectForm(key: string, value: string) {
    setProjectForm(prev => ({ ...prev, [key]: value }))
  }

  async function saveSlideshow() {
    if (!selectedEvent) return
    setSavingSlideshow(true)
    setSlideshowMsg('')
    try {
      const res = await fetch(`/api/events/${selectedEvent.slug}/slideshow-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideshow_content: slideshowContent,
          slideshow_selected_guests: slideshowSelectedGuests,
          slideshow_output: slideshowOutput,
          slideshow_interval: slideshowInterval,
          slideshow_animation: slideshowAnimation,
          slideshow_layout: slideshowLayout,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Chyba')
      setSlideshowMsg('✓ Uloženo')
    } catch (e: any) {
      setSlideshowMsg(`✗ ${e.message}`)
    } finally {
      setSavingSlideshow(false)
    }
  }

  async function saveProjectInfo() {
    if (!selectedEvent) return
    setProjectSaving(true)
    setProjectSaveMsg('')
    try {
      const res = await fetch('/api/photographer/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEvent.id,
          name: projectForm.name,
          location: projectForm.location,
          date: projectForm.date ? projectForm.date.split('T')[0] : undefined,
          maxGuests: parseInt(projectForm.maxGuests) || undefined,
          description: projectForm.description,
          photographerNotes: projectForm.photographerNotes,
          eventCategory: projectForm.eventCategory,
          slideshowWelcomeText: projectForm.slideshowWelcomeText,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Chyba')
      setSelectedEvent(prev => prev ? {
        ...prev,
        name: projectForm.name,
        location: projectForm.location,
        date: projectForm.date ? projectForm.date.split('T')[0] : prev.date,
        max_guests: parseInt(projectForm.maxGuests) || prev.max_guests,
      } : prev)
      setProjectSaveMsg('✓ Uloženo')
    } catch (e: any) {
      setProjectSaveMsg(`✗ ${e.message}`)
    } finally {
      setProjectSaving(false)
    }
  }

  function updateForm(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function saveEmailSettings() {
    if (!selectedEvent) return
    setSavingEmailSettings(true)
    setEmailSettingsMsg('')
    try {
      // Upload logo if new file selected
      if (emailLogoFile) {
        const form = new FormData()
        form.append('logo', emailLogoFile)
        form.append('brand_color', emailBrandColor)
        const res = await fetch(`/api/client/${selectedEvent.slug}/branding`, { method: 'PUT', body: form })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setEmailLogoUrl(json.client_logo_url ?? emailLogoUrl)
        setEmailLogoFile(null)
      }
      // Upload banner if new file selected
      let bannerUrl = emailBannerUrl
      if (emailBannerFile) {
        const form = new FormData()
        form.append('email_banner', emailBannerFile)
        const res = await fetch(`/api/client/${selectedEvent.slug}/branding`, { method: 'PUT', body: form })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        bannerUrl = json.email_banner_url ?? emailBannerUrl
        setEmailBannerUrl(bannerUrl)
        setEmailBannerFile(null)
      }
      // Save text settings + brand color
      const res = await fetch('/api/photographer/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEvent.id,
          brandColor: emailBrandColor,
          emailBannerUrl: bannerUrl,
          emailSubject,
          emailBody,
          emailBtnTextColor,
          emailHeaderColor,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Chyba')
      setEmailSettingsMsg('✓ Uloženo')
    } catch (e: any) {
      setEmailSettingsMsg(`✗ ${e.message}`)
    } finally {
      setSavingEmailSettings(false)
    }
  }

  function openEdit(event: EventWithStats) {
    setEditingEvent(event)
    setEditForm({
      name: event.name ?? '',
      date: event.date ? event.date.slice(0, 10) : '',
      location: event.location ?? '',
      maxGuests: String(event.max_guests ?? 100),
      clientName: event.client_name ?? '',
      clientEmail: event.client_email ?? '',
      brandColor: event.brand_color ?? '#b7e94c',
    })
    setSaveError('')
  }

  function handleOverlaySelect(
    orientation: 'portrait' | 'landscape',
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    const setData = orientation === 'portrait' ? setOverlayPortrait : setOverlayLandscape
    const setError = orientation === 'portrait' ? setOverlayPortraitError : setOverlayLandscapeError
    const expectedRatio = orientation === 'portrait' ? 2 / 3 : 3 / 2
    const minW = orientation === 'portrait' ? 1000 : 1500
    const minH = orientation === 'portrait' ? 1500 : 1000

    setError('')
    setData(null)

    if (file.size > 8 * 1024 * 1024) {
      setError('Soubor je příliš velký (max 8 MB)')
      e.target.value = ''
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight
      const tolerance = 0.02
      if (Math.abs(ratio - expectedRatio) > tolerance) {
        setError(
          `Nesprávný poměr stran (${img.naturalWidth}×${img.naturalHeight}). ` +
          `Očekáváno ${orientation === 'portrait' ? '2:3' : '3:2'}.`
        )
        URL.revokeObjectURL(url)
        e.target.value = ''
        return
      }
      if (img.naturalWidth < minW || img.naturalHeight < minH) {
        setError(
          `Příliš malé rozměry (${img.naturalWidth}×${img.naturalHeight}). ` +
          `Minimum je ${minW}×${minH} px.`
        )
        URL.revokeObjectURL(url)
        e.target.value = ''
        return
      }
      setData({ file, preview: url })
    }
    img.src = url
  }

  async function handleOverlayUpload(orientation: 'portrait' | 'landscape') {
    if (!selectedEvent) return
    const source = orientation === 'portrait' ? overlayPortrait : overlayLandscape
    if (!source) return

    const setUploading = orientation === 'portrait' ? setOverlayPortraitUploading : setOverlayLandscapeUploading
    const setUrl = orientation === 'portrait' ? setOverlayPortraitUrl : setOverlayLandscapeUrl
    const setError = orientation === 'portrait' ? setOverlayPortraitError : setOverlayLandscapeError

    setUploading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('eventId', selectedEvent.id)
      fd.append('orientation', orientation)
      fd.append('file', source.file)

      const res = await fetch('/api/photographer/events/overlay', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Nahrávání selhalo')
      } else {
        setUrl(data.url)
        // Persist URL to DB
        const patchField = orientation === 'portrait' ? 'overlayPortraitUrl' : 'overlayLandscapeUrl'
        await fetch('/api/photographer/events', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedEvent.id, [patchField]: data.url }),
        })
      }
    } catch {
      setError('Chyba připojení')
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingEvent) return
    setSaving(true); setSaveError('')
    try {
      const res = await fetch('/api/photographer/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEvent.id,
          name: editForm.name,
          date: editForm.date,
          location: editForm.location,
          maxGuests: parseInt(editForm.maxGuests) || 100,
          clientName: editForm.clientName,
          clientEmail: editForm.clientEmail,
          brandColor: editForm.brandColor,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSaveError(data.error ?? 'Chyba'); setSaving(false); return }
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, ...data.event } : ev))
      setEditingEvent(null)
    } catch { setSaveError('Chyba připojení') }
    setSaving(false)
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault()
    if (eventType === 'ai' && (!form.clientName.trim() || !form.clientEmail.trim())) {
      setCreateError('Vyplňte jméno a email zadavatele.')
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/photographer/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          date: form.date,
          location: form.location,
          maxGuests: parseInt(form.maxGuests) || 100,
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          brandColor: form.brandColor,
          event_type: eventType,
          gallery_public: galleryPublic,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error ?? 'Chyba'); setCreating(false); return }
      setEvents(prev => [data.event, ...prev])
      setShowNewEvent(false)
      setForm({ name: '', date: '', location: '', maxGuests: '100', clientName: '', clientEmail: '', brandColor: '#b7e94c' })
      setEventType('ai')
      setGalleryPublic(false)
    } catch {
      setCreateError('Chyba připojení')
    }
    setCreating(false)
  }

  useEffect(() => {
    fetch('/api/photographer/events', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false) })
  }, [])

  // Polling — aktualizuje overlay_approved a overlay_notes každých 30s
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    if (!selectedEvent) return

    overlayApprovedRef.current = overlayApproved

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/photographer/events', { cache: 'no-store' })
        const data = await res.json()
        const fresh = (data.events ?? []).find((e: EventWithStats) => e.id === selectedEvent.id)
        if (!fresh) return

        const newApproved = fresh.overlay_approved ?? false
        const newNotes = fresh.overlay_notes ?? null

        // Toast — jen při přechodu false → true
        if (!overlayApprovedRef.current && newApproved) {
          setOverlayToast(true)
          setTimeout(() => setOverlayToast(false), 4000)
        }

        overlayApprovedRef.current = newApproved
        setOverlayApproved(newApproved)
        setOverlayNotes(newNotes)
        setInfoNotes(fresh.info_notes ?? null)
        setSelectedEvent(prev => prev ? {
          ...prev,
          unmatchedCount: fresh.unmatchedCount ?? prev.unmatchedCount,
          photoCount: fresh.photoCount ?? prev.photoCount,
        } : prev)
        setEvents(prev => prev.map(e => e.id === fresh.id ? { ...e, unmatchedCount: fresh.unmatchedCount, photoCount: fresh.photoCount } : e))
      } catch {
        // polling failure — silent
      }
    }, 30000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [selectedEvent])

  // Fetch + poll unmatched photos while the unmatched tab is active (15 s interval)
  useEffect(() => {
    if (tab !== 'unmatched' || !selectedEvent) return
    const eventId = selectedEvent.id
    let polling = true

    function fetchUnmatched() {
      fetch(`/api/photographer/unmatched?eventId=${eventId}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(d => {
          const photos = d.photos ?? []
          setUnmatched(photos)
          // Ak nie sú žiadne fotky, zastav polling — niet čo sledovať
          if (photos.length === 0) polling = false
        })
        .catch(() => {})
    }

    fetchUnmatched()
    const interval = setInterval(() => {
      if (polling) fetchUnmatched()
    }, 15000)
    return () => clearInterval(interval)
  }, [tab, selectedEvent?.id])                     // dep: id only, avoids loop from setSelectedEvent

  // Fetch gallery photos when galerie tab is active
  useEffect(() => {
    if (tab !== 'galerie' || !selectedEvent) return
    setGalleryLoading(true)
    setSelectedPhotoIds(new Set())

    fetch(`/api/photographer/unmatched?eventId=${selectedEvent.id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        let photos = d.photos ?? []

        // Filtr dle záložky
        if (galleryTab === 'unassigned') {
          photos = photos.filter((p: any) => p.status === 'unmatched')
        } else if (galleryTab === 'by-guest' && selectedGuestFilter !== 'all') {
          // Pro filtr dle hosta načti photo_guests pro daného hosta
          fetch(`/api/photographer/events/${selectedEvent.id}/guests`, { cache: 'no-store' })
            .then(r => r.json())
            .then(gData => {
              const guest = (gData.guests ?? []).find((g: any) => g.id === selectedGuestFilter)
              if (guest) {
                fetch(`/api/gallery/${guest.gallery_token}`, { cache: 'no-store' })
                  .then(r => r.json())
                  .then(gPhotos => {
                    let guestPhotos = (gPhotos.photos ?? []).map((p: any) => ({ ...p, guest_name: guest.name ?? guest.email }))
                    if (gallerySort === 'oldest') guestPhotos = guestPhotos.reverse()
                    setGalleryPhotos(guestPhotos)
                    setGalleryLoading(false)
                  })
              }
            })
          return
        }

        // Sort
        if (gallerySort === 'oldest') photos = [...photos].reverse()

        setGalleryPhotos(photos)
      })
      .catch(() => setGalleryPhotos([]))
      .finally(() => setGalleryLoading(false))
  }, [tab, selectedEvent?.id, galleryTab, gallerySort, selectedGuestFilter])

  // Keyboard navigation for unmatched lightbox
  useEffect(() => {
    if (lightboxIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setLightboxIndex(null); return }
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? Math.min(i + 1, unmatched.length - 1) : null)
      if (e.key === 'ArrowLeft')  setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, unmatched.length])

  async function deleteEvent(ev: EventWithStats) {
    const confirmed = window.confirm(
      `Opravdu smazat "${ev.name}"?\nSmažou se všichni hosté a fotky. Akce je nevratná.`
    )
    if (!confirmed) return
    setDeletingEvent(ev.id)
    try {
      const res = await fetch(`/api/photographer/events/${ev.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Chyba')
      setEvents(prev => prev.filter(e => e.id !== ev.id))
      if (selectedEvent?.id === ev.id) setSelectedEvent(null)
    } catch (e: any) {
      alert(`Nepodařilo se smazat: ${e.message}`)
    } finally {
      setDeletingEvent(null)
    }
  }

  async function saveGuestEmail(guestId: string) {
    const trimmed = editingEmail.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEditingGuestId(null); return
    }
    try {
      const res = await fetch(`/api/photographer/guests/${guestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      if (res.ok) {
        setGuests(prev => prev.map(g => g.id === guestId ? { ...g, email: trimmed } : g))
      }
    } catch {}
    setEditingGuestId(null)
  }

  async function deleteGuest(guestId: string, email: string) {
    if (!confirm(`Zmazať hosta ${email}?\nZmaže sa aj jeho galéria a všetky priradené fotky.`)) return
    try {
      const res = await fetch(`/api/photographer/guests/${guestId}`, { method: 'DELETE' })
      if (res.ok) setGuests(prev => prev.filter(g => g.id !== guestId))
    } catch {}
  }

  async function resendInvite(eventId: string) {
    setSendingInvite(eventId)
    try {
      const res = await fetch(`/api/photographer/events/${eventId}/resend-invite`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setInviteToast('ok')
    } catch {
      setInviteToast('error')
    } finally {
      setSendingInvite(null)
      setTimeout(() => setInviteToast(null), 3000)
    }
  }

  async function selectEvent(event: EventWithStats) {
    setSelectedEvent(event)
    setTab('guests')
    setOverlayPortraitUrl(event.overlay_portrait_url ?? '')
    setOverlayLandscapeUrl(event.overlay_landscape_url ?? '')
    setOverlayStatus((event.overlay_status as 'approved' | 'pending_client' | null) ?? null)
    setOverlayApproved(event.overlay_approved ?? false)
    setOverlayNotes(event.overlay_notes ?? null)
    setOverlayMode((event.overlay_mode as 'custom' | 'piclio' | 'none') ?? 'none')
    setInfoNotes((event as any).info_notes ?? null)
    setEmailLogoUrl((event as any).client_logo_url ?? '')
    setEmailBannerUrl((event as any).email_banner_url ?? '')
    setEmailBrandColor((event as any).brand_color ?? '#b7e94c')
    setEmailBtnTextColor((event as any).email_btn_text_color ?? '#1a1225')
    setEmailHeaderColor((event as any).email_header_color ?? '#1a1225')
    setEmailSubject((event as any).email_subject ?? '')
    setEmailBody((event as any).email_body ?? '')
    setEmailLogoFile(null)
    setEmailBannerFile(null)
    setEmailSettingsMsg('')
    setProjectForm({
      name: event.name ?? '',
      date: event.date ? event.date.slice(0, 16) : '',
      location: event.location ?? '',
      maxGuests: String(event.max_guests ?? ''),
      description: (event as any).description ?? '',
      photographerNotes: (event as any).photographer_notes ?? '',
      eventCategory: (event as any).event_category ?? '',
      slideshowWelcomeText: (event as any).slideshow_welcome_text ?? '',
    })
    setSlideshowContent((event as any).slideshow_content ?? 'random')
    setSlideshowSelectedGuests((event as any).slideshow_selected_guests ?? [])
    setSlideshowOutput((event as any).slideshow_output ?? 'slideshow')
    setSlideshowInterval((event as any).slideshow_interval ?? 5)
    setSlideshowAnimation((event as any).slideshow_animation ?? 'fade')
    setSlideshowLayout((event as any).slideshow_layout ?? 'single')
    setSlideshowMsg('')
    setSelectedUnmatched(new Set())
    const [gRes, uRes] = await Promise.all([
      fetch(`/api/photographer/events/${event.id}/guests`, { cache: 'no-store' }),
      fetch(`/api/photographer/unmatched?eventId=${event.id}`, { cache: 'no-store' }),
    ])
    const [gData, uData] = await Promise.all([gRes.json(), uRes.json()])
    setGuests(gData.guests ?? [])
    setUnmatched(uData.photos ?? [])

    const actualUnmatched = uData.photos ?? []
    setUnmatched(actualUnmatched)
    // NEPREPISUJ unmatchedCount — bere se z events API které má správné číslo
  }

  async function deleteUnmatchedPhoto(photoId: string) {
    const confirmed = window.confirm('Opravdu smazat tuto nespárovanou fotku? Akce je nevratná.')
    if (!confirmed) return
    const res = await fetch(`/api/photographer/unmatched/${photoId}`, { method: 'DELETE' })
    if (res.ok) {
      setUnmatched(prev => prev.filter(p => p.id !== photoId))
      setSelectedEvent(prev => prev ? { ...prev, unmatchedCount: Math.max(0, prev.unmatchedCount - 1) } : prev)
      setLightboxIndex(null)
      // Znovu načti nespárované ze serveru (respektuje deleted_photos filtr)
      if (selectedEvent) {
        const r = await fetch(`/api/photographer/unmatched?eventId=${selectedEvent.id}`)
        const d = await r.json()
        setUnmatched(d.photos ?? [])
      }
    } else {
      alert('Nepodařilo se smazat fotku.')
    }
  }

  async function deleteBulkUnmatched() {
    if (selectedUnmatched.size === 0) return
    const confirmed = window.confirm(`Opravdu smazat ${selectedUnmatched.size} fotek? Akce je nevratná.`)
    if (!confirmed) return
    const deletedCount = selectedUnmatched.size
    setDeletingBulk(true)
    const ids = Array.from(selectedUnmatched)
    await Promise.all(ids.map(id =>
      fetch(`/api/photographer/unmatched/${id}`, { method: 'DELETE' })
    ))
    setSelectedUnmatched(new Set())
    if (selectedEvent) {
      const r = await fetch(`/api/photographer/unmatched?eventId=${selectedEvent.id}`)
      const d = await r.json()
      const newUnmatched = d.photos ?? []
      setUnmatched(newUnmatched)
      // Aktualizuj počítadla — unmatchedCount ze serveru, photoCount odečti smazané
      setSelectedEvent(prev => prev ? {
        ...prev,
        unmatchedCount: newUnmatched.filter((p: any) => p.status === 'unmatched').length,
        photoCount: Math.max(0, prev.photoCount - deletedCount),
      } : prev)
    }
    setDeletingBulk(false)
  }

  async function saveOverlayMode(mode: 'custom' | 'piclio' | 'none') {
    if (!selectedEvent) return
    setOverlayMode(mode)
    setSavingOverlayMode(true)
    await fetch('/api/photographer/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedEvent.id, overlayMode: mode }),
    })
    setSavingOverlayMode(false)
  }

  async function assignPhoto(photoId: string) {
    const guestId = assignTarget[photoId]
    if (!guestId) return
    setAssigningPhoto(photoId)
    const res = await fetch('/api/photographer/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId, guestId }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(`Přiřazení selhalo: ${err.error ?? res.status}`)
      setAssigningPhoto(null)
      return
    }
    setUnmatched(prev => prev.filter(p => p.id !== photoId))
    setSelectedEvent(prev => prev ? { ...prev, unmatchedCount: Math.max(0, prev.unmatchedCount - 1) } : prev)
    setGuests(prev => prev.map(g =>
      g.id === guestId ? { ...g, photo_count: g.photo_count + 1 } : g
    ))
    setAssigningPhoto(null)
    setAssignTarget(prev => { const n = { ...prev }; delete n[photoId]; return n })
    // Reload pouze hostů a unmatched — ne celý events list (pomalé při 200 hostech)
    if (selectedEvent) {
      const [gRes, uRes] = await Promise.all([
        fetch(`/api/photographer/events/${selectedEvent.id}/guests`, { cache: 'no-store' }),
        fetch(`/api/photographer/unmatched?eventId=${selectedEvent.id}`, { cache: 'no-store' }),
      ])
      const [gData, uData] = await Promise.all([gRes.json(), uRes.json()])
      setGuests(gData.guests ?? [])
      setUnmatched(uData.photos ?? [])
      const newUnmatchedCount = uData.photos?.length ?? 0
      setSelectedEvent(prev => prev ? { ...prev, unmatchedCount: newUnmatchedCount } : prev)
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, unmatchedCount: newUnmatchedCount } : e))
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#9ca3af' }}>Načítám…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Nav */}
      <div style={{
        background: '#111827', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '0 24px', height: 56,
      }}>
        <Logo dark={false} size="sm" />
        <span style={{ fontSize: 13, opacity: 0.5, marginLeft: 8 }}>Dashboard fotografa</span>
        <div style={{ flex: 1 }} />
        <a
          href="/api/photographer/auth/logout"
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
        >
          Odhlásit
        </a>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        {/* Event list */}
        {!selectedEvent ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
                Události
              </h1>
              <button
                onClick={() => { setShowNewEvent(true); setCreateError('') }}
                style={{
                  background: '#b7e94c', color: '#1a1225', border: 'none',
                  borderRadius: 10, padding: '9px 18px', fontWeight: 700,
                  fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span> Nový event
              </button>
            </div>
            {events.length === 0 ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: 60 }}>Žádné události</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.map(event => (
                  <div
                    key={event.id}
                    onClick={() => selectEvent(event)}
                    style={{
                      background: '#fff', borderRadius: 12,
                      padding: '18px 22px', cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      display: 'flex', alignItems: 'center', gap: 20,
                      transition: 'box-shadow 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {event.name}
                        {event.event_type === 'simple' && (
                          <span style={{ fontSize: 10, background: 'rgba(183,233,76,0.15)', color: '#5a7a00', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>GALERIE</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
                        {new Date(event.date).toLocaleDateString('cs-CZ')}
                        {event.location ? ` · ${event.location}` : ''}
                        {event.client_name ? ` · ${event.client_name}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <Stat label="Hosté" value={event.guestCount} />
                      <Stat label="Fotky" value={event.photoCount} />
                      <Stat label="Bez galerie" value={event.unmatchedCount} warn={event.unmatchedCount > 0} />
                      <Stat label="Doručeno" value={event.deliveredCount} />
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(`${APP_URL}/kiosk/${event.slug}`)
                          .then(() => alert(`Zkopírováno: /kiosk/${event.slug}`))
                      }}
                      title={`${APP_URL}/kiosk/${event.slug}`}
                      style={{
                        background: '#f3f4f6', border: '1px solid #e5e7eb',
                        borderRadius: 8, padding: '6px 12px', fontSize: 12,
                        fontWeight: 600, color: '#374151', cursor: 'pointer',
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}
                    >
                      Kiosk URL
                    </button>
                    {event.client_email && (
                      <button
                        onClick={e => { e.stopPropagation(); resendInvite(event.id) }}
                        disabled={sendingInvite === event.id}
                        title={`Odeslat pozvánku znovu na ${event.client_email}`}
                        style={{
                          background: '#f3f4f6', border: '1px solid #e5e7eb',
                          borderRadius: 8, padding: '6px 10px', fontSize: 13,
                          color: sendingInvite === event.id ? '#9ca3af' : '#374151',
                          cursor: sendingInvite === event.id ? 'not-allowed' : 'pointer',
                          flexShrink: 0, whiteSpace: 'nowrap',
                        }}
                      >
                        {sendingInvite === event.id ? '…' : '✉'}
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); openEdit(event) }}
                      title="Upravit event"
                      style={{
                        background: 'transparent', border: '1px solid #e5e7eb',
                        borderRadius: 8, padding: '6px 10px', fontSize: 14,
                        color: '#6b7280', cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteEvent(event) }}
                      disabled={deletingEvent === event.id}
                      title="Smazat event"
                      style={{
                        background: '#fee2e2', border: '1px solid #fecaca',
                        borderRadius: 6, padding: '6px 10px', fontSize: 14,
                        color: '#dc2626', cursor: deletingEvent === event.id ? 'not-allowed' : 'pointer',
                        flexShrink: 0, opacity: deletingEvent === event.id ? 0.5 : 1,
                      }}
                    >
                      🗑️
                    </button>
                    <div style={{ color: '#9ca3af', fontSize: 20 }}>›</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Back + tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14 }}
              >
                ← Zpět
              </button>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', flex: 1 }}>
                {selectedEvent.name}
              </h1>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
              <StatCard label="Hosté" value={selectedEvent.guestCount} />
              <StatCard label="Fotky celkem" value={selectedEvent.photoCount} />
              <StatCard label="Bez galerie" value={selectedEvent.unmatchedCount} />
              <StatCard label="Doručeno" value={selectedEvent.deliveredCount} />
            </div>

            {/* Tab nav */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
              {([
                { key: 'guests',   label: `Hosté (${guests.length})` },
                { key: 'unmatched', label: `Fotky z eventu (${selectedEvent?.photoCount ?? 0})` },
                { key: 'upload',   label: uploadedCount > 0 ? `Nahrát fotky (${uploadedCount})` : 'Nahrát fotky' },
                { key: 'project',  label: 'O projektu' },
                { key: 'settings', label: 'Nastavení' },
              ] as { key: Tab; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setTab(key)
                    if (key === 'unmatched' && selectedEvent) {
                      fetch(`/api/photographer/unmatched?eventId=${selectedEvent.id}`, { cache: 'no-store' })
                        .then(r => r.json())
                        .then(d => setUnmatched(d.photos ?? []))
                        .catch(() => {})
                    }
                  }}
                  style={{
                    padding: '7px 16px', borderRadius: 8, border: 'none',
                    cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    background: tab === key ? '#111827' : '#e5e7eb',
                    color: tab === key ? '#fff' : '#374151',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Guests tab */}
            {tab === 'guests' && (
              <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['#', 'Jméno', 'E-mail', 'Fotky', 'Doručeno', 'Galerie', 'Akce'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px 16px', color: '#9ca3af' }}>{g.badge_number ?? '—'}</td>
                        <td style={{ padding: '10px 16px', fontWeight: 500 }}>{g.name ?? '—'}</td>
                        <td style={{ padding: '10px 16px', color: '#6b7280' }}>
                          {editingGuestId === g.id ? (
                            <input
                              autoFocus
                              value={editingEmail}
                              onChange={e => setEditingEmail(e.target.value)}
                              onBlur={() => saveGuestEmail(g.id)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveGuestEmail(g.id)
                                if (e.key === 'Escape') setEditingGuestId(null)
                              }}
                              style={{
                                border: '1px solid #d1d5db', borderRadius: 6, padding: '2px 8px',
                                fontSize: 14, color: '#111827', outline: 'none', width: '100%', minWidth: 180,
                              }}
                            />
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              {g.email}
                              <button
                                onClick={() => { setEditingGuestId(g.id); setEditingEmail(g.email) }}
                                title="Upravit e-mail"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#9ca3af' }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 16px' }}>{g.photo_count}</td>
                        <td style={{ padding: '10px 16px' }}>
                          {g.email_sent_at
                            ? <span style={{ color: '#16a34a', fontSize: 12 }}>✓ {new Date(g.email_sent_at).toLocaleDateString('cs-CZ')}</span>
                            : <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          {g.gallery_token
                            ? <a href={`/gallery/${g.gallery_token}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Otevřít →</a>
                            : <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <button
                            onClick={() => deleteGuest(g.id, g.email)}
                            title="Zmazať hosta"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ef4444' }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Unmatched tab */}
            {tab === 'unmatched' && (
              <div>
                {unmatched.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Všechny fotky jsou spárovány ✓</div>
                ) : (
                  <>
                    <style>{`
                      .unmatched-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                      }
                      @media (max-width: 600px) {
                        .unmatched-grid { grid-template-columns: repeat(2, 1fr); }
                      }
                    `}</style>
                    {/* Bulk toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={selectedUnmatched.size === unmatched.length && unmatched.length > 0}
                          onChange={e => {
                            if (e.target.checked) setSelectedUnmatched(new Set(unmatched.map(p => p.id)))
                            else setSelectedUnmatched(new Set())
                          }}
                          style={{ width: 15, height: 15, cursor: 'pointer' }}
                        />
                        Vybrat vše
                      </label>
                      {selectedUnmatched.size > 0 && (
                        <>
                          <span style={{ fontSize: 13, color: '#6b7280' }}>Vybráno: {selectedUnmatched.size}</span>
                          <button
                            onClick={deleteBulkUnmatched}
                            disabled={deletingBulk}
                            style={{
                              background: deletingBulk ? '#e5e7eb' : '#dc2626', color: '#fff',
                              border: 'none', borderRadius: 7, padding: '6px 14px',
                              fontSize: 13, fontWeight: 600, cursor: deletingBulk ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {deletingBulk ? 'Mažu…' : `🗑 Smazat ${selectedUnmatched.size} fotek`}
                          </button>
                          <button
                            onClick={() => setSelectedUnmatched(new Set())}
                            style={{
                              background: 'transparent', border: '1px solid #d1d5db',
                              borderRadius: 7, padding: '6px 12px', fontSize: 13,
                              color: '#6b7280', cursor: 'pointer',
                            }}
                          >
                            Zrušit výběr
                          </button>
                        </>
                      )}
                    </div>
                    <div className="unmatched-grid">
                      {unmatched.map((photo, idx) => (
                        <div
                          key={photo.id}
                          data-photo-id={photo.id}
                          style={{
                            background: '#fff', borderRadius: 10, overflow: 'hidden',
                            boxShadow: selectedUnmatched.has(photo.id) ? '0 0 0 2px #b7e94c' : '0 1px 4px rgba(0,0,0,0.06)',
                          }}
                        >
                          {/* Thumbnail */}
                          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', background: '#f3f4f6' }}>
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={selectedUnmatched.has(photo.id)}
                              onChange={e => {
                                e.stopPropagation()
                                setSelectedUnmatched(prev => {
                                  const next = new Set(prev)
                                  if (e.target.checked) next.add(photo.id)
                                  else next.delete(photo.id)
                                  return next
                                })
                              }}
                              onClick={e => e.stopPropagation()}
                              style={{
                                position: 'absolute', top: 8, left: 8,
                                width: 16, height: 16, cursor: 'pointer', zIndex: 2,
                              }}
                            />
                            {photo.status === 'unmatched' && (
                              <div style={{
                                position: 'absolute', top: 6, left: 6,
                                background: '#f59e0b', color: '#fff',
                                fontSize: 10, fontWeight: 700,
                                padding: '2px 6px', borderRadius: 4,
                                zIndex: 10,
                              }}>
                                Bez galerie
                              </div>
                            )}
                            <img
                              src={photo.url}
                              alt={photo.filename}
                              onClick={() => setLightboxIndex(idx)}
                              onError={e => {
                                console.error('[unmatched img error]', photo.filename, '|', photo.url, '|', e.type)
                                const card = (e.target as HTMLElement).closest('[data-photo-id]') as HTMLElement
                                if (card) card.style.display = 'none'
                              }}
                              style={{ maxHeight: 220, maxWidth: '100%', width: 'auto', height: 'auto', display: 'block', cursor: 'zoom-in' }}
                            />
                            {/* Trash button */}
                            <button
                              onClick={e => { e.stopPropagation(); deleteUnmatchedPhoto(photo.id) }}
                              title="Smazat fotku"
                              style={{
                                position: 'absolute', top: 6, right: 6,
                                background: 'rgba(220,38,38,0.85)', color: '#fff',
                                border: 'none', borderRadius: 6, width: 26, height: 26,
                                fontSize: 13, cursor: 'pointer', lineHeight: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              🗑
                            </button>
                          </div>
                          {/* Controls */}
                          <div style={{ padding: '8px 10px' }}>
                            <select
                              value={assignTarget[photo.id] ?? ''}
                              onChange={e => setAssignTarget(prev => ({ ...prev, [photo.id]: e.target.value }))}
                              style={{
                                width: '100%', padding: '5px 6px', borderRadius: 6,
                                border: '1px solid #d1d5db', fontSize: 12, marginBottom: 6,
                              }}
                            >
                              <option value="">Vybrat hosta…</option>
                              {guests.map(g => (
                                <option key={g.id} value={g.id}>
                                  {g.badge_number ? `#${g.badge_number} ` : ''}{g.name ?? g.email}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => assignPhoto(photo.id)}
                              disabled={!assignTarget[photo.id] || assigningPhoto === photo.id}
                              style={{
                                width: '100%', background: '#111827', color: '#fff',
                                border: 'none', borderRadius: 6, padding: '5px',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                opacity: !assignTarget[photo.id] ? 0.4 : 1,
                              }}
                            >
                              {assigningPhoto === photo.id ? 'Přiřazuji…' : 'Přiřadit'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Settings tab */}
            {tab === 'settings' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

    {[
      { key: 'podklady', title: 'Podklady od zadavatele', icon: '📁' },
      { key: 'email', title: 'Nastavení emailu pro hosty', icon: '✉️' },
      { key: 'grafika-fotky', title: 'Grafika pro fotky', icon: '🖼️' },
      { key: 'grafika-projekce', title: 'Grafika pro galerii / slideshow', icon: '📽️' },
      { key: 'poznamky', title: 'Poznámky od zadavatele a schválení', icon: '✅' },
      { key: 'danger', title: 'Nebezpečná zóna', icon: '⚠️' },
    ].map(({ key, title, icon }) => (
      <div key={key} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <button
          onClick={() => toggleSection(key)}
          style={{
            width: '100%', padding: '16px 24px', background: 'none', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', textAlign: 'left' as const,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</span>
          </div>
          <span style={{ fontSize: 18, color: '#9ca3af', transform: openSections.has(key) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
        </button>

        {openSections.has(key) && (
          <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f3f4f6' }}>

            {/* PODKLADY OD ZADAVATELE */}
            {key === 'podklady' && (
              <div style={{ paddingTop: 16 }}>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
                  Logo a brand barva eventu. Nahráno fotografem, zadavatel potvrdí platnost ve svém dashboardu.
                </p>

                {/* Logo */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>Logo klienta / firmy</div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div
                      onClick={() => document.getElementById('client-logo-input')?.click()}
                      style={{ border: '2px dashed #d1d5db', borderRadius: 10, padding: '14px 20px', cursor: 'pointer', textAlign: 'center' as const, background: '#fafafa', minWidth: 160 }}
                    >
                      {selectedEvent?.client_logo_url ? (
                        <img src={selectedEvent.client_logo_url} alt="" style={{ maxHeight: 60, maxWidth: 160, objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} />
                      ) : (
                        <div style={{ fontSize: 22, marginBottom: 4 }}>🖼</div>
                      )}
                      <div style={{ fontSize: 12, color: '#6b7280' }}>PNG nebo SVG · průhledné<br/>doporučeno 400 × 120 px</div>
                    </div>
                    <input id="client-logo-input" type="file" accept="image/png,image/svg+xml,image/jpeg" style={{ display: 'none' }}
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file || !selectedEvent) return
                        const form = new FormData()
                        form.append('logo', file)
                        const res = await fetch(`/api/client/${selectedEvent.slug}/branding`, { method: 'PUT', body: form })
                        const data = await res.json()
                        if (data.client_logo_url) {
                          setSelectedEvent(prev => prev ? { ...prev, client_logo_url: data.client_logo_url } : prev)
                        }
                      }}
                    />
                    {selectedEvent?.client_logo_url && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <a href={selectedEvent.client_logo_url} download style={{ background: '#111827', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600 }}>↓ Stáhnout</a>
                        <button onClick={async () => {
                          if (!selectedEvent) return
                          await fetch('/api/photographer/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedEvent.id, clientLogoUrl: null }) })
                          setSelectedEvent(prev => prev ? { ...prev, client_logo_url: '' } : prev)
                        }} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>Odebrat</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand barva */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>Brand barva</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' as const }}>
                    {['#b7e94c', '#1a1225', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#000000', '#ffffff'].map(c => (
                      <button key={c} onClick={async () => {
                        if (!selectedEvent) return
                        await fetch('/api/photographer/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedEvent.id, brandColor: c }) })
                        setSelectedEvent(prev => prev ? { ...prev, brand_color: c } : prev)
                      }} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: selectedEvent?.brand_color === c ? '3px solid #111827' : '2px solid #e5e7eb', cursor: 'pointer', flexShrink: 0, boxShadow: selectedEvent?.brand_color === c ? '0 0 0 2px #fff inset' : 'none' }} />
                    ))}
                    <input type="color" value={selectedEvent?.brand_color ?? '#b7e94c'}
                      onChange={async e => {
                        if (!selectedEvent) return
                        const c = e.target.value
                        await fetch('/api/photographer/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedEvent.id, brandColor: c }) })
                        setSelectedEvent(prev => prev ? { ...prev, brand_color: c } : prev)
                      }}
                      style={{ width: 32, height: 32, border: '1px solid #d1d5db', borderRadius: '50%', padding: 2, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#374151' }}>{selectedEvent?.brand_color ?? '#b7e94c'}</span>
                  </div>
                </div>

                {/* Náhled */}
                {selectedEvent?.client_logo_url && (
                  <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={selectedEvent.client_logo_url} alt="" style={{ height: 32, objectFit: 'contain', maxWidth: 120 }} />
                    {selectedEvent.brand_color && (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: selectedEvent.brand_color, border: '1px solid rgba(0,0,0,0.1)' }} />
                    )}
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Náhled kombinace loga a barvy</span>
                  </div>
                )}
              </div>
            )}

            {/* NASTAVENÍ EMAILU */}
            {key === 'email' && (
              <div style={{ paddingTop: 16 }}>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
                  Přizpůsobte email, který hosté obdrží s odkazem na svou galerii.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <div style={emailLabelStyle}>Logo klienta / firmy</div>
                      <div onClick={() => emailLogoRef.current?.click()} style={{ border: '2px dashed #d1d5db', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', textAlign: 'center' as const, background: '#fafafa' }}>
                        {emailLogoUrl ? <img src={emailLogoUrl} alt="" style={{ maxHeight: 56, maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} /> : <div style={{ fontSize: 22, marginBottom: 4 }}>🖼</div>}
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{emailLogoFile ? emailLogoFile.name : 'PNG nebo SVG, průhledné · doporučeno 400 × 120 px'}</div>
                      </div>
                      <input ref={emailLogoRef} type="file" accept="image/png,image/svg+xml" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setEmailLogoFile(f); setEmailLogoUrl(URL.createObjectURL(f)) } }} />
                    </div>
                    <div>
                      <div style={emailLabelStyle}>Grafika hlavičky emailu</div>
                      <div onClick={() => emailBannerRef.current?.click()} style={{ border: '2px dashed #d1d5db', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', textAlign: 'center' as const, background: '#fafafa' }}>
                        {emailBannerUrl ? <img src={emailBannerUrl} alt="" style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'cover', borderRadius: 6, display: 'block', margin: '0 auto 8px' }} /> : <div style={{ fontSize: 22, marginBottom: 4 }}>🎨</div>}
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{emailBannerFile ? emailBannerFile.name : 'Banner eventu · 1200 × 400 px · JPG nebo PNG'}</div>
                      </div>
                      <input ref={emailBannerRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setEmailBannerFile(f); setEmailBannerUrl(URL.createObjectURL(f)) } }} />
                    </div>
                    <div>
                      <div style={emailLabelStyle}>Akcentní barva eventu / firmy</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
                        {['#b7e94c', '#1a1225', '#60a5fa', '#f59e0b', '#f472b6', '#e11d48'].map(c => (
                          <button key={c} onClick={() => setEmailBrandColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', outline: emailBrandColor === c ? `3px solid ${c}` : 'none', outlineOffset: 2, boxShadow: emailBrandColor === c ? '0 0 0 2px #fff' : 'none' }} />
                        ))}
                        <input type="color" value={emailBrandColor} onChange={e => setEmailBrandColor(e.target.value)} style={{ width: 28, height: 28, border: '1px solid #d1d5db', borderRadius: '50%', padding: 2, cursor: 'pointer' }} />
                        <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#374151' }}>{emailBrandColor}</span>
                      </div>
                    </div>
                    <div>
                      <div style={emailLabelStyle}>Barva textu tlačítka</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={emailBtnTextColor} onChange={e => setEmailBtnTextColor(e.target.value)} style={{ width: 28, height: 28, border: '1px solid #d1d5db', borderRadius: '50%', padding: 2, cursor: 'pointer' }} />
                        <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#374151' }}>{emailBtnTextColor}</span>
                      </div>
                    </div>
                    <div>
                      <div style={emailLabelStyle}>Barva pozadí hlavičky</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={emailHeaderColor} onChange={e => setEmailHeaderColor(e.target.value)} style={{ width: 28, height: 28, border: '1px solid #d1d5db', borderRadius: '50%', padding: 2, cursor: 'pointer' }} />
                        <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#374151' }}>{emailHeaderColor}</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f3f4f6' }} />
                    <div>
                      <label style={emailLabelStyle}>Předmět emailu</label>
                      <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Vaše fotografie z akce {{event_name}} jsou připraveny" style={{ width: '100%', boxSizing: 'border-box' as const, padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={emailLabelStyle}>Tělo emailu</label>
                      <textarea rows={4} value={emailBody} onChange={e => setEmailBody(e.target.value)} placeholder={'Dobrý den,\npřipravili jsme pro vás fotografie z akce {{event_name}}.\n\nKlikněte na odkaz níže a prohlédněte si svoji galerii.'} style={{ width: '100%', boxSizing: 'border-box' as const, padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', resize: 'vertical' as const }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}>Dostupné proměnné</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                        {['{{event_name}}', '{{gallery_link}}', '{{guest_name}}', '{{photo_count}}'].map(v => (
                          <code key={v} style={{ fontSize: 11, background: '#f3f4f6', padding: '3px 8px', borderRadius: 6, color: '#374151', cursor: 'pointer' }} onClick={() => setEmailBody(prev => prev + v)}>{v}</code>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={emailLabelStyle}>Náhled emailu</div>
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', fontSize: 13, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <div style={{ background: emailHeaderColor, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 56 }}>
                        {emailLogoUrl ? <img src={emailLogoUrl} alt="" style={{ maxHeight: 36, maxWidth: 160, objectFit: 'contain' }} /> : <span style={{ color: '#b7e94c', fontWeight: 700, fontSize: 16 }}>Piclio</span>}
                      </div>
                      <div style={{ height: 4, background: emailBrandColor }} />
                      {emailBannerUrl ? <img src={emailBannerUrl} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} /> : <div style={{ height: 60, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 11, color: '#9ca3af' }}>banner · 1200 × 400 px</span></div>}
                      <div style={{ padding: '16px 20px', background: '#fff' }}>
                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600 }}>Předmět</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 14 }}>{(emailSubject || 'Vaše fotografie z akce {{event_name}} jsou připraveny').replace(/\{\{event_name\}\}/g, selectedEvent?.name ?? 'Název akce').replace(/\{\{guest_name\}\}/g, 'Jan Novák').replace(/\{\{photo_count\}\}/g, '12')}</div>
                        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const, marginBottom: 16 }}>{(emailBody || 'Dobrý den,\npřipravili jsme pro vás fotografie z akce {{event_name}}.\n\nKlikněte na odkaz níže a prohlédněte si svoji galerii.').replace(/\{\{event_name\}\}/g, selectedEvent?.name ?? 'Název akce').replace(/\{\{guest_name\}\}/g, 'Jan Novák').replace(/\{\{photo_count\}\}/g, '12').replace(/\{\{gallery_link\}\}/g, 'https://piclio.cz/gallery/...')}</div>
                        <a href="#" onClick={e => e.preventDefault()} style={{ display: 'block', background: emailBrandColor, color: emailBtnTextColor, textDecoration: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, textAlign: 'center' as const, fontSize: 13 }}>Otevřít galerii →</a>
                      </div>
                      <div style={{ padding: '10px 20px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', fontSize: 11, color: '#9ca3af', textAlign: 'center' as const }}>Piclio by Lucifera Studio</div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
                  <button onClick={saveEmailSettings} disabled={savingEmailSettings} style={{ background: savingEmailSettings ? '#e5e7eb' : '#b7e94c', color: savingEmailSettings ? '#9ca3af' : '#1a1225', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: savingEmailSettings ? 'not-allowed' : 'pointer' }}>
                    {savingEmailSettings ? 'Ukládám…' : 'Uložit nastavení emailu'}
                  </button>
                  {emailSettingsMsg && <span style={{ fontSize: 13, color: emailSettingsMsg.startsWith('✓') ? '#16a34a' : '#dc2626' }}>{emailSettingsMsg}</span>}
                </div>
              </div>
            )}

            {/* GRAFIKA PRO FOTKY */}
            {key === 'grafika-fotky' && (
              <div style={{ paddingTop: 16 }}>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>Zvolte režim a nahrajte PNG grafiku vrstvenu přes fotografie hostů.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {([
                    { value: 'custom' as const, icon: '🖼', label: 'Vlastní grafika', desc: 'Logo a grafika klienta nasazená na fotky' },
                    { value: 'piclio' as const, icon: '💧', label: 'Piclio watermark', desc: 'Malé Piclio logo vlevo nahoře' },
                    { value: 'none' as const, icon: '✕', label: 'Bez grafiky', desc: 'Čisté fotky, host dostane originál' },
                  ] as const).map(opt => (
                    <div key={opt.value} onClick={() => saveOverlayMode(opt.value)} style={{ border: overlayMode === opt.value ? '2px solid #b7e94c' : '1.5px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', background: overlayMode === opt.value ? '#f9ffe6' : '#fafafa' }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{opt.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{opt.desc}</div>
                      {overlayMode === opt.value && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: '#4d7c0f', background: '#ecfccb', borderRadius: 4, padding: '2px 7px', display: 'inline-block' }}>Aktivní</div>}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>Nahrajte PNG soubory pro každou orientaci fotky.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <OverlayZone label="Portrét" description="PNG · poměr 2 : 3 · min 1000 × 1500 px · max 8 MB" aspectLabel="2:3" value={overlayPortrait} savedUrl={overlayPortraitUrl} error={overlayPortraitError} onChange={e => handleOverlaySelect('portrait', e)} onRemove={async () => { setOverlayPortrait(null); setOverlayPortraitError(''); setOverlayPortraitUrl(''); if (selectedEvent) await fetch('/api/photographer/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedEvent.id, overlayPortraitUrl: null }) }) }} onExpand={() => setOverlayFullscreen('portrait')} />
                    {!overlayPortraitUrl && <button onClick={() => handleOverlayUpload('portrait')} disabled={!overlayPortrait || !!overlayPortraitError || overlayPortraitUploading} style={{ background: overlayPortrait && !overlayPortraitError ? '#b7e94c' : '#e5e7eb', color: overlayPortrait && !overlayPortraitError ? '#1a1225' : '#9ca3af', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: overlayPortrait && !overlayPortraitError ? 'pointer' : 'not-allowed' }}>{overlayPortraitUploading ? 'Nahrávám…' : 'Nahrát do Piclio'}</button>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <OverlayZone label="Krajina" description="PNG · poměr 3 : 2 · min 1500 × 1000 px · max 8 MB" aspectLabel="3:2" value={overlayLandscape} savedUrl={overlayLandscapeUrl} error={overlayLandscapeError} onChange={e => handleOverlaySelect('landscape', e)} onRemove={async () => { setOverlayLandscape(null); setOverlayLandscapeError(''); setOverlayLandscapeUrl(''); if (selectedEvent) await fetch('/api/photographer/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedEvent.id, overlayLandscapeUrl: null }) }) }} onExpand={() => setOverlayFullscreen('landscape')} />
                    {!overlayLandscapeUrl && <button onClick={() => handleOverlayUpload('landscape')} disabled={!overlayLandscape || !!overlayLandscapeError || overlayLandscapeUploading} style={{ background: overlayLandscape && !overlayLandscapeError ? '#b7e94c' : '#e5e7eb', color: overlayLandscape && !overlayLandscapeError ? '#1a1225' : '#9ca3af', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: overlayLandscape && !overlayLandscapeError ? 'pointer' : 'not-allowed' }}>{overlayLandscapeUploading ? 'Nahrávám…' : 'Nahrát do Piclio'}</button>}
                  </div>
                </div>
              </div>
            )}

            {/* GRAFIKA PRO PROJEKCI */}
            {key === 'grafika-projekce' && (
              <div style={{ paddingTop: 16 }}>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>Vizuální styl slideshow a galerie — pozadí, lišta, logo.</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Pozadí slideshow</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {([['dark', '⬛ Tmavé'], ['light', '⬜ Světlé'], ['brand', '🎨 Barva klienta']] as const).map(([val, label]) => (
                      <button key={val}
                        onClick={() => {
                          fetch('/api/photographer/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedEvent?.id, slideshowBg: val }) })
                          setSelectedEvent(prev => prev ? { ...prev, slideshow_bg: val } : prev)
                        }}
                        style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500, background: (selectedEvent as any)?.slideshow_bg === val ? '#111827' : '#f3f4f6', color: (selectedEvent as any)?.slideshow_bg === val ? '#fff' : '#374151', border: (selectedEvent as any)?.slideshow_bg === val ? 'none' : '1px solid #e5e7eb' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                    <input type="checkbox"
                      checked={(selectedEvent as any)?.slideshow_bar_enabled ?? false}
                      onChange={e => {
                        fetch('/api/photographer/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedEvent?.id, slideshowBarEnabled: e.target.checked }) })
                        setSelectedEvent(prev => prev ? { ...prev, slideshow_bar_enabled: e.target.checked } : prev)
                      }}
                    />
                    Zobrazit horní lištu s logem klienta a názvem eventu
                  </label>
                </div>
                {(selectedEvent as any)?.slideshow_bar_enabled && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Barva lišty</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                      {([['transparent', '⬜ Průhledná'], ['brand', '🎨 Barva klienta'], ['#000000', '⬛ Černá'], ['#ffffff', '⬜ Bílá']] as const).map(([val, label]) => (
                        <button key={val}
                          onClick={() => {
                            fetch('/api/photographer/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedEvent?.id, slideshowBarColor: val }) })
                            setSelectedEvent(prev => prev ? { ...prev, slideshow_bar_color: val } : prev)
                          }}
                          style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: (selectedEvent as any)?.slideshow_bar_color === val ? '#111827' : '#f3f4f6', color: (selectedEvent as any)?.slideshow_bar_color === val ? '#fff' : '#374151', border: (selectedEvent as any)?.slideshow_bar_color === val ? 'none' : '1px solid #e5e7eb' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>PNG overlay pro slideshow</div>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>
                    Grafika vrstvená pod nebo přes fotky během projekce. Formát 16:9, min 1920 × 1080 px.
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {([['under', 'Pod fotky'], ['over', 'Přes fotky'], ['none', 'Bez grafiky']] as const).map(([val, label]) => (
                      <button key={val}
                        onClick={() => {
                          fetch('/api/photographer/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedEvent?.id, slideshowOverlayMode: val }) })
                          setSelectedEvent(prev => prev ? { ...prev, slideshow_overlay_mode: val } : prev)
                        }}
                        style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 500, background: (selectedEvent as any)?.slideshow_overlay_mode === val ? '#111827' : '#f3f4f6', color: (selectedEvent as any)?.slideshow_overlay_mode === val ? '#fff' : '#374151', border: (selectedEvent as any)?.slideshow_overlay_mode === val ? 'none' : '1px solid #e5e7eb' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div style={{ border: '2px dashed #d1d5db', borderRadius: 10, padding: '20px', textAlign: 'center' as const, background: '#fafafa', cursor: 'pointer' }}
                    onClick={() => document.getElementById('slideshow-overlay-input')?.click()}>
                    {(selectedEvent as any)?.slideshow_overlay_url ? (
                      <div>
                        <img src={(selectedEvent as any).slideshow_overlay_url} alt="overlay" style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain', marginBottom: 8 }} />
                        <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ Overlay nahraný</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>📽️</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Klikněte pro výběr PNG souboru</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>PNG · 16:9 · min 1920 × 1080 px · max 10 MB</div>
                      </div>
                    )}
                  </div>
                  <input id="slideshow-overlay-input" type="file" accept="image/png" style={{ display: 'none' }}
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file || !selectedEvent) return
                      const form = new FormData()
                      form.append('slideshow_overlay', file)
                      form.append('event_id', selectedEvent.id)
                      const res = await fetch(`/api/client/${selectedEvent.slug}/branding`, { method: 'PUT', body: form })
                      const data = await res.json()
                      if (data.slideshow_overlay_url) {
                        setSelectedEvent(prev => prev ? { ...prev, slideshow_overlay_url: data.slideshow_overlay_url } : prev)
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* POZNÁMKY A SCHVÁLENÍ */}
            {key === 'poznamky' && (
              <div style={{ paddingTop: 16 }}>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Poznámky od zadavatele se zobrazí zde.</p>
              </div>
            )}

            {/* NEBEZPEČNÁ ZÓNA */}
            {key === 'danger' && (
              <div style={{ paddingTop: 16 }}>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>Smaže všechny fotky eventu včetně Storage. Hosté zůstanou zachováni.</p>
                <button
                  onClick={async () => {
                    if (!selectedEvent) return
                    if (!confirm('Smazat VŠECHNY fotky eventu? Tato akce je nevratná!')) return
                    const res = await fetch(`/api/photographer/events/${selectedEvent.id}/clear`, { method: 'DELETE' })
                    const data = await res.json()
                    if (data.success) {
                      alert(`Hotovo — smazáno ${data.deleted} fotek.`)
                      setUnmatched([])
                      setGalleryPhotos([])
                      setPlaylistPhotos([])
                      setSelectedEvent(prev => prev ? { ...prev, photoCount: 0, unmatchedCount: 0 } : prev)
                      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, photoCount: 0, unmatchedCount: 0 } : e))
                      setGuests(prev => prev.map(g => ({ ...g, photo_count: 0 })))
                    }
                  }}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  🗑 Vyčistit všechny fotky eventu
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    ))}
  </div>
)}

            {/* Upload tab */}
            {tab === 'upload' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* FTP credentials card */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                    Upload z fotoaparátu (FTP)
                  </h2>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
                    Nastavte FTP klienta ve fotoaparátu nebo použijte aplikaci jako FileZilla.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {([
                      { label: 'Host',  value: 'piclio-backend.fly.dev' },
                      { label: 'Port',  value: '02121' },
                      { label: 'User',  value: 'piclio' },
                      { label: 'Heslo', value: 'piclio123' },
                    ] as const).map(({ label, value }) => (
                      <div key={label} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: '#f9fafb', borderRadius: 8, padding: '10px 14px',
                        border: '1px solid #e5e7eb',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, width: 40 }}>
                            {label}
                          </span>
                          <span style={{ fontSize: 14, color: '#111827', fontFamily: 'monospace', fontWeight: 500 }}>
                            {value}
                          </span>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(value)}
                          title={`Zkopírovat ${label}`}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 4, borderRadius: 4, color: '#9ca3af',
                            display: 'flex', alignItems: 'center',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Web uploader card */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                      Nahrát fotky
                    </h2>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                      Fotky se nahrají na server a OCR automaticky přiřadí hosty podle čísla odznaku.
                    </p>
                  </div>
                  <PhotoUploader
                    eventId={selectedEvent.id}
                    onUploadComplete={(count) => setUploadedCount(count)}
                  />
                </div>

                {/* Nebezpečná zóna */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #fecaca' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', margin: '0 0 8px' }}>Nebezpečná zóna</h2>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>
                    Smaže všechny fotky, photo_guests záznamy a Storage soubory tohoto eventu. Hosté zůstanou zachováni.
                  </p>
                  <button
                    onClick={async () => {
                      if (!selectedEvent) return
                      if (!confirm('Smazat všechny fotky tohoto eventu? Tato akce je nevratná.')) return
                      const res = await fetch(`/api/photographer/events/${selectedEvent.id}/clear`, { method: 'DELETE' })
                      const data = await res.json()
                      if (data.success) {
                        alert(`Smazáno ${data.deleted} fotek.`)
                        setUnmatched([])
                        setGalleryPhotos([])
                        setPlaylistPhotos([])
                        setSelectedEvent(prev => prev ? { ...prev, photoCount: 0, unmatchedCount: 0 } : prev)
                        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, photoCount: 0, unmatchedCount: 0 } : e))
                        setGuests(prev => prev.map(g => ({ ...g, photo_count: 0 })))
                      }
                    }}
                    style={{
                      background: '#ef4444', color: '#fff', border: 'none',
                      borderRadius: 8, padding: '10px 20px',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    🗑 Vyčistit všechny fotky eventu
                  </button>
                </div>

              </div>
            )}

            {/* O projektu tab */}
            {tab === 'project' && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>O projektu</h2>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>
                  Základní informace o akci, program a interní poznámky.
                </p>

                {/* Poznámka od zadavatele */}
                {infoNotes && (
                  <div style={{
                    background: '#fef9c3',
                    border: '1px solid #fde68a',
                    borderRadius: 10,
                    padding: '14px 16px',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    marginBottom: 20,
                  }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>📝</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                        Poznámka od zadavatele
                      </div>
                      <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: 12 }}>
                        {infoNotes}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={async () => {
                            await fetch('/api/photographer/events', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: selectedEvent!.id, infoNotes: null }),
                            })
                            setInfoNotes(null)
                          }}
                          style={{
                            background: '#1a1225', color: '#fff', border: 'none',
                            borderRadius: 8, padding: '8px 16px', fontSize: 12,
                            fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          ✓ Beru na vědomí
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Názov akcie */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Název akce
                    </label>
                    <input
                      type="text"
                      value={projectForm.name}
                      onChange={e => updateProjectForm('name', e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', outline: 'none' }}
                    />
                  </div>

                  {/* Místo konání */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Místo konání
                    </label>
                    <input
                      type="text"
                      value={projectForm.location}
                      onChange={e => updateProjectForm('location', e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', outline: 'none' }}
                    />
                  </div>

                  {/* Datum */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Datum
                    </label>
                    <input
                      type="date"
                      value={projectForm.date}
                      onChange={e => updateProjectForm('date', e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', outline: 'none' }}
                    />
                  </div>

                  {/* Počet hostí */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Očekávaný počet hostů
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={projectForm.maxGuests}
                      onChange={e => updateProjectForm('maxGuests', e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', outline: 'none' }}
                    />
                  </div>

                  {/* Popis */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Popis / informace o akci
                    </label>
                    <textarea
                      rows={4}
                      value={projectForm.description}
                      onChange={e => updateProjectForm('description', e.target.value)}
                      placeholder="Stručný popis akce, program, speciální požadavky…"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  {/* Slideshow box */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1a1225 0%, #2d1b4e 100%)',
                    borderRadius: 12,
                    padding: '20px 24px',
                    marginBottom: 20,
                    border: '1px solid rgba(183,233,76,0.3)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <span style={{ fontSize: 16 }}>▶</span>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#b7e94c', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Nastavení slideshow
                      </h3>
                    </div>

                  {/* Typ akce */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
                      Typ akce
                    </label>
                    <select
                      value={projectForm.eventCategory}
                      onChange={e => updateProjectForm('eventCategory', e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', outline: 'none', background: '#fff' }}
                    >
                      <option value="">— Vyberte typ —</option>
                      <option value="Networking">Networking</option>
                      <option value="Ples">Ples</option>
                      <option value="Večírek">Večírek</option>
                      <option value="Firemní akce">Firemní akce</option>
                      <option value="Konference">Konference</option>
                      <option value="Vlastní">Vlastní</option>
                    </select>
                  </div>

                  {/* Uvítací text slideshow */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
                      Uvítací text slideshow
                    </label>
                    <textarea
                      rows={2}
                      value={projectForm.slideshowWelcomeText}
                      onChange={e => updateProjectForm('slideshowWelcomeText', e.target.value)}
                      placeholder="např. Vítejte na firemním večírku společnosti Limetka · Vítejte na plese Avokada · Dobrý večer, vítáme vás na networkingu"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', outline: 'none', resize: 'vertical' }}
                    />
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                      Tento text se zobrazí na úvodní obrazovce slideshow před spuštěním prezentace.
                    </div>
                  </div>

                  {/* Slideshow odkaz + PIN */}
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Odkaz na projekci</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <a
                        href={`/slideshow/${selectedEvent!.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1, fontSize: 13, color: '#6366f1', textDecoration: 'underline', wordBreak: 'break-all' }}
                      >
                        {APP_URL}/slideshow/{selectedEvent!.slug}
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(`${APP_URL}/slideshow/${selectedEvent!.slug}`)}
                        style={{ flexShrink: 0, background: '#111827', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Kopírovat
                      </button>
                    </div>
                    {selectedEvent!.slideshow_pin && (
                      <div style={{ fontSize: 13, color: '#6b7280' }}>
                        PIN: <strong style={{ color: '#111827', fontFamily: 'monospace', fontSize: 15 }}>{selectedEvent!.slideshow_pin}</strong>
                      </div>
                    )}
                  </div>

                  </div>{/* /Slideshow box */}

                  {/* Poznámky pro fotografa — interní, nezobrazuje se zadavateli */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                      Poznámky pro fotografa
                      <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', marginLeft: 8 }}>
                        (interní — nezobrazuje se zadavateli)
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      value={projectForm.photographerNotes}
                      onChange={e => updateProjectForm('photographerNotes', e.target.value)}
                      placeholder="Interní poznámky, speciální instrukce…"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  {/* Uložiť */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={saveProjectInfo}
                      disabled={projectSaving}
                      style={{
                        background: projectSaving ? '#e5e7eb' : '#b7e94c',
                        color: projectSaving ? '#9ca3af' : '#1a1225',
                        border: 'none', borderRadius: 8, padding: '10px 24px',
                        fontSize: 14, fontWeight: 700,
                        cursor: projectSaving ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {projectSaving ? 'Ukládám…' : 'Uložit'}
                    </button>
                    {projectSaveMsg && (
                      <span style={{ fontSize: 13, color: projectSaveMsg.startsWith('✓') ? '#16a34a' : '#dc2626' }}>
                        {projectSaveMsg}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Galerie eventu tab */}
            {tab === 'galerie' && selectedEvent && (
              <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 280px)', minHeight: 500 }}>

                {/* LEVÝ PANEL — všechny fotky */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>

                  {/* Toolbar */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {(['all', 'by-guest', 'unassigned'] as const).map(t => (
                      <button key={t} onClick={() => setGalleryTab(t)} style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: galleryTab === t ? '#111827' : '#f3f4f6',
                        color: galleryTab === t ? '#fff' : '#6b7280', border: 'none',
                      }}>
                        {t === 'all' ? 'Všechny' : t === 'by-guest' ? 'Dle hosta' : 'Bez galerie'}
                      </button>
                    ))}

                    {galleryTab === 'by-guest' && (
                      <select value={selectedGuestFilter} onChange={e => setSelectedGuestFilter(e.target.value)}
                        style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                        <option value="all">Všichni hosté</option>
                        {guests.map(g => (
                          <option key={g.id} value={g.id}>#{g.badge_number} {g.name ?? g.email}</option>
                        ))}
                      </select>
                    )}

                    <select value={gallerySort} onChange={e => setGallerySort(e.target.value as any)}
                      style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', marginLeft: 'auto' }}>
                      <option value="newest">Nejnovější</option>
                      <option value="oldest">Nejstarší</option>
                    </select>

                    {selectedPhotoIds.size > 0 && (
                      <button onClick={() => {
                        const toAdd = galleryPhotos.filter(p => selectedPhotoIds.has(p.id) && !playlistPhotos.find(pp => pp.id === p.id))
                        setPlaylistPhotos(prev => [...prev, ...toAdd])
                        setSelectedPhotoIds(new Set())
                      }} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#b7e94c', color: '#1a1225', border: 'none' }}>
                        + Přidat do slideshow ({selectedPhotoIds.size})
                      </button>
                    )}
                  </div>

                  {/* Grid fotek */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                    {galleryLoading && (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>Načítám…</div>
                    )}
                    {!galleryLoading && galleryPhotos.length === 0 && (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>Žádné fotky</div>
                    )}
                    {galleryPhotos.map(photo => {
                      const selected = selectedPhotoIds.has(photo.id)
                      const inPlaylist = playlistPhotos.some(p => p.id === photo.id)
                      return (
                        <div key={photo.id} onClick={() => {
                          if (inPlaylist) return
                          setSelectedPhotoIds(prev => {
                            const next = new Set(prev)
                            next.has(photo.id) ? next.delete(photo.id) : next.add(photo.id)
                            return next
                          })
                        }} style={{
                          position: 'relative', borderRadius: 8, overflow: 'hidden',
                          cursor: inPlaylist ? 'default' : 'pointer',
                          height: 220, background: '#f5f3ee',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: selected ? '2px solid #b7e94c' : inPlaylist ? '2px solid #6b7280' : '2px solid transparent',
                          opacity: inPlaylist ? 0.5 : 1,
                        }}>
                          <img src={photo.url} alt={photo.filename} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
                          {selected && (
                            <div style={{ position: 'absolute', top: 4, right: 4, background: '#b7e94c', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1a1225' }}>✓</div>
                          )}
                          {inPlaylist && (
                            <div style={{ position: 'absolute', top: 4, right: 4, background: '#6b7280', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>▶</div>
                          )}
                          {photo.guest_name && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 9, padding: '2px 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {photo.guest_name}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* PRAVÝ PANEL — playlist */}
                <div style={{ width: 260, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Playlist ({playlistPhotos.length})</span>
                    <button onClick={() => setPlaylistPhotos([])} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Vymazat vše</button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                    {playlistPhotos.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 30, color: '#9ca3af', fontSize: 12 }}>Přidejte fotky ze seznamu</div>
                    )}
                    {playlistPhotos.map((photo, idx) => (
                      <div key={photo.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid #f9fafb' }}>
                        <span style={{ fontSize: 10, color: '#9ca3af', minWidth: 16 }}>{idx + 1}</span>
                        <img src={photo.url} alt="" style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 4 }} />
                        <span style={{ fontSize: 11, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {photo.guest_name || photo.filename}
                        </span>
                        <button onClick={() => setPlaylistPhotos(prev => prev.filter(p => p.id !== photo.id))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14, padding: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: 12, borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={async () => {
                      if (!selectedEvent || playlistPhotos.length === 0) return
                      const guestIds = Array.from(new Set(playlistPhotos.map(p => p.guest_id).filter(Boolean))) as string[]
                      await fetch(`/api/events/${selectedEvent.slug}/slideshow-settings`, {
                        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ slideshow_selected_guests: guestIds }),
                      })
                      window.open(`/slideshow/${selectedEvent.slug}`, '_blank')
                    }} style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      ▶ Spustit slideshow
                    </button>
                  </div>
                </div>

              </div>
            )}

          </>
        )}
      </div>

      {/* Unmatched lightbox */}
      {lightboxIndex !== null && unmatched[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            style={{
              position: 'fixed', top: 16, right: 16, zIndex: 1001,
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: 'none', borderRadius: 8, width: 36, height: 36,
              fontSize: 20, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>

          {/* Prev arrow */}
          {lightboxIndex > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? i - 1 : null) }}
              style={{
                position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: 'none', borderRadius: 8, width: 40, height: 40,
                fontSize: 22, cursor: 'pointer', zIndex: 1001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >‹</button>
          )}

          {/* Next arrow */}
          {lightboxIndex < unmatched.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? i + 1 : null) }}
              style={{
                position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: 'none', borderRadius: 8, width: 40, height: 40,
                fontSize: 22, cursor: 'pointer', zIndex: 1001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >›</button>
          )}

          {/* Image */}
          <img
            src={unmatched[lightboxIndex].url}
            alt={unmatched[lightboxIndex].filename}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 'min(90vw, 1200px)',
              maxHeight: '90vh',
              width: 'auto',
              height: 'auto',
              borderRadius: 8,
              display: 'block',
              userSelect: 'none',
            }}
          />

          {/* Counter + filename */}
          <div style={{
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            borderRadius: 8, padding: '6px 16px', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 12, zIndex: 1001,
          }}>
            <span>{lightboxIndex + 1} / {unmatched.length}</span>
            <span style={{ opacity: 0.6 }}>|</span>
            <span style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.85 }}>
              {unmatched[lightboxIndex].filename}
            </span>
            {/* Delete from lightbox */}
            <button
              onClick={e => { e.stopPropagation(); deleteUnmatchedPhoto(unmatched[lightboxIndex!].id); setLightboxIndex(null) }}
              title="Smazat fotku"
              style={{
                background: 'rgba(220,38,38,0.85)', color: '#fff',
                border: 'none', borderRadius: 6, padding: '3px 10px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                marginLeft: 4,
              }}
            >🗑 Smazat</button>
          </div>
        </div>
      )}

      {/* Composite fullscreen preview */}
      {overlayFullscreen && (() => {
        const isPortrait = overlayFullscreen === 'portrait'
        const photoSrc = isPortrait ? '/skuska02-portrait.jpg' : '/skuska01-krajina.jpg'
        const overlaySrc = isPortrait
          ? (overlayPortrait?.preview ?? overlayPortraitUrl)
          : (overlayLandscape?.preview ?? overlayLandscapeUrl)
        return (
          <div
            onClick={() => setOverlayFullscreen(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 10,
                aspectRatio: isPortrait ? '2/3' : '3/2',
                ...(isPortrait
                  ? { width: 'min(calc(80vh * 2 / 3), 90vw)' }
                  : { height: 'min(80vh, calc(90vw * 2 / 3))' }
                ),
              }}
            >
              <img
                src={photoSrc}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {overlaySrc && (
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${overlaySrc})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }} />
              )}
            </div>
            <button
              onClick={() => setOverlayFullscreen(null)}
              style={{
                position: 'fixed', top: 16, right: 16, zIndex: 1001,
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: 'none', borderRadius: 8, width: 36, height: 36,
                fontSize: 20, cursor: 'pointer', lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </div>
        )
      })()}

      {/* Edit event modal */}
      {editingEvent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}
          onClick={e => { if (e.target === e.currentTarget) setEditingEvent(null) }}
        >
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
                Upravit event
              </h2>
              <button
                onClick={() => setEditingEvent(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 22, lineHeight: 1 }}
              >×</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={labelStyle}>
                Název eventu
                <input
                  value={editForm.name}
                  disabled
                  style={{ ...inputStyle, background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  Název nelze změnit — URL zadavatele a kiosku musí zůstat pevná.
                </span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={labelStyle}>
                  Datum
                  <input
                    type="date" value={editForm.date}
                    onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Místo konání
                  <input
                    value={editForm.location}
                    onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                    style={inputStyle}
                  />
                </label>
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Zadavatel
                </div>
              </div>

              <label style={labelStyle}>
                Jméno zadavatele
                <input
                  value={editForm.clientName}
                  onChange={e => setEditForm(p => ({ ...p, clientName: e.target.value }))}
                  placeholder="Jan Novák"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Email zadavatele
                <input
                  type="email" value={editForm.clientEmail}
                  onChange={e => setEditForm(p => ({ ...p, clientEmail: e.target.value }))}
                  placeholder="jan@firma.cz"
                  style={inputStyle}
                />
              </label>

              {saveError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13,
                }}>
                  {saveError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  style={{
                    flex: 1, padding: '11px', border: '1px solid #d1d5db',
                    borderRadius: 10, background: '#fff', color: '#374151',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 2, padding: '11px', border: 'none',
                    borderRadius: 10, background: saving ? '#e5e7eb' : '#b7e94c',
                    color: saving ? '#9ca3af' : '#1a1225',
                    fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Ukládám…' : 'Uložit změny →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New event modal */}
      {showNewEvent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}
          onClick={e => { if (e.target === e.currentTarget) { setShowNewEvent(false); setEventType('ai'); setGalleryPublic(false) } }}
        >
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620,
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)', overflow: 'hidden',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Nový event</h2>
              <button
                onClick={() => { setShowNewEvent(false); setEventType('ai'); setGalleryPublic(false) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 22, lineHeight: 1 }}
              >×</button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateEvent} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Typ události */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
                  Vyber typ události — nelze po vytvoření změnit.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* Plná integrace */}
                  <div
                    onClick={() => setEventType('ai')}
                    style={{
                      borderRadius: 14, padding: 22, cursor: 'pointer',
                      border: eventType === 'ai' ? '1.5px solid #b7e94c' : '1.5px solid #e5e7eb',
                      background: eventType === 'ai' ? '#f9ffe6' : '#fafafa',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: eventType === 'ai' ? '#5a7a00' : '#9ca3af' }}>PLNÁ INTEGRACE</span>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: eventType === 'ai' ? '2px solid #b7e94c' : '2px solid #d1d5db', background: eventType === 'ai' ? '#b7e94c' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {eventType === 'ai' && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                    <div style={{ height: 64, borderRadius: 10, marginBottom: 14, background: 'linear-gradient(135deg,#1a1625 0%,#2d1f4e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden' }}>
                      <span style={{ background: 'rgba(183,233,76,0.2)', border: '1px solid rgba(183,233,76,0.4)', borderRadius: 100, padding: '3px 10px', fontSize: 10, color: '#b7e94c', fontWeight: 600 }}>AI párování</span>
                      <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '4px 10px', fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>host #014</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>S AI detekcí</div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.65, marginBottom: 14 }}>Každý host dostane svou soukromou galerii. Piclio automaticky přiřadí fotky pomocí AI.</div>
                    <div style={{ height: 1, background: '#f0f0f0', marginBottom: 12 }} />
                    {[
                      { yes: true, text: 'AI detekce + číslované odznáčky' },
                      { yes: true, text: 'Soukromá galerie každého hosta' },
                      { yes: true, text: 'Piclio kiosk na vstupu' },
                      { yes: true, text: 'Slideshow projekce' },
                      { yes: true, text: 'Dashboard fotografa i zadavatele' },
                    ].map(f => (
                      <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ width: 16, height: 16, borderRadius: 4, background: '#b7e94c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#3a5000', flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 12, color: '#374151' }}>{f.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Jednoduchá galerie */}
                  <div
                    onClick={() => setEventType('simple')}
                    style={{
                      borderRadius: 14, padding: 22, cursor: 'pointer',
                      border: eventType === 'simple' ? '1.5px solid #b7e94c' : '1.5px solid #e5e7eb',
                      background: eventType === 'simple' ? '#f9ffe6' : '#fafafa',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: eventType === 'simple' ? '#5a7a00' : '#9ca3af' }}>JEDNODUCHÁ GALERIE</span>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: eventType === 'simple' ? '2px solid #b7e94c' : '2px solid #d1d5db', background: eventType === 'simple' ? '#b7e94c' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {eventType === 'simple' && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                    <div style={{ height: 64, borderRadius: 10, marginBottom: 14, background: 'linear-gradient(135deg,#0f2a1a 0%,#1a3a2a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden' }}>
                      <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '4px 10px', fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>zahradní grilovačka</span>
                      <span style={{ background: 'rgba(183,233,76,0.2)', border: '1px solid rgba(183,233,76,0.4)', borderRadius: 100, padding: '3px 10px', fontSize: 10, color: '#b7e94c', fontWeight: 600 }}>sdílená galerie</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>Bez AI třídění</div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.65, marginBottom: 14 }}>Jedna sdílená galerie pro celou akci. Ideální pro neformální eventy a rodinné akce.</div>
                    <div style={{ height: 1, background: '#f0f0f0', marginBottom: 12 }} />
                    {[
                      { yes: true,  text: 'Jedna sdílená galerie' },
                      { yes: true,  text: 'Download, liky, komentáře' },
                      { yes: true,  text: 'Privátní nebo veřejná' },
                      { yes: false, text: 'Bez AI detekce' },
                      { yes: false, text: 'Bez soukromých galerií' },
                    ].map(f => (
                      <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ width: 16, height: 16, borderRadius: 4, background: f.yes ? '#b7e94c' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: f.yes ? '#3a5000' : '#9ca3af', flexShrink: 0 }}>{f.yes ? '✓' : '–'}</span>
                        <span style={{ fontSize: 12, color: f.yes ? '#374151' : '#9ca3af', textDecoration: f.yes ? 'none' : 'line-through' }}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Název */}
              <label style={labelStyle}>
                Název eventu *
                <input
                  required value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                  placeholder="Voděrádky 2026"
                  style={inputStyle}
                />
              </label>
              <div style={{
                background: '#fef9c3',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 12,
                color: '#92400e',
                marginTop: 6,
              }}>
                ⚠️ <strong>Název eventu nelze po uložení změnit.</strong><br/>
                URL adresa kiosku a zadavatele se generuje z názvu
                a zůstane pevná. Zkontrolujte název před uložením.
              </div>

              {/* Datum + Místo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={labelStyle}>
                  Datum *
                  <input
                    type="date" required value={form.date}
                    onChange={e => updateForm('date', e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Místo konání *
                  <input
                    required value={form.location}
                    onChange={e => updateForm('location', e.target.value)}
                    placeholder="Praha, hotel XY"
                    style={inputStyle}
                  />
                </label>
              </div>

              {/* Přístup ke galerii — jen pro simple */}
              {eventType === 'simple' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8, color: '#374151' }}>Přístup ke galerii</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button type="button" onClick={() => setGalleryPublic(false)}
                      style={{ padding: '11px', borderRadius: 10, cursor: 'pointer', border: !galleryPublic ? '1.5px solid #b7e94c' : '1px solid #e5e7eb', background: !galleryPublic ? '#f9ffe6' : '#fff', fontWeight: 600, fontSize: 13, color: '#111' }}>
                      🔒 Jen s odkazem
                    </button>
                    <button type="button" onClick={() => setGalleryPublic(true)}
                      style={{ padding: '11px', borderRadius: 10, cursor: 'pointer', border: galleryPublic ? '1.5px solid #b7e94c' : '1px solid #e5e7eb', background: galleryPublic ? '#f9ffe6' : '#fff', fontWeight: 600, fontSize: 13, color: '#111' }}>
                      🌐 Veřejná
                    </button>
                  </div>
                </div>
              )}

              {/* Max hostů + Barva */}
              <div style={{ display: eventType === 'simple' ? 'none' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={labelStyle}>
                  Max. počet hostů
                  <input
                    type="number" min={1} max={9999} value={form.maxGuests}
                    onChange={e => updateForm('maxGuests', e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Barva brandingu
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                    <input
                      type="color" value={form.brandColor}
                      onChange={e => updateForm('brandColor', e.target.value)}
                      style={{ width: 42, height: 38, border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', padding: 2 }}
                    />
                    <span style={{ fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>{form.brandColor}</span>
                  </div>
                </label>
              </div>

              {/* Divider + sekce ZADAVATEL — skrytá pro simple */}
              <div style={{ display: eventType === 'simple' ? 'none' : 'block' }}>
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 4, marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    Zadavatel (obdrží pozvánku)
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Jméno zadavatele */}
                  <label style={labelStyle}>
                    Jméno zadavatele *
                    <input
                      required={eventType === 'ai'}
                      value={form.clientName}
                      onChange={e => updateForm('clientName', e.target.value)}
                      placeholder="Jan Novák"
                      style={inputStyle}
                    />
                  </label>
                  {/* Email zadavatele */}
                  <label style={labelStyle}>
                    Email zadavatele *
                    <input
                      type="email" required={eventType === 'ai'} value={form.clientEmail}
                      onChange={e => updateForm('clientEmail', e.target.value)}
                      placeholder="jan@firma.cz"
                      style={inputStyle}
                    />
                  </label>
                </div>
              </div>

              {/* Error */}
              {createError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13,
                }}>
                  {createError}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowNewEvent(false)}
                  style={{
                    flex: 1, padding: '11px', border: '1px solid #d1d5db',
                    borderRadius: 10, background: '#fff', color: '#374151',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 2, padding: '11px', border: 'none',
                    borderRadius: 10, background: creating ? '#e5e7eb' : '#b7e94c',
                    color: creating ? '#9ca3af' : '#1a1225',
                    fontSize: 14, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {creating ? 'Vytvářím…' : 'Vytvořit event →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast — pozvánka odeslána */}
      {inviteToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: inviteToast === 'ok' ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${inviteToast === 'ok' ? '#6ee7b7' : '#fca5a5'}`,
          borderRadius: 10, padding: '14px 20px',
          fontSize: 14, fontWeight: 700,
          color: inviteToast === 'ok' ? '#065f46' : '#991b1b',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {inviteToast === 'ok' ? '✅ Pozvánka odeslána' : '✗ Nepodařilo se odeslat'}
        </div>
      )}

      {/* Toast — overlay schválen zadavatelem */}
      {overlayToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#d1fae5', border: '1px solid #6ee7b7',
          borderRadius: 10, padding: '14px 20px',
          fontSize: 14, fontWeight: 700, color: '#065f46',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ✅ Zadavatel schválil overlay
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 5,
  fontSize: 13, fontWeight: 600, color: '#374151',
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8,
  fontSize: 14, color: '#111827', background: '#fff', outline: 'none',
  marginTop: 2,
}

interface OverlayZoneProps {
  label: string
  description: string
  aspectLabel: string
  value: { file: File; preview: string } | null
  savedUrl: string
  error: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void | Promise<void>
  onExpand: () => void
}

function OverlayZone({ label, description, aspectLabel, value, savedUrl, error, onChange, onRemove, onExpand }: OverlayZoneProps) {
  const inputId = `overlay-${label}`
  const isSaved = !value && !!savedUrl

  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 20,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{description}</div>
      </div>

      {/* Saved state — overlay already in system */}
      {isSaved ? (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 8, padding: '8px 12px',
          }}>
            <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>✓ Uloženo v systému</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <label
              htmlFor={inputId}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, border: '1px solid #d1d5db', borderRadius: 8,
                padding: '9px 14px', cursor: 'pointer', background: '#f9fafb',
                fontSize: 13, fontWeight: 600, color: '#374151',
                transition: 'background 0.15s',
              }}
            >
              🔄 Nahradit
            </label>
            <button
              onClick={onRemove}
              title="Smazat overlay"
              style={{
                border: '1px solid #fecaca', borderRadius: 8,
                padding: '9px 14px', cursor: 'pointer',
                background: '#fef2f2', fontSize: 13, fontWeight: 600,
                color: '#dc2626',
              }}
            >
              Smazat
            </button>
          </div>
        </>
      ) : value ? (
        /* Local file selected — show thumbnail */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <img
              src={value.preview}
              alt={`${label} overlay náhled`}
              onClick={onExpand}
              title="Kliknutím zobrazit celý náhled"
              style={{
                maxHeight: 200, width: 'auto', objectFit: 'contain',
                borderRadius: 8, display: 'block', cursor: 'zoom-in',
                background: 'repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 16px 16px',
              }}
            />
            <button
              onClick={onRemove}
              title="Odebrat"
              style={{
                position: 'absolute', top: 6, right: 6,
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                border: 'none', borderRadius: 6, width: 28, height: 28,
                fontSize: 16, cursor: 'pointer', lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
            <div style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 10, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.45)', borderRadius: 4, padding: '2px 5px', pointerEvents: 'none' }}>
              🔍 celý náhled
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {value.file.name} · {(value.file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      ) : (
        /* Empty — drop zone */
        <label
          htmlFor={inputId}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, border: `2px dashed ${error ? '#fca5a5' : '#d1d5db'}`,
            borderRadius: 10, padding: '28px 16px', cursor: 'pointer',
            background: error ? '#fef2f2' : '#f9fafb',
            transition: 'border-color 0.15s',
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1 }}>🖼</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Vybrat PNG soubor</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{aspectLabel} · max 8 MB</span>
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/png"
        onChange={onChange}
        style={{ display: 'none' }}
      />

      {error && (
        <div style={{
          fontSize: 12, color: '#dc2626',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 6, padding: '8px 10px',
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

const emailLabelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block',
}

const projLabel: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
}

const projSelect: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #e5e7eb', fontSize: 14, outline: 'none',
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: warn ? '#dc2626' : '#111827' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af' }}>{label}</div>
    </div>
  )
}
