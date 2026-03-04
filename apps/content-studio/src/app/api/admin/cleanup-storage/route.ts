import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { BUCKET_CLIENT_PROJECTS } from "@/lib/project-paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Rekurzívne vráti všetky cesty súborov pod daným prefixom.
 */
async function listAllFiles(
  supabase: ReturnType<typeof getSupabaseClient>,
  prefix: string
): Promise<string[]> {
  const norm = prefix.replace(/\/+$/, "");
  const { data, error } = await supabase.storage
    .from(BUCKET_CLIENT_PROJECTS)
    .list(norm, { limit: 1000 });
  if (error || !data) return [];
  const paths: string[] = [];
  for (const item of data) {
    const itemPath = `${norm}/${item.name}`;
    if (item.id === null) {
      paths.push(...(await listAllFiles(supabase, itemPath)));
    } else {
      paths.push(itemPath);
    }
  }
  return paths;
}

/**
 * GET  – len preview (dry-run): vráti zoznam orphan prefixov bez mazania.
 * POST – vymaže všetky orphan storage priečinky.
 */
async function handleRequest(isDryRun: boolean) {
  const supabase = getSupabaseClient();

  // 1. Načítaj všetky storage_prefix hodnoty z DB
  const { data: projects, error: dbError } = await supabase
    .from("projects")
    .select("storage_prefix")
    .not("storage_prefix", "is", null);

  if (dbError) {
    return NextResponse.json({ ok: false, error: dbError.message }, { status: 500 });
  }

  const activePrefixes = new Set(
    (projects ?? [])
      .map((p: { storage_prefix: string | null }) => p.storage_prefix?.replace(/\/+$/, "") ?? "")
      .filter(Boolean)
  );

  // 2. Zisti všetky priečinky na úrovni "projects/" v storage
  const { data: topLevel, error: listError } = await supabase.storage
    .from(BUCKET_CLIENT_PROJECTS)
    .list("projects", { limit: 1000 });

  if (listError) {
    return NextResponse.json({ ok: false, error: listError.message }, { status: 500 });
  }

  // top-level items sú "CODE" priečinky (napr. "LCF-20250304-ABCD")
  const orphans: string[] = [];

  for (const item of topLevel ?? []) {
    if (item.id !== null) continue; // súbor priamo v projects/ – preskočiť

    const codeFolder = `projects/${item.name}`; // napr. "projects/LCF-20250304-ABCD"

    // Skontroluj či existuje DB záznam ktorý začína týmto prefixom
    const hasMatch = Array.from(activePrefixes).some(
      (p) => p === codeFolder || p.startsWith(`${codeFolder}/`)
    );

    if (!hasMatch) {
      orphans.push(codeFolder);
    }
  }

  if (orphans.length === 0) {
    return NextResponse.json({ ok: true, message: "Žiadne orphan priečinky.", orphans: [], deleted: 0 });
  }

  if (isDryRun) {
    return NextResponse.json({ ok: true, dryRun: true, orphans, message: `Nájdené ${orphans.length} orphan priečinky. Použij POST pre vymazanie.` });
  }

  // 3. Vymaž všetky súbory v orphan priečinkoch
  let totalDeleted = 0;
  const errors: string[] = [];

  for (const orphanPrefix of orphans) {
    try {
      const filePaths = await listAllFiles(supabase, orphanPrefix);
      if (filePaths.length > 0) {
        for (let i = 0; i < filePaths.length; i += 100) {
          const { error: removeError } = await supabase.storage
            .from(BUCKET_CLIENT_PROJECTS)
            .remove(filePaths.slice(i, i + 100));
          if (removeError) {
            errors.push(`${orphanPrefix}: ${removeError.message}`);
          } else {
            totalDeleted += filePaths.slice(i, i + 100).length;
          }
        }
      } else {
        // Prázdny "priečinok" – Supabase ho automaticky zmaže keď nemá súbory
        totalDeleted += 0;
      }
    } catch (e) {
      errors.push(`${orphanPrefix}: ${String(e)}`);
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    orphans,
    deleted: totalDeleted,
    errors: errors.length > 0 ? errors : undefined,
    message: `Vymazaných ${totalDeleted} súborov z ${orphans.length} orphan priečinkov.`,
  });
}

/** Dry-run: len zobraz čo by sa vymazalo */
export async function GET() {
  try {
    return await handleRequest(true);
  } catch (e) {
    console.error("[cleanup-storage GET]", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** Skutočné mazanie */
export async function POST() {
  try {
    return await handleRequest(false);
  } catch (e) {
    console.error("[cleanup-storage POST]", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
