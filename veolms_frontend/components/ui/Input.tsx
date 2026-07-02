import { cx } from "@/lib/format";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-wide text-ink-500">
        {label}
      </label>
      <input
        id={inputId}
        className={cx(
          "rounded border bg-ink-900 px-4 py-2.5 text-sm text-paper-100 placeholder:text-ink-600 transition-colors focus:outline-none",
          error
            ? "border-danger-500 focus:border-danger-400"
            : "border-ink-700 focus:border-signal-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="font-mono text-xs text-danger-400">{error}</p>
      )}
    </div>
  );
}