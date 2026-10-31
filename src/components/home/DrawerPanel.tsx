import Link from "next/link";
import type { DrawerShelf } from "@/lib/drawer";
import { D, DrawerGlyph, SHELF_GLYPH } from "@/components/home/drawer-icons";
import { DrawerCards } from "@/components/home/DrawerCards";

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
      <DrawerCards cards={shelf.cards} />
      <Link href={`/shelf#${shelf.id}`} className="sd-seeall">
        <span>See all tools on the {shelf.title} shelf</span>
        <D.arrow />
      </Link>
    </div>
  );
}
