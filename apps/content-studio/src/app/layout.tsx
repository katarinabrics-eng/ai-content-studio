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
  title: "AI Content Studio Lucifera",
  description: "Dáte nám přístup k brandu. My vám dodáme příspěvky, které prodávají. AI + kreativní kurátor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-lucifera-dark text-white">
        <a
          href="/admin/login"
          className="fixed top-4 right-4 z-[100] h-1.5 w-1.5 rounded-full bg-stone-400 hover:bg-stone-600 focus:bg-stone-600 focus:outline-none"
          style={{ minWidth: 6, minHeight: 6 }}
          aria-label="Administrace"
        />
        {children}
      </body>
    </html>
  );
}
