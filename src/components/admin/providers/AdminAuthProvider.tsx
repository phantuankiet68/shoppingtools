'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

export type Site = {
    id: string;
    name: string;
    domain: string;
    ownerUserId: string;
    status: string;
    isPublic: boolean;
    publishedAt: string | null;
    themeConfig: unknown;
    seoDescDefault: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    createdByUserId: string | null;
    workspaceId: string;
    type: string;
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

    allowBlog: boolean;
    allowEcommerce: boolean;
    allowBooking: boolean;
    allowNews: boolean;
    allowLms: boolean;
    allowDirectory: boolean;
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

        accessPolicy: WorkspaceAccessPolicy;
    } | null;

    sites: Site[];
    currentSite: Site | null;

    memberships: Membership[];
};

/* =========================
   CONTEXT
========================= */

const AdminAuthContext = createContext<AdminAuthData | undefined>(undefined);

export function AdminAuthProvider({
    value,
    children,
}: {
    value: AdminAuthData;
    children: ReactNode;
}) {
    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);

    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }

    return context;
}

export function useAdminUser() {
    return useAdminAuth().user;
}

export function useAdminSites() {
    return useAdminAuth().sites;
}

export function useCurrentSite() {
    return useAdminAuth().currentSite;
}
