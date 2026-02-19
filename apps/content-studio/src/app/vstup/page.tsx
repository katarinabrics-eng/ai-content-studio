"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VstupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/project/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Neplatný kód nebo PIN.");
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
            <input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-mono text-white uppercase placeholder:text-white/40" placeholder="XXXXXXXX" maxLength={8} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90">PIN</label>
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-mono text-white placeholder:text-white/40" placeholder="••••••" maxLength={6} required />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-lime-primary w-full">
            {loading ? "Přihlašuji…" : "Přihlásit"}
          </button>
        </form>
      </div>
    </main>
  );
}
