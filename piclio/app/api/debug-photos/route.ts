import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const event_id = '8367f248-7902-453b-a053-ec950f61bbe2'

  const { data, error } = await supabaseAdmin
    .from('photos')
    .select('id, filename, status')
    .eq('event_id', event_id)
    .order('filename')

  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key_prefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20),
    count: data?.length ?? 0,
    error: error?.message ?? null,
    photos: data?.map(p => ({ id: p.id.slice(0, 8), filename: p.filename, status: p.status }))
  })
}
