import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const eventName: string = (body.eventName ?? '').trim()

  // Resolve event: if eventName provided, find by name; otherwise newest active/draft
  let eventId: string | null = null
  if (eventName) {
    const { data: ev } = await supabaseAdmin
      .from('events')
      .select('id')
      .ilike('name', `%${eventName}%`)
      .in('status', ['active', 'draft'])
      .order('date', { ascending: false })
      .limit(1)
      .single()
    eventId = ev?.id ?? null
  } else {
    const { data: ev } = await supabaseAdmin
      .from('events')
      .select('id')
      .in('status', ['active', 'draft'])
      .order('date', { ascending: false })
      .limit(1)
      .single()
    eventId = ev?.id ?? null
  }

  if (!eventId) {
    return NextResponse.json({ found: false })
  }

  // Search by badge number
  if (body.badgeNumber !== undefined && body.badgeNumber !== '') {
    const badge = Number(body.badgeNumber)
    if (!Number.isInteger(badge) || badge <= 0) {
      return NextResponse.json({ found: false, error: 'Neplatné číslo odznaku' }, { status: 400 })
    }
    const { data: guest } = await supabaseAdmin
      .from('guests')
      .select('gallery_token, badge_number')
      .eq('event_id', eventId)
      .eq('badge_number', badge)
      .single()

    if (!guest) return NextResponse.json({ found: false })
    return NextResponse.json({ found: true, galleryToken: guest.gallery_token, badgeNumber: guest.badge_number })
  }

  // Search by email
  const rawEmail: string = body.email ?? ''
  const email = rawEmail.toLowerCase().trim()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ found: false, error: 'Neplatný e-mail' }, { status: 400 })
  }

  const { data: guest } = await supabaseAdmin
    .from('guests')
    .select('gallery_token, badge_number')
    .eq('event_id', eventId)
    .ilike('email', email)
    .single()

  if (!guest) return NextResponse.json({ found: false })
  return NextResponse.json({ found: true, galleryToken: guest.gallery_token, badgeNumber: guest.badge_number })
}
