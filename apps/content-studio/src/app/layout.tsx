import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Content Studio",
  description: "Správa klientských vstupů",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <a href="/" className="font-semibold text-slate-800">AI Content Studio</a>
            <a href="/intake" className="ml-6 text-slate-600 hover:text-slate-900">Intake</a>
            <a href="/drafts" className="ml-6 text-slate-600 hover:text-slate-900">Návrhy postů</a>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
