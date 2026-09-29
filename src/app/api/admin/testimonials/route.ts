import { NextRequest, NextResponse } from 'next/server';
import { Locale, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCALES = Object.values(Locale);

function errorResponse(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
}

function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && LOCALES.includes(value as Locale);
}

function normalizeTranslations(input: unknown) {
    if (!Array.isArray(input)) return null;

    const seen = new Set<Locale>();
    const translations: Array<{
        locale: Locale;
        name: string;
        role: string;
        websiteLabel?: string | null;
        quote: string;
    }> = [];

    for (const item of input) {
        if (!item || typeof item !== 'object') return null;
        const value = item as Record<string, unknown>;

        if (!isLocale(value.locale)) return null;
        if (seen.has(value.locale)) return null;

        const name = typeof value.name === 'string' ? value.name.trim() : '';
        const role = typeof value.role === 'string' ? value.role.trim() : '';
        const quote = typeof value.quote === 'string' ? value.quote.trim() : '';
        const websiteLabel =
            value.websiteLabel == null
                ? null
                : typeof value.websiteLabel === 'string'
                  ? value.websiteLabel.trim() || null
                  : null;

        if (!name || !role || !quote) return null;

        seen.add(value.locale);
        translations.push({
            locale: value.locale,
            name,
            role,
            websiteLabel,
            quote,
        });
    }

    return translations;
}

async function getWorkspaceId() {
    const session = await getCurrentSession();
    return session?.currentWorkspace?.id ?? null;
}

async function verifySite(siteId: string, workspaceId: string) {
    return prisma.site.findFirst({
        where: {
            id: siteId,
            workspaceId,
            deletedAt: null,
        },
        select: { id: true },
    });
}

export async function GET(request: NextRequest) {
    try {
        const workspaceId = await getWorkspaceId();
        if (!workspaceId) return errorResponse('Unauthorized', 401);

        const { searchParams } = new URL(request.url);
        const siteId = searchParams.get('siteId')?.trim();
        const localeParam = searchParams.get('locale');
        const search = searchParams.get('search')?.trim();
        const isActiveParam = searchParams.get('isActive');
        const limitParam = Number(searchParams.get('limit') ?? 50);
        const offsetParam = Number(searchParams.get('offset') ?? 0);

        if (!siteId) return errorResponse('siteId is required');

        const site = await verifySite(siteId, workspaceId);
        if (!site) return errorResponse('Site not found', 404);

        const locale = isLocale(localeParam) ? localeParam : Locale.en;
        const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 50, 1), 100);
        const offset = Math.max(Number.isFinite(offsetParam) ? offsetParam : 0, 0);

        const where: Prisma.TestimonialWhereInput = {
            siteId,
            ...(isActiveParam === 'true' ? { isActive: true } : {}),
            ...(isActiveParam === 'false' ? { isActive: false } : {}),
            ...(search
                ? {
                      translations: {
                          some: {
                              OR: [
                                  { name: { contains: search, mode: 'insensitive' } },
                                  { role: { contains: search, mode: 'insensitive' } },
                                  { quote: { contains: search, mode: 'insensitive' } },
                                  { websiteLabel: { contains: search, mode: 'insensitive' } },
                              ],
                          },
                      },
                  }
                : {}),
        };

        const [items, total] = await prisma.$transaction([
            prisma.testimonial.findMany({
                where,
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                skip: offset,
                take: limit,
                include: {
                    translations: {
                        where: { locale: { in: [locale, Locale.en] } },
                        orderBy: { locale: 'asc' },
                    },
                },
            }),
            prisma.testimonial.count({ where }),
        ]);

        const result = items.map((item) => ({
            ...item,
            translations: item.translations.sort((a, b) => {
                if (a.locale === locale) return -1;
                if (b.locale === locale) return 1;
                return 0;
            }),
        }));

        return NextResponse.json({
            success: true,
            testimonials: result,
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error('[GET /api/admin/testimonials]', error);
        return errorResponse('Failed to load testimonials', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const workspaceId = await getWorkspaceId();
        if (!workspaceId) return errorResponse('Unauthorized', 401);

        const body = await request.json();
        const siteId = typeof body.siteId === 'string' ? body.siteId.trim() : '';
        if (!siteId) return errorResponse('siteId is required');

        const site = await verifySite(siteId, workspaceId);
        if (!site) return errorResponse('Site not found', 404);

        const translations = normalizeTranslations(body.translations);
        if (!translations || translations.length === 0) {
            return errorResponse('At least one valid translation is required');
        }

        const avatar = typeof body.avatar === 'string' ? body.avatar.trim() : '';
        if (!avatar) return errorResponse('avatar is required');

        const website =
            body.website == null
                ? null
                : typeof body.website === 'string'
                  ? body.website.trim() || null
                  : null;

        const accentColor =
            body.accentColor == null
                ? null
                : typeof body.accentColor === 'string'
                  ? body.accentColor.trim() || null
                  : null;

        const rating = Number(body.rating ?? 5);
        const sortOrder = Number(body.sortOrder ?? 0);
        const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            return errorResponse('rating must be an integer between 0 and 5');
        }
        if (!Number.isInteger(sortOrder)) {
            return errorResponse('sortOrder must be an integer');
        }

        const testimonial = await prisma.testimonial.create({
            data: {
                siteId,
                avatar,
                website,
                accentColor,
                rating,
                sortOrder,
                isActive,
                translations: {
                    create: translations,
                },
            },
            include: {
                translations: true,
            },
        });

        return NextResponse.json({ success: true, testimonial }, { status: 201 });
    } catch (error) {
        console.error('[POST /api/admin/testimonials]', error);
        return errorResponse('Failed to create testimonial', 500);
    }
}
