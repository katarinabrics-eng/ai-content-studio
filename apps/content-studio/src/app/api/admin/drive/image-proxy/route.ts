import { type NextRequest } from "next/server";
import { downloadFileAsBuffer } from "@/lib/google-drive/client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId) {
    return new Response(JSON.stringify({ error: "chybí fileId" }), { status: 400 });
  }

  try {
    const buffer = await downloadFileAsBuffer(fileId);
    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
