/**
 * Browser-safe: whether this is the production deployment. Pending content
 * hides there. SUPPORT_SHELF_DEPLOY is inlined at build (next.config env)
 * so client components see the same answer as the server.
 */
export function isProductionDeploy(): boolean {
  return (process.env.SUPPORT_SHELF_DEPLOY ?? process.env.VERCEL_ENV) === "production";
}
