import { NextResponse } from 'next/server';
import type { Prisma } from '@/generated/prisma';

import { requireAdminAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

const REQUEST_TIMEOUT = 10_000;
const MAX_RESPONSE_LENGTH = 100_000;

const HEALTH_CHECK_SITE_ID = process.env.API_HEALTH_SITE_ID ?? 'cb04418fae3a4b3d95914aaea08494be01';

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

function resolveEndpointUrl(endpoint: string, request: Request) {
    const value = endpoint.trim();

    if (!value) {
        throw new Error('API endpoint is empty');
    }

    let url: URL;

    /*
     * Relative internal endpoint.
     *
     * Example:
     * /api/platform/sites
     * /api/admin/categories
     */
    if (value.startsWith('/')) {
        url = new URL(value, request.url);
    } else {
        /*
         * Absolute URLs are allowed only when they belong
         * to the same origin as the current application.
         *
         * This prevents the health-check endpoint from
         * becoming an unrestricted SSRF proxy.
         */
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
     * Only /api/admin/* endpoints require siteId.
     *
     * Example:
     *
     * /api/admin/categories
     *
     * becomes:
     *
     * /api/admin/categories?siteId=cb04418fae3a4b3d95914aaea08494be01
     *
     * Platform APIs are NOT modified.
     */
    if (url.pathname.startsWith('/api/admin/')) {
        url.searchParams.set('siteId', HEALTH_CHECK_SITE_ID);
    }

    return url;
}

function getForwardHeaders(request: Request): HeadersInit {
    const headers: HeadersInit = {
        Accept: 'application/json',
    };

    /*
     * Forward the current admin authentication context
     * to the API being tested.
     */
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
                parsed === null ||
                typeof parsed === 'string' ||
                typeof parsed === 'number' ||
                typeof parsed === 'boolean' ||
                Array.isArray(parsed) ||
                typeof parsed === 'object'
            ) {
                return parsed as Prisma.InputJsonValue;
            }
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

export async function POST(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    },
) {
    try {
        await requireAdminAuthUser();

        const { id } = await params;

        if (!id) {
            return jsonError('API health endpoint ID is required');
        }

        const endpoint = await prisma.apiHealthEndpoint.findUnique({
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
            },
        });

        if (!endpoint) {
            return jsonError('API health endpoint not found', 404);
        }

        if (!endpoint.isActive) {
            return jsonError('API health endpoint is inactive', 400);
        }

        const targetUrl = resolveEndpointUrl(endpoint.endpoint, request);

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, REQUEST_TIMEOUT);

        const startedAt = performance.now();

        let response: Response | null = null;
        let responseBody: string | null = null;
        let responseData: Prisma.InputJsonValue | null = null;

        let status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';

        let httpStatus: number | null = null;
        let errorCode: string | null = null;
        let errorMessage: string | null = null;

        try {
            response = await fetch(targetUrl, {
                method: endpoint.method,
                signal: controller.signal,
                cache: 'no-store',
                redirect: 'follow',
                headers: getForwardHeaders(request),
            });

            httpStatus = response.status;

            responseBody = await response.text();

            if (responseBody.length > MAX_RESPONSE_LENGTH) {
                responseBody = responseBody.slice(0, MAX_RESPONSE_LENGTH);
            }

            responseData = getResponseValue(
                response.headers.get('content-type') ?? '',
                responseBody,
            );

            if (response.ok) {
                status = 'SUCCESS';
            } else {
                status = 'FAILED';

                errorCode = `HTTP_${response.status}`;

                if (
                    typeof responseData === 'object' &&
                    responseData !== null &&
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

        const responseTime = Math.round(performance.now() - startedAt);

        const result = await prisma.$transaction(async (tx) => {
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
                          response: responseData as Prisma.InputJsonValue,
                      }
                    : {}),
            };

            const check = await tx.apiHealthCheck.create({
                data: checkData,
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
            });

            const updatedEndpoint = await tx.apiHealthEndpoint.update({
                where: {
                    id: endpoint.id,
                },
                data: {
                    lastStatus: status,
                    lastHttpStatus: httpStatus,
                    lastResponseTime: responseTime,
                    lastCheckedAt: check.checkedAt,
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
                },
            });

            return {
                check,
                endpoint: updatedEndpoint,
            };
        });

        return NextResponse.json({
            success: status === 'SUCCESS',

            result: {
                status,
                httpStatus,
                responseTime,
                errorCode,
                errorMessage,
                response: responseData,
            },

            item: result.endpoint,

            check: result.check,
        });
    } catch (error: unknown) {
        const message = getErrorMessage(error);

        if (message.toLowerCase().includes('unauth')) {
            return jsonError('Unauthorized', 401);
        }

        if (message === 'API health endpoint is inactive') {
            return jsonError(message, 400);
        }

        if (message === 'External API endpoints are not allowed') {
            return jsonError(message, 400);
        }

        if (message === 'Invalid API endpoint URL') {
            return jsonError(message, 400);
        }

        if (message === 'API endpoint is empty') {
            return jsonError(message, 400);
        }

        return jsonError(message, 500);
    }
}
