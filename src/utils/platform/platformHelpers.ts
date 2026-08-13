import { getUserFromRequest } from '@/lib/auth/getUser';
import { hasRole } from '@/lib/auth/roles';

export async function requireAdmin() {
    const user = await getUserFromRequest();

    if (!user) {
        throw new Error('UNAUTHORIZED');
    }

    if (!hasRole(user.systemRole, 'SUPER_ADMIN') && !hasRole(user.systemRole, 'ADMIN')) {
        throw new Error('FORBIDDEN');
    }

    return user;
}
