import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Crisis resources",
  description:
    "If someone is in immediate danger, call 911. Phone and text lines for parents and caregivers in the US, available without an account.",
};

// Static. No auth, no AI, no data dependency. Reachable from every screen.
export const dynamic = "force-static";

export default function CrisisPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">If you need help right now</h1>
        <p className="mt-5 text-[1.15rem] text-ink-soft">
          You don&apos;t need an account for this page. These numbers are for the United States.
        </p>

        <div className="mt-10 space-y-4">
          <Line
            title="Someone is in immediate danger, badly hurt, or needs medical help"
            action="Call 911"
            href="tel:911"
            body="Step away from the situation only as far as you need to make the call. Stay where you can see your child if it's safe to."
          />
          <Line
            title="You're afraid you might hurt your child, or you're worried a child is being hurt"
            action="Call 1-800-422-4453"
            href="tel:18004224453"
            body="Childhelp National Child Abuse Hotline. Counselors, 24/7, in 170 languages. You can call about yourself. Also at childhelphotline.org."
          />
          <Line
            title="You're in a mental health crisis or thinking about suicide"
            action="Call or text 988"
            href="tel:988"
            body="988 Suicide & Crisis Lifeline. 24/7. Press 1 for veterans, 2 for Spanish. Chat at 988lifeline.org."
          />
          <Line
            title="You'd rather text"
            action="Text HOME to 741741"
            href="sms:741741&body=HOME"
            body="Crisis Text Line. Free, 24/7, a real person."
          />
        </div>

        <div className="mt-14 space-y-4 text-ink-soft">
          <h2>A few honest things</h2>
          <p>
            This website can&apos;t send help to you. Nobody here is watching your messages. The
            people on the lines above can, and they talk to exhausted parents every day.
          </p>
          <p>
            If you&apos;re outside the US, your country&apos;s emergency number is the fastest
            route. We&apos;re working on a list of international lines.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Line({ title, action, href, body }: { title: string; action: string; href: string; body: string }) {
  return (
    <div className="rounded-lg bg-paper p-6 shadow-soft">
      <h2 className="text-[1.25rem] leading-snug">{title}</h2>
      <a
        href={href}
        className="lift mt-4 inline-flex min-h-14 items-center rounded-pill bg-ink px-6 text-[17px] font-medium text-paper hover:bg-ink-soft"
      >
        {action}
      </a>
      <p className="mt-4 text-[15px] text-ink-soft">{body}</p>
    </div>
  );
}
