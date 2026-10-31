import { NextResponse } from "next/server";
import { shopifyConfigSummary, storefront, ShopifyError } from "@/lib/shopify/client";
import { SHELVES } from "@/lib/shopify/catalog";
import { fixturesEnabled } from "@/lib/shopify/fixtures";

export const dynamic = "force-dynamic";

/**
 * Read-only diagnostics, no secrets: is the Storefront API configured in
 * this environment, does it answer, and how many products does each shelf
 * collection return. Open /api/health/shopify on the deployment to see
 * exactly what the pages see.
 */
export async function GET() {
  const config = shopifyConfigSummary();
  const result: Record<string, unknown> = { ...config, fixtures: fixturesEnabled(), vercelEnv: process.env.VERCEL_ENV ?? null };
  if (!config.configured) {
    result.ok = false;
    result.problem = !config.domain ? "SHOPIFY_STORE_DOMAIN is not set for this environment." : "SHOPIFY_STOREFRONT_TOKEN is not set for this environment.";
    return NextResponse.json(result, { status: 200, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  }
  try {
    const data = await storefront<{ shop: { name: string }; [k: string]: unknown }>(
      `query Health { shop { name } ${SHELVES.map((s, i) => `c${i}: collection(handle: "${s.handle}") { handle products(first: 50) { edges { node { handle } } } }`).join(" ")} }`,
      {},
      { revalidate: false },
    );
    result.ok = true;
    result.shop = data.shop?.name ?? null;
    result.collections = SHELVES.map((s, i) => {
      const c = data[`c${i}`] as { handle: string; products: { edges: Array<{ node: { handle: string } }> } } | null;
      return { handle: s.handle, found: Boolean(c), products: c?.products.edges.map((e) => e.node.handle) ?? [] };
    });
  } catch (e) {
    result.ok = false;
    result.status = e instanceof ShopifyError ? e.status ?? null : null;
    result.problem = e instanceof Error ? e.message : String(e);
    if (result.status === 401 || result.status === 403) result.hint = "The token was rejected. Copy it again from Shopify → Sales channels → Headless → Manage → Storefront API (public token, or the private token which also works here).";
    if (result.status === 404) result.hint = "The domain or API version is wrong. Use the myshopify.com domain, e.g. vgb9f2-eg.myshopify.com.";
  }
  return NextResponse.json(result, { status: 200, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
