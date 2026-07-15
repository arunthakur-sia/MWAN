"use client";

/**
 * Replaces the filter chips at CarrierTable:47, InspectionQueue:35 and
 * OutcomeForm:60 — three hand-rolled copies of the same
 * `bg-mwan-green/10 text-mwan-green border-mwan-green/20` pill row.
 *
 * "I dont like a pills, they look so bad and vanilla" — and the reason is
 * structural, not chromatic. Those chips were N INDEPENDENT BUTTONS that each
 * happened to have a border. Nothing said they were one choice; the tinted
 * background was the ONLY thing marking the active one, so the row read as a
 * scatter of unrelated buttons of which one was inexplicably green. Recolouring
 * them would not have fixed it.
 *
 * A segmented control says "these are one control, pick one" with GEOMETRY:
 * a single recessed track holds the options, and the active one is a raised chip
 * sitting IN it. Selection is carried by DEPTH — the same groove/lift device the
 * gap bar already uses for its track — so it survives greyscale and needs no
 * accent tint at all. That is why the green tint disappears: the shape does the
 * work the colour was failing to do.
 *
 * A11y: this is a real radio group, not a row of buttons. Arrow keys move
 * between options natively, which the old chips never supported.
 * `-mx-0.5` on the label compensates the track's p-0.5 so the raised chip's edge
 * lands flush with the track's inner edge instead of floating 2px inside it.
 */
export function SegmentedControl<T extends string>({
  name,
  value,
  onChange,
  options,
  className = "",
}: {
  /** Must be unique per control on the page — it groups the radios. */
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={`inline-flex rounded-control bg-surface-sunken p-0.5 shadow-groove ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <label
            key={o.value}
            className={`relative -mx-0.5 cursor-pointer rounded-[6px] px-3 py-1.5 text-body font-medium transition-colors duration-150 motion-reduce:transition-none ${
              active
                ? "bg-surface text-ink shadow-card"
                : "text-ink-muted hover:text-ink"
            } focus-within:outline-none focus-within:ring-2 focus-within:ring-green focus-within:ring-offset-1 focus-within:ring-offset-surface-sunken`}
          >
            {/* sr-only, not hidden: a hidden input is unfocusable and would take
                the keyboard support with it. */}
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={active}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
