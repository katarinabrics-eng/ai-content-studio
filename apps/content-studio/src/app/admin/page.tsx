"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ScanResult = {
  brandScore?: { total?: number; hasHeadline?: boolean; hasOffer?: boolean; hasTargetAudience?: boolean; hasCTA?: boolean; hasVisualIdentity?: boolean; hasSocialProof?: boolean };
  brandDna?: { name?: string; positioning?: string; tone?: string; targetAudience?: string; communicationStyle?: string; uniqueValue?: string; contentPillars?: string[]; missingElements?: string[]; visualStyle?: { primaryColor?: string; secondaryColor?: string; mood?: string; typography?: string } };
  summary?: string;
  pillarAnalysis?: Record<string, { score?: number; interpretation?: string; observed?: string[]; notObserved?: string[]; reasoning?: string; strategicOpportunity?: string }>;
  admin_notes?: string | null;
  strategic_plan?: string | null;
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
  const [strategistId, setStrategistId] = useState("lucifera");
  const router = useRouter();

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

  const cardStyle = (id: string) => ({
    padding: "14px 16px",
    borderLeft: selectedId === id ? "4px solid #A8EB12" : "4px solid transparent",
    background: selectedId === id ? "rgba(168,235,18,0.06)" : "#111",
    border: "1px solid #222",
    borderRadius: 8,
    marginBottom: 8,
    cursor: "pointer" as const,
  });

  return (
    <div style={{ display: "flex", flex: 1, minHeight: "100vh", minWidth: 0 }}>
      {/* Střední sloupec – seznam */}
      <div
        style={{
          width: 360,
          minWidth: 360,
          borderRight: "1px solid #222",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          background: "#0d0d0d",
        }}
      >
        <h1 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 600 }}>KLIENTI</h1>
        <p style={{ margin: 0, fontSize: 13, color: "#666", marginBottom: 16 }}>
          {rows.length} celkem · {rows.length} diagnostik
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetch("/api/admin/data")
              .then((r) => r.json())
              .then((d) => {
                setRows(d.rows ?? []);
                setLoading(false);
              });
          }}
          style={{
            marginBottom: 16,
            padding: "8px 14px",
            background: "#1a1a1a",
            border: "1px solid #333",
            color: "#888",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ↻ Obnovit
        </button>
        <input
          type="text"
          placeholder="Hledat klienta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: 8,
            color: "#fff",
            fontSize: 14,
            marginBottom: 16,
            boxSizing: "border-box",
          }}
        />
        <div style={{ flex: 1, overflow: "auto" }}>
          {loading && (
            <div style={{ color: "#666", padding: 24, textAlign: "center" }}>Načítávám...</div>
          )}
          {error && (
            <div style={{ color: "#ff4444", padding: 12, fontSize: 14 }}>{error}</div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ color: "#555", padding: 24, textAlign: "center", fontSize: 14 }}>
              Žádné záznamy.{" "}
              <a href="/diagnostika" style={{ color: "#A8EB12" }}>
                + Nová diagnostika
              </a>
            </div>
          )}
          {!loading &&
            filtered.map((row) => (
              <div
                key={row.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(row.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedId(row.id)}
                style={cardStyle(row.id)}
              >
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  {row.name || row.email || "—"}
                </div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                  {(row.scan_result as ScanResult)?.brandDna?.name || `Diagnostika ${formatDate(row.created_at).split(" ")[0]}`}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span
                    style={{
                      background: "#1a1a1a",
                      border: `1px solid ${statusColor(row.workflow_status)}`,
                      color: statusColor(row.workflow_status),
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  >
                    {statusLabel(row.workflow_status)}
                  </span>
                </div>
              </div>
            ))}
        </div>
        <a
          href="/diagnostika"
          style={{
            display: "block",
            marginTop: 16,
            color: "#A8EB12",
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          + Nová diagnostika
        </a>
      </div>

      {/* Pravý sloupec – detail */}
      <div
        style={{
          flex: 1,
          padding: 24,
          overflow: "auto",
          background: "#0a0a0a",
        }}
      >
        {!selected ? (
          <div
            style={{
              color: "#555",
              padding: 48,
              textAlign: "center",
              fontSize: 15,
            }}
          >
            Vyberte záznam v seznamu vlevo.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                {(selected.scan_result as ScanResult)?.brandDna?.name || "Diagnostika"} · {selected.name || selected.email || "—"}
              </div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>
                Diagnostika {formatDate(selected.created_at)}
              </h2>
            </div>

            {/* Název klienta + uložit */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Název klienta</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Jméno nebo název projektu"
                  style={{
                    flex: "1 1 200px",
                    padding: "10px 14px",
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={saveDetail}
                  disabled={saving}
                  style={{
                    padding: "10px 18px",
                    background: "#A8EB12",
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    cursor: saving ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {saving ? "Ukládám…" : "Uložit"}
                </button>
              </div>
            </div>

            <div
              style={{
                background: "rgba(168,235,18,0.1)",
                border: "1px solid rgba(168,235,18,0.3)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Převést na zakázku</div>
                <div style={{ fontSize: 13, color: "#888" }}>
                  Po konzultaci, když klientka nastoupí do spolupráce, nebo když si předplatí službu Content Studio Lucifera.
                </div>
              </div>
              {selected.short_code ? (
                <a
                  href={`/d/${selected.short_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "10px 20px",
                    background: "#A8EB12",
                    color: "#000",
                    fontWeight: 600,
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  Otevřít detail
                </a>
              ) : (
                <span style={{ fontSize: 13, color: "#666" }}>Odkaz není k dispozici</span>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Akce</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => selectedId && handleDelete(selectedId)}
                  style={{
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid rgba(255,68,68,0.5)",
                    color: "#ff4444",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Smazat
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Info</div>
              <div
                style={{
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: "#666", fontSize: 12 }}>Vytvořeno </span>
                  <span style={{ fontSize: 14 }}>{formatDate(selected.created_at)}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: "#666", fontSize: 12 }}>Email </span>
                  <span style={{ fontSize: 14 }}>{selected.email || "—"}</span>
                </div>
                {selected.web_url && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ color: "#666", fontSize: 12 }}>Web </span>
                    <span style={{ fontSize: 14 }}>{selected.web_url}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: "#666", fontSize: 12 }}>Status </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: statusColor(selected.workflow_status),
                      marginLeft: 4,
                    }}
                  >
                    {selected.workflow_status || "—"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#666", fontSize: 12 }}>Platba </span>
                  <span style={{ fontSize: 14, color: statusColor(selected.payment_status) }}>
                    {selected.payment_status || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Rozbor diagnostiky */}
            {(selected.scan_result as ScanResult) && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Rozbor</div>
                <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 16 }}>
                  {(selected.scan_result as ScanResult).summary && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>Shrnutí</div>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#ccc" }}>{(selected.scan_result as ScanResult).summary}</p>
                    </div>
                  )}
                  {(selected.scan_result as ScanResult).brandDna && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ color: "#888", fontSize: 11, marginBottom: 6 }}>Brand DNA</div>
                      <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6 }}>
                        {[
                          ["Značka", (selected.scan_result as ScanResult).brandDna?.name],
                          ["Positioning", (selected.scan_result as ScanResult).brandDna?.positioning],
                          ["Tón", (selected.scan_result as ScanResult).brandDna?.tone],
                          ["Cílová skupina", (selected.scan_result as ScanResult).brandDna?.targetAudience],
                          ["Komunikační styl", (selected.scan_result as ScanResult).brandDna?.communicationStyle],
                          ["Unikátní hodnota", (selected.scan_result as ScanResult).brandDna?.uniqueValue],
                        ].map(
                          ([label, val]) =>
                            val && (
                              <div key={label} style={{ marginBottom: 4 }}>
                                <span style={{ color: "#666" }}>{label}: </span>
                                {val}
                              </div>
                            )
                        )}
                        {(selected.scan_result as ScanResult).brandDna?.contentPillars?.length ? (
                          <div style={{ marginTop: 4 }}>
                            <span style={{ color: "#666" }}>Pilíře: </span>
                            {(selected.scan_result as ScanResult).brandDna?.contentPillars?.join(", ")}
                          </div>
                        ) : null}
                        {(selected.scan_result as ScanResult).brandDna?.visualStyle && (
                          <div style={{ marginTop: 4 }}>
                            <span style={{ color: "#666" }}>Vizuál: </span>
                            {[(selected.scan_result as ScanResult).brandDna?.visualStyle?.primaryColor, (selected.scan_result as ScanResult).brandDna?.visualStyle?.mood, (selected.scan_result as ScanResult).brandDna?.visualStyle?.typography].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {(selected.scan_result as ScanResult).brandScore && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>Skóre</div>
                      <div style={{ fontSize: 13, color: "#bbb" }}>
                        Celkem: {(selected.scan_result as ScanResult).brandScore?.total ?? "—"}
                        {" · "}
                        Hlavní zpráva: {(selected.scan_result as ScanResult).brandScore?.hasHeadline ? "ano" : "ne"}
                        {" · "}
                        Nabídka: {(selected.scan_result as ScanResult).brandScore?.hasOffer ? "ano" : "ne"}
                        {" · "}
                        CTA: {(selected.scan_result as ScanResult).brandScore?.hasCTA ? "ano" : "ne"}
                      </div>
                    </div>
                  )}
                  {(selected.scan_result as ScanResult).pillarAnalysis && Object.keys((selected.scan_result as ScanResult).pillarAnalysis ?? {}).length > 0 && (
                    <div>
                      <div style={{ color: "#888", fontSize: 11, marginBottom: 6 }}>Pilíře analýzy</div>
                      {Object.entries((selected.scan_result as ScanResult).pillarAnalysis ?? {}).map(([key, p]) =>
                        p && typeof p === "object" ? (
                          <div key={key} style={{ marginBottom: 8, fontSize: 13, color: "#bbb" }}>
                            <strong style={{ color: "#888" }}>{key}:</strong> {(p as { interpretation?: string }).interpretation}
                            {(p as { strategicOpportunity?: string }).strategicOpportunity && (
                              <div style={{ marginTop: 2, color: "#A8EB12", fontSize: 12 }}>→ {(p as { strategicOpportunity?: string }).strategicOpportunity}</div>
                            )}
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Zdrojové podklady */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Zdrojové podklady</div>
              <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 12 }}>
                {selected.web_url && <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>Web: {selected.web_url}</div>}
                <div style={{ fontSize: 13, color: "#bbb", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selected.manual_input || "—"}</div>
              </div>
            </div>

            {/* Interní poznámky + úprava podkladů */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Interní poznámky</div>
              <textarea
                value={editInternalNotes}
                onChange={(e) => setEditInternalNotes(e.target.value)}
                placeholder="Poznámky kurátora…"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#111",
                  border: "1px solid #333",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 12, marginBottom: 8 }}>Podklady (manual_input)</div>
              <textarea
                value={editManualInput}
                onChange={(e) => setEditManualInput(e.target.value)}
                placeholder="Text zadaný klientem…"
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#111",
                  border: "1px solid #333",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
              <button type="button" onClick={saveDetail} disabled={saving} style={{ marginTop: 8, padding: "8px 16px", background: "#333", color: "#fff", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontSize: 13 }}>
                {saving ? "Ukládám…" : "Uložit poznámky a podklady"}
              </button>
            </div>

            {/* Strategický plán */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Strategický plán</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                <select
                  value={strategistId}
                  onChange={(e) => setStrategistId(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 13,
                  }}
                >
                  <option value="lucifera">Lucifera (8dílný plán)</option>
                  <option value="hormozi">Alex Hormozi</option>
                  <option value="garyvee">Gary Vee</option>
                  <option value="tonyrobbins">Tony Robbins</option>
                  <option value="donaldmiller">Donald Miller</option>
                  <option value="sigrun">Sigrun</option>
                  <option value="trend2026">Trend 2026</option>
                </select>
                <button
                  type="button"
                  onClick={runStrategist}
                  disabled={strategistLoading}
                  style={{
                    padding: "10px 18px",
                    background: "#A8EB12",
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    cursor: strategistLoading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {strategistLoading ? "Generuji…" : "Spustit stratega"}
                </button>
              </div>
              {(selected.scan_result as ScanResult)?.strategic_plan && (
                <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 16, maxHeight: 400, overflow: "auto" }}>
                  <pre style={{ margin: 0, fontSize: 13, color: "#bbb", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{(selected.scan_result as ScanResult).strategic_plan}</pre>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
