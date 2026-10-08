import { NextRequest, NextResponse } from 'next/server';
import { Locale, Prisma, TeamMemberColor, TeamMemberStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type TranslationInput = {
    locale?: string;
    name?: string;
    role?: string;
    department?: string | null;
    description?: string | null;
};

type UpdateTeamMemberInput = {
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

const LOCALES = Object.values(Locale);
const COLORS = Object.values(TeamMemberColor);
const STATUSES = Object.values(TeamMemberStatus);

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

async function getTeamMemberForWorkspace(id: string, workspaceId: string) {
    return prisma.teamMember.findFirst({
        where: {
            id,
            site: {
                workspaceId,
                deletedAt: null,
            },
        },
        select: {
            ...teamMemberSelect,
            site: {
                select: {
                    id: true,
                    name: true,
                    workspaceId: true,
                },
            },
        },
    });
}

function normalizeTranslations(translations: TranslationInput[]) {
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

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { session, workspaceId } = await getAdminWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('Workspace not found.', 400);
        }

        const { id } = await context.params;
        const teamMemberId = String(id ?? '').trim();

        if (!teamMemberId) {
            return jsonError('Team member ID is required.');
        }

        const teamMember = await getTeamMemberForWorkspace(teamMemberId, workspaceId);

        if (!teamMember) {
            return jsonError('Team member not found or access denied.', 404);
        }

        return NextResponse.json({
            success: true,
            item: teamMember,
        });
    } catch (error) {
        console.error('[GET /api/admin/team-member/[id]]', error);

        return jsonError('Internal server error.', 500);
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const { session, workspaceId } = await getAdminWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('Workspace not found.', 400);
        }

        const { id } = await context.params;
        const teamMemberId = String(id ?? '').trim();

        if (!teamMemberId) {
            return jsonError('Team member ID is required.');
        }

        const existing = await getTeamMemberForWorkspace(teamMemberId, workspaceId);

        if (!existing) {
            return jsonError('Team member not found or access denied.', 404);
        }

        let body: UpdateTeamMemberInput;

        try {
            body = (await request.json()) as UpdateTeamMemberInput;
        } catch {
            return jsonError('Invalid JSON body.');
        }

        const data: Prisma.TeamMemberUpdateInput = {};

        if (body.siteId !== undefined) {
            const siteId = String(body.siteId).trim();

            if (!siteId) {
                return jsonError('siteId cannot be empty.');
            }

            const site = await prisma.site.findFirst({
                where: {
                    id: siteId,
                    workspaceId,
                    deletedAt: null,
                },
                select: {
                    id: true,
                },
            });

            if (!site) {
                return jsonError('Site not found or access denied.', 404);
            }

            data.site = {
                connect: {
                    id: site.id,
                },
            };
        }

        if (body.imageUrl !== undefined) {
            data.imageUrl = body.imageUrl == null ? null : String(body.imageUrl).trim() || null;
        }

        if (body.icon !== undefined) {
            data.icon = body.icon == null ? null : String(body.icon).trim() || null;
        }

        if (body.experience !== undefined) {
            data.experience =
                body.experience == null ? null : String(body.experience).trim() || null;
        }

        if (body.linkedinUrl !== undefined) {
            data.linkedinUrl =
                body.linkedinUrl == null ? null : String(body.linkedinUrl).trim() || null;
        }

        if (body.twitterUrl !== undefined) {
            data.twitterUrl =
                body.twitterUrl == null ? null : String(body.twitterUrl).trim() || null;
        }

        if (body.email !== undefined) {
            data.email = body.email == null ? null : String(body.email).trim() || null;
        }

        if (body.color !== undefined) {
            const color = String(body.color).trim();

            if (!isColor(color)) {
                return jsonError('Invalid color.');
            }

            data.color = color;
        }

        if (body.status !== undefined) {
            const status = String(body.status).trim();

            if (!isStatus(status)) {
                return jsonError('Invalid status.');
            }

            data.status = status;
        }

        if (body.sortOrder !== undefined) {
            const sortOrder = Number(body.sortOrder);

            if (!Number.isInteger(sortOrder) || sortOrder < 0) {
                return jsonError('sortOrder must be a non-negative integer.');
            }

            data.sortOrder = sortOrder;
        }

        if (body.isActive !== undefined) {
            if (typeof body.isActive !== 'boolean') {
                return jsonError('isActive must be a boolean.');
            }

            data.isActive = body.isActive;
        }

        let translations: TranslationInput[] | undefined;

        if (body.translations !== undefined) {
            if (!Array.isArray(body.translations)) {
                return jsonError('translations must be an array.');
            }

            try {
                translations = normalizeTranslations(body.translations);
            } catch (error) {
                return jsonError(error instanceof Error ? error.message : 'Invalid translations.');
            }
        }

        const teamMember = await prisma.$transaction(async (tx) => {
            if (translations !== undefined) {
                await tx.teamMemberTranslation.deleteMany({
                    where: {
                        teamMemberId,
                    },
                });
            }

            return tx.teamMember.update({
                where: {
                    id: teamMemberId,
                },
                data: {
                    ...data,

                    ...(translations !== undefined && {
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
        });

        return NextResponse.json({
            success: true,
            message: 'Team member updated successfully.',
            item: teamMember,
        });
    } catch (error) {
        console.error('[PATCH /api/admin/team-member/[id]]', error);

        return jsonError('Internal server error.', 500);
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { session, workspaceId } = await getAdminWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('Workspace not found.', 400);
        }

        const { id } = await context.params;
        const teamMemberId = String(id ?? '').trim();

        if (!teamMemberId) {
            return jsonError('Team member ID is required.');
        }

        const existing = await getTeamMemberForWorkspace(teamMemberId, workspaceId);

        if (!existing) {
            return jsonError('Team member not found or access denied.', 404);
        }

        await prisma.teamMember.delete({
            where: {
                id: teamMemberId,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Team member deleted successfully.',
        });
    } catch (error) {
        console.error('[DELETE /api/admin/team-member/[id]]', error);

        return jsonError('Internal server error.', 500);
    }
}
