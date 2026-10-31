import Link from "next/link";
import { IconLeaf } from "@/components/illustrations/Paper";

export function Wordmark({ className = "", href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 whitespace-nowrap font-display text-[0.9rem] tracking-tight text-ink no-underline sm:text-[1.3rem] ${className}`}
      aria-label="The Support Shelf home"
    >
      <IconLeaf className="h-4 w-4 shrink-0 -rotate-12 sm:h-5 sm:w-5" />
      The Support Shelf
    </Link>
  );
}
