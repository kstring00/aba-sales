import { ui } from "@/lib/content/data";

/** Shown on preview and local builds for any page that is not yet published. Never in production (those pages 404). */
export function PendingBanner({ status }: { status: string }) {
  if (status === "published") return null;
  return (
    <p role="note" className="mb-6 rounded-md border border-dashed border-honey bg-honey-soft px-4 py-3 text-[14px] text-ink">
      <strong className="font-semibold uppercase tracking-wider">{status}</strong> · {ui.pending.banner}
    </p>
  );
}
