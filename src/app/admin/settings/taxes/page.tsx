'use client';

import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';
const TaxesBuilder = dynamic(() => import('@/components/admin/settings/taxes/page'), {
    ssr: false,
});

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Taxes Builder" />
            <TaxesBuilder />
        </main>
    );
}
