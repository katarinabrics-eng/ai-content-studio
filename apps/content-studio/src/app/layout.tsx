import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Content Studio Lucifera",
  description: "Dáte nám přístup k brandu. My vám dodáme příspěvky, které prodávají. AI + kreativní kurátor.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-lucifera-dark text-white">
        <a
          href="/admin/login?next=/admin/klienti"
          className="fixed top-4 right-4 z-[100] h-1.5 w-1.5 rounded-full bg-stone-400/50 hover:bg-stone-400 focus:bg-stone-400 focus:outline-none transition-colors"
          style={{ minWidth: 6, minHeight: 6 }}
          aria-label="Administrace"
          title="Admin – Klienti a diagnostiky"
        />
        {children}
      </body>
    </html>
  );
}
