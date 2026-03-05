import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientProjectById } from "@/lib/supabase-client-projects";
import { BUCKET_PROJECT_ASSETS } from "@/lib/project-paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
] as const;

const CATEGORIES = ["photos", "logos", "inspiration"] as const;
type Category = (typeof CATEGORIES)[number];

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}

/** GET: Seznam podkladů projektu. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  if (!projectId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("project_assets")
    .select("id, filename, storage_path, file_type, file_size, category, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/projects/assets] list:", error);
    return NextResponse.json({ error: "Chyba načtení" }, { status: 500 });
  }

  const rows = (data ?? []) as Array<{
    id: string;
    filename: string;
    storage_path: string;
    file_type: string;
    file_size: number;
    category: string;
    created_at: string;
  }>;

  const withUrl = await Promise.all(
    rows.map(async (row) => {
      const { data: urlData } = supabase.storage
        .from(BUCKET_PROJECT_ASSETS)
        .getPublicUrl(row.storage_path);
      return { ...row, url: urlData.publicUrl };
    })
  );

  return NextResponse.json({ assets: withUrl });
}

/** POST: Upload podkladu. FormData: file (required), category (optional: photos|logos|inspiration). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  if (!projectId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Očekáváno multipart/form-data" }, { status: 400 });

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Přidejte soubor (pole file)" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Soubor může mít max 10 MB" }, { status: 400 });
  }

  const mime = file.type?.toLowerCase() || "";
  if (!ALLOWED_TYPES.includes(mime as (typeof ALLOWED_TYPES)[number])) {
    return NextResponse.json(
      { error: "Povolené typy: JPG, PNG, WEBP, SVG, PDF" },
      { status: 400 }
    );
  }

  const categoryRaw = (formData.get("category") as string)?.trim() || "photos";
  const category: Category = CATEGORIES.includes(categoryRaw as Category) ? (categoryRaw as Category) : "photos";

  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const base = safeFilename(file.name.replace(/\.[^.]+$/, ""));
  const timestamp = Date.now();
  const storagePath = `${projectId}/${timestamp}_${base}${ext}`;

  const supabase = getSupabaseClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_PROJECT_ASSETS)
    .upload(storagePath, buffer, { contentType: mime, upsert: false });

  if (uploadError) {
    console.error("[admin/projects/assets] upload:", uploadError);
    return NextResponse.json({ error: "Nepodařilo se nahrát soubor" }, { status: 500 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("project_assets")
    .insert({
      project_id: projectId,
      filename: file.name,
      storage_path: storagePath,
      file_type: mime,
      file_size: file.size,
      category,
    })
    .select("id, filename, storage_path, file_type, file_size, category, created_at")
    .single();

  if (insertError) {
    console.error("[admin/projects/assets] insert:", insertError);
    return NextResponse.json({ error: "Nepodařilo se zapsat záznam" }, { status: 500 });
  }

  const row = inserted as { id: string; filename: string; storage_path: string; file_type: string; file_size: number; category: string; created_at: string };
  const { data: urlData } = supabase.storage.from(BUCKET_PROJECT_ASSETS).getPublicUrl(row.storage_path);

  return NextResponse.json({
    ok: true,
    asset: { ...row, url: urlData.publicUrl },
  });
}
