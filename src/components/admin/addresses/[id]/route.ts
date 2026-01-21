import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { z } from "zod";

const UpdateAddressSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),

  address1: z.string().optional(),
  address2: z.string().optional(),

  city: z.string().optional(),
  state: z.string().optional(),
  postal: z.string().optional(),
  country: z.string().optional(),

  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type Params = {
  params: { id: string };
};

export async function GET(_req: NextRequest, { params }: Params) {
  await requireAdminAuthUser();

  const address = await prisma.address.findUnique({
    where: { id: params.id },
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
  });

  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json(address);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  await requireAdminAuthUser();

  const body = await req.json();
  const input = UpdateAddressSchema.parse(body);

  const existing = await prisma.address.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.isDefault === true) {
      await tx.address.updateMany({
        where: {
          customerId: existing.customerId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id: params.id },
      data: input,
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await requireAdminAuthUser();

  const address = await prisma.address.findUnique({
    where: { id: params.id },
  });

  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  await prisma.address.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
