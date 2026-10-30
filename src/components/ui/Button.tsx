import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet" | "danger";
type Size = "md" | "lg" | "sm";

const base =
  "lift inline-flex items-center justify-center gap-2 rounded-pill font-medium select-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  // Clay is reserved for the single primary action on a page.
  primary: "bg-clay text-paper hover:bg-clay-deep shadow-soft",
  secondary: "bg-paper text-ink border border-line-strong hover:border-ink-faint shadow-soft",
  quiet: "bg-transparent text-ink-soft hover:text-ink hover:bg-cream-deep",
  // "Danger" here is calm ink, never red. Confirmation does the protecting.
  danger: "bg-ink text-paper hover:bg-ink-soft",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-[15px]",
  md: "min-h-12 px-5 text-[16px]",
  lg: "min-h-14 px-7 text-[17px]",
};

export function buttonClass(variant: Variant = "secondary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "secondary", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  prefetch?: boolean;
};

export function LinkButton({
  href,
  variant = "secondary",
  size = "md",
  className = "",
  children,
  prefetch,
}: LinkButtonProps) {
  return (
    <Link href={href} prefetch={prefetch} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
