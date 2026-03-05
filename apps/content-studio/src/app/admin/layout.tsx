"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const SIDEBAR_WIDTH = 240;
const NAV_ITEMS = [
  { href: "/admin", label: "Diagnostika" },
  { href: "/admin/dashboard", label: "Pipeline" },
  { href: "/diagnostika", label: "+ Nová diagnostika", external: true },
  { href: "/admin", label: "Klienti" },
  { href: "/admin", label: "Nastavení" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          background: "#111",
          borderRight: "1px solid #222",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #222" }}>
          <Link href="/admin" style={{ display: "block", textDecoration: "none" }}>
            <img
              src="/placeholders/LUCIFERA-Logo-Left-Neg.webp"
              alt="Lucifera"
              style={{ height: 36, width: "auto", display: "block" }}
            />
          </Link>
          <span
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: "#555",
              letterSpacing: "0.1em",
              marginTop: 6,
            }}
          >
            Admin
          </span>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {NAV_ITEMS.map((item, i) => {
            const isActive = !item.external && pathname === item.href;
            const style: React.CSSProperties = {
              display: "block",
              padding: "10px 20px",
              color: isActive ? "#A8EB12" : "#888",
              textDecoration: "none",
              fontSize: 14,
              borderLeft: isActive ? "3px solid #A8EB12" : "3px solid transparent",
              background: isActive ? "rgba(168,235,18,0.06)" : "transparent",
            };
            if (item.external) {
              return (
                <a key={i} href={item.href} style={{ ...style, borderLeft: "3px solid transparent", background: "transparent" }}>
                  {item.label}
                </a>
              );
            }
            return (
              <Link key={i} href={item.href} style={style}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #222" }}>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.push("/admin/login");
            }}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: "transparent",
              border: "1px solid #333",
              color: "#666",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Odhlásit
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
