import { API } from '@/constants/api';

export interface ApiHealthEndpoint {
    id: string;
    name: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    category: string;
    isActive: boolean;
    lastStatus: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'PENDING' | null;
    lastHttpStatus: number | null;
    lastResponseTime: number | null;
    lastCheckedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ApiHealthCheck {
    id: string;
    status: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'PENDING';
    httpStatus: number | null;
    responseTime: number | null;
    errorCode: string | null;
    errorMessage: string | null;
    response: unknown;
    checkedAt: string;
}

export interface ApiHealthListResponse {
    items: ApiHealthEndpoint[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface ApiHealthDetailResponse {
    item: ApiHealthEndpoint;
    history: ApiHealthCheck[];
}

export interface CreateApiHealthPayload {
    name: string;
    endpoint: string;
    method: ApiHealthEndpoint['method'];
    category: string;
}

export interface UpdateApiHealthPayload {
    name?: string;
    endpoint?: string;
    method?: ApiHealthEndpoint['method'];
    category?: string;
    isActive?: boolean;
}

export interface ApiHealthTestResult {
    id: string;
    name: string;
    endpoint: string;
    method: string;
    status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
    httpStatus: number | null;
    responseTime: number;
    errorCode: string | null;
    errorMessage: string | null;
}

export interface ApiHealthTestResponse {
    success: boolean;
    result: {
        status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
        httpStatus: number | null;
        responseTime: number;
        errorCode: string | null;
        errorMessage: string | null;
        response: unknown;
    };
    item: ApiHealthEndpoint;
    check: ApiHealthCheck;
}

export interface ApiHealthTestAllResponse {
    success: boolean;
    summary: {
        total: number;
        successful: number;
        failed: number;
        timeout: number;
    };
    items: ApiHealthTestResult[];
}

export interface ApiHealthListParams {
    q?: string;
    category?: string;
    method?: ApiHealthEndpoint['method'];
    status?: ApiHealthEndpoint['lastStatus'];
    page?: number;
    pageSize?: number;
}

async function parseResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
                ? data.error
                : 'API request failed';

        throw new Error(message);
    }

    return data as T;
}

function buildQuery(params?: ApiHealthListParams) {
    if (!params) return '';

    const searchParams = new URLSearchParams();

    if (params.q) {
        searchParams.set('q', params.q);
    }

    if (params.category) {
        searchParams.set('category', params.category);
    }

    if (params.method) {
        searchParams.set('method', params.method);
    }

    if (params.status) {
        searchParams.set('status', params.status);
    }

    if (params.page) {
        searchParams.set('page', String(params.page));
    }

    if (params.pageSize) {
        searchParams.set('pageSize', String(params.pageSize));
    }

    const query = searchParams.toString();

    return query ? `?${query}` : '';
}

/* -------------------------------------------------------------------------- */
/*                                    LIST                                    */
/* -------------------------------------------------------------------------- */

export async function getApiHealthList(
    params?: ApiHealthListParams,
): Promise<ApiHealthListResponse> {
    const response = await fetch(`${API.PLATFORM.API_HEALTH}${buildQuery(params)}`, {
        method: 'GET',
        cache: 'no-store',
    });

    return parseResponse<ApiHealthListResponse>(response);
}
/* -------------------------------------------------------------------------- */
/*                                   DETAIL                                   */
/* -------------------------------------------------------------------------- */
export async function getApiHealth(id: string): Promise<ApiHealthDetailResponse> {
    const response = await fetch(API.PLATFORM.API_HEALTH_DETAIL(id), {
        method: 'GET',
        cache: 'no-store',
    });

    return parseResponse<ApiHealthDetailResponse>(response);
}

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */

export async function createApiHealth(payload: CreateApiHealthPayload): Promise<{
    item: ApiHealthEndpoint;
    existed: boolean;
}> {
    const response = await fetch(API.PLATFORM.API_HEALTH, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return parseResponse<{
        item: ApiHealthEndpoint;
        existed: boolean;
    }>(response);
}
/* -------------------------------------------------------------------------- */
/*                                   UPDATE                                   */
/* -------------------------------------------------------------------------- */
export async function updateApiHealth(
    id: string,
    payload: UpdateApiHealthPayload,
): Promise<{
    item: ApiHealthEndpoint;
}> {
    const response = await fetch(API.PLATFORM.API_HEALTH_DETAIL(id), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return parseResponse<{
        item: ApiHealthEndpoint;
    }>(response);
}
/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

export async function deleteApiHealth(id: string): Promise<{
    success: boolean;
    id: string;
}> {
    const response = await fetch(API.PLATFORM.API_HEALTH_DETAIL(id), {
        method: 'DELETE',
    });

    return parseResponse<{
        success: boolean;
        id: string;
    }>(response);
}

/* -------------------------------------------------------------------------- */
/*                                    TEST                                    */
/* -------------------------------------------------------------------------- */

export async function testApiHealth(id: string): Promise<ApiHealthTestResponse> {
    const response = await fetch(API.PLATFORM.API_HEALTH_TEST(id), {
        method: 'POST',
    });

    return parseResponse<ApiHealthTestResponse>(response);
}

/* -------------------------------------------------------------------------- */
/*                                  TEST ALL                                  */
/* -------------------------------------------------------------------------- */

export async function testAllApiHealth(): Promise<ApiHealthTestAllResponse> {
    const response = await fetch(API.PLATFORM.API_HEALTH_TEST_ALL, {
        method: 'POST',
    });

    return parseResponse<ApiHealthTestAllResponse>(response);
}
