/* ============================================================
   Shared components: Sidebar, TopNav, small atoms
   ============================================================ */

const { useState, useEffect, useRef, useMemo } = React;

function Icon({ name, size = 16, stroke = 1.6 }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
    library: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    dna: <><path d="M7 3c5 4 5 14 10 18"/><path d="M17 3c-5 4-5 14-10 18"/><path d="M8.5 7.5h7"/><path d="M8.5 16.5h7"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></>,
    check: <path d="M4 12l5 5L20 6"/>,
    close: <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>,
    arrow: <><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></>,
    spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>,
    bell: <><path d="M6 8a6 6 0 0112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></>,
    cog: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1"/></>,
    play: <path d="M7 5v14l12-7L7 5z"/>,
    edit: <><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/></>,
    download: <><path d="M12 4v12"/><path d="M6 10l6 6 6-6"/><path d="M5 20h14"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/></>,
    star: <path d="M12 3l2.8 6 6.2.9-4.5 4.4 1.1 6.2L12 17.5 6.4 20.5l1.1-6.2L3 9.9 9.2 9 12 3z"/>,
    trend: <path d="M3 17l6-6 4 4 8-8"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 4.5 6.5 4.5 9s-1.5 6-4.5 9M12 3c-3 3-4.5 6.5-4.5 9s1.5 6 4.5 9"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block" }}>
      {paths[name]}
    </svg>
  );
}

