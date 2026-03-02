import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createDiagnosticProject } from "@/lib/lucifera-diagnostic-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STRATEGIC_CONSULTATION = {
  name: "Strategická konzultace",
  description: "Prémiová / Brand diagnostika – konzultace + přístup do klientského studia",
  amount: 185000, // 1 850 Kč
  currency: "czk",
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-01-28.clover" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json({ error: "E-mail je povinný." }, { status: 400 });
    }

    const intake_data: Record<string, unknown> = {
      brandScore: body?.brandScore ?? undefined,
      brandDna: body?.brandDna ?? undefined,
      analyzedUrl: body?.analyzedUrl ?? undefined,
      consultationDate: body?.consultationDate ?? undefined,
    };

    const { projectId } = await createDiagnosticProject({
      email,
      intake_data,
    });

    const baseUrl = (
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    ).replace(/\/$/, "");

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: STRATEGIC_CONSULTATION.currency,
            product_data: {
              name: STRATEGIC_CONSULTATION.name,
              description: STRATEGIC_CONSULTATION.description,
            },
            unit_amount: STRATEGIC_CONSULTATION.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      success_url: `${baseUrl}/studio/${projectId}?welcome=1`,
      cancel_url: `${baseUrl}/diagnostika?checkout=cancelled`,
      metadata: {
        type: "diagnostika",
        projectId,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout session nebyla vytvořena." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url, projectId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[diagnostika/checkout]", e);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
