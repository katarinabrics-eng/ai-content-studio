import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectCode, token, postIndex, status } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const tokenHash = createHash('sha256').update(token.trim()).digest('hex')
    const { data: proj } = await supabase
      .from('projects').select('id')
      .eq('project_code', projectCode)
      .eq('magic_token_hash', tokenHash)
      .single()

    if (!proj) return NextResponse.json({ ok: false }, { status: 401 })

    const { data: brief } = await supabase
      .from('project_brief')
      .select('raw_analysis')
      .eq('project_id', proj.id)
      .single()

    const raw = { ...((brief?.raw_analysis as Record<string, unknown>) ?? {}) }

    if (postIndex >= 0) {
      const statuses = { ...((raw.postStatuses as Record<string, string>) ?? {}) }
      statuses[String(postIndex)] = status
      raw.postStatuses = statuses
    }

    if (body.hook !== undefined || body.body !== undefined) {
      const drafts = { ...((raw.postDrafts as Record<string, unknown>) ?? {}) }
      drafts[String(postIndex)] = { hook: body.hook ?? '', body: body.body ?? '' }
      raw.postDrafts = drafts
    }

    if (Array.isArray(body.scheduledPosts)) {
      raw.scheduledPosts = body.scheduledPosts
    }
    // Ak scheduledPosts nepríde — zachovaj existujúce z raw (nemeň nič)

    console.log('POST-STATUS saving:', { projectId: proj.id, postIndex, status, postStatuses: raw.postStatuses })

    const { error: updateError } = await supabase
      .from('project_brief')
      .update({ raw_analysis: raw, updated_at: new Date().toISOString() })
      .eq('project_id', proj.id)

    if (updateError) {
      console.error('POST-STATUS update error:', updateError)
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 })
    }

    console.log('POST-STATUS saved OK')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST-STATUS catch:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
