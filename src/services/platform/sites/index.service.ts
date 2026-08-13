import { API } from '@/constants/api';

import type { SiteItem, SiteListResponse } from '@/features/platform/types/sites/site';

export interface SiteFilters {
    page?: number;
    limit?: number;

    search?: string;

    type?: string;
    status?: string;

    subscription?: string;
    provider?: string;

    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

function buildQuery(filters?: SiteFilters) {
    if (!filters) return '';

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
        }
    });

    return params.size ? `?${params}` : '';
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        cache: 'no-store',
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.message ?? 'Unexpected server error.');
    }

    return json as T;
}

function post<T>(url: string) {
    return request<T>(url, {
        method: 'POST',
    });
}

export const SiteService = {
    // =========================
    // Query
    // =========================

    list(filters?: SiteFilters) {
        return request<SiteListResponse>(`${API.PLATFORM.SITES}${buildQuery(filters)}`);
    },

    detail(id: string) {
        return request<ApiResponse<SiteItem>>(API.PLATFORM.SITE(id));
    },

    usage(id: string) {
        return request(API.PLATFORM.SITE_USAGE(id));
    },

    // =========================
    // CRUD
    // =========================

    create(data: unknown) {
        return request<ApiResponse<SiteItem>>(API.PLATFORM.SITES, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update(id: string, data: unknown) {
        return request<ApiResponse<SiteItem>>(API.PLATFORM.SITE(id), {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    remove(id: string) {
        return request<ApiResponse<void>>(API.PLATFORM.SITE(id), {
            method: 'DELETE',
        });
    },

    publish(id: string) {
        return post<ApiResponse<SiteItem>>(API.PLATFORM.SITE_PUBLISH(id));
    },

    unpublish(id: string) {
        return post<ApiResponse<SiteItem>>(API.PLATFORM.SITE_UNPUBLISH(id));
    },

    deploy(id: string) {
        return post<ApiResponse<SiteItem>>(API.PLATFORM.SITE_DEPLOY(id));
    },

    provisionSsl(id: string) {
        return post<ApiResponse<SiteItem>>(API.PLATFORM.SITE_PROVISION_SSL(id));
    },
};
