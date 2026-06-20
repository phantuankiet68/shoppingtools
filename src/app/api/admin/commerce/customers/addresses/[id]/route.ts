import { Prisma } from '@/generated/prisma';
import { requireAdminAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type Ctx = {
    params: Promise<{ id: string }>;
};

const AddressPatchSchema = z
    .object({
        type: z.enum(['SHIPPING', 'BILLING', 'BOTH']).optional(),
        isDefault: z.boolean().optional(),

        receiverName: z.string().min(1).optional(),

        // NOT NULL trong Prisma
        phone: z.string().optional(),

        // Nullable trong Prisma
        email: z.string().email().optional().nullable(),

        line1: z.string().min(1).optional(),

        line2: z.string().optional().nullable(),
        ward: z.string().optional().nullable(),
        district: z.string().optional().nullable(),

        city: z.string().min(1).optional(),

        region: z.string().optional().nullable(),

        country: z.string().min(1).optional(),

        postalCode: z.string().optional().nullable(),

        companyName: z.string().optional().nullable(),
        taxCode: z.string().optional().nullable(),
    })
    .strict();

function mapToUi(r: any) {
    return {
        id: r.id,
        siteId: r.siteId,
        customerId: r.customerId,
        customerName: r.customer?.name ?? '—',

        type: r.type,
        isDefault: r.isDefault,

        receiverName: r.receiverName,
        phone: r.phone ?? '',
        email: r.email ?? '',

        line1: r.line1,
        line2: r.line2 ?? '',
        ward: r.ward ?? '',
        district: r.district ?? '',
        city: r.city,
        region: r.region ?? '',
        country: r.country,
        postalCode: r.postalCode ?? '',

        companyName: r.companyName ?? '',
        taxCode: r.taxCode ?? '',

        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
    };
}

const addressSelect = {
    id: true,
    siteId: true,
    customerId: true,

    type: true,
    isDefault: true,

    receiverName: true,
    phone: true,
    email: true,

    line1: true,
    line2: true,
    ward: true,
    district: true,
    city: true,
    region: true,
    country: true,
    postalCode: true,

    companyName: true,
    taxCode: true,

    createdAt: true,
    updatedAt: true,

    customer: {
        select: {
            name: true,
        },
    },
} satisfies Prisma.AddressSelect;

export async function GET(_req: NextRequest, { params }: Ctx) {
    await requireAdminAuthUser();

    const { id } = await params;

    const row = await prisma.address.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        select: addressSelect,
    });

    if (!row) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json(mapToUi(row));
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
    await requireAdminAuthUser();

    const { id } = await params;

    const body = await req.json();
    const input = AddressPatchSchema.parse(body);

    const existing = await prisma.address.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        select: {
            id: true,
            customerId: true,
            type: true,
            isDefault: true,
        },
    });

    if (!existing) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const nextType = input.type ?? existing.type;

        if (input.isDefault === true) {
            await tx.address.updateMany({
                where: {
                    customerId: existing.customerId,
                    type: nextType,
                    isDefault: true,
                    deletedAt: null,
                    NOT: {
                        id,
                    },
                },
                data: {
                    isDefault: false,
                },
            });
        }

        const updateData: Prisma.AddressUpdateInput = {
            type: input.type,
            isDefault: input.isDefault,

            receiverName: input.receiverName,

            phone: input.phone,

            email: input.email === undefined ? undefined : input.email,

            line1: input.line1,

            line2: input.line2 === undefined ? undefined : input.line2,

            ward: input.ward === undefined ? undefined : input.ward,

            district: input.district === undefined ? undefined : input.district,

            city: input.city,

            region: input.region === undefined ? undefined : input.region,

            country: input.country,

            postalCode: input.postalCode === undefined ? undefined : input.postalCode,

            companyName: input.companyName === undefined ? undefined : input.companyName,

            taxCode: input.taxCode === undefined ? undefined : input.taxCode,
        };

        return tx.address.update({
            where: {
                id,
            },
            data: updateData,
            select: addressSelect,
        });
    });

    return NextResponse.json(mapToUi(updated));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
    await requireAdminAuthUser();

    const { id } = await params;

    const existing = await prisma.address.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        select: {
            id: true,
        },
    });

    if (!existing) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await prisma.address.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });

    return NextResponse.json({
        success: true,
    });
}
