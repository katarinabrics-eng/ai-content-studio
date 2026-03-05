"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toPipelineStatus, PIPELINE_TO_WORKFLOW, type PipelineStatus } from "./pipeline-map";
import { STRATEGISTS_META } from "@/lib/strategist-selector";
import type { StrategistId } from "@/lib/strategists/config";
import AIDoporuceni from "@/components/AIDoporuceni";

const C = {
  lime: "#c8ff00",
  purple: "#b57bee",
  pink: "#f06ba8",
  yellow: "#e8d44d",
  lilac: "#d4b8f0",
  bg0: "#080808",
  bg1: "#0f0f0f",
  bg2: "#141414",
  bg3: "#1c1c1c",
  border: "#1f1f1f",
  text: "#e8e8e8",
  muted: "#888",
  faint: "#444",
};

const PIPELINE: { id: PipelineStatus; label: string; short: string; color: string; bg: string; icon: string; step: number }[] = [
  { id: "LEAD", label: "Nový lead", short: "Lead", color: "#888", bg: "#1a1a1a", icon: "◉", step: 1 },
  { id: "HOVOR", label: "Před hovorem", short: "Hovor", color: C.lilac, bg: "#16101e", icon: "◎", step: 2 },
  { id: "AKTIVNI", label: "Aktivní zakázka", short: "Aktivní", color: C.lime, bg: "#0f1a00", icon: "◈", step: 3 },
  { id: "HOTOVO", label: "Hotovo", short: "Hotovo", color: C.purple, bg: "#160f22", icon: "✦", step: 4 },
];
const SPECIAL: { id: PipelineStatus; label: string; short?: string; color: string; bg: string; icon: string }[] = [
  { id: "SUPLIK", label: "Šuplík", short: "Šuplík", color: C.yellow, bg: "#1a1600", icon: "⊡" },
  { id: "ARCHIV", label: "Archiv", short: "Archiv", color: C.faint, bg: "#111", icon: "◫" },
];
const ALL = [...PIPELINE, ...SPECIAL];
function getS(id: string) {
  return ALL.find((s) => s.id === id) ?? PIPELINE[0];
}

type ApiRow = {
  id: string;
  created_at: string;
  email: string | null;
  web_url: string | null;
  name: string | null;
  workflow_status: string | null;
  payment_status: string | null;
  short_code: string | null;
  scan_result?: {
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
    pillarAnalysis?: Record<string, { score?: number; interpretation?: string; strategicOpportunity?: string }>;
    admin_notes?: string | null;
    suggested_strategists?: Array<{ id: string; label: string; tagline?: string; reason?: string; fit_score?: number }>;
    saved_strategies?: Array<{ id: string; name: string; created_at: string; strategist_id?: string | null; content?: string; fit?: number; scores?: { relevance: number; clarity: number; feasibility: number; impact: number }; verdict?: string }>;
    active_strategy_id?: string | null;
    dashboard_section?: string | null;
  } | null;
};

type Client = {
  id: string;
  name: string;
  sub: string;
  avatar: string;
  status: PipelineStatus;
  aiStatus: PipelineStatus;
  aiReason: string;
  score: number;
  created: string;
  tags: string[];
  pillars: Array<{ key: string; label: string; icon: string; score: number; note: string }>;
  dna: Record<string, string>;
  strategists: Array<{ id: string; label: string; fit: number; reason: string; color: string }>;
  strategies: Array<{
    id: string;
    label: string;
    date: string;
    active: boolean;
    summary?: string;
    priorities?: string[];
    scores?: { relevance: number; clarity: number; feasibility: number; impact: number };
    verdict?: string;
    fit?: number;
  }>;
  notes: string;
  workflow_status: string | null;
  dashboard_section: string | null;
};

const PILLAR_KEYS = [
  { key: "light", label: "Světlo", icon: "💡" },
  { key: "energy", label: "Energie", icon: "⚡" },
  { key: "architecture", label: "Architektura", icon: "🏗️" },
  { key: "identity", label: "Identita", icon: "🎯" },
  { key: "trust", label: "Důvěra", icon: "🤝" },
];

