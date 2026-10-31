import Image from "next/image";
import Link from "next/link";
import type { DrawerShelf } from "@/lib/drawer";
import { D, DrawerGlyph, SHELF_GLYPH } from "@/components/home/drawer-icons";

/**
 * One shelf's drawer contents, server-rendered so product names and prices
 * are in the HTML with no script. The client wrapper only toggles `hidden`.
 */
export function DrawerPanel({ shelf }: { shelf: DrawerShelf }) {
  return (
    <div className="sd-pc">
      <div className="sd-phead">
        <div>
          <span className="sd-chip">
            <i><DrawerGlyph name={SHELF_GLYPH[shelf.id]} /></i>Shelf {shelf.number}
          </span>
          <h2>{shelf.title}</h2>
          <p>{shelf.lead}</p>
        </div>
        <ul className="sd-checks" aria-label="You'll be able to">
          {shelf.checks.map((c, i) => (
            <li key={c} style={{ "--i": i } as React.CSSProperties}>
              <i><D.check /></i>{c}
            </li>
          ))}
        </ul>
      </div>
      <div className="sd-cards">
        {shelf.cards.map((card, i) => {
          const now = card.status !== "soon";
          return (
            <article key={card.key} className="sd-card" style={{ "--i": i } as React.CSSProperties}>
              <div className={`sd-cover${now ? " now" : ""}`}>
                {card.image ? (
                  <Image src={card.image.url} alt={card.image.alt} fill sizes="(min-width: 980px) 22vw, (min-width: 520px) 45vw, 90vw" />
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
              <Link href={card.href} className={`sd-btn ${now ? "accent" : "ghost"}`}>
                {card.cta}
                {card.status === "soon" ? <span className="sr-only"> about {card.title}</span> : null}
                <D.arrow />
              </Link>
            </article>
          );
        })}
      </div>
      <Link href={`/shelf#${shelf.id}`} className="sd-seeall">
        <span>See all tools on the {shelf.title} shelf</span>
        <D.arrow />
      </Link>
    </div>
  );
}
