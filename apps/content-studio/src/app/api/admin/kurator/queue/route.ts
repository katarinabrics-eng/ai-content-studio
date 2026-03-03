import { NextResponse } from "next/server";
import { getContentPostsByStatus } from "@/lib/content-posts";
import { getProjectById } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET – fronta příspěvků ve stavu curator_review */
export async function GET() {
  try {
    const posts = await getContentPostsByStatus("curator_review");
    const withProject = await Promise.all(
      posts.map(async (p) => {
        const project = await getProjectById(p.project_id);
        return {
          ...p,
          project_code: project?.project_code ?? null,
          client_email: project?.client_email ?? null,
        };
      })
    );
    return NextResponse.json({ ok: true, posts: withProject });
  } catch (e) {
    console.error("[admin/kurator/queue]", e);
    return NextResponse.json({ error: "Chyba načtení fronty." }, { status: 500 });
  }
}
