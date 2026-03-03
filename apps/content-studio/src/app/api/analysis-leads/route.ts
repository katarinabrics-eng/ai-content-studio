import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof (body as { email?: string }).email === "string"
      ? (body as { email: string }).email.trim()
      : "";
    const analyzedUrl = typeof (body as { analyzedUrl?: string }).analyzedUrl === "string"
      ? (body as { analyzedUrl: string }).analyzedUrl.trim()
      : "";
    const result = (body as { result?: unknown }).result ?? {};
    const scrapedMeta = (body as { scrapedMeta?: unknown }).scrapedMeta ?? {};

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Zadejte platnou e-mailovou adresu." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("analysis_leads").insert({
      email,
      analyzed_url: analyzedUrl || "",
      result: typeof result === "object" && result !== null ? result : {},
      scraped_meta: typeof scrapedMeta === "object" && scrapedMeta !== null ? scrapedMeta : {},
    });

    if (error) {
      console.error("[analysis-leads] insert error:", error);
      return NextResponse.json(
        { ok: false, error: "Nepodařilo se uložit. Zkuste to později." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Děkujeme, budeme vás kontaktovat." });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[analysis-leads]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
