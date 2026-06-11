"use client";

import { useState, useEffect, useCallback } from "react";

const C = {
  lime: "#a8d800",
  bg0: "#ffffff",
  bg1: "#f7f7f7",
  bg2: "#f0f0f0",
  border: "rgba(0,0,0,0.08)",
  text: "#111111",
  muted: "#555555",
  faint: "#999999",
  green: "#16a34a",
  orange: "#d97706",
  red: "#dc2626",
};

type ClientProject = {
  id: string;
  client_project_name: string | null;
  email: string | null;
  workflow_status: string | null;
  drive_config?: {
    drive_folder_id: string;
    last_synced_at: string | null;
    folder_structure: Record<string, unknown[]> | null;
    text_contents: Record<string, string> | null;
    is_active: boolean;
  } | null;
};

type SyncState = "idle" | "loading" | "success" | "error";

type SyncResult = {
  totalFiles: number;
  summary: Record<string, number>;
  textFilesDownloaded: number;
  error?: string;
};

export default function AdminDrivePage() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Record<string, SyncState>>({});
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});
  const [folderIds, setFolderIds] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/drive/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects ?? []);
        // Prefill folder IDs from existing config
        const ids: Record<string, string> = {};
        for (const p of (data.projects ?? []) as ClientProject[]) {
          if (p.drive_config?.drive_folder_id) {
            ids[p.id] = p.drive_config.drive_folder_id;
          }
        }
        setFolderIds(ids);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSync = async (projectId: string) => {
    const folderId = folderIds[projectId]?.trim();
    if (!folderId) return;

    setSyncing((s) => ({ ...s, [projectId]: "loading" }));
    setSyncResults((r) => {
      const next = { ...r };
      delete next[projectId];
      return next;
    });

    try {
      const res = await fetch("/api/admin/drive/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientProjectId: projectId, folderId }),
      });
      const data = await res.json();

      if (data.success) {
        setSyncing((s) => ({ ...s, [projectId]: "success" }));
        setSyncResults((r) => ({ ...r, [projectId]: data }));
        fetchProjects();
      } else {
        setSyncing((s) => ({ ...s, [projectId]: "error" }));
        setSyncResults((r) => ({ ...r, [projectId]: { ...data, totalFiles: 0, summary: {}, textFilesDownloaded: 0 } }));
      }
    } catch (e) {
      setSyncing((s) => ({ ...s, [projectId]: "error" }));
      setSyncResults((r) => ({ ...r, [projectId]: { error: String(e), totalFiles: 0, summary: {}, textFilesDownloaded: 0 } }));
    }
  };

  const statusColor = (ws: string | null) => {
    if (!ws) return C.faint;
    if (ws.includes("AKTIVNI") || ws.includes("aktiv")) return C.green;
    if (ws.includes("HOVOR")) return C.orange;
    return C.muted;
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const totalFileCount = (fc: Record<string, unknown[]> | null) => {
    if (!fc) return 0;
    return Object.values(fc).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
            Google Drive · Sync
          </h1>
          <p style={{ fontSize: 12, color: C.faint, margin: 0 }}>
            Připojte Drive složku klienta a synchronizujte soubory do databáze.
          </p>
        </div>
        <a
          href="/api/admin/drive/test"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11, fontWeight: 600, color: C.muted,
            border: `1px solid ${C.border}`, borderRadius: 7,
            padding: "6px 14px", textDecoration: "none",
            background: C.bg1,
          }}
        >
          🔌 Test připojení
        </a>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.faint, fontSize: 13 }}>Načítám projekty…</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.faint, fontSize: 13 }}>Žádné projekty nenalezeny.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {projects.map((project) => {
            const state = syncing[project.id] ?? "idle";
            const result = syncResults[project.id];
            const isExpanded = expandedId === project.id;
            const hasDrive = !!project.drive_config;
            const fileCount = totalFileCount(project.drive_config?.folder_structure ?? null);

            return (
              <div
                key={project.id}
                style={{
                  background: C.bg0,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: C.lime, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 13, fontWeight: 800,
                    color: "#111", flexShrink: 0,
                  }}>
                    {(project.client_project_name ?? project.email ?? "?")[0].toUpperCase()}
                  </div>

                  {/* Name + status */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {project.client_project_name ?? project.email ?? project.id.slice(0, 8)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: statusColor(project.workflow_status), fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {project.workflow_status ?? "—"}
                      </span>
                      {hasDrive && (
                        <span style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>
                          ✓ Drive · {fileCount} souborů
                          {project.drive_config?.last_synced_at && (
                            <span style={{ color: C.faint, fontWeight: 400 }}> · {formatDate(project.drive_config.last_synced_at)}</span>
                          )}
                        </span>
                      )}
                      {!hasDrive && (
                        <span style={{ fontSize: 10, color: C.faint }}>Drive nepřipojen</span>
                      )}
                    </div>
                  </div>

                  {/* Folder ID input */}
                  <input
                    type="text"
                    placeholder="ID složky z Drive URL…"
                    value={folderIds[project.id] ?? ""}
                    onChange={(e) => setFolderIds((f) => ({ ...f, [project.id]: e.target.value }))}
                    style={{
                      width: 260, fontSize: 11, padding: "6px 10px",
                      border: `1px solid ${C.border}`, borderRadius: 7,
                      background: C.bg1, color: C.text, outline: "none",
                      fontFamily: "monospace",
                    }}
                  />

                  {/* Sync button */}
                  <button
                    onClick={() => handleSync(project.id)}
                    disabled={state === "loading" || !folderIds[project.id]?.trim()}
                    style={{
                      padding: "7px 16px", fontSize: 11, fontWeight: 700,
                      borderRadius: 7, border: "none", cursor: state === "loading" ? "wait" : "pointer",
                      background: state === "loading" ? C.bg2
                        : state === "success" ? "rgba(22,163,74,0.12)"
                        : state === "error" ? "rgba(220,38,38,0.1)"
                        : C.lime,
                      color: state === "loading" ? C.muted
                        : state === "success" ? C.green
                        : state === "error" ? C.red
                        : "#111",
                      flexShrink: 0,
                    }}
                  >
                    {state === "loading" ? "⟳ Sync…" : state === "success" ? "✓ Hotovo" : state === "error" ? "✗ Chyba" : "↓ Sync"}
                  </button>

                  {/* Expand */}
                  {hasDrive && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : project.id)}
                      style={{
                        width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
                        background: C.bg1, cursor: "pointer", fontSize: 14, color: C.muted,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  )}
                </div>

                {/* Result bar */}
                {result && (
                  <div style={{
                    padding: "8px 18px", fontSize: 11,
                    background: result.error ? "rgba(220,38,38,0.06)" : "rgba(22,163,74,0.07)",
                    borderTop: `1px solid ${C.border}`,
                    color: result.error ? C.red : C.green,
                  }}>
                    {result.error ? (
                      <>⚠ {result.error}</>
                    ) : (
                      <>
                        ✓ Synchronizováno · {result.totalFiles} souborů celkem ·{" "}
                        {result.textFilesDownloaded} textů staženo ·{" "}
                        {Object.entries(result.summary ?? {}).map(([k, v]) => `${k}: ${v}`).join(", ")}
                      </>
                    )}
                  </div>
                )}

                {/* Expanded: file structure */}
                {isExpanded && project.drive_config?.folder_structure && (
                  <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.border}`, background: C.bg1 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                      {Object.entries(project.drive_config.folder_structure).map(([folder, files]) => (
                        <div key={folder} style={{
                          background: C.bg0, borderRadius: 8, padding: "10px 12px",
                          border: `1px solid ${C.border}`,
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 6 }}>
                            📁 {folder}
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: (files as unknown[]).length > 0 ? C.text : C.faint }}>
                            {(files as unknown[]).length}
                          </div>
                          <div style={{ fontSize: 10, color: C.faint }}>souborů</div>
                        </div>
                      ))}
                    </div>

                    {/* Text contents preview */}
                    {project.drive_config.text_contents && Object.keys(project.drive_config.text_contents).length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 8 }}>
                          📄 Stažené texty
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {Object.entries(project.drive_config.text_contents).map(([name, content]) => (
                            <details key={name} style={{ fontSize: 11, color: C.text }}>
                              <summary style={{ cursor: "pointer", fontWeight: 600, padding: "4px 8px", background: C.bg2, borderRadius: 5 }}>
                                {name}
                              </summary>
                              <pre style={{
                                margin: "6px 0 0", padding: "8px 10px",
                                background: C.bg0, borderRadius: 6, border: `1px solid ${C.border}`,
                                fontSize: 10, lineHeight: 1.6, whiteSpace: "pre-wrap",
                                maxHeight: 200, overflow: "auto", color: C.muted,
                              }}>
                                {content.slice(0, 1200)}{content.length > 1200 ? "\n…" : ""}
                              </pre>
                            </details>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
