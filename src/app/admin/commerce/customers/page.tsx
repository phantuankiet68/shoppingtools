// app/admin/menu/page.tsx
'use client';

import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';
const CustomerBuilder = dynamic(() => import('@/components/admin/commerce/customers/page'), {
    ssr: false,
});

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Customer Management" />
            <CustomerBuilder />
        </main>
    );
}
