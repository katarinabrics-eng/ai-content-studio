import Link from "next/link";

const quickLinks = [
  { href: "/admin/new-client", label: "Nový klient", desc: "Zadat údaje a spustit AI diagnostiku", icon: "➕" },
  { href: "/admin/klienti", label: "Klienti", desc: "Přehled klientů a projektů", icon: "👥" },
  { href: "/admin/projects", label: "Projekty", desc: "CO se zpracovává, KDE to běží", icon: "📋" },
  { href: "/admin/kurator", label: "Schválení", desc: "Fronta ke schválení, kurátor", icon: "✅" },
  { href: "/admin/clients", label: "Klienti (diagnostika)", desc: "Scan + platba + termín", icon: "🔬" },
  { href: "/admin/styles", label: "Grafické styly", desc: "Šablony pro posty", icon: "🎨" },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1
        className="text-2xl font-semibold text-[#F5F5F5]"
        style={{ fontFamily: "var(--font-admin-serif), serif" }}
      >
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-[#888]">Kurátorský admin panel · Lucifera AI Content Studio</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-4 rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-5 transition-colors hover:bg-[#242424] hover:border-[#C9A96E]/20"
            style={{ boxShadow: "0 0 40px rgba(201,169,110,0.05)" }}
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="font-medium text-[#F5F5F5]">{item.label}</div>
              <div className="text-sm text-[#888] mt-0.5">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
