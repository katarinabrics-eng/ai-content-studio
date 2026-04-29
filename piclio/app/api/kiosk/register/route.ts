import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { email, eventId, faceBase64 } = await req.json()

  if (!email || !eventId) {
    return NextResponse.json({ error: 'Chybí email nebo eventId' }, { status: 400 })
  }

  // 1. Verify event exists and is active
  const { data: event, error: eventError } = await supabaseAdmin
    .from('events')
    .select('id, status, max_guests')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    return NextResponse.json({ error: 'Event nenalezen' }, { status: 404 })
  }
  if (event.status === 'archived' || event.status === 'completed') {
    return NextResponse.json({ error: 'Registrace na tento event je uzavřena' }, { status: 403 })
  }

  // 2. Check if guest already registered (return existing badge)
  const { data: existing } = await supabaseAdmin
    .from('guests')
    .select('id, badge_number')
    .eq('event_id', eventId)
    .eq('email', email)
    .maybeSingle()

  if (existing?.badge_number != null) {
    return NextResponse.json({ badgeNumber: existing.badge_number, guestId: existing.id })
  }

  // 3. Insert new guest (or get id if inserted by race)
  const { data: guest, error: guestError } = await supabaseAdmin
    .from('guests')
    .upsert(
      { event_id: eventId, email, gdpr_consent: true },
      { onConflict: 'event_id,email' }
    )
    .select('id, badge_number')
    .single()

  if (guestError || !guest) {
    return NextResponse.json({ error: 'Chyba při registraci hosta' }, { status: 500 })
  }

  // 4. Store selfie in Supabase Storage (non-blocking, best-effort)
  if (faceBase64) {
    try {
      const base64Data = faceBase64.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      // Create bucket if it doesn't exist yet
      await supabaseAdmin.storage.createBucket('selfies', { public: false }).catch(() => {})

      await supabaseAdmin.storage
        .from('selfies')
        .upload(`${eventId}/${guest.id}.jpg`, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })
    } catch {
      // Non-fatal — face matching can be skipped or retried later
    }
  }

  // 5. Assign badge number
  // Try a pre-seeded unissued badge first
  const { data: availableBadge } = await supabaseAdmin
    .from('badges')
    .select('id, number')
    .eq('event_id', eventId)
    .eq('issued', false)
    .is('guest_id', null)
    .order('number', { ascending: true })
    .limit(1)
    .maybeSingle()

  let badgeNumber: number

  if (availableBadge) {
    await supabaseAdmin
      .from('badges')
      .update({ guest_id: guest.id, issued: true, issued_at: new Date().toISOString() })
      .eq('id', availableBadge.id)
    badgeNumber = availableBadge.number
  } else {
    // Auto-generate: next sequential number based on guest count
    const { count } = await supabaseAdmin
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    badgeNumber = count ?? 1
  }

  // 6. Persist badge number on guest
  await supabaseAdmin
    .from('guests')
    .update({ badge_number: badgeNumber })
    .eq('id', guest.id)

  return NextResponse.json({ badgeNumber, guestId: guest.id })
}
