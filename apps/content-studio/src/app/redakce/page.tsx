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

export default async function RedakcePage() {
  const supabase = getSupabaseClient();

  const [jobsResult, projects, clientProjects] = await Promise.all([
    supabase
      .from("client_jobs")
      .select("id, client_id, week_key, status, due_at, updated_at")
      .order("updated_at", { ascending: false }),
    listProjects(),
    listClientProjects(),
  ]);

  const stateMap = await getWorkflowStateForProjects(projects);
  const jobs = (jobsResult.data ?? []) as JobRow[];
  const clientIds = Array.from(new Set(jobs.map((j) => j.client_id)));
  const clientMap: Record<string, { name: string; email: string } | null> = {};
  await Promise.all(
    clientIds.map(async (id) => {
      const c = await getClientById(id);
      clientMap[id] = c ? { name: c.name, email: c.email } : null;
    })
  );

  const byStatus = CLIENT_JOB_STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = jobs.filter((j) => j.status === status);
      return acc;
    },
    {} as Record<ClientJobStatus, JobRow[]>
  );

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Redakční okno</h1>
            <p className="mt-1 text-stone-600">
              Jedno místo: zakázky, projekty a diagnostika. Kurátorská pracovní plocha.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/curator"
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Pouze zakázky
            </Link>
            <Link
              href="/admin/projects"
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Admin – projekty
            </Link>
            <Link
              href="/admin/clients"
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Admin – diagnostika
            </Link>
            <Link
              href="/drafts"
              className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
            >
              Návrhy postů
            </Link>
          </div>
        </header>

        {/* 1. Zakázky (client_jobs) */}
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-800">Zakázky</h2>
          <p className="mt-1 text-sm text-stone-500">Přehled podle stavu (client_jobs).</p>
          {jobs.length === 0 ? (
            <p className="mt-4 text-stone-500">Zatím nejsou žádné klientské zakázky.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CLIENT_JOB_STATUS_ORDER.map((status) => {
                const list = byStatus[status] ?? [];
                if (list.length === 0) return null;
                return (
                  <div
                    key={status}
                    className="rounded-lg border border-stone-100 bg-stone-50 p-4"
                  >
                    <h3 className="font-medium text-stone-700">
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
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-800">Projekty</h2>
          <p className="mt-1 text-sm text-stone-500">Projekty z platby (Stripe). Stav a odkaz na detail.</p>
          {projects.length === 0 ? (
            <p className="mt-4 text-stone-500">Zatím žádné projekty.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-stone-200">
              <table className="min-w-full divide-y divide-stone-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">Kód</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">E-mail</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">Stav</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-stone-500">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
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
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-800">Diagnostika</h2>
          <p className="mt-1 text-sm text-stone-500">Scan + platba + termín. Redakční základ.</p>
          {clientProjects.length === 0 ? (
            <p className="mt-4 text-stone-500">Zatím žádné záznamy z diagnostiky.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-stone-200">
              <table className="min-w-full divide-y divide-stone-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">Datum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">Jméno / e-mail</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">Platba</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">Stav</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-stone-500">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {clientProjects.map((cp) => (
                    <tr key={cp.id} className="hover:bg-stone-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-600">
                        {new Date(cp.created_at).toLocaleDateString("cs-CZ")}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-900">
                        {cp.name || cp.email || "—"}
                        {cp.email && cp.name !== cp.email && (
                          <span className="block text-xs text-stone-500">{cp.email}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                            cp.payment_status === "paid"
                              ? "bg-green-100 text-green-800"
                              : cp.payment_status === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {cp.payment_status === "paid" ? "Zaplaceno" : cp.payment_status === "pending" ? "Čeká" : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">
                        {DIAG_STATUS_LABELS[cp.status] ?? cp.status}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/clients/${cp.id}`}
                          className="text-sm font-medium text-stone-700 hover:text-stone-900"
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
    <tr className="hover:bg-stone-50">
      <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-stone-800">{code}</td>
      <td className="px-4 py-3 text-sm text-stone-600">{project.client_email ?? "—"}</td>
      <td className="px-4 py-3 text-sm text-stone-600">{label}</td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/projects/${project.id}`}
          className="text-sm font-medium text-stone-700 hover:text-stone-900"
        >
          Otevřít
        </Link>
      </td>
    </tr>
  );
}
