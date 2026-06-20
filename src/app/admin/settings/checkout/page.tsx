'use client';

import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';
const ShippingBuilder = dynamic(() => import('@/components/admin/settings/shipping/page'), {
    ssr: false,
});

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Shipping Builder" />
            <ShippingBuilder />
        </main>
    );
}
