"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ClientProject = {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
};

export default function AdminClientApprovePage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ClientProject | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(() => {
    fetch(`/api/admin/client-projects/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setProject(d.project);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-[#888]">Načítám…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-[#888]">Projekt nenalezen.</p>
        <Link href="/admin/clients" className="mt-2 inline-block text-sm text-[#C9A96E] hover:underline">← Seznam klientů</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <Link href={`/admin/clients/${id}`} className="text-sm text-[#888] hover:text-[#C9A96E]">← Detail klienta</Link>
      <h1
        className="mt-4 text-2xl font-semibold text-[#F5F5F5]"
        style={{ fontFamily: "var(--font-admin-serif), serif" }}
      >
        Schválení postů · {project.name ?? project.email ?? "Klient"}
      </h1>
      <p className="mt-1 text-sm text-[#888]">Ke schválení / schváleno / zamítnuto, export ZIP.</p>

      <div
        className="mt-8 rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-8 text-center"
        style={{ boxShadow: "0 0 40px rgba(201,169,110,0.05)" }}
      >
        <p className="text-[#888]">Sekce schválení a exportu schválených postů bude doplněna podle CURSOR_PROMPT. Fronta ke schválení je v Kurátor (Schválení).</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link
            href="/admin/kurator"
            className="inline-flex items-center rounded-lg bg-[#C9A96E] px-4 py-2 text-sm font-medium text-[#0F0F0F] hover:bg-[#d4b87a]"
          >
            Otevřít Kurátor
          </Link>
          <Link
            href={`/admin/clients/${id}`}
            className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-[#888] hover:bg-white/[0.08]"
          >
            Zpět na detail klienta
          </Link>
        </div>
      </div>
    </div>
  );
}
