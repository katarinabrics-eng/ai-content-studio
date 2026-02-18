import { NextResponse } from "next/server";
import { intakeSchema } from "@/lib/intake-schema";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getIntakes, insertIntake } from "@/lib/supabase-intake";

export const runtime = "nodejs";

const LOGO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const LOGO_MIME = "image/png";
const BUCKET_BRAND_ASSETS = "brand-assets";
const LOGO_PREFIX = "logos";

async function parseRequest(request: Request): Promise<{
  payload: unknown;
  logoFile: File | null;
}> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const payloadRaw = formData.get("payload");
    if (typeof payloadRaw !== "string") {
      throw new Error("Missing or invalid payload");
    }
    let payload: unknown;
    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      throw new Error("Invalid JSON in payload");
    }
    const logoFile = formData.get("logoFile");
    const file = logoFile instanceof File && logoFile.size > 0 ? logoFile : null;
    return { payload, logoFile: file };
  }

  const body = await request.json();
  return { payload: body, logoFile: null };
}

export async function POST(request: Request) {
  try {
    let payload: unknown;
    let logoFile: File | null = null;

    try {
      const parsed = await parseRequest(request);
      payload = parsed.payload;
      logoFile = parsed.logoFile;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Neplatný požadavek";
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const payloadObj = payload as Record<string, unknown>;
    const normalized = {
      ...payloadObj,
      website:
        typeof payloadObj.website === "string" && payloadObj.website.trim() === ""
          ? undefined
          : payloadObj.website,
    };

    const parsed = intakeSchema.safeParse(normalized);

    if (!parsed.success) {
      const messages = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { ok: false, error: "Validace selhala", details: messages },
        { status: 400 }
      );
    }

    const payloadToInsert = { ...parsed.data };
    const recordId = crypto.randomUUID();

    if (logoFile) {
      if (logoFile.type !== LOGO_MIME) {
        return NextResponse.json(
          { ok: false, error: "Logo musí být soubor PNG (image/png)." },
          { status: 400 }
        );
      }
      if (logoFile.size > LOGO_MAX_BYTES) {
        return NextResponse.json(
          { ok: false, error: "Logo může mít maximálně 5 MB." },
          { status: 400 }
        );
      }

      const supabase = getSupabaseClient();
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const path = `${LOGO_PREFIX}/${recordId}.png`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_BRAND_ASSETS)
        .upload(path, buffer, {
          contentType: LOGO_MIME,
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return NextResponse.json(
          { ok: false, error: "INTAKE_SAVE_FAILED", detail: uploadError.message },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage.from(BUCKET_BRAND_ASSETS).getPublicUrl(path);
      const logoUrl = urlData?.publicUrl ?? "";

      payloadToInsert.brandAssets = {
        ...(payloadToInsert.brandAssets ?? {}),
        logo: logoUrl,
      };
    }

    try {
      const { id } = await insertIntake(payloadToInsert as Record<string, unknown>);
      return NextResponse.json({ ok: true, id });
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      console.error("POST /api/intake insertIntake:", e);
      return NextResponse.json(
        { ok: false, error: "INTAKE_SAVE_FAILED", detail },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("POST /api/intake", e);
    const message = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const intakes = await getIntakes(50);
    return NextResponse.json({ ok: true, intakes });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("GET /api/intake", e);
    return NextResponse.json(
      { ok: false, error: "INTAKE_LOAD_FAILED", detail },
      { status: 500 }
    );
  }
}
