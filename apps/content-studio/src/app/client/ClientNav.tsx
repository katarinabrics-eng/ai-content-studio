"use client";

import { useSearchParams } from "next/navigation";

const links = [
  { href: "/client/onboarding", label: "Onboarding" },
  { href: "/client/status", label: "Stav" },
  { href: "/client/approval", label: "Schválení" },
  { href: "/client/assets", label: "Assety" },
];

export function ClientNav() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return (
    <nav className="flex gap-4 text-sm text-slate-600">
      {links.map(({ href, label }) => {
        const url = token ? `${href}?token=${encodeURIComponent(token)}` : href;
        return (
          <a key={href} href={url} className="hover:text-slate-900">
            {label}
          </a>
        );
      })}
    </nav>
  );
}
