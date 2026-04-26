import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, postIndex, status } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Auth: look up by magic_token_hash only — token uniquely identifies project
    const tokenHash = createHash('sha256').update(token.trim()).digest('hex')
    const { data: proj } = await supabase
      .from('projects').select('id')
      .eq('magic_token_hash', tokenHash)
      .maybeSingle()

    if (!proj) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    // Read current brief — order by updated_at DESC to handle multiple rows safely
    const { data: briefs } = await supabase
      .from('project_brief')
      .select('id, raw_analysis')
      .eq('project_id', proj.id)
      .order('updated_at', { ascending: false })
      .limit(1)

    const brief = briefs?.[0] ?? null
    const briefId = (brief as Record<string, unknown> | null)?.id as string | undefined
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

    console.log('POST-STATUS saving:', { projectId: proj.id, briefId, postIndex, status, postStatuses: raw.postStatuses })

    // Update the specific row by its id when possible, otherwise fall back to project_id
    const updateQuery = supabase
      .from('project_brief')
      .update({ raw_analysis: raw, updated_at: new Date().toISOString() })

    const { error: updateError } = briefId
      ? await updateQuery.eq('id', briefId)
      : await updateQuery.eq('project_id', proj.id)

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
