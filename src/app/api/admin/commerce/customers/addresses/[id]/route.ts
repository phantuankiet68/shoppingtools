import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

// ✅ Next 16 validator expects params to be Promise
type Ctx = { params: Promise<{ id: string }> };

const AddressPatchSchema = z
  .object({
    label: z.string().min(1).optional(),
    type: z.enum(["SHIPPING", "BILLING"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    isDefault: z.boolean().optional(),

    receiverName: z.string().min(1).optional(),
    phone: z.string().optional().nullable(),

    line1: z.string().min(1).optional(),
    line2: z.string().optional().nullable(),
    ward: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    city: z.string().min(1).optional(),
    region: z.string().optional().nullable(),
    country: z.string().min(1).optional(),
    postalCode: z.string().optional().nullable(),

    note: z.string().optional().nullable(),
  })
  .strict();

function mapToUi(r: any) {
  return {
    id: r.id,
    customerId: r.customerId,
    customerName: r.customer?.name ?? "—",

    label: r.label,
    type: r.type,
    status: r.status,
    isDefault: r.isDefault,

    receiverName: r.receiverName,
    phone: r.phone ?? "",

    line1: r.line1,
    line2: r.line2 ?? "",
    ward: r.ward ?? "",
    district: r.district ?? "",
    city: r.city,
    region: r.region ?? "",
    country: r.country,
    postalCode: r.postalCode ?? "",

    note: r.note ?? "",
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  await requireAdminAuthUser();

  const { id } = await params;

  const row = await prisma.address.findUnique({
    where: { id },
    select: {
      id: true,
      customerId: true,

      label: true,
      type: true,
      status: true,
      isDefault: true,

      receiverName: true,
      phone: true,

      line1: true,
      line2: true,
      ward: true,
      district: true,
      city: true,
      region: true,
      country: true,
      postalCode: true,

      note: true,
      createdAt: true,
      updatedAt: true,

      customer: { select: { name: true } },
    },
  });

  if (!row) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  return NextResponse.json(mapToUi(row));
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  await requireAdminAuthUser();

  const { id } = await params;

  const body = await req.json();
  const input = AddressPatchSchema.parse(body);

  const existing = await prisma.address.findUnique({
    where: { id },
    select: { id: true, customerId: true, type: true, isDefault: true },
  });
  if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Nếu set isDefault=true => clear default khác trong cùng customer + type
    // (type có thể đổi trong cùng request)
    const nextType = (input.type ?? existing.type) as "SHIPPING" | "BILLING";

    if (input.isDefault === true) {
      await tx.address.updateMany({
        where: {
          customerId: existing.customerId,
          type: nextType,
          isDefault: true,
          NOT: { id }, // ✅ tránh tự clear chính nó
        },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id },
      data: {
        ...input,
        // ensure nullables are set properly
        phone: input.phone === undefined ? undefined : input.phone,
        line2: input.line2 === undefined ? undefined : input.line2,
        ward: input.ward === undefined ? undefined : input.ward,
        district: input.district === undefined ? undefined : input.district,
        region: input.region === undefined ? undefined : input.region,
        postalCode: input.postalCode === undefined ? undefined : input.postalCode,
        note: input.note === undefined ? undefined : input.note,
      },
      select: {
        id: true,
        customerId: true,

        label: true,
        type: true,
        status: true,
        isDefault: true,

        receiverName: true,
        phone: true,

        line1: true,
        line2: true,
        ward: true,
        district: true,
        city: true,
        region: true,
        country: true,
        postalCode: true,

        note: true,
        createdAt: true,
        updatedAt: true,

        customer: { select: { name: true } },
      },
    });
  });

  return NextResponse.json(mapToUi(updated));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  await requireAdminAuthUser();

  const { id } = await params;

  const existing = await prisma.address.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
