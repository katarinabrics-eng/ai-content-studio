export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { email, eventId } = await req.json()
  if (!email || !eventId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const { data: guest } = await supabase
    .from('guests')
    .select('id')
    .eq('event_id', eventId)
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })

  const { data: lastGuest } = await supabase
    .from('guests')
    .select('badge_number')
    .eq('event_id', eventId)
    .not('badge_number', 'is', null)
    .order('badge_number', { ascending: false })
    .limit(1)
    .single()

  const newBadgeNumber = (lastGuest?.badge_number ?? 0) + 1

  const { error } = await supabase
    .from('guests')
    .update({ badge_number: newBadgeNumber })
    .eq('id', guest.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ badgeNumber: newBadgeNumber })
}
