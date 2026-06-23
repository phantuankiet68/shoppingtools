import type { MenuArea, SiteOption } from '@/components/platform/menus/modalAddMenus';
export type SystemRole = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

export type FilterMode = 'all' | 'enabled' | 'disabled';

export type AreaFilter = 'ALL' | MenuArea;

export type SortKey = 'title' | 'path' | 'area' | 'visible' | 'permission';

export type SortDirection = 'asc' | 'desc';

export type SiteOptionsResponse = {
    ok?: boolean;
    data?: SiteOption[];
    message?: string;
};

export type MenuPermission = {
    id: string | null;
    systemRole: SystemRole;
    enabled: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export type MenuRecord = {
    id: string;
    siteId: string;
    parentId: string | null;
    title: string;
    path: string | null;
    icon: string | null;
    sortOrder: number;
    visible: boolean;
    area: MenuArea;
    createdAt?: string;
    updatedAt?: string;
    permission: MenuPermission;
};

export type PaginationState = {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
};

export type SummaryState = {
    total: number;
    enabled: number;
    disabled: number;
    visible: number;
    hidden: number;
    root: number;
};

export type PaginatedMenuResponse = {
    items: MenuRecord[];
    pagination: PaginationState;
    summary: SummaryState;
};

export type EditMenuFormState = {
    title: string;
    path: string;
    icon: string;
    sortOrder: string;
    visible: boolean;
    area: MenuArea;
    siteId: string;
    parentId: string;
};
