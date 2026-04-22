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
  // kept for backward compat — unused in new nav
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
}: SidebarProps) {
  const pathname = usePathname();
  const base = `/client/${projectCode}`;
  const t = token ? `?token=${token}` : "";

  // Match exact path (ignore query string)
  const isActive = (href: string) => pathname === href.split("?")[0];

  const navItems = [
    { label: "Přehled", href: `${base}${t}` },
    { label: "Vizuální knihovna", href: `${base}/media-library${t}` },
    {
      label: "Příspěvky",
      href: `${base}/rtg${t}`,
      badge: pendingApprovals > 0 ? pendingApprovals : undefined,
    },
    { label: "Tarify & služby", href: `${base}/rtg/plans${t}` },
  ];

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
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid #f0ece4",
        }}
      >
        <Image
          src="/placeholders/LUCIFERA-Logo-Left.png"
          alt="Lucifera"
          width={120}
          height={28}
          style={{ objectFit: "contain" }}
          unoptimized
        />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: 12 }}>
        {navItems.map(({ label, href, badge }) => {
          const active = isActive(href);
          return (
            <Link key={label} href={href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "9px 14px",
                  borderRadius: 8,
                  margin: "1px 8px",
                  fontSize: 13,
                  background: active ? "#f0fce0" : "transparent",
                  color: active ? "#3d6b00" : "#333",
                  fontWeight: active ? 500 : 400,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLDivElement).style.background =
                      "#f5f2ec";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLDivElement).style.background =
                      "transparent";
                }}
              >
                <span style={{ flex: 1 }}>{label}</span>
                {badge !== undefined && (
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
            </Link>
          );
        })}
      </nav>

      {/* Client info footer */}
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
              border: "0.5px solid rgba(183,233,76,0.4)",
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
