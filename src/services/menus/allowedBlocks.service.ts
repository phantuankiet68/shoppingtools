import type {
    BuilderMenuItem,
    InternalPage,
    MenuLocale,
} from '@/components/admin/menus/state/useMenuStore';

export type TabKey = 'home' | 'dashboard';

export type TranslateFn = (key: string) => string;

export function isTabbedConfig(value: unknown): value is {
    home: string[];
    dashboard?: string[];
} {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const config = value as {
        home?: unknown;
        dashboard?: unknown;
    };

    return (
        Array.isArray(config.home) &&
        (config.dashboard === undefined || Array.isArray(config.dashboard))
    );
}

/**
 * Resolve the tab that should be used
 * from the current menu set.
 */
export function forcedTabFromSet(currentSet: 'home' | 'v1'): TabKey {
    return currentSet === 'v1' ? 'dashboard' : 'home';
}

/**
 * Get the base block names from a template configuration.
 */
export function pickBaseNames(
    template:
        | string[]
        | {
              home: string[];
              dashboard?: string[];
          }
        | undefined,
    forcedTab: TabKey,
): string[] {
    if (!template) {
        return [];
    }

    if (Array.isArray(template)) {
        return template;
    }

    if (forcedTab === 'dashboard') {
        return template.dashboard ?? [];
    }

    return template.home ?? [];
}

/**
 * Normalize a name before comparing it.
 *
 * This removes:
 * - case differences
 * - emoji characters
 * - unnecessary whitespace
 */
export function normalizeNameForMatch(name: string): string {
    return String(name ?? '')
        .toLowerCase()
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
        .trim();
}

/**
 * Get the localized page path.
 */
function getPagePath(page: InternalPage, locale: MenuLocale): string {
    return page.paths?.[locale] ?? page.paths?.en ?? '/';
}

/**
 * Get the display name of an internal page.
 */
function getPageDisplayName(page: InternalPage, t: TranslateFn): string {
    return page.labelKey ? t(page.labelKey) : page.id;
}

/**
 * Get all possible names that can identify
 * an internal page.
 *
 * Matching supports:
 * - page.id
 * - page.labelKey
 * - translated label
 * - aliases
 */
function getPageCandidateNames(page: InternalPage, t: TranslateFn): string[] {
    const names = new Set<string>();

    const addName = (value: unknown) => {
        if (typeof value !== 'string') {
            return;
        }

        const normalized = normalizeNameForMatch(value);

        if (normalized) {
            names.add(normalized);
        }
    };

    addName(page.id);

    if (page.labelKey) {
        addName(page.labelKey);
        addName(t(page.labelKey));
    }

    for (const alias of page.aliases ?? []) {
        addName(alias);
    }

    return Array.from(names);
}

/**
 * Find an internal page by:
 * - id
 * - label key
 * - translated label
 * - alias
 */
export function findPageByName(
    internalPages: InternalPage[],
    name: string,
    t: TranslateFn,
): InternalPage | undefined {
    if (!Array.isArray(internalPages) || !name) {
        return undefined;
    }

    const needle = normalizeNameForMatch(name);

    if (!needle) {
        return undefined;
    }

    return internalPages.find((page) => {
        const candidates = getPageCandidateNames(page, t);

        return candidates.includes(needle);
    });
}

/**
 * Create a new menu item from a block/page name.
 */
export function makeNewMenuItem(params: {
    name: string;
    internalPages: InternalPage[];
    locale: MenuLocale;
    t: TranslateFn;
}): BuilderMenuItem {
    const page = findPageByName(params.internalPages, params.name, params.t);

    return {
        id: `s_${Math.random().toString(36).slice(2, 9)}`,
        title: page ? getPageDisplayName(page, params.t) : params.name,
        icon: page?.icon ?? '',
        visible: true,
        linkType: 'internal',
        externalUrl: '',
        internalPageId: page?.id ?? null,
        rawPath: page ? getPagePath(page, params.locale) : '',
        schedules: [],
        children: [],
    };
}

/**
 * Create the drag-and-drop payload
 * for a new menu item.
 */
export function makeDragPayload(
    internalPages: InternalPage[],
    name: string,
    locale: MenuLocale,
    t: TranslateFn,
) {
    const page = findPageByName(internalPages, name, t);

    if (page) {
        return {
            type: 'new' as const,
            name: getPageDisplayName(page, t),
            linkType: 'internal' as const,
            internalPageId: page.id,
            rawPath: getPagePath(page, locale),
        };
    }

    return {
        type: 'new' as const,
        name,
        linkType: 'internal' as const,
        internalPageId: null,
        rawPath: '',
    };
}
