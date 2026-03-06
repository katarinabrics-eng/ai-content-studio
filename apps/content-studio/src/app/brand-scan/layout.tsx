import type { Metadata } from "next";
import { Header } from "../components/Header";

export const metadata: Metadata = {
  title: "Brand Scan — Zjisti kde stojí tvoje značka | Studio Lucifera",
  description:
    "Bezplatná diagnostika značky. Zadej web a během minut víš kde ztrácíš zákazníky. Pět pilířů, Brand DNA, konkrétní výsledky zdarma.",
};

export default function BrandScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
