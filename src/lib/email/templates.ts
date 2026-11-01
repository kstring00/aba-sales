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

/** The welcome offer: the 15% code, sent right after someone claims it in the pop-up. */
export function welcomeOfferEmail({ code, percent, shopUrl, unsubscribeUrl }: { code: string; percent: number; shopUrl: string; unsubscribeUrl: string }) {
  const lines = [
    "Thanks for joining The Support Shelf.",
    `Here's ${percent}% off your first paid download. Enter this code at checkout:`,
  ];
  const after = [
    "It works once, on anything paid on the shelf. The free tools stay free.",
    "We'll also email you when a new tool reaches the shelf. That's a few emails a year at most.",
    "Questions? Just reply. A person reads every one.",
  ];
  return {
    subject: `Your ${percent}% code for The Support Shelf`,
    text: `${lines.join("\n\n")}\n\n${code}\n\n${after.join("\n\n")}\n\nBrowse the shelf: ${shopUrl}\n\nThe Support Shelf\n\nUnsubscribe: ${unsubscribeUrl}`,
    html:
      lines.map((l) => `<p>${esc(l)}</p>`).join("") +
      `<p style="font-size:22px;letter-spacing:0.08em;font-weight:600;margin:18px 0">${esc(code)}</p>` +
      after.map((l) => `<p>${esc(l)}</p>`).join("") +
      `<p><a href="${esc(shopUrl)}">Browse the shelf</a></p>` +
      `<p>— The Support Shelf</p><p style="color:#5c6660;font-size:13px"><a href="${esc(unsubscribeUrl)}" style="color:#5c6660">Unsubscribe</a></p>`,
  };
}
