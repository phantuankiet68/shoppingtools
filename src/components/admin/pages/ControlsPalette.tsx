'use client';

import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { REGISTRY } from '@/lib/ui-builder/registry';
import type { RegItem } from '@/lib/ui-builder/types';
import { useControlsPaletteStore } from '@/store/pages/add/controlsPalette.store';
import styles from '@/styles/admin/pages/navigators.module.css';
import React from 'react';

type Props = {
    search: string;
    setSearch: (v: string) => void;
    onDragStart: (kind: string) => (e: React.DragEvent) => void;
    registry?: RegItem[];
    templateGroup?: string | null;
    tier?: string | null;
    businessType?: string | null;
    websiteType?: string | null;
    path?: string | null;
};

type TemplateApiItem = {
    id: string;
    code?: string;

    label: string;
    kind?: string;

    category?: {
        id: string;
        name: string;
        minTier: string;
        description?: string | null;
    } | null;

    children?: string[];

    previewImageUrl?: string | null;
};

type BuilderTemplate = {
    id: string;

    label: string;

    groups: TemplateGroupHome[];

    categoryName: string | null;

    minTier: string | null;

    kind: string | null;

    children: string[];

    previewImageUrl: string | null;
};

type TemplateGroupHome =
    | 'Topbar'
    | 'Header'
    | 'Footer'
    | 'Sidebar'
    | 'Hero'
    | 'Showcase'
    | 'Benefit'
    | 'Pricing'
    | 'Portfolio'
    | 'Testimonial'
    | 'Contact'
    | 'Service'
    | 'PricingPage'
    | 'Project'
    | 'About'
    | 'Blog'
    | 'SignIn'
    | 'Profile'
    | 'ChangePassword';

function normalizeText(value?: string | null) {
    return (value || '').trim().toLowerCase();
}

function inferGroupFromKind(kind?: string | null): TemplateGroupHome | null {
    const normalized = normalizeText(kind);

    const normalizedKind = normalized.replace(/[_\s]+/g, '-');

    if (normalizedKind.includes('pricing-page') || normalizedKind.includes('pricingpage')) {
        return 'PricingPage';
    }

    if (normalizedKind.includes('change-password') || normalizedKind.includes('changepassword')) {
        return 'ChangePassword';
    }

    if (normalizedKind.startsWith('topbar')) return 'Topbar';
    if (normalizedKind.startsWith('header')) return 'Header';
    if (normalizedKind.startsWith('footer')) return 'Footer';
    if (normalizedKind.startsWith('sidebar')) return 'Sidebar';

    if (normalizedKind.startsWith('hero')) return 'Hero';
    if (normalizedKind.startsWith('showcase')) return 'Showcase';
    if (normalizedKind.startsWith('benefit')) return 'Benefit';
    if (normalizedKind.startsWith('pricing')) return 'Pricing';
    if (normalizedKind.startsWith('portfolio')) return 'Portfolio';
    if (normalizedKind.startsWith('testimonial')) return 'Testimonial';
    if (normalizedKind.startsWith('contact')) return 'Contact';
    if (normalizedKind.startsWith('service')) return 'Service';
    if (normalizedKind.startsWith('project')) return 'Project';
    if (normalizedKind.startsWith('about')) return 'About';
    if (normalizedKind.startsWith('blog')) return 'Blog';
    if (normalizedKind.startsWith('sign-in')) return 'SignIn';
    if (normalizedKind.startsWith('profile')) return 'Profile';
    return null;
}

const TEMPLATE_GROUPS_BY_PATH: Record<string, TemplateGroupHome[]> = {
    '/': ['Hero', 'Showcase', 'Benefit', 'Pricing', 'Portfolio', 'Testimonial', 'Contact'],

    '/home': ['Hero', 'Showcase', 'Benefit', 'Pricing', 'Portfolio', 'Testimonial', 'Contact'],

    '/service': ['Service', 'Contact'],
    '/pricing': ['PricingPage'],
    '/project': ['Project'],
    '/about': ['About', 'Contact'],
    '/blog': ['Blog', 'Contact'],
    '/sign-in': ['SignIn'],

    '/contact': ['Contact'],

    '/profile': ['Profile'],
    '/change-password': ['ChangePassword'],

    '/topbar': ['Topbar'],
    '/header': ['Header'],
    '/footer': ['Footer'],
    '/sidebar': ['Sidebar'],
};

