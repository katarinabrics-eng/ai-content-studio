import { NextResponse } from "next/server";
import { createAccessLink } from "@/lib/supabase-client-access";
import { notifyOnboardingLinkSent } from "@/lib/supabase-client-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const zEmail = (v: unknown) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!zEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Neplatný email" },
        { status: 400 }
      );
    }

    const baseUrl =
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { client, magicLinkUrl, expiresAt } = await createAccessLink({
      email,
      baseUrl,
      name: typeof body.name === "string" ? body.name.trim() : undefined,
    });

    await notifyOnboardingLinkSent({
      clientId: client.id,
      email: client.email,
      magicLinkUrl,
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      message: "Přístupový odkaz byl odeslán na email.",
      expiresAt: expiresAt.toISOString(),
      // In production do not expose link; here for testing without email
      ...(process.env.NODE_ENV === "development" ? { magicLinkUrl } : {}),
    });
  } catch (e) {
    console.error("[/api/client/access/request]", e);
    return NextResponse.json(
      { ok: false, error: "Nepodařilo se vytvořit přístupový odkaz." },
      { status: 500 }
    );
  }
}
