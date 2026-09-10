'use client';

import dynamic from 'next/dynamic';
import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';

const DashboardPlatform = dynamic(
    () => import('@/components/platform/platform-dashboard/DashboardPlatform/DashboardPlatform'),
    { ssr: false },
);

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Dashboard" />
            <DashboardPlatform />
        </main>
    );
}
