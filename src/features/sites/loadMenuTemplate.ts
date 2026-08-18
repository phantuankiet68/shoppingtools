import { MenuArea, WebsiteType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

type LoadMenuTemplateInput = {
    type: string;
    category?: string | null;
};

export async function loadMenuTemplate({ type, category }: LoadMenuTemplateInput) {
    if (!type) {
        throw new Error('Site type is required.');
    }

    if (!category) {
        return {
            type,
            category: null,
            menus: [],
        };
    }

    if (!Object.values(WebsiteType).includes(type as WebsiteType)) {
        throw new Error(`Invalid website type: ${type}`);
    }

    const websiteType = type as WebsiteType;

    const templateCategory = await prisma.templateCategory.findFirst({
        where: {
            name: {
                equals: category,
                mode: 'insensitive',
            },
            isActive: true,
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (!templateCategory) {
        return {
            type,
            category,
            menus: [],
        };
    }

    const menus = await prisma.menuTemplate.findMany({
        where: {
            websiteType,
            categoryId: templateCategory.id,
            area: {
                in: [MenuArea.SITE, MenuArea.ADMIN],
            },
            visible: true,
        },
        orderBy: [
            {
                area: 'asc',
            },
            {
                sortOrder: 'asc',
            },
        ],
        select: {
            id: true,
            websiteType: true,
            categoryId: true,
            key: true,
            title: true,
            path: true,
            icon: true,
            area: true,
            sortOrder: true,
            visible: true,
        },
    });

    return {
        type,
        category: templateCategory.name,
        categoryId: templateCategory.id,
        menus,
    };
}
