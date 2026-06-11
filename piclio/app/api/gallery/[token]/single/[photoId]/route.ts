import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signPhotosRobust } from '@/lib/supabase/signPhotosRobust'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string; photoId: string } }
) {
  const { data: guest } = await supabaseAdmin
    .from('guests')
    .select('id')
    .eq('gallery_token', params.token)
    .single()

  if (!guest) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: pg } = await supabaseAdmin
    .from('photo_guests')
    .select('photo_id')
    .eq('photo_id', params.photoId)
    .eq('guest_id', guest.id)
    .single()

  if (!pg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: photo } = await supabaseAdmin
    .from('photos')
    .select('id, filename, storage_path, original_path, taken_at, uploaded_at')
    .eq('id', params.photoId)
    .neq('is_deleted', true)
    .single()

  if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

  const signed = await signPhotosRobust([photo], 172800)
  const p = signed[0]

  return NextResponse.json({
    photo: {
      id: p.id,
      url: p.url,
      filename: p.filename,
      taken_at: p.taken_at,
      uploaded_at: p.uploaded_at,
    }
  })
}
