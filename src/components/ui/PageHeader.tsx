/**
 * The page header, in one place — and it fixes a LIVE BUG, not just duplication.
 *
 * All five unmigrated pages open with `text-2xl font-semibold text-mwan-charcoal`
 * over `text-sm text-gray-500`. That was correct when the page was light grey.
 * The pilot inverted the canvas to dark green and those pages were never
 * revisited, so today they render:
 *
 *   h1  --ink #10231b  on canvas #12392a  =  1.29:1   (invisible)
 *   p   gray-500       on canvas          =  2.64:1   (fails AA)
 *
 * A heading nobody can read is not a styling nit. This component is why it
 * cannot happen again: the header sits ON the canvas, so its ink is chosen for
 * the canvas ONCE, here, and no page picks its own.
 *
 *   h1  white     12.77:1
 *   p   mint/80    ~7.2:1
 *
 * WHY THIS IS NOT CardHeader. They look alike and are opposites: CardHeader
 * draws a divider INSIDE a white card and uses dark ink on light; PageHeader
 * sits on the dark canvas with no divider and uses light ink on dark. Merging
 * them would mean a `dark` boolean that flips every colour — two components
 * wearing one name. The divider is the tell: a card header separates two things
 * sharing a surface, a page header sits on the ground itself and separates
 * nothing.
 *
 * px-2 aligns the text to the CARDS' optical edge below it rather than the
 * panel's literal one, so the title hangs on the same vertical as the content it
 * introduces. Matches the dashboard, which this component now backs.
 */
export function PageHeader({
  title,
  subtitle,
  action,
  back,
  meta,
}: {
  /**
   * ReactNode, not string. Typed as `string` this prop silently cost real
   * behaviour twice: InspectionDetailView's <h1> WAS a <Link> to the carrier
   * profile and had to drop it, and NetworkDetailView could not wrap an Arabic
   * company name in <bdi>. Both are legitimate — an <h1> may contain a link, and
   * a title that is user DATA needs bidi isolation. The prop type was the bug.
   */
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  /** Detail pages only: the "← back" link, above the title. */
  back?: React.ReactNode;
  /** Detail pages only: the identifier/badge row, below the title. */
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-2 pt-2 pb-1">
      <div className="min-w-0">
        {back}
        <h1 className="text-h1 text-white">{title}</h1>
        {subtitle ? <p className="mt-1 text-body text-mint/80">{subtitle}</p> : null}
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-body text-mint/80">{meta}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * The back link. Mint, not forest: forest on the canvas is 1.29:1 — the same
 * invisible-ink bug as the h1, and every detail page has one of these.
 *
 * The arrow is a literal "←" in the source, so it must FLIP for RTL or it points
 * away from where it goes. rtl:rotate-180 on an inline-block span rather than a
 * different glyph per locale: one element, correct in both directions.
 */
export function BackLink({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-body text-mint/80 transition-colors hover:text-white">
      <span aria-hidden="true" className="inline-block rtl:rotate-180">
        ←
      </span>
      {children}
    </span>
  );
}
