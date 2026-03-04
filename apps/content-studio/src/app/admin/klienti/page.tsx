"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { VISUAL_STYLE_PRESETS, CANONICAL_STYLE_IDS } from "@/lib/visual-style-presets";

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
  projectCode?: string;
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

/** Parsuje brand_colors string (napr. "#FF0000, #00FF00") na pole hex hodnôt. */
function parseBrandColors(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;|\s]+/)
    .map((s) => s.trim())
    .filter((s) => /^#[0-9A-Fa-f]{3,6}$/.test(s));
}

// ── StylePicker ───────────────────────────────────────────────
function StylePicker({
  projectId,
  initialStyle,
  onSaved,
}: {
  projectId: string;
  initialStyle: string | null;
  onSaved?: (style: string | null) => void;
}) {
  const [selected, setSelected] = useState<string | null>(initialStyle);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const isDirty = selected !== initialStyle;

  useEffect(() => {
    setSelected(initialStyle);
  }, [initialStyle]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/brief`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_style: selected }),
      });
      const data = await res.json();
      if (data.ok) {
        setSavedMsg(true);
        onSaved?.(data.preferred_style ?? null);
        setTimeout(() => setSavedMsg(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardLabel
        action={isDirty ? (saving ? "Ukládám…" : "Uložit") : undefined}
        onAction={isDirty ? handleSave : undefined}
        actionDisabled={saving}
      >
        Vizuální styl
      </CardLabel>
      <div className="grid grid-cols-2 gap-2">
        {CANONICAL_STYLE_IDS.map((id) => {
          const preset = VISUAL_STYLE_PRESETS[id];
          if (!preset) return null;
          const isActive = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(isActive ? null : id)}
              className={`rounded-lg p-2.5 text-left border transition-colors ${
                isActive
                  ? "border-[#A8EB12]/60 bg-[#A8EB12]/10"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <div
                className={`text-xs font-medium mb-0.5 ${
                  isActive ? "text-[#A8EB12]" : "text-[#C0C0C0]"
                }`}
              >
                {preset.label}
              </div>
              <div className="text-[11px] text-[#555] leading-tight line-clamp-2">
                {preset.description}
              </div>
            </button>
          );
        })}
      </div>
      {savedMsg && <p className="text-xs text-[#22C55E] mt-2">Uloženo.</p>}
    </Card>
  );
}

