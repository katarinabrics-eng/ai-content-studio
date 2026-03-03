"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ClientTokenGuard } from "@/app/client/ClientTokenGuard";
import {
  CLIENT_JOB_STATUS_LABELS,
  CLIENT_JOB_STATUS_ORDER,
  getStatusOrder,
  type ClientJobStatus,
} from "@/lib/client-status-engine";
import {
  PROJECT_STATUS_LABELS,
  getDisplayStatusForTimeline,
  type ProjectStatus,
} from "@/lib/project-status-engine";

type JobRow = {
  id: string;
  week_key: string;
  status: ClientJobStatus;
  due_at: string | null;
  updated_at: string;
};

type ProjectData = {
  id: string;
  project_code: string | null;
  plan_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  brief?: { brand_name?: string } | null;
};

const CLIENT_VISIBLE_STATUSES = ["PAID", "WAITING_BRIEF", "WAITING_MANUAL_AI_COMMAND", "AI_IN_PROGRESS", "AWAITING_APPROVAL", "DRAFT_READY", "REVISION", "FINAL_READY", "DONE", "CLOSED"];

function JobNastenka({ token }: { token: string }) {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/client/jobs?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (data.ok && Array.isArray(data.jobs) && !cancelled) setJobs(data.jobs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const sorted = [...jobs].sort(
    (a, b) => getStatusOrder(a.status) - getStatusOrder(b.status) || b.week_key.localeCompare(a.week_key)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Nástěnka – stav zakázek</h1>
      <nav className="flex flex-wrap gap-3 text-sm">
        <Link href={`/client/onboarding?token=${encodeURIComponent(token)}`} className="text-slate-600 hover:text-slate-900">Onboarding</Link>
        <span className="text-slate-400">·</span>
        <span className="font-medium text-slate-800">Nástěnka</span>
        <span className="text-slate-400">·</span>
        <Link href={`/client/approval?token=${encodeURIComponent(token)}`} className="text-slate-600 hover:text-slate-900">Schválení</Link>
        <span className="text-slate-400">·</span>
        <Link href={`/client/assets?token=${encodeURIComponent(token)}`} className="text-slate-600 hover:text-slate-900">Assety</Link>
      </nav>
      {loading ? (
        <p className="text-slate-500">Načítám…</p>
      ) : jobs.length === 0 ? (
        <p className="text-slate-500">Zatím nemáte žádné zakázky.</p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((job) => (
            <li key={job.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{job.week_key}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-700">
                  {CLIENT_JOB_STATUS_LABELS[job.status]}
                </span>
              </div>
              {job.due_at && (
                <p className="mt-1 text-sm text-slate-500">Termín: {new Date(job.due_at).toLocaleDateString("cs-CZ")}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {CLIENT_JOB_STATUS_ORDER.map((status) => {
                  const order = getStatusOrder(status);
                  const done = order <= getStatusOrder(job.status);
                  return (
                    <span
                      key={status}
                      className={`rounded px-2 py-0.5 text-xs ${done ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}
                    >
                      {CLIENT_JOB_STATUS_LABELS[status]}
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectTimeline({ currentStatus }: { currentStatus: string }) {
  const displayStatus = getDisplayStatusForTimeline(currentStatus as ProjectStatus);
  const currentOrder = CLIENT_VISIBLE_STATUSES.indexOf(displayStatus);

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {CLIENT_VISIBLE_STATUSES.map((status, i) => {
        const done = i <= currentOrder;
        const current = status === displayStatus;
        return (
          <span
            key={status}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              current ? "bg-lime-500/25 text-lime-700 border border-lime-500/50" : done ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {PROJECT_STATUS_LABELS[status] ?? status}
          </span>
        );
      })}
    </div>
  );
}

function ProjectNastenka({ project }: { project: ProjectData }) {
  const status = project.status as ProjectStatus;
  const code = project.project_code ?? project.id.slice(0, 8);
  const needsBrief = status === "PAID" || status === "WAITING_BRIEF";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        {project.brief?.brand_name && project.brief.brand_name !== "—" ? project.brief.brand_name : "Váš projekt"}
      </h1>
      <p className="font-mono text-sm text-slate-500">{project.project_code ?? code}</p>
      <nav className="flex flex-wrap gap-3 text-sm">
        <span className="font-medium text-slate-800">Nástěnka</span>
        {needsBrief && (
          <>
            <span className="text-slate-400">·</span>
            <Link
              href={`/client/${encodeURIComponent(code)}/brief`}
              className="text-slate-600 hover:text-slate-900"
            >
              Dotazník
            </Link>
          </>
        )}
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-800">Stav zakázky</h2>
        <p className="mt-2 text-lg font-medium text-lime-600">
          {PROJECT_STATUS_LABELS[status] ?? status}
        </p>
        <ProjectTimeline currentStatus={status} />
      </div>

      {needsBrief && (
        <div className="rounded-xl border border-lime-200 bg-lime-50 p-6">
          <h2 className="font-semibold text-slate-800">Vyplňte dotazník</h2>
          <p className="mt-2 text-sm text-slate-600">
            Pro pokračování projektu prosím vyplňte údaje o vaší značce.
          </p>
          <Link
            href={`/client/${encodeURIComponent(code)}/brief`}
            className="mt-4 inline-block rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-lime-400"
          >
            Vyplnit dotazník
          </Link>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Aktualizováno: {new Date(project.updated_at).toLocaleDateString("cs-CZ")}
      </p>
    </div>
  );
}

function KreativaLanding({ onLoggedIn }: { onLoggedIn: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/project/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), pin: pin.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.redirect) {
        router.push(data.redirect);
        return;
      }
      setError(data.error ?? "Neplatný kód nebo PIN.");
    } catch {
      setError("Přihlášení se nezdařilo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Vstup do kreativy</h1>
        <p className="mt-2 text-slate-600">
          Použijte odkaz z e-mailu nebo zadejte kód projektu a PIN.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-800">Přihlásit se k projektu</h2>
        <p className="mt-1 text-sm text-slate-500">
          Kód a PIN jste obdrželi po platbě nebo konzultaci.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="kreativa-code" className="block text-sm font-medium text-slate-700">Kód projektu</label>
            <input
              id="kreativa-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="např. ABC-12345"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
              required
            />
          </div>
          <div>
            <label htmlFor="kreativa-pin" className="block text-sm font-medium text-slate-700">PIN</label>
            <input
              id="kreativa-pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? "Přihlašuji…" : "Vstoupit"}
          </button>
        </form>
      </div>
    </div>
  );
}

function KreativaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [project, setProject] = useState<ProjectData | null>(null);
  const [projectLoading, setProjectLoading] = useState(!token);

  useEffect(() => {
    if (token) {
      setProjectLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/project");
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data.ok && data.project) setProject(data.project);
      } catch {
        // show landing when no project
      } finally {
        if (!cancelled) setProjectLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (token) {
    return (
      <ClientTokenGuard>
        {(_, t) => <JobNastenka token={t} />}
      </ClientTokenGuard>
    );
  }

  if (projectLoading) {
    return (
      <div className="py-12 text-center text-slate-500">
        Načítám…
      </div>
    );
  }

  if (project) {
    return <ProjectNastenka project={project} />;
  }

  return <KreativaLanding onLoggedIn={() => router.push("/kreativa")} />;
}

export default function KreativaPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500">Načítám…</div>}>
      <KreativaContent />
    </Suspense>
  );
}
