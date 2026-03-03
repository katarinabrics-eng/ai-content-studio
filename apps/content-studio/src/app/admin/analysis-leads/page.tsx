"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Lead = {
  id: string;
  email: string;
  analyzed_url: string;
  result: { brandScore?: { total?: number }; brandDna?: { name?: string }; summary?: string };
  scraped_meta: { url?: string; title?: string };
  created_at: string;
};

export default function AdminAnalysisLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(() => {
    fetch("/api/admin/analysis-leads")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.leads)) setLeads(d.leads);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <main className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Leady z analýzy</h1>
            <p className="mt-1 text-stone-600">
              E-maily a výsledky od lidí, kteří zanechali kontakt po analýze webu (bez Stripe).
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/projects"
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              ← Projekty
            </Link>
            <button
              type="button"
              onClick={() => { setLoading(true); fetchLeads(); }}
              disabled={loading}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Obnovit
            </button>
          </div>
        </div>

        {loading && leads.length === 0 && <p className="mt-6 text-stone-500">Načítám…</p>}

        {!loading && leads.length === 0 && (
          <p className="mt-6 text-stone-500">Zatím žádné leady.</p>
        )}

        {!loading && leads.length > 0 && (
          <ul className="mt-6 space-y-4">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <a
                      href={`mailto:${lead.email}`}
                      className="font-medium text-stone-900 hover:underline"
                    >
                      {lead.email}
                    </a>
                    {lead.analyzed_url && (
                      <p className="mt-1 text-sm text-stone-500 break-all">
                        Web: {lead.analyzed_url}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-stone-400">
                      {new Date(lead.created_at).toLocaleString("cs-CZ")}
                    </p>
                  </div>
                  {typeof lead.result?.brandScore?.total === "number" && (
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-sm font-medium text-stone-700">
                      Skóre: {lead.result.brandScore.total}
                    </span>
                  )}
                </div>
                {lead.result?.brandDna?.name && (
                  <p className="mt-2 text-sm text-stone-600">
                    Značka: {lead.result.brandDna.name}
                  </p>
                )}
                {lead.result?.summary && (
                  <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                    {lead.result.summary}
                  </p>
                )}
                <details className="mt-3">
                  <summary className="text-xs text-stone-500 cursor-pointer hover:text-stone-700">
                    Celý výsledek (JSON)
                  </summary>
                  <pre className="mt-2 rounded bg-stone-50 p-3 text-xs text-stone-600 overflow-auto max-h-48">
                    {JSON.stringify(lead.result, null, 2)}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
