import { prisma } from '@/lib/prisma';

export async function checkSiteDomain(domain: string) {
    const normalizedDomain = domain.trim().toLowerCase();

    const existingSite = await prisma.site.findFirst({
        where: {
            domain: normalizedDomain,
        },
        select: {
            id: true,
            name: true,
            domain: true,
            status: true,
        },
    });

    if (existingSite) {
        return {
            available: false,
            domain: normalizedDomain,
            site: existingSite,
        };
    }

    return {
        available: true,
        domain: normalizedDomain,
        site: null,
    };
}
