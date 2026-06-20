// app/admin/menu/page.tsx
'use client';

import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';
const RefundBuilder = dynamic(() => import('@/components/admin/orders/refunds/page'), {
    ssr: false,
});

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Refund Management" />
            <RefundBuilder />
        </main>
    );
}
