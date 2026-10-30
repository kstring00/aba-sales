import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { confirmSignIn } from "./actions";

export const metadata: Metadata = { title: "Confirm sign-in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Search = { token_hash?: string; type?: string; code?: string; next?: string };

/**
 * The page a magic link lands on. It does nothing on load, so an email
 * scanner that pre-opens the link cannot use it up. One tap finishes.
 */
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/app";
  if (!sp.token_hash && !sp.code) redirect(`/sign-in?error=callback&reason=missing&next=${encodeURIComponent(next)}`);

  return (
    <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16 pt-6 sm:pt-12">
      <Wordmark />
      <h1 className="mt-10 text-[clamp(2rem,1.6rem+1.5vw,2.8rem)]">
        One more <span className="display-italic">tap.</span>
      </h1>
      <p className="mt-4 text-ink-soft">
        Press continue to finish signing in. This step keeps your link safe from email scanners that
        open links before you do.
      </p>
      <form action={confirmSignIn} className="mt-8">
        <input type="hidden" name="next" value={next} />
        {sp.token_hash ? <input type="hidden" name="token_hash" value={sp.token_hash} /> : null}
        {sp.type ? <input type="hidden" name="type" value={sp.type} /> : null}
        {sp.code ? <input type="hidden" name="code" value={sp.code} /> : null}
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Continue
        </Button>
      </form>
      <p className="mt-6 text-[14px] text-ink-mute">
        Didn&apos;t ask for this? You can close the tab. Nothing happens until you press continue.
      </p>
    </main>
  );
}
