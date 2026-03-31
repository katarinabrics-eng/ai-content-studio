"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { ClientTokenGuard, type ClientInfo } from "../ClientTokenGuard";
import { WebPreviewCard } from "./components/WebPreviewCard";
import { ScoreCard } from "./components/ScoreCard";
import { PillarsCard } from "./components/PillarsCard";
import { SpiderChart } from "./components/SpiderChart";
import { StrategistsCard } from "./components/StrategistsCard";
import { BrandVoiceCard } from "./components/BrandVoiceCard";
import { BrandIdentityCard } from "./components/BrandIdentityCard";
import { SymbolsCard } from "./components/SymbolsCard";
import { PipelineCard } from "./components/PipelineCard";
import { DocumentsList } from "./components/DocumentsList";

// ─── Types ───────────────────────────────────────────────────────────────────

type PillarData = {
  score?: number;
  interpretation?: string;
  strategicOpportunity?: string;
};

type ScanResult = {
  brandScore?: { total?: number };
  brandDna?: {
    name?: string;
    positioning?: string;
    archetype?: string;
    tone?: string;
    colorPalette?: string[];
    typography?: { primary?: string; secondary?: string };
    keyMessages?: string[];
    uniqueValue?: string;
    contentPillars?: string[];
  };
  pillarAnalysis?: Record<string, PillarData>;
  suggested_strategists?: Array<{
    id: string;
    label: string;
    fit_score?: number;
    reason?: string;
  }>;
  summary?: string;
  client_name?: string;
};

type WorkspaceData = {
  id: string;
  name: string | null;
  email: string | null;
  web_url: string | null;
  scan_result: ScanResult;
  drive_config?: {
    folder_structure?: unknown[];
  } | null;
  selected_photos?: string[] | null;
  rtg_plan?: string | null;
  google_drive_folder_id?: string | null;
  agent_style?: string | null;
  platforms?: string[] | null;
  topics?: string[] | null;
};

// ─── Inner dashboard (needs params + token) ──────────────────────────────────

