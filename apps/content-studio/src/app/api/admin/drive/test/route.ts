import { NextResponse } from "next/server";
import { listFolderContents, DriveFile } from "@/lib/google-drive/client";

export const runtime = "nodejs";

const TEST_FOLDER_ID = "1ser-9Kgl1fLdYsiT-9RyhjpXeTYsFiUn";

// Klíčová slova pro kategorizaci podle subfolderů
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

export async function GET() {
  try {
    const files = await listFolderContents(TEST_FOLDER_ID);
    const bySubfolder = categorize(files);

    return NextResponse.json({
      success: true,
      totalFiles: files.length,
      bySubfolder,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isAuthError =
      message.toLowerCase().includes("invalid_grant") ||
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("forbidden") ||
      message.toLowerCase().includes("private key") ||
      message.toLowerCase().includes("credentials");

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
