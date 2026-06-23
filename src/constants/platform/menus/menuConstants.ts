import type {
    AreaFilter,
    PaginationState,
    SummaryState,
} from '@/features/platform/types/menus/menu';

import type { MenuArea } from '@/components/platform/menus/modalAddMenus';

export const PAGE_SIZE = 8;

export const EMPTY_PAGINATION: PaginationState = {
    page: 1,
    size: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
};

export const EMPTY_SUMMARY: SummaryState = {
    total: 0,
    enabled: 0,
    disabled: 0,
    visible: 0,
    hidden: 0,
    root: 0,
};

export const AREA_OPTIONS: ReadonlyArray<{
    value: AreaFilter;
    label: string;
}> = [
    {
        value: 'ALL',
        label: 'All areas',
    },
    {
        value: 'PLATFORM',
        label: 'Platform',
    },
    {
        value: 'ADMIN',
        label: 'Admin',
    },
    {
        value: 'SITE',
        label: 'Site',
    },
];

export const MENU_AREA_OPTIONS: ReadonlyArray<{
    value: MenuArea;
    label: string;
}> = [
    {
        value: 'PLATFORM',
        label: 'Platform',
    },
    {
        value: 'ADMIN',
        label: 'Admin',
    },
    {
        value: 'SITE',
        label: 'Site',
    },
];
