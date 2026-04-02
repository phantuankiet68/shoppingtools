import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

type AuthUser = {
  userId: string;
  email: string;
  systemRole: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
  status: string;
};

function getAccessTokenSecret() {
  const value = process.env.JWT_ACCESS_SECRET;

  if (!value || !value.trim()) {
    throw new Error("JWT_ACCESS_SECRET is missing");
  }

  return new TextEncoder().encode(value);
}

export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token = req.cookies.get("admin_access_token")?.value;
    if (!token) return null;

    const secret = getAccessTokenSecret();
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      systemRole: payload.systemRole as AuthUser["systemRole"],
      status: payload.status as string,
    };
  } catch (err) {
    console.error("GET_USER_ERROR", err);
    return null;
  }
}
