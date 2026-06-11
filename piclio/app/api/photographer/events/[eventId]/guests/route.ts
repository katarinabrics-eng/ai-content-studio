import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest) {
  return req.cookies.get('photographer_token')?.value === process.env.PHOTOGRAPHER_TOKEN
}

export async function GET(req: NextRequest, { params }: { params: { eventId: string } }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: guests, error } = await supabaseAdmin
    .from('guests')
    .select('id, email, name, badge_number, gallery_token, photo_count, email_sent_at, registered_at')
    .eq('event_id', params.eventId)
    .order('badge_number', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Jeden dotaz pro všechny hosty místo N+1
  const { data: photoGuestsCounts } = await supabaseAdmin
    .from('photo_guests')
    .select('guest_id, photo_id')
    .in('guest_id', (guests ?? []).map(g => g.id))

  const countMap = new Map<string, number>()
  for (const pg of photoGuestsCounts ?? []) {
    countMap.set(pg.guest_id, (countMap.get(pg.guest_id) ?? 0) + 1)
  }
  const guestsWithCount = (guests ?? []).map(g => ({
    ...g,
    photo_count: countMap.get(g.id) ?? 0,
  }))

  return NextResponse.json({ guests: guestsWithCount })
}

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, name } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const { data: existing } = await supabaseAdmin
    .from('guests')
    .select('id')
    .eq('event_id', params.eventId)
    .eq('email', email)
    .single()

  if (existing) return NextResponse.json({ error: 'Guest already exists' }, { status: 409 })

  const { data: maxRow } = await supabaseAdmin
    .from('guests')
    .select('badge_number')
    .eq('event_id', params.eventId)
    .order('badge_number', { ascending: false })
    .limit(1)
    .single()

  const badge_number = ((maxRow?.badge_number ?? 0) as number) + 1

  const { data: guest, error } = await supabaseAdmin
    .from('guests')
    .insert({ event_id: params.eventId, email, name: name || null, badge_number })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ guest }, { status: 201 })
}
