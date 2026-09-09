"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, Network, ClipboardCheck, Bell, BarChart3, Languages, PlayCircle } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const navItems = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/carriers", key: "nav.carriers", icon: Truck },
  { href: "/networks", key: "nav.networks", icon: Network },
  { href: "/inspections", key: "nav.inspections", icon: ClipboardCheck },
  { href: "/alerts", key: "nav.alerts", icon: Bell },
  { href: "/analytics", key: "nav.analytics", icon: BarChart3 },
];

/**
 * The shell renders on all six pages, so it is the highest-leverage and least
 * forgiving surface in the pilot. bg-mwan-charcoal -> bg-forest: the shell stops
 * being neutral chrome and becomes the brand. White on forest = 9.93.
 *
 * THERE IS NO GREEN IN THIS FILE, AND THAT IS A FINDING, NOT AN OMISSION.
 * Accent green #1aa165 on forest measures 2.99 — it fails the 4.5:1 text
 * threshold AND the 3:1 non-text threshold, so a green indicator bar is not a
 * fix for green text; it is the identical failure relocated from the label to
 * the rule beside it. Against the elevated forest-700 surface it degrades to
 * 2.24. The brand's accent color is unusable against the brand's dominant
 * color. The dark shell is carried by mint (7.46) and white (9.93); green lives
 * on light surfaces as a focus ring only.
 *
 * ACTIVE STATE carries THREE non-color signals — elevated surface, heavier
 * weight, a hard edge rule — so it survives greyscale and every form of color
 * vision. The old design leaned on a green tint plus green text: one signal, in
 * the one channel that fails.
 *
 * border-e-2 is CORRECT and was already right. The aside is the first flex child
 * of body, so it renders at the page's inline-start (right under RTL, left under
 * LTR) and its inline-END edge is the one facing the content in BOTH directions.
 * Do not "fix" this to border-r/border-l.
 *
 * focus-visible uses ring-inset rather than ring-offset: an offset ring on a
 * dark surface would need ring-offset-forest to avoid a white halo, and inset
 * sidesteps that while keeping the ring clear of the neighboring row.
 */
/**
 * WHY THE ROWS BECAME PILLS. Full-bleed rows that touch both edges of the panel
 * are the single strongest "2003 admin panel" signal — they read as table rows,
 * not as controls, and they force the active state to be expressed as a hard
 * edge rule because there is no shape to fill. Insetting the row (mx-3) gives it
 * a silhouette, which lets the active state be a SHAPE instead of a border, and
 * gives the nav a margin rhythm the flat panel never had.
 *
 * ACTIVE still carries THREE non-color signals, per the original spec — but they
 * are better ones now: an elevated translucent surface, heavier weight, and a
 * mint indicator INSIDE the pill's inline-start. It survives greyscale.
 *
 * bg-white/10 rather than a solid forest-700: the shell is now a gradient, and a
 * solid pill would only match it at one vertical position. A translucent white
 * lifts whatever it happens to sit on, so the pill stays correct at the top of
 * the panel and at the bottom. Over the gradient it resolves to ~#205f46 at the
 * lightest stop — effectively forest-700, whose contrast is already verified
 * (white 7.44, mint 5.58).
 */
const NAV_BASE =
  "relative mx-3 flex items-center gap-3 rounded-control px-3 py-2.5 text-body transition-all duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mint";

const NAV_INACTIVE = "text-mint/90 hover:text-white hover:bg-white/[0.07]";

/* The indicator is a pseudo-element pinned to the pill's inline-START, so it
   flips with the locale for free. A physical left/right offset would sit on the
   wrong edge the moment the toggle is hit. */
const NAV_ACTIVE =
  "font-medium text-white bg-white/10 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08)] " +
  "before:absolute before:inset-y-2 before:start-0 before:w-[3px] before:rounded-full before:bg-mint";