function Sidebar({ plan, route, onRoute, credits, pendingCount }) {
  const brand = window.LUCIFERA.BRAND;
  const P = window.LUCIFERA.PLANS[plan];
  const hasRTG = ["start", "plus", "pro"].includes(plan);
  const hasPVI = plan === "pvi";
  const isFree = plan === "free";

  const Item = ({ id, icon, label, badge, locked }) => {
    const active = route === id;
    return (
      <div
        onClick={() => !locked && onRoute(id)}
        className="side-item"
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: 10, margin: "1px 10px",
          fontSize: 13, fontWeight: active ? 600 : 500,
          color: locked ? "var(--ink-4)" : (active ? "var(--ink)" : "var(--ink-2)"),
          background: active ? "var(--bg-soft)" : "transparent",
          border: active ? "1px solid var(--line)" : "1px solid transparent",
          cursor: locked ? "not-allowed" : "pointer",
          transition: "background .15s",
        }}
      >
        <Icon name={icon} size={15} />
        <span style={{ flex: 1, letterSpacing: "-.005em" }}>{label}</span>
        {locked && <Icon name="lock" size={13} />}
        {badge ? (
          <span style={{
            background: "var(--accent)", color: "#111",
            fontSize: 10, fontWeight: 700,
            padding: "2px 7px", borderRadius: 10, lineHeight: 1,
          }}>{badge}</span>
        ) : null}
      </div>
    );
  };

  const Section = ({ label }) => (
    <div style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
      textTransform: "uppercase", color: "var(--ink-4)",
      padding: "18px 22px 6px",
    }}>{label}</div>
  );

  return (
    <aside style={{
      width: 248, flexShrink: 0,
      background: "var(--bg-elev)",
      borderRight: "1px solid var(--line)",
      display: "flex", flexDirection: "column",
      minHeight: "100vh",
    }}>
      <div style={{ padding: "22px 22px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="assets/logo.png" alt="Lucifera"
            style={{ height: 18, filter: "var(--logo-filter, none)" }} />
        </div>
      </div>

      <div style={{ padding: "0 10px 12px" }}>
        <div style={{
          margin: "0 6px", padding: "12px 12px",
          border: "1px solid var(--line)", borderRadius: 12,
          background: "var(--bg-soft)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "var(--ink)", color: "var(--bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
          }}>{brand.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {brand.name}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{brand.handle}</div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: "var(--accent-ink)",
            background: "var(--accent-soft)",
            padding: "3px 8px", borderRadius: 999,
            border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)",
          }}>{brand.score}</div>
        </div>
      </div>

      <nav style={{ flex: 1, paddingTop: 2 }}>
        <Section label="Projekt" />
        <Item id="dashboard" icon="dashboard" label="Přehled" />
        <Item id="library" icon="library" label="Vizuální knihovna" />
        <Item id="approval" icon="check" label="Příspěvky"
          badge={pendingCount > 0 ? pendingCount : null}
          locked={isFree} />

        {(hasRTG || hasPVI) && <>
          <Section label="Značka" />
          <Item id="branddna" icon="dna" label="Brand DNA" locked={isFree} />
          <Item id="planner" icon="calendar" label="Plánovač" locked={isFree} />
        </>}

        <Section label="Účet" />
        <Item id="plans" icon="spark" label="Tarify & služby" />
      </nav>

      {/* Credit / status footer */}
      <div style={{ padding: "12px 16px 20px" }}>
        {isFree ? (
          <div style={{
            background: "var(--accent-soft)",
            border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)",
            borderRadius: 12, padding: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{
                width: 7, height: 7, borderRadius: 50, background: "var(--accent-ink)",
              }} className="pulse-dot" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-ink)" }}>
                Free trial
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--accent-ink)", opacity: .82, marginBottom: 10 }}>
              Zbývá 14 dní
            </div>
            <button className="btn btn-ink" style={{ width: "100%", padding: "9px 12px", fontSize: 12 }}
              onClick={() => onRoute("plans")}>
              Přejít na placený plán →
            </button>
          </div>
        ) : (
          <div style={{
            borderRadius: 12, padding: 12,
            background: "var(--bg-soft)", border: "1px solid var(--line)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
              <span style={{ color: "var(--ink-3)" }}>Kredit</span>
              <span style={{ fontWeight: 700, color: "var(--ink)" }}>{credits.toLocaleString("cs")}</span>
            </div>
            <div style={{ height: 4, background: "var(--line)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                width: `${Math.max(4, (credits / P.creditsInit) * 100)}%`,
                height: "100%", background: "var(--accent)",
                transition: "width .4s ease",
              }} />
            </div>
            <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 8 }}>
              {P.name} · {P.priceNote.split("·")[0]?.trim()}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function TopBar({ plan, onNewScan, onPlans, credits, onOpenTweaks }) {
  const P = window.LUCIFERA.PLANS[plan];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 32px",
      borderBottom: "1px solid var(--line)",
      background: "color-mix(in oklab, var(--bg) 70%, var(--bg-elev))",
      position: "sticky", top: 0, zIndex: 30,
      backdropFilter: "saturate(1.2) blur(10px)",
      WebkitBackdropFilter: "saturate(1.2) blur(10px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="chip chip-lime" style={{ fontSize: 10.5 }}>
          <span style={{
            width: 6, height: 6, borderRadius: 50, background: "var(--accent-ink)",
          }} className="pulse-dot" />
          {P.name}
        </span>
        {plan !== "free" && plan !== "pvi" && (
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
            Kredit · <span style={{ color: "var(--ink-2)", fontWeight: 600 }}>
              {credits.toLocaleString("cs")}
            </span>
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn btn-ghost" onClick={onNewScan} style={{ padding: "9px 14px", fontSize: 12 }}>
          <Icon name="plus" size={14} />
          Nová analýza
        </button>
        <button className="btn btn-ghost" style={{ padding: "9px 11px" }} title="Notifikace">
          <Icon name="bell" size={14} />
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: 999,
          background: "var(--ink)", color: "var(--bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600,
        }}>KB</div>
      </div>
    </div>
  );
}

function SpiderChart({ pillars, size = 200 }) {
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 24;
  const n = pillars.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pointAt = (i, val) => {
    const a = angle(i);
    const d = (val / 10) * r;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
  };
  const polyPoints = pillars.map((p, i) => pointAt(i, p.score).join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {[2, 4, 6, 8, 10].map((v) => {
        const pts = pillars.map((_, i) => pointAt(i, v).join(",")).join(" ");
        return <polygon key={v} points={pts} fill="none"
          stroke="var(--line)" strokeWidth=".8" opacity={v === 10 ? .9 : .5} />;
      })}
      {pillars.map((_, i) => {
        const [x, y] = pointAt(i, 10);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y}
          stroke="var(--line)" strokeWidth=".6" opacity=".5" />;
      })}
      <polygon points={polyPoints}
        fill="var(--accent)" fillOpacity=".25"
        stroke="var(--accent-ink)" strokeWidth="1.5" />
      {pillars.map((p, i) => {
        const [x, y] = pointAt(i, p.score);
        return <circle key={p.key} cx={x} cy={y} r="3"
          fill="var(--accent-ink)" />;
      })}
      {pillars.map((p, i) => {
        const [x, y] = pointAt(i, 11.2);
        return <text key={p.key} x={x} y={y}
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="var(--font-body)" fontSize="9.5"
          fontWeight="600" fill="var(--ink-3)">{p.label}</text>;
      })}
    </svg>
  );
}

Object.assign(window, { Icon, Sidebar, TopBar, SpiderChart });
