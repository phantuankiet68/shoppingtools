export type SiteStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED';

export type WebsiteType = 'landing' | 'blog' | 'ecommerce' | 'booking' | 'lms';

export type SiteLike = {
    id: string;
    name: string;
    domain: string;

    type?: WebsiteType;
    category?: string | null;

    logoUrl?: string | null;
    faviconUrl?: string | null;

    contactEmail?: string | null;
    contactPhone?: string | null;

    seoTitle?: string | null;
    seoDescription?: string | null;

    status?: SiteStatus;
    isPublic?: boolean;

    publishedAt?: string | null;

    createdAt?: string;
    updatedAt?: string;
};

export type SiteFormState = {
    name: string;
    domain: string;

    type: WebsiteType;
    category: string;

    logoUrl: string;
    faviconUrl: string;

    logoFile?: File | null;
    faviconFile?: File | null;

    contactEmail: string;
    contactPhone: string;

    seoTitle: string;
    seoDescription: string;

    status: SiteStatus;

    isPublic: boolean;

    publishedAt: string;
};

export type FormErrors = {
    name?: string;
    domain?: string;
    type?: string;
    category?: string;

    logoUrl?: string;
    faviconUrl?: string;

    contactEmail?: string;
    contactPhone?: string;

    seoTitle?: string;
    seoDescription?: string;
};

export type SiteFormMode = 'create' | 'edit';
