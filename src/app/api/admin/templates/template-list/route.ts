import type { AccessTier, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { REGISTRY } from '@/lib/ui-builder/registry';
import { NextRequest } from 'next/server';

type TemplateListItem = {
    id: string;
    code: string;
    label: string;
    kind: string;

    category: {
        id: string;
        name: string;
        minTier: AccessTier;
        description: string | null;
    };

    children: string[];
    rawChildren: string[];

    previewImageUrl: string | null;

    isActive: boolean;
    isPublic: boolean;

    sortOrder: number;
    status: string;

    createdAt: string;
    updatedAt: string;
};

function parseTier(value: string | null): AccessTier | null {
    if (!value) return null;

    const normalized = value.trim().toUpperCase();

    if (normalized === 'BASIC') return 'BASIC';
    if (normalized === 'NORMAL') return 'NORMAL';
    if (normalized === 'PRO') return 'PRO';

    return null;
}

function getAllowedTiers(tier: AccessTier): AccessTier[] {
    switch (tier) {
        case 'BASIC':
            return ['BASIC'];

        case 'NORMAL':
            return ['BASIC', 'NORMAL'];

        case 'PRO':
            return ['BASIC', 'NORMAL', 'PRO'];

        default:
            return [];
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const q = searchParams.get('q')?.trim() || '';

        const siteType = searchParams.get('siteType')?.trim() || '';

        const includeInactive = searchParams.get('includeInactive') === 'true';

        const includeArchived = searchParams.get('includeArchived') === 'true';

        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        const tier = parseTier(searchParams.get('tier'));

        const registryKindSet = new Set(REGISTRY.map((item) => item.kind));

        const where: Prisma.TemplateCatalogWhereInput = {
            ...(includeDeleted
                ? {}
                : {
                      deletedAt: null,
                  }),

            ...(includeInactive
                ? {}
                : {
                      isActive: true,
                      isPublic: true,
                  }),

            ...(includeArchived
                ? {}
                : {
                      status: {
                          not: 'ARCHIVED',
                      },
                  }),

            ...(q
                ? {
                      OR: [
                          {
                              name: {
                                  contains: q,
                                  mode: 'insensitive',
                              },
                          },
                          {
                              code: {
                                  contains: q,
                                  mode: 'insensitive',
                              },
                          },
                          {
                              kind: {
                                  contains: q,
                                  mode: 'insensitive',
                              },
                          },
                          {
                              category: {
                                  name: {
                                      contains: q,
                                      mode: 'insensitive',
                                  },
                              },
                          },
                      ],
                  }
                : {}),

            ...(tier
                ? {
                      category: {
                          minTier: {
                              in: getAllowedTiers(tier),
                          },
                      },
                  }
                : {}),
        };

        const rows = await prisma.templateCatalog.findMany({
            where,

            orderBy: [
                {
                    sortOrder: 'asc',
                },
                {
                    updatedAt: 'desc',
                },
            ],

            select: {
                id: true,
                code: true,
                name: true,
                kind: true,

                previewImageUrl: true,

                isActive: true,
                isPublic: true,

                sortOrder: true,
                status: true,

                createdAt: true,
                updatedAt: true,

                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        minTier: true,
                    },
                },
            },
        });

        const data: TemplateListItem[] = rows.map((row) => {
            const rawChildren = [row.kind];

            const children = Array.from(new Set(rawChildren));

            return {
                id: row.id,

                code: row.code,
                label: row.name,

                kind: row.kind,

                category: {
                    id: row.category.id,
                    name: row.category.name,
                    minTier: row.category.minTier,
                    description: row.category.description,
                },

                children,
                rawChildren,

                previewImageUrl: row.previewImageUrl,

                isActive: row.isActive,
                isPublic: row.isPublic,

                sortOrder: row.sortOrder,

                status: String(row.status),

                createdAt: row.createdAt.toISOString(),

                updatedAt: row.updatedAt.toISOString(),
            };
        });

        const unmatchedKinds = Array.from(
            new Set(
                data.flatMap((item) => item.children).filter((kind) => !registryKindSet.has(kind)),
            ),
        );

        return Response.json({
            success: true,

            data,

            meta: {
                total: data.length,
                totalRows: rows.length,

                registryCount: registryKindSet.size,

                unmatchedKinds,

                tierFilter: tier,

                siteTypeFilter: siteType || null,
            },
        });
    } catch (error) {
        console.error('GET /api/admin/templates/template-list error:', error);

        return Response.json(
            {
                success: false,

                message: 'Không thể tải danh sách template',

                error: error instanceof Error ? error.message : 'Unknown error',
            },
            {
                status: 500,
            },
        );
    }
}
