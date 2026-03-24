"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Typy ─────────────────────────────────────────────────────────────────────

interface RtgClient {
  id: string;
  created_at: string;
  client_name: string;
  email: string;
  plan: "start" | "plus" | "pro" | string;
  interval_days: number | null;
  short_code: string | null;
  access_token: string | null;
  onboarding_completed: boolean;
  pending_posts: number;
  pending_tasks: number;
  last_batch: { week_start: string; week_label: string } | null;
}

interface AdminTask {
  id: string;
  project_id: string;
  type: string;
  status: string;
  priority: string | null;
  note: string | null;
  created_at: string;
  client_projects: { client_name: string | null; email: string | null } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_BADGE: Record<string, string> = {
  start: "bg-gray-100 text-gray-600",
  plus:  "bg-blue-50 text-blue-700",
  pro:   "bg-purple-50 text-purple-700",
};

const TASK_TYPE_LABEL: Record<string, string> = {
  generate_batch: "Generovat batch",
  video_cutting:  "Střih videa",
  review:         "Review",
  send_access:    "Poslat přístup",
};

const PRIORITY_BADGE: Record<string, string> = {
  high:   "bg-red-50 text-red-600",
  medium: "bg-yellow-50 text-yellow-700",
  low:    "bg-gray-100 text-gray-500",
};

function firstOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#d0ec78] text-black rounded-lg px-4 py-2 text-sm font-medium shadow-lg animate-fade-in">
      {message}
    </div>
  );
}

// ─── Stránka ──────────────────────────────────────────────────────────────────

