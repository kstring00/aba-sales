import Link from "next/link";
import { Wordmark } from "@/components/ui/Logo";
import { LinkButton } from "@/components/ui/Button";

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Wordmark />
      <nav aria-label="Primary" className="flex items-center gap-2 sm:gap-4">
        <Link href="/crisis" className="hidden px-2 py-2 text-[15px] text-ink-soft hover:text-ink sm:inline">
          Crisis resources
        </Link>
        <LinkButton href={signedIn ? "/app" : "/sign-in"} variant="secondary" size="sm">
          {signedIn ? "Open tracker" : "Sign in"}
        </LinkButton>
      </nav>
    </header>
  );
}
