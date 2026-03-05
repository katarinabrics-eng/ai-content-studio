"use client";

import { useState, useEffect } from "react";

const navItems = [
  { href: "/brand-scan", label: "Brand Scan" },
  { href: "/#sluzby", label: "Služby" },
  { href: "/portrety", label: "Portréty" },
  { href: "/premiova-vizualni-identita", label: "Prémiová identita" },
  { href: "/premiova-vizualni-identita#faq", label: "FAQ" },
  { href: "/#zaver", label: "Kontakt" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-14 transition-colors duration-200 ${
        scrolled
          ? "border-b border-stone-200/60 bg-white/80 backdrop-blur-md"
          : "border-b border-stone-200 bg-white"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1360px] items-center justify-between gap-4 px-6 xl:px-10">
        <a
          href="/"
          className="flex shrink-0 items-center focus:outline-none"
          aria-label="Lucifera"
        >
          <img
            src="/placeholders/LUCIFERA-Logo-Left.png"
            alt="Lucifera"
            className="h-7 w-auto shrink-0 object-contain sm:h-9 lg:h-10"
          />
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap text-sm text-stone-600 transition-colors hover:text-stone-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 lg:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <a
            href="/client/pristup"
            className="shrink-0 text-sm text-stone-600 hover:text-stone-900 hidden sm:inline"
          >
            Pro klienty
          </a>
          <a
            href="/rezervace"
            className="rounded-lg bg-[#A8EB12] px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-[#A8EB12]/90 sm:px-5"
          >
            Domluvit konzultaci
          </a>
        </div>
      </div>

      {menuOpen && (
        <nav className="absolute left-0 right-0 top-14 border-b border-stone-200 bg-white px-4 py-4 shadow-sm lg:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/client/pristup"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                Pro klienty
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
