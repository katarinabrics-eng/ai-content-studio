"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_ORDER,
  getStatusOrder,
  getDisplayStatusForTimeline,
  type ProjectStatus,
} from "@/lib/project-status-engine";

type ProjectData = {
  id: string;
  project_code: string;
  plan_id: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  brief?: {
    brand_name?: string;
    industry?: string;
    communication_goal?: string;
    platforms?: string[];
  } | null;
};

type ClientProposal = {
  id: string;
  format: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  visual_brief: string;
  created_at: string;
};

const FORMAT_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  letak: "Leták",
  carousel: "Carousel",
};

const CLIENT_VISIBLE_STATUSES = PROJECT_STATUS_ORDER.filter(
  (s) => s !== "WAITING_PAYMENT" && s !== "ERROR"
);

function TimelineSteps({ currentStatus }: { currentStatus: ProjectStatus }) {
  const displayStatus = getDisplayStatusForTimeline(currentStatus);
  const currentOrder = getStatusOrder(displayStatus as ProjectStatus);

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {CLIENT_VISIBLE_STATUSES.map((status) => {
        const order = getStatusOrder(status);
        const done = order <= currentOrder;
        const current = status === displayStatus;
        return (
          <span
            key={status}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              current
                ? "bg-lucifera-lime/25 text-lucifera-lime border border-lucifera-lime/30"
                : done
                  ? "bg-white/10 text-white/70"
                  : "bg-white/5 text-white/40"
            }`}
          >
            {PROJECT_STATUS_LABELS[status]}
          </span>
        );
      })}
    </div>
  );
}

function getStatusMessage(status: ProjectStatus): string {
  switch (status) {
    case "WAITING_PAYMENT":
      return "Čekáme na platbu.";
    case "PAID":
    case "WAITING_BRIEF":
      return "Platba potvrzena. Vyplňte prosím dotazník s podklady pro váš projekt.";
    case "WAITING_MANUAL_AI_COMMAND":
      return "Dotazník je vyplněn. Čekáme na interní pokyn – brzy začneme generovat návrhy.";
    case "AWAITING_INPUT":
    case "PROCESSING_DATA":
      return "Čekáme na vaše podklady. Jakmile je obdržíme, začneme pracovat.";
    case "INPUT_RECEIVED":
    case "READY_FOR_AI":
      return "Podklady máme. Připravujeme návrhy příspěvků.";
    case "AWAITING_MANUAL_PROMPT":
      return "Čekáme na interní pokyn. Brzy začneme generovat.";
    case "AI_IN_PROGRESS":
    case "AI_PROCESSING":
    case "IN_PRODUCTION":
      return "AI a kurátor pracují na vašich příspěvcích. Bude to trvat jen chvíli.";
    case "AWAITING_APPROVAL":
    case "DRAFT_READY":
      return "Návrhy jsou připraveny ke schválení!";
    case "REVISION":
      return "Zapracováváme vaše připomínky.";
    case "APPROVED_SCHEDULED":
    case "FINAL_READY":
      return "Finální verze je připravena!";
    case "DONE":
    case "CLOSED":
      return "Zakázka byla uzavřena. Děkujeme za spolupráci!";
    case "ERROR":
      return "Došlo k nečekané chybě. Obraťte se prosím na nás.";
    default:
      return "Váš projekt je v procesu.";
  }
}

const COMING_SOON_CARDS = [
  { id: "canva", label: "Canva šablony", icon: "🖼️" },
  { id: "reels", label: "Video Reels", icon: "▶️" },
  { id: "brand-video", label: "Brand video", icon: "🎬" },
  { id: "maskot", label: "Maskot", icon: "🎭" },
  { id: "avatar", label: "Avatar", icon: "👤" },
  { id: "foto-set", label: "Foto set", icon: "📸" },
  { id: "ilustrace", label: "Ilustrace", icon: "✏️" },
];

export default function ClientProjectPage() {
  const params = useParams();
  const projectCode = params.projectCode as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/client/project?code=${encodeURIComponent(projectCode)}`);
        const data = await res.json();
        if (data.ok && data.project) {
          setProject(data.project);
        } else {
          setError(data.error ?? "Projekt nenalezen");
        }
      } catch {
        setError("Nepodařilo se načíst projekt");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [projectCode]);

  useEffect(() => {
    if (!projectCode) return;
    fetch(`/api/client/proposals?code=${encodeURIComponent(projectCode)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.proposals)) setProposals(d.proposals);
      })
      .catch(() => {});
  }, [projectCode]);

  if (loading) {
    return (
      <main className="min-h-screen bg-lucifera-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-lucifera-lime border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-white/70">Načítám projekt...</p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-lucifera-dark flex items-center justify-center px-4">
        <div className="glass-panel max-w-md p-8 text-center">
          <h1 className="text-xl font-bold text-white">Projekt nenalezen</h1>
          <p className="mt-4 text-white/70">{error ?? "Zkontrolujte kód projektu."}</p>
          <a href="/" className="btn-lime-primary mt-6 inline-block">
            Zpět na hlavní stránku
          </a>
        </div>
      </main>
    );
  }

  const status = project.status as ProjectStatus;
  const brief = project.brief;

  return (
    <main className="min-h-screen bg-lucifera-dark px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-white">
            {brief?.brand_name && brief.brand_name !== "—"
              ? brief.brand_name
              : "Váš projekt"}
          </h1>
          <p className="mt-2 text-white/50 font-mono text-sm">{project.project_code}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Aktivní karta: Stav zakázky */}
          <div className="glass-panel p-6 sm:col-span-2">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span className="text-lucifera-lime">📋</span> Stav zakázky
            </h2>
            <p className="mt-2 text-lucifera-lime text-lg font-medium">
              {PROJECT_STATUS_LABELS[status] ?? status}
            </p>
            <p className="mt-2 text-white/70 text-sm">{getStatusMessage(status)}</p>
            <TimelineSteps currentStatus={status} />
          </div>

          {/* CTA: Vyplnit dotazník - pouze když PAID nebo WAITING_BRIEF */}
          {(status === "PAID" || status === "WAITING_BRIEF") && (
            <div className="glass-panel p-6 sm:col-span-2 border-lucifera-lime/30 bg-lucifera-lime/5">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="text-lucifera-lime">📝</span> Vyplňte dotazník
              </h2>
              <p className="mt-2 text-white/70 text-sm">
                Pro pokračování projektu prosím vyplňte údaje o vaší značce.
              </p>
              <a
                href={`/client/${encodeURIComponent(projectCode)}/brief`}
                className="btn-lime-primary mt-4 inline-block"
              >
                Vyplnit dotazník
              </a>
            </div>
          )}

          {/* Výběr návrhů – zobrazí se klientovi */}
          {proposals.length > 0 && (
            <div className="glass-panel p-6 sm:col-span-2 border-lucifera-lime/20">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="text-lucifera-lime">✨</span> Výběr návrhů pro vás
              </h2>
              <p className="mt-2 text-white/70 text-sm">
                Níže jsou návrhy příspěvků vybrané pro váš projekt. Můžete je dále upravit s naším týmem.
              </p>
              <div className="mt-4 space-y-4">
                {proposals.map((p, i) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-left"
                  >
                    <span className="text-xs font-medium text-lucifera-lime/90 uppercase">
                      {FORMAT_LABELS[p.format] ?? p.format} · Návrh {i + 1}
                    </span>
                    <p className="mt-2 font-medium text-white">{p.hook}</p>
                    <p className="mt-1 text-sm text-white/80">{p.body}</p>
                    <p className="mt-2 text-sm text-lucifera-lime">{p.cta}</p>
                    {p.visual_brief && (
                      <p className="mt-2 text-sm text-white/60">
                        <span className="text-white/50">Návrh vizuálu:</span> {p.visual_brief}
                      </p>
                    )}
                    {p.hashtags?.length > 0 && (
                      <p className="mt-2 text-xs text-white/50">{p.hashtags.join(" ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aktivní karta: Nahraná data */}
          <div className="glass-panel p-6">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span className="text-lucifera-lime">📁</span> Nahraná data
            </h2>
            {brief && (brief.brand_name !== "—" || brief.industry !== "—") ? (
              <dl className="mt-4 space-y-2 text-sm">
                {brief.brand_name && brief.brand_name !== "—" && (
                  <>
                    <dt className="text-white/50">Značka</dt>
                    <dd className="text-white">{brief.brand_name}</dd>
                  </>
                )}
                {brief.industry && brief.industry !== "—" && (
                  <>
                    <dt className="text-white/50">Obor</dt>
                    <dd className="text-white">{brief.industry}</dd>
                  </>
                )}
                {brief.communication_goal && brief.communication_goal !== "—" && (
                  <>
                    <dt className="text-white/50">Cíl</dt>
                    <dd className="text-white">{brief.communication_goal}</dd>
                  </>
                )}
                {brief.platforms?.length && (
                  <>
                    <dt className="text-white/50">Platformy</dt>
                    <dd className="text-white">{brief.platforms.join(", ")}</dd>
                  </>
                )}
              </dl>
            ) : (
              <p className="mt-4 text-white/50 text-sm">
                Zatím žádná data. Vyplňte dotazník v dalším kroku.
              </p>
            )}
          </div>

          {/* Neaktivní karty – Brzy dostupné */}
          {COMING_SOON_CARDS.map((card) => (
            <div
              key={card.id}
              className="glass-panel p-6 opacity-60 pointer-events-none"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{card.icon}</span>
                <div>
                  <h2 className="font-semibold text-white/90">{card.label}</h2>
                  <p className="mt-1 text-xs text-lucifera-lime/80">Brzy dostupné</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-white/40">
          Vytvořeno: {new Date(project.created_at).toLocaleDateString("cs-CZ")}
          {" · "}
          Aktualizováno: {new Date(project.updated_at).toLocaleDateString("cs-CZ")}
        </p>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-white/50 hover:text-white/70">
            ← Zpět na hlavní stránku
          </a>
        </div>
      </div>
    </main>
  );
}
