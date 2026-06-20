// features/builder/sites/validation.ts
import type { SiteLike } from './types';

export type SitesListResponse = {
    items: SiteLike[];
};

export function normalizeSitesResponse(data: any): SitesListResponse {
    const items: SiteLike[] = Array.isArray(data?.items) ? data.items : [];
    return { items };
}

export function isValidSiteRow(x: any): x is SiteLike {
    return (
        x && typeof x.id === 'string' && typeof x.domain === 'string' && typeof x.name === 'string'
    );
}
