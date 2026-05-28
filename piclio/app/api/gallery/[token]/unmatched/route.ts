import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signPhotosRobust } from '@/lib/supabase/signPhotosRobust'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const { data: guest } = await supabaseAdmin
    .from('guests')
    .select('id, event_id')
    .eq('gallery_token', params.token)
    .single()

  if (!guest) return NextResponse.json({ error: 'Galerie nenalezena' }, { status: 404 })

  const { data: myPhotoGuests } = await supabaseAdmin
    .from('photo_guests')
    .select('photo_id')
    .eq('guest_id', guest.id)

  const myPhotoIds = (myPhotoGuests ?? []).map(pg => pg.photo_id)

  let query = supabaseAdmin
    .from('photos')
    .select('id, filename, storage_path, original_path, taken_at, uploaded_at, ocr_number, status, event_id')
    .eq('event_id', guest.event_id)
    .not('status', 'eq', 'incoming')

  if (myPhotoIds.length > 0) {
    query = query.not('id', 'in', `(${myPhotoIds.join(',')})`)
  }

  const { data: photos } = await query

  if (!photos?.length) return NextResponse.json({ photos: [] })

  const signed = await signPhotosRobust(photos, 172800)

  return NextResponse.json({
    photos: signed.map((p: any) => ({
      id: p.id,
      url: p.url,
      filename: p.filename,
      taken_at: p.taken_at,
      uploaded_at: p.uploaded_at,
      ocr_number: p.ocr_number,
      storage_path: p.storage_path,
      status: p.status,
      event_id: p.event_id,
    })),
  })
}
