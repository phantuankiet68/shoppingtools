import { getCurrentSession } from '@/lib/auth/session';

export type AuthUser = {
    userId: string;
    email: string;
    systemRole: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
    status: string;
};

export async function getUserFromRequest(): Promise<AuthUser | null> {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return null;
        }

        return {
            userId: session.user.id,
            email: session.user.email,
            systemRole: session.user.systemRole,
            status: session.user.status,
        };
    } catch (error) {
        console.error('GET_USER_ERROR', error);

        return null;
    }
}
