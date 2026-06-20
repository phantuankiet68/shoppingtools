'use client';
import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';
const ProductBuilder = dynamic(() => import('@/components/admin/products/page'), { ssr: false });

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Product Builder" />
            <ProductBuilder />
        </main>
    );
}
