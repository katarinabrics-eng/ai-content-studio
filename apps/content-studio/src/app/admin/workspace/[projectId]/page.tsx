"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ScoreRing } from "@/components/ScoreRing";

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg: "#fafaf8",
  card: "#ffffff",
  border: "#e8e8e0",
  accent: "#b7e94c",
  accentLight: "#f2fcd8",
  text: "#111111",
  muted: "#888888",
  faint: "#cccccc",
  green: "#16a34a",
  orange: "#d97706",
  red: "#ef4444",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  subfolder: string | null;
};

type FolderStructure = Record<string, DriveFile[]>;

type Project = {
  id: string;
  client_project_name: string | null;
  email: string | null;
  workflow_status: string | null;
  scan_result: {
    brandScore?: { total?: number };
    brandDna?: {
      name?: string;
      positioning?: string;
      tone?: string;
      uniqueValue?: string;
      targetAudience?: string;
      contentPillars?: string[];
    };
    summary?: string;
    pillarAnalysis?: Record<string, {
      score?: number;
      interpretation?: string;
      strategicOpportunity?: string;
      observed?: string[];
      notObserved?: string[];
    }>;
    suggested_strategists?: Array<{
      id: string;
      label: string;
      tagline?: string;
      reason?: string;
      fit_score?: number;
    }>;
  } | null;
  drive_config: {
    drive_folder_id: string;
    folder_structure: FolderStructure | null;
    text_contents: Record<string, string> | null;
    last_synced_at: string | null;
  } | null;
  selected_photos: {
    selected_file_ids: string[];
  } | null;
};

const TABS = ["Přehled", "Fotografie", "Texty & Brand", "Diagnostika"] as const;
type Tab = (typeof TABS)[number];

const FOLDER_ICONS: Record<string, string> = {
  brand: "🎨",
  fotografie: "📷",
  texty: "📄",
  sablony: "🗂",
  prispevky: "✍️",
  ostatni: "📁",
};

const PILLAR_LABELS: Record<string, string> = {
  value: "Hodnota",
  energy: "Energie",
  architecture: "Architektura",
  identity: "Identita",
  trust: "Důvěra",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 8) return C.accent;
  if (s >= 5) return C.orange;
  return C.red;
}

function formatTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

function totalFiles(fs: FolderStructure | null) {
  if (!fs) return 0;
  return Object.values(fs).reduce((s, a) => s + a.length, 0);
}

function photoFiles(fs: FolderStructure | null): DriveFile[] {
  if (!fs) return [];
  return fs["fotografie"] ?? [];
}

const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
function isImage(f: DriveFile) {
  return IMAGE_MIMES.includes(f.mimeType) || f.name.match(/\.(jpg|jpeg|png|webp)$/i) != null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub, icon }: { label: string; value: React.ReactNode; sub?: string; icon?: string }) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 8 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

// ─── Tab: Přehled ────────────────────────────────────────────────────────────

function TabPrehled({ project }: { project: Project }) {
  const fs = project.drive_config?.folder_structure ?? null;
  const folders = fs ? Object.keys(fs) : [];
  const score = project.scan_result?.brandScore?.total ?? 0;
  const photos = photoFiles(fs);
  const selectedCount = project.selected_photos?.selected_file_ids?.length ?? 0;

  return (
    <div style={{ padding: "24px 32px" }}>
      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <MetricCard
          label="Složky"
          icon="📁"
          value={folders.length}
          sub={folders.join(" · ") || "žádné"}
        />
        <MetricCard
          label="Fotografie"
          icon="📷"
          value={photos.length}
          sub={`${selectedCount} vybráno ke kampani`}
        />
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 8 }}>
            🎯 Brand Score
          </div>
          <ScoreRing score={score} />
        </Card>
        <MetricCard
          label="Příspěvky"
          icon="✍️"
          value={0}
          sub="žádné zatím"
        />
      </div>

      {/* Folder cards */}
      {fs && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {["brand", "fotografie", "texty", "sablony", "prispevky"].map((folder) => {
            const files = fs[folder] ?? [];
            return (
              <Card key={folder} style={{ padding: 16 }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{FOLDER_ICONS[folder] ?? "📁"}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{folder}</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{files.length} souborů</div>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: files.length > 0 ? C.green : C.muted,
                  background: files.length > 0 ? "#dcfce7" : "#f5f5f5",
                  padding: "2px 8px", borderRadius: 20,
                }}>
                  {files.length > 0 ? "✓ OK" : "Prázdná"}
                </span>
              </Card>
            );
          })}
        </div>
      )}

      {!fs && (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: 14, color: C.muted }}>Drive není synchronizován. Klikni ↻ Synchronizovat Drive.</div>
        </Card>
      )}
    </div>
  );
}

