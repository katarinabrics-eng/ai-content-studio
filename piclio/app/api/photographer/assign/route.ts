import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest) {
  return req.cookies.get('photographer_token')?.value === process.env.PHOTOGRAPHER_TOKEN
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photoId, guestId } = await req.json()
  if (!photoId || !guestId) {
    return NextResponse.json({ error: 'photoId and guestId are required' }, { status: 400 })
  }

  // Zkopíruj fotku do galerie hosta (upsert = bezpečné při opakování)
  const { error: pgError } = await supabaseAdmin
    .from('photo_guests')
    .upsert(
      { photo_id: photoId, guest_id: guestId, assigned_by: 'manual' },
      { onConflict: 'photo_id,guest_id' }
    )

  if (pgError) return NextResponse.json({ error: pgError.message }, { status: 500 })

  // DB trigger automaticky nastaví status='matched'
  // photo_count se počítá živě z photo_guests

  // Index face do Rekognition — best-effort
  try {
    const { data: photo } = await supabaseAdmin
      .from('photos')
      .select('event_id')
      .eq('id', photoId)
      .single()

    if (photo?.event_id) {
      const backendUrl = process.env.BACKEND_URL ?? 'https://piclio-backend.fly.dev'
      fetch(`${backendUrl}/index-face`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_id: photoId, guest_id: guestId, event_id: photo.event_id }),
      }).catch(e => console.warn('index-face call failed:', e))
    }
  } catch (e) {
    console.warn('index-face setup failed:', e)
  }

  return NextResponse.json({ success: true })
}
