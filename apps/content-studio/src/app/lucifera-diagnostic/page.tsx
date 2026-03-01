import { Header } from "../components/Header";
import Link from "next/link";

export const metadata = {
  title: "Lucifera Diagnostic | Diagnostika značky",
  description: "Zjistěte, jak na tom vaše značka je a kam směřovat dál.",
};

export default function LuciferaDiagnosticPage() {
  return (
    <main className="min-h-screen bg-[#0d1210] text-white">
      <Header />
      <section className="relative mx-auto max-w-[1360px] px-6 py-16 xl:px-10">
        {/* Video placeholder */}
        <div
          className="mx-auto aspect-video max-w-4xl rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center"
          aria-hidden
        >
          <span className="text-white/50 text-sm">Video placeholder</span>
        </div>
        <div className="mx-auto mt-12 max-w-xl text-center">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Diagnostika značky
          </h1>
          <p className="mt-4 text-white/70">
            Krátký průvodce zjistí, jak na tom vaše vizuální komunikace je a kam směřovat další krok.
          </p>
          <Link
            href="/lucifera-diagnostic/start"
            className="mt-8 inline-block rounded-full bg-[#A8EB12] px-6 py-3 text-sm font-medium text-[#0d1210] transition hover:bg-[#A8EB12]/90"
          >
            Začít diagnostiku
          </Link>
        </div>
      </section>
    </main>
  );
}
