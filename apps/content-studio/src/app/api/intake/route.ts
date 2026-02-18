import { NextResponse } from "next/server";
import { intakeSchema } from "@/lib/intake-schema";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

const DATA_FILE = path.join(process.cwd(), "data", "intake-submissions.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "logos");
const LOGO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const LOGO_MIME = "image/png";

function readSubmissions(): unknown[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeSubmissions(submissions: unknown[]) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), "utf-8");
}

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
      return NextResponse.json(
        { ok: false, error: message },
        { status: 400 }
      );
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

    let record = {
      ...parsed.data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

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

      const buffer = Buffer.from(await logoFile.arrayBuffer());
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      const filename = `${record.id}.png`;
      const filePath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filePath, buffer);

      const logoUrl = `/uploads/logos/${filename}`;
      record = {
        ...record,
        brandAssets: {
          ...(record.brandAssets ?? {}),
          logo: logoUrl,
        },
      };
    }

    const submissions = readSubmissions();
    submissions.push(record);
    writeSubmissions(submissions);

    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("POST /api/intake", e);
    return NextResponse.json(
      { ok: false, error: "Došlo k chybě serveru" },
      { status: 500 }
    );
  }
}
