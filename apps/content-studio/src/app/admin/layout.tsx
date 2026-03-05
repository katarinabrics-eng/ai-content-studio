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
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Jediný sloupec: horní lišta s LUCIFERA (jednou) + Odhlásit */}
      <header
        style={{
          height: 52,
          flexShrink: 0,
          background: "#0d0d0d",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <Link href="/admin/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src="/placeholders/LUCIFERA-Logo-Left-Neg.webp"
            alt="Lucifera"
            style={{ height: 32, width: "auto", display: "block" }}
          />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/diagnostika" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>+ Nová diagnostika</a>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.push("/admin/login");
            }}
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: "1px solid #333",
              color: "#888",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
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
