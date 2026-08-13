import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma';
import { ApiHealthStatus, ApiMethod } from '@/generated/prisma';

function jsonError(message: string, status = 400) {
    return NextResponse.json(
        {
            error: message,
        },
        {
            status,
        },
    );
}

function isApiMethod(value: unknown): value is ApiMethod {
    return (
        value === ApiMethod.GET ||
        value === ApiMethod.POST ||
        value === ApiMethod.PUT ||
        value === ApiMethod.PATCH ||
        value === ApiMethod.DELETE
    );
}

function isApiHealthStatus(value: unknown): value is ApiHealthStatus {
    return value === 'SUCCESS' || value === 'FAILED' || value === 'TIMEOUT' || value === 'PENDING';
}

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */

export async function GET(req: Request) {
    try {
        await requireAdminAuthUser();

        const url = new URL(req.url);

        const query = String(url.searchParams.get('q') ?? '').trim();
        const category = String(url.searchParams.get('category') ?? '').trim();
        const method = String(url.searchParams.get('method') ?? '')
            .trim()
            .toUpperCase();
        const status = String(url.searchParams.get('status') ?? '')
            .trim()
            .toUpperCase();

        const page = Math.max(Number(url.searchParams.get('page') ?? 1) || 1, 1);

        const pageSize = Math.min(
            Math.max(Number(url.searchParams.get('pageSize') ?? 8) || 8, 1),
            100,
        );

        const where: Prisma.ApiHealthEndpointWhereInput = {};

        if (query) {
            where.OR = [
                {
                    name: {
                        contains: query,
                        mode: 'insensitive',
                    },
                },
                {
                    endpoint: {
                        contains: query,
                        mode: 'insensitive',
                    },
                },
                {
                    category: {
                        contains: query,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        if (category) {
            where.category = category;
        }

        if (method) {
            if (!isApiMethod(method)) {
                return jsonError('Invalid API method');
            }

            where.method = method;
        }

        if (status) {
            if (!isApiHealthStatus(status)) {
                return jsonError('Invalid API health status');
            }

            where.lastStatus = status;
        }

        const skip = (page - 1) * pageSize;

        const [items, total] = await Promise.all([
            prisma.apiHealthEndpoint.findMany({
                where,
                orderBy: [
                    {
                        isActive: 'desc',
                    },
                    {
                        name: 'asc',
                    },
                ],
                skip,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    endpoint: true,
                    method: true,
                    category: true,
                    isActive: true,
                    lastStatus: true,
                    lastHttpStatus: true,
                    lastResponseTime: true,
                    lastCheckedAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.apiHealthEndpoint.count({
                where,
            }),
        ]);

        return NextResponse.json({
            items,
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Server error';

        if (message.toLowerCase().includes('unauth')) {
            return jsonError('Unauthorized', 401);
        }

        return jsonError(message, 500);
    }
}

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
    try {
        await requireAdminAuthUser();

        const contentType = req.headers.get('content-type') ?? '';

        if (!contentType.includes('application/json')) {
            return jsonError('Content-Type must be application/json', 415);
        }

        const body: unknown = await req.json().catch(() => null);

        if (!body || typeof body !== 'object') {
            return jsonError('Invalid JSON body');
        }

        const data = body as Record<string, unknown>;

        const name = String(data.name ?? '').trim();
        const endpoint = String(data.endpoint ?? '').trim();
        const category = String(data.category ?? '').trim();
        const method = String(data.method ?? '')
            .trim()
            .toUpperCase();

        if (!name) {
            return jsonError('API name is required');
        }

        if (!endpoint) {
            return jsonError('API endpoint is required');
        }

        if (!category) {
            return jsonError('API category is required');
        }

        if (!isApiMethod(method)) {
            return jsonError('Invalid API method');
        }

        const existing = await prisma.apiHealthEndpoint.findUnique({
            where: {
                method_endpoint: {
                    method,
                    endpoint,
                },
            },
            select: {
                id: true,
                name: true,
                endpoint: true,
                method: true,
                category: true,
                isActive: true,
                lastStatus: true,
                lastHttpStatus: true,
                lastResponseTime: true,
                lastCheckedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (existing) {
            return NextResponse.json(
                {
                    item: existing,
                    existed: true,
                },
                {
                    status: 200,
                },
            );
        }

        const created = await prisma.apiHealthEndpoint.create({
            data: {
                name,
                endpoint,
                method,
                category,
            },
            select: {
                id: true,
                name: true,
                endpoint: true,
                method: true,
                category: true,
                isActive: true,
                lastStatus: true,
                lastHttpStatus: true,
                lastResponseTime: true,
                lastCheckedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(
            {
                item: created,
                existed: false,
            },
            {
                status: 201,
            },
        );
    } catch (error: unknown) {
        const prismaError = error as Error & {
            code?: string;
            meta?: {
                target?: string | string[];
            };
        };

        const message = String(prismaError?.message ?? 'Server error');

        if (message.toLowerCase().includes('unauth')) {
            return jsonError('Unauthorized', 401);
        }

        if (prismaError?.code === 'P2002') {
            return jsonError('API endpoint already exists for this method', 409);
        }

        return jsonError(message, 500);
    }
}
