"use client";

import { Suspense, useEffect, useState } from "react";
import { ClientTokenGuard } from "../ClientTokenGuard";
import {
  CLIENT_JOB_STATUS_LABELS,
  CLIENT_JOB_STATUS_ORDER,
  getStatusOrder,
  type ClientJobStatus,
} from "@/lib/client-status-engine";

type JobRow = {
  id: string;
  week_key: string;
  status: ClientJobStatus;
  due_at: string | null;
  updated_at: string;
};

function StatusContent() {
  return (
    <ClientTokenGuard>
      {(client, token) => <StatusTimeline clientId={client.id} token={token} />}
    </ClientTokenGuard>
  );
}

function StatusTimeline({ token }: { clientId: string; token: string }) {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/client/jobs?token=${encodeURIComponent(token)}`
        );
        const data = await res.json().catch(() => ({}));
        if (data.ok && Array.isArray(data.jobs)) {
          if (!cancelled) setJobs(data.jobs);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const sorted = [...jobs].sort(
    (a, b) => getStatusOrder(a.status) - getStatusOrder(b.status) || b.week_key.localeCompare(a.week_key)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Stav zakázek</h1>
      {loading ? (
        <p className="text-slate-500">Načítám…</p>
      ) : jobs.length === 0 ? (
        <p className="text-slate-500">Zatím nemáte žádné zakázky.</p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((job) => (
            <li
              key={job.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{job.week_key}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-700">
                  {CLIENT_JOB_STATUS_LABELS[job.status]}
                </span>
              </div>
              {job.due_at && (
                <p className="mt-1 text-sm text-slate-500">
                  Termín: {new Date(job.due_at).toLocaleDateString("cs-CZ")}
                </p>
              )}
              <TimelineSteps currentStatus={job.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TimelineSteps({ currentStatus }: { currentStatus: ClientJobStatus }) {
  const currentOrder = getStatusOrder(currentStatus);
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {CLIENT_JOB_STATUS_ORDER.map((status) => {
        const order = getStatusOrder(status);
        const done = order <= currentOrder;
        return (
          <span
            key={status}
            className={`rounded px-2 py-0.5 text-xs ${
              done ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"
            }`}
          >
            {CLIENT_JOB_STATUS_LABELS[status]}
          </span>
        );
      })}
    </div>
  );
}

export default function ClientStatusPage() {
  return (
    <Suspense fallback={<div className="p-6">Načítám…</div>}>
      <StatusContent />
    </Suspense>
  );
}
