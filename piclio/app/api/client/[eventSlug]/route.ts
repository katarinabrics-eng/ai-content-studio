import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { eventSlug: string } }) {
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, name, slug, date, location, status, max_guests, client_name, client_logo_url, brand_color, slideshow_pin, slideshow_playlist, public_gallery, overlay_approved, overlay_notes, overlay_portrait_url, overlay_landscape_url, overlay_status, description')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const [
    { data: guests },
    { count: photoCount },
    { count: unmatchedCount },
    { count: deliveredCount },
  ] = await Promise.all([
    supabaseAdmin
      .from('guests')
      .select('id, email, name, badge_number, gallery_token, photo_count, email_sent_at, registered_at')
      .eq('event_id', event.id)
      .order('badge_number', { ascending: true }),
    supabaseAdmin.from('photos').select('*', { count: 'exact', head: true }).eq('event_id', event.id),
    supabaseAdmin.from('photos').select('*', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'unmatched'),
    supabaseAdmin.from('guests').select('*', { count: 'exact', head: true }).eq('event_id', event.id).not('email_sent_at', 'is', null),
  ])

  // Extended stats
  const guestList = guests ?? []
  const totalPhotos = photoCount ?? 0
  const guestCount = guestList.length
  const avgPhotosPerGuest = guestCount > 0 ? +(totalPhotos / guestCount).toFixed(1) : 0
  const galleryOpenedCount = guestList.filter(g => g.email_sent_at).length

  // All matched photos for playlist tab (up to 100)
  const { data: allPhotos } = await supabaseAdmin
    .from('photos')
    .select('id, filename, storage_path, uploaded_at')
    .eq('event_id', event.id)
    .eq('status', 'matched')
    .order('uploaded_at', { ascending: false })
    .limit(100)

  // Unmatched photos
  const { data: unmatchedPhotos } = await supabaseAdmin
    .from('photos')
    .select('id, filename, storage_path, uploaded_at, ocr_number, status')
    .eq('event_id', event.id)
    .eq('status', 'unmatched')
    .order('uploaded_at', { ascending: false })
    .limit(20)

  // Sign URLs in parallel
  const [unmatchedWithUrls, allPhotosWithUrls] = await Promise.all([
    signPhotos(unmatchedPhotos ?? [], 3600),
    signPhotos(allPhotos ?? [], 172800),
  ])

  // Count public gallery photos (all matched = public when enabled)
  const publicPhotoCount = totalPhotos - (unmatchedCount ?? 0)

  return NextResponse.json({
    event: {
      ...event,
      slideshow_playlist: event.slideshow_playlist ?? [],
      public_gallery: event.public_gallery ?? false,
      overlay_approved: event.overlay_approved ?? false,
    },
    guests: guestList,
    stats: {
      guestCount,
      photoCount: totalPhotos,
      unmatchedCount: unmatchedCount ?? 0,
      deliveredCount: deliveredCount ?? 0,
      avgPhotosPerGuest,
      galleryOpenedCount,
      publicPhotoCount,
    },
    unmatchedPhotos: unmatchedWithUrls,
    allPhotos: allPhotosWithUrls,
  })
}

async function signPhotos(photos: any[], expiresIn: number): Promise<any[]> {
  if (photos.length === 0) return []
  const paths = photos.map(p => p.storage_path)
  const { data: signedUrls } = await supabaseAdmin.storage
    .from('photos')
    .createSignedUrls(paths, expiresIn)
  return photos.map((p, i) => ({
    ...p,
    url: signedUrls?.[i]?.signedUrl ?? '',
  }))
}
