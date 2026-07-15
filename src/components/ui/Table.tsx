/**
 * The table, in one place. CarrierTable, InspectionQueue and the analytics
 * version history are three hand-rolled copies of the same thead/tbody idiom,
 * and they had already drifted: two used `bg-gray-50` heads with
 * `text-xs uppercase tracking-wide`, the third used no head fill and a different
 * size; two used `border-t border-gray-100` rows, the third `border-gray-100` at
 * a different padding.
 *
 * TRACKING IS DROPPED FROM THE HEAD. `tracking-wide` on an uppercase Arabic
 * heading breaks Noto Kufi's cursive joins — globals.css has a guardrail
 * (`html[lang="ar"] * { letter-spacing: normal }`) that was silently cancelling
 * it in Arabic and applying it in English, so the two locales had different
 * heads. Uppercase is also a no-op in Arabic (no letter case), which is why the
 * head instead earns its rank with WEIGHT and MUTED INK — devices that work in
 * both scripts.
 *
 * Numeric cells: <Td num> gives mono + tabular-nums + dir="ltr" isolation in one
 * place. Every call site was repeating `font-mono` + `dir="ltr"` by hand and
 * some forgot tabular-nums, so digit columns didn't align to each other.
 */
export function Table({ children }: { children: React.ReactNode }) {
  // The scroll container is the a11y-relevant bit: an overflowing table must be
  // reachable by keyboard, which needs tabindex + a role + a name.
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-surface-sunken">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={`px-4 py-2.5 text-start text-caption font-semibold text-ink-muted ${className}`}>
      {children}
    </th>
  );
}

export function Tbody({ children }: { children: React.ReactNode }) {
  // divide-y instead of per-row border-t: the old code drew border-t on every
  // row INCLUDING the first, doubling the head's own bottom edge into a 2px rule.
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

/**
 * hover was `bg-mwan-green/5` — an alias resolving to forest at 5%, i.e. a grey
 * smudge nobody chose. A row hover is a pointer affordance, not a brand moment:
 * surface-sunken is the same recess the table head uses, so the row reads as
 * settling INTO the surface rather than being tinted by an arbitrary colour.
 */
export function Tr({ children }: { children: React.ReactNode }) {
  return (
    <tr className="transition-colors duration-100 hover:bg-surface-sunken motion-reduce:transition-none">
      {children}
    </tr>
  );
}

export function Td({
  children,
  num = false,
  className = "",
}: {
  children?: React.ReactNode;
  /** Numeric cell: mono, tabular, and bidi-isolated so digits cannot reorder in RTL. */
  num?: boolean;
  className?: string;
}) {
  if (num) {
    return (
      <td className={`px-4 py-3 ${className}`}>
        <span dir="ltr" className="font-mono tabular-nums">
          {children}
        </span>
      </td>
    );
  }
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

/** The full-width "loading" / "no results" row. colSpan is the caller's job. */
export function TdEmpty({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-body text-ink-muted">
        {children}
      </td>
    </tr>
  );
}
