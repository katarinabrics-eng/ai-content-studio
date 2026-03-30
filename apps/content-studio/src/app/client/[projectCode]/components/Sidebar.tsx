"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface SidebarProps {
  token: string;
  projectCode: string;
  clientName: string;
}

export function Sidebar({ token, projectCode, clientName }: SidebarProps) {
  const pathname = usePathname();
  const base = `/client/${projectCode}`;
  const t = token ? `?token=${token}` : "";

  const isActive = (href: string) => pathname === href.split("?")[0];

  const navItem = (label: string, href?: string, badge?: string) => {
    const active = href ? isActive(href) : false;
    const el = (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "9px 12px",
          borderRadius: 8,
          margin: "1px 8px",
          fontSize: 13,
          background: active ? "#f0fce0" : "transparent",
          color: href ? (active ? "#3d6b00" : "#333") : "#bbb",
          fontWeight: active ? 500 : 400,
          cursor: href ? "pointer" : "default",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!active && href)
            (e.currentTarget as HTMLDivElement).style.background = "#f5f2ec";
        }}
        onMouseLeave={(e) => {
          if (!active)
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      >
        <span style={{ flex: 1 }}>{label}</span>
        {badge && (
          <span
            style={{
              background: "#f0fce0",
              color: "#3d6b00",
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 10,
              border: "1px solid #b7e94c",
            }}
          >
            {badge}
          </span>
        )}
      </div>
    );
    if (!href) return <div key={label}>{el}</div>;
    return (
      <Link key={label} href={href} style={{ textDecoration: "none" }}>
        {el}
      </Link>
    );
  };

  const sectionLabel = (text: string) => (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#bbb",
        padding: "10px 16px 4px",
      }}
    >
      {text}
    </div>
  );

  return (
    <aside
      style={{
        width: 220,
        background: "#fff",
        borderRight: "1px solid #e8e4dc",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid #f0ece4",
        }}
      >
        <Image
          src="/placeholders/LUCIFERA-Logo-Left.png"
          alt="Lucifera"
          width={130}
          height={32}
          style={{ objectFit: "contain" }}
          unoptimized
        />
      </div>
      <nav style={{ flex: 1, paddingTop: 8 }}>
        {sectionLabel("Projekt")}
        {navItem("Dashboard", `${base}${t}`)}
        {navItem("Výsledky Scanu", `/client/status${t}`)}
        {navItem("Strategie")}
        {navItem("Visual Board", undefined, "Nové")}

        {sectionLabel("Obsah")}
        {navItem("Ready to Go", `${base}/rtg${t}`)}
        {navItem("Ke schválení", `${base}/rtg${t}`)}
        {navItem("Fotografie", `/client/assets${t}`)}

        {sectionLabel("Dokumenty")}
        {navItem("Mé dokumenty", `/client/assets${t}`)}
        {navItem("Prezentace")}
      </nav>
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #f0ece4",
          fontSize: 11,
          color: "#bbb",
        }}
      >
        {clientName}
      </div>
    </aside>
  );
}
