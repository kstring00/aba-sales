import Image from "next/image";
import Link from "next/link";
import type { DrawerCard } from "@/lib/drawer";
import { D, DrawerGlyph } from "@/components/home/drawer-icons";

/**
 * The cards inside a shelf: live products and the built-in tool link out;
 * coming-soon items are plain cards with a pill and no button (audit F-12).
 * Used by the homepage drawer and by /shelf so both read identically.
 */
export function DrawerCards({ cards }: { cards: DrawerCard[] }) {
  return (
    <div className="sd-cards">
      {cards.map((card, i) => {
        const now = card.status !== "soon";
        return (
          <article key={card.key} className={`sd-card${now ? "" : " soon"}`} style={{ "--i": i } as React.CSSProperties}>
            <div className={`sd-cover${now ? " now" : ""}`}>
              {card.image ? (
                <Image src={card.image.url} alt={card.title} fill sizes="(min-width: 980px) 22vw, (min-width: 520px) 45vw, 90vw" />
              ) : (
                <>
                  <div className="sd-sheet" aria-hidden><b /><b /><b /></div>
                  <span className="sd-badge"><DrawerGlyph name={card.icon} /></span>
                </>
              )}
              <span className={`sd-status${now ? " now" : ""}`}>{card.status === "soon" ? "Coming soon" : card.priceLabel}</span>
            </div>
            <h3>{card.title}</h3>
            <p>{card.blurb}</p>
            {now ? (
              <Link href={card.href} className="sd-btn accent">
                {card.cta} <D.arrow />
              </Link>
            ) : (
              <p className="sd-soon-note">Being made. The email box on this shelf tells you when it&apos;s ready.</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
