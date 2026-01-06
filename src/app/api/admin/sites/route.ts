// app/api/sites/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.site.findMany({
    select: { id: true, name: true, domain: true, localeDefault: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ items });
}
