import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasAdminAccess, hasDevSiteAccess } from "@/lib/admin";
import { ACCOUNT_DELETED_ERROR_MESSAGE, isDeletedAccountMetadata } from "@/lib/account-status";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!(await hasDevSiteAccess(request.headers))) {
    const url = request.nextUrl.clone();
    url.pathname = "/access-denied";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const needsSessionCheck =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth");

  if (!needsSessionCheck) {
    return NextResponse.next();
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
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session (important: don't remove this)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isDeletedUser = isDeletedAccountMetadata(user);

  // Protect app pages — redirect unauthenticated users to login
  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) && (!user || isDeletedUser)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    if (isDeletedUser) {
      url.searchParams.set("error", ACCOUNT_DELETED_ERROR_MESSAGE);
      return NextResponse.redirect(url);
    }
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && !(await hasAdminAccess(request.headers, user?.email))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/auth") && user && !isDeletedUser) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|access-denied).*)"],
};
