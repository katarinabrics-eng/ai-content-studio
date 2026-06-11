import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signPhotosRobust } from '@/lib/supabase/signPhotosRobust'

export const dynamic = 'force-dynamic'

interface GalleryPhoto {
  id: string
  filename: string
  url: string
  uploaded_at: string
  guest_id?: string
  guest_name?: string
  orientation: 'portrait' | 'landscape'
}

export async function GET(req: NextRequest, { params }: { params: { eventSlug: string } }) {
  const { searchParams } = new URL(req.url)
  const tab = searchParams.get('tab') ?? 'all'
  const guestId = searchParams.get('guest_id')
  const sort = searchParams.get('sort') ?? 'newest'

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // ── Unassigned: photos with no photo_guests record ────────────────────────
  if (tab === 'unassigned') {
    // All photo_ids assigned to any guest of this event
    const { data: guestRows } = await supabaseAdmin
      .from('guests')
      .select('id')
      .eq('event_id', event.id)

    const guestIds = (guestRows ?? []).map(g => g.id)
    let assignedPhotoIds = new Set<string>()

    if (guestIds.length > 0) {
      const { data: assigned } = await supabaseAdmin
        .from('photo_guests')
        .select('photo_id')
        .in('guest_id', guestIds)
      assignedPhotoIds = new Set((assigned ?? []).map(r => r.photo_id))
    }

    const { data: allPhotos } = await supabaseAdmin
      .from('photos')
      .select('id, filename, storage_path, original_path, uploaded_at')
      .eq('event_id', event.id)
      .order('uploaded_at', { ascending: sort === 'oldest' })

    // Filter out permanently deleted photos
    const { data: deletedRows } = await supabaseAdmin.from('deleted_photos').select('storage_path')
    const deletedPaths = new Set((deletedRows ?? []).map((d: { storage_path: string }) => d.storage_path))

    const unassigned = (allPhotos ?? []).filter(p => !assignedPhotoIds.has(p.id) && !deletedPaths.has(p.storage_path))
    if (unassigned.length === 0) return NextResponse.json({ photos: [] })

    const signed = await signPhotosRobust(unassigned, 172800)
    return NextResponse.json({
      photos: signed.map((p: any) => ({
        id: p.id, filename: p.filename, url: p.url,
        uploaded_at: p.uploaded_at, orientation: 'landscape' as const,
      })),
    })
  }

  // ── All or by-guest ───────────────────────────────────────────────────────
  // Get guests for this event (optionally filtered)
  let guestQuery = supabaseAdmin
    .from('guests')
    .select('id, name, badge_number')
    .eq('event_id', event.id)

  if (tab === 'by-guest' && guestId && guestId !== 'all') {
    guestQuery = guestQuery.eq('id', guestId)
  }

  const { data: guestRows } = await guestQuery
  const guestIds = (guestRows ?? []).map(g => g.id)
  const guestMap = Object.fromEntries(
    (guestRows ?? []).map(g => [g.id, `${g.badge_number ? '#' + g.badge_number + ' ' : ''}${g.name ?? ''}`])
  )

  if (guestIds.length === 0) return NextResponse.json({ photos: [] })

  const { data: pgRows } = await supabaseAdmin
    .from('photo_guests')
    .select('photo_id, guest_id')
    .in('guest_id', guestIds)

  if (!pgRows || pgRows.length === 0) return NextResponse.json({ photos: [] })

  // Deduplicate photo_ids for 'all' tab; keep guest info for 'by-guest'
  const photoIdToGuest: Record<string, string> = {}
  for (const row of pgRows) {
    if (!photoIdToGuest[row.photo_id]) {
      photoIdToGuest[row.photo_id] = row.guest_id
    }
  }
  const uniquePhotoIds = Object.keys(photoIdToGuest)

  const { data: photos } = await supabaseAdmin
    .from('photos')
    .select('id, filename, storage_path, original_path, uploaded_at')
    .in('id', uniquePhotoIds)
    .order('uploaded_at', { ascending: sort === 'oldest' })

  if (!photos || photos.length === 0) return NextResponse.json({ photos: [] })

  // Filter out permanently deleted photos
  const { data: deletedRows2 } = await supabaseAdmin.from('deleted_photos').select('storage_path')
  const deletedPaths2 = new Set((deletedRows2 ?? []).map((d: { storage_path: string }) => d.storage_path))
  const photosFiltered = photos.filter((p: { storage_path: string }) => !deletedPaths2.has(p.storage_path))

  if (photosFiltered.length === 0) return NextResponse.json({ photos: [] })

  const signed = await signPhotosRobust(photosFiltered, 172800)

  const result: GalleryPhoto[] = signed.map((p: any) => ({
    id: p.id,
    filename: p.filename,
    url: p.url,
    uploaded_at: p.uploaded_at,
    guest_id: photoIdToGuest[p.id],
    guest_name: guestMap[photoIdToGuest[p.id]] ?? '',
    orientation: 'landscape' as const,
  }))

  return NextResponse.json({ photos: result })
}
