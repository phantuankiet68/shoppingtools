import { MenuArea, WebsiteType } from '@/generated/prisma';

const BASE_URL = '/api/platform/menu-template';

export interface MenuTemplateCategory {
    id: string;
    name: string;
    description?: string | null;
    websiteType?: WebsiteType | null;
}

export interface MenuTemplateParent {
    id: string;
    title: string;
}

export interface MenuTemplate {
    id: string;
    websiteType: WebsiteType;

    categoryId: string;
    category: MenuTemplateCategory;

    parentId: string | null;
    parent: MenuTemplateParent | null;

    key: string;
    title: string;
    path: string | null;
    icon: string | null;

    area: MenuArea;
    sortOrder: number;
    visible: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface CreateMenuTemplatePayload {
    websiteType: WebsiteType;
    categoryId: string;
    parentId?: string | null;

    key: string;
    title: string;

    path?: string | null;
    icon?: string | null;

    area: MenuArea;
    sortOrder?: number;
    visible?: boolean;
}

export interface UpdateMenuTemplatePayload {
    websiteType?: WebsiteType;
    categoryId?: string;
    parentId?: string | null;

    key?: string;
    title?: string;

    path?: string | null;
    icon?: string | null;

    area?: MenuArea;
    sortOrder?: number;
    visible?: boolean;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface MenuTemplateQuery {
    page?: number;
    limit?: number;
    search?: string;
    websiteType?: WebsiteType;
    categoryId?: string;
    area?: MenuArea;
    visible?: boolean;
    sortBy?: 'title' | 'sortOrder' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

export interface MenuTemplateListResponse {
    success: boolean;
    data: MenuTemplate[];
    categories: MenuTemplateCategory[];
    pagination: Pagination;
}

export interface MenuTemplateResponse {
    success: boolean;
    data: MenuTemplate;
    message?: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
        ...init,
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.message ?? 'Request failed.');
    }

    return json as T;
}

export async function getMenuTemplates(
    query: MenuTemplateQuery = {},
): Promise<MenuTemplateListResponse> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();

    return request<MenuTemplateListResponse>(queryString ? `${BASE_URL}?${queryString}` : BASE_URL);
}

export async function getMenuTemplate(id: string): Promise<MenuTemplateResponse> {
    return request<MenuTemplateResponse>(`${BASE_URL}/${id}`);
}

export async function createMenuTemplate(
    data: CreateMenuTemplatePayload,
): Promise<MenuTemplateResponse> {
    return request<MenuTemplateResponse>(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

export async function updateMenuTemplate(
    id: string,
    data: UpdateMenuTemplatePayload,
): Promise<MenuTemplateResponse> {
    return request<MenuTemplateResponse>(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

export async function deleteMenuTemplate(id: string): Promise<{
    success: boolean;
    message?: string;
}> {
    return request<{
        success: boolean;
        message?: string;
    }>(`${BASE_URL}/${id}`, {
        method: 'DELETE',
    });
}

export async function duplicateMenuTemplate(id: string): Promise<MenuTemplateResponse> {
    return request<MenuTemplateResponse>(`${BASE_URL}/${id}/duplicate`, {
        method: 'POST',
    });
}

export async function toggleMenuTemplateVisible(
    id: string,
    visible: boolean,
): Promise<MenuTemplateResponse> {
    return request<MenuTemplateResponse>(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            visible,
        }),
    });
}
