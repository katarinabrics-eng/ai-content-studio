import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { ensureProjectFromCheckoutSession } from "@/lib/checkout-project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-01-28.clover" });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhooks/stripe] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe-Signature header" }, { status: 400 });
  }

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhooks/stripe] Signature verification failed:", msg);
    return NextResponse.json({ error: `Webhook signature verification failed: ${msg}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true }, { status: 200 });
    }
    try {
      const result = await ensureProjectFromCheckoutSession(session);
      if (!result.ok) {
        console.error("[webhooks/stripe] ensureProjectFromCheckoutSession failed:", result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    } catch (e) {
      console.error("[webhooks/stripe]", e);
      return NextResponse.json({ error: "Failed to create project from checkout" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
