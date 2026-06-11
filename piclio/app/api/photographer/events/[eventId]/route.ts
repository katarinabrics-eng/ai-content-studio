export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

function isAuthorized(req: NextRequest) {
  return req.cookies.get('photographer_token')?.value === process.env.PHOTOGRAPHER_TOKEN
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId } = params

  // 1. photo_guests pro fotky tohoto eventu
  const { data: photos } = await supabaseAdmin
    .from('photos')
    .select('id')
    .eq('event_id', eventId)

  if (photos && photos.length > 0) {
    await supabaseAdmin
      .from('photo_guests')
      .delete()
      .in('photo_id', photos.map(p => p.id))
  }

  // 2. photos
  await supabaseAdmin.from('photos').delete().eq('event_id', eventId)

  // 3. guests
  await supabaseAdmin.from('guests').delete().eq('event_id', eventId)

  // 4. event
  const { error } = await supabaseAdmin.from('events').delete().eq('id', eventId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
