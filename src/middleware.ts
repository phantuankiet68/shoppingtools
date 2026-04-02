import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessToken } from "@/lib/auth/jwt";

const LOGIN_PATH = "/admin/login";
const PLATFORM_HOME = "/platform";
const ADMIN_HOME = "/admin";
const ACCESS_TOKEN_COOKIE = "admin_access_token";

function clearAuthCookie(res: NextResponse) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function redirectToLogin(
  req: NextRequest,
  options?: {
    clearCookie?: boolean;
    preserveNext?: boolean;
  },
) {
  const url = new URL(LOGIN_PATH, req.url);

  if (options?.preserveNext) {
    const nextPath = req.nextUrl.pathname + req.nextUrl.search;
    url.searchParams.set("next", nextPath);
  }

  const res = NextResponse.redirect(url);

  if (options?.clearCookie) {
    clearAuthCookie(res);
  }

  return res;
}

function redirectToHomeByRole(req: NextRequest, role: string) {
  if (role === "SUPER_ADMIN") {
    return NextResponse.redirect(new URL(PLATFORM_HOME, req.url));
  }

  if (role === "ADMIN") {
    return NextResponse.redirect(new URL(ADMIN_HOME, req.url));
  }

  return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const isLoginPage = pathname === LOGIN_PATH;
  const isPlatformRoute = pathname === "/platform" || pathname.startsWith("/platform/");
  const isTenantRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  // Login page
  if (isLoginPage) {
    if (!token) {
      return NextResponse.next();
    }

    const payload = await verifyAdminAccessToken(token);

    if (!payload || payload.status !== "ACTIVE") {
      return redirectToLogin(req, { clearCookie: true });
    }

    if (payload.systemRole === "SUPER_ADMIN" || payload.systemRole === "ADMIN") {
      return redirectToHomeByRole(req, payload.systemRole);
    }

    return redirectToLogin(req, { clearCookie: true });
  }

  // Chỉ bảo vệ platform và tenant
  if (!isPlatformRoute && !isTenantRoute) {
    return NextResponse.next();
  }

  // Không có token
  if (!token) {
    return redirectToLogin(req, { preserveNext: true });
  }

  const payload = await verifyAdminAccessToken(token);

  // Token lỗi
  if (!payload) {
    return redirectToLogin(req, {
      clearCookie: true,
      preserveNext: true,
    });
  }

  // User bị khóa
  if (payload.status !== "ACTIVE") {
    return redirectToLogin(req, { clearCookie: true });
  }

  // CUSTOMER không được vào backoffice
  if (payload.systemRole === "CUSTOMER") {
    return redirectToLogin(req, { clearCookie: true });
  }

  // Chỉ SUPER_ADMIN được vào platform
  if (isPlatformRoute) {
    if (payload.systemRole !== "SUPER_ADMIN") {
      return redirectToHomeByRole(req, payload.systemRole);
    }

    return NextResponse.next();
  }

  // Chỉ ADMIN được vào tenant
  if (isTenantRoute) {
    if (payload.systemRole !== "ADMIN") {
      return redirectToHomeByRole(req, payload.systemRole);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/login", "/platform/:path*", "/tenant/:path*"],
};
