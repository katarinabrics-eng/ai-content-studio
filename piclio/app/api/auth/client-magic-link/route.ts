import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import crypto from 'crypto'

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://piclio.vercel.app'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rawEmail: string = body.email ?? ''
  const email = rawEmail.toLowerCase().trim()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Neplatný e-mail' }, { status: 400 })
  }

  // Find event where client_email matches
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, name, slug, client_email')
    .ilike('client_email', email)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Email nebyl nalezen. Ověřte adresu nebo kontaktujte fotografa.' }, { status: 404 })
  }

  // Generate 32-char random token
  const token = crypto.randomBytes(16).toString('hex')
  const dashboardUrl = `${APP_URL}/dashboard/client/${event.slug}?token=${token}`

  // Try to save token — best-effort (column may not exist yet)
  const { error: tokenError } = await supabaseAdmin
    .from('events')
    .update({ client_access_token: token })
    .eq('id', event.id)
  if (tokenError) console.warn('client_access_token update failed:', tokenError.message)

  // Send magic link email via Resend
  try {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('No RESEND_API_KEY')
    const { Resend } = await import('resend')
    const resend = new Resend(key)

    await resend.emails.send({
      from: 'Piclio <noreply@piclio.cz>',
      to: [email],
      subject: `Váš přístup k projektu ${event.name}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: #1a1225; padding: 32px; text-align: center; }
    .logo { color: #b7e94c; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .logo-sub { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
    .body { padding: 32px; }
    .title { font-size: 20px; color: #1a1225; margin: 0 0 12px; font-weight: 700; }
    .text { color: #555; font-size: 14px; line-height: 1.7; margin: 0 0 24px; }
    .btn { display: block; background: #b7e94c; color: #1a1225; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 700; text-align: center; font-size: 15px; }
    .note { font-size: 12px; color: #999; margin-top: 20px; }
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
      <h2 class="title">Váš přístup k projektu ${event.name}</h2>
      <p class="text">
        Kliknutím na tlačítko níže získáte přístup k vašemu projektovému dashboardu,
        kde najdete fotografie, statistiky a nastavení akce.
      </p>
      <a href="${dashboardUrl}" class="btn">Otevřít dashboard &rarr;</a>
      <p class="note">Odkaz je platný pro jednorázové přihlášení. Pokud jste o přístup nežádali, tento email ignorujte.</p>
    </div>
    <div class="footer">Piclio by Lucifera Studio</div>
  </div>
</body>
</html>`,
    })
  } catch (err) {
    console.error('Magic link email failed:', err)
    return NextResponse.json({ error: 'Nepodařilo se odeslat email' }, { status: 500 })
  }

  return NextResponse.json({ sent: true })
}
