import { shelfById } from "@/lib/shelves";

/** Which shelf a sign-up came from, from its form name ("shelf-plan-soon" → "Make a Plan"). */
export function shelfTitleFromSource(source: string): string | null {
  const id = /^shelf-([a-z]+)/.exec(source)?.[1];
  return id ? shelfById(id)?.title ?? null : null;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** "You're on the list": sent once, right after someone signs up. */
export function confirmationEmail({ source, unsubscribeUrl }: { source: string; unsubscribeUrl: string }) {
  const shelf = shelfTitleFromSource(source);
  const what = shelf ? `when the next tool on the ${shelf} shelf is ready` : "when new downloads reach the shelf";
  const lines = [
    "Thanks for signing up on The Support Shelf.",
    `We'll email you ${what}. That's a few emails a year at most, and there's nothing else you need to do.`,
    "Didn't sign up? Use the unsubscribe link below and you won't hear from us again.",
    "Questions? Just reply. A person reads every one.",
  ];
  return {
    subject: "You're on the list",
    text: `${lines.join("\n\n")}\n\nThe Support Shelf\n\nUnsubscribe: ${unsubscribeUrl}`,
    html:
      lines.map((l) => `<p>${esc(l)}</p>`).join("") +
      `<p>— The Support Shelf</p><p style="color:#5c6660;font-size:13px"><a href="${esc(unsubscribeUrl)}" style="color:#5c6660">Unsubscribe</a></p>`,
  };
}
