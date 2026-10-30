/**
 * Shopify Storefront API client.
 *
 * Architectural decision in one sentence: the app only ever talks to the
 * Storefront API with a public token (reads + cart mutations), so the
 * Admin API, product publishing, and payments stay entirely inside Shopify.
 */
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "";
const VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-10";

export function shopifyConfigured() {
  return Boolean(DOMAIN && TOKEN);
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
  const res = await fetch(`https://${DOMAIN}/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    // ISR: product and collection reads revalidate on a timer so Shopify
    // edits show up within minutes with no redeploy. Cart calls never cache.
    next: init.revalidate === false ? undefined : { revalidate: init.revalidate ?? 300, tags: init.tags },
    cache: init.revalidate === false ? "no-store" : undefined,
  });
  if (!res.ok) throw new ShopifyError(`Storefront API ${res.status}`, res.status);
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) throw new ShopifyError(json.errors.map((e) => e.message).join("; "), res.status, json.errors);
  if (!json.data) throw new ShopifyError("Empty Storefront response");
  return json.data;
}
