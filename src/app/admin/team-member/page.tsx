'use client';

import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';

const TeamMemberBuilder = dynamic(() => import('@/components/admin/team-member/team-member-list'), {
    ssr: false,
});

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="team-members Builder" />
            <TeamMemberBuilder />
        </main>
    );
}
