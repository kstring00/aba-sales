import { EmailCapture } from "@/components/shop/EmailCapture";

/** Zero published products: never a blank grid. */
export function EmptyShelf({ title = "The shelf is being stocked." }: { title?: string }) {
  return (
    <div className="shelf-edge pb-12">
      <div className="rounded-lg bg-paper p-8 shadow-shelf">
        <h2 className="text-[1.5rem]">{title}</h2>
        <p className="mt-3 max-w-[48ch] text-ink-soft">
          Downloads are on their way. Leave your email and we&apos;ll write once when the first ones are up. Nothing else.
        </p>
        <div className="mt-6 max-w-md">
          <EmailCapture source="empty-shelf" />
        </div>
      </div>
    </div>
  );
}
