import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientById } from "@/lib/supabase-clients";
import {
  CLIENT_JOB_STATUS_LABELS,
  CLIENT_JOB_STATUS_ORDER,
  type ClientJobStatus,
} from "@/lib/client-status-engine";

export const dynamic = "force-dynamic";

type JobRow = {
  id: string;
  client_id: string;
  week_key: string;
  status: ClientJobStatus;
  due_at: string | null;
  updated_at: string;
};

type ClientMap = Record<string, { name: string; email: string } | null>;

export default async function CuratorDashboardPage() {
  const supabase = getSupabaseClient();
  const { data: rows, error } = await supabase
    .from("client_jobs")
    .select("id, client_id, week_key, status, due_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Chyba při načítání: {error.message}
      </div>
    );
  }

  const jobs = (rows ?? []) as JobRow[];
  const clientIds = Array.from(new Set(jobs.map((j) => j.client_id)));
  const clientMap: ClientMap = {};
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kurátor – přehled podle stavu</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pouze zakázky. Pro plnou pracovní plochu (zakázky + projekty + diagnostika) otevři{" "}
            <Link href="/admin/klienti" className="font-medium text-slate-700 underline hover:text-slate-900">
              Admin – Klienti
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/klienti"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Admin – Klienti
          </Link>
          <Link
            href="/drafts"
            className="rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            Návrhy postů
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {CLIENT_JOB_STATUS_ORDER.map((status) => {
          const list = byStatus[status] ?? [];
          if (list.length === 0) return null;
          return (
            <section
              key={status}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <h2 className="font-semibold text-slate-800">
                {CLIENT_JOB_STATUS_LABELS[status]} ({list.length})
              </h2>
              <ul className="mt-3 space-y-2">
                {list.map((job) => (
                  <JobItem key={job.id} job={job} client={clientMap[job.client_id]} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {jobs.length === 0 && (
        <p className="text-slate-500">Zatím nejsou žádné klientské zakázky.</p>
      )}
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
    <li className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
      <span>
        {label} – {job.week_key}
      </span>
      {job.due_at && (
        <span className="text-slate-500">
          {new Date(job.due_at).toLocaleDateString("cs-CZ")}
        </span>
      )}
    </li>
  );
}
