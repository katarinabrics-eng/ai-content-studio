import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { eventSlug: string } }) {
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, name, slug, date, brand_color, client_logo_url, client_name, slideshow_content, slideshow_selected_guests, slideshow_interval, slideshow_animation, slideshow_output, slideshow_layout, slideshow_welcome_text, slideshow_bg, slideshow_bar_color, slideshow_bar_enabled, slideshow_overlay_url, slideshow_overlay_mode')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  // Načítaj VŠETKY fotky eventu priamo
  const { data: photos, error: photosError } = await supabaseAdmin
    .from('photos')
    .select('id, filename, storage_path, status, uploaded_at')
    .eq('event_id', event.id)
    .neq('is_deleted', true)
    .order('uploaded_at', { ascending: false })

  console.log(`[slideshow] event=${event.id} photos=${photos?.length ?? 0} error=${photosError?.message ?? 'none'}`)

  // Vygeneruj signed URLs
  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await supabaseAdmin.storage
        .from('photos')
        .createSignedUrl(photo.storage_path, 48 * 60 * 60)
      return {
        id: photo.id,
        filename: photo.filename,
        url: data?.signedUrl ?? '',
        uploaded_at: photo.uploaded_at,
      }
    })
  )

  // Odstráň fotky bez URL
  const validPhotos = photosWithUrls.filter(p => p.url)

  return NextResponse.json({
    event,
    photos: validPhotos,
    settings: {
      interval: event.slideshow_interval ?? 5,
      animation: event.slideshow_animation ?? 'fade',
      output: event.slideshow_output ?? 'slideshow',
      layout: event.slideshow_layout ?? 'single',
    },
  })
}
