import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-server'
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
  const supabase = getSupabaseClient()
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex')
  const { data: proj } = await supabase
    .from('projects')
    .select('id')
    .eq('project_code', projectCode)
    .eq('magic_token_hash', tokenHash)
    .single()
  if (!proj) return NextResponse.json({ ok: false, error: 'Neplatný přístup' }, { status: 401 })

  const { data: brief } = await supabase
    .from('project_brief')
    .select('raw_analysis')
    .eq('project_id', proj.id)
    .single()

  const raw = (brief?.raw_analysis as Record<string, unknown>) ?? {}
  const postStatuses = (raw.postStatuses as Record<string, string>) ?? {}
  if (postIndex >= 0) {
    postStatuses[String(postIndex)] = status
  }

  const postDrafts = (raw.postDrafts as Record<string, { hook: string; body: string }>) ?? {}
  if (body.hook !== undefined || body.body !== undefined) {
    postDrafts[String(postIndex)] = {
      hook: body.hook ?? postDrafts[String(postIndex)]?.hook ?? '',
      body: body.body ?? postDrafts[String(postIndex)]?.body ?? '',
    }
  }

  // Zachovej existující scheduledPosts pokud přicházejí nové
  const newScheduledPosts = body.scheduledPosts !== undefined
    ? body.scheduledPosts
    : (raw.scheduledPosts ?? [])

  await supabase
    .from('project_brief')
    .update({ raw_analysis: { ...raw, postStatuses, postDrafts, scheduledPosts: newScheduledPosts }, updated_at: new Date().toISOString() })
    .eq('project_id', proj.id)

  console.log('POST-STATUS SAVED:', { projectId: proj?.id, postStatuses, postDrafts })

  return NextResponse.json({ ok: true })
}