function WorkspaceDashboard({
  projectCode,
  client,
  token,
}: {
  projectCode: string;
  client: ClientInfo;
  token: string;
}) {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rtgPlan, setRtgPlan] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Načti RTG plán a počet postů čekajících na schválení
  useEffect(() => {
    if (!projectCode || !token) return;
    async function loadRtg() {
      try {
        const res = await fetch(
          `/api/client/rtg/batches?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`
        );
        const data = await res.json() as {
          ok: boolean;
          project?: { plan?: string | null };
          posts?: Array<{ status: string }>;
        };
        if (data.ok) {
          setRtgPlan(data.project?.plan ?? null);
          const pending = (data.posts ?? []).filter(
            (p) => p.status === "client_review" || p.status === "pending"
          ).length;
          setPendingCount(pending);
        }
      } catch {
        // RTG data nejsou kritická — tiše ignorujeme chybu
      }
    }
    loadRtg();
  }, [projectCode, token]);

  useEffect(() => {
    if (!projectCode) return;
    async function load() {
      try {
        // Fetch project data (project_code from projects table)
        const res = await fetch(
          `/api/client/project?code=${encodeURIComponent(projectCode)}`
        );
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Projekt nenalezen");
        } else {
          const proj = data.project;
          setWorkspace({
            id: proj.id,
            name: proj.brief?.brand_name ?? null,
            email: null,
            web_url: proj.web_url ?? null,
            scan_result: proj.scan_result ?? {},
            drive_config: proj.drive_config ?? null,
            selected_photos: proj.selected_photos ?? null,
            rtg_plan: proj.rtg_plan ?? null,
            google_drive_folder_id: proj.google_drive_folder_id ?? null,
            agent_style: proj.agent_style ?? null,
            platforms: proj.platforms ?? null,
            topics: proj.topics ?? null,
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Nepodařilo se načíst data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectCode]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 16,
          color: "#aaa",
          fontSize: 14,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid #e8e4dc",
            borderTopColor: "#b7e94c",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Načítám dashboard…
      </div>
    );
  }

  if (error && !workspace) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 12,
          color: "#888",
          fontSize: 14,
          padding: 32,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36 }}>⚠️</div>
        <div style={{ fontWeight: 600, color: "#333" }}>Projekt nenalezen</div>
        <div>{error}</div>
        <a
          href="/"
          style={{ color: "#b7e94c", fontSize: 13, marginTop: 8, textDecoration: "none" }}
        >
          ← Zpět na hlavní stránku
        </a>
      </div>
    );
  }

  const scan = workspace?.scan_result ?? {};
  const brandDna = scan.brandDna ?? {};
  const pillarAnalysis = scan.pillarAnalysis ?? {};

  // Typ klienta
  const hasRtg = !!(workspace?.rtg_plan || rtgPlan);
  const hasPvi = !!(scan.brandScore?.total);
  const hasPortrait = !!workspace?.google_drive_folder_id;
  const brandScore = scan.brandScore?.total ?? 50;
  const suggestedStrategists = scan.suggested_strategists ?? [];

  // Derive top/weak pillar from analysis
  const pillarEntries = Object.entries(pillarAnalysis) as [string, PillarData][];
  const pillarLabels: Record<string, string> = {
    light: "Světlo",
    energy: "Energie",
    architecture: "Architektura",
    identity: "Identita",
    trust: "Důvěra",
  };
  let topPillar = "Energie";
  let weakPillar = "Důvěra";
  if (pillarEntries.length > 0) {
    const sorted = [...pillarEntries].sort(
      (a, b) => (b[1].score ?? 5) - (a[1].score ?? 5)
    );
    topPillar = pillarLabels[sorted[0]?.[0] ?? ""] ?? sorted[0]?.[0] ?? "Energie";
    weakPillar =
      pillarLabels[sorted[sorted.length - 1]?.[0] ?? ""] ??
      sorted[sorted.length - 1]?.[0] ??
      "Důvěra";
  }

  const spiderScores = {
    light: pillarAnalysis.light?.score ?? 5,
    energy: pillarAnalysis.energy?.score ?? 5,
    architecture: pillarAnalysis.architecture?.score ?? 5,
    identity: pillarAnalysis.identity?.score ?? 5,
    trust: pillarAnalysis.trust?.score ?? 5,
  };

  const brandName = brandDna.name ?? workspace?.name ?? "Vaše značka";
  const positioning = brandDna.positioning ?? brandDna.uniqueValue ?? "";
  const archetype = brandDna.archetype ?? "Vizionář";
  const tone = brandDna.tone ?? "";
  const colorPalette = brandDna.colorPalette ?? [];
  const typography = brandDna.typography;
  const keyMessages = brandDna.keyMessages ?? [];
  const webUrl = workspace?.web_url ?? "";

  const driveConfig = workspace?.drive_config ?? null;
  const folderStructure: Array<{
    id: string;
    name: string;
    mimeType?: string;
    webViewLink?: string;
    subfolder?: string;
    modifiedTime?: string;
  }> = Array.isArray(driveConfig?.folder_structure)
    ? (driveConfig!.folder_structure as Array<{
        id: string;
        name: string;
        mimeType?: string;
        webViewLink?: string;
        subfolder?: string;
        modifiedTime?: string;
      }>)
    : [];
  const selectedPhotos = workspace?.selected_photos ?? [];

  const clientName = client.name || client.email || brandName;

  return (
    // Sidebar je poskytován [projectCode]/layout.tsx
    <div style={{ flex: 1, overflow: "auto" }}>
        {/* Header */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #e8e4dc",
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {brandName}
            </h1>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
              {projectCode.toUpperCase()} · Klientský dashboard
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {pendingCount > 0 && (
              <a
                href={`/client/${projectCode}/rtg?token=${encodeURIComponent(token)}`}
                style={{
                  background: "#b7e94c",
                  color: "#111",
                  fontSize: 11,
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{
                  background: "#111",
                  color: "#b7e94c",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  {pendingCount}
                </span>
                ke schválení
              </a>
            )}
            <span
              style={{
                background: "#f0fce0",
                color: "#3d6b00",
                fontSize: 11,
                padding: "5px 14px",
                borderRadius: 20,
                fontWeight: 600,
                border: "1px solid #d4f0a0",
              }}
            >
              Aktivní projekt
            </span>
          </div>
        </div>

        {/* RTG banner — zobrazí se pouze pokud má klient rtg_plan */}
        {rtgPlan && (
          <div style={{ padding: "16px 32px 0" }}>
            <a
              href={`/client/${projectCode}/rtg?token=${encodeURIComponent(token)}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f5f3ee",
                border: "1px solid #e8e4dc",
                borderLeft: "3px solid #b7e94c",
                borderRadius: 10,
                padding: "14px 20px",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  background: "#b7e94c",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}>
                  ▶
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                    {pendingCount > 0 ? "Váš obsah čeká na schválení" : "RTG obsah"}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    {pendingCount > 0
                      ? `${pendingCount} ${pendingCount === 1 ? "příspěvek" : pendingCount < 5 ? "příspěvky" : "příspěvků"} čeká na váš výběr`
                      : `Plán ${rtgPlan.charAt(0).toUpperCase() + rtgPlan.slice(1)} · Klientský portál`}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#b7e94c", fontWeight: 600, flexShrink: 0 }}>
                Otevřít →
              </div>
            </a>
          </div>
        )}

        {/* ── RTG-only dashboard ─────────────────────────────────────── */}
        {!hasPvi && hasRtg && (
          <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Velký RTG banner */}
            <a
              href={`/client/${projectCode}/rtg?token=${encodeURIComponent(token)}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#111",
                borderRadius: 14,
                padding: "28px 32px",
                textDecoration: "none",
                gap: 24,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#b7e94c", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Ready to Go · Obsah
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                  {pendingCount > 0 ? "Váš obsah čeká na schválení" : "Váš obsah je připravený"}
                </div>
                <div style={{ fontSize: 14, color: "#aaa" }}>
                  {pendingCount > 0
                    ? `${pendingCount} ${pendingCount === 1 ? "příspěvek čeká" : pendingCount < 5 ? "příspěvky čekají" : "příspěvků čeká"} na váš výběr`
                    : "Otevřít portál a zkontrolovat obsah"}
                </div>
              </div>
              <div style={{
                background: "#b7e94c",
                color: "#111",
                padding: "12px 24px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}>
                Otevřít →
              </div>
            </a>

            {/* Statistiky */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "Plán", value: (workspace?.rtg_plan || rtgPlan || "—").charAt(0).toUpperCase() + (workspace?.rtg_plan || rtgPlan || "").slice(1) },
                { label: "Ke schválení", value: String(pendingCount) },
                { label: "Status", value: "Aktivní" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: "#fff",
                  border: "1px solid #e8e4dc",
                  borderRadius: 12,
                  padding: "20px 24px",
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Brand DNA pokud existuje */}
            {(workspace?.agent_style || (workspace?.platforms ?? []).length > 0 || (workspace?.topics ?? []).length > 0) && (
              <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 14 }}>Váš nastavený styl</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {workspace?.agent_style && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, color: "#aaa", width: 90, flexShrink: 0, paddingTop: 2 }}>Styl agenta</span>
                      <span style={{ fontSize: 13, color: "#333" }}>{workspace.agent_style}</span>
                    </div>
                  )}
                  {(workspace?.platforms ?? []).length > 0 && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, color: "#aaa", width: 90, flexShrink: 0, paddingTop: 2 }}>Platformy</span>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(workspace?.platforms ?? []).map((p) => (
                          <span key={p} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#f5f3ee", border: "1px solid #e8e4dc", color: "#555" }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(workspace?.topics ?? []).length > 0 && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, color: "#aaa", width: 90, flexShrink: 0, paddingTop: 2 }}>Témata</span>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(workspace?.topics ?? []).map((t) => (
                          <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#f5f3ee", border: "1px solid #e8e4dc", color: "#555" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upgrade odkaz */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <a
                href={`/client/${projectCode}/rtg/plans?token=${encodeURIComponent(token)}`}
                style={{ fontSize: 13, color: "#aaa", textDecoration: "none" }}
              >
                Změnit plán →
              </a>
            </div>
          </div>
        )}

        {/* ── PVI dashboard (brand scan existuje) ────────────────────── */}
        {hasPvi && (
          <div
            style={{
              padding: "24px 32px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {/* Row 1: Score + Web preview + Pipeline */}
            <ScoreCard
              score={brandScore}
              persona={archetype}
              topPillar={topPillar}
              weakPillar={weakPillar}
            />
            <WebPreviewCard
              webUrl={webUrl}
              brandName={brandName}
              positioning={positioning}
            />
            <PipelineCard
              diagnostics={pillarEntries.length > 0 ? scan : null}
              driveConfig={driveConfig}
              selectedPhotos={selectedPhotos}
            />

            {/* Row 2: Pillars + Spider */}
            <PillarsCard pillarAnalysis={pillarAnalysis} />
            <SpiderChart scores={spiderScores} />
            <BrandIdentityCard
              colorPalette={colorPalette}
              typography={typography}
              tone={tone}
            />

            {/* Row 3: Strategists (2col) + BrandVoice */}
            <div style={{ gridColumn: "span 2" }}>
              <StrategistsCard strategistIds={suggestedStrategists} />
            </div>
            <BrandVoiceCard keyMessages={keyMessages} />

            {/* Row 4: Symbols (2col) + Documents */}
            <div style={{ gridColumn: "span 2" }}>
              <SymbolsCard archetype={archetype} />
            </div>
            <DocumentsList folderStructure={folderStructure} />
          </div>
        )}

        {/* ── Prázdný stav — žádný scan, žádný RTG ──────────────────── */}
        {!hasPvi && !hasRtg && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 32px",
            gap: 16,
            color: "#aaa",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 48, opacity: 0.3 }}>◎</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#555" }}>Brand analýza se připravuje</div>
            <div style={{ fontSize: 14, color: "#aaa", maxWidth: 360 }}>
              Vaše výsledky budou dostupné po dokončení Brand Scanu. Obvykle do 24 hodin.
            </div>
          </div>
        )}
    </div>
  );
}

// ─── Page wrapper with ClientTokenGuard ──────────────────────────────────────

function ProjectPageInner() {
  const params = useParams();
  const projectCode = params.projectCode as string;

  return (
    <ClientTokenGuard>
      {(client: ClientInfo, token: string) => (
        <WorkspaceDashboard
          projectCode={projectCode}
          client={client}
          token={token}
        />
      )}
    </ClientTokenGuard>
  );
}

export default function ProjectPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "#aaa",
            fontSize: 14,
          }}
        >
          Načítám…
        </div>
      }
    >
      <ProjectPageInner />
    </Suspense>
  );
}
