import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { eventSlug: string } }) {
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('slug, slideshow_content, slideshow_selected_guests, slideshow_output, slideshow_interval, slideshow_animation, slideshow_layout')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  return NextResponse.json({ settings: event })
}

export async function PATCH(req: NextRequest, { params }: { params: { eventSlug: string } }) {
  const body = await req.json()

  const allowed = [
    'slideshow_content',
    'slideshow_selected_guests',
    'slideshow_output',
    'slideshow_interval',
    'slideshow_animation',
    'slideshow_layout',
  ]
  const patch = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('events')
    .update(patch)
    .eq('slug', params.eventSlug)
    .select('slug, slideshow_content, slideshow_selected_guests, slideshow_output, slideshow_interval, slideshow_animation, slideshow_layout')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}
