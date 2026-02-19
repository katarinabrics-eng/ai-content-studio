"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showReset, setShowReset] = useState(false);
  const [setupToken, setSetupToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetPending, setResetPending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, next }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.redirectTo) {
        router.push(data.redirectTo);
        return;
      }
      setError(data.error || "Přihlášení selhalo.");
    });
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetPending(true);
    fetch("/api/admin/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setupToken, newPassword }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setResetSuccess("Heslo bylo nastaveno. Nyní se přihlaste novým heslem.");
          setSetupToken("");
          setNewPassword("");
        } else {
          setResetError(data.error || "Nastavení hesla selhalo.");
        }
      })
      .catch(() => setResetError("Chyba při nastavování hesla."))
      .finally(() => setResetPending(false));
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-stone-900">Přihlášení</h1>
          <p className="mt-1 text-sm text-stone-600">Pro přístup do administrace.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                Heslo
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Heslo"
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                autoComplete="current-password"
                disabled={isPending}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
            >
              {isPending ? "Ověřuji…" : "Přihlásit se"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowReset(!showReset)}
            className="mt-4 text-sm text-stone-500 hover:text-stone-700 underline"
          >
            {showReset ? "Skrýt nastavení hesla" : "Zapomenuté heslo? Nastavit nové"}
          </button>

          {showReset && (
            <form onSubmit={handleReset} className="mt-4 border-t border-stone-100 pt-4 space-y-3">
              <p className="text-xs text-stone-500">
                Nastavte heslo v databázi (funkce env ADMIN_PASSWORD pak nepoužijete). Do .env.local přidejte ADMIN_SETUP_TOKEN a zadejte ho níže.
              </p>
              <input
                type="password"
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
                placeholder="Setup token (ADMIN_SETUP_TOKEN)"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nové heslo (min. 6 znaků)"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                minLength={6}
                required
              />
              {resetError && <p className="text-sm text-red-600">{resetError}</p>}
              {resetSuccess && <p className="text-sm text-green-600">{resetSuccess}</p>}
              <button
                type="submit"
                disabled={resetPending}
                className="w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {resetPending ? "Nastavuji…" : "Nastavit nové heslo"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-stone-500">
          Heslo je v .env.local (ADMIN_PASSWORD). Po změně restartujte dev server.
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-500 text-sm">Načítání…</div>
      </main>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
