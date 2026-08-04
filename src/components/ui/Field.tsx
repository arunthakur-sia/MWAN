"use client";

/**
 * The form field. Replaces the hand-copied
 * `rounded-lg border border-gray-200 bg-gray-50 text-sm` at CarrierTable:38,
 * OutcomeForm:78 and OutcomeForm:90, plus their three
 * `block text-sm text-gray-500 mb-2` labels.
 *
 * bg-gray-50 -> surface-sunken + shadow-groove: an input is a RECESS. The old
 * fill was a flat grey rectangle that read as a disabled block; the groove is
 * the same inset the bar tracks and the segmented control use, so "you can type
 * into this" is stated by depth, and every recessed thing on the page now looks
 * recessed the same way.
 *
 * The focus ring is GREEN, and that is deliberate and safe: green is 3.32:1 on
 * white, which FAILS the 4.5:1 text bar (why Button's fill is forest) but CLEARS
 * the 3:1 non-text bar that a focus indicator is judged against. Same ring
 * Button already uses — one focus language.
 */
const INPUT =
  "w-full rounded-control border border-border bg-surface-sunken px-3 py-2 text-body text-ink shadow-groove transition-colors duration-150 motion-reduce:transition-none placeholder:text-ink-muted/70 focus:outline-none focus:border-forest focus:ring-2 focus:ring-green/40";

/**
 * Label + control. htmlFor/id is REQUIRED, not optional: every one of the three
 * originals used a bare <label> with no association, so clicking the label did
 * nothing and a screen reader announced an unlabelled input. Making id a
 * required prop is what stops that recurring.
 */
export function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-caption font-medium text-ink-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${INPUT} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${INPUT} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${INPUT} cursor-pointer ${className}`} {...props} />;
}
