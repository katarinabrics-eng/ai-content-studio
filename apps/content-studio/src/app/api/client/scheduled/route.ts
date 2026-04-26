import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') ?? ''
  const token = req.nextUrl.searchParams.get('token') ?? ''
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const tokenHash = createHash('sha256').update(token.trim()).digest('hex')
  const { data: proj } = await supabase
    .from('projects').select('id')
    .eq('project_code', code)
    .eq('magic_token_hash', tokenHash)
    .single()
  if (!proj) return NextResponse.json({ ok: false }, { status: 401 })
  const { data: brief } = await supabase
    .from('project_brief')
    .select('raw_analysis')
    .eq('project_id', proj.id)
    .single()
  const raw = (brief?.raw_analysis as Record<string, unknown>) ?? {}
  const sp = raw.scheduledPosts
  const scheduledPosts = Array.isArray(sp) ? sp
    : typeof sp === 'string' ? JSON.parse(sp)
    : []
  return NextResponse.json({
    ok: true,
    scheduledPosts,
    postStatuses: raw.postStatuses ?? {},
  }, { headers: { 'Cache-Control': 'no-store' } })
}
