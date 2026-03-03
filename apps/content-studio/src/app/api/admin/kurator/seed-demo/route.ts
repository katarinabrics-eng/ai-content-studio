import { NextResponse } from "next/server";
import { listProjects } from "@/lib/supabase-projects";
import { createContentPost } from "@/lib/content-posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST – vytvoří jeden testovací příspěvek ve stavu curator_review (pro první projekt v seznamu). */
export async function POST() {
  try {
    const projects = await listProjects();
    const project = projects[0];
    if (!project) {
      return NextResponse.json({ error: "Žádný projekt v systému." }, { status: 400 });
    }
    const post = await createContentPost({
      project_id: project.id,
      status: "curator_review",
      hook: "Tvůj vizuál rozhoduje dřív, než řeknete první větu.",
      body: "Vizuální identita není kosmetická úprava – je to první dojem, který zákazník dostane. Na základě vašeho briefu jsme připravili tento návrh.",
      platform: "instagram",
    });
    return NextResponse.json({ ok: true, post, project_code: project.project_code });
  } catch (e) {
    console.error("[admin/kurator/seed-demo]", e);
    return NextResponse.json({ error: "Nepodařilo se vytvořit testovací příspěvek." }, { status: 500 });
  }
}
