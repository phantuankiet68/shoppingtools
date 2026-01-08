import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("admin_session")?.value ?? null;

  return NextResponse.json({
    hasCookie: Boolean(raw),
    cookiePrefix: raw ? raw.slice(0, 8) : null,
    cookiePathHint: "Nếu hasCookie=false thì cookie không được gửi lên /api (thường do cookie path=/admin hoặc domain khác)",
  });
}
