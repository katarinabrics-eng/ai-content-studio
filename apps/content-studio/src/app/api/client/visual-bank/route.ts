import { NextRequest, NextResponse } from "next/server";
import { listFolderContents } from "@/lib/google-drive/client";

export const runtime = "nodejs";

const DEFAULT_FOLDER_ID = "1tl0_AbkCbBfGIcY6A607KpoLDHxAVL-u";

// "K04 — SOFT FEMININE" → "Soft Feminine"
function parseStyleName(folderName: string): string {
  const match = folderName.match(/—\s*(.+)$/);
  if (match) {
    return match[1]
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return folderName.trim();
}

const FALLBACK_FOLDERS = [
  { id: "", name: "K01 — EDITORIAL SILENCE", style: "Editorial Silence" },
  { id: "", name: "K02 — BOLD STATEMENT", style: "Bold Statement" },
  { id: "", name: "K03 — GOLDEN MOMENT", style: "Golden Moment" },
  { id: "", name: "K04 — SOFT FEMININE", style: "Soft Feminine" },
  { id: "", name: "K05 — THE DISRUPTOR", style: "The Disruptor" },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId") || DEFAULT_FOLDER_ID;
  const styleFilter = searchParams.get("style") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);

  try {
    const allFiles = await listFolderContents(folderId);

    // Collect unique folders (subfolders = style categories)
    const folderMap = new Map<string, { id: string; name: string; style: string }>();
    for (const file of allFiles) {
      if (file.subfolder && !folderMap.has(file.subfolder)) {
        folderMap.set(file.subfolder, {
          id: "",
          name: file.subfolder,
          style: parseStyleName(file.subfolder),
        });
      }
    }
    const folders = Array.from(folderMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Filter by style if requested
    const filtered = styleFilter
      ? allFiles.filter(
          (f) =>
            f.subfolder &&
            parseStyleName(f.subfolder).toLowerCase() === styleFilter.toLowerCase()
        )
      : allFiles;

    // Only images and videos
    const media = filtered.filter(
      (f) =>
        f.mimeType.startsWith("image/") || f.mimeType.startsWith("video/")
    );

    // Paginate
    const start = (page - 1) * limit;
    const paged = media.slice(start, start + limit);

    const files = paged.map((f) => ({
      id: f.id,
      name: f.name,
      thumbnailUrl: `/api/admin/drive/image-proxy?fileId=${f.id}`,
      style: f.subfolder ? parseStyleName(f.subfolder) : "",
      type: f.mimeType.startsWith("video/") ? "video" : "photo",
    }));

    return NextResponse.json({ files, folders, total: media.length });
  } catch (err) {
    console.error("[visual-bank] Drive API error:", err);
    // Fallback — vrať prázdné soubory se složkami
    return NextResponse.json({
      files: [],
      folders: FALLBACK_FOLDERS,
      total: 0,
    });
  }
}
