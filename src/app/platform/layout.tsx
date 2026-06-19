import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminProviders } from '@/components/admin/AdminProviders';

import { getAdminAuth } from '@/lib/admin/get-admin-auth';
import { getAdminI18n } from '@/lib/admin/i18n/get-admin-i18n';

export default async function PlatformLayout({ children }: { children: ReactNode }) {
    const [adminAuth, adminI18n] = await Promise.all([getAdminAuth(), getAdminI18n()]);

    if (!adminAuth) {
        redirect('/login');
    }

    if (adminAuth.user.systemRole !== 'SUPER_ADMIN') {
        redirect('/admin');
    }
    return (
        <AdminProviders auth={adminAuth} i18n={adminI18n}>
            {children}
        </AdminProviders>
    );
}
