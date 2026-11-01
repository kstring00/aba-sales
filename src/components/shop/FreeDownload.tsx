import { buttonClass } from "@/components/ui/Button";
import { EmailCapture } from "@/components/shop/EmailCapture";

/**
 * A free download with no checkout. The PDF downloads on click; the email
 * box under it is optional and says so. `compact` is the mobile bottom bar:
 * just the button.
 */
export function FreeDownload({ handle, title, file, pages, compact = false }: { handle: string; title: string; file: string; pages: number; compact?: boolean }) {
  const button = (
    <a href={file} download={`${title}.pdf`} className={buttonClass("primary", "lg", "w-full no-underline")}>
      Download free PDF
    </a>
  );
  if (compact) return button;
  return (
    <div className="space-y-3">
      {button}
      <p className="text-[13px] text-ink-mute">
        {pages} pages, prints on US Letter. No checkout, no account, no email needed.
      </p>
      <div className="paper-card mt-2 p-4">
        <p className="text-[15px] text-ink">Want the next free tool when it&apos;s ready?</p>
        <p className="mt-1 text-[13px] text-ink-mute">Optional. A few emails a year, and you can unsubscribe in one click.</p>
        <div className="mt-3"><EmailCapture source={`free-${handle}`} cta="Tell me" /></div>
      </div>
    </div>
  );
}
