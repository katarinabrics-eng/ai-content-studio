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
    let input: Record<string, unknown>;
    let files: { logo?: File | null; photos?: File[]; brandPdf?: File | null } | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const payload = getPayloadFromForm(formData);
      if (!payload) {
        return NextResponse.json(
          { ok: false, errorCode: "INVALID_REQUEST", errorMessage: "Chybí nebo neplatné pole payload (JSON)." },
          { status: 400 }
        );
      }
      input = payload;
      const logoFiles = collectFiles(formData, "logo");
      const photoFiles = collectFiles(formData, "photos");
      const brandPdfFiles = collectFiles(formData, "brandPdf");
      files = {
        logo: logoFiles[0] ?? null,
        photos: photoFiles,
        brandPdf: brandPdfFiles[0] ?? null,
      };
    } else {
      const body = await request.json().catch(() => ({}));
      input = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    }

    const result = await runStartPipeline(input, files);

    if (!result.ok) {
      const status = result.errorCode === "VALIDATION_FAILED" ? 400 : 500;
      return NextResponse.json(
        { ok: false, errorCode: result.errorCode, errorMessage: result.errorMessage, details: result.details },
        { status }
      );
    }

    const baseUrl =
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const base = baseUrl.replace(/\/$/, "");

    const clientPath = result.magicToken
      ? `/project?token=${encodeURIComponent(result.magicToken)}`
      : `/start/success`;
    const magicLinkUrl = result.magicToken ? `${base}/project?token=${encodeURIComponent(result.magicToken)}` : undefined;

    const accessLink = result.accessMode === "token" && result.accessToken
      ? `${base}/project/access?token=${encodeURIComponent(result.accessToken)}`
      : undefined;

    return NextResponse.json({
      ok: true,
      projectId: result.projectId,
      projectCode: result.projectCode,
      status: "PROCESSING_DATA",
      storagePrefix: result.storagePrefix,
      accessMode: result.accessMode,
      access: {
        code: result.projectCode,
        pinMaskedOrToken: result.pin ? `****${result.pin.slice(-2)}` : result.magicToken ?? null,
        pin: result.pin ?? undefined,
        magicToken: result.magicToken ?? undefined,
      },
      next: { clientPath },
      magicLinkUrl: magicLinkUrl ?? undefined,
      accessLink: accessLink ?? undefined,
      pin: result.pin ?? undefined,
      message: result.pin
        ? "Projekt vytvořen. Uložte si kód a PIN pro přístup."
        : "Projekt vytvořen. Odkaz jsme odeslali na email a zobrazíme ho níže.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[POST /api/start]", e);
    return NextResponse.json(
      { ok: false, errorCode: "SERVER_ERROR", errorMessage: "Nepodařilo se vytvořit projekt.", details: { detail: msg } },
      { status: 500 }
    );
  }
}
