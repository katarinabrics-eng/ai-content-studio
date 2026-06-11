import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, type, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const typeLabels: Record<string, string> = {
      event: 'Poptávka pro event',
      beta: 'Beta přístup pro fotografy',
      other: 'Jiné',
    }

    await resend.emails.send({
      from: 'Piclio Web <noreply@piclio.cz>',
      to: ['ahoj@piclio.cz'],
      replyTo: email,
      subject: `Nová poptávka z webu — ${name}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 12px;">
          <div style="background: #1a1225; padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
            <span style="color: #b7e94c; font-weight: 800; font-size: 18px; letter-spacing: -0.5px;">Piclio</span>
            <span style="color: rgba(255,255,255,0.4); font-size: 12px; margin-left: 8px;">nová poptávka z webu</span>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; width: 140px;">Jméno</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #111827;">${name}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">E-mail</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${email}" style="color: #b7e94c; font-weight: 600;">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Telefon</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #111827;">${phone}</td></tr>` : ''}
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Typ</td><td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #111827;">${typeLabels[type] ?? type ?? '—'}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Zpráva</div>
            <div style="font-size: 15px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          </div>
          <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #9ca3af;">Piclio by Lucifera · ahoj@piclio.cz</div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Chyba při odesílání' }, { status: 500 })
  }
}
