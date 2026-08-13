"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Lock, Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { verifyAccessCode, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const { locale, setLocale, t } = useLocale();
  const [state, formAction, pending] = useActionState(verifyAccessCode, initialState);

  return (
    // Radial glow + the shell's own forest-to-shell-to gradient: same canvas
    // language as the rest of the app, just without a Sidebar to float over it.
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12"
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

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-card p-8 sm:p-10">
        <div className="mx-auto h-24 w-40 rounded-lg bg-white flex items-center justify-center overflow-hidden">
          <Image src="/mwan.png" alt={t("appName")} width={140} height={92} className="object-contain px-2" priority />
        </div>

        <p className="mt-6 text-center text-body font-medium text-white tracking-wide">{t("login.title")}</p>

        <form action={formAction} className="mt-8 space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute inset-y-0 start-3 my-auto text-mint/70" />
            <input
              name="code"
              type="password"
              required
              autoFocus
              placeholder={t("login.placeholder")}
              className="w-full rounded-control border border-white/15 bg-white/5 ps-10 pe-3 py-3 text-body text-white placeholder:text-mint/50 outline-none focus-visible:ring-2 focus-visible:ring-mint transition-colors duration-150"
            />
          </div>

          {state.error && <p className="text-caption text-center text-[#ff8b8b]">{t("login.error")}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-control bg-[var(--brand-green)] hover:bg-[var(--brand-green-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--shell-to)] focus-visible:ring-mint"
          >
            {pending ? t("login.submitting") : t("login.submit")}
          </button>
        </form>
      </div>

      <p className="mt-8 text-caption text-mint/60">{t("login.subtitle")}</p>
    </div>
  );
}
