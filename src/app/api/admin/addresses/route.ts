import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

const AddressCreateSchema = z.object({
  customerId: z.string().min(1),

  label: z.string().min(1),
  type: z.enum(["SHIPPING", "BILLING"]),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  isDefault: z.boolean().optional().default(false),

  receiverName: z.string().min(1),
  phone: z.string().optional().nullable(),

  line1: z.string().min(1),
  line2: z.string().optional().nullable(),
  ward: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  city: z.string().min(1),
  region: z.string().optional().nullable(),
  country: z.string().min(1),
  postalCode: z.string().optional().nullable(),

  note: z.string().optional().nullable(),
});

function toListWhere(searchParams: URLSearchParams) {
  const q = (searchParams.get("q") || "").trim();
  const customerId = searchParams.get("customerId") || undefined;

  const type = (searchParams.get("type") || "").trim() as "SHIPPING" | "BILLING" | "";
  const status = (searchParams.get("status") || "").trim() as "ACTIVE" | "INACTIVE" | "";
  const onlyDefault = (searchParams.get("onlyDefault") || "").trim();

  const where: any = {};

  if (customerId) where.customerId = customerId;
  if (type === "SHIPPING" || type === "BILLING") where.type = type;
  if (status === "ACTIVE" || status === "INACTIVE") where.status = status;
  if (onlyDefault === "1" || onlyDefault === "true") where.isDefault = true;

  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { label: { contains: q, mode: "insensitive" } },
      { receiverName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { line1: { contains: q, mode: "insensitive" } },
      { line2: { contains: q, mode: "insensitive" } },
      { ward: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { region: { contains: q, mode: "insensitive" } },
      { country: { contains: q, mode: "insensitive" } },
      { postalCode: { contains: q, mode: "insensitive" } },
      {
        customer: {
          OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }],
        },
      },
    ];
  }

  return where;
}

export async function GET(req: NextRequest) {
  await requireAdminAuthUser();

  const { searchParams } = new URL(req.url);

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50)));
  const skip = (page - 1) * limit;

  const sort = (searchParams.get("sort") || "UPDATED_AT").toUpperCase();

  const orderBy = sort === "CREATED_AT" ? [{ createdAt: "desc" as const }] : sort === "CUSTOMER" ? [{ customer: { name: "asc" as const } }] : [{ updatedAt: "desc" as const }];

  const where = toListWhere(searchParams);

  const [total, rows] = await Promise.all([
    prisma.address.count({ where }),
    prisma.address.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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
    }),
  ]);

  // Map sang đúng field UI: customerName
  const items = rows.map((r) => ({
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
  }));

  return NextResponse.json({ page, limit, total, items });
}

export async function POST(req: NextRequest) {
  await requireAdminAuthUser();

  const body = await req.json();
  const input = AddressCreateSchema.parse(body);

  // Check customer tồn tại (dựa theo model Customer)
  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
    select: { id: true, name: true },
  });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const created = await prisma.$transaction(async (tx) => {
    // default unique per customer + type
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { customerId: input.customerId, type: input.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        customerId: input.customerId,

        label: input.label,
        type: input.type,
        status: input.status,
        isDefault: input.isDefault,

        receiverName: input.receiverName,
        phone: input.phone ?? null,

        line1: input.line1,
        line2: input.line2 ?? null,
        ward: input.ward ?? null,
        district: input.district ?? null,
        city: input.city,
        region: input.region ?? null,
        country: input.country,
        postalCode: input.postalCode ?? null,

        note: input.note ?? null,
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

  return NextResponse.json(
    {
      id: created.id,
      customerId: created.customerId,
      customerName: created.customer?.name ?? "—",

      label: created.label,
      type: created.type,
      status: created.status,
      isDefault: created.isDefault,

      receiverName: created.receiverName,
      phone: created.phone ?? "",

      line1: created.line1,
      line2: created.line2 ?? "",
      ward: created.ward ?? "",
      district: created.district ?? "",
      city: created.city,
      region: created.region ?? "",
      country: created.country,
      postalCode: created.postalCode ?? "",

      note: created.note ?? "",
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    },
    { status: 201 },
  );
}
