"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { ClientTokenGuard, type ClientInfo } from "../ClientTokenGuard";
import { Sidebar } from "./components/Sidebar";
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
            web_url: null,
            scan_result: proj.scan_result ?? {},
            drive_config: proj.drive_config ?? null,
            selected_photos: proj.selected_photos ?? null,
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar token={token} projectCode={projectCode} clientName={clientName} />

      {/* Main content */}
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

        {/* Dashboard grid */}
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
      </div>
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
