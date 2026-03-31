import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessToken } from "@/lib/auth/jwt";

const ADMIN_LOGIN = "/admin/login";
const ADMIN_HOME = "/admin";
const ACCESS_TOKEN_COOKIE = "admin_access_token";

const ADMIN_ALLOWED_PREFIXES = ["/admin", "/admin/profile", "/admin/account", "/admin/settings"];

function isAllowedAdminPath(pathname: string): boolean {
  return ADMIN_ALLOWED_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

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
  const url = new URL(ADMIN_LOGIN, req.url);

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

function redirectToAdminHome(req: NextRequest) {
  return NextResponse.redirect(new URL(ADMIN_HOME, req.url));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  /**
   * 1) Route login admin
   * Nếu đã có token hợp lệ và đúng quyền thì không cho quay lại login nữa.
   */
  if (pathname === ADMIN_LOGIN) {
    if (!token) {
      return NextResponse.next();
    }

    const payload = await verifyAdminAccessToken(token);

    if (!payload) {
      return redirectToLogin(req, { clearCookie: true });
    }

    if (payload.status !== "ACTIVE") {
      return redirectToLogin(req, { clearCookie: true });
    }

    if (payload.systemRole === "SUPER_ADMIN" || payload.systemRole === "ADMIN") {
      return redirectToAdminHome(req);
    }

    return redirectToLogin(req, { clearCookie: true });
  }

  /**
   * 2) Các route /admin khác bắt buộc phải có token
   */
  if (!token) {
    return redirectToLogin(req, { preserveNext: true });
  }

  const payload = await verifyAdminAccessToken(token);

  /**
   * 3) Token không hợp lệ => xóa cookie và đá về login
   */
  if (!payload) {
    return redirectToLogin(req, {
      clearCookie: true,
      preserveNext: true,
    });
  }

  /**
   * 4) User bị khóa thì không cho vào admin
   */
  if (payload.status !== "ACTIVE") {
    return redirectToLogin(req, { clearCookie: true });
  }

  /**
   * 5) CUSTOMER không được vào admin
   */
  if (payload.systemRole === "CUSTOMER") {
    return redirectToLogin(req, { clearCookie: true });
  }

  /**
   * 6) SUPER_ADMIN có toàn quyền
   */
  if (payload.systemRole === "SUPER_ADMIN") {
    return NextResponse.next();
  }

  /**
   * 7) ADMIN (sub_admin) chỉ được vào các route cho phép
   */
  if (payload.systemRole === "ADMIN") {
    if (!isAllowedAdminPath(pathname)) {
      return redirectToAdminHome(req);
    }

    return NextResponse.next();
  }

  /**
   * 8) Fallback an toàn
   */
  return redirectToLogin(req, { clearCookie: true });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
