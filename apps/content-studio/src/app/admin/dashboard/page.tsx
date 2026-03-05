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
  client_name: string | null;
  project_name: string | null;
  workflow_status: string | null;
  payment_status: string | null;
  short_code: string | null;
  access_expires_at: string | null;
  access_type: string | null;
  last_contact_at: string | null;
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
  }>;
  notes: string;
  notesAiEnabled: boolean;
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
  const clientDisplayName = (row.client_name ?? row.email ?? "—").toString().trim() || "—";
  const projectDisplayName = (row.project_name ?? row.name ?? row.web_url ?? "—").toString().trim() || "—";
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
    </Section>
  );
}

const URGENCY_COLORS: Record<Urgency, string> = { red: "#ff5577", yellow: C.yellow, green: C.lime, gray: C.faint };

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
  /** Přepsat hlavní řádek (např. projectDisplayName v hierarchii). */
  displayTitle?: string;
  style?: React.CSSProperties;
}) {
  const status = getS(client.status);
  const [hover, setHover] = useState(false);
  const [openQuick, setOpenQuick] = useState<"status" | "note" | "strategist" | null>(null);
  const [noteDraft, setNoteDraft] = useState(client.notes);
  const urgency = getUrgency(client);
  const dotColor = URGENCY_COLORS[urgency];
  const showQuickActions = hover && (onUpdateStatus || onQuickNote || onRunStrategist);
  const title = displayTitle ?? client.name;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        margin: "0 8px 2px",
        padding: "10px 12px",
        borderRadius: 9,
        background: isActive ? C.bg2 : "transparent",
        border: isActive ? `1px solid ${status.color}30` : "1px solid transparent",
        borderLeft: `3px solid ${isActive ? status.color : "transparent"}`,
        cursor: "pointer",
        position: "relative",
        ...cardStyle,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
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
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: dotColor,
              border: "1px solid #0a0a0a",
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>
          {displayTitle == null && <div style={{ fontSize: 9, color: C.faint }}>{client.sub}</div>}
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
          <div style={{ fontSize: 11, fontWeight: 700, color: status.color }}>{client.score}</div>
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
        const res = await fetch(`/api/admin/data?id=${encodeURIComponent(id)}`, { method: "DELETE" });
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
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.bg0, minHeight: "100vh", color: C.text, display: "flex", flexDirection: "column" }}>
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
          </div>
          {urgentCount > 0 && (
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
              ● {urgentCount} vyžadují pozornost
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
                const groupUrgency = groupClients.reduce<Urgency>((acc, c) => {
                  const u = getUrgency(c);
                  if (u === "red") return "red";
                  if (u === "yellow" && acc !== "red") return "yellow";
                  if (u === "green" && acc !== "red" && acc !== "yellow") return "green";
                  return acc;
                }, "gray");
                const hasActiveInGroup = groupClients.some((c) => c.id === activeId);
                const isCollapsed = collapsedClientEmails.has(emailKey);
                const dotColor = URGENCY_COLORS[groupUrgency];
                return (
                  <div key={emailKey} style={{ marginBottom: 4 }}>
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
                        gap: 8,
                        padding: "8px 12px",
                        margin: "0 8px 2px",
                        borderRadius: 9,
                        cursor: "pointer",
                        background: hasActiveInGroup ? C.bg2 : "transparent",
                        borderLeft: `3px solid ${hasActiveInGroup ? C.lime : "transparent"}`,
                      }}
                    >
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${C.purple}44, ${C.pink}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.lilac }}>
                          {first.clientAvatar}
                        </div>
                        <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: dotColor, border: "1px solid #0a0a0a" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: hasActiveInGroup ? 700 : 500, color: hasActiveInGroup ? "#fff" : C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {clientLabel}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: C.faint }}>{isCollapsed ? "▸" : "▾"}</span>
                    </div>
                    {!isCollapsed &&
                      groupClients.map((c) => (
                        <ClientCard
                          key={c.id}
                          client={c}
                          isActive={c.id === activeId}
                          onClick={() => { setActiveId(c.id); setActiveTab("prehled"); }}
                          displayTitle={c.projectDisplayName}
                          style={{ marginLeft: 12 }}
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
                              if (res.ok) await fetchData();
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
              style={{ display: "block", padding: "8px 12px", borderRadius: 8, border: `1px dashed ${C.border}`, fontSize: 11, color: C.faint, textAlign: "center", textDecoration: "none" }}
            >
              Administrace diagnostiky
            </Link>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
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
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{client.projectDisplayName || client.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>
                  {[client.clientDisplayName !== "—" && client.clientDisplayName, client.email, client.web_url].filter(Boolean).join(" · ") || "—"}
                </div>
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
            {(() => {
              const access = getAccessDisplay(client);
              return (
                <div style={{ fontSize: 11, color: access.color, marginTop: 8 }}>
                  {access.label}
                </div>
              );
            })()}

            {pendingVersion && (
              <div style={{ marginTop: 12, padding: 12, background: C.bg2, border: `1px solid ${C.yellow}`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: C.text, marginBottom: 10 }}>
                  Klient znovu spustil diagnostiku {new Date(pendingVersion.created_at).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })} — zobrazit změny
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button
                    type="button"
                    disabled={versionsActionLoading}
                    onClick={() => setShowAcceptConfirm(true)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: C.lime, color: "#000", fontWeight: 700, fontSize: 11, cursor: versionsActionLoading ? "not-allowed" : "pointer" }}
                  >
                    Přijmout novou verzi
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
                          body: JSON.stringify({ action: "ignore", versionId: pendingVersion.id }),
                        });
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}));
                          throw new Error(data?.error ?? "Chyba");
                        }
                        const verRes = await fetch(`/api/admin/diagnostika/${client.id}/versions`);
                        if (verRes.ok) {
                          const vd = await verRes.json();
                          setPendingVersion(vd.pending ?? null);
                        } else {
                          setPendingVersion(null);
                        }
                        setShowCompareDiff(false);
                      } catch (e) {
                        alert(e instanceof Error ? e.message : "Nepodařilo se ignorovat");
                      } finally {
                        setVersionsActionLoading(false);
                      }
                    }}
                    style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 11, cursor: versionsActionLoading ? "not-allowed" : "pointer" }}
                  >
                    Ignorovat
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCompareDiff((v) => !v)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.purple}`, background: showCompareDiff ? C.purple + "22" : "transparent", color: C.purple, fontSize: 11, cursor: "pointer" }}
                  >
                    {showCompareDiff ? "Skrýt porovnání" : "Porovnat rozdíly"}
                  </button>
                </div>
                {showCompareDiff && (() => {
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
                    <div style={{ marginTop: 14, padding: 12, background: C.bg0, borderRadius: 8, border: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 11 }}>
                      <div>
                        <div style={{ color: C.muted, marginBottom: 8, fontWeight: 700 }}>Aktuální verze</div>
                        <div style={{ marginBottom: 6 }}><span style={{ color: C.faint }}>Skóre:</span> {String(scoreCur)}</div>
                        <div style={{ marginBottom: 6 }}><span style={{ color: C.faint }}>Název:</span> {String(nameCur)}</div>
                        <div style={{ color: C.text, lineHeight: 1.5 }}><span style={{ color: C.faint }}>Shrnutí:</span> {(String(summaryCur)).slice(0, 200)}{(String(summaryCur)).length > 200 ? "…" : ""}</div>
                      </div>
                      <div>
                        <div style={{ color: C.purple, marginBottom: 8, fontWeight: 700 }}>Nová verze (od klienta)</div>
                        <div style={{ marginBottom: 6 }}><span style={{ color: C.faint }}>Skóre:</span> {String(scoreNext)}</div>
                        <div style={{ marginBottom: 6 }}><span style={{ color: C.faint }}>Název:</span> {String(nameNext)}</div>
                        <div style={{ color: C.text, lineHeight: 1.5 }}><span style={{ color: C.faint }}>Shrnutí:</span> {(String(summaryNext)).slice(0, 200)}{(String(summaryNext)).length > 200 ? "…" : ""}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

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
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 12, color: C.muted }}>{bundlesList.length} balíčků strategií</span>
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
