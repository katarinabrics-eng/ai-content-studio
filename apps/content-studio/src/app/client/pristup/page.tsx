"use client";

import { useState } from "react";
import Link from "next/link";

type Entry = { type: "diagnostika"; id: string; url: string; label: string } | { type: "project"; id: string; projectCode: string; url: string; label: string };

export default function PristupPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Zadejte e-mail.");
      return;
    }
    setLoading(true);
    setError(null);
    setEntries(null);
    try {
      const res = await fetch("/api/client/pristup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Nepodařilo se vyhledat.");
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      setEntries(data.entries ?? []);
      if (!data.entries?.length) {
        setError("K tomuto e-mailu nemáme přiřazenou žádnou diagnostiku ani projekt.");
      }
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0c0c14] text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-2">Přístup pro klienty</h1>
        <p className="text-zinc-400 text-sm text-center mb-8">
          Zadejte e-mail, který jste uvedli u diagnostiky nebo projektu. Otevřeme vám příslušnou pracovní plochu.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vas@email.cz"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#A8EB12]/50"
            autoComplete="email"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#A8EB12] text-zinc-900 font-semibold py-3 hover:bg-[#b8f022] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Vyhledávám…" : "Vstoupit"}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
        {entries && entries.length > 0 && (
          <div className="mt-8 space-y-3">
            <p className="text-zinc-400 text-sm">Vyberte, kam chcete vstoupit:</p>
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={entry.url}
                    className="block rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[#A8EB12] hover:bg-white/10 transition-colors"
                  >
                    {entry.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-8 text-center">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm">
            ← Zpět na úvod
          </Link>
        </p>
      </div>
    </main>
  );
}
