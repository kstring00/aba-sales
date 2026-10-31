import type { ReactNode } from "react";

/** Long-form page wrapper: one column, 68ch measure, generous rhythm. */
export function Prose({ children, title, lede }: { children: ReactNode; title: string; lede?: string }) {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
      <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">{title}</h1>
      {lede ? <p className="mt-5 text-[1.15rem] text-ink-soft">{lede}</p> : null}
      <div className="mt-10 space-y-5 text-ink-soft [&_h2]:mt-12 [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:text-ink [&_ul_li]:ml-5 [&_ul_li]:list-disc [&_ol_li]:ml-5 [&_ol_li]:list-decimal [&_h2]:scroll-mt-6 [&_strong]:text-ink">
        {children}
      </div>
    </main>
  );
}