export function Sidebar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();

  return (
    /* A FLOATING PANEL, not a wall. The canvas is now darker than forest, so the
       shell reads as raised rather than as chrome bolted to the window edge.
       h-[calc(100vh-1.5rem)] accounts for body's p-3 on both sides (0.75rem x2);
       sticky top-3 matches that padding so it pins flush with its own inset.
       overflow-hidden is required — without it the square logo plate punches out
       through the rounded corners.
       NO border: a semi-transparent border composites over the aside's OWN
       forest background, so `border-black/20` rendered as a dark-green stripe
       rather than a neutral separator. The canvas around it is the separator. */
    <aside className="shell-surface w-64 shrink-0 sticky top-3 h-[calc(100vh-1.5rem)] flex flex-col overflow-hidden rounded-shell text-white shadow-card">
      {/* On forest, border-white/10 reads as a hairline lift rather than a line —
          which is what a divider in an institutional shell should be. */}
      <div className="border-b border-white/10">
        {/* THE WHITE PLATE STAYS — resolved by opening the asset, not by guessing.
            /public/mwan.png IS transparent (183k of 249k px at alpha 0), so the
            first half of the spec's condition holds. The second half does not:
            its ink is green #0e9e4f (2.85 on forest) and charcoal #343436 (1.25
            on forest — effectively invisible). The logo's own green fails on
            forest for exactly the reason the accent green does. Dropping the
            plate would dissolve the wordmark and the bilingual lockup into the
            shell. h-32 -> h-24: a 128px white slab was the single heaviest
            element in the shell and it was carrying a logo.

            THE LOGO IS HEIGHT-CONSTRAINED, NOT WIDTH-CONSTRAINED, so growing it
            costs plate height and nothing else. mwan.png is 613x407 (1.506);
            object-contain fits it to the SHORTER axis, and the content box is far
            wider than tall, so the render is pinned to the box height and the
            width falls out of the ratio. At h-28/py-0 the canvas is the full 112
            tall and ~169 wide inside a 232-wide box — ~63px of inline slack still
            unspent. Do not widen the aside to make the logo bigger; it would do
            nothing. The 16px the plate regains over h-24 is bought back by
            zeroing py rather than by returning to h-32, which keeps the slab well
            under its original mass.

            py-0 IS DELIBERATE, NOT AN OVERSIGHT — THE ASSET IS SELF-PADDED. The
            visible ink spans (86,38)-(524,385) of the 613x407 canvas, i.e. the
            file carries ~9% transparent margin above the mark and ~5% below, so
            CSS padding is ADDITIVE to margin the logo already has and p-3 was
            double-padding it. With py-0 the rendered gap above the ink is still
            ~10px and below ~6px, entirely from the asset. px-3 is retained only
            as a guard: it is inert while height is the limiting axis (it is, by
            63px) and would bite first if the asset were ever swapped for a wider
            one. Measure the alpha bbox before "restoring" py here; the canvas is
            not the mark, and a squarer asset would need this revisited.

            `preload` is correct for Next 16; `priority` is the deprecated
            spelling (docs: v16.0.0 "preload prop added, priority deprecated"). */}
        <div className="relative w-full h-28 bg-white">
          <Image src="/mwan.png" alt={t("appName")} fill sizes="256px" className="object-contain px-3 py-0" preload />
        </div>
        <div className="flex items-center justify-between px-6 py-3">
          <p className="text-caption text-mint/80">{t("tagline")}</p>
          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 shrink-0 rounded-control border border-white/15 px-2 py-1.5 text-caption text-mint hover:bg-white/10 hover:text-white transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mint"
            /* the `title` is the only accessible name a two-character button has,
               and it is already correctly written in the TARGET language rather
               than the current one */
            title={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            <Languages size={14} />
            {locale === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`${NAV_BASE} ${isActive ? NAV_ACTIVE : NAV_INACTIVE}`}
            >
              <item.icon size={20} />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mirrors the language toggle's outlined-pill treatment rather than the
          nav pills' fill treatment, since this is an escape hatch to the intro
          video (/) rather than a section of the app shell itself. */}
      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-full border border-mint/40 px-4 py-2.5 text-body font-medium text-mint hover:bg-mint/10 hover:text-white hover:border-mint/60 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mint"
        >
          <PlayCircle size={18} />
          {t("nav.getStarted")}
        </Link>
      </div>
    </aside>
  );
}
