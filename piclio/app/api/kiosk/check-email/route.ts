export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  const eventId = req.nextUrl.searchParams.get('eventId')

  if (!email || !eventId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const { data } = await supabase
    .from('guests')
    .select('id, badge_number')
    .eq('event_id', eventId)
    .eq('email', email.toLowerCase().trim())
    .single()

  if (data) return NextResponse.json({ exists: true, badgeNumber: data.badge_number })
  return NextResponse.json({ exists: false, badgeNumber: null })
}
