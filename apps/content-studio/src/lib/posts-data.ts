import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const INTAKE_FILE = path.join(DATA_DIR, "intake-submissions.json");
const DRAFTS_FILE = path.join(DATA_DIR, "post-drafts.json");

type IntakeRecord = { id: string; createdAt: string; [k: string]: unknown };

export function readIntakeSubmissions(): IntakeRecord[] {
  try {
    const raw = fs.readFileSync(INTAKE_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function getIntakeByIdOrLast(intakeId?: string): IntakeRecord | null {
  const list = readIntakeSubmissions();
  if (!list.length) return null;
  if (intakeId) {
    const found = list.find((r) => r.id === intakeId);
    return found ?? null;
  }
  return list[list.length - 1] ?? null;
}

export function readPostDrafts(): { id: string; intakeId: string; createdAt: string; [k: string]: unknown }[] {
  try {
    const raw = fs.readFileSync(DRAFTS_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function writePostDrafts(drafts: { id: string; intakeId: string; createdAt: string; [k: string]: unknown }[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DRAFTS_FILE, JSON.stringify(drafts, null, 2), "utf-8");
}
