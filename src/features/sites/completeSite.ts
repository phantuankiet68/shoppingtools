import { prisma } from '@/lib/prisma';

type CompleteSiteInput = {
    siteId: string;
};

export async function completeSite({ siteId }: CompleteSiteInput) {
    const site = await prisma.site.findUnique({
        where: {
            id: siteId,
        },
        select: {
            id: true,
            name: true,
            domain: true,
            status: true,
        },
    });

    if (!site) {
        throw new Error('Site was not found.');
    }

    return {
        siteId: site.id,
        name: site.name,
        domain: site.domain,
        status: site.status,
        completed: true,
    };
}
