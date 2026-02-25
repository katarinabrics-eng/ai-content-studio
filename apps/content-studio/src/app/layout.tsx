import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Lucifera — Prémiová vizuální identita pro osobní značky",
  description: "Vizuální identita pro podnikatele a experty, kteří vstupují do vyšší kategorie trhu. Strategický směr, portrétní focení a konzistentní vizuální systém.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-stone-50 text-stone-900">
        <a
          href="/admin/login"
          className="fixed top-4 right-4 z-[100] h-1.5 w-1.5 rounded-full bg-stone-400/50 hover:bg-stone-400 focus:bg-stone-400 focus:outline-none transition-colors"
          style={{ minWidth: 6, minHeight: 6 }}
          aria-label="Administrace"
          title="Admin login"
        />
        {children}
      </body>
    </html>
  );
}
