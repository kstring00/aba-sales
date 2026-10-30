import { Wordmark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { attestAdult, signOut } from "@/app/app/actions";

/** One-time confirmation. Required for Google sign-ins, which skip the sign-in form. */
export function AdultGate() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16 pt-6 sm:pt-12">
      <Wordmark />
      <h1 className="mt-10 text-[clamp(2rem,1.6rem+1.5vw,2.8rem)]">Before you start</h1>
      <p className="mt-4 text-ink-soft">
        The Support Shelf is for adult parents and caregivers. It doesn&apos;t offer accounts for
        children, and it isn&apos;t a substitute for professional care.
      </p>
      <form action={attestAdult} className="mt-8 space-y-6 rounded-lg bg-paper p-6 shadow-soft">
        <label className="flex items-start gap-3 text-[15px] text-ink-soft">
          <input type="checkbox" name="attest" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--sage-deep)]" />
          <span>I&apos;m 18 or older and a parent or caregiver.</span>
        </label>
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Continue
        </Button>
      </form>
      <form action={signOut} className="mt-6 text-center">
        <button type="submit" className="text-[14px] text-ink-mute hover:text-ink">
          Sign out instead
        </button>
      </form>
    </main>
  );
}
