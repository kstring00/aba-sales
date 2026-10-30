import type { ProductSummary } from "@/lib/shopify/types";

/**
 * Editorial layer over the catalog. Nothing here creates inventory: a product
 * is shown only when the Storefront API returns it. This file adds the human
 * framing (who it may help, which task) and maps needs to what exists.
 */
export type ProductMeta = {
  handle: string;
  /** The task it supports, in one line. */
  task: string;
  /** Who it may help. */
  who: string;
  /** Category tint for the shelf. */
  category: "Observation and note-taking" | "Care coordination" | "Appointments and advocacy" | "Early service navigation" | "Home routines";
  tone: "sage" | "blue" | "lavender" | "paper";
};

export const PRODUCT_META: Record<string, ProductMeta> = {
  "home-abc-printable": {
    handle: "home-abc-printable",
    task: "Write down what happened, on paper, when a pen is closer than a phone.",
    who: "Parents who want a printed version of the ABC logger for the fridge or the car.",
    category: "Observation and note-taking",
    tone: "sage",
  },
  "waitlist-playbook": {
    handle: "waitlist-playbook",
    task: "Organize a search for services and keep track of every waitlist call.",
    who: "Families who've been told 'we'll call you' and want one place for intake questions and follow-ups.",
    category: "Early service navigation",
    tone: "blue",
  },
  "care-binder": {
    handle: "care-binder",
    task: "Keep provider details, appointments, questions, and documents in one place.",
    who: "Anyone coordinating care across more than one provider, school, or insurer.",
    category: "Care coordination",
    tone: "lavender",
  },
  "read-your-childs-treatment-plan": {
    handle: "read-your-childs-treatment-plan",
    task: "Understand the parts of an ABA treatment plan and the questions worth asking about it.",
    who: "Parents reading a plan for the first time, or preparing for a review meeting.",
    category: "Appointments and advocacy",
    tone: "paper",
  },
};

export function metaFor(handle: string): ProductMeta | null {
  return PRODUCT_META[handle] ?? null;
}

export const TONE_BG: Record<ProductMeta["tone"], string> = {
  sage: "bg-sage-tint",
  blue: "bg-blue-tint",
  lavender: "bg-lavender-tint",
  paper: "bg-cream-deep",
};

/** Needs-based pathways. Each resolves to real items or an honest "not yet". */
export type Pathway = {
  id: string;
  label: string;
  description: string;
  /** Product handles that serve this need, in order of fit. */
  handles: string[];
  /** Built-in free tools. */
  tools: Array<{ label: string; href: string; description: string }>;
  /** When nothing else exists yet. */
  notYet: string;
};

export const PATHWAYS: Pathway[] = [
  {
    id: "observe",
    label: "I want to write down an observation.",
    description: "What happened, what came right before, what came right after.",
    handles: ["home-abc-printable"],
    tools: [{ label: "The free ABC logger", href: "/abc", description: "Three taps on your phone. Stays in your browser. Exports a clean PDF." }],
    notYet: "",
  },
  {
    id: "appointment",
    label: "I want to prepare for an appointment.",
    description: "The questions you want to ask, and the notes to bring.",
    handles: ["read-your-childs-treatment-plan", "care-binder"],
    tools: [{ label: "Export from the ABC logger", href: "/abc#export", description: "A one-page-per-week PDF your provider can read in a minute." }],
    notYet: "An appointment preparation kit is planned.",
  },
  {
    id: "organize",
    label: "I need help organizing care information.",
    description: "Providers, insurance, school, documents, dates.",
    handles: ["care-binder"],
    tools: [],
    notYet: "",
  },
  {
    id: "routines",
    label: "I want to make everyday routines easier.",
    description: "Mornings, bedtimes, transitions.",
    handles: [],
    tools: [],
    notYet: "A home routine collection is planned. Until then, the free ABC logger can help you notice which parts of a routine are hardest.",
  },
  {
    id: "next-steps",
    label: "I'm trying to understand my next steps.",
    description: "Evaluations, waitlists, what a plan means.",
    handles: ["waitlist-playbook", "read-your-childs-treatment-plan"],
    tools: [],
    notYet: "",
  },
  {
    id: "people",
    label: "I want to find people or organizations that understand.",
    description: "Parent networks, advocacy groups, and the lines to call.",
    handles: [],
    tools: [
      { label: "Find your people", href: "/#people", description: "A short, checked list of national organizations and parent networks." },
      { label: "Crisis resources", href: "/crisis", description: "The numbers to call, no account needed." },
    ],
    notYet: "",
  },
];

export type Resolved = {
  pathway: Pathway;
  products: ProductSummary[];
  tools: Pathway["tools"];
  notYet: string | null;
};

/** Transparent matching: a pathway lists handles; we show the ones that exist. */
export function resolvePathway(pathway: Pathway, catalog: ProductSummary[]): Resolved {
  const products = pathway.handles.map((h) => catalog.find((p) => p.handle === h)).filter((p): p is ProductSummary => Boolean(p));
  const notYet = products.length === 0 && pathway.tools.length === 0 ? pathway.notYet || "Nothing here yet." : pathway.notYet && products.length === 0 ? pathway.notYet : null;
  return { pathway, products, tools: pathway.tools, notYet };
}

/** Verified-by-hand directory. Keep this list short and national. */
export type Org = { name: string; url: string; what: string; forWhom: string };
export const ORGS: Org[] = [
  { name: "Autism Society of America", url: "https://autismsociety.org/", what: "National helpline and local affiliates in most states.", forWhom: "Families looking for a person to talk to and nearby resources." },
  { name: "Autistic Self Advocacy Network", url: "https://autisticadvocacy.org/", what: "Run by and for autistic people. Plain-language resources and policy work.", forWhom: "Parents who want to hear from autistic adults." },
  { name: "Parent to Parent USA", url: "https://www.p2pusa.org/", what: "Matches parents with a trained support parent who has walked a similar road.", forWhom: "Anyone who wants one-to-one peer support." },
  { name: "Center for Parent Information and Resources", url: "https://www.parentcenterhub.org/find-your-center/", what: "Finds your state's Parent Training and Information Center for school and IEP questions.", forWhom: "Families navigating special education." },
  { name: "Family Voices", url: "https://familyvoices.org/", what: "Family-to-Family Health Information Centers in every state.", forWhom: "Questions about insurance, Medicaid waivers, and health systems." },
  { name: "211", url: "https://www.211.org/", what: "Local health and human services, including respite and family support.", forWhom: "Anyone, by phone or online, in most of the US." },
];
