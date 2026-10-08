'use client';

import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';

const BlogBuilder = dynamic(() => import('@/components/admin/blog/blog-management'), {
    ssr: false,
});

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="Project Feature Builder" />
            <BlogBuilder />
        </main>
    );
}
