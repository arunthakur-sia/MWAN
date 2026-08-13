"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const VIDEO_SRC = { ar: "/videos/mwan-intro-ar.mp4", en: "/videos/mwan-intro-en.mp4" } as const;

export default function HomePage() {
  const { locale, setLocale, t } = useLocale();
  const ArrowIcon = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center px-4 py-12"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(26,161,101,0.35), transparent), linear-gradient(180deg, var(--shell-from), var(--shell-to))",
      }}
    >
      <button
        onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
        className="absolute top-6 end-6 flex items-center gap-1.5 rounded-control border border-white/15 px-3 py-1.5 text-caption text-mint hover:bg-white/10 hover:text-white transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mint"
        title={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      >
        <Languages size={14} />
        {locale === "ar" ? "EN" : "ع"}
      </button>

      <div className="w-full max-w-3xl flex flex-col items-center mt-10 sm:mt-16">
        <div className="h-24 w-40 rounded-lg bg-white flex items-center justify-center overflow-hidden">
          <Image src="/mwan.png" alt={t("appName")} width={140} height={92} className="object-contain px-2" priority />
        </div>

        <h1 className="mt-6 text-center text-h1 text-white">{t("home.title")}</h1>
        <p className="mt-2 max-w-xl text-center text-body text-mint/80">{t("home.subtitle")}</p>

        <div className="mt-10 w-full rounded-2xl overflow-hidden border border-white/10 shadow-card bg-black">
          {/* key forces the <video> to remount on locale change so the browser
              re-requests the new src instead of keeping the old track loaded */}
          <video key={locale} controls preload="metadata" className="w-full aspect-video bg-black">
            <source src={VIDEO_SRC[locale]} type="video/mp4" />
          </video>
        </div>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-control bg-[var(--brand-green)] hover:bg-[var(--brand-green-hover)] text-white font-medium px-6 py-3 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--shell-to)] focus-visible:ring-mint"
        >
          {t("home.getStarted")}
          <ArrowIcon size={16} />
        </Link>

        <p className="mt-12 mb-4 text-caption text-mint/60">{t("home.footer")}</p>
      </div>
    </div>
  );
}
