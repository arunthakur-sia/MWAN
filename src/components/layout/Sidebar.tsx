"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, Network, ClipboardCheck, Bell, BarChart3, Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const navItems = [
  { href: "/", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/carriers", key: "nav.carriers", icon: Truck },
  { href: "/networks", key: "nav.networks", icon: Network },
  { href: "/inspections", key: "nav.inspections", icon: ClipboardCheck },
  { href: "/alerts", key: "nav.alerts", icon: Bell },
  { href: "/analytics", key: "nav.analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();

  return (
    <aside className="w-64 bg-mwan-charcoal text-white flex flex-col h-screen sticky top-0 shrink-0">
      <div className="border-b border-white/10">
        <div className="relative w-full h-32 bg-white">
          <Image src="/mwan.png" alt={t("appName")} fill sizes="256px" className="object-contain p-3" preload />
        </div>
        <div className="flex items-center justify-between px-6 py-3">
          <p className="text-xs text-gray-400">{t("tagline")}</p>
          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            title={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            <Languages size={14} />
            {locale === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-mwan-green/20 text-mwan-green border-e-2 border-mwan-green"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={20} />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
