import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, {
    apiVersion: "2026-01-28.clover",
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Chybí session_id" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ ok: false, error: "Stripe není nakonfigurován." }, { status: 500 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({
        ok: false,
        error: "Platba nebyla dokončena.",
        status: session.payment_status,
      });
    }

    return NextResponse.json({
      ok: true,
      paid: true,
      email: session.customer_details?.email ?? null,
      planId: session.metadata?.plan_id ?? "test-week-800",
      sessionId: session.id,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[checkout/verify]", e);
    return NextResponse.json(
      { ok: false, error: `Chyba ověření platby: ${msg}` },
      { status: 500 }
    );
  }
}
