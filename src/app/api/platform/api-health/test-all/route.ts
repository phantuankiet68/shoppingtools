import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

import type { Prisma } from '@/generated/prisma';

const REQUEST_TIMEOUT = 10_000;
const MAX_RESPONSE_LENGTH = 100_000;
const CONCURRENCY = 5;

const HEALTH_CHECK_SITE_ID = process.env.API_HEALTH_SITE_ID ?? 'cb04418fae3a4b3d95914aaea08494be01';

type TestStatus = 'SUCCESS' | 'FAILED' | 'TIMEOUT';

interface TestResult {
    id: string;
    name: string;
    endpoint: string;
    method: string;
    status: TestStatus;
    httpStatus: number | null;
    responseTime: number;
    errorCode: string | null;
    errorMessage: string | null;
}

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

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Unknown error';
}

/**
 * Resolve and normalize the target API URL.
 *
 * Rules:
 * - Relative internal endpoints are allowed.
 * - Absolute URLs are only allowed on the same origin.
 * - /api/admin/* automatically receives the configured siteId.
 * - Other API groups are not modified.
 */
function resolveEndpointUrl(endpoint: string, request: Request) {
    const value = endpoint.trim();

    if (!value) {
        throw new Error('API endpoint is empty');
    }

    let url: URL;

    if (value.startsWith('/')) {
        url = new URL(value, request.url);
    } else {
        try {
            url = new URL(value);
        } catch {
            throw new Error('Invalid API endpoint URL');
        }

        const requestUrl = new URL(request.url);

        if (url.origin !== requestUrl.origin) {
            throw new Error('External API endpoints are not allowed');
        }
    }

    /*
     * Only Admin APIs require siteId.
     *
     * Example:
     *
     * /api/admin/categories
     *
     * becomes:
     *
     * /api/admin/categories?siteId=...
     *
     * Platform APIs remain unchanged.
     */
    if (url.pathname.startsWith('/api/admin/')) {
        if (!HEALTH_CHECK_SITE_ID) {
            throw new Error('API health site ID is not configured');
        }

        url.searchParams.set('siteId', HEALTH_CHECK_SITE_ID);
    }

    return url;
}

/**
 * Forward the current authentication context
 * to the API being tested.
 */
function getForwardHeaders(request: Request): HeadersInit {
    const headers: HeadersInit = {
        Accept: 'application/json',
    };

    const cookie = request.headers.get('cookie');
    const authorization = request.headers.get('authorization');

    if (cookie) {
        headers.Cookie = cookie;
    }

    if (authorization) {
        headers.Authorization = authorization;
    }

    return headers;
}

function getResponseValue(contentType: string, body: string): Prisma.InputJsonValue | null {
    if (!body) {
        return null;
    }

    if (contentType.includes('application/json')) {
        try {
            const parsed: unknown = JSON.parse(body);

            if (
                typeof parsed === 'string' ||
                typeof parsed === 'number' ||
                typeof parsed === 'boolean' ||
                Array.isArray(parsed) ||
                (typeof parsed === 'object' && parsed !== null)
            ) {
                return parsed as Prisma.InputJsonValue;
            }

            return {
                raw: body,
            };
        } catch {
            return {
                raw: body,
            };
        }
    }

    return {
        raw: body,
    };
}

