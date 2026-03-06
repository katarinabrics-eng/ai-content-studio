"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  /** Z DB po migraci 20260308100000; jinak lze z scan_result. */
  client_name?: string | null;
  project_name?: string | null;
  workflow_status: string | null;
  payment_status: string | null;
  short_code: string | null;
  access_expires_at: string | null;
  access_type: string | null;
  last_contact_at: string | null;
  outputs_activated?: boolean;
  outputs_activated_at?: string | null;
  access_sent_at?: string | null;
  brief_submitted_at?: string | null;
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
    pillarAnalysis?: Record<string, { score?: number; interpretation?: string; strategicOpportunity?: string; observed?: string[]; notObserved?: string[]; reasoning?: string }>;
    admin_notes?: string | null;
    notes_ai_enabled?: boolean;
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
  /** Krátký popis projektu / čemu se firma věnuje (z Brand DNA). */
  projectDescription: string;
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
    strategist_id?: string | null;
    content?: string;
  }>;
  notes: string;
  notesAiEnabled: boolean;
  /** ID aktivní strategie (z scan_result.active_strategy_id). */
  active_strategy_id: string | null;
  workflow_status: string | null;
  dashboard_section: string | null;
  access_expires_at: string | null;
  access_type: string | null;
  last_contact_at: string | null;
  created_at: string;
  projectName: string;
  clientName: string;
  /** Email (pro skupování v sidebaru). */
  email: string;
  /** Web URL projektu. */
  web_url: string;
  /** Hlavní nadpis klienta: client_name → email. */
  clientDisplayName: string;
  /** Název projektu pod klientem a v hlavičce detailu: project_name → name → web_url. */
  projectDisplayName: string;
  /** Iniciála pro avatar na úrovni klienta (clientDisplayName nebo email). */
  clientAvatar: string;
  outputsActivated: boolean;
  outputsActivatedAt: string | null;
  accessSentAt: string | null;
  briefSubmittedAt: string | null;
  /** Krátký kód pro odkaz na client/[short_code]/brief. */
  short_code: string | null;
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
  const clientDisplayName = (row.client_name ?? (scan as { client_name?: string }).client_name ?? row.email ?? "—").toString().trim() || "—";
  const projectDisplayName = (row.project_name ?? (scan as { project_name?: string }).project_name ?? row.name ?? row.web_url ?? "—").toString().trim() || "—";
  const name = row.name?.trim() || row.email?.trim() || `Projekt ${row.id.slice(0, 8)}`;
  const sub = row.name ? (row.email || row.web_url || "—") : row.email || row.web_url || "—";
  const avatar = (name || "?").charAt(0).toUpperCase();
  const clientAvatar = (clientDisplayName !== "—" ? clientDisplayName : row.email ?? "?").charAt(0).toUpperCase();
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
      strategist_id: (s as { strategist_id?: string }).strategist_id ?? null,
      content: content ?? undefined,
    };
  });
  const created = row.created_at ? new Date(row.created_at).toLocaleDateString("cs-CZ") : "—";

  const d = scan.brandDna;
  const projectDescriptionParts: string[] = [];
  if (d?.name?.trim()) projectDescriptionParts.push(d.name.trim());
  if (d?.positioning?.trim()) projectDescriptionParts.push(d.positioning.trim());
  if (d?.targetAudience?.trim()) projectDescriptionParts.push(`Cílová skupina: ${d.targetAudience.trim()}`);
  if (d?.uniqueValue?.trim()) projectDescriptionParts.push(d.uniqueValue.trim());
  const projectDescription = projectDescriptionParts.length > 0
    ? projectDescriptionParts.join(". ")
    : (scan.summary?.slice(0, 200) || "Diagnostika dokončena. Zkontrolujte pilíře a doporučené stratégy.");

  return {
    id: row.id,
    name,
    sub,
    avatar,
    status,
    aiStatus: status,
    aiReason: scan.summary?.slice(0, 200) || "Diagnostika dokončena. Zkontrolujte pilíře a doporučené stratégy.",
    projectDescription,
    score: Math.min(100, Math.max(0, scan.brandScore?.total ?? 0)),
    created,
    tags: scan.brandDna?.contentPillars ?? [],
    pillars,
    dna,
    strategists,
    strategies,
    notes: scan.admin_notes ?? "",
    notesAiEnabled: (scan as { notes_ai_enabled?: boolean }).notes_ai_enabled ?? false,
    active_strategy_id: (scan.active_strategy_id as string) ?? null,
    workflow_status: row.workflow_status ?? null,
    dashboard_section: scan.dashboard_section ?? null,
    access_expires_at: row.access_expires_at ?? null,
    access_type: (row.access_type as "FREE" | "PAID" | "ACTIVE") ?? "FREE",
    last_contact_at: row.last_contact_at ?? null,
    created_at: row.created_at ?? "",
    projectName: (row.project_name ?? row.name)?.trim() ?? "",
    clientName: (row.client_name ?? (scan as { client_name?: string }).client_name)?.trim() ?? "",
    email: row.email ?? "",
    web_url: row.web_url ?? "",
    clientDisplayName,
    projectDisplayName,
    clientAvatar,
    outputsActivated: row.outputs_activated ?? false,
    outputsActivatedAt: row.outputs_activated_at ?? null,
    accessSentAt: row.access_sent_at ?? null,
    briefSubmittedAt: row.brief_submitted_at ?? null,
    short_code: row.short_code ?? null,
  };
}

const CONTENT_VOICE_SECTION_TITLES = [
  "CESTA ZÁKAZNÍKA",
  "SRDCE ZNAČKY",
  "KLÍČOVÉ BENEFITY",
  "VIDEO BRIEF / SCRIPT",
  "BIO VARIANTY",
  "CLAIMS A TAGLINY",
];

function parseContentVoiceSections(content: string): Array<{ title: string; body: string }> {
  const sections: Array<{ title: string; body: string }> = [];
  const normalized = content.replace(/\r\n/g, "\n");
  for (let i = 0; i < CONTENT_VOICE_SECTION_TITLES.length; i++) {
    const title = CONTENT_VOICE_SECTION_TITLES[i]!;
    const nextTitle = CONTENT_VOICE_SECTION_TITLES[i + 1];
    const num = i + 1;
    const headingRe = new RegExp(`(?:^|\\n)${num}\\.\\s*${title.replace(/[/\\]/g, "\\\\")}[^\\S\\n]*(\\n|$)`, "im");
    const altRe = new RegExp(`(?:^|\\n)${title.replace(/[/\\]/g, "\\\\")}[^\\S\\n]*(\\n|$)`, "im");
    const match = normalized.match(headingRe) ?? normalized.match(altRe);
    if (!match || match.index === undefined) continue;
    const start = match.index + match[0].length;
    const afterStart = normalized.slice(start);
    const nextNum = num + 1;
    const nextHeadingRe = nextTitle
      ? new RegExp(`(?:^|\\n)${nextNum}\\.\\s*${nextTitle.replace(/[/\\]/g, "\\\\")}`, "im")
      : null;
    const nextMatch = nextHeadingRe ? afterStart.match(nextHeadingRe) : null;
    const end = nextMatch?.index !== undefined ? nextMatch.index : afterStart.length;
    const body = afterStart.slice(0, end).trim();
    if (body) sections.push({ title, body });
  }
  if (sections.length === 0 && content.trim()) {
    sections.push({ title: "Výstup", body: content.trim() });
  }
  return sections;
}

function CopyButton({ text, style }: { text: string; style?: React.CSSProperties }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        border: "1px solid #444",
        background: "transparent",
        color: "#444",
        fontSize: 10,
        cursor: "pointer",
        ...style,
      }}
    >
      {copied ? "✓ Zkopírováno" : "Kopírovat"}
    </button>
  );
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

function ScoreRing({ score, size = "default" }: { score: number; size?: "default" | "small" }) {
  const color = score >= 70 ? C.lime : score >= 50 ? C.yellow : C.pink;
  const isSmall = size === "small";
  const r = isSmall ? 12 : 20;
  const wh = isSmall ? 32 : 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: wh, height: wh, flexShrink: 0 }}>
      <svg width={wh} height={wh} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={wh / 2} cy={wh / 2} r={r} fill="none" stroke={C.bg3} strokeWidth={isSmall ? 2.5 : 4} />
        <circle cx={wh / 2} cy={wh / 2} r={r} fill="none" stroke={color} strokeWidth={isSmall ? 2.5 : 4} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: isSmall ? 10 : 13, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
        {!isSmall && <div style={{ fontSize: 8, color: C.faint, letterSpacing: "0.06em" }}>SKÓRE</div>}
      </div>
    </div>
  );
}

