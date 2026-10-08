import { NextRequest, NextResponse } from 'next/server';
import { Locale, Prisma, TeamMemberColor, TeamMemberStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const LOCALES = Object.values(Locale);
const COLORS = Object.values(TeamMemberColor);
const STATUSES = Object.values(TeamMemberStatus);

type TranslationInput = {
    locale?: string;
    name?: string;
    role?: string;
    department?: string | null;
    description?: string | null;
};

type CreateTeamMemberInput = {
    siteId?: string;
    imageUrl?: string | null;
    icon?: string | null;
    experience?: string | null;
    color?: string;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    email?: string | null;
    sortOrder?: number;
    status?: string;
    isActive?: boolean;
    translations?: TranslationInput[];
};

const teamMemberSelect = {
    id: true,
    siteId: true,
    imageUrl: true,
    icon: true,
    experience: true,
    color: true,
    linkedinUrl: true,
    twitterUrl: true,
    email: true,
    sortOrder: true,
    status: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    translations: {
        orderBy: {
            locale: 'asc' as const,
        },
        select: {
            id: true,
            locale: true,
            name: true,
            role: true,
            department: true,
            description: true,
        },
    },
} satisfies Prisma.TeamMemberSelect;

function jsonError(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

function parsePositiveInt(value: string | null, fallback: number, max: number) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }

    return Math.min(Math.floor(parsed), max);
}

function isLocale(value: string): value is Locale {
    return LOCALES.includes(value as Locale);
}

function isColor(value: string): value is TeamMemberColor {
    return COLORS.includes(value as TeamMemberColor);
}

function isStatus(value: string): value is TeamMemberStatus {
    return STATUSES.includes(value as TeamMemberStatus);
}

async function getAdminWorkspace() {
    const session = await getCurrentSession();

    return {
        session,
        workspaceId: session?.currentWorkspace?.id ?? null,
    };
}

async function getWorkspaceSite(siteId: string, workspaceId: string) {
    return prisma.site.findFirst({
        where: {
            id: siteId,
            workspaceId,
            deletedAt: null,
        },
        select: {
            id: true,
        },
    });
}

function normalizeTranslations(translations: TranslationInput[] | undefined) {
    if (!translations) return [];

    const map = new Map<Locale, TranslationInput>();

    for (const item of translations) {
        const locale = String(item.locale ?? '').trim();

        if (!isLocale(locale)) {
            throw new Error(`Invalid locale: ${locale}`);
        }

        const name = String(item.name ?? '').trim();
        const role = String(item.role ?? '').trim();

        if (!name) {
            throw new Error(`Name is required for locale: ${locale}`);
        }

        if (!role) {
            throw new Error(`Role is required for locale: ${locale}`);
        }

        map.set(locale, {
            locale,
            name,
            role,
            department: item.department == null ? null : String(item.department).trim() || null,
            description: item.description == null ? null : String(item.description).trim() || null,
        });
    }

    return Array.from(map.values());
}

