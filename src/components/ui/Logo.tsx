import Link from "next/link";

export function Wordmark({ className = "", href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap font-display text-[1.1rem] tracking-tight text-ink no-underline sm:text-[1.25rem] ${className}`}
      aria-label="The Support Shelf home"
    >
      <span aria-hidden className="mr-2 inline-block h-[3px] w-5 translate-y-[-5px] rounded-pill bg-sage" />
      The Support Shelf
    </Link>
  );
}
