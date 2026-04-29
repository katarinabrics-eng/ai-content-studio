import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { email, faceImageBase64 } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  // Find active event (first by date), fallback to draft
  let { data: activeEvent } = await supabase
    .from('events')
    .select('id, max_guests')
    .eq('status', 'active')
    .order('date', { ascending: true })
    .limit(1)
    .single()

  if (!activeEvent) {
    const { data: draftEvent } = await supabase
      .from('events')
      .select('id, max_guests')
      .eq('status', 'draft')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    activeEvent = draftEvent
  }

  if (!activeEvent) {
    return NextResponse.json({ error: 'No event found' }, { status: 404 })
  }

  // Return existing guest if email already registered
  const { data: existing } = await supabase
    .from('guests')
    .select('id, badge_number, gallery_token')
    .eq('event_id', activeEvent.id)
    .eq('email', email)
    .single()

  if (existing) {
    return NextResponse.json({
      badgeNumber: existing.badge_number,
      galleryToken: existing.gallery_token,
      existing: true,
    })
  }

  // Assign next badge number
  const { data: lastGuest } = await supabase
    .from('guests')
    .select('badge_number')
    .eq('event_id', activeEvent.id)
    .not('badge_number', 'is', null)
    .order('badge_number', { ascending: false })
    .limit(1)
    .single()

  const nextBadgeNumber = (lastGuest?.badge_number ?? 0) + 1

  // Create guest
  const { data: newGuest, error } = await supabase
    .from('guests')
    .insert({
      event_id: activeEvent.id,
      email: email.toLowerCase().trim(),
      badge_number: nextBadgeNumber,
      gdpr_consent: true,
      registered_at: new Date().toISOString(),
    })
    .select('id, badge_number, gallery_token')
    .single()

  if (error || !newGuest) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 })
  }

  // Store selfie — best-effort, non-blocking
  if (faceImageBase64) {
    try {
      const base64Data = faceImageBase64.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      await supabase.storage.createBucket('selfies', { public: false }).catch(() => {})
      await supabase.storage
        .from('selfies')
        .upload(`${activeEvent.id}/${newGuest.id}.jpg`, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })
    } catch {
      console.log(`Face image received for guest ${newGuest.id}, length: ${faceImageBase64.length}`)
    }
  }

  return NextResponse.json({
    badgeNumber: newGuest.badge_number,
    galleryToken: newGuest.gallery_token,
  })
}
