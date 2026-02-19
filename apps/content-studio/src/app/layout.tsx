import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Content Studio Lucifera",
  description: "Dáte nám přístup k brandu. My vám dodáme příspěvky, které prodávají. AI + kreativní kurátor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased min-h-screen bg-stone-50 text-stone-900">
        <a
          href="/admin/login"
          className="fixed top-4 right-4 z-[100] h-2 w-2 rounded-full bg-stone-400 hover:bg-stone-600 focus:bg-stone-600 focus:outline-none"
          style={{ minWidth: 6, minHeight: 6 }}
          aria-label="Administrace"
        />
        {children}
      </body>
    </html>
  );
}
