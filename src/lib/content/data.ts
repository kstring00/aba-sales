import glossaryJson from "../../../content/glossary.json";
import resourcesJson from "../../../content/resources.json";
import uiJson from "../../../content/ui.json";
import trackerJson from "../../../content/tracker.json";
import { isProductionDeploy } from "./deploy";

/** Short structured content (JSON). Bundled at build time; safe on server and client. */
export const ui = uiJson;
export const tracker = trackerJson;

/** Status-bearing items show when published, or anywhere outside production. */
export function showItem(item: { status?: string } | null | undefined): boolean {
  return Boolean(item) && (item!.status === "published" || !isProductionDeploy());
}

/** Fills {name} placeholders. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

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

/** Terms shown on this deployment: published everywhere, all terms outside production. */
export function visibleTerms(): GlossaryTerm[] {
  return glossary.filter((t) => t.status === "published" || !isProductionDeploy());
}

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
