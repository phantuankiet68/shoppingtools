export interface Site {
    id: string;
    name: string;
    domain: string;
    type: string;
    category: string | null;
    logoUrl: string | null;
    faviconUrl: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    status: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}
