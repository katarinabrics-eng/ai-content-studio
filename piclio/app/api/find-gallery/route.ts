import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rawEmail: string = body.email ?? ''
  const email = rawEmail.toLowerCase().trim()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ found: false, error: 'Neplatný e-mail' }, { status: 400 })
  }

  // Find active event (or draft as fallback)
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .in('status', ['active', 'draft'])
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (!event) {
    return NextResponse.json({ found: false })
  }

  // Case-insensitive email lookup
  const { data: guest } = await supabaseAdmin
    .from('guests')
    .select('gallery_token, badge_number')
    .eq('event_id', event.id)
    .ilike('email', email)
    .single()

  if (!guest) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({
    found: true,
    galleryToken: guest.gallery_token,
    badgeNumber: guest.badge_number,
  })
}
