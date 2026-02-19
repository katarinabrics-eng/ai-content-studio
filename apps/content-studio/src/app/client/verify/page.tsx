"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token?.trim()) {
      setError("Chybí přístupový odkaz.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/client/access/verify?token=${encodeURIComponent(token)}`
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Neplatný nebo expirovaný odkaz.");
          return;
        }
        const redirectTo = data.redirectTo ?? "/client/onboarding";
        const newToken = data.token;
        if (newToken) {
          router.replace(`${redirectTo}?token=${encodeURIComponent(newToken)}`);
        } else {
          router.replace(redirectTo);
        }
      } catch {
        if (!cancelled) setError("Nepodařilo ověřit odkaz.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">{error}</p>
        <p className="mt-2 text-sm">
          Požádejte o nový odkaz nebo kontaktujte správce.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
      Ověřuji odkaz a přesměrovávám…
    </div>
  );
}

/** Entry from magic link email: ?token=... Calls verify API (rotate), then redirects to onboarding. */
export default function ClientVerifyPage() {
  return (
    <Suspense fallback={
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
        Načítám…
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
