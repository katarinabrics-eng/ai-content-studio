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
    <div style={{ minHeight: "100vh", background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 40, width: 360, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ fontFamily: "var(--font-playfair), serif", fontWeight: 700, fontSize: 22, color: "#111", marginBottom: 8 }}>LUCIFERA</div>
        <div style={{ color: "#555", marginBottom: 32, fontSize: 14, letterSpacing: "0.05em" }}>Admin</div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Heslo"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px", background: "#f7f7f7",
              border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, color: "#111",
              fontSize: 16, marginBottom: 16, boxSizing: "border-box"
            }}
            autoFocus
          />
          {error && <div style={{ color: "#dc2626", marginBottom: 12, fontSize: 14 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px 16px", background: "#a8d800",
              border: "none", borderRadius: 8, color: "#111",
              fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "..." : "Přihlásit se"}
          </button>
        </form>
      </div>
    </div>
  );
}
