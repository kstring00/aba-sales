import Link from "next/link";
import { CornerLeaves } from "@/components/illustrations/Paper";
import { D } from "@/components/home/drawer-icons";

/** A closing plate: sage ground, botanical corners, one warm action. */
export function ClosingCta() {
  return (
    <section aria-labelledby="close-h" className="closing">
      <CornerLeaves side="left" className="closing-leaf l" />
      <CornerLeaves side="left" className="closing-leaf r" />
      <div className="closing-in">
        <p className="sd-eyebrow justify-center">You&apos;re not alone</p>
        <h2 id="close-h" className="text-heading">
          You don&apos;t have to figure everything <em>out alone</em>.
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[1.05rem] leading-relaxed text-ink-soft">
          Choose a shelf, take one tool, and use it this week. The rest can wait until it can&apos;t.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#shelf-organized" className="sd-btn primary">Find my shelf <D.arrow /></a>
          <Link href="/abc" className="sd-btn">Try the free ABC Tracker</Link>
        </div>
      </div>
    </section>
  );
}
