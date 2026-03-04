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
  short_code: string | null;
};

export default function AdminDashboard() {
  const [rows, setRows] = useState<DiagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
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
            r.web_url?.toLowerCase().includes(search.toLowerCase()))
      )
    : rows;

  const selected = selectedId ? rows.find((r) => r.id === selectedId) : null;

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
                  {row.name || row.email || row.web_url || "—"}
                </div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                  Diagnostika {formatDate(row.created_at).split(" ")[0]}
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
                Diagnostika · {selected.name || selected.email || "—"}
              </div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>
                Diagnostika {formatDate(selected.created_at)}
              </h2>
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
          </>
        )}
      </div>
    </div>
  );
}
