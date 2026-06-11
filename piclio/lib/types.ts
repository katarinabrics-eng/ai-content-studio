export type EventStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'

export interface PiclioEvent {
  id: string
  name: string
  slug: string
  date: string
  location: string | null
  status: EventStatus
  max_guests: number
  client_name: string | null
  client_email: string | null
  client_logo_url: string | null
  brand_color: string
  slideshow_pin: string | null
  slideshow_playlist: string[]
  public_gallery: boolean
  overlay_approved: boolean
  overlay_notes: string | null
  overlay_portrait_url: string | null
  overlay_landscape_url: string | null
  overlay_status: 'approved' | 'pending_client' | null
  overlay_approved_by: 'photographer' | 'client' | null
  overlay_mode: 'custom' | 'piclio' | 'none'
  slideshow_content: 'photographer' | 'client' | 'random' | 'selected_guests'
  slideshow_selected_guests: string[]
  slideshow_output: 'slideshow' | 'download' | 'both'
  slideshow_interval: number
  slideshow_animation: 'fade' | 'slide' | 'none'
  slideshow_layout: 'single' | 'slide' | 'kenburns' | 'grid'
  event_type: 'ai' | 'simple'
  gallery_public: boolean
  event_category: string | null
  slideshow_welcome_text: string | null
  slideshow_bg?: string
  slideshow_bar_color?: string
  slideshow_bar_enabled?: boolean
}

export interface Guest {
  id: string
  event_id: string
  email: string
  name: string | null
  badge_number: number | null
  gallery_token: string
  photo_count: number
  email_sent_at: string | null
  registered_at: string
}

export interface GalleryPhoto {
  id: string
  url: string
  filename: string
  taken_at: string | null
  uploaded_at: string
}

export interface EventWithStats extends PiclioEvent {
  guestCount: number
  photoCount: number
  unmatchedCount: number
  deliveredCount: number
}

export interface UnmatchedPhoto {
  id: string
  url: string
  filename: string
  storage_path: string
  uploaded_at: string
  ocr_number: number | null
  event_id: string
  status: string
}

export interface PlaylistPhoto {
  id: string
  url: string
  filename: string
  storage_path: string
  uploaded_at: string
}
