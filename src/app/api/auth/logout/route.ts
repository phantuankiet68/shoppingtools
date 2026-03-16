import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { clearSessionCookie, revokeSessionByToken } from "@/lib/auth/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (token) {
      await revokeSessionByToken(token);
    }

    const response = NextResponse.json({ message: "Đăng xuất thành công." });
    clearSessionCookie(response);

    return response;
  } catch (error) {
    console.error("LOGOUT_ERROR", error);
    const response = NextResponse.json({ message: "Đăng xuất thành công." });
    clearSessionCookie(response);
    return response;
  }
}
