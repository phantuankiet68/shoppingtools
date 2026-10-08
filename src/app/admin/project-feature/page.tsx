'use client';

import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';

const ProjectFeatureBuilder = dynamic(() => import('@/components/admin/project-feature/page'), {
    ssr: false,
});

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Project Feature Builder" />
            <ProjectFeatureBuilder />
        </main>
    );
}
