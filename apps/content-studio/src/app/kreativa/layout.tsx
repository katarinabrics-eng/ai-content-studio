import Link from "next/link";

export default function KreativaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="font-semibold text-slate-800">Kreativa</span>
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Zpět na úvod
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
