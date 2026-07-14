import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Kufi_Arabic, Inter, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
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
        <Script
          id="no-flash-locale"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex font-arabic">
        <LocaleProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
