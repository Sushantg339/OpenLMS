import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/checkout", "/dashboard", "/learn", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  // We can't access httpOnly cookies' *values* in middleware (they're on the
  // client only), but we CAN check if the cookie *exists* — which is enough
  // to decide whether to redirect. The actual auth verification still happens
  // server-side on every API call.
  const hasAccessToken = request.cookies.has("accessToken");

  if (!hasAccessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/dashboard/:path*", "/learn/:path*", "/admin/:path*"],
};