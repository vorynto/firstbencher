import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const OLD_STORAGE_HOST = "db.firstbencher.com";
const NEW_STORAGE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "db.firstbencher.com";

// Routes that require a logged-in, active user account
const USER_PROTECTED_PATHS = ["/feedback"];

export async function middleware(request: NextRequest) {
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

  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
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

  // ── User-protected routes (/success-stories, /feedback) ─────────────────
  const isUserProtected = USER_PROTECTED_PATHS.some(p => path === p || path.startsWith(p + "/"));

  if (isUserProtected) {
    // Not logged in → redirect to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    // Logged in — check if account is active
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();

    if (!profile?.is_active) {
      // Account disabled — redirect to login with error flag
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "disabled");
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Admin routes ──────────────────────────────────────────────────────────
  // Redirect unauthenticated users away from /admin/*
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

  // Redirect logged-in users away from /admin/login → dashboard
  if (isAdminLogin && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/_next/image", "/feedback", "/feedback/:path*"],
};
