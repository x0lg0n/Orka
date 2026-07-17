import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ACTIVE_SLUG = "orka_active_org_slug";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return applyOrgRouting(request, supabaseResponse);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/signup";
    return NextResponse.redirect(redirectUrl);
  }

  return applyOrgRouting(request, supabaseResponse);
}

// Mirrors the active workspace slug into a cookie and redirects the legacy
// /dashboard home into the new /w/[slug]/dashboard architecture.
function applyOrgRouting(request: NextRequest, res: NextResponse): NextResponse {
  const { pathname } = request.nextUrl;

  const wMatch = pathname.match(/^\/w\/([^/]+)/);
  if (wMatch) {
    const slug = wMatch[1];
    res.cookies.set(ACTIVE_SLUG, slug, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/home") {
    const slug = request.cookies.get(ACTIVE_SLUG)?.value;
    const target = slug ? `/w/${slug}/dashboard` : "/workspaces";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
