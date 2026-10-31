/** Browser-safe: whether this is the production deployment. Pending content hides there. */
export function isProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === "production";
}
