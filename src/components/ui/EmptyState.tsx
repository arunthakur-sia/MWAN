/**
 * The empty / loading line. Twelve call sites wrote this by hand and drifted
 * across `text-sm text-gray-400`, `text-sm text-gray-500` and `text-xs
 * text-gray-400` — three weights for one idea, and gray-400/500 are not tokens.
 *
 * text-ink-muted is the token, and it is the SAME value as --risk-low: "nothing
 * here" and "low risk" are both "recedes to the weight of a caption". One value,
 * one idea.
 *
 * NOT an illustration, NOT a call-to-action. An empty inspection queue on a
 * regulator's console means there is nothing to inspect — that is information,
 * and dressing it up as an achievement (the big-checkmark empty state) would be
 * the same mistake FleetGapCard refuses when it declines to celebrate a zero
 * gap.
 */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-body text-ink-muted">{children}</p>;
}
