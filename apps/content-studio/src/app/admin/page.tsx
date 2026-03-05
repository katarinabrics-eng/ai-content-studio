"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STRATEGISTS_META } from "@/lib/strategist-selector";
import { StrategicPlanRenderer } from "@/components/StrategicPlanRenderer";

type SavedStrategy = { id: string; name: string; content: string; created_at: string; strategist_id: string | null };

type SuggestedStrategist = { id: string; label: string; tagline: string; reason?: string; fit_score?: number };

type ScanResult = {
  brandScore?: { total?: number; hasHeadline?: boolean; hasOffer?: boolean; hasTargetAudience?: boolean; hasCTA?: boolean; hasVisualIdentity?: boolean; hasSocialProof?: boolean };
  brandDna?: { name?: string; positioning?: string; tone?: string; targetAudience?: string; communicationStyle?: string; uniqueValue?: string; contentPillars?: string[]; missingElements?: string[]; visualStyle?: { primaryColor?: string; secondaryColor?: string; mood?: string; typography?: string } };
  summary?: string;
  pillarAnalysis?: Record<string, { score?: number; interpretation?: string; observed?: string[]; notObserved?: string[]; reasoning?: string; strategicOpportunity?: string }>;
  admin_notes?: string | null;
  strategic_plan?: string | Record<string, unknown> | null;
  suggested_strategists?: SuggestedStrategist[];
  saved_strategies?: SavedStrategy[];
  active_strategy_id?: string | null;
  gamma_presentation_url?: string | null;
};

type DiagRow = {
  id: string;
  created_at: string;
  email: string | null;
  web_url: string | null;
  name: string | null;
  workflow_status: string | null;
  payment_status: string | null;
  short_code: string | null;
  scan_result?: ScanResult | null;
  manual_input?: string | null;
};

