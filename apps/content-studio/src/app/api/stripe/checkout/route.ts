import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2026-01-28.clover' })
}

const BASE_URL = () =>
  (process.env.NEXT_PUBLIC_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export async function POST(req: Request) {
  try {
    const { email, projektId } = await req.json()

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Chybí email.' }, { status: 400 })
    }

    const stripe = getStripe()
    const base = BASE_URL()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'czk',
            product_data: {
              name: 'Strategický vstup · Lucifera',
              description: 'Strategický hovor 60 min + Vizuální board + 3 Canva šablony',
            },
            unit_amount: 990000, // 9 900 Kč v haléřích
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: { projektId: projektId ?? '' },
      success_url: `${base}/dekujeme?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/diagnostika`,
    })

    if (!session.url) {
      return NextResponse.json({ ok: false, error: 'Checkout session nebyla vytvořena.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[stripe/checkout]', e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
