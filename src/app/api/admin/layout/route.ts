import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { layout } = await req.json(); // "A" | "B" | "C"

  if (!["A", "B", "C"].includes(layout)) {
    return NextResponse.json({ ok: false, message: "Invalid layout" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_layout", layout, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // secure: true, // bật khi deploy https
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
