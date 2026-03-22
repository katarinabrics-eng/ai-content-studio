import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-server'
import { parseHiggsfieldWebhook, isHiggsfieldCompleted } from '@/lib/agents/higgsfield'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = parseHiggsfieldWebhook(body)
    const supabase = getSupabaseClient()

    if (isHiggsfieldCompleted(payload)) {
      const outputUrl = payload.video?.url ?? payload.images?.[0]?.url ?? null
      if (outputUrl) {
        await supabase
          .from('content_posts')
          .update({ output_url: outputUrl, status: 'pending', updated_at: new Date().toISOString() })
          .eq('higgsfield_request_id', payload.request_id)
      }
    } else if (payload.status === 'failed' || payload.status === 'nsfw') {
      await supabase
        .from('content_posts')
        .update({ status: 'rejected', curator_note: `Higgsfield ${payload.status}`, updated_at: new Date().toISOString() })
        .eq('higgsfield_request_id', payload.request_id)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[higgsfield webhook]', e)
    return NextResponse.json({ ok: true })
  }
}
