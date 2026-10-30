"use client";

import type { ComponentPropsWithoutRef } from "react";

type ChipProps = ComponentPropsWithoutRef<"button"> & {
  selected?: boolean;
};

/**
 * A selectable option. Minimum 48px tall for thumbs. Exposes aria-pressed so
 * screen readers announce the selection state.
 */
export function Chip({ selected = false, className = "", children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`lift inline-flex min-h-12 items-center rounded-pill border px-4 text-left text-[16px] leading-tight ${
        selected
          ? "border-sage-deep bg-sage-tint text-ink"
          : "border-line-strong bg-paper text-ink-soft hover:border-ink-faint"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
