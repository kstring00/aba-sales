import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Prose } from "@/components/site/Prose";

export const metadata: Metadata = { title: "Setup needed", robots: { index: false } };

/** Shown instead of the tracker when Supabase isn't configured yet. */
export default function SetupPage() {
  return (
    <>
      <SiteHeader />
      <Prose
        title="Almost there"
        lede="The tracker needs a Supabase project before anyone can sign in. This page only appears when the environment isn't configured."
      >
        <ol className="space-y-3 [&_li]:ml-5 [&_li]:list-decimal">
          <li>Create a Supabase project and run <code>supabase/migrations/0001_init.sql</code> in the SQL editor.</li>
          <li>Enable Email (magic link) and Google providers under Authentication.</li>
          <li>Add the redirect URL <code>/auth/callback</code> for your site origin.</li>
          <li>Set <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and <code>SUPABASE_SERVICE_KEY</code> in your environment.</li>
        </ol>
        <p>Full steps are in the README.</p>
      </Prose>
      <SiteFooter />
    </>
  );
}
