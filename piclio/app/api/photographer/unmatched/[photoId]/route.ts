import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest) {
  return req.cookies.get('photographer_token')?.value === process.env.PHOTOGRAPHER_TOKEN
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { photoId: string } }
) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photoId } = params
  const from = req.nextUrl.searchParams.get('from') // 'guest' nebo 'event'
  const guestId = req.nextUrl.searchParams.get('guestId')

  // Mazání z galerie hosta = jen odstranění z photo_guests
  if (from === 'guest' && guestId) {
    await supabaseAdmin
      .from('photo_guests')
      .delete()
      .eq('photo_id', photoId)
      .eq('guest_id', guestId)
    // Trigger automaticky nastaví status='unmatched' pokud žádný jiný guest nemá tuto fotku
    return NextResponse.json({ success: true })
  }

  // Mazání z galerie eventu = fyzické smazání
  const { data: photo } = await supabaseAdmin
    .from('photos')
    .select('storage_path, filename')
    .eq('id', photoId)
    .single()

  if (!photo) return NextResponse.json({ success: true })

  // Soft delete
  await supabaseAdmin
    .from('photos')
    .update({ is_deleted: true })
    .eq('id', photoId)

  // Blacklist
  await supabaseAdmin
    .from('deleted_photos')
    .upsert({ storage_path: photo.storage_path })

  // Fyzické smazání ze Storage
  await supabaseAdmin.storage
    .from('photos')
    .remove([photo.storage_path])

  // Smaž z backendu
  try {
    await fetch(`https://piclio-backend.fly.dev/photos/${photoId}`, { method: 'DELETE' })
  } catch (e) {
    console.error('Backend delete failed:', e)
  }

  return NextResponse.json({ success: true })
}