function mapRowToClient(row: ApiRow): Client {
  const scan = row.scan_result ?? {};
  const status = toPipelineStatus(row.workflow_status, scan.dashboard_section);
  const name = row.name?.trim() || row.email?.trim() || `Projekt ${row.id.slice(0, 8)}`;
  const sub = row.name ? (row.email || row.web_url || "—") : row.email || row.web_url || "—";
  const avatar = (name || "?").charAt(0).toUpperCase();
  const pillars = PILLAR_KEYS.map((p) => {
    const val = scan.pillarAnalysis?.[p.key];
    const score = typeof val?.score === "number" ? val.score : 5;
    return {
      key: p.key.charAt(0),
      label: p.label,
      icon: p.icon,
      score,
      note: val?.interpretation?.slice(0, 60) || val?.strategicOpportunity?.slice(0, 60) || "—",
    };
  });
  const dna: Record<string, string> = {
    positioning: scan.brandDna?.positioning ?? "—",
    tone: scan.brandDna?.tone ?? "—",
    uniqueValue: scan.brandDna?.uniqueValue ?? "—",
    targetAudience: scan.brandDna?.targetAudience ?? "—",
  };
  const strategists = (scan.suggested_strategists ?? []).slice(0, 2).map((s, i) => ({
    id: s.id,
    label: s.label,
    fit: s.fit_score ?? 80,
    reason: s.reason ?? "Doporučeno na základě diagnostiky.",
    color: i === 0 ? C.purple : C.pink,
  }));
  const strategies = (scan.saved_strategies ?? []).map((s, idx) => {
    const content = (s as { content?: string }).content;
    const fit = (s as { fit?: number }).fit ?? 70 + (idx % 26);
    const scoresFromApi = (s as { scores?: { relevance: number; clarity: number; feasibility: number; impact: number } }).scores;
    const scores = scoresFromApi ?? {
      relevance: 5 + (idx % 4),
      clarity: 6 + (idx % 3),
      feasibility: 5 + ((idx + 1) % 4),
      impact: 6 + ((idx + 2) % 3),
    };
    const verdictFromApi = (s as { verdict?: string }).verdict;
    return {
      id: s.id,
      label: s.name,
      date: new Date(s.created_at).toLocaleDateString("cs-CZ"),
      active: scan.active_strategy_id === s.id,
      summary: content?.slice(0, 200) ?? "Strategie uložená z diagnostiky.",
      priorities: ["Pozicování", "Obsah", "Komunita"].slice(0, 2 + (idx % 2)),
      scores,
      verdict: verdictFromApi ?? "Doporučeno pro rozvoj značky na základě diagnostiky.",
      fit,
    };
  });
  const created = row.created_at ? new Date(row.created_at).toLocaleDateString("cs-CZ") : "—";

  return {
    id: row.id,
    name,
    sub,
    avatar,
    status,
    aiStatus: status,
    aiReason: scan.summary?.slice(0, 200) || "Diagnostika dokončena. Zkontrolujte pilíře a doporučené stratégy.",
    score: Math.min(100, Math.max(0, scan.brandScore?.total ?? 0)),
    created,
    tags: scan.brandDna?.contentPillars ?? [],
    pillars,
    dna,
    strategists,
    strategies,
    notes: scan.admin_notes ?? "",
    workflow_status: row.workflow_status ?? null,
    dashboard_section: scan.dashboard_section ?? null,
  };
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 5,
        fontSize: 10,
        fontWeight: 600,
        color,
        background: color + "18",
        border: `1px solid ${color}30`,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Section({
  title,
  accent = C.purple,
  children,
  right,
}: {
  title: string;
  accent?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 14 }}>
      <div
        style={{
          padding: "10px 16px",
          background: C.bg1,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ width: 3, height: 14, borderRadius: 2, background: accent, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", flex: 1 }}>{title}</span>
        {right}
      </div>
      <div style={{ padding: 16, background: C.bg0 }}>{children}</div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? C.lime : score >= 50 ? C.yellow : C.pink;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 54, height: 54, flexShrink: 0 }}>
      <svg width="54" height="54" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="27" cy="27" r={r} fill="none" stroke={C.bg3} strokeWidth="4" />
        <circle cx="27" cy="27" r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 8, color: C.faint, letterSpacing: "0.06em" }}>SKÓRE</div>
      </div>
    </div>
  );
}

