import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getBookingById } from "@/lib/supabase-bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<string, { name: string; amount: number }> = {
  portret: { name: "Portrétní focení – ateliér", amount: 450000 }, // 4 500 Kč
  rodinne: { name: "Rodinné focení", amount: 580000 }, // 5 800 Kč – reportáž jako default
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-01-28.clover" });
}

/** POST: Vytvoří Stripe checkout session pro rezervaci (booking_id). Přesměruje na Stripe. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bookingId = typeof body?.booking_id === "string" ? body.booking_id.trim() : "";

    if (!bookingId) {
      return NextResponse.json({ error: "Chybí booking_id." }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking || booking.status !== "pending") {
      return NextResponse.json({ error: "Rezervace neexistuje nebo již byla zpracována." }, { status: 400 });
    }

    const service = SERVICE_LABELS[booking.service_type] ?? {
      name: booking.service_type,
      amount: 450000,
    };

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe není nakonfigurován." }, { status: 500 });
    }

    const stripe = getStripe();
    const baseUrl = (
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    ).replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "czk",
            product_data: {
              name: service.name,
              description: `${booking.date} v ${booking.time}`,
            },
            unit_amount: service.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/rezervace?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/rezervace?from=${booking.service_type}&step=calendar`,
      customer_email: booking.email,
      metadata: {
        type: "booking",
        booking_id: bookingId,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout session nebyla vytvořena." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[checkout/create-session]", e);
    return NextResponse.json({ error: `Chyba: ${msg}` }, { status: 500 });
  }
}
