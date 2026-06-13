import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { eventSlug: string } }
) {
  const { email, photoId } = await req.json()

  if (!email || !photoId) {
    return NextResponse.json({ error: 'email and photoId required' }, { status: 400 })
  }

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, gallery_public')
    .eq('slug', params.eventSlug)
    .single()

  if (!event) return NextResponse.json({ error: 'Event nenalezen' }, { status: 404 })
  if (!event.gallery_public) return NextResponse.json({ error: 'Galerie není veřejná' }, { status: 403 })

  // Najdi hosta podle emailu v tomto eventu
  const { data: guest } = await supabaseAdmin
    .from('guests')
    .select('id, gallery_token')
    .eq('event_id', event.id)
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!guest) {
    return NextResponse.json({ error: 'Host s tímto e-mailem není registrován na této akci' }, { status: 404 })
  }

  // Ověř že fotka patří do tohoto eventu
  const { data: photo } = await supabaseAdmin
    .from('photos')
    .select('id, event_id')
    .eq('id', photoId)
    .eq('event_id', event.id)
    .single()

  if (!photo) return NextResponse.json({ error: 'Fotka nenalezena' }, { status: 404 })

  // Přidej fotku do galerie hosta
  const { error: insertError } = await supabaseAdmin
    .from('photo_guests')
    .insert({ photo_id: photoId, guest_id: guest.id, assigned_by: 'manual' })

  if (insertError && insertError.code !== '23505') {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Zaindexuj obličej z fotky pro budoucí automatické párování — best-effort
  const backendUrl = process.env.BACKEND_URL ?? 'https://piclio-backend.fly.dev'
  fetch(`${backendUrl}/index-face`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo_id: photoId, guest_id: guest.id, event_id: event.id }),
  }).catch(e => console.warn('index-face call failed:', e))

  return NextResponse.json({ ok: true, galleryToken: guest.gallery_token })
}
