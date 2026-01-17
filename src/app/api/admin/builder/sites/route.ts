import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(255)
    .transform((s) => s.trim().toLowerCase())
    .refine((s) => !s.startsWith("http://") && !s.startsWith("https://"), "Domain should not include protocol")
    .refine((s) => /^[a-z0-9.-]+$/.test(s), "Domain only allows a-z, 0-9, dot, dash"),
  name: z
    .string()
    .min(2)
    .max(100)
    .transform((s) => s.trim()),
});

async function nextSiteId(prefix = "sitea") {
  // lấy tất cả id bắt đầu bằng prefix, sort giảm dần để lấy cái lớn nhất
  const rows = await prisma.site.findMany({
    where: { id: { startsWith: prefix } },
    select: { id: true },
    orderBy: { id: "desc" },
    take: 50, // đủ để lấy max theo dạng siteaNN
  });

  let max = 0;
  const re = new RegExp(`^${prefix}(\\d{2})$`, "i");

  for (const r of rows) {
    const m = r.id.match(re);
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > max) max = n;
  }

  const next = max + 1;
  const suffix = String(next).padStart(2, "0");
  return `${prefix}${suffix}`.toLowerCase();
}

export async function GET() {
  const items = await prisma.site.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const id = await nextSiteId("sitea"); // ✅ sitea01, sitea02, ...

    const created = await prisma.site.create({
      data: {
        id, // ✅ set id theo format bạn muốn
        domain: parsed.data.domain,
        name: parsed.data.name,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    // domain unique
    return NextResponse.json({ error: "Domain already exists." }, { status: 409 });
  }
}