export default function AdminRtgPage() {
  const [clients, setClients] = useState<RtgClient[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsRes, tasksRes] = await Promise.all([
        fetch("/api/admin/rtg/clients"),
        fetch("/api/admin/rtg/tasks?status=new,in_progress"),
      ]);
      const clientsData = (await clientsRes.json()) as { clients?: RtgClient[] };
      const tasksData = (await tasksRes.json()) as { tasks?: AdminTask[] };
      setClients(clientsData.clients ?? []);
      setTasks(tasksData.tasks ?? []);
    } catch {
      // tiché selhání — data zůstanou prázdná
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Toast helper ──────────────────────────────────────────────────────────

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Akce ──────────────────────────────────────────────────────────────────

  async function handleSendAccess(clientId: string) {
    setActionLoading(`send-${clientId}`);
    try {
      await fetch("/api/admin/rtg/send-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: clientId }),
      });
      showToast("Odkaz odeslán");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleGenerate(clientId: string) {
    setGenerating(clientId);
    setActionLoading(`gen-${clientId}`);
    try {
      const res = await fetch("/api/admin/rtg/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: clientId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      showToast(data.ok ? "Generování dokončeno ✓" : data.error ?? "Chyba");
      if (data.ok) loadData();
    } finally {
      setGenerating(null);
      setActionLoading(null);
    }
  }

  async function handleTaskDone(taskId: string) {
    setActionLoading(`task-${taskId}`);
    try {
      await fetch(`/api/admin/rtg/tasks?id=${taskId}`, { method: "PATCH" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast("Task uzavřen");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Metriky ───────────────────────────────────────────────────────────────

  const totalPendingPosts = clients.reduce((s, c) => s + c.pending_posts, 0);
  const totalPendingTasks = clients.reduce((s, c) => s + c.pending_tasks, 0);
  const firstMonth = firstOfMonth();
  const newThisMonth = clients.filter((c) => c.created_at >= firstMonth).length;

  const metrics = [
    { label: "RTG Klientů",         value: clients.length,    color: "text-[#1a1a1a]" },
    { label: "Čeká na schválení",   value: totalPendingPosts, color: totalPendingPosts > 0 ? "text-red-600" : "text-[#1a1a1a]" },
    { label: "Otevřené tasky",      value: totalPendingTasks, color: totalPendingTasks > 0 ? "text-orange-600" : "text-[#1a1a1a]" },
    { label: "Nových tento měsíc",  value: newThisMonth,      color: "text-[#1a1a1a]" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#d0ec78] rounded-full animate-spin" />
          <span className="text-sm">Načítám RTG data…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast} />}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Nadpis */}
        <div>
          <h1 className="text-xl font-semibold text-[#111]">RTG Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ready to Go — přehled klientů a obsahu</p>
        </div>

        {/* ── SEKCE A: Metriky ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-white border border-[#e8e8e4] rounded-xl px-5 py-4"
            >
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                {m.label}
              </p>
              <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* ── SEKCE B: Tabulka klientů ─────────────────────────────────────── */}
        <div className="bg-white border border-[#e8e8e4] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0f0ee]">
            <h2 className="text-sm font-semibold text-[#111]">Klienti</h2>
          </div>

          {clients.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">
              Žádní RTG klienti. Přidejte klienta s plánem start / plus / pro.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0f0ee] text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">Klient</th>
                    <th className="px-4 py-3 text-left font-medium">Plán</th>
                    <th className="px-4 py-3 text-left font-medium">Interval</th>
                    <th className="px-4 py-3 text-center font-medium">Čeká</th>
                    <th className="px-4 py-3 text-center font-medium">Tasky</th>
                    <th className="px-4 py-3 text-left font-medium">Poslední batch</th>
                    <th className="px-5 py-3 text-right font-medium">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f2]">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#fafaf8] transition-colors">
                      {/* Klient + email */}
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#111] leading-tight">{client.client_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{client.email}</p>
                        {!client.onboarding_completed && (
                          <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full">
                            onboarding
                          </span>
                        )}
                      </td>

                      {/* Plán */}
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase ${PLAN_BADGE[client.plan] ?? "bg-gray-100 text-gray-600"}`}>
                          {client.plan}
                        </span>
                      </td>

                      {/* Interval */}
                      <td className="px-4 py-3 text-gray-600">
                        {client.interval_days ? `${client.interval_days} dní` : "—"}
                      </td>

                      {/* Čekající posty */}
                      <td className="px-4 py-3 text-center">
                        {client.pending_posts > 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                            {client.pending_posts}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Tasky */}
                      <td className="px-4 py-3 text-center">
                        {client.pending_tasks > 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-50 text-orange-600 text-xs font-bold">
                            {client.pending_tasks}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Poslední batch */}
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {client.last_batch
                          ? new Date(client.last_batch.week_start).toLocaleDateString("cs-CZ", {
                              day: "numeric",
                              month: "short",
                            })
                          : "—"}
                      </td>

                      {/* Akce */}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendAccess(client.id)}
                            disabled={actionLoading === `send-${client.id}`}
                            className="text-xs px-3 py-1.5 rounded-lg border border-[#e8e8e4] bg-white text-[#444] hover:bg-[#f5f5f2] disabled:opacity-40 transition-colors"
                          >
                            {actionLoading === `send-${client.id}` ? "…" : "Poslat odkaz"}
                          </button>
                          <button
                            onClick={() => handleGenerate(client.id)}
                            disabled={!!generating || !client.onboarding_completed}
                            className="text-xs px-3 py-1.5 rounded-lg bg-[#111] text-white hover:bg-[#333] disabled:opacity-40 transition-colors flex items-center gap-1.5"
                            title={!client.onboarding_completed ? "Klient nemá dokončený onboarding" : undefined}
                          >
                            {generating === client.id ? (
                              <>
                                <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                Generuji…
                              </>
                            ) : "Generovat"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Banner — generování probíhá */}
          {generating && (
            <div className="mt-4 flex items-center gap-3 bg-[#f3fbdc] border border-[#d0ec78] rounded-xl px-5 py-3 text-sm text-[#444]">
              <span className="inline-block w-4 h-4 border-2 border-[#b5d45c] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span>
                Generování obsahu probíhá — může trvat až 2 minuty. Nezavírejte stránku.
              </span>
            </div>
          )}
        </div>

        {/* ── SEKCE C: Admin tasky ─────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-[#111] mb-3">Otevřené tasky</h2>

          {tasks.length === 0 ? (
            <div className="bg-white border border-[#e8e8e4] rounded-xl px-5 py-8 text-center text-sm text-gray-400">
              Žádné otevřené tasky 🎉
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => {
                const clientName =
                  task.client_projects?.client_name ??
                  task.client_projects?.email ??
                  "Neznámý klient";
                const typeLabel = TASK_TYPE_LABEL[task.type] ?? task.type;
                const priorityCls = PRIORITY_BADGE[task.priority ?? "medium"] ?? PRIORITY_BADGE.medium;

                return (
                  <div
                    key={task.id}
                    className="bg-white border border-[#e8e8e4] rounded-xl p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-[#111]">{typeLabel}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{clientName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${priorityCls}`}>
                          {task.priority ?? "medium"}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {task.note && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {task.note}
                      </p>
                    )}

                    <button
                      onClick={() => handleTaskDone(task.id)}
                      disabled={actionLoading === `task-${task.id}`}
                      className="w-full text-xs py-2 rounded-lg bg-[#f5f5f2] text-[#444] hover:bg-[#e8e8e4] disabled:opacity-40 transition-colors font-medium"
                    >
                      {actionLoading === `task-${task.id}` ? "…" : "Hotovo ✓"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
