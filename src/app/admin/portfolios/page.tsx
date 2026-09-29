'use client';
import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';
const PortfolioBuilder = dynamic(() => import('@/components/admin/portfolios/page'), {
    ssr: false,
});

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Portfolios Builder" />
            <PortfolioBuilder />
        </main>
    );
}
