import Link from "next/link";
import { DM_Sans, DM_Serif_Display } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-admin-sans",
});
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-admin-serif",
});

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/new-client", label: "Nový klient", icon: "➕" },
  { href: "/admin/klienti", label: "Klienti", icon: "👥" },
  { href: "/admin/styles", label: "Styly", icon: "🎨" },
  { href: "/admin/projects", label: "Projekty", icon: "📋" },
  { href: "/admin/kurator", label: "Schválení", icon: "✅" },
  { href: "/admin/clients", label: "Klienti (diagnostika)", icon: "🔬" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${dmSerif.variable} flex h-screen bg-[#0A0A0A] text-[#F0F0F0] overflow-hidden font-sans`}
      style={{ fontFamily: "var(--font-admin-sans), system-ui, sans-serif" }}
    >
      {/* Sidebar – sjednoceno s webem: lime #A8EB12, pozadí #141414 */}
      <aside
        className="w-[260px] flex-shrink-0 border-r border-white/[0.06] bg-[#141414] flex flex-col"
        style={{ boxShadow: "0 0 40px rgba(168,235,18,0.04)" }}
      >
        <div className="p-5 border-b border-white/[0.06]">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-[#A8EB12] focus:outline-none focus:ring-2 focus:ring-[#A8EB12]/50 rounded"
            style={{ fontFamily: "var(--font-admin-serif), serif" }}
          >
            <span className="text-xl">🎨</span>
            <span className="text-lg font-serif">Lucifera</span>
          </Link>
          <p className="text-xs text-[#888] mt-1">Admin</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-[#888] hover:text-[#F0F0F0] hover:bg-white/[0.06] transition-colors text-sm"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-white/[0.06]">
          <Link
            href="/admin/login"
            className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-[#888] hover:text-[#F0F0F0] hover:bg-white/[0.06] transition-colors text-sm"
          >
            <span>⚙️</span>
            <span>Nastavení</span>
          </Link>
        </div>
      </aside>
      {/* Hlavní pracovní plocha */}
      <main className="flex-1 overflow-auto bg-[#0A0A0A] min-w-0">
        {children}
      </main>
    </div>
  );
}
