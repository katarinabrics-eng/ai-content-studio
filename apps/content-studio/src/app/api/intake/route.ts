import { NextResponse } from "next/server";
import { intakeSchema } from "@/lib/intake-schema";
import path from "path";
import fs from "fs";

const DATA_FILE = path.join(process.cwd(), "data", "intake-submissions.json");

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = intakeSchema.safeParse({
      ...body,
      website: body.website?.trim() === "" ? undefined : body.website,
    });

    if (!parsed.success) {
      const messages = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { ok: false, error: "Validace selhala", details: messages },
        { status: 400 }
      );
    }

    const submissions = readSubmissions();
    const record = {
      ...parsed.data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
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
