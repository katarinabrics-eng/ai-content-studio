"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface SidebarProps {
  token: string;
  projectCode: string;
  clientName?: string;
  rtgPlan?: string | null;
  pendingApprovals?: number;
  hasPvi?: boolean;
  hasRtg?: boolean;
  hasPortrait?: boolean;
}

export function Sidebar({
  token,
  projectCode,
  clientName,
  rtgPlan,
  pendingApprovals = 0,
  hasPvi = false,
  hasRtg = false,
  hasPortrait = false,
}: SidebarProps) {
  const pathname = usePathname();
  const base = `/client/${projectCode}`;
  const t = token ? `?token=${token}` : "";

  const isActive = (href: string) => pathname === href.split("?")[0];

  const navItem = (label: string, href?: string, badge?: string | number) => {
    const active = href ? isActive(href) : false;
    const badgeStr = badge !== undefined ? String(badge) : undefined;
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
        {badgeStr && Number(badgeStr) > 0 && (
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
            {badgeStr}
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

  // CTA banner dle kombinace produktů
  const ctaBanner = () => {
    const style: React.CSSProperties = {
      background: "#d3ee7f22",
      border: "0.5px solid #b7e94c44",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 11,
      color: "#5a7a00",
      margin: "0 12px 10px",
      textDecoration: "none",
      display: "block",
      lineHeight: 1.5,
    };

    if (hasRtg && !hasPvi) {
      return (
        <a href="/brand-scan" style={style}>
          Zjisti sílu své značky →<br />
          <span style={{ opacity: 0.7 }}>Brand diagnostika</span>
        </a>
      );
    }
    if (hasPortrait && !hasRtg) {
      return (
        <a href="/ready-to-go" style={style}>
          Chceš obsah každý týden? →<br />
          <span style={{ opacity: 0.7 }}>RTG autopilot</span>
        </a>
      );
    }
    if (!hasPortrait) {
      return (
        <a href="/portrety" style={style}>
          Nafotit se v ateliéru →<br />
          <span style={{ opacity: 0.7 }}>Portréty &amp; branding</span>
        </a>
      );
    }
    return null;
  };

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
      {/* Logo */}
      <div style={{ padding: "20px 16px", borderBottom: "1px solid #f0ece4" }}>
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
        {/* Vždy viditelné */}
        {sectionLabel("Projekt")}
        {navItem("Dashboard", `${base}${t}`)}
        {navItem("Vizuální knihovna", `${base}/media-library${t}`)}

        {/* Sekce Značka — jen pro PVI klienty */}
        {hasPvi && (
          <>
            {sectionLabel("Značka")}
            {navItem("Brand DNA", `${base}${t}`)}
            {navItem("Brief", `${base}/brief${t}`)}
            {navItem("Strategie")}
          </>
        )}

        {/* Sekce Obsah — jen pro RTG klienty */}
        {hasRtg && (
          <>
            {sectionLabel("Obsah")}
            {navItem(
              "Ke schválení",
              `${base}/rtg${t}`,
              pendingApprovals > 0 ? pendingApprovals : undefined
            )}
            {navItem(
              "Plány",
              `${base}/rtg/plans${t}`
            )}
            {navItem("Kalendář")}
            {navItem("Moje posty")}
          </>
        )}

        {/* Sekce Fotografie — jen pro Portrait klienty */}
        {hasPortrait && (
          <>
            {sectionLabel("Fotografie")}
            {navItem("Moje fotky", `${base}/gallery${t}`)}
            {navItem("Výběr fotek")}
          </>
        )}
      </nav>

      {/* CTA banner */}
      {ctaBanner()}

      {/* Jméno klienta */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #f0ece4",
          fontSize: 11,
          color: "#bbb",
        }}
      >
        {clientName}
        {rtgPlan && (
          <span
            style={{
              marginLeft: 8,
              background: "#f0fce0",
              color: "#5a7a00",
              fontSize: 9,
              fontWeight: 600,
              padding: "1px 6px",
              borderRadius: 6,
              border: "0.5px solid #b7e94c44",
              textTransform: "capitalize",
            }}
          >
            {rtgPlan}
          </span>
        )}
      </div>
    </aside>
  );
}
