import { SiteFormState, SiteLike, WebsiteType } from '@/features/sites/types';

export const WEBSITE_TYPES: WebsiteType[] = ['landing', 'blog', 'ecommerce', 'booking', 'lms'];

export const DOMAIN_REGEX = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z]{2,})+$/i;

export function nowLocalInput(): string {
    const d = new Date();

    const offset = d.getTimezoneOffset();

    const local = new Date(d.getTime() - offset * 60000);

    return local.toISOString().slice(0, 16);
}

export function normalizeDomain(input: string): string {
    return input
        .trim()
        .replace(/^https?:\/\//i, '')
        .replace(/\/.*$/, '')
        .replace(/:\d+$/, '')
        .toLowerCase();
}

export function formatDate(iso?: string | null): string {
    if (!iso) {
        return '-';
    }

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return '-';
    }

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}

export function safeWebsiteType(type?: string): WebsiteType {
    if (WEBSITE_TYPES.includes(type as WebsiteType)) {
        return type as WebsiteType;
    }

    return 'ecommerce';
}

export function buildSiteForm(site?: SiteLike | null): SiteFormState {
    return {
        name: site?.name ?? '',
        domain: site?.domain ?? '',
        type: safeWebsiteType(site?.type),
        category: site?.category ?? '',
        logoUrl: site?.logoUrl ?? '',
        faviconUrl: site?.faviconUrl ?? '',
        contactEmail: site?.contactEmail ?? '',
        contactPhone: site?.contactPhone ?? '',
        seoTitle: site?.seoTitle ?? '',
        seoDescription: site?.seoDescription ?? '',
        status: site?.status ?? 'DRAFT',
        isPublic: Boolean(site?.isPublic),
        publishedAt: site?.publishedAt ? site.publishedAt.slice(0, 16) : nowLocalInput(),
    };
}
