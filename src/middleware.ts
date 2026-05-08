import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const OLD_STORAGE_HOST = "db.firstbencher.com";
const NEW_STORAGE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "db.firstbencher.com";

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

  // Redirect unauthenticated users away from /admin/*
  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // [Optional] If you want to strictly check if the user is an admin in the database:
  // This adds latency to every admin request, but is more secure.
  if (isAdminRoute && user) {
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!adminData) {
      // Not an admin? Log them out of the admin area and send to student login or home
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
  matcher: ["/admin/:path*", "/_next/image"],
};
