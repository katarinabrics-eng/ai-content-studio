import { NextRequest, NextResponse } from "next/server";
import { listFolderContents, downloadFileAsText, DriveFile } from "@/lib/google-drive/client";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Supabase admin client (service role — pouze server)
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Chybí Supabase env variables");
  return createClient(url, key);
}

// ---------------------------------------------------------------------------
// Kategorizace souborů
// ---------------------------------------------------------------------------

const SUBFOLDER_KEYS = ["brand", "fotografie", "texty", "sablony", "prispevky"] as const;
type KnownSubfolder = (typeof SUBFOLDER_KEYS)[number];

function categorize(files: DriveFile[]) {
  const bySubfolder: Record<KnownSubfolder | "ostatni", DriveFile[]> = {
    brand: [],
    fotografie: [],
    texty: [],
    sablony: [],
    prispevky: [],
    ostatni: [],
  };

  for (const file of files) {
    const key = (file.subfolder ?? "").toLowerCase() as KnownSubfolder;
    if (SUBFOLDER_KEYS.includes(key)) {
      bySubfolder[key].push(file);
    } else {
      bySubfolder.ostatni.push(file);
    }
  }

  return bySubfolder;
}

// ---------------------------------------------------------------------------
// POST /api/admin/drive/sync
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientProjectId, folderId } = body as {
      clientProjectId: string;
      folderId: string;
    };

    if (!clientProjectId || !folderId) {
      return NextResponse.json(
        { success: false, error: "Chybí clientProjectId nebo folderId" },
        { status: 400 }
      );
    }

    // 1. Projdi složku
    const allFiles = await listFolderContents(folderId);
    const bySubfolder = categorize(allFiles);

    // 2. Stáhni obsah .txt souborů ze složky /texty/
    const textContents: Record<string, string> = {};
    const txtFiles = bySubfolder.texty.filter(
      (f) =>
        f.mimeType === "text/plain" ||
        f.name.toLowerCase().endsWith(".txt") ||
        f.name.toLowerCase().endsWith(".md")
    );

    await Promise.allSettled(
      txtFiles.map(async (file) => {
        try {
          const content = await downloadFileAsText(file.id);
          textContents[file.name] = content;
        } catch (e) {
          textContents[file.name] = `[Chyba při stahování: ${e instanceof Error ? e.message : String(e)}]`;
        }
      })
    );

    // 3. Upsert do Supabase
    const supabase = getSupabase();

    const { error: dbError } = await supabase
      .from("client_drive_config")
      .upsert(
        {
          client_project_id: clientProjectId,
          drive_folder_id: folderId,
          folder_structure: bySubfolder,
          text_contents: textContents,
          last_synced_at: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: "client_project_id" }
      );

    if (dbError) {
      throw new Error(`Supabase upsert selhal: ${dbError.message}`);
    }

    // 4. Přehled
    const summary = Object.fromEntries(
      Object.entries(bySubfolder).map(([k, v]) => [k, (v as DriveFile[]).length])
    );

    return NextResponse.json({
      success: true,
      clientProjectId,
      folderId,
      totalFiles: allFiles.length,
      textFilesDownloaded: Object.keys(textContents).length,
      summary,
      textFiles: Object.keys(textContents),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isAuthError =
      message.toLowerCase().includes("invalid_grant") ||
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("forbidden") ||
      message.toLowerCase().includes("private key");

    return NextResponse.json(
      {
        success: false,
        error: message,
        hint: isAuthError
          ? "Zkontroluj GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY formát v .env.local"
          : undefined,
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
