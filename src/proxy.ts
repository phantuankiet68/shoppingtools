import { NextRequest, NextResponse } from "next/server";
import { getAuthContextFromRequest } from "@/lib/auth/guard";

const LOGIN_PATH = "/admin/login";
const PLATFORM_HOME = "/platform";
const ADMIN_HOME = "/admin";

function redirectToLogin(req: NextRequest, clearCookie = false, preserveNext = false) {
  const url = new URL(LOGIN_PATH, req.url);

  if (preserveNext) {
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  }

  const res = NextResponse.redirect(url);

  if (clearCookie) {
    res.cookies.set("admin_access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return res;
}

function redirectToHomeByRole(req: NextRequest, role?: string) {
  if (role === "SUPER_ADMIN") {
    return NextResponse.redirect(new URL(PLATFORM_HOME, req.url));
  }

  if (role === "ADMIN") {
    return NextResponse.redirect(new URL(ADMIN_HOME, req.url));
  }

  return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isPlatformRoute = pathname === "/platform" || pathname.startsWith("/platform/");
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isLoginPage && !isPlatformRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const auth = await getAuthContextFromRequest(req);

  if (isLoginPage) {
    if (!auth.ok) return NextResponse.next();
    return redirectToHomeByRole(req, auth.user.systemRole);
  }

  if (!auth.ok) {
    return redirectToLogin(req, auth.clearCookie, true);
  }

  if (isPlatformRoute && auth.user.systemRole !== "SUPER_ADMIN") {
    return redirectToHomeByRole(req, auth.user.systemRole);
  }

  if (isAdminRoute && auth.user.systemRole !== "ADMIN") {
    return redirectToHomeByRole(req, auth.user.systemRole);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/login", "/platform/:path*", "/admin/:path*"],
};