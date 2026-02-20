"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeProjectCode, normalizePin } from "@/lib/project-code-normalize";

export default function VstupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setReason("");
    setLoading(true);
    const normCode = normalizeProjectCode(code);
    const normPin = normalizePin(pin);
    try {
      const res = await fetch("/api/project/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normCode, pin: normPin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Neplatný kód nebo PIN.");
        setReason((data.reason as string) ?? "");
        setLoading(false);
        return;
      }
      router.push(data.redirect ?? "/project");
    } catch {
      setError("Přihlášení se nezdařilo.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-lucifera-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-white">Přístup k projektu</h1>
        <p className="mt-1 text-sm text-white/70">Zadejte kód a PIN z úvodní stránky po vytvoření projektu.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90">Kód projektu</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-mono text-white uppercase placeholder:text-white/40" placeholder="LCF-20260220-PPVQ" maxLength={32} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90">PIN</label>
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-mono text-white placeholder:text-white/40" placeholder="••••••" maxLength={16} required />
          </div>
          {error && (
            <div>
              <p className="text-sm text-red-400">{error}</p>
              {reason && process.env.NODE_ENV !== "production" && (
                <p className="mt-1 text-xs text-white/50 font-mono">reason: {reason}</p>
              )}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-lime-primary w-full">
            {loading ? "Přihlašuji…" : "Přihlásit"}
          </button>
        </form>
      </div>
    </main>
  );
}
