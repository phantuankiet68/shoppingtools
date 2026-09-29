import { NextRequest, NextResponse } from 'next/server';
import { Locale } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCALES = Object.values(Locale);

type RouteContext = {
    params: Promise<{ id: string }>;
};

type TranslationInput = {
    locale: Locale;
    name: string;
    role: string;
    websiteLabel?: string | null;
    quote: string;
};

type TestimonialUpdateData = {
    avatar?: string;
    website?: string | null;
    accentColor?: string | null;
    rating?: number;
    sortOrder?: number;
    isActive?: boolean;
};

function errorResponse(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
}

function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && LOCALES.includes(value as Locale);
}

function normalizeTranslations(input: unknown): TranslationInput[] | null {
    if (!Array.isArray(input)) return null;

    const seen = new Set<Locale>();
    const translations: TranslationInput[] = [];

    for (const item of input) {
        if (!item || typeof item !== 'object') return null;

        const value = item as Record<string, unknown>;

        if (!isLocale(value.locale) || seen.has(value.locale)) {
            return null;
        }

        const name = typeof value.name === 'string' ? value.name.trim() : '';

        const role = typeof value.role === 'string' ? value.role.trim() : '';

        const quote = typeof value.quote === 'string' ? value.quote.trim() : '';

        const websiteLabel =
            value.websiteLabel == null
                ? null
                : typeof value.websiteLabel === 'string'
                  ? value.websiteLabel.trim() || null
                  : null;

        if (!name || !role || !quote) {
            return null;
        }

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

async function findTestimonial(id: string, workspaceId: string) {
    return prisma.testimonial.findFirst({
        where: {
            id,
            site: {
                workspaceId,
                deletedAt: null,
            },
        },
        include: {
            translations: true,
        },
    });
}

export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return errorResponse('Unauthorized', 401);
        }

        const { id } = await context.params;

        if (!id) {
            return errorResponse('Testimonial id is required');
        }

        const testimonial = await findTestimonial(id, workspaceId);

        if (!testimonial) {
            return errorResponse('Testimonial not found', 404);
        }

        return NextResponse.json({
            success: true,
            testimonial,
        });
    } catch (error) {
        console.error('[GET /api/admin/testimonials/:id]', error);

        return errorResponse('Failed to load testimonial', 500);
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return errorResponse('Unauthorized', 401);
        }

        const { id } = await context.params;

        if (!id) {
            return errorResponse('Testimonial id is required');
        }

        const existing = await findTestimonial(id, workspaceId);

        if (!existing) {
            return errorResponse('Testimonial not found', 404);
        }

        const body = await request.json();

        const data: TestimonialUpdateData = {};

        if (body.avatar !== undefined) {
            if (typeof body.avatar !== 'string' || !body.avatar.trim()) {
                return errorResponse('avatar must be a non-empty string');
            }

            data.avatar = body.avatar.trim();
        }

        if (body.website !== undefined) {
            if (body.website !== null && typeof body.website !== 'string') {
                return errorResponse('website must be a string or null');
            }

            data.website = typeof body.website === 'string' ? body.website.trim() || null : null;
        }

        if (body.accentColor !== undefined) {
            if (body.accentColor !== null && typeof body.accentColor !== 'string') {
                return errorResponse('accentColor must be a string or null');
            }

            data.accentColor =
                typeof body.accentColor === 'string' ? body.accentColor.trim() || null : null;
        }

        if (body.rating !== undefined) {
            const rating = Number(body.rating);

            if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
                return errorResponse('rating must be an integer between 0 and 5');
            }

            data.rating = rating;
        }

        if (body.sortOrder !== undefined) {
            const sortOrder = Number(body.sortOrder);

            if (!Number.isInteger(sortOrder)) {
                return errorResponse('sortOrder must be an integer');
            }

            data.sortOrder = sortOrder;
        }

        if (body.isActive !== undefined) {
            if (typeof body.isActive !== 'boolean') {
                return errorResponse('isActive must be a boolean');
            }

            data.isActive = body.isActive;
        }

        const translationsProvided = body.translations !== undefined;

        const translations = translationsProvided
            ? normalizeTranslations(body.translations)
            : undefined;

        if (translationsProvided && (!translations || translations.length === 0)) {
            return errorResponse('translations must contain at least one valid translation');
        }

        let testimonial;

        if (translationsProvided) {
            const normalizedTranslations = translations as TranslationInput[];

            testimonial = await prisma.$transaction(async (tx) => {
                await tx.testimonialTranslation.deleteMany({
                    where: {
                        testimonialId: id,
                    },
                });

                return tx.testimonial.update({
                    where: {
                        id,
                    },
                    data: {
                        ...data,
                        translations: {
                            create: normalizedTranslations,
                        },
                    },
                    include: {
                        translations: true,
                    },
                });
            });
        } else {
            testimonial = await prisma.testimonial.update({
                where: {
                    id,
                },
                data,
                include: {
                    translations: true,
                },
            });
        }

        return NextResponse.json({
            success: true,
            testimonial,
        });
    } catch (error) {
        console.error('[PATCH /api/admin/testimonials/:id]', error);

        return errorResponse('Failed to update testimonial', 500);
    }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return errorResponse('Unauthorized', 401);
        }

        const { id } = await context.params;

        if (!id) {
            return errorResponse('Testimonial id is required');
        }

        const existing = await findTestimonial(id, workspaceId);

        if (!existing) {
            return errorResponse('Testimonial not found', 404);
        }

        await prisma.testimonial.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
            id,
        });
    } catch (error) {
        console.error('[DELETE /api/admin/testimonials/:id]', error);

        return errorResponse('Failed to delete testimonial', 500);
    }
}
