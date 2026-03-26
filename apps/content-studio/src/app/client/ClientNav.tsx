"use client";

import { useSearchParams, useParams } from "next/navigation";

export function ClientNav() {
  const searchParams = useSearchParams();
  const params = useParams();
  const token = searchParams.get("token") ?? "";
  const projectCode = params?.projectCode as string | undefined;

  const links = [
    { href: "/client/dashboard", label: "Dashboard" },
    { href: "/client/status", label: "Výsledky Scanu" },
    { href: "/client/approval", label: "Ke schválení" },
    { href: "/client/assets", label: "Mé dokumenty" },
    ...(projectCode
      ? [{ href: `/client/${projectCode}/media-library`, label: "Vizuální knihovna" }]
      : []),
  ];

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
