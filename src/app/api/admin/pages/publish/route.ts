import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await prisma.page.update({ where: { id }, data: { status: "PUBLISHED" } });
  return NextResponse.json({ ok: true });
}
