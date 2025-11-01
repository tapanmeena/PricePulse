import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/admin"];
const AUTH_PATHS = ["/login", "/register"];
const REFRESH_COOKIE_NAME = "refreshToken";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const refreshCookie = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  const isProtected = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (isProtected && !refreshCookie) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  const isAuthPage = AUTH_PATHS.includes(pathname);
  if (isAuthPage && refreshCookie) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
