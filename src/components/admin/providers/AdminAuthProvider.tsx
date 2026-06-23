'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

export type Site = {
    id: string;
    name: string;
    domain: string;

    category?: string | null;
    type?: string | null;

    seoTitle?: string | null;
    seoDescription?: string | null;

    logoUrl?: string | null;
    faviconUrl?: string | null;

    contactEmail?: string | null;
    contactPhone?: string | null;

    ownerUserId?: string | null;

    status?: string | null;

    isPublic?: boolean;

    publishedAt?: string | null;

    themeConfig?: unknown;

    seoDescDefault?: string | null;

    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;

    createdByUserId?: string | null;

    workspaceId?: string | null;
};

export type Membership = {
    workspaceId: string;
    workspaceName: string;
    workspaceSlug: string;
    role: string;
    tier: string;
};

export type WorkspaceAccessPolicy = {
    maxSites: number;
    maxPages: number;
    maxMenus: number;
    maxCategories: number;
    maxBrands: number;
    maxProducts: number;
    maxUsers: number;
    maxTemplates: number;
    maxCustomDomains: number;

    allowSeoBasic: boolean;
    allowSeoPremium: boolean;

    allowAnalytics: boolean;
    allowAdvancedAnalytics: boolean;
};

export type AdminAuthData = {
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        systemRole: string;
        roleLabel: string;
    };

    currentWorkspace: {
        id: string;
        name: string;
        slug: string;
        role: string;
        tier: string;

        accessPolicy: WorkspaceAccessPolicy | null;
    } | null;

    sites: Site[];

    currentSite: Site | null;

    memberships: Membership[];
};

/* =========================
   CONTEXT
========================= */

type AdminAuthContextValue = AdminAuthData | null;

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

type AdminAuthProviderProps = {
    value: AdminAuthData | null;
    children: ReactNode;
};

export function AdminAuthProvider({ value, children }: AdminAuthProviderProps) {
    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthData {
    const context = useContext(AdminAuthContext);

    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }

    return context;
}
export function useAdminUser() {
    const auth = useAdminAuth();

    return auth?.user ?? null;
}

export function useAdminSites() {
    const auth = useAdminAuth();

    return auth?.sites ?? [];
}

export function useCurrentSite() {
    const auth = useAdminAuth();

    return auth?.currentSite ?? null;
}
