export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { uploadFile, getOrCreateFolder, makeFilePublic, getRootFolderId } from '@/lib/google-drive'

const MAX_SIZE = 8 * 1024 * 1024 // 8 MB

function isAuthorized(req: NextRequest) {
  return req.cookies.get('photographer_token')?.value === process.env.PHOTOGRAPHER_TOKEN
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Neplatný multipart/form-data' }, { status: 400 })
  }

  const eventId = formData.get('eventId')
  const orientation = formData.get('orientation')
  const file = formData.get('file')

  // --- basic field validation ---
  if (!eventId || typeof eventId !== 'string') {
    return NextResponse.json({ error: 'Chýba eventId' }, { status: 400 })
  }
  if (orientation !== 'portrait' && orientation !== 'landscape') {
    return NextResponse.json({ error: 'orientation musí byť "portrait" alebo "landscape"' }, { status: 400 })
  }
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Chýba súbor' }, { status: 400 })
  }

  // --- type validation ---
  if (file.type !== 'image/png') {
    return NextResponse.json({ error: 'Povolené sú iba PNG súbory' }, { status: 400 })
  }

  // --- size validation ---
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Súbor je príliš veľký (max 8 MB)' }, { status: 400 })
  }

  // --- verify event exists ---
  const { data: event, error: eventError } = await supabaseAdmin
    .from('events')
    .select('id, slug')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    return NextResponse.json({ error: 'Event neexistuje' }, { status: 404 })
  }

  // --- upload to Google Drive ---
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    const rootFolderId = getRootFolderId()
    const eventFolderId = await getOrCreateFolder(event.slug, rootFolderId)
    const overlaysFolderId = await getOrCreateFolder('overlays', eventFolderId)
    const fileId = await uploadFile(buffer, `${orientation}.png`, 'image/png', overlaysFolderId)
    const publicUrl = await makeFilePublic(fileId)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('Overlay Drive upload error:', err)
    return NextResponse.json(
      { error: 'Nahrávanie zlyhalo', detail: String(err) },
      { status: 500 },
    )
  }
}
