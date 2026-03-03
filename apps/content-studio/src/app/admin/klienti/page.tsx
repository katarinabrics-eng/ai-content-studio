"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

const SERVICES = ["Strategie", "Text", "Grafika", "Foto", "Video"];

const SERVICE_COLORS: Record<string, string> = {
  Strategie: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Text: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Grafika: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Foto: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Video: "bg-green-500/20 text-green-300 border-green-500/30",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  diagnostika: { label: "Diagnostika", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", dot: "bg-zinc-400" },
  aktivni: { label: "Aktivní", color: "bg-lime-500/20 text-lime-400 border-lime-500/30", dot: "bg-lime-400" },
  zakazka: { label: "Zakázka", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", dot: "bg-blue-400" },
  archivovano: { label: "Archivováno", color: "bg-zinc-700/30 text-zinc-500 border-zinc-700/30", dot: "bg-zinc-600" },
};

const TIMELINE_COLORS: Record<string, string> = {
  auto: "bg-zinc-600",
  client: "bg-lime-500",
  admin: "bg-blue-500",
};

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

export default function AdminKlientiPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<(ProjectItem & { clientName: string; clientEmail: string; clientBrand: string }) | null>(null);
  const [search, setSearch] = useState("");

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/klienti-dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.clients)) setClients(d.clients);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const toggleClient = (id: string) => {
    setClients((c) => c.map((cl) => (cl.id === id ? { ...cl, expanded: !cl.expanded } : cl)));
    setSelectedProject(null);
  };

  const selectProject = (project: ProjectItem, client: ClientItem) => {
    setSelectedProject({
      ...project,
      clientName: client.name,
      clientEmail: client.email,
      clientBrand: client.brand,
    });
  };

  const filtered = clients.filter(
    (cl) =>
      cl.name.toLowerCase().includes(search.toLowerCase()) ||
      cl.brand.toLowerCase().includes(search.toLowerCase()) ||
      cl.email.toLowerCase().includes(search.toLowerCase())
  );

  const sc = selectedProject ? STATUS_CONFIG[selectedProject.status] ?? null : null;

  return (
    <div
      className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {/* LEFT PANEL – Klienti */}
      <div className="w-80 border-r border-zinc-800 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <Link href="/admin/projects" className="text-xs text-zinc-500 hover:text-zinc-300">
              ← Projekty
            </Link>
            <span className="text-xs text-zinc-500">{clients.length} celkem</span>
          </div>
          <span className="text-sm font-semibold text-zinc-300 tracking-wide uppercase block mb-2">Klienti</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat klienta..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-lime-500/50"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-zinc-500 text-sm">Načítám…</p>
          ) : (
            filtered.map((client) => (
              <div key={client.id}>
                <button
                  type="button"
                  onClick={() => toggleClient(client.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors border-b border-zinc-800/50 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-xs font-bold text-lime-400 flex-shrink-0">
                    {client.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">{client.brand}</div>
                    <div className="text-xs text-zinc-500 truncate">{client.name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-zinc-600">{client.projects.length}×</span>
                    <span className="text-xs text-zinc-600">{client.expanded ? "▲" : "▼"}</span>
                  </div>
                </button>

                {client.expanded && (
                  <div className="bg-zinc-900/50">
                    {client.projects.map((project) => {
                      const st = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.diagnostika;
                      const isSelected = selectedProject?.id === project.id;
                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => selectProject(project, client)}
                          className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-colors border-b border-zinc-800/30 ${isSelected ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${st.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-zinc-300 truncate">{project.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs px-1.5 py-0.5 rounded border ${st.color}`}>{st.label}</span>
                              {project.expires && (
                                <span className="text-xs text-amber-500">do {project.expires}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    <Link
                      href="/admin/clients"
                      className="w-full flex items-center gap-2 px-5 py-2.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors border-b border-zinc-800/30"
                    >
                      <span>＋</span> Nová diagnostika
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL – Detail projektu */}
      <div className="flex-1 overflow-y-auto">
        {!selectedProject ? (
          <div className="flex items-center justify-center h-full text-zinc-600">
            <div className="text-center">
              <div className="text-4xl mb-3">↖</div>
              <div className="text-sm">Vyber projekt vlevo</div>
            </div>
          </div>
        ) : (
          <div className="p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-zinc-600 mb-1">
                  {selectedProject.clientBrand} · {selectedProject.clientName}
                </div>
                <h1 className="text-xl font-semibold text-zinc-100">{selectedProject.name}</h1>
              </div>
              <span className={`text-sm px-3 py-1.5 rounded-lg border font-medium ${sc?.color ?? ""}`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${sc?.dot ?? ""}`} />
                {sc?.label ?? selectedProject.status}
              </span>
            </div>

            {(selectedProject.status === "aktivni" || selectedProject.status === "diagnostika") &&
              selectedProject.source === "client_project" &&
              selectedProject.clientProjectId && (
                <div className="mb-5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-300">Převést na zakázku</div>
                    <div className="text-xs text-blue-400/70 mt-0.5">
                      Workflow a platbu nastavíš v detailu klienta
                    </div>
                  </div>
                  <Link
                    href={`/admin/clients/${selectedProject.clientProjectId}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors font-medium"
                  >
                    Otevřít detail
                  </Link>
                </div>
              )}

            {selectedProject.source === "project" && selectedProject.projectId && (
              <div className="mb-5 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl flex items-center justify-between">
                <div className="text-sm text-zinc-400">Projekt AI (strategie, návrhy)</div>
                <Link
                  href={`/admin/projects/${selectedProject.projectId}`}
                  className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white text-sm rounded-lg transition-colors font-medium"
                >
                  Otevřít projekt
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Služby</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.services.length > 0 ? (
                    selectedProject.services.map((svc) => (
                      <span key={svc} className={`text-xs px-2.5 py-1 rounded-lg border ${SERVICE_COLORS[svc] ?? ""}`}>
                        {svc}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-600">—</span>
                  )}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Info</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Vytvořeno</span>
                    <span className="text-zinc-300">{selectedProject.created}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Platnost</span>
                    <span className={selectedProject.expires ? "text-amber-400" : "text-lime-400"}>
                      {selectedProject.expires ? `do ${selectedProject.expires}` : "Neomezená"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Email</span>
                    <span className="text-zinc-300 text-xs truncate max-w-[180px]">{selectedProject.clientEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Interní poznámky</span>
                {selectedProject.source === "project" && selectedProject.projectId && (
                  <Link
                    href={`/admin/projects/${selectedProject.projectId}`}
                    className="text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    ✏️ Upravit v detailu
                  </Link>
                )}
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {selectedProject.notes || <span className="text-zinc-600 italic">Žádné poznámky</span>}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Historie projektu</div>
              <div className="space-y-3">
                {selectedProject.timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TIMELINE_COLORS[item.type] ?? "bg-zinc-600"}`} />
                      {i < selectedProject.timeline.length - 1 && (
                        <div className="w-px h-6 bg-zinc-800 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-zinc-300">{item.event}</div>
                      <div className="text-xs text-zinc-600 mt-0.5">{item.date}</div>
                    </div>
                    <div className="text-xs text-zinc-700">
                      {item.type === "auto" && "⚡ AI"}
                      {item.type === "client" && "👤 klient"}
                      {item.type === "admin" && "🎨 ty"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
