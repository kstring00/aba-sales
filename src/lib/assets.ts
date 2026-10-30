/**
 * Photography manifest. Every photo slot on the site is declared here with
 * its brief, so the design works with placeholders today and swaps to real
 * images by filling `src`. No slot ever renders an AI-generated person as a
 * real customer; generated images, if used, are illustrative only.
 */
export type Asset = {
  id: string;
  title: string;
  purpose: string;
  placement: string;
  brief: string;
  /** Desktop and mobile crops, as aspect ratios. */
  crop: { desktop: string; mobile: string };
  alt: string;
  format: "jpg" | "webp" | "avif";
  licensing: "pending: commission or license" | "owned" | "licensed" | "illustrative (generated), not a real family";
  /** Path under /public once the photo exists. Null renders the designed placeholder. */
  src: string | null;
  /** Placeholder palette: warm paper, sage, blue, lavender. */
  tone: "paper" | "sage" | "blue" | "lavender" | "wood";
};

export const ASSETS: Record<string, Asset> = {
  ordinaryMoment: {
    id: "ordinaryMoment",
    title: "The Ordinary Moment",
    purpose: "Homepage hero. Recognition before the pitch.",
    placement: "/ hero, right two-thirds on desktop; full-bleed behind type on mobile with a paper scrim",
    brief:
      "Naturally lit family dining room, afternoon sun from the side. A parent and child mid-activity (colored pencils, a mug, a routine card, a notebook). Neither looks at camera. No posed smiles, no staged sadness. Lived-in, not styled. Leave clean negative space at left for the headline.",
    crop: { desktop: "16 / 10", mobile: "4 / 5" },
    alt: "A parent and child at a kitchen table in afternoon light, drawing together beside a mug and a printed routine card.",
    format: "avif",
    licensing: "pending: commission or license",
    src: null,
    tone: "paper",
  },
  thingsWeCarry: {
    id: "thingsWeCarry",
    title: "The Things We Carry",
    purpose: "Recognition section. The practical load, made visible without a face.",
    placement: "/ 'We see the work you do', full-width band",
    brief:
      "Editorial still life: an appointment calendar, three cream folders, a pen, handwritten notes, a cup of tea. Natural window shadow. Quiet order emerging from many responsibilities. No legible medical text, no fabricated patient details.",
    crop: { desktop: "21 / 9", mobile: "4 / 3" },
    alt: "A calendar, folders, a pen, and a cup of tea arranged on a wooden table in soft daylight.",
    format: "avif",
    licensing: "pending: commission or license",
    src: null,
    tone: "wood",
  },
  placeForEverything: {
    id: "placeForEverything",
    title: "A Place for Everything",
    purpose: "Shelf section and /shelf header. The downloads as premium stationery.",
    placement: "/shelf header; / 'The Support Shelf' intro",
    brief:
      "Printed pages of the actual products (Care Binder tabs, observation sheets, the waitlist playbook) stacked and fanned on an oak table. Shot overhead and at 30°. Real pages only, once they exist.",
    crop: { desktop: "3 / 2", mobile: "4 / 5" },
    alt: "Printed worksheets and a tabbed binder arranged on an oak table.",
    format: "avif",
    licensing: "pending: commission or license",
    src: null,
    tone: "wood",
  },
  humanSide1: {
    id: "humanSide1",
    title: "The Human Side · preparing",
    purpose: "Finder section texture.",
    placement: "/ 'What would help you today?', side image on desktop",
    brief: "A parent at a kitchen table, evening, writing questions on a notepad before an appointment. Hands and paper in focus; face soft or turned.",
    crop: { desktop: "4 / 5", mobile: "3 / 2" },
    alt: "Hands writing a list of questions on a notepad at a kitchen table in the evening.",
    format: "avif",
    licensing: "pending: commission or license",
    src: null,
    tone: "lavender",
  },
  humanSide2: {
    id: "humanSide2",
    title: "The Human Side · help arriving",
    purpose: "Support-beyond section.",
    placement: "/ 'Support can come from more than one place'",
    brief: "A relative carrying in groceries or holding a casserole dish at a doorway; a child's shoes by the door. Warm, unposed.",
    crop: { desktop: "4 / 5", mobile: "3 / 2" },
    alt: "A doorway with a child's shoes beside it, and someone arriving with a dish.",
    format: "avif",
    licensing: "pending: commission or license",
    src: null,
    tone: "blue",
  },
  founder: {
    id: "founder",
    title: "Founder portrait",
    purpose: "Why this shelf exists.",
    placement: "/ founder section; /about",
    brief: "Real portrait of the founder, natural light, neutral background, no clinic props. Never generated.",
    crop: { desktop: "4 / 5", mobile: "1 / 1" },
    alt: "Portrait of the founder of The Support Shelf.",
    format: "avif",
    licensing: "owned",
    src: null,
    tone: "sage",
  },
  theShelf: {
    id: "theShelf",
    title: "The Shelf",
    purpose: "Signature brand image; social share; /about.",
    placement: "OG image, /about header",
    brief: "A warm wooden shelf with books, cream folders, a notebook, a printed routine, a small plant, one framed photo turned away. Recognizably ours. Even light.",
    crop: { desktop: "16 / 9", mobile: "4 / 5" },
    alt: "A wooden shelf holding books, folders, a notebook, and a small plant.",
    format: "avif",
    licensing: "pending: commission or license",
    src: null,
    tone: "wood",
  },
};
