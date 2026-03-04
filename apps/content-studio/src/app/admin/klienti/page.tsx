"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

// ── Status a služby (z clients-section.jsx) ───────────────────
const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  zakazka: { bg: "rgba(59,111,212,0.18)", text: "#6B9FFF", label: "Zakázka" },
  diagnostika: { bg: "rgba(201,160,48,0.18)", text: "#C9A030", label: "Diagnostika" },
  archivovano: { bg: "rgba(255,255,255,0.07)", text: "#666", label: "Archivováno" },
  aktivni: { bg: "rgba(34,197,94,0.15)", text: "#22C55E", label: "Aktivní" },
  draft: { bg: "rgba(255,255,255,0.04)", text: "#444", label: "Draft" },
};

const SERVICE_COLORS: Record<string, { bg: string; text: string }> = {
  Strategie: { bg: "rgba(138,43,226,0.2)", text: "#C084FC" },
  Text: { bg: "rgba(59,130,246,0.2)", text: "#93C5FD" },
  Grafika: { bg: "rgba(236,72,153,0.2)", text: "#F9A8D4" },
  Foto: { bg: "rgba(34,197,94,0.2)", text: "#86EFAC" },
  Video: { bg: "rgba(251,146,60,0.2)", text: "#FDba74" },
};

const AUTHOR_CONFIG: Record<string, { icon: string; label: string }> = {
  auto: { icon: "⚡", label: "AI" },
  client: { icon: "👤", label: "klient" },
  admin: { icon: "✏️", label: "ty" },
};

const TIMELINE_DOT: Record<string, string> = {
  auto: "#333",
  client: "#22C55E",
  admin: "#A8EB12",
};

/** Barvy avataru podle id/brand klienta (konzistentní hash). */
const AVATAR_PALETTE: Array<{ bg: string; text: string }> = [
  { bg: "rgba(30,58,30,0.95)", text: "#6BBF6B" },
  { bg: "rgba(26,46,26,0.95)", text: "#5A9F5A" },
  { bg: "rgba(26,42,58,0.95)", text: "#5A8AAF" },
  { bg: "rgba(58,42,80,0.95)", text: "#B794F6" },
  { bg: "rgba(80,48,28,0.95)", text: "#F6AD55" },
  { bg: "rgba(28,58,58,0.95)", text: "#5EEAD4" },
];

function getAvatarColors(clientId: string): { bg: string; text: string } {
  let h = 0;
  const s = clientId;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  const idx = Math.abs(h) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx]!;
}

type TimelineItem = { date: string; event: string; type: "auto" | "client" | "admin" };
type ProjectItem = {
  id: string;
  name: string;
  status: string;
  created: string;
  expires: string | null;
  services: string[];
  notes: string | null;
  timeline: TimelineItem[];
  source: "client_project" | "project";
  clientProjectId?: string;
  projectId?: string;
};
type ClientItem = {
  id: string;
  name: string;
  email: string;
  brand: string;
  avatar: string;
  expanded: boolean;
  projects: ProjectItem[];
};

// ── Komponenty (podle JSX) ────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className="rounded px-2 py-0.5 text-[11px] font-medium tracking-wide"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}

function ServiceTag({ name }: { name: string }) {
  const c = SERVICE_COLORS[name] ?? SERVICE_COLORS.Text;
  return (
    <span
      className="rounded-md px-3 py-1 text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {name}
    </span>
  );
}

