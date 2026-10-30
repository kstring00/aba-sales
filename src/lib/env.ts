/**
 * Environment access. Public values may be read anywhere; server values are
 * only read inside files that import "server-only".
 */
export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "",
};

/** True when Supabase is configured. The UI degrades politely when it is not. */
export const supabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
