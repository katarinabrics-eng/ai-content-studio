"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ScanResultScrollExperience } from "@/app/start/ScanResultScrollExperience";
import type { ScanResult } from "@/app/start/ScanResultScrollExperience";

type ProjectData = {
  id: string;
  scan_result: Record<string, unknown>;
  access_expires_at: string | null;
  name?: string | null;
  email?: string | null;
  web_url?: string | null;
  manual_input?: string | null;
  outputs_activated?: boolean;
};
type AccessState =
  | { status: "loading" }
  | { status: "expired" }
  | { status: "not_found" }
  | { status: "ok"; project: ProjectData };

function DiagnostikaViewContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<AccessState>({ status: "loading" });
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editManualInput, setEditManualInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchAccess = useCallback(async () => {
    if (!token.trim()) {
      setState({ status: "not_found" });
      return;
    }
    const res = await fetch(`/api/diagnostika/access?token=${encodeURIComponent(token.trim())}`, { cache: "no-store" });
    const data = await res.json();
    if (data.ok && data.project) {
      setState({ status: "ok", project: data.project });
    } else if (data.error === "expired") {
      setState({ status: "expired" });
    } else {
      setState({ status: "not_found" });
    }
  }, [token]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  if (state.status === "loading") {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-400">
        <p>Načítám…</p>
      </main>
    );
  }

  if (state.status === "not_found") {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-zinc-300">
        <p className="text-lg">Odkaz je neplatný nebo již nebyl aktivován.</p>
        <Link href="/diagnostika" className="mt-4 text-[#A8EB12] underline">Spustit diagnostiku</Link>
      </main>
    );
  }

  if (state.status === "expired") {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-zinc-300">
        <h1 className="text-xl font-semibold text-white">Přístup vypršel</h1>
        <p className="mt-2 text-center max-w-md">
          Bezplatný 7denní přístup k výsledkům diagnostiky skončil. Vaše data u nás zůstávají (nerealizované projekty).
        </p>
        <p className="mt-4 text-zinc-400">Chcete‑li pokračovat s prémiovou vizuální identitou nebo konzultací:</p>
        <Link
          href="/rezervace?from=premiova"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#A8EB12] px-5 py-2.5 text-sm font-medium text-[#0a0a0a] hover:bg-[#b8f022]"
        >
          Chci – Prémiovou vizuální identitu
        </Link>
        <Link href="/diagnostika" className="mt-4 text-sm text-zinc-500 underline">Spustit diagnostiku znovu</Link>
      </main>
    );
  }

  const result = state.project.scan_result as ScanResult;
  if (!result || typeof result !== "object") {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-500">
        <p>Žádná data k zobrazení.</p>
      </main>
    );
  }

  const project = state.project;
  const outputsActivated = project.outputs_activated ?? false;
  const syncEditFromProject = () => {
    setEditName(project.name ?? "");
    setEditEmail(project.email ?? "");
    setEditManualInput(project.manual_input ?? "");
  };

  const saveInput = async () => {
    setEditError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/diagnostika/update-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          name: editName.trim() || null,
          email: editEmail.trim() || null,
          manual_input: editManualInput.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.ok && data.project) {
        setState({
          status: "ok",
          project: {
            ...project,
            name: data.project.name ?? project.name,
            email: data.project.email ?? project.email,
            manual_input: data.project.manual_input ?? project.manual_input,
          },
        });
        setShowEdit(false);
      } else {
        setEditError(data?.error ?? "Chyba při ukládání.");
      }
    } catch {
      setEditError("Chyba připojení.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <span className="text-sm text-zinc-400 truncate">
            {(result as { client_name?: string }).client_name || project.name || project.email || "Diagnostika"}
          </span>
          <button
            type="button"
            onClick={() => {
              setShowEdit((v) => !v);
              if (!showEdit) syncEditFromProject();
            }}
            className="text-sm text-[#A8EB12] hover:underline shrink-0"
          >
            {showEdit ? "Zavřít úpravy" : "Upravit mé údaje"}
          </button>
        </div>
        {showEdit && (
          <div className="max-w-2xl mx-auto mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Jméno / firma</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 text-zinc-200 text-sm"
                placeholder="Vaše jméno nebo firma"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">E-mail</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 text-zinc-200 text-sm"
                placeholder="vas@email.cz"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Popis / vstupní údaje o značce</label>
              <textarea
                value={editManualInput}
                onChange={(e) => setEditManualInput(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 text-zinc-200 text-sm resize-y"
                placeholder="Text, který jste zadali při diagnostice (můžete upravit)"
              />
            </div>
            {editError && <p className="text-sm text-red-400">{editError}</p>}
            <button
              type="button"
              onClick={saveInput}
              disabled={saving}
              className="rounded-lg bg-[#A8EB12] px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-[#b8f022] disabled:opacity-50"
            >
              {saving ? "Ukládám…" : "Uložit"}
            </button>
          </div>
        )}
      </div>
      {!outputsActivated ? (
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <p className="text-lg text-zinc-300 mb-2">Výstupy pro vás ještě nejsou připraveny.</p>
          <p className="text-sm text-zinc-500">
            Kurátor je aktivuje po dokončení příprav. Zkuste stránku obnovit později.
          </p>
        </div>
      ) : (
        <ScanResultScrollExperience
          result={result}
          projectId={state.project.id}
          displayName={(result as { client_name?: string }).client_name ?? project.name ?? ""}
          displayWeb={project.web_url ?? ""}
          accessToken={token || undefined}
          onEnterWorkspace={undefined}
        />
      )}
    </main>
  );
}

export default function DiagnostikaViewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-400">
          <p>Načítám…</p>
        </main>
      }
    >
      <DiagnostikaViewContent />
    </Suspense>
  );
}
