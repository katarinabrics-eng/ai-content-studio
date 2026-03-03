"use client";

import { ScanResultScrollExperience } from "@/app/start/ScanResultScrollExperience";
import type { ScanResult } from "@/app/start/ScanResultScrollExperience";

/** Zobrazení výsledné strategie / teaseru po diagnostice (scroll experience s cenou, e-mail, CTA). */
export function StrategyOutput({
  result,
  projectId,
  onBack,
}: {
  result: ScanResult;
  projectId: string | null;
  onBack?: () => void;
}) {
  return (
    <ScanResultScrollExperience
      result={result}
      projectId={projectId}
      onBack={onBack}
    />
  );
}
