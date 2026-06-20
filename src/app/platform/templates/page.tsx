'use client';

import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';
const ThemeBuilder = dynamic(() => import('@/components/platform/templates/page'), { ssr: false });

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Theme Management" />
            <ThemeBuilder />
        </main>
    );
}
