"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "../components/Header";

type Project = {
  id: string;
  client_id: string;
  type: string;
  status: string;
  intake_data: Record<string, unknown>;
  created_at: string;
};

function StudioContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(!!clientId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/lucifera-diagnostic/projects?clientId=${encodeURIComponent(clientId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setProjects(data.projects ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Nepodařilo se načíst projekty.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return (
    <>
      <section className="mx-auto max-w-[820px] px-6 py-12">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Studio</h1>
        <p className="mt-2 text-[#6F6F6F]">
          Přehled projektů, stav, intake odpovědi, placeholder pro upload prezentace.
        </p>

        {loading && (
          <p className="mt-6 text-sm text-[#6F6F6F]">Načítám projekty…</p>
        )}
        {error && (
          <p className="mt-6 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && (
          <div className="mt-8 space-y-6">
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-[#EAEAE7] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-medium text-[#1A1A1A]">Projekty</h2>
                <p className="mt-2 text-sm text-[#6F6F6F]">
                  {clientId
                    ? "Žádné projekty. Po dokončení diagnostiky a platby se zde objeví projekt."
                    : "Po přihlášení nebo po dokončení platby uvidíte zde své projekty. Pro náhled zadejte do URL parametr clientId."}
                </p>
                <div className="mt-4 min-h-[120px] rounded-xl border border-dashed border-[#EAEAE7] flex items-center justify-center">
                  <span className="text-sm text-[#6F6F6F]">
                    Nahraná prezentace (placeholder)
                  </span>
                </div>
              </div>
            ) : (
              projects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-[#EAEAE7] bg-white p-6 shadow-sm"
                >
                  <h2 className="text-lg font-medium text-[#1A1A1A]">
                    {p.type === "diagnostic" ? "Lucifera Diagnostic" : p.type}
                  </h2>
                  <p className="mt-1 text-sm text-[#6F6F6F]">
                    Stav:{" "}
                    <span
                      className={
                        p.status === "active"
                          ? "text-green-700"
                          : p.status === "closed"
                            ? "text-[#6F6F6F]"
                            : "text-amber-700"
                      }
                    >
                      {p.status === "pending"
                        ? "čeká"
                        : p.status === "active"
                          ? "aktivní"
                          : "uzavřený"}
                    </span>
                  </p>
                  {p.intake_data &&
                    Object.keys(p.intake_data).length > 0 && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium text-[#6F6F6F]">
                          Intake odpovědi
                        </summary>
                        <pre className="mt-2 overflow-auto rounded-lg bg-[#F7F7F5] p-3 text-xs text-[#1A1A1A]">
                          {JSON.stringify(p.intake_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  <div className="mt-4 min-h-[100px] rounded-xl border border-dashed border-[#EAEAE7] flex items-center justify-center">
                    <span className="text-sm text-[#6F6F6F]">
                      Nahraná prezentace (placeholder)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </>
  );
}

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A]">
      <Header />
      <Suspense
        fallback={
          <section className="mx-auto max-w-[820px] px-6 py-12">
            <p className="text-[#6F6F6F]">Načítám…</p>
          </section>
        }
      >
        <StudioContent />
      </Suspense>
    </main>
  );
}
