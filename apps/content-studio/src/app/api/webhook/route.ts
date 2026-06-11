import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-01-28.clover" });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Signature verification failed:", msg);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { type, date } = (session.metadata ?? {}) as { type?: string; date?: string };

    if (type && date) {
      const supabase = getSupabaseClient();
      const { error: insertError } = await supabase.from("bookings").insert({
        email: session.customer_details?.email ?? null,
        service_type: type,
        booking_date: date,
        amount: session.amount_total ?? 0,
      });

      if (insertError) {
        console.error("[webhook] Supabase insert failed:", insertError);
        return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      try {
        await fetch(`${baseUrl.replace(/\/$/, "")}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.customer_details?.email,
            date,
            type,
          }),
        });
      } catch (e) {
        console.error("[webhook] Send email failed:", e);
        // booking already saved, don't fail the webhook
      }
    }
  }

  return NextResponse.json({ received: true });
}
