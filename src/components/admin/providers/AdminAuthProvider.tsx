'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

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
  } | null;
  site: {
    id: string;
    name: string;
    domain: string;
    ownerUserId: string;
    status: string;
    isPublic: boolean;
    publishedAt: string | null;
    themeConfig: unknown;
    seoTitleDefault: string | null;
    seoDescDefault: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    createdByUserId: string | null;
    workspaceId: string;
    type: string;
  } | null;
  memberships: Array<{
    workspaceId: string;
    workspaceName: string;
    workspaceSlug: string;
    role: string;
  }>;
};

const AdminAuthContext = createContext<AdminAuthData | null>(null);

export function AdminAuthProvider({
  value,
  children,
}: {
  value: AdminAuthData;
  children: ReactNode;
}) {
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
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