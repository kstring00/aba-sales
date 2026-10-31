import Link from "next/link";
import { IconLeaf } from "@/components/illustrations/Paper";

export function Wordmark({ className = "", href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 whitespace-nowrap font-display text-[1rem] tracking-tight text-ink no-underline sm:text-[1.3rem] ${className}`}
      aria-label="The Support Shelf home"
    >
      <IconLeaf className="h-5 w-5 shrink-0 -rotate-12" />
      The Support Shelf
    </Link>
  );
}
