import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signPhotosRobust } from '@/lib/supabase/signPhotosRobust'
import { ClientDashboard } from './ClientDashboard'

interface Props {
  params: { eventSlug: string }
}

// Simple batch sign for matched/gallery photos (no fallback needed — these paths are reliable)
async function signPhotos(photos: any[], expiresIn: number): Promise<any[]> {
  if (photos.length === 0) return []
  const paths = photos.map(p => p.storage_path)
  const { data: signedUrls } = await supabaseAdmin.storage
    .from('photos')
    .createSignedUrls(paths, expiresIn)
  const ts = Date.now()
  return photos.map((p, i) => ({
    ...p,
    url: signedUrls?.[i]?.signedUrl ? `${signedUrls[i].signedUrl}&t=${ts}` : '',
  }))
}

export default async function ClientDashboardPage({ params }: Props) {
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, name, slug, date, location, status, max_guests, client_name, client_email, client_logo_url, brand_color, slideshow_pin, slideshow_playlist, public_gallery, overlay_approved, overlay_approved_by, overlay_notes, overlay_portrait_url, overlay_landscape_url, overlay_status, overlay_mode, description, slideshow_content, slideshow_selected_guests, slideshow_output, slideshow_interval, slideshow_animation, slideshow_layout, event_type, gallery_public, email_header_color, email_banner_url, slideshow_bg, slideshow_bar_color, slideshow_bar_enabled, slideshow_overlay_url, slideshow_overlay_mode, event_category, slideshow_welcome_text')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) notFound()

  const [
    { data: guests },
    { count: photoCount },
    { count: unmatchedCount },
    { count: deliveredCount },
  ] = await Promise.all([
    supabaseAdmin
      .from('guests')
      .select('id, event_id, email, name, badge_number, gallery_token, photo_count, email_sent_at, registered_at')
      .eq('event_id', event.id)
      .order('badge_number', { ascending: true }),
    supabaseAdmin.from('photos').select('*', { count: 'exact', head: true }).eq('event_id', event.id),
    supabaseAdmin.from('photos').select('*', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'unmatched'),
    supabaseAdmin.from('guests').select('*', { count: 'exact', head: true }).eq('event_id', event.id).not('email_sent_at', 'is', null),
  ])

  const guestList = guests ?? []
  const totalPhotos = photoCount ?? 0
  const guestCount = guestList.length
  const avgPhotosPerGuest = guestCount > 0 ? +(totalPhotos / guestCount).toFixed(1) : 0
  const galleryOpenedCount = guestList.filter((g: any) => g.email_sent_at).length

  const { data: allPhotos } = await supabaseAdmin
    .from('photos')
    .select('id, filename, storage_path, uploaded_at')
    .eq('event_id', event.id)
    .eq('status', 'matched')
    .order('uploaded_at', { ascending: false })
    .limit(100)

  const { data: unmatchedPhotos } = await supabaseAdmin
    .from('photos')
    .select('id, filename, storage_path, original_path, uploaded_at, ocr_number, status')
    .eq('event_id', event.id)
    .eq('status', 'unmatched')
    .order('uploaded_at', { ascending: false })
    .limit(20)

  const [unmatchedWithUrls, allPhotosWithUrls] = await Promise.all([
    signPhotosRobust(unmatchedPhotos ?? [], 86400),
    signPhotos(allPhotos ?? [], 172800),
  ])

  const publicPhotoCount = totalPhotos - (unmatchedCount ?? 0)

  return (
    <ClientDashboard
      event={{
        ...event,
        slideshow_playlist: event.slideshow_playlist ?? [],
        public_gallery: event.public_gallery ?? false,
        overlay_approved: event.overlay_approved ?? false,
        overlay_mode: (event.overlay_mode ?? 'none') as 'custom' | 'piclio' | 'none',
        slideshow_content: (event.slideshow_content ?? 'random') as 'photographer' | 'client' | 'random' | 'selected_guests',
        slideshow_selected_guests: event.slideshow_selected_guests ?? [],
        slideshow_output: (event.slideshow_output ?? 'slideshow') as 'slideshow' | 'download' | 'both',
        slideshow_interval: event.slideshow_interval ?? 5,
        slideshow_animation: (event.slideshow_animation ?? 'fade') as 'fade' | 'slide' | 'none',
        slideshow_layout: (event.slideshow_layout ?? 'single') as 'single' | 'slide' | 'kenburns' | 'grid',
        event_type: (event.event_type ?? 'ai') as 'ai' | 'simple',
        gallery_public: event.gallery_public ?? false,
        event_category: (event as any).event_category ?? null,
        slideshow_welcome_text: (event as any).slideshow_welcome_text ?? null,
      }}
      guests={guestList}
      stats={{
        guestCount,
        photoCount: totalPhotos,
        unmatchedCount: unmatchedCount ?? 0,
        deliveredCount: deliveredCount ?? 0,
        avgPhotosPerGuest,
        galleryOpenedCount,
        publicPhotoCount,
      }}
      unmatchedPhotos={unmatchedWithUrls}
      allPhotos={allPhotosWithUrls}
      eventSlug={params.eventSlug}
    />
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
