import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { Prisma, WebsiteType } from '@/generated/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WEBSITE_TYPES = new Set(Object.values(WebsiteType));
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MAX_TITLE_LENGTH = 191;
const MAX_SLUG_LENGTH = 191;
const MAX_PATH_LENGTH = 255;

const CATEGORY_SELECT = {
    id: true,
    name: true,
    websiteType: true,
} satisfies Prisma.TemplateCategorySelect;

const PAGE_TEMPLATE_INCLUDE = {
    category: {
        select: CATEGORY_SELECT,
    },
} satisfies Prisma.PageTemplateInclude;

function parsePositiveInt(value: string | null, fallback: number, max?: number) {
    if (!value) return fallback;

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) return fallback;

    return max ? Math.min(parsed, max) : parsed;
}

function parseWebsiteType(value: string | null): WebsiteType | undefined {
    if (!value) return undefined;
    return WEBSITE_TYPES.has(value as WebsiteType) ? (value as WebsiteType) : undefined;
}

function normalizeSlug(value: string) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, MAX_SLUG_LENGTH);
}

function normalizePath(value: string) {
    const normalized = `/${value.trim().replace(/^\/+/, '')}`
        .replace(/\/{2,}/g, '/')
        .replace(/\/+$/, '');

    return normalized || '/';
}

function parseBlocks(value: unknown): Prisma.InputJsonValue | null {
    if (value === undefined || value === null || value === '') return null;

    if (typeof value === 'string') {
        try {
            value = JSON.parse(value);
        } catch {
            throw new Error('Page blocks contain invalid JSON.');
        }
    }

    if (
        value === null ||
        typeof value !== 'object' ||
        (Array.isArray(value) && value.length === 0)
    ) {
        if (Array.isArray(value)) return value as Prisma.InputJsonValue;
        throw new Error('Page blocks must be a JSON object or array.');
    }

    return value as Prisma.InputJsonValue;
}

function buildWhere(searchParams: URLSearchParams): Prisma.PageTemplateWhereInput {
    const search = searchParams.get('search')?.trim();
    const categoryId = searchParams.get('categoryId')?.trim();
    const websiteTypeValue = searchParams.get('websiteType');
    const websiteType = parseWebsiteType(websiteTypeValue);

    if (websiteTypeValue && !websiteType) {
        throw new ApiError(400, 'Invalid website type.');
    }

    return {
        deletedAt: null,
        ...(categoryId ? { categoryId } : {}),
        ...(websiteType ? { websiteType } : {}),
        ...(search
            ? {
                  OR: [
                      { title: { contains: search, mode: 'insensitive' } },
                      { slug: { contains: search, mode: 'insensitive' } },
                      { path: { contains: search, mode: 'insensitive' } },
                  ],
              }
            : {}),
    };
}

class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

function jsonError(error: unknown, fallback: string) {
    if (error instanceof ApiError) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: error.status },
        );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'A page template with the same website type, category and slug already exists.',
                },
                { status: 409 },
            );
        }

        if (error.code === 'P2003') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'The selected template category does not exist.',
                },
                { status: 400 },
            );
        }
    }

    console.error('[page-templates]', error);

    return NextResponse.json({ success: false, error: fallback }, { status: 500 });
}

async function requireSession() {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
        throw new ApiError(401, 'Unauthorized.');
    }

    return session;
}

/**
 * GET /api/platform/page-templates
 */
export async function GET(req: NextRequest) {
    try {
        await requireSession();

        const { searchParams } = new URL(req.url);
        const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
        const limit = parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT);
        const where = buildWhere(searchParams);
        const skip = (page - 1) * limit;

        const [items, total] = await prisma.$transaction([
            prisma.pageTemplate.findMany({
                where,
                include: PAGE_TEMPLATE_INCLUDE,
                orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
                skip,
                take: limit,
            }),
            prisma.pageTemplate.count({ where }),
        ]);

        const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
        const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;

        return NextResponse.json(
            {
                success: true,
                data: {
                    items,
                    pagination: {
                        page: safePage,
                        limit,
                        total,
                        totalPages,
                    },
                },
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store',
                },
            },
        );
    } catch (error) {
        return jsonError(error, 'Failed to fetch page templates.');
    }
}

/**
 * POST /api/platform/page-templates
 */
export async function POST(req: NextRequest) {
    try {
        await requireSession();

        let body: unknown;

        try {
            body = await req.json();
        } catch {
            throw new ApiError(400, 'Invalid JSON request body.');
        }

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            throw new ApiError(400, 'Invalid request body.');
        }

        const payload = body as Record<string, unknown>;
        const title = String(payload.title ?? '').trim();
        const categoryId = String(payload.categoryId ?? '').trim();
        const websiteType = parseWebsiteType(String(payload.websiteType ?? '').trim());
        const rawSlug = String(payload.slug ?? '').trim();
        const slug = rawSlug ? normalizeSlug(rawSlug) : normalizeSlug(title);
        const rawPath = String(payload.path ?? '').trim();
        const path = normalizePath(rawPath);
        const previewImageUrl =
            payload.previewImageUrl === null ||
            payload.previewImageUrl === undefined ||
            String(payload.previewImageUrl).trim() === ''
                ? null
                : String(payload.previewImageUrl).trim();
        const sortOrderValue = Number(payload.sortOrder ?? 0);
        const sortOrder = Number.isFinite(sortOrderValue)
            ? Math.max(0, Math.trunc(sortOrderValue))
            : 0;
        const blocks = parseBlocks(payload.blocks);

        if (!title) {
            throw new ApiError(400, 'Template title is required.');
        }

        if (title.length > MAX_TITLE_LENGTH) {
            throw new ApiError(
                400,
                `Template title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
            );
        }

        if (!categoryId) {
            throw new ApiError(400, 'Template category is required.');
        }

        if (!websiteType) {
            throw new ApiError(400, 'Invalid website type.');
        }

        if (rawSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug)) {
            throw new ApiError(
                400,
                'Slug may contain only lowercase letters, numbers and hyphens.',
            );
        }

        if (!slug) {
            throw new ApiError(400, 'A valid slug could not be generated from the title.');
        }

        if (slug.length > MAX_SLUG_LENGTH) {
            throw new ApiError(400, `Slug must be ${MAX_SLUG_LENGTH} characters or fewer.`);
        }

        if (!rawPath) {
            throw new ApiError(400, 'Template path is required.');
        }

        if (!path.startsWith('/')) {
            throw new ApiError(400, 'Template path must start with /.');
        }

        if (path.length > MAX_PATH_LENGTH) {
            throw new ApiError(
                400,
                `Template path must be ${MAX_PATH_LENGTH} characters or fewer.`,
            );
        }

        const category = await prisma.templateCategory.findFirst({
            where: {
                id: categoryId,
                websiteType,
            },
            select: {
                id: true,
            },
        });

        if (!category) {
            throw new ApiError(
                400,
                'Template category does not exist or does not belong to the selected website type.',
            );
        }

        const item = await prisma.pageTemplate.create({
            data: {
                categoryId,
                websiteType,
                title,
                slug,
                path,
                ...(blocks !== null ? { blocks } : {}),
                previewImageUrl,
                sortOrder,
            },
            include: PAGE_TEMPLATE_INCLUDE,
        });

        return NextResponse.json(
            {
                success: true,
                data: item,
            },
            { status: 201 },
        );
    } catch (error) {
        return jsonError(error, 'Failed to create page template.');
    }
}
