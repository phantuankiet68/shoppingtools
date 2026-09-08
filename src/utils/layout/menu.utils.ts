import type { MenuArea } from '@/generated/prisma';
import type { ApiMenuItem } from '@/services/layout/menu.service';
import { normalize, stripLocale } from './path.utils';

export type Item = {
    area: MenuArea;
    id: string;
    key: string;
    title: string;
    icon: string;
    path: string | null;
    parentId: string | null;
    children: Item[];
};

export function buildTree(rows: ApiMenuItem[] = []): Item[] {
    const visibleRows = rows.filter((row) => row.visible);
    const map = new Map<string, Item>();

    for (const row of visibleRows) {
        map.set(row.id, {
            area: row.area,
            id: row.id,
            key: row.id,
            title: row.title,
            icon: row.icon || 'bi bi-dot',
            path: normalize(row.path),
            parentId: row.parentId ?? null,
            children: [],
        });
    }

    const roots: Item[] = [];

    for (const row of visibleRows) {
        const item = map.get(row.id);

        if (!item) {
            continue;
        }

        if (row.parentId) {
            const parent = map.get(row.parentId);

            if (parent) {
                parent.children.push(item);
                continue;
            }
        }

        roots.push(item);
    }

    const sortMap = new Map(visibleRows.map((row) => [row.id, row.sortOrder]));

    const sortRecursive = (items: Item[]) => {
        items.sort((a, b) => {
            const sortA = sortMap.get(a.id) ?? 0;
            const sortB = sortMap.get(b.id) ?? 0;

            if (sortA !== sortB) {
                return sortA - sortB;
            }

            return a.title.localeCompare(b.title);
        });

        for (const item of items) {
            sortRecursive(item.children);
        }
    };

    sortRecursive(roots);

    return roots;
}

type MatchResult = {
    hit: Item;
    trail: string[];
    np: string;
} | null;

export function bestMatchWithTrail(items: Item[], currentNoLocale: string): MatchResult {
    const stack: Item[] = [];
    let best: MatchResult = null;

    function dfs(nodes: Item[]) {
        for (const node of nodes) {
            stack.push(node);

            const np = stripLocale(node.path || '');

            const matched =
                !!np &&
                (currentNoLocale === np ||
                    currentNoLocale.startsWith(`${np}/`) ||
                    (np === '/' && currentNoLocale === '/'));

            if (matched) {
                const trail = stack.slice(0, -1).map((item) => item.key);

                if (!best || np.length > best.np.length) {
                    best = {
                        hit: node,
                        trail,
                        np,
                    };
                }
            }

            if (node.children.length) {
                dfs(node.children);
            }

            stack.pop();
        }
    }

    dfs(items);

    return best;
}

export const isAccountItem = (title: string) =>
    /(account|profile|setting|logout|sign\s*out|chat)/i.test(title);

export type SectionKey = 'overview' | 'marketing' | 'content' | 'account';

export const SECTION_TITLES: Record<SectionKey, string> = {
    overview: 'OVERVIEW',
    marketing: 'MARKETING',
    content: 'CONTENT',
    account: 'ACCOUNT',
};

export const SECTION_ORDER: SectionKey[] = ['overview', 'marketing', 'content', 'account'];

export function sectionOfTopItem(title: string): SectionKey {
    const value = title.toLowerCase();

    if (isAccountItem(title)) {
        return 'account';
    }

    if (/(marketing|campaigns|discounts|coupons)/i.test(value)) {
        return 'marketing';
    }

    if (/(content|pages|media|blog|articles)/i.test(value)) {
        return 'content';
    }

    return 'overview';
}
