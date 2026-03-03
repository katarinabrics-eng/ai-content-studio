"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type PostWithProject = {
  id: string;
  project_id: string;
  status: string;
  hook: string | null;
  body: string | null;
  cta: string | null;
  canva_preview_url: string | null;
  canva_edit_url: string | null;
  agent_style: string | null;
  platform: string | null;
  scheduled_for: string | null;
  curator_note: string | null;
  client_note: string | null;
  created_at: string;
  project_code: string | null;
  client_email: string | null;
};

export default function AdminKuratorPage() {
  const [posts, setPosts] = useState<PostWithProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PostWithProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [curatorNote, setCuratorNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  const fetchQueue = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/kurator/queue")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.posts)) setPosts(d.posts);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    fetch(`/api/admin/kurator/${selectedId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.post) {
          setDetail(d.post);
          setCuratorNote(d.post.curator_note ?? "");
        } else setDetail(null);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  function handleApproveToClient() {
    if (!selectedId) return;
    setActionLoading(true);
    fetch(`/api/admin/kurator/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_to_client" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setSelectedId(null);
          setDetail(null);
          fetchQueue();
        }
      })
      .finally(() => setActionLoading(false));
  }

  function handleAddNote() {
    if (!selectedId) return;
    setActionLoading(true);
    fetch(`/api/admin/kurator/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_note", curator_note: curatorNote }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.post) setDetail(d.post);
      })
      .finally(() => setActionLoading(false));
  }

  return (
    <main className="min-h-screen bg-[#0c0c14] p-6 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Kurátorský dashboard</h1>
            <p className="mt-1 text-zinc-400">Fronta příspěvků ke schválení · Schválit → klientovi</p>
          </div>
          <Link
            href="/admin/projects"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
          >
            ← Projekty
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Fronta */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold uppercase text-zinc-500">Fronta ({posts.length})</h2>
            {loading ? (
              <p className="mt-4 text-zinc-500">Načítám…</p>
            ) : posts.length === 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-zinc-500">Žádné příspěvky ke schválení.</p>
                <button
                  type="button"
                  disabled={seedLoading}
                  onClick={() => {
                    setSeedLoading(true);
                    fetch("/api/admin/kurator/seed-demo", { method: "POST" })
                      .then((r) => r.json())
                      .then((d) => {
                        if (d.ok) fetchQueue();
                      })
                      .finally(() => setSeedLoading(false));
                  }}
                  className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10 disabled:opacity-50"
                >
                  {seedLoading ? "Vytvářím…" : "Vytvořit testovací příspěvek"}
                </button>
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {posts.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                        selectedId === p.id
                          ? "border-[#A8EB12]/50 bg-[#A8EB12]/10 text-white"
                          : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      }`}
                    >
                      <span className="font-medium">{p.project_code ?? "—"}</span>
                      <span className="block truncate text-xs text-zinc-500">
                        {p.scheduled_for ? new Date(p.scheduled_for).toLocaleDateString("cs-CZ") : ""} · {p.platform ?? "IG"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Detail */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            {!selectedId ? (
              <p className="text-zinc-500">Vyberte příspěvek z fronty.</p>
            ) : detailLoading ? (
              <p className="text-zinc-500">Načítám detail…</p>
            ) : detail ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Detail příspěvku</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Klient: {detail.client_email ?? "—"} · {detail.project_code ?? ""}
                    </p>
                  </div>
                  {detail.canva_edit_url && (
                    <a
                      href={detail.canva_edit_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/20"
                    >
                      Upravit v Canva
                    </a>
                  )}
                </div>

                {detail.canva_preview_url && (
                  <div className="mt-4">
                    <p className="text-xs uppercase text-zinc-500">Náhled</p>
                    <a
                      href={detail.canva_preview_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block max-w-sm"
                    >
                      <img
                        src={detail.canva_preview_url}
                        alt="Náhled"
                        className="rounded-lg border border-white/10 object-cover"
                      />
                    </a>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <div>
                    <span className="text-xs text-zinc-500">HOOK</span>
                    <p className="mt-0.5 text-white">{detail.hook ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">BODY</span>
                    <p className="mt-0.5 text-white/90">{detail.body ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">CTA</span>
                    <p className="mt-0.5 text-[#A8EB12]">{detail.cta ?? "—"}</p>
                  </div>
                  {detail.agent_style && (
                    <p className="text-xs text-zinc-500">Agent: {detail.agent_style}</p>
                  )}
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <label className="block text-sm font-medium text-zinc-400">Poznámka pro AI / kurátora</label>
                  <textarea
                    value={curatorNote}
                    onChange={(e) => setCuratorNote(e.target.value)}
                    placeholder="Poznámka k přegenerování nebo pro tým…"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#A8EB12]/40 focus:outline-none"
                    rows={2}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={actionLoading}
                      className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/20 disabled:opacity-50"
                    >
                      Uložit poznámku
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveToClient}
                      disabled={actionLoading}
                      className="rounded-lg bg-[#A8EB12] px-4 py-2 text-sm font-medium text-[#0c0c14] hover:bg-[#b8f022] disabled:opacity-50"
                    >
                      Schválit → klientovi
                    </button>
                  </div>
                </div>

                {detail.client_note && (
                  <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="text-xs font-medium text-amber-200">Komentář klienta</p>
                    <p className="mt-1 text-sm text-zinc-200">{detail.client_note}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-zinc-500">Příspěvek se nepodařilo načíst.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
