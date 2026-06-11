import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { photoId } = await req.json()
  if (!photoId) return NextResponse.json({ error: 'photoId required' }, { status: 400 })

  const { data: guest } = await supabaseAdmin
    .from('guests')
    .select('id')
    .eq('gallery_token', params.token)
    .single()

  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Odeber fotku z galerie hosta — fotka zůstane v Fotky z eventu
  await supabaseAdmin
    .from('photo_guests')
    .delete()
    .eq('photo_id', photoId)
    .eq('guest_id', guest.id)

  // DB trigger automaticky nastaví status='unmatched' pokud nikdo jiný fotku nemá

  return NextResponse.json({ success: true })
}