export default function AdminDashboard() {
  const [rows, setRows] = useState<DiagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editName, setEditName] = useState("");
  const [editManualInput, setEditManualInput] = useState("");
  const [editInternalNotes, setEditInternalNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [strategistLoading, setStrategistLoading] = useState(false);
  const [strategistId, setStrategistId] = useState("the_architect");
  const [strategyName, setStrategyName] = useState("");
  const [saveStrategyLoading, setSaveStrategyLoading] = useState(false);
  const [accordion, setAccordion] = useState<Record<string, boolean>>({
    prevest: true,
    akce: true,
    info: true,
    rozbor: true,
    zdroje: true,
    poznamky: true,
    strategie: true,
  });
  const [gammaStatus, setGammaStatus] = useState<"idle" | "loading" | "done" | "manual">("idle");
  const [gammaResult, setGammaResult] = useState<Record<string, unknown> | null>(null);
  const [notebookStatus, setNotebookStatus] = useState<"idle" | "loading" | "done">("idle");
  const [notebookResult, setNotebookResult] = useState<Record<string, unknown> | null>(null);
  const router = useRouter();

  function toggleAccordion(id: string) {
    setAccordion((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  useEffect(() => {
    fetch("/api/admin/data")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (d.error) {
          setError(d.error);
          setLoading(false);
          return;
        }
        setRows(d.rows ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Chyba načítania");
        setLoading(false);
      });
  }, [router]);

  async function handleDelete(id: string) {
    if (!confirm("Zmazať tento záznam?")) return;
    await fetch(`/api/admin/data?id=${id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusLabel(s: string | null) {
    if (!s) return "Nový";
    if (s.includes("NEREALIZOVAN")) return "Předání kurátorovi";
    if (s.includes("REALIZOVAN") || s.includes("SENT")) return "Diagnostika";
    return s;
  }

  function statusColor(s: string | null) {
    if (!s) return "#555";
    if (s === "paid") return "#A8EB12";
    if (s.includes("SENT") || s.includes("DELIVERED")) return "#4ea8de";
    return "#888";
  }

  const filtered = search.trim()
    ? rows.filter(
        (r) =>
          (r.email?.toLowerCase().includes(search.toLowerCase()) ||
            r.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.web_url?.toLowerCase().includes(search.toLowerCase()) ||
            (r.scan_result as ScanResult)?.brandDna?.name?.toLowerCase().includes(search.toLowerCase()))
      )
    : rows;

  const selected = selectedId ? rows.find((r) => r.id === selectedId) : null;

  // Sync edit fields when selection changes
  useEffect(() => {
    if (selected) {
      setEditName(selected.name ?? "");
      setEditManualInput(selected.manual_input ?? "");
      setEditInternalNotes((selected.scan_result as ScanResult)?.admin_notes ?? "");
    }
  }, [selected?.id]);

  async function saveDetail() {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/diagnostika/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() || null, manual_input: editManualInput.trim() || null, internal_notes: editInternalNotes.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba");
      setRows((prev) =>
        prev.map((r) =>
          r.id !== selectedId
            ? r
            : {
                ...r,
                name: data.project?.name ?? r.name,
                manual_input: data.project?.manual_input ?? r.manual_input,
                scan_result: {
                  ...(r.scan_result ?? {}),
                  admin_notes: data.project?.internal_notes ?? (r.scan_result as ScanResult)?.admin_notes,
                } as ScanResult,
              }
        )
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Nepodařilo se uložit");
    } finally {
      setSaving(false);
    }
  }

  async function runStrategist() {
    if (!selectedId) return;
    setStrategistLoading(true);
    try {
      const res = await fetch(`/api/admin/diagnostika/${selectedId}/run-strategist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategistId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba");
      setRows((prev) =>
        prev.map((r) =>
          r.id !== selectedId
            ? r
            : { ...r, scan_result: { ...(r.scan_result ?? {}), strategic_plan: data.output } as ScanResult }
        )
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Nepodařilo se spustit stratega");
    } finally {
      setStrategistLoading(false);
    }
  }

  async function saveStrategy() {
    if (!selectedId || !strategyName.trim()) return;
    setSaveStrategyLoading(true);
    try {
      const res = await fetch(`/api/admin/diagnostika/${selectedId}/save-strategy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: strategyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba");
      const list = (selected?.scan_result as ScanResult)?.saved_strategies ?? [];
      const added = data.strategy as SavedStrategy;
      const nextList = added ? [...list, added] : list;
      setRows((prev) =>
        prev.map((r) =>
          r.id !== selectedId ? r : { ...r, scan_result: { ...(r.scan_result ?? {}), saved_strategies: nextList } as ScanResult }
        )
      );
      setStrategyName("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Nepodařilo se uložit strategii");
    } finally {
      setSaveStrategyLoading(false);
    }
  }

  async function setActiveStrategy(strategyId: string | null) {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/admin/diagnostika/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active_strategy_id: strategyId ?? null }),
      });
      if (!res.ok) throw new Error("Nepodařilo se nastavit strategii");
      setRows((prev) =>
        prev.map((r) =>
          r.id !== selectedId ? r : { ...r, scan_result: { ...(r.scan_result ?? {}), active_strategy_id: strategyId ?? null } as ScanResult }
        )
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Chyba");
    }
  }

  const [activeTab, setActiveTab] = useState<"prehled" | "diagnostika" | "strategie" | "vystup" | "poznamky">("prehled");
  const scoreColor = (s: number) => (s >= 8 ? "#22c55e" : s >= 6 ? "#f59e0b" : s >= 4 ? "#f97316" : "#ef4444");
  const scoreLabel = (s: number) => (s >= 8 ? "Silné" : s >= 6 ? "Dobré" : s >= 4 ? "Slabé" : "Kritické");
  const PILLARS = [
    { id: "light", label: "Světlo", icon: "💡" },
    { id: "energy", label: "Energie", icon: "⚡" },
    { id: "architecture", label: "Architektura", icon: "🏗️" },
    { id: "identity", label: "Identita", icon: "🎯" },
    { id: "trust", label: "Důvěra", icon: "🤝" },
  ];

  return (
    <div style={{ display: "flex", flex: 1, minHeight: "100vh", minWidth: 0, flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "0 24px", display: "flex", alignItems: "center", gap: 16, height: 52, background: "#0d0d0d", flexShrink: 0 }}>
        <div style={{ color: "#c8ff00", fontWeight: 700, fontSize: 15, letterSpacing: "0.05em" }}>◈ LUCIFERA</div>
        <div style={{ width: 1, height: 20, background: "#222" }} />
        <div style={{ fontSize: 12, color: "#555", letterSpacing: "0.08em" }}>ADMIN</div>
        <div style={{ flex: 1 }} />
        {error && <span style={{ fontSize: 12, color: "#f97316" }}>{error}</span>}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left sidebar — klienti */}
        <div style={{ width: 260, borderRight: "1px solid #1a1a1a", background: "#0d0d0d", padding: "16px 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0 16px 12px", fontSize: 11, color: "#444", letterSpacing: "0.1em" }}>KLIENTI · {rows.length}</div>
          <button
            type="button"
            onClick={() => { setLoading(true); fetch("/api/admin/data").then((r) => r.json()).then((d) => { setRows(d.rows ?? []); setError(d.error ?? ""); setLoading(false); }); }}
            style={{ margin: "0 12px 12px", padding: "8px 12px", borderRadius: 8, border: "1px solid #333", background: "#111", color: "#888", fontSize: 12, cursor: "pointer" }}
          >
            ↻ Obnovit
          </button>
          <input
            type="text"
            placeholder="Hledat klienta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ margin: "0 12px 12px", padding: "10px 12px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, boxSizing: "border-box" }}
          />
          <div style={{ flex: 1, overflow: "auto", padding: "0 8px" }}>
            {loading && <div style={{ color: "#666", padding: 24, textAlign: "center", fontSize: 13 }}>Načítávám…</div>}
            {!loading && filtered.length === 0 && (
              <div style={{ color: "#555", padding: 24, textAlign: "center", fontSize: 13 }}>
                Žádné záznamy. <a href="/diagnostika" style={{ color: "#A8EB12" }}>+ Nová diagnostika</a>
              </div>
            )}
            {!loading && filtered.map((row) => (
              <div
                key={row.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(row.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedId(row.id)}
                style={{
                  margin: "0 0 6px",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: selectedId === row.id ? "#151515" : "transparent",
                  border: selectedId === row.id ? "1px solid #c8ff00" : "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: selectedId === row.id ? "#fff" : "#888", marginBottom: 3 }}>{row.name || row.email || "—"}</div>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>{(row.scan_result as ScanResult)?.brandDna?.name || formatDate(row.created_at).split(" ")[0]}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 600, color: statusColor(row.workflow_status), background: "#1a1a1a", border: `1px solid ${statusColor(row.workflow_status)}44` }}>{statusLabel(row.workflow_status)}</span>
                  <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 600, color: "#6b7280", background: "#1a1a1a" }}>{(row.scan_result as ScanResult)?.brandScore?.total ?? "—"}/100</span>
                </div>
              </div>
            ))}
          </div>
          <a href="/diagnostika" style={{ margin: "12px 12px 0", padding: "8px 12px", borderRadius: 8, border: "1px dashed #222", fontSize: 12, color: "#444", textAlign: "center", display: "block", textDecoration: "none" }}>+ Nová diagnostika</a>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px", background: "#0a0a0a" }}>
          {!selected ? (
            <div style={{ color: "#555", padding: 48, textAlign: "center", fontSize: 15 }}>Vyberte záznam v seznamu vlevo.</div>
          ) : (
            <>
              {/* Client header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #1a2a1a, #0d1f0d)", border: "1px solid #2a4a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {(selected.name || selected.email || "?").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff" }}>{selected.name || selected.email || "—"}</h1>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, color: statusColor(selected.workflow_status), background: "#1a1a1a", border: `1px solid ${statusColor(selected.workflow_status)}44` }}>{statusLabel(selected.workflow_status)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(selected.scan_result as ScanResult)?.brandDna?.contentPillars?.map((t) => (
                      <span key={t} style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 600, color: "#4a9eff", background: "#0d1525", border: "1px solid #4a9eff22" }}>#{t}</span>
                    )) ?? null}
                    <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, color: "#555" }}>{formatDate(selected.created_at)}</span>
                  </div>
                </div>
                <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
                  <svg width="60" height="60" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="30" cy="30" r={22} fill="none" stroke="#1a1a1a" strokeWidth="4" />
                    <circle cx="30" cy="30" r={22} fill="none" stroke={((selected.scan_result as ScanResult)?.brandScore?.total ?? 0) >= 70 ? "#22c55e" : ((selected.scan_result as ScanResult)?.brandScore?.total ?? 0) >= 50 ? "#f59e0b" : "#ef4444"} strokeWidth="4" strokeDasharray={`${(((selected.scan_result as ScanResult)?.brandScore?.total ?? 0) / 100) * 2 * Math.PI * 22} ${2 * Math.PI * 22}`} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e5e5", lineHeight: 1 }}>{(selected.scan_result as ScanResult)?.brandScore?.total ?? "—"}</div>
                    <div style={{ fontSize: 9, color: "#555" }}>skóre</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "#111", borderRadius: 10, padding: 4 }}>
                {(["prehled", "diagnostika", "strategie", "vystup", "poznamky"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      padding: "7px 12px",
                      borderRadius: 7,
                      border: "none",
                      background: activeTab === tab ? "#1e1e1e" : "transparent",
                      color: activeTab === tab ? "#fff" : "#555",
                      fontSize: 12,
                      fontWeight: activeTab === tab ? 600 : 400,
                      cursor: "pointer",
                      borderBottom: activeTab === tab ? "2px solid #c8ff00" : "2px solid transparent",
                    }}
                  >
                    {tab === "prehled" && "📊 Přehled"}
                    {tab === "diagnostika" && "🔬 Diagnostika"}
                    {tab === "strategie" && "🧠 Strategie"}
                    {tab === "vystup" && "🎨 Výstup"}
                    {tab === "poznamky" && "📝 Poznámky"}
                  </button>
                ))}
              </div>

              {/* Tab: PŘEHLED */}
              {activeTab === "prehled" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {(selected.scan_result as ScanResult)?.suggested_strategists?.length ? (
                    <div style={{ borderRadius: 12, border: "1px solid #1a1a1a", overflow: "hidden" }}>
                      <div style={{ padding: "10px 16px", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 3, height: 14, borderRadius: 2, background: "#c8ff00" }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#bbb", letterSpacing: "0.05em" }}>🤖 AI doporučuje pro tuto značku</span>
                      </div>
                      <div style={{ padding: 16, background: "#0a0a0a", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {(selected.scan_result as ScanResult).suggested_strategists!.map((s) => (
                          <div key={s.id} style={{ padding: 14, borderRadius: 10, background: "#0d0d0d", border: "1px solid #1e1e1e", position: "relative" }}>
                            <div style={{ position: "absolute", top: 0, right: 0, background: "#c8ff00", color: "#000", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderBottomLeftRadius: 8 }}>{s.fit_score ?? 0}% shoda</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4, paddingRight: 60 }}>{s.label}</div>
                            <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{s.reason ?? ""}</div>
                            <button type="button" onClick={() => setStrategistId(s.id)} style={{ marginTop: 10, padding: "4px 12px", borderRadius: 6, border: "1px solid #333", background: "transparent", color: "#aaa", fontSize: 11, cursor: "pointer" }}>Spustit →</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div style={{ borderRadius: 12, border: "1px solid #1a1a1a", overflow: "hidden" }}>
                    <div style={{ padding: "10px 16px", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 3, height: 14, borderRadius: 2, background: "#4a9eff" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#bbb", letterSpacing: "0.05em" }}>📐 Pilíře značky</span>
                    </div>
                    <div style={{ padding: 16, background: "#0a0a0a", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                      {PILLARS.map((p) => {
                        const val = (selected.scan_result as ScanResult)?.pillarAnalysis?.[p.id];
                        const score = typeof val?.score === "number" ? val.score : 5;
                        const col = scoreColor(score);
                        return (
                          <div key={p.id} style={{ padding: "12px 10px", borderRadius: 10, background: "#0d0d0d", border: `1px solid ${col}33`, textAlign: "center" }}>
                            <div style={{ fontSize: 20, marginBottom: 4 }}>{p.icon}</div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>{p.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: col, marginBottom: 4 }}>{score}</div>
                            <div style={{ height: 3, borderRadius: 2, background: "#1a1a1a", overflow: "hidden", marginBottom: 6 }}><div style={{ height: "100%", width: `${score * 10}%`, background: col }} /></div>
                            <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 600, color: col, background: "#111", border: `1px solid ${col}22` }}>{scoreLabel(score)}</span>
                            <div style={{ fontSize: 10, color: "#555", marginTop: 6, lineHeight: 1.3 }}>{(val as { interpretation?: string })?.interpretation?.slice(0, 50) ?? "—"}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ borderRadius: 12, border: "1px solid #1a1a1a", overflow: "hidden" }}>
                    <div style={{ padding: "10px 16px", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 3, height: 14, borderRadius: 2, background: "#a855f7" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#bbb", letterSpacing: "0.05em" }}>🧬 Brand DNA</span>
                    </div>
                    <div style={{ padding: 16, background: "#0a0a0a", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {["positioning", "tone", "uniqueValue", "targetAudience"].map((key) => {
                        const labels: Record<string, string> = { positioning: "Positioning", tone: "Tón komunikace", uniqueValue: "Jedinečná hodnota", targetAudience: "Cílová skupina" };
                        const val = (selected.scan_result as ScanResult)?.brandDna?.[key as keyof NonNullable<ScanResult["brandDna"]>];
                        return (
                          <div key={key} style={{ padding: "10px 14px", borderRadius: 8, background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
                            <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.08em", marginBottom: 4 }}>{labels[key]}</div>
                            <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.4 }}>{typeof val === "string" ? val : "—"}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: DIAGNOSTIKA */}
              {activeTab === "diagnostika" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ borderRadius: 12, border: "1px solid #1a1a1a", overflow: "hidden" }}>
                    <div style={{ padding: "10px 16px", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}><div style={{ width: 3, height: 14, borderRadius: 2, background: "#4a9eff", display: "inline-block", marginRight: 8 }} /><span style={{ fontSize: 12, fontWeight: 600, color: "#bbb" }}>📊 Skóre pilířů</span></div>
                    <div style={{ padding: 16, background: "#0a0a0a", display: "flex", flexDirection: "column", gap: 8 }}>
                      {PILLARS.map((p) => {
                        const val = (selected.scan_result as ScanResult)?.pillarAnalysis?.[p.id];
                        const score = typeof val?.score === "number" ? val.score : 5;
                        const col = scoreColor(score);
                        return (
                          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 100, fontSize: 12, color: "#888" }}>{p.icon} {p.label}</div>
                            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#1a1a1a", overflow: "hidden" }}><div style={{ height: "100%", width: `${score * 10}%`, background: col, borderRadius: 4 }} /></div>
                            <div style={{ width: 24, fontSize: 13, fontWeight: 700, color: col, textAlign: "right" }}>{score}</div>
                            <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 600, color: col, background: "#111" }}>{scoreLabel(score)}</span>
                            <div style={{ fontSize: 11, color: "#555", flex: 1 }}>{(val as { interpretation?: string })?.interpretation ?? "—"}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {(selected.scan_result as ScanResult)?.summary && (
                    <div style={{ padding: 16, borderRadius: 10, border: "1px solid #1e1e1e", background: "#0d0d0d" }}>
                      <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Shrnutí</div>
                      <p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{(selected.scan_result as ScanResult).summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: STRATEGIE */}
              {activeTab === "strategie" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {(selected.scan_result as ScanResult)?.suggested_strategists?.length ? (
                    <div style={{ marginBottom: 12, padding: 12, background: "#0d1f0d", border: "1px solid #1a3d1a", borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#6b8f6b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>AI doporučuje</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{(selected.scan_result as ScanResult).suggested_strategists!.map((s) => (
                        <button key={s.id} type="button" onClick={() => setStrategistId(s.id)} style={{ padding: "8px 12px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 12, cursor: "pointer" }}><span style={{ fontWeight: 600 }}>{s.label}</span> <span style={{ marginLeft: 6, color: "#888" }}>→ Vybrat</span></button>
                      ))}</div>
                    </div>
                  ) : null}
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <select value={strategistId} onChange={(e) => setStrategistId(e.target.value)} style={{ padding: "8px 12px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, minWidth: 200 }}>
                      {STRATEGISTS_META.map((s) => <option key={s.id} value={s.id}>{s.label} — {s.tagline}</option>)}
                    </select>
                    <button type="button" onClick={runStrategist} disabled={strategistLoading} style={{ padding: "10px 18px", background: "#A8EB12", color: "#000", border: "none", borderRadius: 8, cursor: strategistLoading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13 }}>{strategistLoading ? "Generuji…" : "Spustit stratega"}</button>
                  </div>
                  {(selected.scan_result as ScanResult)?.strategic_plan != null && (
                    <>
                      <StrategicPlanRenderer plan={(selected.scan_result as ScanResult).strategic_plan!} />
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
                        <input type="text" value={strategyName} onChange={(e) => setStrategyName(e.target.value)} placeholder="Název strategie" style={{ padding: "8px 12px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, minWidth: 180 }} />
                        <button type="button" onClick={saveStrategy} disabled={saveStrategyLoading || !strategyName.trim()} style={{ padding: "8px 16px", background: "#333", color: "#fff", border: "none", borderRadius: 8, cursor: saveStrategyLoading || !strategyName.trim() ? "not-allowed" : "pointer", fontSize: 13 }}>{saveStrategyLoading ? "Ukládám…" : "Uložit jako strategii"}</button>
                      </div>
                    </>
                  )}
                  {((selected.scan_result as ScanResult)?.saved_strategies?.length ?? 0) > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Uložené strategie</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{(selected.scan_result as ScanResult).saved_strategies!.map((s) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 12px", background: "#111", border: "1px solid #222", borderRadius: 8, borderLeft: (selected.scan_result as ScanResult)?.active_strategy_id === s.id ? "4px solid #A8EB12" : "4px solid transparent" }}>
                          <div><span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span> <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>{new Date(s.created_at).toLocaleDateString("cs-CZ")}</span></div>
                          <button type="button" onClick={() => setActiveStrategy((selected.scan_result as ScanResult)?.active_strategy_id === s.id ? null : s.id)} style={{ padding: "6px 12px", background: (selected.scan_result as ScanResult)?.active_strategy_id === s.id ? "#333" : "#A8EB12", color: (selected.scan_result as ScanResult)?.active_strategy_id === s.id ? "#888" : "#000", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{(selected.scan_result as ScanResult)?.active_strategy_id === s.id ? "Zrušit" : "Použít pro příspěvky"}</button>
                        </div>
                      ))}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: VÝSTUP */}
              {activeTab === "vystup" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ padding: 16, borderRadius: 10, border: "1px solid #1e1e1e", background: "#0d0d0d", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 28 }}>🎨</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>Gamma prezentace</div><div style={{ fontSize: 12, color: "#666" }}>Prezentace strategie — PDF + sdílený odkaz</div></div>
                    {(selected.scan_result as ScanResult)?.gamma_presentation_url ? (
                      <a href={(selected.scan_result as ScanResult).gamma_presentation_url!} target="_blank" rel="noreferrer" style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#c8ff00", color: "#000", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>Otevřít →</a>
                    ) : (
                      <button type="button" onClick={async () => { if (!selected.id) return; setGammaStatus("loading"); setGammaResult(null); try { const res = await fetch(`/api/admin/diagnostika/${selected.id}/generate-presentation`, { method: "POST" }); const data = await res.json(); setGammaResult(data); setGammaStatus(data.mode === "api" ? "done" : "manual"); if (data.mode === "api" && data.gammaUrl) setRows((prev) => prev.map((r) => r.id !== selected.id ? r : { ...r, scan_result: { ...(r.scan_result ?? {}), gamma_presentation_url: data.gammaUrl } as ScanResult })); } catch { setGammaStatus("idle"); } }} disabled={!(selected.scan_result as ScanResult)?.strategic_plan || gammaStatus === "loading"} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#c8ff00", color: "#000", fontWeight: 700, fontSize: 12, cursor: (selected.scan_result as ScanResult)?.strategic_plan && gammaStatus !== "loading" ? "pointer" : "not-allowed", opacity: (selected.scan_result as ScanResult)?.strategic_plan && gammaStatus !== "loading" ? 1 : 0.5 }}>{gammaStatus === "loading" ? "Generuji…" : "Generovat →"}</button>
                    )}
                  </div>
                  {gammaStatus === "manual" && gammaResult && (gammaResult.gamma as { gammaInputText?: string })?.gammaInputText && (
                    <div style={{ padding: 12, background: "#1a1a1a", borderRadius: 8, fontSize: 12, color: "#ccc" }}><div style={{ fontWeight: 600, color: "#d4a800", marginBottom: 6 }}>✋ Ruční export</div><p style={{ margin: "0 0 8px 0" }}>{(gammaResult.gamma as { instruction?: string }).instruction}</p><button type="button" onClick={() => navigator.clipboard.writeText((gammaResult.gamma as { gammaInputText?: string }).gammaInputText ?? "")} style={{ background: "#333", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Kopírovat obsah pro Gamma →</button></div>
                  )}
                  <div style={{ padding: 16, borderRadius: 10, border: "1px solid #1e1e1e", background: "#0d0d0d", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 28 }}>🎧</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>NotebookLM průvodce</div><div style={{ fontSize: 12, color: "#666" }}>Audio přehled + AI chat pro klienta</div></div>
                    <button type="button" onClick={async () => { if (!selected.id) return; setNotebookStatus("loading"); setNotebookResult(null); try { const res = await fetch(`/api/admin/diagnostika/${selected.id}/export-notebooklm`, { method: "POST" }); const data = await res.json(); setNotebookResult(data); setNotebookStatus("done"); } catch { setNotebookStatus("idle"); } }} disabled={!(selected.scan_result as ScanResult)?.strategic_plan || notebookStatus === "loading"} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#4a9eff", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{notebookStatus === "loading" ? "Připravuji…" : "Připravit →"}</button>
                  </div>
                  {notebookStatus === "done" && notebookResult && Array.isArray(notebookResult.sources) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{(notebookResult.sources as Array<{ order?: number; title?: string; content?: string }>).map((s) => (
                      <div key={s.order ?? 0} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 8, background: "#1a1a1a", borderRadius: 6 }}><span style={{ fontSize: 12, color: "#ccc" }}>{s.order}. {s.title}</span><button type="button" onClick={() => navigator.clipboard.writeText(s.content ?? "")} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer" }}>Kopírovat</button></div>
                    ))}</div>
                  )}
                </div>
              )}

              {/* Tab: POZNÁMKY */}
              {activeTab === "poznamky" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ borderRadius: 12, border: "1px solid #1a1a1a", overflow: "hidden" }}>
                    <div style={{ padding: "10px 16px", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}><div style={{ width: 3, height: 14, borderRadius: 2, background: "#f59e0b", display: "inline-block", marginRight: 8 }} /><span style={{ fontSize: 12, fontWeight: 600, color: "#bbb" }}>📝 Interní poznámky a podklady</span></div>
                    <div style={{ padding: 16, background: "#0a0a0a" }}>
                      <div style={{ marginBottom: 12, fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>Název klienta</div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Jméno nebo název projektu" style={{ flex: "1 1 200px", padding: "10px 14px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
                        <button type="button" onClick={saveDetail} disabled={saving} style={{ padding: "10px 18px", background: "#A8EB12", color: "#000", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13 }}>{saving ? "Ukládám…" : "Uložit"}</button>
                      </div>
                      <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Interní poznámky</div>
                      <textarea value={editInternalNotes} onChange={(e) => setEditInternalNotes(e.target.value)} placeholder="Poznámky kurátora…" rows={3} style={{ width: "100%", padding: "12px 14px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14, boxSizing: "border-box", resize: "vertical", marginBottom: 12 }} />
                      <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Podklady (manual_input)</div>
                      <textarea value={editManualInput} onChange={(e) => setEditManualInput(e.target.value)} placeholder="Text zadaný klientem…" rows={4} style={{ width: "100%", padding: "12px 14px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14, boxSizing: "border-box", resize: "vertical", marginBottom: 12 }} />
                      <button type="button" onClick={saveDetail} disabled={saving} style={{ padding: "8px 16px", background: "#333", color: "#fff", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontSize: 13 }}>{saving ? "Ukládám…" : "Uložit poznámky a podklady"}</button>
                    </div>
                  </div>
                  <div style={{ padding: 16, borderRadius: 10, border: "1px solid #1e1e1e", background: "#0d0d0d" }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Převést na zakázku</div>
                    {selected.short_code ? <a href={`/d/${selected.short_code}`} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 20px", background: "#A8EB12", color: "#000", fontWeight: 600, borderRadius: 8, textDecoration: "none", fontSize: 14, display: "inline-block" }}>Otevřít detail</a> : <span style={{ fontSize: 13, color: "#666" }}>Odkaz není k dispozici</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, fontSize: 13, color: "#888" }}>Vytvořeno {formatDate(selected.created_at)} · {selected.email ?? "—"} · {selected.workflow_status ?? "—"} · {selected.payment_status ?? "—"}</div>
                    <button type="button" onClick={() => selectedId && handleDelete(selectedId)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,68,68,0.5)", color: "#ff4444", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Smazat</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
