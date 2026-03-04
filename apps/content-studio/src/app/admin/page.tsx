"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DiagRow = {
  id: string;
  created_at: string;
  email: string | null;
  web_url: string | null;
  name: string | null;
  workflow_status: string | null;
  payment_status: string | null;
};

export default function AdminDashboard() {
  const [rows, setRows] = useState<DiagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/data")
      .then(r => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        if (d.error) { setError(d.error); setLoading(false); return; }
        setRows(d.rows ?? []);
        setLoading(false);
      })
      .catch(() => { setError("Chyba načítania"); setLoading(false); });
  }, [router]);

  async function handleDelete(id: string) {
    if (!confirm("Zmazať tento záznam?")) return;
    await fetch(`/api/admin/data?id=${id}`, { method: "DELETE" });
    setRows(prev => prev.filter(r => r.id !== id));
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function statusColor(s: string | null) {
    if (!s) return "#555";
    if (s === "paid") return "#A8EB12";
    if (s.includes("SENT") || s.includes("DELIVERED")) return "#4ea8de";
    return "#888";
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "16px 32px", display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#A8EB12" }}>Lucifera Admin</span>
        <a href="/diagnostika" style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>+ Nová diagnostika</a>
        <button
          onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); }}
          style={{ marginLeft: "auto", background: "none", border: "1px solid #333", color: "#666", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
        >
          Odhlásiť
        </button>
      </div>

      <div style={{ padding: "32px" }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Diagnostiky</h1>
          <span style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 20, padding: "2px 12px", fontSize: 13, color: "#888" }}>
            {rows.length} záznamov
          </span>
          <button
            onClick={() => { setLoading(true); fetch("/api/admin/data").then(r => r.json()).then(d => { setRows(d.rows ?? []); setLoading(false); }); }}
            style={{ background: "#1a1a1a", border: "1px solid #333", color: "#888", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
          >
            ↻ Obnoviť
          </button>
        </div>

        {loading && <div style={{ color: "#666", padding: 40, textAlign: "center" }}>Načítavam...</div>}
        {error && <div style={{ color: "#ff4444", padding: 20 }}>{error}</div>}

        {!loading && !error && rows.length === 0 && (
          <div style={{ color: "#555", padding: 60, textAlign: "center", border: "1px dashed #222", borderRadius: 12 }}>
            Žiadne záznamy. <a href="/diagnostika" style={{ color: "#A8EB12" }}>Spustiť novú diagnostiku →</a>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #222" }}>
                {["Dátum", "Email / Web", "Meno", "Status", "Platba", "Akcie"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: "#555", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: "1px solid #181818" }}>
                  <td style={{ padding: "14px 16px", color: "#888", fontSize: 13 }}>{formatDate(row.created_at)}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{row.email || "—"}</div>
                    {row.web_url && <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{row.web_url}</div>}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#aaa", fontSize: 14 }}>{row.name || "—"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: "#1a1a1a", border: `1px solid ${statusColor(row.workflow_status)}`, color: statusColor(row.workflow_status), padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>
                      {row.workflow_status || "nový"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ color: statusColor(row.payment_status), fontSize: 13 }}>
                      {row.payment_status || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => handleDelete(row.id)}
                      style={{ background: "none", border: "1px solid #ff444433", color: "#ff4444", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                    >
                      Zmazať
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