function normalizePath(value?: string | null) {
    const normalized = (value || '').trim().toLowerCase();

    if (!normalized || normalized === '/' || normalized === '/home') {
        return '/';
    }

    return `/${normalized.replace(/^\/+|\/+$/g, '')}`;
}
function filterTemplates({
    templates,
    query,
    registryByKind,
}: {
    templates: BuilderTemplate[];
    query: string;
    registryByKind: Map<string, RegItem>;
}) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) return templates;

    return templates
        .map((tpl) => {
            const labelMatched = normalizeText(tpl.label).includes(normalizedQuery);

            const categoryMatched = normalizeText(tpl.categoryName).includes(normalizedQuery);

            const kindMatched = normalizeText(tpl.kind).includes(normalizedQuery);

            const children = tpl.children.filter((kind) => {
                const reg = registryByKind.get(kind);
                const regLabel = normalizeText(reg?.label ?? kind);
                return (
                    regLabel.includes(normalizedQuery) ||
                    normalizeText(kind).includes(normalizedQuery)
                );
            });

            if (labelMatched || categoryMatched || kindMatched) {
                return {
                    ...tpl,
                    children: tpl.children,
                };
            }

            return {
                ...tpl,
                children,
            };
        })
        .filter((tpl) => tpl.children.length > 0);
}

