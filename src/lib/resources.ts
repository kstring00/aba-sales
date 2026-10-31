/**
 * Editorial layer over the catalog. Nothing here creates inventory: a product
 * is shown only when the Storefront API returns it. This file adds the one
 * plain sentence a parent reads on a card, and who the item may help.
 */
export type ProductMeta = {
  handle: string;
  /** One plain sentence: what it actually is. */
  task: string;
  /** Who it may help. */
  who: string;
  /** Which illustrated paper object stands in for it on the shelf. */
  object: "binder" | "checklist" | "calendar" | "folder" | "booklet";
};

export const PRODUCT_META: Record<string, ProductMeta> = {
  "care-binder": {
    handle: "care-binder",
    task: "Keep every provider, appointment, question, and document in one place.",
    who: "Anyone coordinating care across more than one provider, school, or insurer.",
    object: "binder",
  },
  "home-abc-printable": {
    handle: "home-abc-printable",
    task: "A paper ABC log sheet for the fridge or the car, when a pen is closer than a phone.",
    who: "Parents who want a printed version of the free ABC logger.",
    object: "checklist",
  },
  "read-your-childs-treatment-plan": {
    handle: "read-your-childs-treatment-plan",
    task: "A plain-language walk through the parts of an ABA treatment plan and the questions worth asking.",
    who: "Parents reading a plan for the first time, or preparing for a review meeting.",
    object: "booklet",
  },
  "waitlist-playbook": {
    handle: "waitlist-playbook",
    task: "One place to track every waitlist call, intake question, and follow-up while you wait for services.",
    who: "Families who've been told \"we'll call you\" more than once.",
    object: "folder",
  },
};

export function metaFor(handle: string): ProductMeta | null {
  return PRODUCT_META[handle] ?? null;
}
