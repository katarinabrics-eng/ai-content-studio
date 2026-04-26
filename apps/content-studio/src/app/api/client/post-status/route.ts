import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { projectCode, token, postIndex, status } = body
  console.log('POST-STATUS REQUEST:', { projectCode, postIndex, status, hasHook: !!body.hook, hasBody: !!body.body })
  if (!projectCode || !token || postIndex === undefined || !status) {
    return NextResponse.json({ ok: false, error: 'Chybí parametry' }, { status: 400 })
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex')
  const { data: proj } = await supabase
    .from('projects')
    .select('id')
    .eq('project_code', projectCode)
    .eq('magic_token_hash', tokenHash)
    .single()
  if (!proj) return NextResponse.json({ ok: false, error: 'Neplatný přístup' }, { status: 401 })

  await supabase.rpc('merge_raw_analysis', {
    p_project_id: proj.id,
    p_post_index: postIndex,
    p_status: status,
    p_hook: body.hook ?? null,
    p_body_text: body.body ?? null,
    p_scheduled_posts: body.scheduledPosts ?? null,
  })

  console.log('POST-STATUS SAVED:', { projectId: proj?.id, postStatuses, postDrafts })

  return NextResponse.json({ ok: true })
}
