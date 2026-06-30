import Link from "next/link";
import { cx } from "@/lib/format";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButton
  extends BaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: undefined;
}

interface ButtonAsLink extends BaseProps {
  href: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-signal-500 text-ink-950 hover:bg-signal-400 shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]",
  secondary: "border border-ink-600 text-paper-100 hover:border-paper-200 hover:bg-ink-800",
  ghost: "text-paper-200 hover:bg-ink-800",
  danger: "bg-danger-500 text-paper-50 hover:bg-danger-400",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cx(base, variantStyles[variant], sizeStyles[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { href, ...buttonProps } = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}