"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ClientProject = {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  web_url: string | null;
  payment_status: string;
  booking_date: string | null;
  booking_time: string | null;
  status: string;
};

export default function AdminClientsPage() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(() => {
    fetch("/api/admin/client-projects")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.projects)) setProjects(d.projects);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <main className="min-h-screen bg-[#0c0c14] p-6 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Klienti (diagnostika)</h1>
            <p className="mt-1 text-zinc-400">Scan + platba + termín. Jeden zdroj pravdy.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/projects"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Projekty (AI)
            </Link>
            <button
              type="button"
              onClick={fetchProjects}
              disabled={loading}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-50"
            >
              Obnovit
            </button>
          </div>
        </div>

        {loading && projects.length === 0 && <p className="mt-6 text-zinc-500">Načítám…</p>}
        {!loading && projects.length === 0 && <p className="mt-6 text-zinc-500">Zatím žádné záznamy.</p>}

        {!loading && projects.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Datum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">E-mail</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Web / vstup</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Platba</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Termín</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Stav</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">
                      {new Date(p.created_at).toLocaleDateString("cs-CZ")}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-200">{p.email ?? "—"}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-sm text-zinc-400" title={p.web_url ?? ""}>
                      {p.web_url || "ruční vstup"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${p.payment_status === "paid" ? "bg-green-500/20 text-green-300" : p.payment_status === "pending" ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-zinc-400"}`}>
                        {p.payment_status === "paid" ? "Zaplaceno" : p.payment_status === "pending" ? "Čeká" : "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">
                      {p.booking_date && p.booking_time ? `${p.booking_date} ${p.booking_time}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{p.status}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/clients/${p.id}`} className="text-sm font-medium text-[#A8EB12] hover:underline">
                        Otevřít
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
