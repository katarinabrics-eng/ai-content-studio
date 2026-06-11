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
  const approved: boolean = body.approved === true
  const notes: string = body.notes ?? ''

  const { error } = await supabaseAdmin
    .from('events')
    .update({ overlay_approved: approved, overlay_notes: notes })
    .eq('id', event.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, overlay_approved: approved })
}
