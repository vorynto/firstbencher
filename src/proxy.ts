import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const OLD_STORAGE_HOST = "db.firstbencher.com";
const NEW_STORAGE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "db.firstbencher.com";

// Routes that require a logged-in, active user account
const USER_PROTECTED_PATHS = ["/feedback"];

export async function proxy(request: NextRequest) {
  // Rewrite Next.js image optimization requests that still use the old storage domain
  if (request.nextUrl.pathname === "/_next/image") {
    const urlParam = request.nextUrl.searchParams.get("url");
    if (urlParam?.includes(OLD_STORAGE_HOST)) {
      const rewritten = request.nextUrl.clone();
      rewritten.searchParams.set(
        "url",
        urlParam.replace(OLD_STORAGE_HOST, NEW_STORAGE_HOST),
      );
      return NextResponse.rewrite(rewritten);
    }
  }

  // Inject current pathname into request headers so server components can read it
  // (used by Header.tsx / Footer.tsx to resolve per-page header/footer variants)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-next-pathname", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminLogin = path === "/admin/login";
  const isAdminRoute = path.startsWith("/admin") && !isAdminLogin;

  // ── User-protected routes (/feedback) ──────────────────────────────────────
  const isUserProtected = USER_PROTECTED_PATHS.some(p => path === p || path.startsWith(p + "/"));

  if (isUserProtected) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();
    if (!profile?.is_active) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "disabled");
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminRoute && user) {
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!adminData) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isAdminLogin && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
