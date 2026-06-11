import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest) {
  return req.cookies.get('photographer_token')?.value === process.env.PHOTOGRAPHER_TOKEN
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId } = params

  // 1. Načti všechny fotky eventu
  const { data: photos } = await supabaseAdmin
    .from('photos')
    .select('id, storage_path')
    .eq('event_id', eventId)

  if (photos && photos.length > 0) {
    const photoIds = photos.map(p => p.id)
    const storagePaths = photos.map(p => p.storage_path).filter(Boolean)

    // 2. Smaž photo_guests
    await supabaseAdmin
      .from('photo_guests')
      .delete()
      .in('photo_id', photoIds)

    // 3. Smaž fotky z DB
    await supabaseAdmin
      .from('photos')
      .delete()
      .eq('event_id', eventId)

    // 4. Smaž fyzicky ze Storage
    if (storagePaths.length > 0) {
      await supabaseAdmin.storage
        .from('photos')
        .remove(storagePaths)
    }

    // 5. Vyčisti deleted_photos blacklist
    await supabaseAdmin
      .from('deleted_photos')
      .delete()
      .in('storage_path', storagePaths)
  }

  // 6. Reset photo_count hostů
  await supabaseAdmin
    .from('guests')
    .update({ photo_count: 0 })
    .eq('event_id', eventId)

  return NextResponse.json({ success: true, deleted: photos?.length ?? 0 })
}
