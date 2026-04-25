import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-server'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { projectCode, token, postIndex, status } = await req.json()
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
  postStatuses[String(postIndex)] = status

  await supabase
    .from('project_brief')
    .update({ raw_analysis: { ...raw, postStatuses }, updated_at: new Date().toISOString() })
    .eq('project_id', proj.id)

  return NextResponse.json({ ok: true })
}
