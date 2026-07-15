/**
 * The card header, in one place. Every box was hand-rolling its own — some with
 * the title glued to its metadata after a middot, some with no metadata at all,
 * some with an action and some without — which is why no two card tops lined up.
 *
 * Title + meta STACKED, never side by side: inline, a title and its scope read
 * as two unrelated fragments (the title stops looking like a title, and the meta
 * looks like a stray string parked next to it). Stacked, the meta is visibly
 * subordinate to the thing it describes.
 *
 * `hero` is the page's type hierarchy made explicit: FleetGapCard is the thesis
 * and takes text-h2; every other box takes text-h3. That one-step difference is
 * what tells the reader which card leads.
 *
 * The rule below is INSIDE the card (border-border), unlike the card itself,
 * which is borderless because the dark canvas already draws its edge. A divider
 * separates two things that share a surface; a border outlines a surface. They
 * are different jobs.
 */
export function CardHeader({
  title,
  meta,
  action,
  hero = false,
}: {
  title: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  hero?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
      <div className="min-w-0">
        <h3 className={`${hero ? "text-h2" : "text-h3"} text-ink`}>{title}</h3>
        {meta ? <p className="mt-0.5 text-caption text-ink-muted">{meta}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
