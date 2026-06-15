import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://piclio.vercel.app'

function isAuthorized(req: NextRequest) {
  return req.cookies.get('photographer_token')?.value === process.env.PHOTOGRAPHER_TOKEN
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { guestId } = await req.json()
  if (!guestId) return NextResponse.json({ error: 'Missing guestId' }, { status: 400 })

  const { data: guest, error: guestError } = await supabaseAdmin
    .from('guests')
    .select('id, email, badge_number, gallery_token, event_id')
    .eq('id', guestId)
    .single()

  if (guestError || !guest) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('name, brand_color, client_logo_url, email_subject, email_banner_url, email_btn_text_color, email_header_color')
    .eq('id', guest.event_id)
    .single()

  const eventName = event?.name ?? 'akci'
  const galleryUrl = `${APP_URL}/gallery/${guest.gallery_token}`
  const color = event?.brand_color || '#b7e94c'
  const headerBg = event?.email_header_color || '#1a1225'
  const btnTextColor = event?.email_btn_text_color || '#1a1225'
  const subject = event?.email_subject || `Vaše fotografie z akce ${eventName}`

  const headerHtml = event?.client_logo_url
    ? `<img src="${event.client_logo_url}" alt="${eventName}" style="max-height:60px;max-width:220px;object-fit:contain;" />`
    : `<div style="color:${color};font-size:24px;font-weight:500;letter-spacing:-0.5px;">Piclio</div>
       <div style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">by Lucifera Studio</div>`

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Piclio <noreply@piclio.cz>',
    to: [guest.email],
    subject,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:system-ui,sans-serif;background:#f5f5f5;margin:0;padding:20px;"><div style="max-width:500px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;"><div style="background:${headerBg};padding:32px;text-align:center;">${headerHtml}</div><div style="height:4px;background:${color};"></div>${event?.email_banner_url ? `<img src="${event.email_banner_url}" alt="" style="width:100%;display:block;max-height:160px;object-fit:cover;">` : ''}<div style="padding:32px;"><h2 style="font-size:20px;color:#1a1225;margin:0 0 8px;">Vítejte na ${eventName}!</h2><p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 24px;">Byli jste zaregistrováni pod číslem odznaku:</p><div style="background:#f9fafb;border:2px solid ${color};border-radius:10px;padding:16px 24px;text-align:center;margin-bottom:24px;"><div style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.08em;">Číslo vašeho odznaku</div><div style="font-size:40px;font-weight:900;color:#1a1225;line-height:1.1;">${guest.badge_number}</div></div><p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 24px;">Všechny vaše fotografie z večera najdete na tomto odkazu. Galerie se automaticky doplňuje v průběhu celé akce.</p><a href="${galleryUrl}" style="display:block;background:${color};color:${btnTextColor}!important;text-decoration:none!important;padding:14px 24px;border-radius:8px;font-weight:600;text-align:center;font-size:15px;">Otevřít moji galerii &rarr;</a></div><div style="padding:20px 32px;border-top:1px solid #f0f0f0;font-size:12px;color:#999;">Piclio by Lucifera Studio</div></div></body></html>`,
  })

  await supabaseAdmin
    .from('guests')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('id', guestId)

  return NextResponse.json({ sent: true })
}