// ── BrandColorPicker ──────────────────────────────────────────
function BrandColorPicker({
  projectId,
  initialColors,
  onSaved,
}: {
  projectId: string;
  initialColors: string[];
  onSaved?: (colors: string[]) => void;
}) {
  const [colors, setColors] = useState<string[]>(initialColors);
  const [pendingColor, setPendingColor] = useState("#000000");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const isDirty = colors.join(",") !== initialColors.join(",");

  useEffect(() => {
    setColors(initialColors);
  }, [initialColors.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const addColor = () => {
    if (!colors.includes(pendingColor)) {
      setColors((prev) => [...prev, pendingColor]);
    }
  };

  const removeColor = (color: string) => {
    setColors((prev) => prev.filter((c) => c !== color));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/brief`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_colors: colors.join(", ") }),
      });
      const data = await res.json();
      if (data.ok) {
        setSavedMsg(true);
        onSaved?.(colors);
        setTimeout(() => setSavedMsg(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardLabel
        action={isDirty ? (saving ? "Ukládám…" : "Uložit") : undefined}
        onAction={isDirty ? handleSave : undefined}
        actionDisabled={saving}
      >
        Brand barvy
      </CardLabel>
      <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
        {colors.length === 0 && (
          <span className="text-[13px] text-[#444]">Žádné barvy</span>
        )}
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            title={`Odebrat ${color}`}
            onClick={() => removeColor(color)}
            className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center hover:border-red-400/60 transition-colors group relative"
            style={{ background: color }}
          >
            <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold drop-shadow-sm">
              ×
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={pendingColor}
          onChange={(e) => setPendingColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
          style={{ background: "transparent" }}
        />
        <span className="text-[12px] text-[#666] font-mono">{pendingColor}</span>
        <button
          type="button"
          onClick={addColor}
          className="ml-auto px-3 py-1 rounded-md border border-white/10 bg-white/5 text-xs text-[#C0C0C0] hover:bg-white/10 transition-colors"
        >
          + Přidat
        </button>
      </div>
      {savedMsg && <p className="text-xs text-[#22C55E] mt-2">Uloženo.</p>}
    </Card>
  );
}

// ── ServicesEditor ────────────────────────────────────────────
function ServicesEditor({ initialServices }: { initialServices: string[] }) {
  const [services, setServices] = useState<string[]>(initialServices);
  const allServices = Object.keys(SERVICE_COLORS);

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (name: string) => {
    setServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  return (
    <Card>
      <CardLabel>Služby</CardLabel>
      <div className="flex flex-wrap gap-2">
        {allServices.map((name) => {
          const c = SERVICE_COLORS[name]!;
          const isActive = services.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              title={isActive ? `Odebrat ${name}` : `Přidat ${name}`}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-opacity ${
                isActive ? "opacity-100" : "opacity-30 hover:opacity-60"
              }`}
              style={{ background: c.bg, color: c.text }}
            >
              {name}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function ProjectDetail({
  project,
  clientName,
  clientBrand,
  clientEmail,
  onNotesSaved,
  onArchive,
  onDelete,
}: {
  project: ProjectItem & { clientName: string; clientEmail: string; clientBrand: string };
  clientName: string;
  clientBrand: string;
  clientEmail: string;
  onNotesSaved?: () => void;
  onArchive?: () => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(project.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isArchived = project.status === "archivovano";

  const [briefData, setBriefData] = useState<{
    preferred_style: string | null;
    brand_colors: string[];
  } | null>(null);

  useEffect(() => {
    if (project.source !== "project" || !project.projectId) {
      setBriefData(null);
      return;
    }
    fetch(`/api/admin/projects/${project.projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.project?.brief) {
          setBriefData({
            preferred_style: d.project.brief.preferred_style ?? null,
            brand_colors: parseBrandColors(d.project.brief.brand_colors ?? null),
          });
        }
      })
      .catch(() => {});
  }, [project.projectId, project.source]);

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

      {/* Archivovat / Smazat / Zobrazit jako klient */}
      {(project.clientProjectId || project.projectId) && (
        <div className="mb-5 p-4 rounded-xl border border-white/[0.06] bg-white/[0.03]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-3">Akce</div>
          <div className="flex flex-wrap gap-2">
            {project.source === "project" && project.projectCode && (
              <a
                href={`/client/${project.projectCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-[#A8EB12]/40 bg-[#A8EB12]/10 text-sm text-[#A8EB12] hover:bg-[#A8EB12]/20 transition-colors"
              >
                👁 Zobrazit jako klient
              </a>
            )}
            {!isArchived && onArchive && (
              <button
                type="button"
                disabled={archiving}
                onClick={async () => {
                  setArchiving(true);
                  try {
                    await onArchive();
                  } finally {
                    setArchiving(false);
                  }
                }}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-sm text-[#C0C0C0] hover:bg-white/10 disabled:opacity-50"
              >
                {archiving ? "Archivuji…" : "Archivovat"}
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  if (!confirm("Opravdu smazat tento záznam? Tuto akci nelze vrátit.")) return;
                  setDeleting(true);
                  try {
                    await onDelete();
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="px-4 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? "Mažu…" : "Smazat"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid 2 sloupce */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <ServicesEditor initialServices={project.services} />

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

      {/* StylePicker + BrandColorPicker (len pre projekt source) */}
      {project.source === "project" && project.projectId && (
        <>
          <StylePicker
            projectId={project.projectId}
            initialStyle={briefData?.preferred_style ?? null}
            onSaved={(style) =>
              setBriefData((prev) =>
                prev ? { ...prev, preferred_style: style } : { preferred_style: style, brand_colors: [] }
              )
            }
          />
          <BrandColorPicker
            projectId={project.projectId}
            initialColors={briefData?.brand_colors ?? []}
            onSaved={(updated) =>
              setBriefData((prev) =>
                prev ? { ...prev, brand_colors: updated } : { preferred_style: null, brand_colors: updated }
              )
            }
          />
        </>
      )}

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
  const [cleaningStorage, setCleaningStorage] = useState(false);
  const [storageCleanResult, setStorageCleanResult] = useState<string | null>(null);

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/admin/klienti-dashboard", { cache: "no-store" })
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
              className="mb-2 w-full rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20"
            >
              Vyčistit vše (diagnostiky i projekty)
            </button>
          )}
          <button
            type="button"
            disabled={cleaningStorage}
            onClick={async () => {
              setCleaningStorage(true);
              setStorageCleanResult(null);
              try {
                const res = await fetch("/api/admin/cleanup-storage", { method: "POST" });
                const data = await res.json();
                if (data.ok) {
                  setStorageCleanResult(data.orphans?.length === 0
                    ? "Storage je čistý."
                    : `Vymazáno ${data.deleted} súborov z ${data.orphans?.length} priečinkov.`);
                } else {
                  setStorageCleanResult(`Chyba: ${data.error ?? "neznáma"}`);
                }
              } catch {
                setStorageCleanResult("Chyba pripojenia.");
              } finally {
                setCleaningStorage(false);
              }
            }}
            className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#888] hover:bg-white/10 disabled:opacity-50"
          >
            {cleaningStorage ? "Čistím storage…" : "Vyčistit orphan storage priečinky"}
          </button>
          {storageCleanResult && (
            <p className="mb-2 text-[11px] text-[#666]">{storageCleanResult}</p>
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
            onArchive={
              selectedProject.source === "client_project" && selectedProject.clientProjectId
                ? async () => {
                    const res = await fetch(`/api/admin/client-projects/${selectedProject.clientProjectId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ archive: true }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error ?? "Chyba");
                    fetchDashboard();
                  }
                : selectedProject.source === "project" && selectedProject.projectId
                  ? async () => {
                      const res = await fetch(`/api/admin/projects/${selectedProject.projectId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ archive: true }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data?.error ?? "Chyba");
                      fetchDashboard();
                    }
                  : undefined
            }
            onDelete={
              selectedProject.source === "client_project" && selectedProject.clientProjectId
                ? async () => {
                    const res = await fetch(`/api/admin/client-projects/${selectedProject.clientProjectId}`, {
                      method: "DELETE",
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error ?? "Chyba");
                    setSelectedProject(null);
                    setSelectedClientId(null);
                    fetchDashboard();
                  }
                : selectedProject.source === "project" && selectedProject.projectId
                  ? async () => {
                      const res = await fetch(`/api/admin/projects/${selectedProject.projectId}`, {
                        method: "DELETE",
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data?.error ?? "Chyba");
                      setSelectedProject(null);
                      setSelectedClientId(null);
                      fetchDashboard();
                    }
                  : undefined
            }
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
