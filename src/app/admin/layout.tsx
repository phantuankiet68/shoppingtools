import type { ReactNode } from 'react';

import { AdminProviders } from '@/components/admin/AdminProviders';
import { getAdminAuth } from '@/lib/admin/get-admin-auth';
import { getAdminI18n } from '@/lib/admin/i18n/get-admin-i18n';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const [adminAuth, adminI18n] = await Promise.all([getAdminAuth(), getAdminI18n()]);
    if (!adminAuth) {
        redirect('/login');
    }

    if (adminAuth.user.systemRole !== 'ADMIN') {
        redirect('/platform');
    }
    return (
        <AdminProviders auth={adminAuth} i18n={adminI18n}>
            {children}
        </AdminProviders>
    );
}