export default function ControlsPalette({
    search,
    setSearch,
    onDragStart,
    registry,
    templateGroup,
    tier,
    businessType,
    websiteType,
    path,
}: Props) {
    const sourceRegistry = React.useMemo(() => registry ?? REGISTRY, [registry]);

    const registryByKind = React.useMemo(() => {
        const map = new Map<string, RegItem>();
        for (const item of sourceRegistry) {
            map.set(item.kind, item);
        }
        return map;
    }, [sourceRegistry]);

    const [templates, setTemplates] = React.useState<BuilderTemplate[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [loadError, setLoadError] = React.useState<string | null>(null);

    const { currentSite, currentWorkspace } = useAdminAuth();

    const q = search.trim().toLowerCase();
    const normalizedPath = React.useMemo(() => {
        return normalizePath(path);
    }, [path]);

    const allowedTemplateGroups = React.useMemo<TemplateGroupHome[]>(() => {
        return TEMPLATE_GROUPS_BY_PATH[normalizedPath] ?? [];
    }, [normalizedPath]);

    React.useEffect(() => {
        let cancelled = false;

        async function fetchTemplates() {
            try {
                setLoading(true);
                setLoadError(null);

                const params = new URLSearchParams();

                if (tier && tier.trim()) {
                    params.set('tier', tier.trim().toUpperCase());
                }

                if (businessType?.trim()) {
                    params.set('businessType', businessType.trim());
                }

                const queryString = params.toString();
                const endpoint = queryString
                    ? `/api/admin/templates/template-list?${queryString}`
                    : '/api/admin/templates/template-list';

                const response = await fetch(endpoint, {
                    method: 'GET',
                    cache: 'no-store',
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch templates: ${response.status}`);
                }

                const json = (await response.json()) as {
                    success?: boolean;
                    data?: TemplateApiItem[];
                    message?: string;
                };

                if (!json?.success) {
                    throw new Error(json?.message || 'Không thể tải danh sách template');
                }

                const rawTemplates = Array.isArray(json?.data) ? json.data : [];

                const mappedTemplates: BuilderTemplate[] = rawTemplates
                    .map((item) => {
                        const children = Array.isArray(item.children)
                            ? item.children.filter(
                                  (kind): kind is string =>
                                      typeof kind === 'string' && kind.trim().length > 0,
                              )
                            : [];

                        const primaryKind = item.kind ?? children[0] ?? null;

                        const groups = Array.from(
                            new Set(
                                children
                                    .map((kind) => inferGroupFromKind(kind))
                                    .filter((group): group is TemplateGroupHome => group !== null),
                            ),
                        );

                        return {
                            id: item.code || item.id,

                            label: item.label,

                            groups,

                            categoryName: item.category?.name ?? null,

                            minTier: item.category?.minTier ?? null,

                            kind: primaryKind,

                            children,

                            previewImageUrl: item.previewImageUrl ?? null,
                        };
                    })
                    .filter((item) => item.children.length > 0);

                if (!cancelled) {
                    setTemplates(mappedTemplates);
                }
            } catch (error) {
                if (!cancelled) {
                    const message =
                        error instanceof Error ? error.message : 'Không thể tải danh sách template';
                    setLoadError(message);
                    setTemplates([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchTemplates();

        return () => {
            cancelled = true;
        };
    }, [tier, businessType]);

    const templatesFiltered = React.useMemo(() => {
        const tierRank = {
            BASIC: 1,
            NORMAL: 2,
            PRO: 3,
        };

        const baseTemplates = templates.filter((tpl) => {
            const groupMatched = tpl.groups.some((group) => allowedTemplateGroups.includes(group));

            const categoryMatched =
                normalizeText(tpl.categoryName) === 'all' ||
                normalizeText(tpl.categoryName) === normalizeText(currentSite?.category);

            const templateTier = tierRank[(tpl.minTier ?? 'BASIC') as keyof typeof tierRank] ?? 1;

            const workspaceTierValue =
                tierRank[(currentWorkspace?.tier ?? 'BASIC') as keyof typeof tierRank] ?? 1;

            const tierMatched = workspaceTierValue >= templateTier;

            return groupMatched && categoryMatched && tierMatched;
        });

        const pathTemplates = baseTemplates
            .map((tpl) => ({
                ...tpl,

                children: tpl.children.filter((kind) => {
                    const group = inferGroupFromKind(kind);

                    return group !== null && allowedTemplateGroups.includes(group);
                }),
            }))
            .filter((tpl) => tpl.children.length > 0);

        const raw = filterTemplates({
            templates: pathTemplates,
            query: q,
            registryByKind,
        });
        return raw.map((tpl) => ({
            ...tpl,
            children: Array.from(new Set(tpl.children)),
        }));
    }, [
        allowedTemplateGroups,
        templates,
        q,
        registryByKind,
        currentSite?.category,
        currentWorkspace?.tier,
    ]);

    const templateIds = React.useMemo(
        () => templatesFiltered.map((t) => t.id),
        [templatesFiltered],
    );

    const { openTpl, setOpenTpl, expandAll, collapseAll } = useControlsPaletteStore(templateIds);

    React.useEffect(() => {
        if (templatesFiltered.length > 0) {
            setOpenTpl(new Set(templatesFiltered.map((t) => t.id)));
            return;
        }

        setOpenTpl(new Set());
    }, [templatesFiltered, setOpenTpl]);

    const expandAllTemplates = React.useCallback(
        () => expandAll(templatesFiltered.map((t) => t.id)),
        [expandAll, templatesFiltered],
    );

    return (
        <div className={styles.wrap}>
            <div className={styles.searchBox}>
                <i className={`bi bi-search ${styles.searchIcon}`} />
                <input
                    className={styles.searchInput}
                    placeholder="Search elements…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className={styles.templatesWrapper}>
                <div className={styles.templatesBox}>
                    {loading && (
                        <div className={styles.emptyState}>Đang tải danh sách template...</div>
                    )}

                    {!loading && loadError && (
                        <div className={styles.emptyState}>
                            <i className="bi bi-exclamation-triangle me-1" />
                            {loadError}
                        </div>
                    )}

                    {!loading && !loadError && (
                        <ul className={styles.templatesList}>
                            {templatesFiltered.map((tpl) => (
                                <li key={tpl.id} className={styles.tplItem}>
                                    {openTpl.has(tpl.id) && (
                                        <ul className={styles.tplChildren}>
                                            {tpl.children.map((kind, index) => {
                                                const reg = registryByKind.get(kind);
                                                const label = reg?.label ?? kind;

                                                return (
                                                    <li
                                                        key={`${tpl.id}:${kind}:${index}`}
                                                        className={styles.item}
                                                        draggable
                                                        onDragStart={onDragStart(kind)}
                                                        title={`Drag to canvas: ${label}`}
                                                        role="treeitem"
                                                        aria-selected={false}
                                                    >
                                                        {tpl.previewImageUrl && (
                                                            <div
                                                                className={styles.tplPreviewWrapper}
                                                            >
                                                                <div
                                                                    className={styles.tplPreviewBox}
                                                                >
                                                                    <img
                                                                        src={tpl.previewImageUrl}
                                                                        alt={`${tpl.label} preview`}
                                                                        className={
                                                                            styles.tplPreviewImage
                                                                        }
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="d-flex ju-content-between w-100">
                                                            <div className={styles.itemLeft}>
                                                                <i className="bi bi-box" />
                                                                <span className={styles.itemLabel}>
                                                                    {label}
                                                                </span>
                                                            </div>
                                                            <div className={styles.itemRight}>
                                                                <i className="bi bi-arrow-right-circle" />
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    {!loading && !loadError && templatesFiltered.length === 0 && (
                        <div className={styles.emptyState}>
                            <i className="bi bi-search me-1" />
                            Không có template nào khớp điều kiện hiện tại
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
