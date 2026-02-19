import { Suspense } from "react";
import { ClientNav } from "./ClientNav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-slate-800">Klientský portál</span>
          <Suspense fallback={<nav className="flex gap-4 text-sm text-slate-400">…</nav>}>
            <ClientNav />
          </Suspense>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