// ─── Tab: Fotografie ─────────────────────────────────────────────────────────

function TabFotografie({ project, onSelectionSaved }: { project: Project; onSelectionSaved: () => void }) {
  const fs = project.drive_config?.folder_structure ?? null;
  const allPhotos = fs ? Object.values(fs).flat().filter(isImage) : [];
  const [filter, setFilter] = useState("Vše");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(project.selected_photos?.selected_file_ids ?? [])
  );
  const [saving, setSaving] = useState(false);

  const subfolders = ["Vše", ...Array.from(new Set(allPhotos.map((f) => f.subfolder ?? "ostatni")))];
  const filtered = filter === "Vše" ? allPhotos : allPhotos.filter((f) => (f.subfolder ?? "ostatni") === filter);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const saveSelection = async () => {
    setSaving(true);
    await fetch("/api/admin/drive/save-selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientProjectId: project.id, selectedFileIds: Array.from(selected) }),
    });
    setSaving(false);
    onSelectionSaved();
  };

  if (allPhotos.length === 0) {
    return (
      <div style={{ padding: "40px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
        <div style={{ fontSize: 14, color: C.muted }}>Žádné fotografie nalezeny. Synchronizuj Drive.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px", paddingBottom: selected.size > 0 ? 100 : 24 }}>
      {/* Filters + counter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {subfolders.map((sf) => (
            <button
              key={sf}
              onClick={() => setFilter(sf)}
              style={{
                padding: "5px 14px", borderRadius: 20, border: `1px solid ${C.border}`,
                background: filter === sf ? C.accent : C.card,
                color: filter === sf ? "#111" : C.muted,
                fontSize: 12, fontWeight: filter === sf ? 700 : 400, cursor: "pointer",
              }}
            >{sf}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.muted }}>{selected.size} vybráno</span>
          {selected.size > 0 && (
            <button
              onClick={saveSelection}
              disabled={saving}
              style={{
                padding: "6px 16px", borderRadius: 8, border: "none",
                background: C.accent, color: "#111", fontSize: 12,
                fontWeight: 700, cursor: "pointer",
              }}
            >{saving ? "Ukládám…" : "Potvrdit výběr"}</button>
          )}
        </div>
      </div>

      {/* Masonry grid */}
      <div style={{ columns: 4, gap: 12 }}>
        {filtered.map((foto) => {
          const sel = selected.has(foto.id);
          return (
            <div
              key={foto.id}
              onClick={() => toggle(foto.id)}
              style={{
                position: "relative",
                marginBottom: 12,
                breakInside: "avoid",
                borderRadius: 10,
                overflow: "hidden",
                cursor: "pointer",
                outline: sel ? `2px solid ${C.accent}` : "none",
                outlineOffset: 2,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/admin/drive/image-proxy?fileId=${foto.id}`}
                alt={foto.name}
                loading="lazy"
                style={{ width: "100%", display: "block", borderRadius: 10 }}
              />
              {/* Checkbox */}
              <div style={{
                position: "absolute", top: 8, left: 8,
                width: 20, height: 20, borderRadius: 4,
                background: sel ? C.accent : "rgba(255,255,255,0.9)",
                border: `2px solid ${sel ? C.accent : "white"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {sel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/></svg>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky bottom bar */}
      {selected.size > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: C.card, borderTop: `1px solid ${C.border}`,
          padding: "16px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          zIndex: 50,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{selected.size} fotek vybráno</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setSelected(new Set())} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.muted, fontSize: 13, cursor: "pointer" }}>
              Zrušit výběr
            </button>
            <button onClick={saveSelection} disabled={saving} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#111", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Ukládám…" : "Uložit výběr"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Texty & Brand ──────────────────────────────────────────────────────

function TabTexty({ project }: { project: Project }) {
  const texts = project.drive_config?.text_contents ?? {};
  const dna = project.scan_result?.brandDna;

  return (
    <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "60% 40%", gap: 24 }}>
      {/* Left: text files */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {Object.keys(texts).length === 0 && (
          <Card style={{ padding: 40, textAlign: "center" }}>
            <div style={{ color: C.muted, fontSize: 14 }}>Žádné texty. Synchronizuj Drive složku /texty/</div>
          </Card>
        )}
        {Object.entries(texts).map(([name, content]) => {
          const lines = content.split("\n").filter(Boolean);
          const isSilneVety = name.toLowerCase().includes("silne") || name.toLowerCase().includes("věty");
          const isSluzby = name.toLowerCase().includes("sluzby") || name.toLowerCase().includes("služby");

          return (
            <Card key={name} style={{ overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted }}>
                  📄 {name}
                </div>
              </div>
              <div style={{ padding: "16px 18px" }}>
                {isSilneVety ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {lines.map((line, i) => (
                      <div key={i} style={{
                        borderLeft: `3px solid ${C.accent}`,
                        background: C.accentLight,
                        borderRadius: "0 8px 8px 0",
                        padding: "8px 16px",
                        fontStyle: "italic",
                        fontSize: 14,
                        color: C.text,
                        lineHeight: 1.5,
                      }}>{line}</div>
                    ))}
                  </div>
                ) : isSluzby ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {lines.map((line, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: C.text, lineHeight: 1.6 }}>
                        <span style={{ color: C.accent, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>●</span>
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                    {content}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Right: brand info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Barevná paleta */}
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 14 }}>🎨 Barevná paleta</div>
          <div style={{ display: "flex", gap: 12 }}>
            {["#4c0f0b", "#edb965", "#f3eed9"].map((hex) => (
              <div key={hex} style={{ textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: hex, margin: "0 auto 6px", border: `1px solid ${C.border}` }} />
                <div style={{ fontSize: 9, color: C.muted, fontFamily: "monospace" }}>{hex}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Typografie */}
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 12 }}>✏️ Typografie</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>Playfair Display</div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 12 }}>AaBbCc 123</div>
          <div style={{ fontSize: 14, color: C.text, marginBottom: 4 }}>DM Sans</div>
          <div style={{ fontSize: 12, color: C.muted }}>AaBbCc 123</div>
        </Card>

        {/* Brand hlas */}
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: 12 }}>🗣 Brand hlas</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(dna?.tone ? dna.tone.split(",").map((t) => t.trim()) : ["Autentický", "Přímý", "Inspirativní", "Odborný"]).map((tag) => (
              <span key={tag} style={{
                border: `1px solid ${C.border}`,
                borderRadius: 20, padding: "4px 12px",
                fontSize: 12, color: C.text,
              }}>{tag}</span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Diagnostika ────────────────────────────────────────────────────────

function TabDiagnostika({ project }: { project: Project }) {
  const scan = project.scan_result;
  const [openPillar, setOpenPillar] = useState<string | null>(null);
  const score = scan?.brandScore?.total ?? 0;
  const pillars = scan?.pillarAnalysis ?? {};
  const strategists = scan?.suggested_strategists ?? [];

  return (
    <div style={{ padding: "24px 32px" }}>
      {/* Top summary card */}
      <Card style={{ padding: 28, marginBottom: 24, display: "flex", alignItems: "center", gap: 32 }}>
        <ScoreRing score={score} />
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 8px" }}>
            {project.client_project_name ?? project.email}
          </h2>
          {scan?.brandDna?.positioning && (
            <span style={{ display: "inline-block", background: "#111", color: "#fff", borderRadius: 20, padding: "3px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              {scan.brandDna.positioning.slice(0, 40)}
            </span>
          )}
          {scan?.summary && <p style={{ fontSize: 14, color: C.muted, fontStyle: "italic", lineHeight: 1.6, margin: "8px 0 0", maxWidth: 500 }}>{scan.summary}</p>}
        </div>
      </Card>

      {/* Pillar cards */}
      {Object.keys(pillars).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
          {Object.entries(pillars).map(([key, pillar]) => {
            const s = pillar.score ?? 0;
            const col = scoreColor(s);
            const barH = Math.round((s / 10) * 60);
            return (
              <Card key={key} style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 8 }}>
                  {PILLAR_LABELS[key] ?? key}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: col, lineHeight: 1 }}>{s}</div>
                <div style={{ fontSize: 10, color: C.faint, marginBottom: 10 }}>/10</div>
                {/* Vertical progress bar */}
                <div style={{ width: 6, height: 60, background: "#e8e8e0", borderRadius: 3, margin: "0 auto" }}>
                  <div style={{
                    width: 6,
                    height: barH,
                    background: col,
                    borderRadius: 3,
                    marginTop: 60 - barH,
                    transition: "height 800ms ease-out",
                  }} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Accordion */}
      {Object.keys(pillars).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {Object.entries(pillars).map(([key, pillar]) => {
            const s = pillar.score ?? 0;
            const isOpen = openPillar === key;
            return (
              <Card key={key} style={{ overflow: "hidden" }}>
                <button
                  onClick={() => setOpenPillar(isOpen ? null : key)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{PILLAR_LABELS[key] ?? key}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: scoreColor(s),
                      background: scoreColor(s) + "22",
                      padding: "2px 8px", borderRadius: 20,
                    }}>{s}/10</span>
                  </div>
                  <span style={{ fontSize: 12, color: C.muted }}>{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12, paddingTop: 14 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>CO FUNGUJE</div>
                        {(pillar.observed ?? []).map((o, i) => (
                          <div key={i} style={{ display: "flex", gap: 6, fontSize: 13, color: C.text, marginBottom: 5, lineHeight: 1.5 }}>
                            <span style={{ color: C.accent, flexShrink: 0 }}>✓</span>{o}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>CO BRZDÍ RŮST</div>
                        {(pillar.notObserved ?? []).map((o, i) => (
                          <div key={i} style={{ display: "flex", gap: 6, fontSize: 13, color: C.text, marginBottom: 5, lineHeight: 1.5 }}>
                            <span style={{ color: C.red, flexShrink: 0 }}>○</span>{o}
                          </div>
                        ))}
                      </div>
                    </div>
                    {pillar.strategicOpportunity && (
                      <div style={{
                        borderLeft: `3px solid ${C.accent}`,
                        background: C.card,
                        padding: "12px 16px",
                        borderRadius: "0 8px 8px 0",
                        fontSize: 13,
                        color: C.text,
                        lineHeight: 1.6,
                      }}>
                        {pillar.strategicOpportunity}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Strategists */}
      {strategists.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {strategists.slice(0, 2).map((st) => (
            <Card key={st.id} style={{ padding: 24 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: C.accent, marginBottom: 4 }}>
                {st.fit_score ?? 0}%
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>{st.label}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>{st.reason ?? st.tagline}</div>
              <button style={{
                width: "100%", padding: "10px", borderRadius: 8,
                background: "#111", color: "#fff", border: "none",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
                Spustit strategii →
              </button>
            </Card>
          ))}
        </div>
      )}

      {!scan && (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, color: C.muted }}>Žádná diagnostika nenalezena pro tohoto klienta.</div>
        </Card>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Přehled");
  const [syncing, setSyncing] = useState(false);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/admin/workspace/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data.project);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleSync = async () => {
    if (!project?.drive_config?.drive_folder_id) return;
    setSyncing(true);
    await fetch("/api/admin/drive/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientProjectId: project.id,
        folderId: project.drive_config.drive_folder_id,
      }),
    });
    setSyncing(false);
    fetchProject();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: C.muted }}>Načítám workspace…</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: C.muted }}>Projekt nenalezen.</div>
      </div>
    );
  }

  const clientName = project.client_project_name ?? project.email ?? "Klient";
  const syncTime = formatTime(project.drive_config?.last_synced_at ?? null);

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: C.card, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center",
        padding: "0 32px", height: 56, gap: 24,
      }}>
        {/* Left */}
        <a href="/admin/dashboard" style={{ fontSize: 13, color: C.muted, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          ← <span style={{ fontWeight: 600, color: C.text }}>{clientName}</span>
        </a>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, background: "#f5f5f3", borderRadius: 10, padding: 3, flex: 1, maxWidth: 480 }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: "6px 0", borderRadius: 7, border: "none",
                background: activeTab === tab ? C.card : "transparent",
                color: activeTab === tab ? C.text : C.muted,
                fontSize: 12, fontWeight: activeTab === tab ? 700 : 400,
                cursor: "pointer",
                boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >{tab}</button>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: "auto" }}>
          {syncTime && (
            <span style={{ fontSize: 11, background: C.accentLight, color: C.green, padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>
              Synchronizováno {syncTime}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing || !project.drive_config}
            style={{
              padding: "7px 16px", borderRadius: 8, border: "none",
              background: "#111", color: "#fff",
              fontSize: 12, fontWeight: 700, cursor: syncing ? "wait" : "pointer",
            }}
          >
            {syncing ? "⟳ Sync…" : "↻ Synchronizovat Drive"}
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "Přehled" && <TabPrehled project={project} />}
      {activeTab === "Fotografie" && <TabFotografie project={project} onSelectionSaved={fetchProject} />}
      {activeTab === "Texty & Brand" && <TabTexty project={project} />}
      {activeTab === "Diagnostika" && <TabDiagnostika project={project} />}
    </div>
  );
}
