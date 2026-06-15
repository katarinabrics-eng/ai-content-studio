import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest) {
  return req.cookies.get('photographer_token')?.value === process.env.PHOTOGRAPHER_TOKEN
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
  }).catch(err => console.error('Invite email failed:', err))
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: events } = await supabaseAdmin
    .from('events')
    .select('id, name, slug, date, location, status, max_guests, client_name, client_email, brand_color, client_logo_url, overlay_portrait_url, overlay_landscape_url, overlay_status, overlay_approved_by, overlay_notes, overlay_approved, overlay_mode, description, photographer_notes, info_notes, email_banner_url, email_subject, email_body, email_btn_text_color, email_header_color, event_type, gallery_public, slideshow_bg, slideshow_bar_color, slideshow_bar_enabled')
    .order('date', { ascending: false })

  if (!events) return NextResponse.json({ events: [] })

  const eventsWithStats = await Promise.all(events.map(async (event) => {
    const [
      { count: guestCount },
      { count: deliveredCount },
      { data: eventPhotos },
    ] = await Promise.all([
      supabaseAdmin.from('guests').select('*', { count: 'exact', head: true }).eq('event_id', event.id),
      supabaseAdmin.from('guests').select('*', { count: 'exact', head: true }).eq('event_id', event.id).not('email_sent_at', 'is', null),
      supabaseAdmin.from('photos').select('id, status').eq('event_id', event.id).neq('is_deleted', true),
    ])

    const photoCount = eventPhotos?.length ?? 0
    const unmatchedCount = eventPhotos?.filter(p => p.status === 'unmatched').length ?? 0
    const matchedCount = eventPhotos?.filter(p => p.status === 'matched').length ?? 0

    return { ...event, guestCount: guestCount ?? 0, photoCount, unmatchedCount, matchedCount, deliveredCount: deliveredCount ?? 0 }
  }))

  return NextResponse.json({ events: eventsWithStats })
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, name, date, location, maxGuests, clientName, clientEmail, brandColor, overlayPortraitUrl, overlayLandscapeUrl, overlayStatus, overlayApprovedBy, overlayMode, description, photographerNotes, infoNotes, emailBannerUrl, emailSubject, emailBody, emailBtnTextColor, emailHeaderColor, eventCategory, slideshowWelcomeText } = body

  if (!id) return NextResponse.json({ error: 'Chybí id' }, { status: 400 })

  // Načti aktuální stav před updatem — potřebujeme porovnat client_email
  const { data: existing } = await supabaseAdmin
    .from('events')
    .select('client_email, client_name, name, slug')
    .eq('id', id)
    .single()

  const updatePayload: Record<string, unknown> = {}
  if (name !== undefined) { updatePayload.name = name; updatePayload.slug = toSlug(name) }
  if (date !== undefined) updatePayload.date = date
  if (location !== undefined) updatePayload.location = location
  if (maxGuests !== undefined) updatePayload.max_guests = maxGuests
  if (clientName !== undefined) updatePayload.client_name = clientName
  if (clientEmail !== undefined) updatePayload.client_email = clientEmail
  if (brandColor !== undefined) updatePayload.brand_color = brandColor
  if (overlayPortraitUrl !== undefined) updatePayload.overlay_portrait_url = overlayPortraitUrl
  if (overlayLandscapeUrl !== undefined) updatePayload.overlay_landscape_url = overlayLandscapeUrl
  if (overlayStatus !== undefined) updatePayload.overlay_status = overlayStatus
  if (overlayApprovedBy !== undefined) updatePayload.overlay_approved_by = overlayApprovedBy
  if (overlayMode !== undefined) updatePayload.overlay_mode = overlayMode
  if (description !== undefined) updatePayload.description = description
  if (photographerNotes !== undefined) updatePayload.photographer_notes = photographerNotes
  if (infoNotes !== undefined) updatePayload.info_notes = infoNotes
  if (emailBannerUrl !== undefined) updatePayload.email_banner_url = emailBannerUrl
  if (emailSubject !== undefined) updatePayload.email_subject = emailSubject
  if (emailBody !== undefined) updatePayload.email_body = emailBody
  if (emailBtnTextColor !== undefined) updatePayload.email_btn_text_color = emailBtnTextColor
  if (emailHeaderColor !== undefined) updatePayload.email_header_color = emailHeaderColor
  if (eventCategory !== undefined) updatePayload.event_category = eventCategory
  if (slideshowWelcomeText !== undefined) updatePayload.slideshow_welcome_text = slideshowWelcomeText
  if (body.slideshowBg !== undefined) updatePayload.slideshow_bg = body.slideshowBg
  if (body.slideshowBarEnabled !== undefined) updatePayload.slideshow_bar_enabled = body.slideshowBarEnabled
  if (body.slideshowBarColor !== undefined) updatePayload.slideshow_bar_color = body.slideshowBarColor
  if (body.slideshowOverlayMode !== undefined) updatePayload.slideshow_overlay_mode = body.slideshowOverlayMode
  if (body.clientLogoUrl !== undefined) updatePayload.client_logo_url = body.clientLogoUrl
  if (body.face_detection !== undefined) updatePayload.face_detection = body.face_detection
  if (body.manual_badge_entry !== undefined) updatePayload.manual_badge_entry = body.manual_badge_entry
  if (body.status !== undefined && ['draft', 'active', 'done'].includes(body.status)) updatePayload.status = body.status

  const { data: event, error } = await supabaseAdmin
    .from('events')
    .update(updatePayload)
    .eq('id', id)
    .select('id, name, slug, date, location, status, max_guests, client_name, client_email')
    .single()

  if (error || !event) {
    console.error('Update event error:', error)
    return NextResponse.json({ error: 'Nepodařilo se aktualizovat event', detail: error?.message }, { status: 500 })
  }

  // Pokud se změnil client_email — odešli pozvánku na nový email
  const newEmail = clientEmail ?? existing?.client_email
  if (
    clientEmail !== undefined &&
    clientEmail &&
    clientEmail !== existing?.client_email
  ) {
    const resolvedName = clientName ?? existing?.client_name ?? ''
    const resolvedEventName = name ?? existing?.name ?? ''
    const resolvedSlug = name ? toSlug(name) : (existing?.slug ?? '')
    sendInviteEmail(clientEmail, resolvedName, resolvedEventName, resolvedSlug).catch(() => {})
  }

  return NextResponse.json({ event })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, date, location, maxGuests, clientName, clientEmail, brandColor } = body

  if (!name || !date || !location) {
    return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 })
  }
  if (body.event_type !== 'simple' && (!clientName || !clientEmail)) {
    return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 })
  }

  const slug = toSlug(name)

  // Try insert with client_email; if column missing, retry without it
  let event: Record<string, unknown> | null = null
  let insertError: { message: string; code?: string } | null = null

  const insertPayload: Record<string, unknown> = {
    name,
    slug,
    date,
    location,
    max_guests: maxGuests ?? 100,
    client_name: clientName,
    client_email: clientEmail,
    brand_color: brandColor ?? '#b7e94c',
    status: 'draft',
    event_type: body.event_type ?? 'ai',
    gallery_public: body.gallery_public ?? false,
  }

  const res1 = await supabaseAdmin
    .from('events')
    .insert(insertPayload)
    .select('id, name, slug, date, location, status, max_guests, client_name')
    .single()

  if (res1.error?.message?.includes('client_email')) {
    // Column doesn't exist yet — insert without it
    console.warn('client_email column missing, inserting without it')
    delete insertPayload.client_email
    const res2 = await supabaseAdmin
      .from('events')
      .insert(insertPayload)
      .select('id, name, slug, date, location, status, max_guests, client_name')
      .single()
    event = res2.data
    insertError = res2.error
  } else {
    event = res1.data
    insertError = res1.error
  }

  if (insertError || !event) {
    console.error('Create event error:', insertError)
    return NextResponse.json({ error: 'Nepodařilo se vytvořit event', detail: insertError?.message }, { status: 500 })
  }

  // Send invite email — best-effort
  sendInviteEmail(clientEmail, clientName, name, slug).catch(() => {})

  return NextResponse.json({
    event: { ...event, guestCount: 0, photoCount: 0, unmatchedCount: 0, deliveredCount: 0 },
  })
}
