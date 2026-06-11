/**
 * Intake Pipeline: adapter na unified start-pipeline.
 * Přijímá multipart s intake formulářem (brandName, industry...) a volá runStartPipeline.
 */

import { NextResponse } from "next/server";
import { runStartPipeline } from "@/lib/start-pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPayloadFromForm(form: FormData): Record<string, unknown> | null {
  const raw = form.get("payload");
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function collectFiles(form: FormData, key: string): File[] {
  const list: File[] = [];
  const single = form.get(key);
  if (single instanceof File && single.size > 0) list.push(single);
  for (const f of form.getAll(key)) {
    if (f instanceof File && f.size > 0 && !list.includes(f)) list.push(f);
  }
  return list;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_REQUEST", errorMessage: "Očekává se multipart/form-data." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const payload = getPayloadFromForm(formData);
    if (!payload) {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_REQUEST", errorMessage: "Chybí nebo neplatné pole payload (JSON)." },
        { status: 400 }
      );
    }

    const logoFiles = collectFiles(formData, "logo");
    const photoFiles = collectFiles(formData, "photos");
    const brandPdfFiles = collectFiles(formData, "brandPdf");
    const files = {
      logo: logoFiles[0] ?? null,
      photos: photoFiles,
      brandPdf: brandPdfFiles[0] ?? null,
    };

    // Normalize tone field for robustness (FE may send different key names)
    const tone =
      (payload.tone_of_voice ?? payload.tonalita ?? payload.toneOfVoice ?? "") as string;
    const normalizedPayload = {
      ...payload,
      tone_of_voice: String(tone ?? "").trim(),
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[intake/pipeline] keys:", Object.keys(payload));
    }

    const result = await runStartPipeline(normalizedPayload, files);

    if (!result.ok) {
      if (process.env.NODE_ENV === "development" && result.details?.missing) {
        console.log("[intake/pipeline] missing:", result.details.missing);
      }
      const status = result.errorCode === "VALIDATION_FAILED" ? 400 : 500;
      return NextResponse.json(
        { ok: false, errorCode: result.errorCode, errorMessage: result.errorMessage, details: result.details },
        { status }
      );
    }

    const base = (
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    ).replace(/\/$/, "");
    const accessLink = result.accessToken ? `${base}/project/access?token=${encodeURIComponent(result.accessToken)}` : undefined;

    return NextResponse.json({
      ok: true,
      projectId: result.projectId,
      projectCode: result.projectCode,
      status: "AWAITING_INPUT",
      storagePrefix: result.storagePrefix,
      accessMode: result.accessMode,
      access: {
        code: result.projectCode,
        pinMaskedOrToken: result.pin ? `****${result.pin.slice(-2)}` : result.magicToken ?? null,
      },
      next: { clientPath: "/start/success" },
      pin: result.pin ?? null,
      loginUrl: undefined,
      accessLink: result.accessMode === "token" ? accessLink : undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[intake/pipeline]", e);
    return NextResponse.json(
      { ok: false, errorCode: "PIPELINE_ERROR", errorMessage: msg },
      { status: 500 }
    );
  }
}
