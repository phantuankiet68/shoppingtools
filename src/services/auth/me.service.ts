import { prisma } from '@/lib/prisma';

export async function getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
            image: true,
            systemRole: true,
            status: true,
            createdAt: true,
        },
    });

    if (!user) {
        return null;
    }

    return user;
}
