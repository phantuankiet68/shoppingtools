import { NextRequest } from "next/server";
import { verifyAdminAccessToken } from "@/lib/auth/jwt";

const ACCESS_TOKEN_COOKIE = "admin_access_token";

type AuthUser = {
  systemRole: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE" | "LOCKED";
};

type AuthResult =
  | { ok: true; user: AuthUser; clearCookie: false }
  | { ok: false; clearCookie: boolean };

export async function getAuthContextFromRequest(req: NextRequest): Promise<AuthResult> {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return { ok: false, clearCookie: false };
  }

  const payload = await verifyAdminAccessToken(token);

  if (!payload) {
    return { ok: false, clearCookie: true };
  }

  if (payload.status !== "ACTIVE") {
    return { ok: false, clearCookie: true };
  }

  if (payload.systemRole === "CUSTOMER") {
    return { ok: false, clearCookie: true };
  }

  return {
    ok: true,
    user: {
      systemRole: payload.systemRole,
      status: payload.status,
    },
    clearCookie: false,
  };
}