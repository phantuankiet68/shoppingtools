import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { z } from "zod";

const CreateAddressSchema = z.object({
  customerId: z.string(),

  name: z.string().optional(),
  phone: z.string().optional(),

  address1: z.string(),
  address2: z.string().optional(),

  city: z.string().optional(),
  state: z.string().optional(),
  postal: z.string().optional(),
  country: z.string().optional(),

  notes: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  await requireAdminAuthUser();

  const { searchParams } = new URL(req.url);

  const customerId = searchParams.get("customerId") || undefined;
  const q = searchParams.get("q") || undefined;

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
  const skip = (page - 1) * limit;

  const where: any = {
    ...(customerId && { customerId }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { address1: { contains: q, mode: "insensitive" } },
        {
          customer: {
            OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }],
          },
        },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.address.count({ where }),
    prisma.address.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            isActive: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    page,
    limit,
    total,
    items,
  });
}

export async function POST(req: NextRequest) {
  await requireAdminAuthUser();

  const body = await req.json();
  const input = CreateAddressSchema.parse(body);

  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
  });

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: {
          customerId: input.customerId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        customerId: input.customerId,

        name: input.name,
        phone: input.phone,

        address1: input.address1,
        address2: input.address2,

        city: input.city,
        state: input.state,
        postal: input.postal,
        country: input.country,

        notes: input.notes,
        isDefault: input.isDefault,
      },
    });
  });

  return NextResponse.json(address, { status: 201 });
}
