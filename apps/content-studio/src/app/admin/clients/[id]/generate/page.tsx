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

export default function AdminClientGeneratePage() {
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
        <Link href="/admin/clients" className="mt-2 inline-block text-sm text-[#A8EB12] hover:underline">← Seznam klientů</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <Link href={`/admin/clients/${id}`} className="text-sm text-[#888] hover:text-[#A8EB12]">← Detail klienta</Link>
      <h1 className="mt-4 text-2xl font-semibold text-[#F5F5F5]" style={{ fontFamily: "var(--font-admin-serif), serif" }}>
        Generování postů · {project.name ?? project.email ?? "Klient"}
      </h1>
      <p className="mt-1 text-sm text-[#888]">Konfigurace, texty, náhled, schválení.</p>
      <div className="mt-8 rounded-xl border border-white/[0.06] bg-[#141414] p-8 text-center" style={{ boxShadow: "0 0 40px rgba(168,235,18,0.04)" }}>
        <p className="text-[#888]">Pracovní plocha kurátora bude doplněna podle CURSOR_PROMPT.</p>
        <Link href={`/admin/clients/${id}`} className="mt-4 inline-flex rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-[#888] hover:bg-white/[0.08]">Zpět na detail</Link>
      </div>
    </div>
  );
}
