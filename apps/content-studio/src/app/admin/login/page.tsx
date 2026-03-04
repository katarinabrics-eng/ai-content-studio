"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin/dashboard";
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
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-[#A8EB12]/50 focus:outline-none focus:ring-1 focus:ring-[#A8EB12]/30"
                autoComplete="current-password"
                disabled={isPending}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-[#A8EB12] px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-[#A8EB12]/90 disabled:opacity-60"
            >
              {isPending ? "Ověřuji…" : "Přihlásit se"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowReset(!showReset)}
            className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 underline"
          >
            {showReset ? "Skrýt nastavení hesla" : "Zapomenuté heslo? Nastavit nové"}
          </button>

          {showReset && (
            <form onSubmit={handleReset} className="mt-4 border-t border-white/10 pt-4 space-y-3">
              <p className="text-xs text-zinc-500">
                Nastavte heslo v databázi (funkce env ADMIN_PASSWORD pak nepoužijete). Do .env.local přidejte ADMIN_SETUP_TOKEN a zadejte ho níže.
              </p>
              <input
                type="password"
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
                placeholder="Setup token (ADMIN_SETUP_TOKEN)"
                className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nové heslo (min. 6 znaků)"
                className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
                minLength={6}
                required
              />
              {resetError && <p className="text-sm text-red-400">{resetError}</p>}
              {resetSuccess && <p className="text-sm text-green-400">{resetSuccess}</p>}
              <button
                type="submit"
                disabled={resetPending}
                className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-amber-400 disabled:opacity-60"
              >
                {resetPending ? "Nastavuji…" : "Nastavit nové heslo"}
              </button>
            </form>
          )}
        </div>

        {process.env.NODE_ENV === "development" && (
          <p className="text-center text-xs text-zinc-500">
            Heslo je v .env.local (ADMIN_PASSWORD).
          </p>
        )}
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0c0c14] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Načítání…</div>
      </main>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
