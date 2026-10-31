import glossaryJson from "../../../content/glossary.json";
import resourcesJson from "../../../content/resources.json";
import uiJson from "../../../content/ui.json";
import { isProductionDeploy } from "./pages";

/** Short structured content (JSON). Bundled at build time; safe on server and client. */
export const ui = uiJson;

export type GlossaryTerm = {
  term: string;
  slug: string;
  full: string;
  short: string;
  long: string;
  aliases: string[];
  category: "people" | "documents" | "therapy terms" | "insurance & services" | "school";
  status: "pending" | "draft" | "published";
};
export const glossary = glossaryJson.terms as GlossaryTerm[];

export type Resource = {
  id: string;
  name: string;
  category: "crisis" | "parent-support" | "find-care";
  region: string;
  title: string;
  whatFor: string;
  action: { label: string; href: string } | null;
  url: { label: string; href: string } | null;
  lastVerified: string | null;
  appliesTo?: { age?: string[]; coverage?: string[]; state?: string[] };
};
export const resources = resourcesJson.resources as Resource[];

/** An entry with TODO_VERIFY anywhere is not ready for the live site. */
export function needsVerification(r: Resource): boolean {
  return JSON.stringify(r).includes("TODO_VERIFY");
}

/** Entries to render on this deployment. TODO_VERIFY entries show only outside production. */
export function visibleResources(category?: Resource["category"]): Resource[] {
  return resources.filter((r) => (!category || r.category === category) && (!needsVerification(r) || !isProductionDeploy()));
}
