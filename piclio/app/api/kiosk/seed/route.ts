import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('events')
    .upsert(
      {
        name: 'Testovací event',
        slug: 'test-event',
        date: '2026-06-17',
        location: 'Voděrádky u Prahy',
        max_guests: 300,
        status: 'active',
        client_name: 'Testovací klient',
        brand_color: '#b7e94c',
        delivery_mode: 'realtime',
      },
      { onConflict: 'slug' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true, event: data })
}
