import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import {
  RekognitionClient,
  CreateCollectionCommand,
  IndexFacesCommand,
} from '@aws-sdk/client-rekognition'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://piclio.vercel.app'

function getRekognitionClient() {
  return new RekognitionClient({
    region: process.env.AWS_REGION ?? 'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
}

async function sendRegistrationEmail(
  email: string,
  galleryToken: string,
  badgeNumber: number,
  eventName: string
): Promise<void> {
  const galleryUrl = `${APP_URL}/gallery/${galleryToken}`
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Piclio <noreply@piclio.cz>',
      to: [email],
      subject: `Vítejte na ${eventName} — zde najdete své fotografie`,
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
    .title { font-size: 20px; color: #1a1225; margin: 0 0 8px; }
    .subtitle { color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
    .badge-box { background: #f9fafb; border: 2px solid #b7e94c; border-radius: 10px; padding: 16px 24px; text-align: center; margin-bottom: 24px; }
    .badge-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.08em; }
    .badge-number { font-size: 40px; font-weight: 900; color: #1a1225; line-height: 1.1; }
    .btn { display: block; background: #b7e94c; color: #1a1225; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; font-size: 15px; }
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
      <h2 class="title">Vítejte na ${eventName}!</h2>
      <p class="subtitle">Byli jste zaregistrováni pod číslem odznaku:</p>
      <div class="badge-box">
        <div class="badge-label">Číslo vašeho odznaku</div>
        <div class="badge-number">${badgeNumber}</div>
      </div>
      <p class="subtitle">
        Všechny vaše fotografie z večera najdete na tomto odkazu.
        Galerie se automaticky doplňuje v průběhu celé akce.
      </p>
      <a href="${galleryUrl}" class="btn">Otevřít moji galerii &rarr;</a>
    </div>
    <div class="footer">Piclio by Lucifera Studio</div>
  </div>
</body>
</html>`,
    })
    console.log(`Registration email sent to ${email}`)
  } catch (err) {
    console.error(`Registration email failed for ${email}:`, err)
  }
}

export async function POST(req: NextRequest) {
  const { email, faceImageBase64, eventId, badgeNumber: badgeNumberRaw } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const assignedBadge = typeof badgeNumberRaw === 'number' ? badgeNumberRaw : parseInt(badgeNumberRaw)
  if (!assignedBadge || isNaN(assignedBadge) || assignedBadge < 1 || assignedBadge > 999) {
    return NextResponse.json({ error: 'badgeNumber is required (1–999)' }, { status: 400 })
  }

  // If eventId provided directly, use it; otherwise find active/draft event
  let activeEvent: { id: string; max_guests: number } | null = null

  if (eventId) {
    const { data } = await supabase
      .from('events')
      .select('id, max_guests')
      .eq('id', eventId)
      .single()
    activeEvent = data
  }

  if (!activeEvent) {
    const { data: active } = await supabase
      .from('events')
      .select('id, max_guests')
      .eq('status', 'active')
      .order('date', { ascending: true })
      .limit(1)
      .single()
    activeEvent = active
  }

  if (!activeEvent) {
    const { data: draftEvent } = await supabase
      .from('events')
      .select('id, max_guests')
      .eq('status', 'draft')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    activeEvent = draftEvent
  }

  if (!activeEvent) {
    return NextResponse.json({ error: 'No event found' }, { status: 404 })
  }

  // Return existing guest if email already registered
  const { data: existing } = await supabase
    .from('guests')
    .select('id, badge_number, gallery_token')
    .eq('event_id', activeEvent.id)
    .eq('email', email)
    .single()

  if (existing) {
    return NextResponse.json({
      badgeNumber: existing.badge_number,
      galleryToken: existing.gallery_token,
      existing: true,
    })
  }

  const nextBadgeNumber = assignedBadge

  // Create guest
  const { data: newGuest, error } = await supabase
    .from('guests')
    .insert({
      event_id: activeEvent.id,
      email: email.toLowerCase().trim(),
      badge_number: nextBadgeNumber,
      gdpr_consent: true,
      registered_at: new Date().toISOString(),
    })
    .select('id, badge_number, gallery_token')
    .single()

  if (error || !newGuest) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 })
  }

  // Store selfie + index face in Rekognition — best-effort, non-blocking
  if (faceImageBase64) {
    try {
      const base64Data = faceImageBase64.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      // Upload selfie to Supabase Storage
      await supabase.storage.createBucket('selfies', { public: false }).catch(() => {})
      await supabase.storage
        .from('selfies')
        .upload(`${activeEvent.id}/${newGuest.id}.jpg`, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      // Index face in AWS Rekognition
      try {
        const rek = getRekognitionClient()
        const collectionId = `piclio-${activeEvent.id}`

        // Create collection if it doesn't exist yet
        await rek.send(new CreateCollectionCommand({ CollectionId: collectionId }))
          .catch((err: Error) => {
            if (err.name !== 'ResourceAlreadyExistsException') throw err
          })

        // Index the face
        const indexResult = await rek.send(new IndexFacesCommand({
          CollectionId: collectionId,
          Image: { Bytes: buffer },
          ExternalImageId: newGuest.id,
          MaxFaces: 1,
          DetectionAttributes: [],
        }))

        const faceId = indexResult.FaceRecords?.[0]?.Face?.FaceId
        if (faceId) {
          await supabase
            .from('guests')
            .update({ rekognition_face_id: faceId })
            .eq('id', newGuest.id)
          console.log(`Rekognition face indexed: ${faceId} → guest ${newGuest.id}`)
        }
      } catch (rekErr) {
        console.error(`Rekognition indexing failed for guest ${newGuest.id}:`, rekErr)
      }
    } catch {
      console.log(`Selfie upload failed for guest ${newGuest.id}`)
    }
  }

  // Fetch event name for email
  const { data: eventData } = await supabase
    .from('events')
    .select('name')
    .eq('id', activeEvent.id)
    .single()

  const eventName = eventData?.name ?? 'akci'

  // Send registration email — best-effort, non-blocking
  sendRegistrationEmail(
    email.toLowerCase().trim(),
    newGuest.gallery_token,
    newGuest.badge_number,
    eventName
  ).then(() => {
    // Set email_sent_at after successful send
    supabase
      .from('guests')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', newGuest.id)
      .then(() => {})
  }).catch(() => {})

  return NextResponse.json({
    badgeNumber: newGuest.badge_number,
    galleryToken: newGuest.gallery_token,
  })
}
