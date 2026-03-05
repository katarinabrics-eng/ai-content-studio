"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, next: "/admin" }),
    });
    const data = await res.json();
    if (data.ok) {
      router.push("/admin");
    } else {
      setError("Nesprávne heslo");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 40, width: 360 }}>
        <img src="/placeholders/LUCIFERA-Logo-Left-Neg.webp" alt="Lucifera" style={{ height: 40, width: "auto", marginBottom: 8, display: "block" }} />
        <div style={{ color: "#666", marginBottom: 32, fontSize: 14, letterSpacing: "0.05em" }}>Admin</div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Heslo"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px", background: "#1a1a1a",
              border: "1px solid #333", borderRadius: 8, color: "#fff",
              fontSize: 16, marginBottom: 16, boxSizing: "border-box"
            }}
            autoFocus
          />
          {error && <div style={{ color: "#ff4444", marginBottom: 12, fontSize: 14 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px 16px", background: "#c8ff00",
              border: "none", borderRadius: 8, color: "#000",
              fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "..." : "Prihlásiť sa"}
          </button>
        </form>
      </div>
    </div>
  );
}
