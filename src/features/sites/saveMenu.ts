import { MenuArea } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

type MenuItemInput = {
    key: string;
    title: string;
    path?: string | null;
    icon?: string | null;
    area: MenuArea;
    sortOrder?: number;
    visible?: boolean;
};

type SaveMenuInput = {
    siteId: string;
    items: MenuItemInput[];
};

export async function saveMenu({ siteId, items }: SaveMenuInput) {
    if (!siteId.trim()) {
        throw new Error('Site ID is required.');
    }

    if (!items.length) {
        return {
            siteId,
            count: 0,
            items: [],
        };
    }

    const normalizedItems = items.map((item) => ({
        key: item.key.trim(),
        title: item.title.trim(),
        path: item.path?.trim() || null,
        icon: item.icon?.trim() || null,
        area: item.area,
        sortOrder: item.sortOrder ?? 0,
        visible: item.visible ?? true,
    }));

    const invalidItems = normalizedItems.filter(
        (item) =>
            !item.key ||
            !item.title ||
            (item.area !== MenuArea.SITE && item.area !== MenuArea.ADMIN),
    );

    if (invalidItems.length) {
        throw new Error(`Invalid menu items: ${invalidItems.length} item(s).`);
    }

    const duplicateMap = new Map<string, number>();

    for (const item of normalizedItems) {
        const uniqueKey = `${item.area}:${item.key}`;

        duplicateMap.set(uniqueKey, (duplicateMap.get(uniqueKey) ?? 0) + 1);
    }

    const duplicateKeys = [...duplicateMap.entries()]
        .filter(([, count]) => count > 1)
        .map(([key]) => key);

    if (duplicateKeys.length) {
        throw new Error(`Duplicate menu keys: ${duplicateKeys.join(', ')}`);
    }

    const result = await prisma.$transaction(async (tx) => {
        const existingItems = await tx.menuItem.findMany({
            where: {
                siteId,
            },
            select: {
                id: true,
                key: true,
                area: true,
            },
        });

        if (existingItems.length) {
            throw new Error('Menu items already exist for this site.');
        }

        await tx.menuItem.createMany({
            data: normalizedItems.map((item) => ({
                siteId,
                key: item.key,
                title: item.title,
                path: item.path,
                icon: item.icon,
                area: item.area,
                sortOrder: item.sortOrder,
                visible: item.visible,
            })),
        });

        return tx.menuItem.findMany({
            where: {
                siteId,
            },
            orderBy: [
                {
                    area: 'asc',
                },
                {
                    sortOrder: 'asc',
                },
            ],
        });
    });

    return {
        siteId,
        count: result.length,
        items: result,
    };
}
