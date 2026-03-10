"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f8f8",
        color: "#111111",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <header
        style={{
          height: 48,
          flexShrink: 0,
          background: "rgba(245,244,240,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px 0 0",
        }}
      >
        <Link href="/admin/dashboard" style={{ display: "flex", alignItems: "center", height: "100%", paddingLeft: 16, textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.04em", color: "#111" }}>LUCIFERA</span>
          <span style={{ marginLeft: 6, color: "#a8d800" }}>·</span>
          <span style={{ marginLeft: 4, fontSize: 13, fontWeight: 600, color: "#555" }}>Admin</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="/diagnostika" style={{ fontSize: 11, color: "#555", textDecoration: "none", padding: "5px 12px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 6 }}>+ Nová diagnostika</a>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.push("/admin/login");
            }}
            style={{
              padding: "5px 12px",
              background: "#a8d800",
              border: "none",
              color: "#111",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Odhlásit
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
