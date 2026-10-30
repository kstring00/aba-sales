import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-24 pt-16 sm:px-8">
        <h1>That shelf is <span className="display-italic">empty.</span></h1>
        <p className="mt-5 text-ink-soft">The page you were looking for isn&apos;t here. Nothing was lost.</p>
        <div className="mt-8">
          <LinkButton href="/" variant="primary" size="lg">Back home</LinkButton>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
