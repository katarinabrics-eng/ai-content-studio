import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signPhotosRobust } from '@/lib/supabase/signPhotosRobust'

export const dynamic = 'force-dynamic'

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

export async function GET(
  req: NextRequest,
  { params }: { params: { eventSlug: string } }
) {
  const { eventSlug } = params
  const include = req.nextUrl.searchParams.get('include') ?? 'stats,guests'

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('slug', eventSlug)
    .single()

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const results: Record<string, any> = {}

  if (include.includes('stats') || include.includes('guests')) {
    const [
      { count: photoCount },
      { count: unmatchedCount },
      { count: deliveredCount },
      { data: guests },
    ] = await Promise.all([
      supabaseAdmin
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .neq('is_deleted', true),
      supabaseAdmin
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'unmatched')
        .neq('is_deleted', true),
      supabaseAdmin
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .not('email_sent_at', 'is', null),
      supabaseAdmin
        .from('guests')
        .select('id, event_id, email, name, badge_number, gallery_token, email_sent_at, registered_at')
        .eq('event_id', event.id)
        .order('badge_number', { ascending: true }),
    ])

    const guestList = guests ?? []

    // Dynamically count photos per guest from photo_guests
    const guestIds = guestList.map((g: any) => g.id)
    const { data: pgRows } = guestIds.length > 0
      ? await supabaseAdmin
          .from('photo_guests')
          .select('guest_id')
          .in('guest_id', guestIds)
      : { data: [] }

    const photoCountMap: Record<string, number> = {}
    for (const row of (pgRows ?? [])) {
      photoCountMap[row.guest_id] = (photoCountMap[row.guest_id] ?? 0) + 1
    }

    const guestCount = guestList.length
    const totalPhotos = photoCount ?? 0
    const galleryOpenedCount = guestList.filter((g: any) => g.email_sent_at).length

    results.stats = {
      guestCount,
      photoCount: totalPhotos,
      unmatchedCount: unmatchedCount ?? 0,
      deliveredCount: deliveredCount ?? 0,
      avgPhotosPerGuest: guestCount > 0 ? +(totalPhotos / guestCount).toFixed(1) : 0,
      galleryOpenedCount,
      publicPhotoCount: totalPhotos - (unmatchedCount ?? 0),
    }
    results.guests = guestList.map((g: any) => ({
      ...g,
      photo_count: photoCountMap[g.id] ?? 0,
    }))
  }

  if (include.includes('unmatched')) {
    const { data: unmatchedPhotos } = await supabaseAdmin
      .from('photos')
      .select('id, filename, storage_path, original_path, uploaded_at, ocr_number, status')
      .eq('event_id', event.id)
      .eq('status', 'unmatched')
      .neq('is_deleted', true)
      .order('uploaded_at', { ascending: false })
      .limit(20)

    results.unmatchedPhotos = await signPhotosRobust(unmatchedPhotos ?? [], 86400)
  }

  if (include.includes('photos')) {
    const { data: allPhotos } = await supabaseAdmin
      .from('photos')
      .select('id, filename, storage_path, uploaded_at')
      .eq('event_id', event.id)
      .neq('is_deleted', true)
      .order('uploaded_at', { ascending: false })
      .limit(100)

    results.allPhotos = await signPhotos(allPhotos ?? [], 172800)
  }

  return NextResponse.json(results)
}
