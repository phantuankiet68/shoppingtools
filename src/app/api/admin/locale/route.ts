import { NextRequest, NextResponse } from "next/server";
import { isAdminLocale } from "@/lib/admin/i18n/config";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const locale = body?.locale;

  if (!locale || !isAdminLocale(locale)) {
    return NextResponse.json({ ok: false, message: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("admin-locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}