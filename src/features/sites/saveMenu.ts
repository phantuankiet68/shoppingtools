import { MenuArea } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

type MenuItemInput = {
    templateId: string;
    parentTemplateId?: string | null;
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
        templateId: item.templateId,
        parentTemplateId: item.parentTemplateId ?? null,
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
            !item.templateId ||
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

    const templateIds = new Set(normalizedItems.map((item) => item.templateId));

    for (const item of normalizedItems) {
        if (item.parentTemplateId && !templateIds.has(item.parentTemplateId)) {
            throw new Error(`Parent template not found for menu: ${item.key}`);
        }

        if (item.parentTemplateId === item.templateId) {
            throw new Error(`Menu cannot be its own parent: ${item.key}`);
        }
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

        const templateToItemId = new Map<string, string>();
        const remaining = [...normalizedItems];
        const createdItems = [];

        while (remaining.length) {
            const readyItems = remaining.filter(
                (item) => !item.parentTemplateId || templateToItemId.has(item.parentTemplateId),
            );

            if (!readyItems.length) {
                throw new Error(
                    'Invalid menu hierarchy: circular or unresolved parent relationship.',
                );
            }

            for (const item of readyItems) {
                const parentId = item.parentTemplateId
                    ? templateToItemId.get(item.parentTemplateId)
                    : null;

                if (item.parentTemplateId && !parentId) {
                    throw new Error(`Unable to resolve parent menu: ${item.key}`);
                }

                const created = await tx.menuItem.create({
                    data: {
                        siteId,
                        parentId: parentId ?? null,
                        key: item.key,
                        title: item.title,
                        path: item.path,
                        icon: item.icon,
                        area: item.area,
                        sortOrder: item.sortOrder,
                        visible: item.visible,
                    },
                });

                templateToItemId.set(item.templateId, created.id);
                createdItems.push(created);

                const index = remaining.indexOf(item);

                if (index !== -1) {
                    remaining.splice(index, 1);
                }
            }
        }

        return createdItems;
    });

    return {
        siteId,
        count: result.length,
        items: result,
    };
}
