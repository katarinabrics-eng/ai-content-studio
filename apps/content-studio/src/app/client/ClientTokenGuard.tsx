"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type ClientInfo = {
  id: string;
  email: string;
  name: string;
};

export function ClientTokenGuard({
  children,
  fallback,
}: {
  children: (client: ClientInfo, token: string) => React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const validate = useCallback(async () => {
    if (!token.trim()) {
      setError("Chybí přístupový odkaz.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/client/access/validate?token=${encodeURIComponent(token)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Neplatný nebo expirovaný odkaz. Požádejte o nový.");
        setLoading(false);
        return;
      }
      setClient(data.client);
      setError(null);
    } catch {
      setError("Nepodařilo se ověřit odkaz.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    validate();
  }, [validate]);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
        Ověřuji přístup…
      </div>
    );
  }
  if (error || !client) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">{error ?? "Neplatný odkaz"}</p>
        <p className="mt-2 text-sm">
          Pro nový odkaz kontaktujte správce nebo použijte odkaz z emailu.
        </p>
        {fallback}
      </div>
    );
  }
  return <>{children(client, token)}</>;
}
