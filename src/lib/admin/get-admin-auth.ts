import 'server-only';

import type { AdminAuthData } from '@/components/admin/providers/AdminAuthProvider';

import { getCurrentSession } from '@/lib/auth/session';

export async function getAdminAuth(): Promise<AdminAuthData | null> {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    return {
        user: {
            id: session.user.id,
            name: session.user.name ?? '',
            email: session.user.email,
            image: session.user.image,
            systemRole: session.user.systemRole,
            roleLabel: session.user.roleLabel,
        },

        currentWorkspace: session.currentWorkspace,

        sites: [],
        currentSite: null,

        memberships: session.memberships,
    };
}
