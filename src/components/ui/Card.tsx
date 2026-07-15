/**
 * Replaces the ~18 hand-copied card strings and collapses p-6/p-5/p-4 into ONE
 * padding: p-5. Radius 12px -> 8px via rounded-card. shadow-sm -> the single
 * shadow-card token.
 *
 * `className` is appended last so a caller can add grid spans/col-span-2 ONLY —
 * it must not be used to override padding, radius, border, or shadow. If a
 * caller needs different padding, the design is wrong, not the token.
 */
/**
 * NO BORDER. On the dark canvas the card's edge is drawn by the canvas itself
 * showing through — a border would be a line drawn on top of a boundary that
 * already exists, which is exactly the "vanilla div" read. Radius + occlusion
 * shadow do the whole job.
 */
export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-card bg-surface p-5 shadow-card ${className}`}>{children}</div>;
}

/**
 * An interactive Card — for cards that are a link/button target. The lift on
 * hover is the ONLY motion added: it is feedback (this responds to you), not
 * decoration. Static cards must NOT use this; a card that lifts under the
 * cursor but does nothing when clicked is a lie about affordance.
 */
export function CardInteractive({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-card bg-surface p-5 shadow-card transition-shadow duration-150 ease-out hover:shadow-card-lift motion-reduce:transition-none ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * The UNPADDED card: same surface, radius and shadow, no p-5.
 *
 * This is not the padding override Card's docblock forbids. That rule exists to
 * stop callers nudging p-5 to p-4 or p-6 by taste. A table is a different case:
 * its rows must bleed to the card's edge and own their own cell padding, so the
 * row hover and the head fill run full-bleed instead of stopping 20px short with
 * a white margin around them. A padded card containing a table is visibly wrong,
 * not a matter of preference — so it gets a named container rather than an
 * ad-hoc className.
 *
 * overflow-hidden clips the head fill and the first/last rows to the radius;
 * without it the square-cornered thead pokes out through the rounded corners.
 */
export function CardFlush({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`overflow-hidden rounded-card bg-surface shadow-card ${className}`}>{children}</div>;
}
