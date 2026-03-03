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
      className={`${dmSans.variable} ${dmSerif.variable} flex h-screen bg-[#0F0F0F] text-[#F5F5F5] overflow-hidden font-sans`}
      style={{ fontFamily: "var(--font-admin-sans), system-ui, sans-serif" }}
    >
      {/* Sidebar 260px – vizuální DNA z CURSOR_PROMPT */}
      <aside
        className="w-[260px] flex-shrink-0 border-r border-white/[0.08] bg-[#242424] flex flex-col"
        style={{ boxShadow: "0 0 40px rgba(201,169,110,0.05)" }}
      >
        <div className="p-5 border-b border-white/[0.08]">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-[#C9A96E] focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50 rounded"
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
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-[#888] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-colors text-sm"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-white/[0.08]">
          <Link
            href="/admin/login"
            className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-[#888] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-colors text-sm"
          >
            <span>⚙️</span>
            <span>Nastavení</span>
          </Link>
        </div>
      </aside>
      {/* Hlavní pracovní plocha */}
      <main className="flex-1 overflow-auto bg-[#0F0F0F] min-w-0">
        {children}
      </main>
    </div>
  );
}
