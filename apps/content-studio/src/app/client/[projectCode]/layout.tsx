"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";

type ProjectInfo = {
  rtg_plan: string | null;
  google_drive_folder_id: string | null;
  pvi_active: boolean;
  portrait_active: boolean;
  scan_result: { brandScore?: { total?: number } } | null;
  client_name: string | null;
};

async function loadProjectInfo(projectCode: string, token: string): Promise<ProjectInfo | null> {
  // Krok 1: zkus RTG systém (short_code + access_token)
  try {
    const rtgRes = await fetch(
      `/api/client/rtg/batches?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`
    );
    const rtgData = await rtgRes.json();
    if (rtgData.ok && rtgData.project) {
      return {
        rtg_plan: rtgData.project.rtg_plan ?? rtgData.project.plan ?? null,
        google_drive_folder_id: rtgData.project.google_drive_folder_id ?? null,
        pvi_active: rtgData.project.pvi_active ?? false,
        portrait_active: rtgData.project.portrait_active ?? false,
        scan_result: null, // RTG systém nemá scan_result
        client_name: rtgData.project.client_name ?? null,
      };
    }
  } catch {
    // RTG fetch selhal, zkus magic link
  }

  // Krok 2: zkus magic link systém (client_token)
  try {
    const pvRes = await fetch(
      `/api/client/project?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}&_=${Date.now()}`,
      { cache: 'no-store' }
    );
    const pvData = await pvRes.json();
    if (pvData.project) {
      return {
        rtg_plan: pvData.project.rtg_plan ?? null,
        google_drive_folder_id: pvData.project.google_drive_folder_id ?? null,
        pvi_active: pvData.project.pvi_active ?? false,
        portrait_active: pvData.project.portrait_active ?? false,
        scan_result: pvData.project.scan_result ?? null,
        client_name: pvData.project.client_name ?? pvData.project.brief?.brand_name ?? null,
      };
    }
  } catch {
    // obě cesty selhaly
  }

  return null;
}

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectCode = params.projectCode as string;
  const token = searchParams.get("token") ?? "";

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!projectCode) return;

    loadProjectInfo(projectCode, token).then((info) => {
      if (info) setProject(info);
    });

    // Počet postů ke schválení (RTG systém) — jen pokud máme token
    if (!token) return;
    fetch(
      `/api/client/rtg/batches?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.posts) {
          const count = (data.posts as Array<{ status: string }>)
            .filter((p) => p.status === "client_review").length;
          setPendingCount(count);
        }
      })
      .catch(() => {});
  }, [projectCode, token]);

  // Typ klienta — RTG plán OR pvi_active OR portrait_active
  const hasRtg = !!(project?.rtg_plan);
  const hasPvi = !!(project?.pvi_active || project?.scan_result?.brandScore?.total);
  const hasPortrait = !!(project?.portrait_active || project?.google_drive_folder_id);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        token={token}
        projectCode={projectCode}
        clientName={project?.client_name ?? undefined}
        rtgPlan={project?.rtg_plan}
        pendingApprovals={pendingCount}
        hasPvi={hasPvi}
        hasRtg={hasRtg}
        hasPortrait={hasPortrait}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar clientName={project?.client_name} />
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </Suspense>
  );
}
