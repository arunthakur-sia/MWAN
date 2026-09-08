import type { Metadata } from "next";
import { Noto_Kufi_Arabic, Inter, JetBrains_Mono } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import "./globals.css";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-kufi-arabic",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "MWAN - محرك الذكاء التنظيمي",
  description: "Compliance Intelligence Engine",
};

// Runs before hydration so a returning English-locale visitor doesn't see a
// flash of Arabic/RTL before LocaleProvider's effect corrects it.
const NO_FLASH_SCRIPT = `
(function () {
  try {
    var locale = window.localStorage.getItem("mwan-locale");
    if (locale === "en") {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
      document.documentElement.classList.add("font-sans");
      document.documentElement.classList.remove("font-arabic");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${notoKufiArabic.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* A PLAIN <script>, not next/script — and this was a real bug, not a
            console nuisance.
            next/script with strategy="beforeInteractive" never emitted a script
            tag here at all: the body was serialised into the RSC payload and
            NEVER EXECUTED, so the no-flash guard had been silently dead and an
            en-locale visitor got a flash of Arabic/RTL on every load — precisely
            what it exists to prevent. It also logged "Encountered a script tag
            while rendering React component" in dev, which was the symptom.
            Two reasons next/script is the wrong tool here:
              1. Docs (script.md:156): beforeInteractive scripts are ALWAYS
                 injected into <head> regardless of placement — so hand-placing
                 one inside <head> is both redundant and what triggered the error.
              2. beforeInteractive is documented around `src` (script.md:52: src
                 is "required unless an inline script is used") and is designed to
                 preload EXTERNAL scripts before hydration. It explicitly does not
                 block hydration — but this guard must run synchronously during
                 head parse, BEFORE first paint, or the flash happens anyway.
            A raw inline <script> in <head> is parser-blocking by definition,
            which is exactly the guarantee this needs. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      {/* The sidebar shell (p-3 + gap-3 float, min-w-0 on <main>) now lives in
          app/(shell)/layout.tsx — it only applies to the app routes. / (the
          video landing page) renders full-bleed with no sidebar chrome. */}
      <body className="min-h-screen font-arabic">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