export async function GET(request: NextRequest) {
    try {
        const { session, workspaceId } = await getAdminWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('Workspace not found.', 400);
        }

        const { searchParams } = new URL(request.url);

        const siteId = searchParams.get('siteId')?.trim() || '';
        const search = searchParams.get('search')?.trim() || '';
        const statusValue = searchParams.get('status')?.trim() || '';
        const colorValue = searchParams.get('color')?.trim() || '';
        const localeValue = searchParams.get('locale')?.trim() || '';
        const activeValue = searchParams.get('active')?.trim() || '';

        const page = parsePositiveInt(searchParams.get('page'), 1, 100000);

        const limit = parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT);

        const sortBy = searchParams.get('sortBy') === 'createdAt' ? 'createdAt' : 'sortOrder';

        const sortOrder: Prisma.SortOrder =
            searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

        if (!siteId) {
            return jsonError('siteId is required.');
        }

        const site = await getWorkspaceSite(siteId, workspaceId);

        if (!site) {
            return jsonError('Site not found or access denied.', 404);
        }

        if (statusValue && !isStatus(statusValue)) {
            return jsonError('Invalid status.');
        }

        if (colorValue && !isColor(colorValue)) {
            return jsonError('Invalid color.');
        }

        if (localeValue && !isLocale(localeValue)) {
            return jsonError('Invalid locale.');
        }

        if (activeValue && activeValue !== 'active' && activeValue !== 'inactive') {
            return jsonError('Invalid active status.');
        }

        const status = statusValue ? (statusValue as TeamMemberStatus) : undefined;

        const color = colorValue ? (colorValue as TeamMemberColor) : undefined;

        const locale = localeValue ? (localeValue as Locale) : undefined;

        const where: Prisma.TeamMemberWhereInput = {
            siteId: site.id,

            ...(status && { status }),
            ...(color && { color }),

            ...(activeValue && {
                isActive: activeValue === 'active',
            }),

            ...(locale && {
                translations: {
                    some: {
                        locale,
                    },
                },
            }),

            ...(search && {
                OR: [
                    {
                        email: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                        },
                    },
                    {
                        linkedinUrl: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                        },
                    },
                    {
                        twitterUrl: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                        },
                    },
                    {
                        translations: {
                            some: {
                                name: {
                                    contains: search,
                                    mode: Prisma.QueryMode.insensitive,
                                },
                            },
                        },
                    },
                    {
                        translations: {
                            some: {
                                role: {
                                    contains: search,
                                    mode: Prisma.QueryMode.insensitive,
                                },
                            },
                        },
                    },
                    {
                        translations: {
                            some: {
                                department: {
                                    contains: search,
                                    mode: Prisma.QueryMode.insensitive,
                                },
                            },
                        },
                    },
                ],
            }),
        };

        const skip = (page - 1) * limit;

        const orderBy: Prisma.TeamMemberOrderByWithRelationInput[] = [
            {
                [sortBy]: sortOrder,
            },
            {
                createdAt: 'desc',
            },
        ];

        const [items, total] = await prisma.$transaction([
            prisma.teamMember.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    ...teamMemberSelect,
                    translations: {
                        where: locale ? { locale } : undefined,
                        orderBy: {
                            locale: 'asc',
                        },
                        select: {
                            id: true,
                            locale: true,
                            name: true,
                            role: true,
                            department: true,
                            description: true,
                        },
                    },
                },
            }),

            prisma.teamMember.count({
                where,
            }),
        ]);

        return NextResponse.json({
            success: true,
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error('[GET /api/admin/team-member]', error);

        return jsonError('Internal server error.', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { session, workspaceId } = await getAdminWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('Workspace not found.', 400);
        }

        let body: CreateTeamMemberInput;

        try {
            body = (await request.json()) as CreateTeamMemberInput;
        } catch {
            return jsonError('Invalid JSON body.');
        }

        const siteId = String(body.siteId ?? '').trim();

        if (!siteId) {
            return jsonError('siteId is required.');
        }

        const site = await getWorkspaceSite(siteId, workspaceId);

        if (!site) {
            return jsonError('Site not found or access denied.', 404);
        }

        const imageUrl = body.imageUrl == null ? null : String(body.imageUrl).trim() || null;

        const icon = body.icon == null ? null : String(body.icon).trim() || null;

        const experience = body.experience == null ? null : String(body.experience).trim() || null;

        const linkedinUrl =
            body.linkedinUrl == null ? null : String(body.linkedinUrl).trim() || null;

        const twitterUrl = body.twitterUrl == null ? null : String(body.twitterUrl).trim() || null;

        const email = body.email == null ? null : String(body.email).trim() || null;

        const colorValue = String(body.color ?? TeamMemberColor.blue).trim();

        const statusValue = String(body.status ?? TeamMemberStatus.PUBLISHED).trim();

        const sortOrder = body.sortOrder == null ? 0 : Number(body.sortOrder);

        const isActive = body.isActive ?? true;

        if (!isColor(colorValue)) {
            return jsonError('Invalid color.');
        }

        if (!isStatus(statusValue)) {
            return jsonError('Invalid status.');
        }

        if (!Number.isInteger(sortOrder) || sortOrder < 0) {
            return jsonError('sortOrder must be a non-negative integer.');
        }

        if (typeof isActive !== 'boolean') {
            return jsonError('isActive must be a boolean.');
        }

        let translations;

        try {
            translations = normalizeTranslations(body.translations);
        } catch (error) {
            return jsonError(error instanceof Error ? error.message : 'Invalid translations.');
        }

        const teamMember = await prisma.teamMember.create({
            data: {
                siteId: site.id,
                imageUrl,
                icon,
                experience,
                color: colorValue,
                linkedinUrl,
                twitterUrl,
                email,
                sortOrder,
                status: statusValue,
                isActive,

                ...(translations.length > 0 && {
                    translations: {
                        create: translations.map((translation) => ({
                            locale: translation.locale as Locale,
                            name: translation.name!,
                            role: translation.role!,
                            department: translation.department ?? null,
                            description: translation.description ?? null,
                        })),
                    },
                }),
            },
            select: teamMemberSelect,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Team member created successfully.',
                item: teamMember,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('[POST /api/admin/team-member]', error);

        return jsonError('Internal server error.', 500);
    }
}
