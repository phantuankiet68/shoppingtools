import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { ApiMethod } from '@/generated/prisma';
import type { Prisma } from '@/generated/prisma';

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

function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

async function getEndpoint(id: string) {
    return prisma.apiHealthEndpoint.findUnique({
        where: {
            id,
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
}

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminAuthUser();

        const { id } = await params;

        if (!id) {
            return jsonError('API health endpoint ID is required');
        }

        const item = await prisma.apiHealthEndpoint.findUnique({
            where: {
                id,
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

                checks: {
                    orderBy: {
                        checkedAt: 'desc',
                    },
                    take: 50,
                    select: {
                        id: true,
                        status: true,
                        httpStatus: true,
                        responseTime: true,
                        errorCode: true,
                        errorMessage: true,
                        response: true,
                        checkedAt: true,
                    },
                },
            },
        });

        if (!item) {
            return jsonError('API health endpoint not found', 404);
        }

        const { checks, ...endpoint } = item;

        return NextResponse.json({
            item: endpoint,
            history: checks,
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
/*                                   PATCH                                    */
/* -------------------------------------------------------------------------- */

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminAuthUser();

        const { id } = await params;

        if (!id) {
            return jsonError('API health endpoint ID is required');
        }

        const existing = await getEndpoint(id);

        if (!existing) {
            return jsonError('API health endpoint not found', 404);
        }

        const contentType = req.headers.get('content-type') ?? '';

        if (!contentType.includes('application/json')) {
            return jsonError('Content-Type must be application/json', 415);
        }

        const body: unknown = await req.json().catch(() => null);

        if (!body || typeof body !== 'object') {
            return jsonError('Invalid JSON body');
        }

        const data = body as Record<string, unknown>;

        const updateData: Prisma.ApiHealthEndpointUpdateInput = {};

        if ('name' in data) {
            const name = String(data.name ?? '').trim();

            if (!name) {
                return jsonError('API name is required');
            }

            updateData.name = name;
        }

        if ('endpoint' in data) {
            const endpoint = String(data.endpoint ?? '').trim();

            if (!endpoint) {
                return jsonError('API endpoint is required');
            }

            updateData.endpoint = endpoint;
        }

        if ('category' in data) {
            const category = String(data.category ?? '').trim();

            if (!category) {
                return jsonError('API category is required');
            }

            updateData.category = category;
        }

        if ('method' in data) {
            const method = String(data.method ?? '')
                .trim()
                .toUpperCase();

            if (!isApiMethod(method)) {
                return jsonError('Invalid API method');
            }

            updateData.method = method;
        }

        if ('isActive' in data) {
            if (!isBoolean(data.isActive)) {
                return jsonError('isActive must be a boolean');
            }

            updateData.isActive = data.isActive;
        }

        if (Object.keys(updateData).length === 0) {
            return jsonError('No fields to update');
        }

        const nextMethod =
            typeof updateData.method === 'string' ? updateData.method : existing.method;

        const nextEndpoint =
            typeof updateData.endpoint === 'string' ? updateData.endpoint : existing.endpoint;

        const duplicate = await prisma.apiHealthEndpoint.findFirst({
            where: {
                method: nextMethod,
                endpoint: nextEndpoint,
                NOT: {
                    id,
                },
            },
            select: {
                id: true,
            },
        });

        if (duplicate) {
            return jsonError('API endpoint already exists for this method', 409);
        }

        const updated = await prisma.apiHealthEndpoint.update({
            where: {
                id,
            },
            data: updateData,
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

        return NextResponse.json({
            item: updated,
        });
    } catch (error: unknown) {
        const prismaError = error as Error & {
            code?: string;
        };

        const message = String(prismaError?.message ?? 'Server error');

        if (message.toLowerCase().includes('unauth')) {
            return jsonError('Unauthorized', 401);
        }

        if (prismaError?.code === 'P2025') {
            return jsonError('API health endpoint not found', 404);
        }

        if (prismaError?.code === 'P2002') {
            return jsonError('API endpoint already exists for this method', 409);
        }

        return jsonError(message, 500);
    }
}

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdminAuthUser();

        const { id } = await params;

        if (!id) {
            return jsonError('API health endpoint ID is required');
        }

        const existing = await getEndpoint(id);

        if (!existing) {
            return jsonError('API health endpoint not found', 404);
        }

        await prisma.apiHealthEndpoint.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
            id,
        });
    } catch (error: unknown) {
        const prismaError = error as Error & {
            code?: string;
        };

        const message = String(prismaError?.message ?? 'Server error');

        if (message.toLowerCase().includes('unauth')) {
            return jsonError('Unauthorized', 401);
        }

        if (prismaError?.code === 'P2025') {
            return jsonError('API health endpoint not found', 404);
        }

        return jsonError(message, 500);
    }
}