function HistoryTimeline({ items }: { items: TimelineItem[] }) {
  if (!items.length) {
    return <p className="text-[13px] text-[#333] mt-2">Žádná historie.</p>;
  }
  return (
    <div>
      {items.map((item, i) => {
        const auth = AUTHOR_CONFIG[item.type] ?? AUTHOR_CONFIG.admin;
        const dot = TIMELINE_DOT[item.type] ?? "#333";
        return (
          <div
            key={i}
            className="flex items-start gap-3 py-3 border-b border-white/[0.04]"
          >
            <div
              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ background: dot }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#C0C0C0]">{item.event}</div>
              <div className="text-xs text-[#444] mt-0.5">{item.date}</div>
            </div>
            <div className="text-[11px] text-[#555] whitespace-nowrap">
              {auth.icon} {auth.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${className}`}
      style={{
        background: "#141414",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({
  children,
  action,
  onAction,
  actionDisabled,
}: {
  children: React.ReactNode;
  action?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}) {
  return (
    <div className="flex justify-between items-center mb-3">
      <span
        className="text-[11px] font-semibold uppercase tracking-wider text-[#555]"
      >
        {children}
      </span>
      {action && (
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          className="text-[13px] text-[#A8EB12] hover:underline bg-transparent border-none cursor-pointer p-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function ProjectDetail({
  project,
  clientName,
  clientBrand,
  clientEmail,
  onNotesSaved,
}: {
  project: ProjectItem & { clientName: string; clientEmail: string; clientBrand: string };
  clientName: string;
  clientBrand: string;
  clientEmail: string;
  onNotesSaved?: () => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(project.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const validity =
    project.expires != null && project.expires !== ""
      ? `do ${project.expires}`
      : "Neomezená";
  const validityColor = validity === "Neomezená" ? "#22C55E" : "#F0F0F0";

  return (
    <div className="p-8 overflow-y-auto h-full">
      {/* Breadcrumb */}
      <div className="text-[13px] text-[#666] mb-1.5">
        {clientBrand} · {clientName}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[28px] font-bold text-[#F0F0F0] m-0">
          {project.name}
        </h1>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-zinc-900"
          style={{ background: "#A8EB12" }}
        >
          <span
            className="w-2 h-2 rounded-full bg-zinc-700 inline-block"
          />
          {STATUS_CONFIG[project.status]?.label ?? project.status}
        </span>
      </div>

      {/* CTA pro diagnostiku / projekt */}
      {(project.status === "aktivni" || project.status === "diagnostika") &&
        project.source === "client_project" &&
        project.clientProjectId && (
          <div className="mb-5 p-4 rounded-xl flex items-center justify-between border border-[#A8EB12]/25 bg-[#A8EB12]/10">
            <div>
              <div className="text-sm font-medium text-[#A8EB12]">Převést na zakázku</div>
              <div className="text-xs text-[#888] mt-0.5">
                Workflow a platbu nastavíš v detailu klienta
              </div>
            </div>
            <Link
              href={`/admin/clients/${project.clientProjectId}`}
              className="px-4 py-2 rounded-lg bg-[#A8EB12] hover:bg-[#b8f022] text-zinc-900 text-sm font-medium transition-colors"
            >
              Otevřít detail
            </Link>
          </div>
        )}

      {project.source === "project" && project.projectId && (
        <div className="mb-5 p-4 rounded-xl flex items-center justify-between border border-white/[0.06] bg-white/[0.03]">
          <div className="text-sm text-[#888]">Projekt AI (strategie, návrhy)</div>
          <Link
            href={`/admin/projects/${project.projectId}`}
            className="px-4 py-2 rounded-lg bg-[#A8EB12] hover:bg-[#b8f022] text-zinc-900 text-sm font-medium transition-colors"
          >
            Otevřít projekt
          </Link>
        </div>
      )}

      {/* Grid 2 sloupce */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardLabel action="+ Upravit">
            Služby
          </CardLabel>
          <div className="flex flex-wrap gap-2">
            {project.services.length > 0 ? (
              project.services.map((s) => <ServiceTag key={s} name={s} />)
            ) : (
              <span className="text-[13px] text-[#444]">Žádné služby</span>
            )}
          </div>
        </Card>

        <Card>
          <CardLabel>Info</CardLabel>
          <div className="space-y-0">
            <div className="flex justify-between py-1.5 border-b border-white/[0.04] text-sm">
              <span className="text-[#666]">Vytvořeno</span>
              <span className="text-[#F0F0F0]">{project.created}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04] text-sm">
              <span className="text-[#666]">Platnost</span>
              <span style={{ color: validityColor }}>{validity}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04] text-sm">
              <span className="text-[#666]">Email</span>
              <span className="text-[#F0F0F0] truncate max-w-[180px]">{clientEmail}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Poznámky – u projektů ukládáme přes API */}
      <Card className="mb-4">
        <CardLabel
          action={
            editingNotes
              ? savingNotes
                ? "Ukládám…"
                : "✓ Uložit"
              : "✏️ Upravit"
          }
          actionDisabled={savingNotes}
          onAction={async () => {
            if (editingNotes) {
              if (project.source === "project" && project.projectId) {
                setSavingNotes(true);
                try {
                  const res = await fetch(`/api/admin/projects/${project.projectId}/notes`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ internal_notes: notes || null }),
                  });
                  const data = await res.json();
                  if (data.ok) {
                    setNotes(data.internal_notes ?? "");
                    setEditingNotes(false);
                    setNotesSaved(true);
                    onNotesSaved?.();
                    setTimeout(() => setNotesSaved(false), 2000);
                  }
                } finally {
                  setSavingNotes(false);
                }
              } else {
                setEditingNotes(false);
              }
            } else {
              setEditingNotes(true);
            }
          }}
        >
          Interní poznámky
        </CardLabel>
        {editingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={savingNotes}
            className="w-full rounded-md border border-white/10 bg-white/5 text-[#C0C0C0] text-sm p-2.5 min-h-[80px] resize-y outline-none font-sans leading-relaxed box-border disabled:opacity-70"
          />
        ) : (
          <p className="text-sm leading-relaxed m-0" style={{ color: notes ? "#C0C0C0" : "#444" }}>
            {notes || "Zatím žádné poznámky."}
          </p>
        )}
        {notesSaved && (
          <p className="text-xs text-[#22C55E] mt-2">Uloženo.</p>
        )}
        {project.source === "project" && project.projectId && !editingNotes && (
          <p className="text-xs text-[#555] mt-2">
            <Link href={`/admin/projects/${project.projectId}`} className="text-[#A8EB12] hover:underline">
              Otevřít detail projektu
            </Link>
          </p>
        )}
      </Card>

      {/* Historie */}
      <Card>
        <CardLabel>Historie projektu</CardLabel>
        <HistoryTimeline items={project.timeline} />
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[#333]">
      <div className="text-4xl mb-2 -rotate-[10deg]">↖</div>
      <div className="text-[15px]">Vyber projekt vlevo</div>
    </div>
  );
}

// ── Hlavní stránka ───────────────────────────────────────────
export default function AdminKlientiPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<
    (ProjectItem & { clientName: string; clientEmail: string; clientBrand: string }) | null
  >(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ totalClientProjects?: number; totalProjects?: number }>({});
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/admin/klienti-dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.clients)) {
          setClients(d.clients);
          if (d.meta) setMeta(d.meta);
          const first = d.clients[0];
          if (first?.projects?.length) {
            setExpandedClients({ [first.id]: true });
            setSelectedProject({
              ...first.projects[0],
              clientName: first.name,
              clientEmail: first.email,
              clientBrand: first.brand,
            });
            setSelectedClientId(first.id);
          } else {
            setSelectedProject(null);
            setSelectedClientId(null);
            setExpandedClients({});
          }
        } else {
          setFetchError(d.error ?? "Chyba načtení.");
        }
      })
      .catch(() => setFetchError("Chyba připojení. Jste na stejné adrese jako při diagnostice?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const toggleClient = (id: string) => {
    setExpandedClients((prev) => ({ ...prev, [id]: !prev[id] }));
    setSelectedProject(null);
    setSelectedClientId(null);
  };

  const selectProject = (project: ProjectItem, client: ClientItem) => {
    setSelectedProject({
      ...project,
      clientName: client.name,
      clientEmail: client.email,
      clientBrand: client.brand,
    });
    setSelectedClientId(client.id);
  };

  const filtered = clients.filter(
    (cl) =>
      cl.name.toLowerCase().includes(search.toLowerCase()) ||
      cl.brand.toLowerCase().includes(search.toLowerCase()) ||
      cl.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  return (
    <div className="flex h-full min-h-0 bg-[#0A0A0A] text-[#F0F0F0] overflow-hidden">
      {showClearModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => !clearing && setShowClearModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#141414] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white">Vyčistit vše</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Smaže všechny diagnostiky i všechny AI projekty z databáze. Přehled bude úplně prázdný. Toto nelze vrátit.
            </p>
            {clearError && <p className="mt-3 text-sm text-red-400">{clearError}</p>}
            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                disabled={clearing}
                onClick={() => setShowClearModal(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-50"
              >
                Zrušit
              </button>
              <button
                type="button"
                disabled={clearing}
                onClick={async () => {
                  setClearing(true);
                  setClearError(null);
                  try {
                    const res = await fetch("/api/admin/clear-data", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ scope: "all" }),
                    });
                    const data = await res.json();
                    if (data.ok) {
                      setShowClearModal(false);
                      fetchDashboard();
                    } else {
                      setClearError(data.error ?? "Chyba");
                    }
                  } catch {
                    setClearError("Chyba připojení.");
                  } finally {
                    setClearing(false);
                  }
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {clearing ? "Mažu…" : "Smazat vše"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar 370px (z JSX) */}
      <div
        className="w-[370px] min-w-[370px] flex flex-col border-r overflow-y-auto"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="pt-6 px-5 pb-0">
          {fetchError && (
            <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {fetchError}
              <p className="mt-1 text-amber-200/80">Admin otevřete na stejné URL jako diagnostika (Vercel vs. localhost = jiná DB).</p>
            </div>
          )}
          <div className="flex justify-between items-center mb-3">
            <span
              className="text-xs font-bold uppercase tracking-widest text-[#F0F0F0]"
            >
              Klienti
            </span>
            <span className="text-[13px] text-[#555]">
              {clients.length} celkem
              {(meta.totalClientProjects != null || meta.totalProjects != null) && (
                <span className="block text-[11px] text-[#666] mt-0.5">
                  {meta.totalClientProjects ?? 0} diagnostik · {meta.totalProjects ?? 0} projektů
                </span>
              )}
            </span>
          </div>
          {clients.length > 0 && (
            <button
              type="button"
              onClick={() => { setShowClearModal(true); setClearError(null); }}
              className="mb-3 w-full rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20"
            >
              Vyčistit vše (diagnostiky i projekty)
            </button>
          )}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat klienta..."
            className="w-full rounded-lg px-3.5 py-2.5 text-sm text-[#F0F0F0] placeholder-[#666] outline-none border border-white/[0.08] bg-white/5 box-border"
          />
        </div>

        <div className="h-px bg-white/[0.06] mt-4" />

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-[#555] text-sm">Načítám…</p>
          ) : (
            filtered.map((client) => {
              const isExpanded = !!expandedClients[client.id];
              const avatarColors = getAvatarColors(client.id);
              return (
                <div key={client.id}>
                  <button
                    type="button"
                    onClick={() => toggleClient(client.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05] text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold tracking-wide flex-shrink-0"
                      style={{
                        background: avatarColors.bg,
                        color: avatarColors.text,
                      }}
                    >
                      {client.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-medium text-[#F0F0F0]">
                        {client.brand}
                      </div>
                      <div className="text-[13px] text-[#666] mt-0.5">
                        {client.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] text-[#555]">
                        {client.projects.length}×
                      </div>
                      <div
                        className="text-[9px] text-[#444] mt-0.5 transition-transform"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}
                      >
                        ▼
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div>
                      {client.projects.map((project) => {
                        const isActive = selectedProject?.id === project.id;
                        const st = STATUS_CONFIG[project.status];
                        const dotColor =
                          isActive
                            ? "#A8EB12"
                            : project.status === "archivovano"
                              ? "#2A2A2A"
                              : "#333";
                        return (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => selectProject(project, client)}
                            className={`w-full flex items-center gap-2.5 pl-[58px] pr-5 py-2.5 border-b border-white/[0.03] text-left transition-colors ${
                              isActive ? "bg-[#A8EB12]/10 border-l-2 border-l-[#A8EB12]" : "border-l-2 border-l-transparent hover:bg-white/[0.03]"
                            }`}
                          >
                            <div
                              className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                              style={{ background: dotColor }}
                            />
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-sm ${isActive ? "text-[#F0F0F0]" : "text-[#B0B0B0]"}`}
                              >
                                {project.name}
                              </div>
                              <div className="flex gap-1.5 mt-1 flex-wrap items-center">
                                <StatusBadge status={project.status} />
                                {project.expires && (
                                  <span
                                    className="rounded px-2 py-0.5 text-[11px]"
                                    style={{
                                      background: "rgba(201,160,48,0.15)",
                                      color: "#C9A030",
                                    }}
                                  >
                                    do {project.expires}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      <Link
                        href="/admin/new-client"
                        className="flex items-center w-full pl-[58px] pr-5 py-2.5 text-[13px] text-[#444] hover:text-[#888] transition-colors border-b border-white/[0.03]"
                      >
                        + Nová diagnostika
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {selectedProject && selectedClient ? (
          <ProjectDetail
            project={selectedProject}
            clientName={selectedClient.name}
            clientBrand={selectedClient.brand}
            clientEmail={selectedClient.email}
            onNotesSaved={fetchDashboard}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
