import { NextRequest, NextResponse } from "next/server";
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

const PLAN_TEST_WEEK = {
  id: "test-week-800",
  name: "TESTOVACÍ TÝDEN",
  amount: 80000,
  currency: "czk",
};

/** Rychlý checkout: GET /api/checkout?type=portrait|board&date=YYYY-MM-DD → redirect na Stripe */
const QUICK_CHECKOUT: Record<string, { name: string; amount: number }> = {
  portrait: { name: "Portrétní focení – ateliér", amount: 450000 },
  rodina: { name: "Rodinné focení", amount: 580000 },
  brand: { name: "Brand focení", amount: 450000 },
  board: { name: "Strategický Visual Board", amount: 780000 },
};

function getBaseUrl(request: Request): string {
  return (
    request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
      ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type");
    const date = request.nextUrl.searchParams.get("date") ?? "";

    if (!type || !date || !QUICK_CHECKOUT[type]) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.redirect(new URL("/?checkout=error", request.url));
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl(request);
    const product = QUICK_CHECKOUT[type];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "czk",
            product_data: {
              name: product.name,
              description: `Termín: ${date}`,
            },
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: type === "board" ? `${baseUrl}/start?session_id={CHECKOUT_SESSION_ID}` : `${baseUrl}/rezervace?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: type === "board" ? `${baseUrl}/?checkout=cancelled` : `${baseUrl}/portrety#kalendar`,
      metadata: { type, date },
    });

    if (!session.url) {
      return NextResponse.redirect(new URL("/?checkout=error", request.url));
    }
    return NextResponse.redirect(session.url);
  } catch (e) {
    console.error("[checkout GET]", e);
    return NextResponse.redirect(new URL("/?checkout=error", request.url));
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { ok: false, error: "Stripe není nakonfigurován." },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl(request);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: PLAN_TEST_WEEK.currency,
            product_data: {
              name: PLAN_TEST_WEEK.name,
              description: "3 profesionální příspěvky (text + grafika)",
            },
            unit_amount: PLAN_TEST_WEEK.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/start?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=cancelled`,
      metadata: {
        plan_id: PLAN_TEST_WEEK.id,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: "Checkout session nebyla vytvořena." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[checkout]", e);
    return NextResponse.json(
      { ok: false, error: `Chyba při vytváření platby: ${msg}` },
      { status: 500 }
    );
  }
}
