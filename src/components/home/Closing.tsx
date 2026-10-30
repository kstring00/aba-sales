import { LinkButton } from "@/components/ui/Button";
import { EmailCapture } from "@/components/shop/EmailCapture";

/** Section eight. Warmth and a next step. No urgency, no guilt. */
export function Closing({ hasProducts }: { hasProducts: boolean }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-[var(--section-y)] sm:px-8" aria-labelledby="close-h">
      <div className="grain rounded-[28px] bg-paper px-6 py-14 shadow-soft sm:px-14 sm:py-20">
        <div className="mx-auto max-w-[44rem] text-center">
          <h2 id="close-h" className="text-[clamp(2rem,1.4rem+2.4vw,3.6rem)]">
            You don&apos;t have to have it all figured out to take the <span className="display-italic">next step.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[46ch] text-ink-soft">Start with one useful thing. Come back when you need another. We&apos;re building this shelf with care.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href={hasProducts ? "/shelf" : "#find"} variant="primary" size="lg">{hasProducts ? "Browse available resources" : "Find something that helps"}</LinkButton>
            <LinkButton href="/abc" variant="secondary" size="lg">Try a free tool</LinkButton>
          </div>
          <div className="mx-auto mt-12 max-w-md border-t border-line pt-8">
            <p className="text-[15px] text-ink-soft">New downloads and nothing else, a few times a year.</p>
            <div className="mt-3"><EmailCapture source="home-closing" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
