"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Sidebar } from "./components/Sidebar";

type ProjectInfo = {
  rtg_plan: string | null;
  google_drive_folder_id: string | null;
  scan_result: { brandScore?: { total?: number } } | null;
  client_name: string | null;
};

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectCode = params.projectCode as string;
  const token = searchParams.get("token") ?? "";

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!token || !projectCode) return;

    fetch(`/api/client/project?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.project) setProject(data.project);
      })
      .catch(() => {});

    fetch(`/api/client/rtg/batches?code=${encodeURIComponent(projectCode)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.batches) {
          const count = (data.batches as Array<{ posts?: Array<{ status: string }> }>)
            .flatMap((b) => b.posts ?? [])
            .filter((p) => p.status === "client_review").length;
          setPendingCount(count);
        }
      })
      .catch(() => {});
  }, [projectCode, token]);

  const hasRtg = !!(project?.rtg_plan);
  const hasPvi = !!(project?.scan_result?.brandScore?.total);
  const hasPortrait = !!(project?.google_drive_folder_id);

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
      <div style={{ flex: 1, overflow: "auto" }}>
        {children}
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
