import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: { eventSlug: string } }) {
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const body = await req.json()
  const playlist: string[] = Array.isArray(body.playlist) ? body.playlist : []

  const { error } = await supabaseAdmin
    .from('events')
    .update({ slideshow_playlist: playlist })
    .eq('id', event.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, count: playlist.length })
}

export async function GET(_req: NextRequest, { params }: { params: { eventSlug: string } }) {
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, slideshow_pin, slideshow_playlist, public_gallery')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  return NextResponse.json({
    slideshow_pin: event.slideshow_pin ?? '1234',
    slideshow_playlist: event.slideshow_playlist ?? [],
    public_gallery: event.public_gallery ?? false,
  })
}
