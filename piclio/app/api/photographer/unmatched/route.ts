import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signPhotosRobust } from '@/lib/supabase/signPhotosRobust'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest) {
  return req.cookies.get('photographer_token')?.value === process.env.PHOTOGRAPHER_TOKEN
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const eventId = req.nextUrl.searchParams.get('eventId')
  if (!eventId) return NextResponse.json({ photos: [] })

  // Priamy REST fetch — obíde Supabase JS SDK stale data bug
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const params = new URLSearchParams({
    select: 'id,filename,storage_path,original_path,uploaded_at,ocr_number,event_id,status',
    event_id: `eq.${eventId}`,
    is_deleted: 'neq.true',
    order: 'uploaded_at.desc',
  })

  const resp = await fetch(`${url}/rest/v1/photos?${params}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Cache-Control': 'no-store',
    },
    cache: 'no-store',
  })

  const photos = await resp.json()

  if (!Array.isArray(photos) || photos.length === 0) return NextResponse.json({ photos: [] })

  const validPhotos = photos.filter((p: any) => p.storage_path && p.storage_path.trim() !== '')

  const { data: deleted } = await supabaseAdmin.from('deleted_photos').select('storage_path')
  const deletedPaths = new Set((deleted ?? []).map((d: any) => d.storage_path))
  const filtered = validPhotos.filter((p: any) => !deletedPaths.has(p.storage_path))

  if (filtered.length === 0) return NextResponse.json({ photos: [] })

  const photosWithUrls = await signPhotosRobust(filtered, 86400)

  const result = photosWithUrls.map((p: any) => ({
    ...p,
    status: filtered.find((f: any) => f.id === p.id)?.status ?? 'unmatched',
  }))

  return NextResponse.json(
    { photos: result },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  )
}
