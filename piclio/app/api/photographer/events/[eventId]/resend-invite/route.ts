export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

function isAuthorized(req: NextRequest) {
  return req.cookies.get('photographer_token')?.value === process.env.PHOTOGRAPHER_TOKEN
}

async function sendInviteEmail(
  clientEmail: string,
  clientName: string,
  eventName: string,
  slug: string,
): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  const { Resend } = await import('resend')
  const resend = new Resend(key)
  const APP_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://piclio.vercel.app'
  const dashboardUrl = `${APP_URL}/dashboard/client/${slug}`

  await resend.emails.send({
    from: 'Piclio <noreply@piclio.cz>',
    to: [clientEmail],
    subject: `Byli jste přizváni ke spolupráci na eventu ${eventName}`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: #1a1225; padding: 32px; text-align: center; }
    .logo { color: #b7e94c; font-size: 24px; font-weight: 500; letter-spacing: -0.5px; }
    .logo-sub { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
    .body { padding: 32px; }
    .title { font-size: 20px; color: #1a1225; margin: 0 0 12px; }
    .text { color: #555; font-size: 14px; line-height: 1.7; margin: 0 0 24px; }
    .btn { display: block; background: #b7e94c; color: #1a1225; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 700; text-align: center; font-size: 15px; }
    .footer { padding: 20px 32px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Piclio</div>
      <div class="logo-sub">by Lucifera Studio</div>
    </div>
    <div class="body">
      <h2 class="title">Dobrý den, ${clientName}!</h2>
      <p class="text">
        Fotograf vás přizval ke spolupráci na akci <strong>${eventName}</strong>.<br>
        Kliknutím na odkaz níže získáte přístup k dashboardu, kde můžete nahrát logo,
        barvy a požadavky k akci.
      </p>
      <a href="${dashboardUrl}" class="btn">Otevřít dashboard &rarr;</a>
    </div>
    <div class="footer">Piclio by Lucifera Studio</div>
  </div>
</body>
</html>`,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, name, slug, client_email, client_name')
    .eq('id', params.eventId)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  if (!event.client_email) return NextResponse.json({ error: 'Event nemá email zadavatele' }, { status: 400 })

  try {
    await sendInviteEmail(event.client_email, event.client_name ?? '', event.name, event.slug)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Odeslání selhalo' }, { status: 500 })
  }
}