function CompactClientHeader({ client, onExpand }: { client: Client; onExpand: () => void }) {
  const current = getS(client.status);
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#0d0d0d",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${C.purple}44, ${C.pink}33)`,
            border: `1px solid ${C.purple}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: C.lilac,
          }}
        >
          {client.avatar}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{client.projectDisplayName || client.name}</span>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 10,
            border: `1px solid ${current.color}55`,
            background: current.bg,
            color: current.color,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {current.icon} {current.label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ScoreRing score={client.score} size="small" />
        <button
          type="button"
          onClick={onExpand}
          style={{ fontSize: 12, color: "#555", background: "transparent", border: "none", cursor: "pointer", padding: "4px 8px" }}
        >
          ↑ Rozbalit
        </button>
      </div>
    </div>
  );
}

function SendAccessBlock({ client, onSent }: { client: Client; onSent: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(t);
  }, [success]);
  return (
    <div style={{ marginTop: 8 }}>
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setErr(null);
          setLoading(true);
          try {
            const res = await fetch(`/api/admin/projects/${client.id}/send-access`, { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setErr(data.error ?? "Chyba odeslání");
              return;
            }
            setSuccess(`✓ Odkaz odeslán na ${data.email ?? client.email}`);
            onSent();
          } finally {
            setLoading(false);
          }
        }}
        style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #1f1f1f", background: "transparent", color: "#888", fontSize: 11, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Odesílám…" : "✉ Poslat přístup klientovi"}
      </button>
      {client.accessSentAt && (
        <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Naposledy odesláno: {new Date(client.accessSentAt).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" })}</div>
      )}
      {success && <div style={{ fontSize: 11, color: C.lime, marginTop: 4 }}>{success}</div>}
      {err && <div style={{ fontSize: 11, color: "#e88", marginTop: 4 }}>{err}</div>}
    </div>
  );
}

function PipelineOutputsBlock({
  client,
  onRefresh,
  updating,
}: {
  client: Client;
  onRefresh: () => void;
  updating: boolean;
}) {
  const [loading, setLoading] = useState(false);
  if (client.outputsActivated) {
    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "#c8ff00", marginBottom: 4 }}>
          ✓ Výstupy aktivovány {client.outputsActivatedAt ? new Date(client.outputsActivatedAt).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" }) : ""}
        </div>
        <button
          type="button"
          onClick={async () => {
            if (loading) return;
            setLoading(true);
            try {
              const res = await fetch(`/api/admin/diagnostika/${client.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ outputs_activated: false }),
              });
              if (res.ok) onRefresh();
            } finally {
              setLoading(false);
            }
          }}
          style={{ fontSize: 10, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
        >
          Deaktivovat
        </button>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        disabled={updating || loading}
        onClick={async () => {
          setLoading(true);
          try {
            const res = await fetch(`/api/admin/diagnostika/${client.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ outputs_activated: true, outputs_activated_at: new Date().toISOString() }),
            });
            if (res.ok) onRefresh();
          } finally {
            setLoading(false);
          }
        }}
        style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#c8ff00", color: "#000", fontWeight: 700, fontSize: 12, cursor: updating || loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Aktivuji…" : "⚡ Aktivovat výstupy pro klienta"}
      </button>
    </div>
  );
}

function PipelineSection({
  client,
  onChangeStatus,
  onRefresh,
  updating,
}: {
  client: Client;
  onChangeStatus: (s: PipelineStatus) => void;
  onRefresh?: () => void;
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
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{client.projectDescription}</div>
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

      {(client.status === "HOVOR" || client.status === "AKTIVNI") && (
        <PipelineOutputsBlock
          client={client}
          onRefresh={() => onRefresh?.()}
          updating={updating}
        />
      )}
    </Section>
  );
}

const ACTIVITY_DOT_COLORS = { urgent: "#ff4444", message: "#c8ff00", activity: "#e8d44d" } as const;

function ClientCard({
  client,
  isActive,
  onClick,
  onTrash,
  onUpdateStatus,
  onQuickNote,
  onRunStrategist,
  quickActionsLoading,
  displayTitle,
  style: cardStyle,
}: {
  client: Client;
  isActive: boolean;
  onClick: () => void;
  onTrash?: (e: React.MouseEvent) => void;
  onUpdateStatus?: (id: string, status: PipelineStatus) => void;
  onQuickNote?: (id: string, notes: string) => void;
  onRunStrategist?: (id: string, strategistId: string) => void;
  quickActionsLoading?: boolean;
  displayTitle?: string;
  style?: React.CSSProperties;
}) {
  const status = getS(client.status);
  const [hover, setHover] = useState(false);
  const [openQuick, setOpenQuick] = useState<"status" | "note" | "strategist" | null>(null);
  const [noteDraft, setNoteDraft] = useState(client.notes);
  const showQuickActions = hover && (onUpdateStatus || onQuickNote || onRunStrategist);
  const title = displayTitle ?? client.name;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        marginLeft: 20,
        marginRight: 8,
        marginBottom: 2,
        padding: "6px 12px 6px 8px",
        borderRadius: 6,
        borderLeft: `1px solid ${isActive ? "rgba(200,255,0,0.4)" : "#1a1a1a"}`,
        background: isActive ? "#0f0f0f" : "transparent",
        cursor: "pointer",
        position: "relative",
        ...(hover && !isActive ? { background: "#0d0d0d", color: "#bbb" } : {}),
        ...cardStyle,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            background: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
            color: C.lilac,
            flexShrink: 0,
          }}
        >
          {client.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: isActive ? "#ccc" : "#777", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {showQuickActions && (
            <>
              {onUpdateStatus && (
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    aria-label="Změnit stav"
                    onClick={(e) => { e.stopPropagation(); setOpenQuick(openQuick === "status" ? null : "status"); }}
                    style={{ padding: 2, border: "none", background: "transparent", cursor: "pointer", color: hover ? C.lime : "#444", fontSize: 14 }}
                  >
                    ⟳
                  </button>
                  {openQuick === "status" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: 2,
                        zIndex: 100,
                        minWidth: 140,
                        background: C.bg1,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: 4,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[...PIPELINE, ...SPECIAL].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { onUpdateStatus(client.id, s.id); setOpenQuick(null); }}
                          style={{ display: "block", width: "100%", padding: "6px 10px", border: "none", background: "transparent", color: C.text, fontSize: 11, textAlign: "left", cursor: "pointer", borderRadius: 4 }}
                        >
                          {s.icon} {s.short ?? s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {onQuickNote && (
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    aria-label="Poznámka"
                    onClick={(e) => { e.stopPropagation(); setNoteDraft(client.notes); setOpenQuick(openQuick === "note" ? null : "note"); }}
                    style={{ padding: 2, border: "none", background: "transparent", cursor: "pointer", color: hover ? C.yellow : "#444", fontSize: 14 }}
                  >
                    ✎
                  </button>
                  {openQuick === "note" && (
                    <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 2, zIndex: 100, width: 200, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }} onClick={(e) => e.stopPropagation()}>
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        onBlur={() => { onQuickNote(client.id, noteDraft); setOpenQuick(null); }}
                        placeholder="Poznámka…"
                        rows={3}
                        style={{ width: "100%", resize: "vertical", background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 11, padding: 6, boxSizing: "border-box" }}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              )}
              {onRunStrategist && (
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    aria-label="Spustit stratéga"
                    onClick={(e) => { e.stopPropagation(); setOpenQuick(openQuick === "strategist" ? null : "strategist"); }}
                    disabled={quickActionsLoading}
                    style={{ padding: 2, border: "none", background: "transparent", cursor: quickActionsLoading ? "not-allowed" : "pointer", color: hover ? C.purple : "#444", fontSize: 14 }}
                  >
                    ◈
                  </button>
                  {openQuick === "strategist" && (
                    <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 2, zIndex: 100, minWidth: 180, maxHeight: 200, overflow: "auto", background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 8, padding: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }} onClick={(e) => e.stopPropagation()}>
                      {STRATEGISTS_META.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { onRunStrategist(client.id, s.id); setOpenQuick(null); }}
                          style={{ display: "block", width: "100%", padding: "6px 10px", border: "none", background: "transparent", color: C.text, fontSize: 11, textAlign: "left", cursor: "pointer", borderRadius: 4 }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <span style={{ fontSize: 10, color: "#666", background: "#151515", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }}>{client.score}</span>
          {onTrash && (
            <button
              type="button"
              aria-label="Smazat"
              onClick={(e) => { e.stopPropagation(); onTrash(e); }}
              style={{
                padding: 2,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: hover ? "#ff5577" : "#444",
                fontSize: 14,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🗑
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 4 }}>
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
      <span style={{ fontSize: 10, fontWeight: 700, color: "#777", letterSpacing: "0.15em", flex: 1 }}>{label}</span>
      {count > 0 && (
        <span style={{ fontSize: 9, fontWeight: 700, color: "#555", background: "#1a1a1a", padding: "1px 6px", borderRadius: 4 }}>{count}</span>
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
  { id: "podklady", label: "Podklady", icon: "◫", accent: "#b57bee" },
];

const scoreColor = (s: number) => (s >= 8 ? C.lime : s >= 6 ? C.yellow : s >= 4 ? C.pink : "#ff5577");
const scoreLabel = (s: number) => (s >= 8 ? "Silné" : s >= 6 ? "Dobré" : s >= 4 ? "Slabé" : "Kritické");

function getAccessDisplay(client: Client): { label: string; color: string } {
  const at = client.access_type ?? "FREE";
  if (at === "ACTIVE") return { label: "Přístup: ACTIVE · bez omezení", color: C.muted };
  const exp = client.access_expires_at ? new Date(client.access_expires_at) : null;
  if (!exp) return { label: `Přístup: ${at}`, color: C.muted };
  const now = new Date();
  const msLeft = exp.getTime() - now.getTime();
  const hoursLeft = msLeft / (1000 * 60 * 60);
  const daysLeft = msLeft / (1000 * 60 * 60 * 24);
  if (msLeft <= 0) return { label: `Přístup: ${at} · vypršel`, color: "#ff5577" };
  if (hoursLeft <= 24) return { label: `Přístup: ${at} · vyprší za ${Math.round(hoursLeft)} h`, color: "#ff5577" };
  if (daysLeft <= 3) return { label: `Přístup: ${at} · vyprší za ${Math.ceil(daysLeft)} dní`, color: C.yellow };
  const dateStr = exp.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
  return { label: `Přístup: ${at} · vyprší ${dateStr}`, color: C.muted };
}

type Urgency = "red" | "yellow" | "green" | "gray";
function getUrgency(client: Client): Urgency {
  if (client.status === "SUPLIK" || client.status === "ARCHIV") return "gray";
  const now = new Date();
  const exp = client.access_expires_at ? new Date(client.access_expires_at).getTime() : 0;
  const msLeft = exp - now.getTime();
  const hoursLeft = msLeft / (1000 * 60 * 60);
  const daysLeft = msLeft / (1000 * 60 * 60 * 24);
  const lastContact = client.last_contact_at ? new Date(client.last_contact_at).getTime() : 0;
  const hoursSinceContact = lastContact ? (now.getTime() - lastContact) / (1000 * 60 * 60) : 0;

  const accessExpires24h = exp > 0 && msLeft > 0 && hoursLeft <= 24;
  const waitingActivation2h = (client.status === "HOVOR" || client.status === "AKTIVNI") && lastContact > 0 && hoursSinceContact > 2;
  if (accessExpires24h || waitingActivation2h) return "red";

  const accessExpires3d = exp > 0 && msLeft > 0 && daysLeft <= 3;
  const hovorNotRecorded = client.status === "HOVOR" && !client.last_contact_at;
  if (accessExpires3d || hovorNotRecorded) return "yellow";

  return "green";
}

const CARD_PANEL = {
  background: "rgba(255,255,255,0.025)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  padding: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
};

function ContextPanel({
  client,
  statusUpdating,
  onUpdateStatus,
  onRefresh,
  setError,
}: {
  client: Client;
  statusUpdating: boolean;
  onUpdateStatus: (s: PipelineStatus) => void;
  onRefresh: () => void;
  setError: (e: string | null) => void;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const status = getS(client.status);
  const access = getAccessDisplay(client);
  return (
    <>
      <div style={CARD_PANEL}>
        <div style={{ fontSize: 10, color: "#888", letterSpacing: "0.12em", marginBottom: 8 }}>KLIENT</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${C.purple}44, ${C.pink}33)`,
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              color: C.lilac,
            }}
          >
            {client.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{client.projectDisplayName || client.name}</span>
              <button type="button" onClick={() => setShowEdit((e) => !e)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#888", fontSize: 12 }} title="Upravit">✏</button>
            </div>
            {!showEdit && (
              <>
                <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{client.email || "—"}</div>
                {client.web_url ? (
                  <a href={client.web_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.lime, marginTop: 4, display: "inline-block" }}>↗ {client.web_url.replace(/^https?:\/\//, "").slice(0, 24)}{client.web_url.length > 30 ? "…" : ""}</a>
                ) : (
                  <span style={{ fontSize: 12, color: "#555" }}>—</span>
                )}
              </>
            )}
            {showEdit && (
              <div style={{ marginTop: 8, padding: 10, background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 8 }}>
                <input placeholder="Jméno" defaultValue={client.projectDisplayName || client.name} style={{ width: "100%", marginBottom: 6, padding: "6px 8px", background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12 }} />
                <input placeholder="Email" defaultValue={client.email} style={{ width: "100%", marginBottom: 6, padding: "6px 8px", background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12 }} />
                <input placeholder="Web" defaultValue={client.web_url || ""} style={{ width: "100%", marginBottom: 6, padding: "6px 8px", background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12 }} />
                <input placeholder="Telefon" style={{ width: "100%", marginBottom: 8, padding: "6px 8px", background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12 }} />
                <button type="button" onClick={() => setShowEdit(false)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: C.lime, color: "#000", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Uložit</button>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 9, fontWeight: 700, color: status.color, background: status.bg }}>{status.icon} {status.short ?? status.label}</span>
          <span style={{ fontSize: 10, color: "#666" }}>{access.label}</span>
        </div>
      </div>

      <div style={CARD_PANEL}>
        <div style={{ fontSize: 10, color: C.lime, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>PIPELINE</div>
        <PipelineSection client={client} onChangeStatus={onUpdateStatus} onRefresh={onRefresh} updating={statusUpdating} />
      </div>

      <div style={CARD_PANEL}>
        <div style={{ fontSize: 10, color: C.lime, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>PILÍŘE ZNAČKY</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {client.pillars.map((p) => {
            const col = p.score >= 8 ? C.lime : p.score >= 6 ? C.yellow : p.score >= 4 ? C.pink : "#ff5577";
            return (
              <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: "#666", width: 20 }}>{p.icon}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.bg3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.score * 10}%`, background: col, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, color: "#aaa" }}>{p.score}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={CARD_PANEL}>
        <div style={{ fontSize: 10, color: C.lime, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>BRAND DNA</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
          <div><span style={{ color: "#666", fontSize: 10 }}>Positioning</span><div style={{ color: "#aaa", marginTop: 2 }}>{client.dna.positioning ?? "—"}</div></div>
          <div><span style={{ color: "#666", fontSize: 10 }}>Tón</span><div style={{ color: "#aaa", marginTop: 2 }}>{client.dna.tone ?? "—"}</div></div>
          <div><span style={{ color: "#666", fontSize: 10 }}>Cílová skupina</span><div style={{ color: "#aaa", marginTop: 2 }}>{client.dna.targetAudience ?? "—"}</div></div>
        </div>
      </div>

      <div style={CARD_PANEL}>
        <div style={{ fontSize: 10, color: C.lime, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>KURÁTORSKÉ AKCE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SendAccessBlock client={client} onSent={onRefresh} />
          <PipelineOutputsBlock client={client} onRefresh={onRefresh} updating={statusUpdating} />
          {!client.briefSubmittedAt ? (
            <button
              type="button"
              onClick={async () => { try { await fetch(`/api/admin/projects/${client.id}/send-access`, { method: "POST" }); onRefresh(); } catch { setError("Nepodařilo se odeslat výzvu"); } }}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #1f1f1f", background: "transparent", color: "#888", fontSize: 12, cursor: "pointer", textAlign: "left" }}
            >
              📋 Poslat výzvu k briefu
            </button>
          ) : (
            <div style={{ fontSize: 12, color: C.lime }}>✓ Brief odeslán</div>
          )}
        </div>
      </div>
    </>
  );
}

export default function PipelineDashboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [navSection, setNavSection] = useState<"pipeline" | "suplik" | "archiv">("pipeline");
  const [activeTab, setActiveTab] = useState("prehled");
  const [workMode, setWorkMode] = useState(false);
  const activeTabInitialized = useRef(false);
  const [strategistId, setStrategistId] = useState<StrategistId>(STRATEGISTS_META[0]?.id ?? "the_architect");
  const [strategistLoading, setStrategistLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedStrategyIds, setSelectedStrategyIds] = useState<string[]>([]);
  const [expandedStrategyId, setExpandedStrategyId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; hard: boolean } | null>(null);
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [pendingVersion, setPendingVersion] = useState<{ id: string; scan_result: Record<string, unknown>; created_at: string } | null>(null);
  const [showCompareDiff, setShowCompareDiff] = useState(false);
  const [versionsActionLoading, setVersionsActionLoading] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [assetsList, setAssetsList] = useState<Array<{ id: string; filename: string; storage_path: string; file_type: string; file_size: number; category: string; created_at: string; url: string }>>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOverPodklady, setDragOverPodklady] = useState(false);
  const podkladyFileInputRef = useRef<HTMLInputElement>(null);
  const [collapsedClientEmails, setCollapsedClientEmails] = useState<Set<string>>(new Set());
  const [bundlesList, setBundlesList] = useState<Array<{ id: string; name: string; output_type: string; status: string; strategy_label: string | null; created_at: string; output_url: string | null }>>([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [showNewBundlePanel, setShowNewBundlePanel] = useState(false);
  const [newBundleName, setNewBundleName] = useState("");
  const [newBundleOutputType, setNewBundleOutputType] = useState<"GAMMA" | "CANVA" | "NOTEBOOKLM" | "CUSTOM">("GAMMA");
  const [bundleCreateLoading, setBundleCreateLoading] = useState(false);
  const [generatingBundleId, setGeneratingBundleId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [notesSavedValue, setNotesSavedValue] = useState("");
  const [notesSaveSuccess, setNotesSaveSuccess] = useState(false);
  const [notesHistory, setNotesHistory] = useState<Array<{ at: string; preview: string; full: string }>>([]);
  const [notesHistoryExpandedIndex, setNotesHistoryExpandedIndex] = useState<number | null>(null);
  const [notesSaving, setNotesSaving] = useState(false);
  const [prehledActivities, setPrehledActivities] = useState<Array<{ id: string; type: string; message: string | null; seen_at: string | null; created_at: string }>>([]);
  const [prehledActivitiesLoading, setPrehledActivitiesLoading] = useState(false);
  const [activityUnreadByProject, setActivityUnreadByProject] = useState<Record<string, { count: number; hasNewMessage: boolean }>>({});
  const [contentAccordionOpen, setContentAccordionOpen] = useState<Record<string, number | null>>({});

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_work_mode");
      if (saved === "true") setWorkMode(true);
    }
  }, []);

  useEffect(() => {
    const workTabs = ["strategie", "vystup", "poznamky", "podklady"];
    if (!activeTabInitialized.current) {
      activeTabInitialized.current = true;
      return;
    }
    setWorkMode(workTabs.includes(activeTab));
  }, [activeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_work_mode", String(workMode));
    }
  }, [workMode]);

  useEffect(() => {
    if (!activeId) {
      setPendingVersion(null);
      setShowCompareDiff(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/admin/diagnostika/${activeId}/versions`);
        if (!r.ok || cancelled) return;
        const d = await r.json();
        if (cancelled) return;
        setPendingVersion(d.pending ?? null);
        if (!d.pending) setShowCompareDiff(false);
      } catch {
        if (!cancelled) setPendingVersion(null);
      }
    })();
    return () => { cancelled = true; };
  }, [activeId]);

  const loadAssets = useCallback(async () => {
    if (!activeId) return;
    setAssetsLoading(true);
    try {
      const r = await fetch(`/api/admin/projects/${activeId}/assets`);
      const d = await r.json();
      if (d.assets) setAssetsList(d.assets);
      else setAssetsList([]);
    } catch {
      setAssetsList([]);
    } finally {
      setAssetsLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeTab === "podklady" && activeId) loadAssets();
  }, [activeTab, activeId, loadAssets]);

  const loadBundles = useCallback(async () => {
    if (!activeId) return;
    setBundlesLoading(true);
    try {
      const r = await fetch(`/api/admin/projects/${activeId}/bundles`);
      const d = await r.json();
      if (d.bundles) setBundlesList(d.bundles);
      else setBundlesList([]);
    } catch {
      setBundlesList([]);
    } finally {
      setBundlesLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeTab === "vystup" && activeId) loadBundles();
  }, [activeTab, activeId, loadBundles]);

  const loadPrehledActivities = useCallback(async () => {
    if (!activeId) return;
    setPrehledActivitiesLoading(true);
    try {
      const [listRes, patchRes] = await Promise.all([
        fetch(`/api/admin/projects/${activeId}/activity`),
        fetch(`/api/admin/projects/${activeId}/activity`, { method: "PATCH" }),
      ]);
      if (listRes.ok) {
        const d = await listRes.json();
        setPrehledActivities(d.activities ?? []);
      }
    } finally {
      setPrehledActivitiesLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeTab === "prehled" && activeId) loadPrehledActivities();
  }, [activeTab, activeId, loadPrehledActivities]);

  useEffect(() => {
    if (rows.length === 0) return;
    fetch("/api/admin/activity-unread-counts")
      .then((r) => r.json())
      .then((d) => {
        const raw = d.byProject ?? {};
        const next: Record<string, { count: number; hasNewMessage: boolean }> = {};
        for (const [id, v] of Object.entries(raw)) {
          if (typeof v === "object" && v !== null && "count" in v) {
            next[id] = { count: (v as { count: number }).count ?? 0, hasNewMessage: !!(v as { hasNewMessage?: boolean }).hasNewMessage };
          } else {
            next[id] = { count: Number(v) || 0, hasNewMessage: false };
          }
        }
        setActivityUnreadByProject(next);
      })
      .catch(() => setActivityUnreadByProject({}));
  }, [rows.length]);

  const totalUnreadActivities = Object.values(activityUnreadByProject).reduce((a, p) => a + (p?.count ?? 0), 0);

  const clients = rows.map(mapRowToClient);
  const lastNotesSyncIdRef = useRef<string | null>(null);
  useEffect(() => {
    const c = clients.find((c) => c.id === activeId);
    if (!activeId || !c) return;
    if (lastNotesSyncIdRef.current === activeId) return;
    lastNotesSyncIdRef.current = activeId;
    setNotesDraft(c.notes ?? "");
    setNotesSavedValue(c.notes ?? "");
    setNotesHistory([]);
    setNotesHistoryExpandedIndex(null);
  }, [activeId, clients]);

  const pipelineClients = clients.filter((c) => c.status !== "SUPLIK" && c.status !== "ARCHIV");
  const suplikClients = clients.filter((c) => c.status === "SUPLIK");
  const archivClients = clients.filter((c) => c.status === "ARCHIV");
  const sectionClients = navSection === "pipeline" ? pipelineClients : navSection === "suplik" ? suplikClients : archivClients;
  const urgentCount = sectionClients.filter((c) => { const u = getUrgency(c); return u === "red" || u === "yellow"; }).length;
  const filteredByUrgent = showOnlyUrgent ? sectionClients.filter((c) => { const u = getUrgency(c); return u === "red" || u === "yellow"; }) : sectionClients;
  const searchQ = sidebarSearch.trim().toLowerCase();
  const displayedClients = searchQ
    ? filteredByUrgent.filter((c) => {
        const name = (c.name || "").toLowerCase();
        const sub = (c.sub || "").toLowerCase();
        const projectName = (c.projectName || "").toLowerCase();
        const clientName = (c.clientName || "").toLowerCase();
        const clientD = (c.clientDisplayName || "").toLowerCase();
        const projectD = (c.projectDisplayName || "").toLowerCase();
        const email = (c.email || "").toLowerCase();
        return name.includes(searchQ) || sub.includes(searchQ) || projectName.includes(searchQ) || clientName.includes(searchQ) || clientD.includes(searchQ) || projectD.includes(searchQ) || email.includes(searchQ);
      })
    : filteredByUrgent;

  const clientGroups = (() => {
    const byEmail = new Map<string, Client[]>();
    for (const c of displayedClients) {
      const key = c.email || "__no_email__";
      if (!byEmail.has(key)) byEmail.set(key, []);
      byEmail.get(key)!.push(c);
    }
    Array.from(byEmail.values()).forEach((arr) => {
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });
    const groups = Array.from(byEmail.entries()).map(([emailKey, list]) => ({
      emailKey,
      clients: list,
      newestAt: Math.max(...list.map((c) => new Date(c.created_at).getTime())),
    }));
    groups.sort((a, b) => b.newestAt - a.newestAt);
    return groups.map(({ emailKey, clients }) => ({ emailKey, clients }));
  })();

  const client = clients.find((c) => c.id === activeId);

  const PODKLADY_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "application/pdf"];
  const categoryByMime = (mime: string): string => {
    if (mime === "application/pdf") return "inspiration";
    if (mime === "image/svg+xml") return "logos";
    if (mime.startsWith("image/")) return "photos";
    return "photos";
  };
  const handlePodkladyFiles = async (files: FileList | null) => {
    if (!files?.length || !client?.id) return;
    const MAX_MB = 10;
    setUploadError(null);
    setUploadStatus("uploading");
    setUploadProgress(0);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_MB * 1024 * 1024) {
        setUploadError(`Soubor ${file.name} přesahuje ${MAX_MB} MB`);
        setUploadStatus("error");
        return;
      }
      if (!PODKLADY_ALLOWED_MIME.includes(file.type)) {
        setUploadError(`Typ ${file.name} není podporován (JPG, PNG, PDF, SVG, WEBP)`);
        setUploadStatus("error");
        return;
      }
      const form = new FormData();
      form.append("file", file);
      form.append("category", categoryByMime(file.type));
      setUploadProgress(Math.round(((i + 0.5) / files.length) * 100));
      try {
        const res = await fetch(`/api/admin/projects/${client.id}/assets`, { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
          setUploadError(data?.error ?? "Chyba uploadu");
          setUploadStatus("error");
          return;
        }
      } catch {
        setUploadError("Chyba uploadu — zkuste znovu");
        setUploadStatus("error");
        return;
      }
    }
    setUploadProgress(100);
    setUploadStatus("success");
    loadAssets();
    setTimeout(() => { setUploadStatus("idle"); }, 2000);
  };

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

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const { id, hard } = deleteConfirm;
    try {
      if (hard) {
        const url = "/api/admin/data?id=" + encodeURIComponent(id);
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) throw new Error("Nepodařilo se smazat");
        if (activeId === id) {
          const rest = clients.filter((c) => c.id !== id);
          setActiveId(rest[0]?.id ?? null);
        }
      } else {
        await updateStatus(id, "ARCHIV");
      }
      setError(null);
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba při mazání");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div
      style={{
        fontFamily: "DM Sans, system-ui, sans-serif",
        minHeight: "100vh",
        color: C.text,
        display: "flex",
        flexDirection: "column",
        background: C.bg0,
        backgroundImage: "radial-gradient(ellipse at 15% 50%, rgba(181,123,238,0.05) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(200,255,0,0.03) 0%, transparent 45%)",
      }}
    >
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              background: C.bg2,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
              maxWidth: 360,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontSize: 13, color: C.text, margin: "0 0 16px 0", lineHeight: 1.5 }}>
              {deleteConfirm.hard
                ? `Opravdu smazat projekt ${deleteConfirm.name}? Tuto akci nelze vrátit.`
                : `Opravdu přesunout projekt ${deleteConfirm.name} do Archivu?`}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg3, color: C.text, fontSize: 12, cursor: "pointer" }}
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: deleteConfirm.hard ? "#ff5577" : C.faint,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {deleteConfirm.hard ? "Smazat natrvalo" : "Přesunout do Archivu"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ height: 48, background: C.bg1, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 14, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: "#777", letterSpacing: "0.14em" }}>PIPELINE</span>
        <div style={{ flex: 1 }} />
        {error && <span style={{ fontSize: 11, color: C.pink }}>{error}</span>}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 200, borderRight: `1px solid ${C.border}`, background: C.bg1, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "10px 0 6px", borderBottom: `1px solid ${C.border}` }}>
            <NavItem label="Pipeline" icon="◈" count={pipelineClients.length} color={C.lime} isActive={navSection === "pipeline"} onClick={() => setNavSection("pipeline")} />
            <NavItem label="Šuplík" icon="⊡" count={suplikClients.length} color={C.yellow} isActive={navSection === "suplik"} onClick={() => setNavSection("suplik")} />
            <NavItem label="Archiv" icon="◫" count={archivClients.length} color={C.faint} isActive={navSection === "archiv"} onClick={() => setNavSection("archiv")} />
          </div>
          <div style={{ padding: "8px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Hledat klienta nebo projekt..."
                style={{
                  width: "100%",
                  padding: "8px 28px 8px 10px",
                  background: "#141414",
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.text,
                  fontSize: 12,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {sidebarSearch && (
                <button
                  type="button"
                  onClick={() => setSidebarSearch("")}
                  aria-label="Vymazat"
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", padding: 0, border: "none", background: "transparent", color: C.muted, cursor: "pointer", fontSize: 14 }}
                >
                  ×
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, padding: "4px 12px 8px", fontSize: 9, color: "#333" }}>
              <span><span style={{ color: ACTIVITY_DOT_COLORS.message }}>●</span> Zpráva</span>
              <span><span style={{ color: ACTIVITY_DOT_COLORS.activity }}>●</span> Aktivita</span>
              <span><span style={{ color: ACTIVITY_DOT_COLORS.urgent }}>●</span> Urgentní</span>
            </div>
          </div>
          {(urgentCount > 0 || totalUnreadActivities > 0) && (
            <button
              type="button"
              onClick={() => setShowOnlyUrgent((v) => !v)}
              style={{
                margin: "8px 8px 0",
                padding: "6px 10px",
                borderRadius: 6,
                border: `1px solid ${showOnlyUrgent ? C.yellow : C.border}`,
                background: showOnlyUrgent ? C.yellow + "15" : "transparent",
                color: showOnlyUrgent ? C.yellow : C.muted,
                fontSize: 11,
                cursor: "pointer",
                textAlign: "left",
                width: "calc(100% - 16px)",
              }}
            >
              {urgentCount > 0 && `● ${urgentCount} urgentní`}
              {urgentCount > 0 && totalUnreadActivities > 0 && " · "}
              {totalUnreadActivities > 0 && (urgentCount > 0 ? `${totalUnreadActivities} nové aktivity` : `● ${totalUnreadActivities} nové aktivity`)}
            </button>
          )}
          <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
            {displayedClients.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 11, color: C.faint }}>
                {searchQ ? "Žádný klient nenalezen" : showOnlyUrgent ? "Žádné urgentní" : navSection === "suplik" ? "Šuplík je prázdný" : navSection === "archiv" ? "Archiv je prázdný" : "Žádní klienti"}
              </div>
            ) : (
              clientGroups.map(({ emailKey, clients: groupClients }) => {
                const first = groupClients[0]!;
                const clientLabel = first.clientDisplayName + (groupClients.length > 1 ? ` (${groupClients.length})` : "");
                const hasActiveInGroup = groupClients.some((c) => c.id === activeId);
                const isCollapsed = collapsedClientEmails.has(emailKey);
                const groupUnread = groupClients.reduce((acc, c) => {
                  const p = activityUnreadByProject[c.id];
                  const count = p?.count ?? 0;
                  return { count: acc.count + count, hasNewMessage: acc.hasNewMessage || !!(p?.hasNewMessage) };
                }, { count: 0, hasNewMessage: false });
                const anyUrgentUnread = groupClients.some((c) => {
                  const u = getUrgency(c);
                  const count = activityUnreadByProject[c.id]?.count ?? 0;
                  return u === "red" && count > 0;
                });
                const activityDotType = groupUnread.count === 0 ? null : anyUrgentUnread ? "urgent" as const : groupUnread.hasNewMessage ? "message" as const : "activity" as const;
                const activityDotColor = activityDotType ? ACTIVITY_DOT_COLORS[activityDotType] : null;
                const activityDotTitle = activityDotType === "urgent" ? "Vyžaduje pozornost" : activityDotType === "message" ? "Zpráva od klienta" : activityDotType === "activity" ? "Nová aktivita" : "";
                return (
                  <div key={emailKey} style={{ marginBottom: 8, borderBottom: "1px solid #111" }}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setCollapsedClientEmails((prev) => {
                        const next = new Set(prev);
                        if (next.has(emailKey)) next.delete(emailKey);
                        else next.add(emailKey);
                        return next;
                      })}
                      onKeyDown={(e) => e.key === "Enter" && setCollapsedClientEmails((prev) => { const next = new Set(prev); if (next.has(emailKey)) next.delete(emailKey); else next.add(emailKey); return next; })}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        margin: "0 8px 2px",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: hasActiveInGroup ? "rgba(200,255,0,0.05)" : "transparent",
                        borderLeft: `2px solid ${hasActiveInGroup ? "#c8ff00" : "transparent"}`,
                        position: "relative",
                      }}
                      onMouseEnter={(e) => { const t = e.currentTarget; if (!hasActiveInGroup) t.style.background = "#111"; }}
                      onMouseLeave={(e) => { const t = e.currentTarget; if (!hasActiveInGroup) t.style.background = "transparent"; }}
                    >
                      {activityDotColor && (
                        <div title={activityDotTitle} style={{ position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: "50%", background: activityDotColor, zIndex: 1 }} />
                      )}
                      <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, border: "1px solid rgba(200,255,0,0.15)", background: `linear-gradient(135deg, ${C.purple}44, ${C.pink}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.lilac }}>
                        {first.clientAvatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: hasActiveInGroup ? "#c8ff00" : "rgba(200,255,0,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {clientLabel}
                        </div>
                        <div style={{ fontSize: 11, color: "#666" }}>{first.email ?? first.sub ?? ""}</div>
                      </div>
                      <span style={{ fontSize: 10, color: "#666" }}>{isCollapsed ? "▸" : "▾"}</span>
                    </div>
                    {!isCollapsed &&
                      groupClients.map((c) => (
                        <ClientCard
                          key={c.id}
                          client={c}
                          isActive={c.id === activeId}
                          onClick={() => { setActiveId(c.id); setActiveTab("prehled"); }}
                          displayTitle={c.projectDisplayName}
                          style={{}}
                          onTrash={(e) => {
                            e?.stopPropagation();
                            setDeleteConfirm({ id: c.id, name: c.projectDisplayName || c.name, hard: navSection === "archiv" });
                          }}
                          onUpdateStatus={(id, s) => updateStatus(id, s)}
                          onQuickNote={async (id, notes) => {
                            const res = await fetch(`/api/admin/diagnostika/${id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ internal_notes: notes }),
                            });
                            if (res.ok) await fetchData();
                          }}
                          onRunStrategist={async (id, strategistId) => {
                            setStrategistLoading(true);
                            try {
                              const res = await fetch(`/api/admin/diagnostika/${id}/run-strategist`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ strategistId }),
                              });
                              const data = await res.json().catch(() => ({}));
                              if (!res.ok) {
                                setError(data?.error ?? "Chyba při generování strategie");
                                return;
                              }
                              setError(null);
                              await fetchData();
                            } catch (e) {
                              setError(e instanceof Error ? e.message : "Nepodařilo se spustit stratega");
                            } finally {
                              setStrategistLoading(false);
                            }
                          }}
                          quickActionsLoading={strategistLoading}
                        />
                      ))}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ padding: "8px" }}>
            <Link
              href="/admin"
              style={{ display: "block", padding: "8px 12px", borderRadius: 8, border: `1px dashed ${C.border}`, fontSize: 11, color: "#666", textAlign: "center", textDecoration: "none" }}
            >
              Administrace diagnostiky
            </Link>
          </div>
        </div>

        {client && (
          <div
            style={{
              width: workMode ? 200 : 260,
              flexShrink: 0,
              background: "rgba(8,8,8,0.7)",
              backdropFilter: "blur(24px)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              overflowY: "auto",
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <ContextPanel
              client={client}
              statusUpdating={statusUpdating === client.id}
              onUpdateStatus={(s) => updateStatus(client.id, s)}
              onRefresh={fetchData}
              setError={setError}
            />
          </div>
        )}

        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 26, fontWeight: 700, color: "#cccccc", padding: "12px 20px 0" }}>
            {client?.projectDisplayName || client?.name || "Projekt"}
          </div>

            {showAcceptConfirm && pendingVersion && client && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.7)",
                  zIndex: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                }}
                onClick={() => !versionsActionLoading && setShowAcceptConfirm(false)}
              >
                <div
                  style={{
                    background: C.bg1,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 20,
                    maxWidth: 560,
                    width: "100%",
                    maxHeight: "90vh",
                    overflow: "auto",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Schválit přepsání diagnostiky</div>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>
                    Aktuální data diagnostiky budou nahrazena novou verzí od klienta. Níže vidíte, co se přepíše. Stará verze zůstane uložena v historii.
                  </p>
                  {(() => {
                    const activeRow = rows.find((r) => r.id === activeId);
                    const current = (activeRow?.scan_result ?? {}) as Record<string, unknown>;
                    const next = pendingVersion.scan_result;
                    const scoreCur = (current?.brandScore as { total?: number } | undefined)?.total ?? "—";
                    const scoreNext = (next?.brandScore as { total?: number } | undefined)?.total ?? "—";
                    const nameCur = (current?.brandDna as { name?: string } | undefined)?.name ?? (current?.client_name as string) ?? "—";
                    const nameNext = (next?.brandDna as { name?: string } | undefined)?.name ?? (next?.client_name as string) ?? "—";
                    const summaryCur = typeof current?.summary === "string" ? current.summary : "—";
                    const summaryNext = typeof next?.summary === "string" ? next.summary : "—";
                    return (
                      <div style={{ marginBottom: 20, padding: 12, background: C.bg0, borderRadius: 8, border: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 11 }}>
                        <div>
                          <div style={{ color: C.muted, marginBottom: 8, fontWeight: 700 }}>Aktuální (bude přepsáno)</div>
                          <div style={{ marginBottom: 6 }}><span style={{ color: C.faint }}>Skóre:</span> {String(scoreCur)}</div>
                          <div style={{ marginBottom: 6 }}><span style={{ color: C.faint }}>Název:</span> {String(nameCur)}</div>
                          <div style={{ color: C.text, lineHeight: 1.5 }}><span style={{ color: C.faint }}>Shrnutí:</span> {(String(summaryCur)).slice(0, 180)}{(String(summaryCur)).length > 180 ? "…" : ""}</div>
                        </div>
                        <div>
                          <div style={{ color: C.lime, marginBottom: 8, fontWeight: 700 }}>Nová verze (od klienta)</div>
                          <div style={{ marginBottom: 6 }}><span style={{ color: C.faint }}>Skóre:</span> {String(scoreNext)}</div>
                          <div style={{ marginBottom: 6 }}><span style={{ color: C.faint }}>Název:</span> {String(nameNext)}</div>
                          <div style={{ color: C.text, lineHeight: 1.5 }}><span style={{ color: C.faint }}>Shrnutí:</span> {(String(summaryNext)).slice(0, 180)}{(String(summaryNext)).length > 180 ? "…" : ""}</div>
                        </div>
                      </div>
                    );
                  })()}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      disabled={versionsActionLoading}
                      onClick={() => setShowAcceptConfirm(false)}
                      style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: versionsActionLoading ? "not-allowed" : "pointer" }}
                    >
                      Zrušit
                    </button>
                    <button
                      type="button"
                      disabled={versionsActionLoading}
                      onClick={async () => {
                        setVersionsActionLoading(true);
                        try {
                          const res = await fetch(`/api/admin/diagnostika/${client.id}/versions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "accept", versionId: pendingVersion.id }),
                          });
                          if (!res.ok) {
                            const data = await res.json().catch(() => ({}));
                            throw new Error(data?.error ?? "Chyba");
                          }
                          setShowAcceptConfirm(false);
                          await fetchData();
                          const verRes = await fetch(`/api/admin/diagnostika/${client.id}/versions`);
                          if (verRes.ok) {
                            const vd = await verRes.json();
                            setPendingVersion(vd.pending ?? null);
                          } else {
                            setPendingVersion(null);
                          }
                          setShowCompareDiff(false);
                        } catch (e) {
                          alert(e instanceof Error ? e.message : "Nepodařilo se přijmout verzi");
                        } finally {
                          setVersionsActionLoading(false);
                        }
                      }}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.lime, color: "#000", fontWeight: 700, fontSize: 12, cursor: versionsActionLoading ? "not-allowed" : "pointer" }}
                    >
                      {versionsActionLoading ? "Ukládám…" : "Schválit přepsání"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          <div
            style={{
              display: "flex",
              gap: 2,
              marginBottom: 0,
              background: "rgba(6,6,6,0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "0 20px",
              position: "sticky",
              top: 0,
              zIndex: 9,
            }}
          >
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
            <button
              type="button"
              onClick={() => setWorkMode((w) => !w)}
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: workMode ? "#c8ff00" : "#444",
                background: "transparent",
                border: `1px solid ${workMode ? "#c8ff00" : "#333"}`,
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              {workMode ? "⊡ Kompakt" : "⊞ Rozšířit"}
            </button>
          </div>

          <div style={{ padding: 20, maxWidth: "none" }}>
          {pendingVersion && client && (
            <div style={{ marginBottom: 16, padding: 12, background: C.bg2, border: `1px solid ${C.yellow}`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: C.text, marginBottom: 10 }}>
                Klient znovu spustil diagnostiku — zobrazit změny
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <button type="button" disabled={versionsActionLoading} onClick={() => setShowAcceptConfirm(true)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: C.lime, color: "#000", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Přijmout novou verzi</button>
                <button type="button" disabled={versionsActionLoading} onClick={async () => { setVersionsActionLoading(true); try { const res = await fetch(`/api/admin/diagnostika/${client.id}/versions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "ignore", versionId: pendingVersion.id }) }); if (!res.ok) throw new Error(); const verRes = await fetch(`/api/admin/diagnostika/${client.id}/versions`); if (verRes.ok) { const vd = await verRes.json(); setPendingVersion(vd.pending ?? null); } else setPendingVersion(null); setShowCompareDiff(false); } catch { } finally { setVersionsActionLoading(false); } }} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 11, cursor: "pointer" }}>Ignorovat</button>
              </div>
            </div>
          )}
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
                    if (!res.ok) {
                      setError(data?.error ?? "Chyba při generování strategie");
                      return;
                    }
                    setError(null);
                    await fetchData();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Nepodařilo se spustit stratega");
                  } finally {
                    setStrategistLoading(false);
                  }
                }}
              />
              <Section title="BRIEF" accent={C.yellow}>
                {!client.briefSubmittedAt ? (
                  <div style={{ padding: 14, borderRadius: 10, border: "1px solid #1f1f1f", background: "#111" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>📋 Brief nebyl odeslán</div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Klient zatím nevyplnil dotazník o značce.</div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await fetch(`/api/admin/projects/${client.id}/send-access`, { method: "POST" });
                          await fetchData();
                        } catch {
                          setError("Nepodařilo se odeslat výzvu");
                        }
                      }}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #1f1f1f", background: "transparent", color: "#888", fontSize: 12, cursor: "pointer" }}
                    >
                      Poslat výzvu →
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: 14, borderRadius: 10, border: "2px solid #c8ff00", background: C.bg2 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c8ff00", marginBottom: 4 }}>✓ Brief odeslán {new Date(client.briefSubmittedAt).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" })}</div>
                    {client.short_code ? (
                      <a href={`/client/${encodeURIComponent(client.short_code)}/brief`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 8, padding: "8px 14px", borderRadius: 8, border: "1px solid #c8ff00", background: "transparent", color: "#c8ff00", fontSize: 12, textDecoration: "none", cursor: "pointer" }}>
                        Zobrazit brief →
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: C.muted }}>Odkaz na brief není k dispozici.</span>
                    )}
                  </div>
                )}
              </Section>

              <Section title="AKTIVITA" accent={C.lime}>
                {prehledActivitiesLoading ? (
                  <div style={{ fontSize: 11, color: C.muted }}>Načítám…</div>
                ) : prehledActivities.length === 0 ? (
                  <div style={{ fontSize: 11, color: C.faint }}>Zatím žádná aktivita.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {prehledActivities.slice(0, 10).map((a) => {
                      const icon = a.type === "brief_submitted" ? "📋" : a.type === "content_approved" ? "✓" : a.type === "content_feedback" ? "✎" : "●";
                      const label = a.type === "brief_submitted" ? "brief" : a.type === "content_approved" ? "schválení" : a.type === "content_feedback" ? "připomínky" : a.type;
                      const created = new Date(a.created_at);
                      const now = new Date();
                      const diffMs = now.getTime() - created.getTime();
                      const diffM = Math.floor(diffMs / 60000);
                      const diffH = Math.floor(diffMs / 3600000);
                      const diffD = Math.floor(diffMs / 86400000);
                      const relTime = diffM < 60 ? `před ${diffM} min` : diffH < 24 ? `před ${diffH} h` : `před ${diffD} dny`;
                      return (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: C.bg2, borderRadius: 8, border: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 14 }}>{icon}</span>
                          <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
                          <span style={{ fontSize: 11, color: "#ccc", flex: 1 }}>{a.message ?? "—"}</span>
                          <span style={{ fontSize: 10, color: C.faint }}>{relTime}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>
            </div>
          )}

          {activeTab === "diagnostika" && (() => {
            const activeRow = rows.find((r) => r.id === activeId);
            const scan = activeRow?.scan_result ?? {};
            const total = Math.min(100, Math.max(0, (scan as { brandScore?: { total?: number } }).brandScore?.total ?? 0));
            const summary = (scan as { summary?: string }).summary?.trim() ?? "";
            const pillarAnalysis = (scan as { pillarAnalysis?: Record<string, { score?: number; interpretation?: string; strategicOpportunity?: string; observed?: string[]; notObserved?: string[]; reasoning?: string }> }).pillarAnalysis ?? {};
            const diagPillarKeys = [
              { key: "light", label: "Světlo", icon: "💡" },
              { key: "energy", label: "Energie", icon: "⚡" },
              { key: "architecture", label: "Architektura", icon: "🏗️" },
              { key: "identity", label: "Identita", icon: "🎯" },
              { key: "trust", label: "Důvěra", icon: "🤝" },
            ];
            const riskPillars = diagPillarKeys.filter((p) => (pillarAnalysis[p.key]?.score ?? 5) < 6);
            const totalComment = total >= 65 ? "Vaše značka má solidní základ. Největší prostor je v důvěře a diferenciaci." : total >= 45 ? "Vaše značka má potenciál růstu. Největší prostor je v oblasti důvěry a diferenciace." : "Vaše značka má potenciál. Největší prostor je v jasnosti nabídky a důvěře.";
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <Section title="CELKOVÉ SKÓRE" accent={C.purple}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: C.lime }}>{total}</span>
                    <span style={{ fontSize: 14, color: C.muted }}>/ 100</span>
                    <p style={{ fontSize: 12, color: C.text, lineHeight: 1.5, margin: 0, flex: "1 1 280px" }}>„{totalComment}{'"'}</p>
                  </div>
                </Section>
                <Section title="PILÍŘE ZNAČKY — KOMPLETNÍ DIAGNOSTIKA" accent={C.purple}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {diagPillarKeys.map((p) => {
                      const a = pillarAnalysis[p.key];
                      const score = typeof a?.score === "number" ? a.score : 5;
                      const col = scoreColor(score);
                      return (
                        <div key={p.key} style={{ padding: 14, borderRadius: 10, background: C.bg2, border: `1px solid ${col}28`, borderLeft: `4px solid ${col}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 18 }}>{p.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.label}</span>
                            <span style={{ fontSize: 18, fontWeight: 800, color: col }}>{score}/10</span>
                            <Tag color={col}>{scoreLabel(score)}</Tag>
                          </div>
                          {a?.interpretation?.trim() && <p style={{ fontSize: 11, color: C.text, lineHeight: 1.5, margin: "0 0 8px 0" }}>{a.interpretation}</p>}
                          {Array.isArray(a?.observed) && a.observed.length > 0 && (
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: 9, color: C.muted, letterSpacing: "0.06em" }}>CO JSME ZAZNAMENALI</span>
                              <ul style={{ margin: "4px 0 0 0", paddingLeft: 16, fontSize: 11, color: C.text }}>
                                {a.observed.map((x, i) => <li key={i}>{x}</li>)}
                              </ul>
                            </div>
                          )}
                          {Array.isArray(a?.notObserved) && a.notObserved.length > 0 && (
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: 9, color: C.muted, letterSpacing: "0.06em" }}>CO CHYBÍ / CO ZLEPŠIT</span>
                              <ul style={{ margin: "4px 0 0 0", paddingLeft: 16, fontSize: 11, color: C.faint }}>
                                {a.notObserved.map((x, i) => <li key={i}>{x}</li>)}
                              </ul>
                            </div>
                          )}
                          {a?.reasoning?.trim() && <p style={{ fontSize: 10, color: C.muted, lineHeight: 1.5, margin: "6px 0 0 0" }}><strong>Proč to ovlivnilo skóre:</strong> {a.reasoning}</p>}
                          {a?.strategicOpportunity?.trim() && <p style={{ fontSize: 11, color: C.lime, marginTop: 8, marginBottom: 0 }}>Doporučený směr: {a.strategicOpportunity}</p>}
                        </div>
                      );
                    })}
                  </div>
                </Section>
                {riskPillars.length > 0 && (
                  <Section title="KLÍČOVÁ RIZIKA / OKAMŽITÉ AKCE" accent={C.yellow}>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                      {riskPillars.map((p) => {
                        const a = pillarAnalysis[p.key];
                        const score = typeof a?.score === "number" ? a.score : 5;
                        return <li key={p.key}><strong>{p.label}</strong> ({score}/10): {(a?.strategicOpportunity || a?.interpretation || "Zaměřit se na posílení tohoto pilíře.").slice(0, 120)}…</li>;
                      })}
                    </ul>
                  </Section>
                )}
                {summary && (
                  <Section title="DOPORUČENÝ STRATEGICKÝ POSUN" accent={C.lime}>
                    <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{summary}</p>
                  </Section>
                )}
              </div>
            );
          })()}

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
                              <div style={{ marginTop: 10, padding: 10, background: C.bg0, borderRadius: 8, fontSize: 11, color: C.muted, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                                  <CopyButton text={s.content ?? s.summary ?? ""} />
                                </div>
                                {s.summary ?? "—"}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedStrategyId(isExpanded ? null : s.id)}
                            style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 10, cursor: "pointer" }}
                          >
                            {isExpanded ? "Sbalit" : "Detail"}
                          </button>
                          <CopyButton text={s.content ?? s.summary ?? ""} />
                          <button
                            type="button"
                            onClick={() => {
                              setNewBundleName(`${s.label} × Výstup`);
                              setNewBundleOutputType("GAMMA");
                              setActiveTab("vystup");
                              setShowNewBundlePanel(true);
                            }}
                            style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 10, cursor: "pointer" }}
                          >
                            ⊡ Zabalit do balíčku →
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {client.strategies.length === 0 && (
                      <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: C.faint, background: C.bg2, borderRadius: 10 }}>Žádné strategie. Spusťte stratéga níže.</div>
                    )}
                    {client.strategies.map((s) => {
                      const isContentVoice = s.strategist_id === "the_content_voice" && s.content;
                      const contentSections = isContentVoice ? parseContentVoiceSections(s.content!) : [];
                      const accordionOpen = contentAccordionOpen[s.id] ?? null;
                      return (
                        <div
                          key={s.id}
                          style={{
                            padding: "14px 16px",
                            borderRadius: 10,
                            border: `1px solid ${s.active ? C.lime + "50" : C.border}`,
                            background: s.active ? C.lime + "07" : C.bg2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.label}</span>
                                {s.active && <Tag color={C.lime}>✓ Aktivní</Tag>}
                              </div>
                              <div style={{ fontSize: 10, color: C.faint }}>Datum spuštění: {s.date}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setNewBundleName(`${s.label} × Výstup`);
                                setNewBundleOutputType("GAMMA");
                                setActiveTab("vystup");
                                setShowNewBundlePanel(true);
                              }}
                              style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                            >
                              ⊡ Zabalit do balíčku →
                            </button>
                          </div>
                          {isContentVoice && contentSections.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {contentSections.map((sec, idx) => {
                                const isOpen = accordionOpen === idx;
                                return (
                                  <div key={idx} style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.bg0 }}>
                                    <button
                                      type="button"
                                      onClick={() => setContentAccordionOpen((prev) => ({ ...prev, [s.id]: isOpen ? null : idx }))}
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 8,
                                        padding: "10px 12px",
                                        border: "none",
                                        background: "transparent",
                                        color: "#e8d44d",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: "0.04em",
                                        cursor: "pointer",
                                        textAlign: "left",
                                      }}
                                    >
                                      <span>{sec.title}</span>
                                      <span style={{ fontSize: 14 }}>{isOpen ? "−" : "+"}</span>
                                    </button>
                                    {isOpen && (
                                      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                          <CopyButton text={sec.body} />
                                        </div>
                                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{sec.body}</div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                                <button
                                  type="button"
                                  onClick={() => { setNewBundleName(`${s.label} × Výstup`); setNewBundleOutputType("GAMMA"); setActiveTab("vystup"); setShowNewBundlePanel(true); }}
                                  style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                >
                                  ⊡ Zabalit do balíčku →
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {s.summary && (
                                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, padding: "8px 10px", background: C.bg0, borderRadius: 8, borderLeft: `3px solid ${C.purple}` }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: C.faint, letterSpacing: "0.05em" }}>KLÍČOVÉ BODY STRATEGIE</span>
                                    <CopyButton text={s.content ?? s.summary ?? ""} />
                                  </div>
                                  {s.summary}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
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
                            if (!res.ok) {
                              setError(data?.error ?? "Chyba při generování strategie");
                              return;
                            }
                            setError(null);
                            await fetchData();
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "Nepodařilo se spustit stratega");
                          } finally {
                            setStrategistLoading(false);
                          }
                        }}
                        style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.purple, color: "#fff", fontWeight: 700, fontSize: 12, cursor: strategistLoading ? "not-allowed" : "pointer" }}
                      >
                        {strategistLoading ? "◈ Generuji strategii…" : "Spustit →"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "vystup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 12, color: C.muted }}>{bundlesList.length} balíčků strategií</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={async () => {
                      const projectName = client.projectDisplayName || client.name || "Projekt";
                      const now = new Date();
                      const dateStr = now.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
                      const activeRow = rows.find((r) => r.id === activeId);
                      const scan = (activeRow?.scan_result ?? {}) as Record<string, unknown>;
                      const brandDna = (scan.brandDna ?? {}) as Record<string, string>;
                      const archetype = brandDna.archetype?.trim() ? brandDna.archetype : "—";
                      let proposals: Array<{ format: string; hook: string; body: string; cta: string; hashtags?: string[]; visual_brief?: string }> = [];
                      try {
                        const r = await fetch(`/api/admin/projects/${activeId}/proposals`);
                        const d = await r.json();
                        if (d?.proposals) proposals = d.proposals;
                      } catch { /* pokračuj bez návrhů */ }
                      const lines: string[] = [];
                      lines.push(`# ${projectName} — Strategický dokument\n`);
                      lines.push(`Datum: ${dateStr}\n`);
                      lines.push("---\n");
                      lines.push("\n## 1. Brand DNA\n");
                      lines.push(`- Positioning: ${(client.dna?.positioning ?? brandDna.positioning ?? "—").toString().trim() || "—"}\n`);
                      lines.push(`- Tón komunikace: ${(client.dna?.tone ?? brandDna.tone ?? "—").toString().trim() || "—"}\n`);
                      lines.push(`- Cílová skupina: ${(client.dna?.targetAudience ?? brandDna.targetAudience ?? "—").toString().trim() || "—"}\n`);
                      lines.push(`- Unikátní hodnota: ${(client.dna?.uniqueValue ?? brandDna.uniqueValue ?? "—").toString().trim() || "—"}\n`);
                      lines.push(`- Archetype: ${archetype}\n`);
                      lines.push("\n## 2. Pilíře značky\n");
                      lines.push("| Pilíř | Skóre | Poznámka |\n");
                      lines.push("|-------|-------|----------|\n");
                      for (const p of client.pillars ?? []) {
                        const note = (p.note ?? "—").replace(/\|/g, "\\|").replace(/\n/g, " ");
                        lines.push(`| ${p.icon} ${p.label} | ${p.score}/10 | ${note} |\n`);
                      }
                      lines.push("\n## 3. Výstupy agentů\n");
                      for (const s of client.strategies ?? []) {
                        lines.push(`### ${s.label}\n`);
                        const body = [s.summary, s.content].filter(Boolean).join("\n\n");
                        lines.push(body ? `${body}\n\n` : "*Žádný obsah.*\n\n");
                      }
                      lines.push("## 4. Texty pro web a sítě\n");
                      if (proposals.length === 0) {
                        lines.push("*Zatím žádné texty.*\n\n");
                      } else {
                        for (const p of proposals) {
                          lines.push(`**${p.format}**\n`);
                          if (p.hook) lines.push(`${p.hook}\n`);
                          if (p.body) lines.push(`${p.body}\n`);
                          if (p.cta) lines.push(`CTA: ${p.cta}\n`);
                          if (Array.isArray(p.hashtags) && p.hashtags.length) lines.push(`${p.hashtags.join(" ")}\n`);
                          lines.push("\n");
                        }
                      }
                      lines.push("## 5. Doporučení + akční plán\n");
                      const rawPlan = scan.strategic_plan;
                      const planText = typeof rawPlan === "string" ? rawPlan : (rawPlan && typeof (rawPlan as { _raw?: string })._raw === "string" ? (rawPlan as { _raw: string })._raw : rawPlan ? JSON.stringify(rawPlan, null, 2) : "");
                      lines.push(planText ? `${planText}\n\n` : "*Doporučení z diagnostiky zatím nebyla vygenerována.*\n\n");
                      lines.push("## 6. Obsahový brief pro tvorbu\n");
                      const byReels = proposals.filter((p) => /instagram|reels|video/i.test(p.format));
                      const byPosty = proposals.filter((p) => !/instagram|reels|video/i.test(p.format));
                      lines.push("### Reels\n");
                      if (byReels.length) {
                        for (const p of byReels) {
                          lines.push(`- **Téma:** ${(p.hook || "—").replace(/\n/g, " ")}\n`);
                          lines.push(`- **Sdělení:** ${(p.body || "—").replace(/\n/g, " ")}\n`);
                          lines.push(`- **Vizuální styl:** ${(p.visual_brief || "—").replace(/\n/g, " ")}\n`);
                          lines.push(`- **CTA:** ${(p.cta || "—").replace(/\n/g, " ")}\n\n`);
                        }
                      } else lines.push("*Zatím žádné.*\n\n");
                      lines.push("### Posty\n");
                      if (byPosty.length) {
                        for (const p of byPosty) {
                          lines.push(`- **Téma:** ${(p.hook || "—").replace(/\n/g, " ")}\n`);
                          lines.push(`- **Sdělení:** ${(p.body || "—").replace(/\n/g, " ")}\n`);
                          lines.push(`- **Vizuální styl:** ${(p.visual_brief || "—").replace(/\n/g, " ")}\n`);
                          lines.push(`- **CTA:** ${(p.cta || "—").replace(/\n/g, " ")}\n\n`);
                        }
                      } else lines.push("*Zatím žádné.*\n\n");
                      lines.push("### Foto / Video\n");
                      const visualBriefs = proposals.map((p) => p.visual_brief).filter(Boolean);
                      if (visualBriefs.length) lines.push(visualBriefs.join("\n\n") + "\n\n");
                      else lines.push("*Zatím žádné.*\n\n");
                      lines.push("---\n");
                      lines.push("*Generováno Studio Lucifera AI Content Studio*\n");
                      const md = lines.join("");
                      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${projectName.replace(/[^a-zA-Z0-9\u00C0-\u024F\-]/g, "_")}_strategicky_dokument.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #c8ff00", background: "transparent", color: "#c8ff00", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Exportovat jako dokument
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const label = client.strategies?.find((s) => s.id === client.active_strategy_id)?.label;
                      setNewBundleName(label ? `${label} × Výstup` : "[Stratég] × [Výstup]");
                      setNewBundleOutputType("GAMMA");
                      setShowNewBundlePanel(true);
                    }}
                    style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #1f1f1f", background: "transparent", color: "#888", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    + Nový balíček
                  </button>
                </div>
              </div>

              {showNewBundlePanel && (
                <div style={{ padding: 16, borderRadius: 12, border: "2px solid #c8ff00", background: C.bg2 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: "0.05em", marginBottom: 12 }}>NOVÝ BALÍČEK</div>
                  <label style={{ display: "block", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Název balíčku</span>
                    <input
                      type="text"
                      value={newBundleName}
                      onChange={(e) => setNewBundleName(e.target.value)}
                      placeholder="[Stratég] × [Výstup]"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#0a0a0a", color: "#fff", fontSize: 13 }}
                    />
                  </label>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Typ výstupu</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {[
                      { type: "GAMMA" as const, icon: "🎨", label: "Gamma prezentace" },
                      { type: "CANVA" as const, icon: "📱", label: "5 příspěvků + Canva" },
                      { type: "NOTEBOOKLM" as const, icon: "🎧", label: "NotebookLM průvodce" },
                      { type: "CUSTOM" as const, icon: "◇", label: "Vlastní výstup" },
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setNewBundleOutputType(opt.type)}
                        style={{
                          padding: "10px 12px", borderRadius: 8, border: `1px solid ${newBundleOutputType === opt.type ? "#c8ff00" : C.border}`, background: newBundleOutputType === opt.type ? "#c8ff0018" : "transparent", color: "#ccc", fontSize: 12, textAlign: "left", cursor: "pointer",
                        }}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: C.faint, marginBottom: 12 }}>◈ Balíček zachytí aktuální stav diagnostiky, Brand DNA a strategie jako snapshot.</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      disabled={bundleCreateLoading}
                      onClick={async () => {
                        if (!client.id) return;
                        setBundleCreateLoading(true);
                        try {
                          const res = await fetch(`/api/admin/projects/${client.id}/bundles`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: newBundleName || "[Stratég] × [Výstup]", output_type: newBundleOutputType, strategy_label: client.strategies?.find((s) => s.id === client.active_strategy_id)?.label ?? null }),
                          });
                          if (!res.ok) throw new Error((await res.json()).error || "Chyba");
                          await loadBundles();
                          setShowNewBundlePanel(false);
                          setNewBundleName("");
                        } catch (e) {
                          setError(e instanceof Error ? e.message : "Nepodařilo se vytvořit balíček");
                        } finally {
                          setBundleCreateLoading(false);
                        }
                      }}
                      style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#c8ff00", color: "#000", fontWeight: 700, fontSize: 12, cursor: bundleCreateLoading ? "not-allowed" : "pointer" }}
                    >
                      ⊡ Vytvořit balíček
                    </button>
                    <button type="button" onClick={() => { setShowNewBundlePanel(false); setNewBundleName(""); }} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #1f1f1f", background: "transparent", color: "#888", fontSize: 12, cursor: "pointer" }}>
                      Zrušit
                    </button>
                  </div>
                </div>
              )}

              {bundlesLoading ? (
                <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 12 }}>Načítám balíčky…</div>
              ) : bundlesList.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: C.faint, fontSize: 12 }}>Zatím žádné balíčky. Vytvořte první balíček ze strategie.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bundlesList.map((b) => {
                    const typeInfo = { GAMMA: { icon: "🎨", label: "Gamma" }, CANVA: { icon: "📱", label: "5 příspěvků + Canva" }, NOTEBOOKLM: { icon: "🎧", label: "NotebookLM" }, CUSTOM: { icon: "◇", label: "Vlastní" } }[b.output_type] || { icon: "◇", label: b.output_type };
                    const statusStyle: Record<string, { color: string; bg: string; icon: string }> = {
                      NAVRH: { color: "#888", bg: "#1a1a1a", icon: "◯" },
                      PRIPRAVENY: { color: "#d4b8f0", bg: "#16101e", icon: "◎" },
                      GENERUJE: { color: "#e8d44d", bg: "#1a1600", icon: "◈" },
                      HOTOVO: { color: "#c8ff00", bg: "#0f1a00", icon: "✦" },
                    };
                    const st = statusStyle[b.status] || statusStyle.NAVRH;
                    const isGenerating = generatingBundleId === b.id;
                    return (
                      <div
                        key={b.id}
                        style={{
                          padding: "12px 14px", borderRadius: 10, background: C.bg2, border: `1px solid ${C.border}`, borderLeft: `4px solid ${st.color}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{typeInfo.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 4 }}>{b.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            {b.strategy_label && <span style={{ padding: "2px 8px", borderRadius: 6, background: "#d4b8f033", color: "#d4b8f0", fontSize: 10 }}>{b.strategy_label}</span>}
                            <span style={{ padding: "2px 8px", borderRadius: 6, background: "#444", color: C.faint, fontSize: 10 }}>{typeInfo.label}</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{new Date(b.created_at).toLocaleDateString("cs-CZ")}</span>
                          </div>
                        </div>
                        <span style={{ padding: "4px 10px", borderRadius: 6, background: st.bg, color: st.color, fontSize: 11, fontWeight: 600 }}>{st.icon} {b.status}</span>
                        {b.status === "NAVRH" && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await fetch(`/api/admin/projects/${client.id}/bundles/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PRIPRAVENY" }) });
                                await loadBundles();
                              } catch { setError("Nepodařilo se aktualizovat"); }
                            }}
                            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #1f1f1f", background: "transparent", color: "#888", fontSize: 11, cursor: "pointer" }}
                          >
                            Připravit →
                          </button>
                        )}
                        {b.status === "PRIPRAVENY" && (
                          <button
                            type="button"
                            disabled={isGenerating}
                            onClick={async () => {
                              setGeneratingBundleId(b.id);
                              try {
                                await fetch(`/api/admin/projects/${client.id}/bundles/${b.id}/generate`, { method: "POST" });
                                await loadBundles();
                              } catch { setError("Generování selhalo"); } finally { setGeneratingBundleId(null); }
                            }}
                            style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#b57bee", color: "#fff", fontSize: 11, fontWeight: 600, cursor: isGenerating ? "not-allowed" : "pointer" }}
                          >
                            Generovat →
                          </button>
                        )}
                        {b.status === "GENERUJE" && <span style={{ padding: "6px 12px", borderRadius: 8, background: "#1a1600", color: "#e8d44d", fontSize: 11 }}>◈ Generuje…</span>}
                        {b.status === "HOTOVO" && (
                          b.output_url ? (
                            <a href={b.output_url} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #c8ff00", background: "transparent", color: "#c8ff00", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>Zobrazit ↗</a>
                          ) : (
                            <span style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #c8ff00", color: "#c8ff00", fontSize: 11 }}>Zobrazit ↗</span>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "poznamky" && (
            <Section title="INTERNÍ POZNÁMKY" accent={C.yellow}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer", fontSize: 12, color: client.notesAiEnabled ? "#b57bee" : C.muted }}>
                <input
                  type="checkbox"
                  checked={client.notesAiEnabled}
                  onChange={async (e) => {
                    const next = e.target.checked;
                    try {
                      const res = await fetch(`/api/admin/diagnostika/${client.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ notes_ai_enabled: next }),
                      });
                      if (!res.ok) throw new Error("Nepodařilo se uložit");
                      await fetchData();
                    } catch {
                      setError("Nepodařilo se uložit nastavení AI poznámek");
                    }
                  }}
                  style={{ accentColor: "#b57bee" }}
                />
                <span>◈ AI čerpá z těchto poznámek při tvorbě strategie a hodnocení stavu</span>
              </label>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Poznámky kurátora…"
                style={{
                  width: "100%", minHeight: 160, padding: 13, resize: "vertical", background: "#141414", border: "1px solid #1f1f1f", borderRadius: 8, color: "#ccc", fontSize: 12, lineHeight: 1.7, boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={notesSaving}
                  onClick={async () => {
                    if (!client.id) return;
                    setNotesSaving(true);
                    try {
                      const res = await fetch(`/api/admin/diagnostika/${client.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ internal_notes: notesDraft }),
                      });
                      if (!res.ok) throw new Error((await res.json()).error || "Nepodařilo se uložit");
                      setNotesSavedValue(notesDraft);
                      setNotesHistory((prev) => [
                        { at: new Date().toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" }), preview: notesDraft.slice(0, 60) + (notesDraft.length > 60 ? "…" : ""), full: notesDraft },
                        ...prev.slice(0, 4),
                      ]);
                      setNotesSaveSuccess(true);
                      setTimeout(() => setNotesSaveSuccess(false), 2000);
                      await fetchData();
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Nepodařilo se uložit poznámky");
                    } finally {
                      setNotesSaving(false);
                    }
                  }}
                  style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#e8d44d", color: "#000", fontWeight: 700, fontSize: 12, cursor: notesSaving ? "not-allowed" : "pointer" }}
                >
                  Uložit poznámky
                </button>
                <button
                  type="button"
                  onClick={() => setNotesDraft(notesSavedValue)}
                  style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #1f1f1f", background: "transparent", color: "#888", fontSize: 12, cursor: "pointer" }}
                >
                  Zrušit
                </button>
                {notesSaveSuccess && <span style={{ fontSize: 12, color: C.muted }}>✓ Uloženo</span>}
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#e8d44d", letterSpacing: "0.1em", marginBottom: 10 }}>HISTORIE ZMĚN</div>
                {notesHistory.length === 0 ? (
                  <p style={{ fontSize: 11, color: C.faint }}>Zatím žádné záznamy (max. 5 posledních uložení).</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {notesHistory.map((entry, idx) => (
                      <div
                        key={idx}
                        style={{ padding: 8, background: C.bg2, borderRadius: 8, border: `1px solid ${C.border}`, cursor: "pointer" }}
                        onClick={() => setNotesHistoryExpandedIndex(notesHistoryExpandedIndex === idx ? null : idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setNotesHistoryExpandedIndex(notesHistoryExpandedIndex === idx ? null : idx)}
                      >
                        <div style={{ fontSize: 11, color: C.muted }}>{entry.at} · {entry.preview}</div>
                        {notesHistoryExpandedIndex === idx && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}`, fontSize: 12, color: "#ccc", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{entry.full || "—"}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>
          )}

          {activeTab === "podklady" && (() => {
            const PODKLADY_ACCENT = "#b57bee";
            const categoryLabels: Record<string, string> = { photos: "📷 Fotky klienta", logos: "🎨 Loga a grafika", inspiration: "💡 Inspirace a moodboard" };
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <Section title="PODKLADY" accent={PODKLADY_ACCENT}>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOverPodklady(true); }}
                    onDragLeave={() => setDragOverPodklady(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOverPodklady(false); handlePodkladyFiles(e.dataTransfer.files); }}
                    onClick={() => podkladyFileInputRef.current?.click()}
                    style={{
                      padding: "28px 20px",
                      background: "#141414",
                      border: `2px dashed ${dragOverPodklady ? PODKLADY_ACCENT : C.border}`,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    <input
                      ref={podkladyFileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,.svg,.pdf,image/jpeg,image/png,image/webp,image/svg+xml,application/pdf"
                      onChange={(e) => { handlePodkladyFiles(e.target.files); e.target.value = ""; }}
                      style={{ display: "none" }}
                    />
                    <p style={{ fontSize: 13, color: C.text, margin: "0 0 6px 0" }}>Přetáhněte soubory sem nebo klikněte pro výběr</p>
                    <p style={{ fontSize: 11, color: C.faint, margin: 0 }}>JPG, PNG, PDF, SVG, WEBP · max 10 MB</p>
                  </div>
                  {uploadStatus === "uploading" && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 6, background: C.bg3, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${uploadProgress}%`, height: "100%", background: PODKLADY_ACCENT, borderRadius: 3, transition: "width 0.2s" }} />
                      </div>
                      <p style={{ fontSize: 11, color: C.muted, marginTop: 6, marginBottom: 0 }}>Nahrávám…</p>
                    </div>
                  )}
                  {uploadStatus === "success" && (
                    <p style={{ fontSize: 11, color: C.lime, marginTop: 12, marginBottom: 0 }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: C.lime, marginRight: 6, verticalAlign: "middle" }} /> Uloženo</p>
                  )}
                  {uploadStatus === "error" && uploadError && (
                    <p style={{ fontSize: 11, color: "#ff5577", marginTop: 12, marginBottom: 0 }}>Chyba uploadu — zkuste znovu. {uploadError}</p>
                  )}
                </Section>
                {assetsLoading ? (
                  <p style={{ fontSize: 12, color: C.muted }}>Načítám podklady…</p>
                ) : assetsList.length === 0 ? (
                  <p style={{ fontSize: 12, color: C.faint, textAlign: "center", padding: 24 }}>Zatím žádné podklady. Nahrajte fotky, loga nebo inspiraci pro tvorbu vizuálního boardu.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {assetsList.map((a) => {
                      const isPdf = a.file_type === "application/pdf";
                      const dateStr = new Date(a.created_at).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
                      const nameShort = a.filename.length > 20 ? a.filename.slice(0, 17) + "…" : a.filename;
                      return (
                        <div
                          key={a.id}
                          style={{
                            background: C.bg2,
                            border: `1px solid ${C.border}`,
                            borderRadius: 10,
                            overflow: "hidden",
                            position: "relative",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget.querySelector(".podklady-card-actions") as HTMLElement | null;
                            if (el) el.style.opacity = "1";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget.querySelector(".podklady-card-actions") as HTMLElement | null;
                            if (el) el.style.opacity = "0";
                          }}
                        >
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "block", textDecoration: "none", color: "inherit" }}
                          >
                            <div style={{ aspectRatio: "1", background: C.bg0, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 100 }}>
                              {isPdf ? (
                                <span style={{ fontSize: 36, color: C.muted }}>📄</span>
                              ) : (
                                <img src={a.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              )}
                            </div>
                          </a>
                          <div style={{ padding: "8px 10px" }}>
                            <div style={{ fontSize: 11, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }} title={a.filename}>{nameShort}</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 9, color: C.faint }}>{dateStr}</span>
                              <span style={{ fontSize: 9, color: PODKLADY_ACCENT, background: PODKLADY_ACCENT + "22", padding: "2px 6px", borderRadius: 4 }}>{categoryLabels[a.category] ?? a.category}</span>
                            </div>
                          </div>
                          <div className="podklady-card-actions" style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s" }}>
                            <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ padding: "4px 8px", background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 10, textDecoration: "none" }}>↗</a>
                            <button
                              type="button"
                              onClick={async (e) => { e.preventDefault(); e.stopPropagation(); if (!confirm("Smazat tento podklad?")) return; try { await fetch(`/api/admin/projects/${client.id}/assets/${a.id}`, { method: "DELETE" }); loadAssets(); } catch {} }}
                              style={{ padding: "4px 8px", background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 6, color: "#ff5577", fontSize: 10, cursor: "pointer" }}
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
          </div>
        </div>
      </div>
    </div>
  );
}
