import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientById } from "@/lib/supabase-clients";
import { listProjects, getWorkflowStateForProjects } from "@/lib/supabase-projects";
import { listClientProjects } from "@/lib/supabase-client-projects";
import {
  CLIENT_JOB_STATUS_LABELS,
  CLIENT_JOB_STATUS_ORDER,
  type ClientJobStatus,
} from "@/lib/client-status-engine";
import {
  PROJECT_STATUS_LABELS,
  computeProjectStatus,
  type ProjectStateForStatus,
} from "@/lib/project-status-engine";
import type { ProjectWithBriefAndMeta } from "@/lib/supabase-projects";
import type { ClientProjectRow } from "@/lib/supabase-client-projects";

export const dynamic = "force-dynamic";

type JobRow = {
  id: string;
  client_id: string;
  week_key: string;
  status: ClientJobStatus;
  due_at: string | null;
  updated_at: string;
};

const DIAG_STATUS_LABELS: Record<string, string> = {
  new: "Nový",
  paid: "Zaplaceno",
  in_progress: "V řešení",
  done: "Hotovo",
};

async function loadJobs(): Promise<{ jobs: JobRow[]; clientMap: Record<string, { name: string; email: string } | null> }> {
  try {
    const supabase = getSupabaseClient();
    const { data: rows, error } = await supabase
      .from("client_jobs")
      .select("id, client_id, week_key, status, due_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) return { jobs: [], clientMap: {} };
    const jobs = (rows ?? []) as JobRow[];
    const clientIds = Array.from(new Set(jobs.map((j) => j.client_id)));
    const clientMap: Record<string, { name: string; email: string } | null> = {};
    await Promise.all(
      clientIds.map(async (id) => {
        const c = await getClientById(id);
        clientMap[id] = c ? { name: c.name, email: c.email } : null;
      })
    );
    return { jobs, clientMap };
  } catch {
    return { jobs: [], clientMap: {} };
  }
}

async function loadProjects(): Promise<{
  projects: ProjectWithBriefAndMeta[];
  stateMap: Map<string, ProjectStateForStatus>;
}> {
  try {
    const projects = await listProjects();
    const stateMap = await getWorkflowStateForProjects(projects);
    return { projects, stateMap };
  } catch {
    return { projects: [], stateMap: new Map() };
  }
}

async function loadClientProjects(): Promise<ClientProjectRow[]> {
  try {
    return await listClientProjects();
  } catch {
    return [];
  }
}

export default async function RedakcePage() {
  const [jobsData, projectsData, clientProjects] = await Promise.all([
    loadJobs(),
    loadProjects(),
    loadClientProjects(),
  ]);

  const { jobs, clientMap } = jobsData;
  const { projects, stateMap } = projectsData;

  const byStatus = CLIENT_JOB_STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = jobs.filter((j) => j.status === status);
      return acc;
    },
    {} as Record<ClientJobStatus, JobRow[]>
  );

  return (
    <div className="min-h-screen bg-[#0c0c14] p-6 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Redakční okno</h1>
            <p className="mt-1 text-zinc-400">
              Jedno místo: zakázky, projekty a diagnostika. Kurátorská pracovní plocha.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/curator"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Pouze zakázky
            </Link>
            <Link
              href="/admin/projects"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Admin – projekty
            </Link>
            <Link
              href="/admin/clients"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Admin – diagnostika
            </Link>
            <Link
              href="/drafts"
              className="rounded-lg bg-[#A8EB12] px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-[#A8EB12]/90"
            >
              Návrhy postů
            </Link>
          </div>
        </header>

        {/* 1. Zakázky (client_jobs) */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Zakázky</h2>
          <p className="mt-1 text-sm text-zinc-500">Přehled podle stavu (client_jobs).</p>
          {jobs.length === 0 ? (
            <p className="mt-4 text-zinc-500">Zatím nejsou žádné klientské zakázky.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CLIENT_JOB_STATUS_ORDER.map((status) => {
                const list = byStatus[status] ?? [];
                if (list.length === 0) return null;
                return (
                  <div
                    key={status}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <h3 className="font-medium text-zinc-200">
                      {CLIENT_JOB_STATUS_LABELS[status]} ({list.length})
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {list.map((job) => (
                        <JobItem key={job.id} job={job} client={clientMap[job.client_id]} />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. Projekty (projects) */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Projekty</h2>
          <p className="mt-1 text-sm text-zinc-500">Projekty z platby (Stripe). Stav a odkaz na detail.</p>
          {projects.length === 0 ? (
            <p className="mt-4 text-zinc-500">Zatím žádné projekty.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Kód</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">E-mail</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Stav</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {projects.map((p) => (
                    <ProjectRow
                      key={p.id}
                      project={p}
                      workflowState={stateMap.get(p.id) ?? null}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 3. Diagnostika (client_projects) */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Diagnostika</h2>
          <p className="mt-1 text-sm text-zinc-500">Scan + platba + termín. Redakční základ.</p>
          {clientProjects.length === 0 ? (
            <p className="mt-4 text-zinc-500">Zatím žádné záznamy z diagnostiky.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Datum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Jméno / e-mail</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Platba</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Stav</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {clientProjects.map((cp) => (
                    <tr key={cp.id} className="hover:bg-white/5">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">
                        {new Date(cp.created_at).toLocaleDateString("cs-CZ")}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-200">
                        {cp.name || cp.email || cp.web_url || (cp.manual_input ? (cp.manual_input.slice(0, 50) + (cp.manual_input.length > 50 ? "…" : "")) : "") || "—"}
                        {cp.email && cp.name !== cp.email && (
                          <span className="block text-xs text-zinc-500">{cp.email}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                            cp.payment_status === "paid"
                              ? "bg-green-500/20 text-green-300"
                              : cp.payment_status === "pending"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-white/10 text-zinc-400"
                          }`}
                        >
                          {cp.payment_status === "paid" ? "Zaplaceno" : cp.payment_status === "pending" ? "Čeká" : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {DIAG_STATUS_LABELS[cp.status] ?? cp.status}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/clients/${cp.id}`}
                          className="text-sm font-medium text-[#A8EB12] hover:underline"
                        >
                          Otevřít
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function JobItem({
  job,
  client,
}: {
  job: JobRow;
  client: { name: string; email: string } | null;
}) {
  const label = client ? (client.name || client.email) : job.client_id;
  return (
    <li className="flex items-center justify-between rounded border border-stone-100 bg-white px-2 py-1.5 text-sm">
      <span>
        {label} – {job.week_key}
      </span>
      {job.due_at && (
        <span className="text-stone-500">{new Date(job.due_at).toLocaleDateString("cs-CZ")}</span>
      )}
    </li>
  );
}

function ProjectRow({
  project,
  workflowState,
}: {
  project: ProjectWithBriefAndMeta;
  workflowState: ProjectStateForStatus | null;
}) {
  const displayStatus =
    workflowState != null ? computeProjectStatus(workflowState) : (project.status as string);
  const label = PROJECT_STATUS_LABELS[displayStatus] ?? displayStatus;
  const code = project.project_code ?? project.id.slice(0, 8);
  return (
    <tr className="hover:bg-white/5">
      <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-zinc-200">{code}</td>
      <td className="px-4 py-3 text-sm text-zinc-400">{project.client_email ?? "—"}</td>
      <td className="px-4 py-3 text-sm text-zinc-400">{label}</td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/projects/${project.id}`}
          className="text-sm font-medium text-[#A8EB12] hover:underline"
        >
          Otevřít
        </Link>
      </td>
    </tr>
  );
}