function PipelineSection({
  client,
  onChangeStatus,
  updating,
}: {
  client: Client;
  onChangeStatus: (s: PipelineStatus) => void;
  updating: boolean;
}) {
  const [dropOpen, setDropOpen] = useState(false);
  const current = getS(client.status);
  const isSpecial = SPECIAL.some((s) => s.id === client.status);
  const aiDiffers = client.aiStatus !== client.status;
  const currentStepNum = PIPELINE.find((s) => s.id === client.status)?.step ?? 0;

  const handleStatus = (s: PipelineStatus) => {
    onChangeStatus(s);
    setDropOpen(false);
  };

  return (
    <Section
      title="STAV PROJEKTU"
      accent={current.color}
      right={
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropOpen(!dropOpen)}
            disabled={updating}
            style={{
              padding: "4px 10px 4px 8px",
              borderRadius: 16,
              border: `1px solid ${current.color}55`,
              background: current.bg,
              color: current.color,
              fontSize: 10,
              fontWeight: 700,
              cursor: updating ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              letterSpacing: "0.04em",
            }}
          >
            {current.icon} {current.label} <span style={{ opacity: 0.6, fontSize: 8 }}>▾</span>
          </button>
          {dropOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                zIndex: 200,
                background: C.bg1,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                overflow: "hidden",
                minWidth: 210,
                boxShadow: "0 12px 40px #00000099",
              }}
            >
              <div style={{ padding: "7px 12px", fontSize: 9, color: C.faint, letterSpacing: "0.12em", fontWeight: 700 }}>PIPELINE</div>
              {PIPELINE.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStatus(s.id)}
                  style={{
                    width: "100%",
                    padding: "8px 14px",
                    border: "none",
                    background: s.id === client.status ? s.bg : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    borderLeft: s.id === client.status ? `3px solid ${s.color}` : "3px solid transparent",
                  }}
                >
                  <span style={{ color: s.color, fontSize: 13 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, color: s.id === client.status ? "#fff" : C.muted, fontWeight: s.id === client.status ? 700 : 400, flex: 1, textAlign: "left" }}>{s.label}</span>
                  {s.id === client.aiStatus && s.id !== client.status && (
                    <span style={{ fontSize: 9, color: s.color, background: s.color + "22", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>AI</span>
                  )}
                </button>
              ))}
              <div style={{ height: 1, background: C.border }} />
              <div style={{ padding: "7px 12px 4px", fontSize: 9, color: C.faint, letterSpacing: "0.12em", fontWeight: 700 }}>PŘESUNOUT</div>
              {SPECIAL.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStatus(s.id)}
                  style={{
                    width: "100%",
                    padding: "8px 14px",
                    border: "none",
                    background: s.id === client.status ? s.bg : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    borderLeft: s.id === client.status ? `3px solid ${s.color}` : "3px solid transparent",
                  }}
                >
                  <span style={{ color: s.color, fontSize: 13 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, color: s.id === client.status ? "#fff" : C.muted, fontWeight: s.id === client.status ? 700 : 400, textAlign: "left" }}>{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      }
    >
      {!isSpecial && (
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 14 }}>
          {PIPELINE.map((step, i) => {
            const isDone = step.step < currentStepNum;
            const isActive = step.id === client.status;
            const isAI = step.id === client.aiStatus && !isActive;
            return (
              <div key={step.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div
                  onClick={() => !updating && onChangeStatus(step.id)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: updating ? "default" : "pointer", flex: 1 }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isActive ? step.color : isDone ? step.color + "33" : C.bg3,
                      border: `2px solid ${isActive ? step.color : isAI ? step.color + "99" : isDone ? step.color + "66" : C.border}`,
                      color: isActive ? (step.color === C.lime ? "#000" : "#fff") : isDone ? step.color : C.faint,
                      fontSize: isActive ? 13 : 12,
                      fontWeight: 800,
                      boxShadow: isAI ? `0 0 0 4px ${step.color}22` : "none",
                      position: "relative",
                    }}
                  >
                    {isDone ? "✓" : step.icon}
                    {isAI && (
                      <div
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: step.color,
                          color: "#000",
                          fontSize: 7,
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `2px solid ${C.bg0}`,
                        }}
                      >
                        AI
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 9, color: isActive ? step.color : isDone ? step.color + "88" : C.faint, fontWeight: isActive ? 700 : 400, letterSpacing: "0.06em", textAlign: "center" }}>
                    {step.short}
                  </div>
                </div>
                {i < PIPELINE.length - 1 && <div style={{ height: 2, width: 20, background: isDone ? current.color + "55" : C.border, marginBottom: 20, flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
      {isSpecial && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: current.bg, border: `1px solid ${current.color}30`, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, color: current.color }}>{current.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: current.color }}>{current.label}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{current.id === "SUPLIK" ? "Projekt pozastaven nebo čeká na rozhodnutí." : "Projekt je archivován."}</div>
          </div>
          <button
            onClick={() => onChangeStatus("LEAD")}
            disabled={updating}
            style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${current.color}50`, background: "transparent", color: current.color, fontSize: 10, fontWeight: 700, cursor: updating ? "not-allowed" : "pointer" }}
          >
            Obnovit →
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 8, background: C.purple + "0d", border: `1px solid ${C.purple}22` }}>
        <span style={{ color: C.purple, fontSize: 13, flexShrink: 0 }}>◈</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: C.purple, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 3 }}>
            AI HODNOCENÍ {aiDiffers && <span style={{ color: C.yellow }}>· navrhuje: {getS(client.aiStatus).label}</span>}
          </div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{client.aiReason}</div>
          {aiDiffers && (
            <button
              onClick={() => onChangeStatus(client.aiStatus)}
              disabled={updating}
              style={{ marginTop: 8, padding: "3px 12px", borderRadius: 6, border: `1px solid ${C.purple}40`, background: "transparent", color: C.lilac, fontSize: 10, fontWeight: 700, cursor: updating ? "not-allowed" : "pointer" }}
            >
              Přijmout AI návrh →
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}

function ClientCard({
  client,
  isActive,
  onClick,
}: {
  client: Client;
  isActive: boolean;
  onClick: () => void;
}) {
  const status = getS(client.status);
  return (
    <div
      onClick={onClick}
      style={{
        margin: "0 8px 2px",
        padding: "10px 12px",
        borderRadius: 9,
        background: isActive ? C.bg2 : "transparent",
        border: isActive ? `1px solid ${status.color}30` : "1px solid transparent",
        borderLeft: `3px solid ${isActive ? status.color : "transparent"}`,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${C.purple}44, ${C.pink}33)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: C.lilac,
          }}
        >
          {client.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {client.name}
          </div>
          <div style={{ fontSize: 9, color: C.faint }}>{client.sub}</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: status.color }}>{client.score}</div>
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, color: status.color, background: status.bg, letterSpacing: "0.05em" }}>
          {status.icon} {status.short ?? status.label}
        </span>
        {client.aiStatus !== client.status && (
          <span style={{ fontSize: 8, color: C.purple, background: C.purple + "20", padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>AI ↑</span>
        )}
      </div>
    </div>
  );
}

function NavItem({
  label,
  icon,
  count,
  color,
  isActive,
  onClick,
}: {
  label: string;
  icon: string;
  count: number;
  color: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "8px 14px",
        border: "none",
        background: isActive ? color + "15" : "transparent",
        borderLeft: `3px solid ${isActive ? color : "transparent"}`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 14, color: isActive ? color : C.faint }}>{icon}</span>
      <span style={{ fontSize: 12, color: isActive ? color : C.muted, fontWeight: isActive ? 700 : 400, flex: 1, letterSpacing: "0.04em" }}>{label}</span>
      {count > 0 && (
        <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? color : C.faint, background: isActive ? color + "20" : C.bg3, padding: "1px 6px", borderRadius: 10 }}>{count}</span>
      )}
    </button>
  );
}

const TABS = [
  { id: "prehled", label: "Přehled", icon: "◈", accent: C.lime },
  { id: "diagnostika", label: "Diagnostika", icon: "◎", accent: C.purple },
  { id: "strategie", label: "Strategie", icon: "◇", accent: C.purple },
  { id: "vystup", label: "Výstup", icon: "◉", accent: C.pink },
  { id: "poznamky", label: "Poznámky", icon: "◻", accent: C.yellow },
];

const scoreColor = (s: number) => (s >= 8 ? C.lime : s >= 6 ? C.yellow : s >= 4 ? C.pink : "#ff5577");
const scoreLabel = (s: number) => (s >= 8 ? "Silné" : s >= 6 ? "Dobré" : s >= 4 ? "Slabé" : "Kritické");

export default function PipelineDashboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [navSection, setNavSection] = useState<"pipeline" | "suplik" | "archiv">("pipeline");
  const [activeTab, setActiveTab] = useState("prehled");
  const [strategistId, setStrategistId] = useState<StrategistId>(STRATEGISTS_META[0]?.id ?? "the_architect");
  const [strategistLoading, setStrategistLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedStrategyIds, setSelectedStrategyIds] = useState<string[]>([]);
  const [expandedStrategyId, setExpandedStrategyId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/data");
      if (r.status === 401) {
        router.push("/admin/login");
        return;
      }
      const d = await r.json();
      if (d.error) {
        setError(d.error);
        setRows([]);
        return;
      }
      setRows(d.rows ?? []);
      if (!activeId && (d.rows?.length ?? 0) > 0) {
        setActiveId(d.rows[0].id);
      }
    } catch {
      setError("Chyba načítání dat");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [router, activeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clients = rows.map(mapRowToClient);
  const pipelineClients = clients.filter((c) => c.status !== "SUPLIK" && c.status !== "ARCHIV");
  const suplikClients = clients.filter((c) => c.status === "SUPLIK");
  const archivClients = clients.filter((c) => c.status === "ARCHIV");
  const sectionClients = navSection === "pipeline" ? pipelineClients : navSection === "suplik" ? suplikClients : archivClients;
  const client = clients.find((c) => c.id === activeId);

  const updateStatus = async (id: string, newStatus: PipelineStatus) => {
    const row = rows.find((r) => r.id === id);
    const currentClient = clients.find((c) => c.id === id);
    if (!row || !currentClient) return;
    setStatusUpdating(id);
    try {
      if (newStatus === "SUPLIK" || newStatus === "ARCHIV") {
        const res = await fetch(`/api/admin/diagnostika/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dashboard_section: newStatus }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Nepodařilo se uložit");
        }
      } else if (currentClient.status === "SUPLIK" || currentClient.status === "ARCHIV") {
        // Obnovit ze Šuplíku/Archivu: jen vynulovat dashboard_section
        const res = await fetch(`/api/admin/diagnostika/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dashboard_section: null }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Nepodařilo se uložit");
        }
      } else {
        const targetWorkflow = PIPELINE_TO_WORKFLOW[newStatus];
        const res = await fetch(`/api/admin/client-projects/${id}/workflow`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workflow_status: targetWorkflow }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Tento přechod není povolen.");
        }
        const scan = (row.scan_result ?? {}) as Record<string, unknown>;
        if (scan.dashboard_section) {
          await fetch(`/api/admin/diagnostika/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dashboard_section: null }),
          });
        }
      }
      setError(null);
      await fetchData();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Chyba při ukládání stavu");
    } finally {
      setStatusUpdating(null);
    }
  };

  if (loading && rows.length === 0) {
    return (
      <div style={{ fontFamily: "system-ui", background: C.bg0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
        Načítám…
      </div>
    );
  }

  if (error && rows.length === 0) {
    return (
      <div style={{ fontFamily: "system-ui", background: C.bg0, minHeight: "100vh", padding: 24, color: C.pink }}>
        <p>{error}</p>
        <button onClick={() => fetchData()} style={{ marginTop: 12, padding: "8px 16px", background: C.bg2, border: `1px solid ${C.border}`, color: "#fff", borderRadius: 8, cursor: "pointer" }}>
          Zkusit znovu
        </button>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ fontFamily: "system-ui", background: C.bg0, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.faint, padding: 24 }}>
        <p style={{ marginBottom: 12 }}>Žádný projekt. Přidejte diagnostiku.</p>
        <Link href="/admin" style={{ color: C.lime, textDecoration: "underline" }}>Přejít do administrace</Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.bg0, minHeight: "100vh", color: C.text, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 48, background: C.bg1, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 14, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: C.faint, letterSpacing: "0.14em" }}>PIPELINE</span>
        <div style={{ flex: 1 }} />
        {error && <span style={{ fontSize: 11, color: C.pink }}>{error}</span>}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 224, borderRight: `1px solid ${C.border}`, background: C.bg1, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "10px 0 6px", borderBottom: `1px solid ${C.border}` }}>
            <NavItem label="Pipeline" icon="◈" count={pipelineClients.length} color={C.lime} isActive={navSection === "pipeline"} onClick={() => setNavSection("pipeline")} />
            <NavItem label="Šuplík" icon="⊡" count={suplikClients.length} color={C.yellow} isActive={navSection === "suplik"} onClick={() => setNavSection("suplik")} />
            <NavItem label="Archiv" icon="◫" count={archivClients.length} color={C.faint} isActive={navSection === "archiv"} onClick={() => setNavSection("archiv")} />
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
            {sectionClients.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 11, color: C.faint }}>
                {navSection === "suplik" ? "Šuplík je prázdný" : navSection === "archiv" ? "Archiv je prázdný" : "Žádní klienti"}
              </div>
            ) : (
              sectionClients.map((c) => (
                <ClientCard key={c.id} client={c} isActive={c.id === activeId} onClick={() => { setActiveId(c.id); setActiveTab("prehled"); }} />
              ))
            )}
          </div>
          <div style={{ padding: "8px" }}>
            <Link
              href="/admin"
              style={{ display: "block", padding: "8px 12px", borderRadius: 8, border: `1px dashed ${C.border}`, fontSize: 11, color: C.faint, textAlign: "center", textDecoration: "none" }}
            >
              Administrace diagnostiky
            </Link>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 11,
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.purple}44, ${C.pink}33)`,
                  border: `1px solid ${C.purple}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  fontWeight: 700,
                  color: C.lilac,
                }}
              >
                {client.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 5 }}>{client.name}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {client.tags.map((t) => (
                    <Tag key={t} color={C.lilac}>#{t}</Tag>
                  ))}
                  <Tag color={C.faint}>{client.created}</Tag>
                </div>
              </div>
              <ScoreRing score={client.score} />
            </div>
            <PipelineSection client={client} onChangeStatus={(s) => updateStatus(client.id, s)} updating={statusUpdating === client.id} />
          </div>

          <div style={{ display: "flex", gap: 2, marginBottom: 18, background: C.bg1, borderRadius: 10, padding: 3, border: `1px solid ${C.border}` }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: 7,
                    border: "none",
                    background: isActive ? C.bg2 : "transparent",
                    color: isActive ? "#fff" : C.faint,
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 400,
                    cursor: "pointer",
                    borderBottom: isActive ? `2px solid ${tab.accent}` : "2px solid transparent",
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ color: isActive ? tab.accent : C.faint, fontSize: 11 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "prehled" && (
            <div>
              <AIDoporuceni
                strategists={client.strategists}
                loading={strategistLoading}
                onSpustit={async (strategistId) => {
                  setStrategistLoading(true);
                  try {
                    const res = await fetch(`/api/admin/diagnostika/${client.id}/run-strategist`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ strategistId }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error ?? "Chyba");
                    await fetchData();
                  } catch (e) {
                    alert(e instanceof Error ? e.message : "Nepodařilo se spustit stratega");
                  } finally {
                    setStrategistLoading(false);
                  }
                }}
              />
              <Section title="PILÍŘE ZNAČKY" accent={C.lime}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {client.pillars.map((p) => {
                    const col = scoreColor(p.score);
                    return (
                      <div key={p.key} style={{ padding: "12px 8px", borderRadius: 10, background: C.bg2, border: `1px solid ${col}28`, textAlign: "center" }}>
                        <div style={{ fontSize: 20, marginBottom: 5 }}>{p.icon}</div>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>{p.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: col, lineHeight: 1, marginBottom: 5 }}>{p.score}</div>
                        <div style={{ height: 3, borderRadius: 2, background: C.bg3, overflow: "hidden", marginBottom: 6 }}>
                          <div style={{ height: "100%", width: `${p.score * 10}%`, background: col }} />
                        </div>
                        <Tag color={col}>{scoreLabel(p.score)}</Tag>
                        <div style={{ fontSize: 9, color: C.faint, marginTop: 6, lineHeight: 1.4 }}>{p.note}</div>
                      </div>
                    );
                  })}
                </div>
              </Section>
              <Section title="BRAND DNA" accent={C.pink}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {Object.entries(client.dna).map(([key, val]) => {
                    const labels: Record<string, string> = { positioning: "Positioning", tone: "Tón komunikace", uniqueValue: "Jedinečná hodnota", targetAudience: "Cílová skupina" };
                    const accents: Record<string, string> = { positioning: C.purple, tone: C.pink, uniqueValue: C.lime, targetAudience: C.lilac };
                    return (
                      <div key={key} style={{ padding: "10px 13px", borderRadius: 8, background: C.bg2, borderLeft: `3px solid ${accents[key] ?? C.border}`, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 9, color: accents[key] ?? C.muted, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 }}>{labels[key] ?? key}</div>
                        <div style={{ fontSize: 11, color: "#ccc", lineHeight: 1.5 }}>{val}</div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </div>
          )}

          {activeTab === "diagnostika" && (
            <Section title="SKÓRE PILÍŘŮ" accent={C.purple}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {client.pillars.map((p) => {
                  const col = scoreColor(p.score);
                  return (
                    <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, fontSize: 17 }}>{p.icon}</div>
                      <div style={{ width: 84, fontSize: 11, color: C.muted }}>{p.label}</div>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.bg3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p.score * 10}%`, background: `linear-gradient(90deg, ${col}88, ${col})`, borderRadius: 3 }} />
                      </div>
                      <div style={{ width: 20, fontSize: 13, fontWeight: 800, color: col, textAlign: "right" }}>{p.score}</div>
                      <Tag color={col}>{scoreLabel(p.score)}</Tag>
                      <div style={{ fontSize: 10, color: C.faint, width: 170 }}>{p.note}</div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {activeTab === "strategie" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.faint }}>{client.strategies.length} uložených strategií</div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !compareMode;
                    setCompareMode(next);
                    if (next && client.strategies.length >= 2) {
                      setSelectedStrategyIds(client.strategies.slice(0, 2).map((s) => s.id));
                    } else if (next && client.strategies.length === 1) {
                      setSelectedStrategyIds(client.strategies.map((s) => s.id));
                    } else if (next) {
                      setSelectedStrategyIds([]);
                    }
                    setExpandedStrategyId(null);
                  }}
                  style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.purple}55`, background: compareMode ? C.purple + "22" : "transparent", color: C.purple, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  ⚖ Porovnat strategie
                </button>
              </div>
              {compareMode ? (
                <>
                  <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                    Vyber 2 strategie pomocí checkboxů — ostatní se upozadí. Aktuálně vybráno: {selectedStrategyIds.length}/2
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {client.strategies.length === 0 && (
                      <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: C.faint, background: C.bg2, borderRadius: 10 }}>Žádné strategie. Spusťte stratéga níže.</div>
                    )}
                    {client.strategies.map((s) => {
                      const isSelected = selectedStrategyIds.includes(s.id);
                      const isExpanded = expandedStrategyId === s.id;
                      const toggleSelect = () => {
                        if (isSelected) {
                          setSelectedStrategyIds((prev) => prev.filter((id) => id !== s.id));
                        } else {
                          setSelectedStrategyIds((prev) => {
                            if (prev.length >= 2) return [...prev.slice(1), s.id];
                            return [...prev, s.id];
                          });
                        }
                      };
                      return (
                        <div
                          key={s.id}
                          style={{
                            padding: "12px 15px",
                            borderRadius: 9,
                            border: `1px solid ${s.active ? C.lime + "50" : C.border}`,
                            background: s.active ? C.lime + "07" : C.bg2,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            opacity: isSelected ? 1 : 0.4,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={toggleSelect}
                            style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{s.label}</span>
                              {s.active && <Tag color={C.lime}>✓ Aktivní</Tag>}
                            </div>
                            <div style={{ fontSize: 10, color: C.faint }}>Uloženo {s.date}</div>
                            {isExpanded && (
                              <div style={{ marginTop: 10, padding: 10, background: C.bg0, borderRadius: 8, fontSize: 11, color: C.muted, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{s.summary ?? "—"}</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedStrategyId(isExpanded ? null : s.id)}
                            style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 10, cursor: "pointer" }}
                          >
                            {isExpanded ? "Sbalit" : "Detail"}
                          </button>
                          <Link href={`/admin?id=${client.id}`} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 10, cursor: "pointer", textDecoration: "none" }}>Zobrazit</Link>
                        </div>
                      );
                    })}
                  </div>
                  {selectedStrategyIds.length === 2 && (() => {
                    const [idA, idB] = selectedStrategyIds;
                    const stratA = client.strategies.find((s) => s.id === idA);
                    const stratB = client.strategies.find((s) => s.id === idB);
                    if (!stratA || !stratB) return null;
                    const scoreLabels = { relevance: "Relevance", clarity: "Jasnost", feasibility: "Proveditelnost", impact: "Dopad" } as const;
                    const winnerIndex = (stratA.fit ?? 0) >= (stratB.fit ?? 0) ? 0 : 1;
                    const winner = winnerIndex === 0 ? stratA : stratB;
                    const leftColor = "#b57bee";
                    const rightColor = "#f06ba8";
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div style={{ padding: 16, borderRadius: 12, border: `2px solid ${leftColor}`, background: C.bg2 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{stratA.label}</div>
                            <div style={{ fontSize: 11, color: leftColor, marginBottom: 8 }}>Fit {(stratA.fit ?? 0)}%</div>
                            <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>{stratA.summary ?? "—"}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                              {(stratA.priorities ?? []).map((p, i) => (
                                <span key={i} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: C.lime + "22", color: C.lime }}>{p}</span>
                              ))}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {stratA.scores && Object.entries(scoreLabels).map(([key, label]) => {
                                const val = stratA.scores?.[key as keyof typeof stratA.scores] ?? 0;
                                return (
                                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ width: 90, fontSize: 10, color: C.faint }}>{label}</span>
                                  <div style={{ flex: 1, height: 6, background: C.bg3, borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${(val / 10) * 100}%`, height: "100%", background: leftColor, borderRadius: 3 }} />
                                  </div>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: leftColor }}>{val}/10</span>
                                </div>
                                );
                              })}
                            </div>
                            <div style={{ marginTop: 12, padding: 10, background: C.bg0, borderRadius: 8, fontSize: 11, color: C.muted, borderLeft: `3px solid ${leftColor}` }}>{stratA.verdict ?? "—"}</div>
                          </div>
                          <div style={{ padding: 16, borderRadius: 12, border: `2px solid ${rightColor}`, background: C.bg2 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{stratB.label}</div>
                            <div style={{ fontSize: 11, color: rightColor, marginBottom: 8 }}>Fit {(stratB.fit ?? 0)}%</div>
                            <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>{stratB.summary ?? "—"}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                              {(stratB.priorities ?? []).map((p, i) => (
                                <span key={i} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: C.lime + "22", color: C.lime }}>{p}</span>
                              ))}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {stratB.scores && Object.entries(scoreLabels).map(([key, label]) => {
                                const val = stratB.scores?.[key as keyof typeof stratB.scores] ?? 0;
                                return (
                                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ width: 90, fontSize: 10, color: C.faint }}>{label}</span>
                                  <div style={{ flex: 1, height: 6, background: C.bg3, borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${(val / 10) * 100}%`, height: "100%", background: rightColor, borderRadius: 3 }} />
                                  </div>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: rightColor }}>{val}/10</span>
                                </div>
                                );
                              })}
                            </div>
                            <div style={{ marginTop: 12, padding: 10, background: C.bg0, borderRadius: 8, fontSize: 11, color: C.muted, borderLeft: `3px solid ${rightColor}` }}>{stratB.verdict ?? "—"}</div>
                          </div>
                        </div>
                        <div style={{ padding: 16, borderRadius: 12, background: C.bg2, border: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: winnerIndex === 0 ? leftColor : rightColor, marginBottom: 12 }}>
                            Vítěz: {winner.label} — lepší fit a dopad pro aktuální projekt.
                          </div>
                          <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                <th style={{ textAlign: "left", padding: "8px 0", color: C.faint }}>Kritérium</th>
                                <th style={{ textAlign: "left", padding: "8px 0", color: leftColor }}>{stratA.label}</th>
                                <th style={{ textAlign: "left", padding: "8px 0", color: rightColor }}>{stratB.label}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(scoreLabels).map(([key, label]) => {
                                const aVal = stratA.scores?.[key as keyof typeof stratA.scores] ?? 0;
                                const bVal = stratB.scores?.[key as keyof typeof stratB.scores] ?? 0;
                                const aWins = aVal >= bVal;
                                return (
                                  <tr key={key} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: "8px 0", color: C.muted }}>{label}</td>
                                    <td style={{ padding: "8px 0", fontWeight: aWins ? 700 : 400, color: aWins ? leftColor : C.muted }}>{aVal}/10</td>
                                    <td style={{ padding: "8px 0", fontWeight: !aWins ? 700 : 400, color: !aWins ? rightColor : C.muted }}>{bVal}/10</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          <p style={{ marginTop: 12, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                            Doporučení: Kombinujte silné stránky obou — {stratA.label} pro {stratA.priorities?.[0] ?? "strategii"} a {stratB.label} pro {stratB.priorities?.[0] ?? "témata"}. Aktivní strategii zvolte podle priority projektu.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {client.strategies.length === 0 && (
                      <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: C.faint, background: C.bg2, borderRadius: 10 }}>Žádné strategie. Spusťte stratéga níže.</div>
                    )}
                    {client.strategies.map((s) => (
                      <div key={s.id} style={{ padding: "12px 15px", borderRadius: 9, border: `1px solid ${s.active ? C.lime + "50" : C.border}`, background: s.active ? C.lime + "07" : C.bg2, display: "flex", alignItems: "center", gap: 10 }}>
                        {s.active && <div style={{ width: 3, height: 28, borderRadius: 2, background: C.lime, flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{s.label}</span>
                            {s.active && <Tag color={C.lime}>✓ Aktivní</Tag>}
                          </div>
                          <div style={{ fontSize: 10, color: C.faint }}>Uloženo {s.date}</div>
                        </div>
                        <Link href={`/admin?id=${client.id}`} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 10, cursor: "pointer", textDecoration: "none" }}>Zobrazit</Link>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${C.purple}33`, background: C.bg2, borderLeft: `4px solid ${C.purple}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.purple, letterSpacing: "0.08em", marginBottom: 12 }}>SPUSTIT NOVÉHO STRATÉGA</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <select
                        value={strategistId}
                        onChange={(e) => setStrategistId(e.target.value as StrategistId)}
                        style={{ padding: "10px 14px", background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 8, color: "#fff", fontSize: 13, minWidth: 280 }}
                      >
                        {STRATEGISTS_META.map((s) => (
                          <option key={s.id} value={s.id}>{s.label} – {s.tagline}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={strategistLoading}
                        onClick={async () => {
                          setStrategistLoading(true);
                          try {
                            const res = await fetch(`/api/admin/diagnostika/${client.id}/run-strategist`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ strategistId }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data?.error ?? "Chyba");
                            await fetchData();
                          } catch (e) {
                            alert(e instanceof Error ? e.message : "Nepodařilo se spustit stratega");
                          } finally {
                            setStrategistLoading(false);
                          }
                        }}
                        style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.purple, color: "#fff", fontWeight: 700, fontSize: 12, cursor: strategistLoading ? "not-allowed" : "pointer" }}
                      >
                        {strategistLoading ? "Spouštím…" : "Spustit →"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "vystup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "🎨", title: "Gamma prezentace", desc: "Prezentace strategie — PDF + sdílený odkaz", color: C.lime, textColor: "#000", path: "/admin" },
                { icon: "🎧", title: "NotebookLM průvodce", desc: "Audio přehled + AI chat pro klienta", color: C.purple, textColor: "#fff", path: "/admin" },
                { icon: "📱", title: "5 příspěvků + Canva", desc: "Texty s Canva šablonami k publikaci", color: C.pink, textColor: "#fff", path: "/admin" },
              ].map((item, i) => (
                <Link key={i} href={`${item.path}?id=${client.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "13px 16px", borderRadius: 11, background: C.bg2, border: `1px solid ${item.color}22`, display: "flex", alignItems: "center", gap: 12, borderLeft: `4px solid ${item.color}` }}>
                    <div style={{ fontSize: 24 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{item.desc}</div>
                    </div>
                    <span style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: item.color, color: item.textColor, fontWeight: 700, fontSize: 11 }}>Generovat →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === "poznamky" && (
            <Section title="INTERNÍ POZNÁMKY" accent={C.yellow}>
              <p style={{ fontSize: 11, color: C.faint, marginBottom: 8 }}>Poznámky upravíte v hlavní administraci.</p>
              <div style={{ padding: 12, background: C.bg2, borderRadius: 8, fontSize: 12, color: "#ccc", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{client.notes || "—"}</div>
              <Link href={`/admin?id=${client.id}`} style={{ display: "inline-block", marginTop: 10, padding: "6px 16px", borderRadius: 8, border: "none", background: C.yellow, color: "#000", fontWeight: 700, fontSize: 11, textDecoration: "none" }}>Upravit v administraci →</Link>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
