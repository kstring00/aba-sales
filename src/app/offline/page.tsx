import type { Metadata } from "next";
import { Wordmark } from "@/components/ui/Logo";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16 pt-6 sm:pt-12">
      <Wordmark />
      <h1 className="mt-10 text-[clamp(2rem,1.6rem+1.5vw,2.8rem)]">
        No signal. <span className="display-italic">That&apos;s okay.</span>
      </h1>
      <p className="mt-4 text-ink-soft">
        This page hasn&apos;t been saved on your phone yet. If you&apos;ve opened the tracker before,
        it will still work offline. Anything you log is kept on this device and sent when
        you&apos;re back online.
      </p>
      <div className="mt-8">
        <LinkButton href="/app" variant="primary" size="lg">Try the tracker</LinkButton>
      </div>
      <p className="mt-10 text-[14px] text-ink-mute">
        In an emergency, call 911 (US). Phone calls don&apos;t need data.
      </p>
    </main>
  );
}
