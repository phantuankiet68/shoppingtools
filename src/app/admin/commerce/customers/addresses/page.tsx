// app/admin/menu/page.tsx
'use client';

import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';
const AddresseBuilder = dynamic(
    () => import('@/components/admin/commerce/customers/addresses/page'),
    { ssr: false },
);

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Address Management" />
            <AddresseBuilder />
        </main>
    );
}
