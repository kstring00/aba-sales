import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv, supabaseConfigured } from "@/lib/env";

const PROTECTED_PREFIXES = ["/app"];

/**
 * Refreshes the Supabase session cookie on every request and performs an
 * optimistic redirect for signed-out visitors to protected routes. This is a
 * convenience, not the authorization boundary: every page and action under
 * /app re-checks the user server-side, and RLS re-checks in the database.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // When a redirect URL isn't on Supabase's allowlist, Supabase falls back to
  // the Site URL root with ?code= or ?token_hash=. Don't drop it on the floor.
  const sp = request.nextUrl.searchParams;
  if (path === "/" && (sp.has("code") || sp.has("token_hash"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/confirm";
    return NextResponse.redirect(url);
  }
  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

  if (!supabaseConfigured) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/setup";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() validates the JWT against Supabase; getSession() would not.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}
