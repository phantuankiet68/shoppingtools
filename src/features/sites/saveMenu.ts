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
    parentKey?: string | null;
};

type SaveMenuInput = {
    siteId: string;
    items: MenuItemInput[];
};

export async function saveMenu({ siteId, items }: SaveMenuInput) {
    if (!items.length) {
        return {
            siteId,
            count: 0,
            items: [],
        };
    }

    const keys = items.map((item) => item.key);
    const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);

    if (duplicateKeys.length) {
        throw new Error(`Duplicate menu keys: ${[...new Set(duplicateKeys)].join(', ')}`);
    }

    const result = await prisma.$transaction(async (tx) => {
        const existingItems = await tx.menuItem.findMany({
            where: {
                siteId,
            },
            select: {
                key: true,
            },
        });

        if (existingItems.length) {
            throw new Error('Menu items already exist for this site.');
        }

        const keyToId = new Map<string, string>();
        const pending = [...items];

        while (pending.length) {
            const ready = pending.filter((item) => !item.parentKey || keyToId.has(item.parentKey));

            if (!ready.length) {
                const unresolved = pending
                    .map((item) => `${item.key} → ${item.parentKey}`)
                    .join(', ');

                throw new Error(`Unable to resolve menu hierarchy: ${unresolved}`);
            }

            for (const item of ready) {
                const created = await tx.menuItem.create({
                    data: {
                        siteId,
                        key: item.key,
                        title: item.title,
                        path: item.path ?? null,
                        icon: item.icon ?? null,
                        area: item.area,
                        sortOrder: item.sortOrder ?? 0,
                        visible: item.visible ?? true,
                        parentId: item.parentKey ? (keyToId.get(item.parentKey) ?? null) : null,
                    },
                });

                keyToId.set(item.key, created.id);

                const index = pending.indexOf(item);

                if (index !== -1) {
                    pending.splice(index, 1);
                }
            }
        }

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
