import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signPhotosRobust } from '@/lib/supabase/signPhotosRobust'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { eventSlug: string } }
) {
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, name, slug, date, gallery_public, brand_color, client_logo_url')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) return NextResponse.json({ error: 'Event nenalezen' }, { status: 404 })
  if (!event.gallery_public) return NextResponse.json({ error: 'Galerie není veřejná' }, { status: 403 })

  const { data: photos } = await supabaseAdmin
    .from('photos')
    .select('id, filename, storage_path, original_path, taken_at, uploaded_at')
    .eq('event_id', event.id)
    .neq('is_deleted', true)
    .order('uploaded_at', { ascending: false })

  if (!photos || photos.length === 0) {
    return NextResponse.json({ event, photos: [] })
  }

  const signed = await signPhotosRobust(photos, 86400)
  const result = signed.map((p: any) => ({
    id: p.id,
    url: p.url,
    filename: p.filename,
    taken_at: p.taken_at,
    uploaded_at: p.uploaded_at,
  }))

  return NextResponse.json({ event, photos: result })
}
