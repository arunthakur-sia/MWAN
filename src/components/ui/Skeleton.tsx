/**
 * The first skeleton in the codebase. Every loading state today is literal
 * t("common.loading") text.
 *
 * Caller supplies size: <Skeleton className="h-4 w-32" />.
 * Reduced motion kills the pulse (belt-and-braces with the global media query
 * in globals.css).
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse motion-reduce:animate-none rounded-[3px] bg-ink/[0.06] ${className}`} />;
}
