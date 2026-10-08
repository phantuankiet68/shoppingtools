import { NextRequest, NextResponse } from 'next/server';
import { Locale } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const LOCALES: Locale[] = [Locale.en, Locale.vi, Locale.ja];

const TEAM_MEMBER_LIMIT = 12;

function error(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
            teamMembers: [],
        },
        { status },
    );
}

function getLocale(value: string | null): Locale {
    return LOCALES.includes(value as Locale) ? (value as Locale) : Locale.en;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const siteId = searchParams.get('siteId')?.trim();
        const locale = getLocale(searchParams.get('locale'));

        if (!siteId) {
            return error('Site ID is required.');
        }

        const site = await prisma.site.findFirst({
            where: {
                id: siteId,
                deletedAt: null,
                isPublic: true,
            },
            select: {
                id: true,
            },
        });

        if (!site) {
            return error('Site not found.', 404);
        }

        const translationLocales: Locale[] =
            locale === Locale.en ? [Locale.en] : [locale, Locale.en];

        const teamMembers = await prisma.teamMember.findMany({
            where: {
                siteId: site.id,
                isActive: true,
            },
            orderBy: [
                {
                    sortOrder: 'asc',
                },
                {
                    createdAt: 'asc',
                },
            ],
            take: TEAM_MEMBER_LIMIT,
            select: {
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
                isActive: true,
                createdAt: true,
                updatedAt: true,
                translations: {
                    where: {
                        locale: {
                            in: translationLocales,
                        },
                    },
                    select: {
                        locale: true,
                        name: true,
                        role: true,
                        department: true,
                        description: true,
                    },
                },
            },
        });

        const result = teamMembers.map((member) => {
            const translation =
                member.translations.find((item) => item.locale === locale) ??
                member.translations.find((item) => item.locale === Locale.en) ??
                null;

            return {
                id: member.id,
                siteId: member.siteId,

                imageUrl: member.imageUrl,
                icon: member.icon,
                experience: member.experience,
                color: member.color,

                linkedinUrl: member.linkedinUrl,
                twitterUrl: member.twitterUrl,
                email: member.email,

                sortOrder: member.sortOrder,
                isActive: member.isActive,

                name: translation?.name ?? '',
                role: translation?.role ?? '',
                department: translation?.department ?? '',
                description: translation?.description ?? '',

                locale: translation?.locale ?? null,

                createdAt: member.createdAt,
                updatedAt: member.updatedAt,
            };
        });

        return NextResponse.json(
            {
                success: true,
                teamMembers: result,
                total: result.length,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            },
        );
    } catch (err) {
        console.error('[TEAM_MEMBER_GET]', err);

        return error('Internal server error.', 500);
    }
}