async function testEndpoint(
    endpoint: {
        id: string;
        name: string;
        endpoint: string;
        method: string;
    },
    request: Request,
): Promise<TestResult> {
    const startedAt = performance.now();

    let status: TestStatus = 'FAILED';
    let httpStatus: number | null = null;
    let responseTime = 0;
    let errorCode: string | null = null;
    let errorMessage: string | null = null;
    let responseData: Prisma.InputJsonValue | null = null;

    try {
        const targetUrl = resolveEndpointUrl(endpoint.endpoint, request);

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, REQUEST_TIMEOUT);

        try {
            const response = await fetch(targetUrl, {
                method: endpoint.method,
                signal: controller.signal,
                cache: 'no-store',
                redirect: 'follow',
                headers: getForwardHeaders(request),
            });

            httpStatus = response.status;

            let body = await response.text();

            if (body.length > MAX_RESPONSE_LENGTH) {
                body = body.slice(0, MAX_RESPONSE_LENGTH);
            }

            responseData = getResponseValue(response.headers.get('content-type') ?? '', body);

            if (response.ok) {
                status = 'SUCCESS';
            } else {
                status = 'FAILED';

                errorCode = `HTTP_${response.status}`;

                if (
                    typeof responseData === 'object' &&
                    responseData !== null &&
                    !Array.isArray(responseData) &&
                    'error' in responseData &&
                    typeof responseData.error === 'string'
                ) {
                    errorMessage = responseData.error;
                } else {
                    errorMessage =
                        response.statusText || `Request failed with HTTP ${response.status}`;
                }
            }
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                status = 'TIMEOUT';
                errorCode = 'TIMEOUT';
                errorMessage = `Request timed out after ${REQUEST_TIMEOUT / 1000} seconds.`;
            } else {
                status = 'FAILED';
                errorCode = 'NETWORK_ERROR';
                errorMessage = getErrorMessage(error);
            }
        } finally {
            clearTimeout(timeout);
        }
    } catch (error: unknown) {
        status = 'FAILED';
        errorCode = 'INVALID_ENDPOINT';
        errorMessage = getErrorMessage(error);
    }

    responseTime = Math.round(performance.now() - startedAt);

    const checkData: Prisma.ApiHealthCheckCreateInput = {
        endpoint: {
            connect: {
                id: endpoint.id,
            },
        },
        status,
        httpStatus,
        responseTime,
        errorCode,
        errorMessage,
        ...(responseData !== null
            ? {
                  response: responseData,
              }
            : {}),
    };

    await prisma.$transaction(async (tx) => {
        await tx.apiHealthCheck.create({
            data: checkData,
        });

        await tx.apiHealthEndpoint.update({
            where: {
                id: endpoint.id,
            },
            data: {
                lastStatus: status,
                lastHttpStatus: httpStatus,
                lastResponseTime: responseTime,
                lastCheckedAt: new Date(),
            },
        });
    });

    return {
        id: endpoint.id,
        name: endpoint.name,
        endpoint: endpoint.endpoint,
        method: endpoint.method,
        status,
        httpStatus,
        responseTime,
        errorCode,
        errorMessage,
    };
}

async function runWithConcurrency<T>(
    items: T[],
    worker: (item: T) => Promise<void>,
    concurrency: number,
) {
    let index = 0;

    async function runWorker() {
        while (true) {
            const currentIndex = index++;

            if (currentIndex >= items.length) {
                return;
            }

            await worker(items[currentIndex]);
        }
    }

    const workers = Array.from(
        {
            length: Math.min(concurrency, items.length),
        },
        () => runWorker(),
    );

    await Promise.all(workers);
}

export async function POST(request: Request) {
    try {
        await requireAdminAuthUser();

        const endpoints = await prisma.apiHealthEndpoint.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                endpoint: true,
                method: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        if (endpoints.length === 0) {
            return NextResponse.json({
                success: true,
                summary: {
                    total: 0,
                    successful: 0,
                    failed: 0,
                    timeout: 0,
                },
                items: [],
            });
        }

        const results: TestResult[] = [];

        await runWithConcurrency(
            endpoints,
            async (endpoint) => {
                const result = await testEndpoint(endpoint, request);

                results.push(result);
            },
            CONCURRENCY,
        );

        results.sort((a, b) => a.name.localeCompare(b.name));

        const successful = results.filter((item) => item.status === 'SUCCESS').length;

        const failed = results.filter((item) => item.status === 'FAILED').length;

        const timeout = results.filter((item) => item.status === 'TIMEOUT').length;

        return NextResponse.json({
            success: failed === 0 && timeout === 0,

            summary: {
                total: results.length,
                successful,
                failed,
                timeout,
            },

            items: results,
        });
    } catch (error: unknown) {
        const message = getErrorMessage(error);

        if (message.toLowerCase().includes('unauth')) {
            return jsonError('Unauthorized', 401);
        }

        return jsonError(message, 500);
    }
}
