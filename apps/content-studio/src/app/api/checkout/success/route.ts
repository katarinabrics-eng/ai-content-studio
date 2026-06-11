import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ensureProjectFromCheckoutSession } from "@/lib/checkout-project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-01-28.clover" });
}

/** Po platbě: ověří session, idempotentně vytvoří projekt, vrátí accessToken pro redirect. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Chybí session_id" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { ok: false, error: "Platba nebyla dokončena.", payment_status: session.payment_status },
        { status: 400 }
      );
    }

    const result = await ensureProjectFromCheckoutSession(session);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      projectCode: result.projectCode,
      accessToken: result.accessToken,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[checkout/success]", e);
    return NextResponse.json({ ok: false, error: `Chyba: ${msg}` }, { status: 500 });
  }
}
