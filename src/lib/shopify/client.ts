/**
 * Shopify Storefront API client.
 *
 * Architectural decision in one sentence: the app only ever talks to the
 * Storefront API (reads + cart mutations), so the Admin API, product
 * publishing, and payments stay entirely inside Shopify.
 *
 * The Headless channel issues two tokens. A public token goes in
 * X-Shopify-Storefront-Access-Token; a private one (shpat_…) must go in
 * Shopify-Storefront-Private-Token. Either works here, so a pasted private
 * token no longer produces a silent empty catalog.
 */
const RAW_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const TOKEN = (process.env.SHOPIFY_STOREFRONT_TOKEN ?? "").trim();
const VERSION = (process.env.SHOPIFY_API_VERSION ?? "2025-10").trim();

/** Accepts "vgb9f2-eg.myshopify.com", "https://vgb9f2-eg.myshopify.com/", etc. */
export function normalizeDomain(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
}
const DOMAIN = normalizeDomain(RAW_DOMAIN);

// Production fails at build time without the Storefront credentials: an
// empty catalog would otherwise ship silently as "coming soon" (audit F-01).
if (process.env.VERCEL_ENV === "production" && (!DOMAIN || !TOKEN)) {
  throw new Error(
    "SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN must be set for the Production environment (Headless channel, public Storefront token with unauthenticated_read_product_listings and unauthenticated_write_checkouts). See docs/AUDIT_FIXES.md → Operator actions.",
  );
}

export function tokenKind(token: string = TOKEN): "private" | "public" | "none" {
  if (!token) return "none";
  return token.startsWith("shpat_") ? "private" : "public";
}

export function authHeader(token: string = TOKEN): Record<string, string> {
  return tokenKind(token) === "private" ? { "Shopify-Storefront-Private-Token": token } : { "X-Shopify-Storefront-Access-Token": token };
}

export function shopifyConfigured() {
  return Boolean(DOMAIN && TOKEN);
}

/** Non-secret view of the configuration, for the health endpoint and logs. */
export function shopifyConfigSummary() {
  return { domain: DOMAIN || null, tokenKind: tokenKind(), tokenLength: TOKEN.length, version: VERSION, configured: shopifyConfigured() };
}

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly errors?: unknown,
  ) {
    super(message);
  }
}

type GraphQLResponse<T> = { data?: T; errors?: Array<{ message: string }> };

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  init: { revalidate?: number | false; tags?: string[] } = {},
): Promise<T> {
  if (!shopifyConfigured()) throw new ShopifyError("Shopify is not configured");
  let res: Response;
  try {
    res = await fetch(`https://${DOMAIN}/api/${VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ query, variables }),
      // ISR: product and collection reads revalidate on a timer so Shopify
      // edits show up within minutes with no redeploy. Cart calls never cache.
      next: init.revalidate === false ? undefined : { revalidate: init.revalidate ?? 300, tags: init.tags },
      cache: init.revalidate === false ? "no-store" : undefined,
    });
  } catch (e) {
    console.warn(`[shopify] network error reaching ${DOMAIN}: ${e instanceof Error ? e.message : String(e)}`);
    throw new ShopifyError("Storefront API unreachable");
  }
  if (!res.ok) {
    console.warn(`[shopify] Storefront API ${res.status} from ${DOMAIN} (token: ${tokenKind()}, version ${VERSION})`);
    throw new ShopifyError(`Storefront API ${res.status}`, res.status);
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    const msg = json.errors.map((e) => e.message).join("; ");
    console.warn(`[shopify] GraphQL errors: ${msg}`);
    throw new ShopifyError(msg, res.status, json.errors);
  }
  if (!json.data) throw new ShopifyError("Empty Storefront response");
  return json.data;
}
