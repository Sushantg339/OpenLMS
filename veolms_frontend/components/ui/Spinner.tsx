import { cx } from "@/lib/format";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "h-6 w-6 animate-spin rounded-full border-2 border-ink-700 border-t-signal-500",
        className
      )}
      aria-label="Loading"
    />
  );
}