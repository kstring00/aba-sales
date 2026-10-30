import { LinkButton } from "@/components/ui/Button";
import { Binder, Notebook, Sheets, Folder, Sun, Waves } from "@/components/illustrations/Shapes";
import type { ProductSummary } from "@/lib/shopify/types";

/**
 * Section one. An ocean-to-turquoise environment, bold warm type, and a
 * layered composition of resource objects. Everything is drawn, not stock;
 * the objects carry real product titles when the catalog has them.
 */
export function BrightHero({ products }: { products: ProductSummary[] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ocean via-[#1f7fa8] to-turq text-white" aria-labelledby="hero-h">
      {/* The sun sits behind the object composition, never behind the headline. */}
      <Sun className="pointer-events-none absolute -right-24 -top-28 hidden w-[36rem] opacity-70 lg:block" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pb-28 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-center lg:gap-10 lg:pb-40">
        <div className="max-w-[36rem]">
          <p className="text-[13px] uppercase tracking-[0.2em] text-sky">Printable tools for parents of kids in ABA therapy</p>
          <h1 id="hero-h" className="mt-5 text-[clamp(2.6rem,1.8rem+3.6vw,5.2rem)] leading-[1.0] !text-white">
            You&apos;re not alone <span className="display-italic">in this.</span>
          </h1>
          <p className="mt-6 font-display text-[clamp(1.3rem,1.1rem+0.9vw,1.8rem)] leading-snug text-sun">A little support can make a big difference in your day.</p>
          <p className="mt-5 max-w-[44ch] text-[1.1rem] text-white/90">
            Thoughtfully made tools to help families organize information, prepare for appointments, and navigate everyday moments with a little more clarity.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <LinkButton href="/abc" variant="primary" size="lg">Try the free ABC Logger</LinkButton>
            <a href="#shelf" className="inline-flex min-h-14 items-center justify-center rounded-pill border border-white/40 px-7 text-[17px] font-medium text-white hover:bg-white/10">Explore the shelf</a>
          </div>
          <p className="mt-5 text-[14px] text-white/80">
            {products.length > 0
              ? `${products.length} download${products.length === 1 ? "" : "s"} available now, more on the way. The logger is free, no account.`
              : "The free logger is ready now. The first downloads are on the way."}
          </p>
        </div>

        {/* Editorial composition: drawn objects, real titles, soft depth. */}
        <div className="relative mx-auto aspect-[5/4] w-full max-w-[34rem]" aria-hidden="true">
          <Sun className="absolute -right-10 -top-10 w-[60%] opacity-70 lg:hidden" />
          <div className="absolute inset-x-[6%] bottom-[8%] top-[18%] rounded-[40%_60%_55%_45%/50%_45%_55%_50%] bg-white/15 blur-sm" />
          <Sheets className="float-slower absolute left-[2%] top-[14%] w-[44%] drop-shadow-[0_24px_30px_rgba(8,60,70,0.35)]" />
          <Binder tone="coral" className="float-slow absolute left-[30%] top-[4%] w-[46%] drop-shadow-[0_30px_40px_rgba(8,60,70,0.4)]" />
          <Notebook tone="sun" className="absolute bottom-[6%] right-[0%] w-[58%] drop-shadow-[0_20px_30px_rgba(8,60,70,0.35)]" />
          <Folder tone="leaf" className="float-slow absolute bottom-[2%] left-[0%] w-[42%] drop-shadow-[0_18px_24px_rgba(8,60,70,0.3)]" />
          <div className="absolute right-[6%] top-[10%] flex -rotate-6 flex-col gap-1 rounded-md bg-white px-3 py-2 text-[12px] font-medium text-ink shadow-lift">
            <span className="h-2 w-16 rounded-pill bg-sun" /><span className="h-2 w-12 rounded-pill bg-turq" /><span className="h-2 w-20 rounded-pill bg-coral" />
          </div>
        </div>
      </div>
      <Waves className="absolute inset-x-0 bottom-0 h-20 w-full md:h-28" />
    </section>
  );
}

