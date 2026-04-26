import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectCode, token, postIndex, status } = body
    if (!projectCode || !token || postIndex === undefined || !status) {
      return NextResponse.json({ ok: false, error: 'Chybí parametry' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const tokenHash = createHash('sha256').update(token.trim()).digest('hex')
    const { data: proj } = await supabase
      .from('projects')
      .select('id')
      .eq('project_code', projectCode)
      .eq('magic_token_hash', tokenHash)
      .single()

    if (!proj) return NextResponse.json({ ok: false, error: 'Neplatný přístup' }, { status: 401 })

    const { error } = await supabase.rpc('merge_raw_analysis', {
      p_project_id: proj.id,
      p_post_index: postIndex,
      p_status: status,
      p_hook: body.hook ?? null,
      p_body_text: body.body ?? null,
      p_scheduled_posts: body.scheduledPosts ? JSON.stringify(body.scheduledPosts) : null,
    })

    if (error) {
      console.error('RPC error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST-STATUS error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
