'use client';

import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';
const StoreBuilder = dynamic(() => import('@/components/admin/settings/store/page'), {
    ssr: false,
});

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Store Builder" />
            <StoreBuilder />
        </main>
    );
}
