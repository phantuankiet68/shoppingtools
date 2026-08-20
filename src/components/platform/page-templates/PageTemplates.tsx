'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './page-templates.module.css';
import PageTemplateModal, { type PageTemplateFormData } from './PageTemplateModal';

type WebsiteType = 'landing' | 'blog' | 'ecommerce' | 'booking' | 'lms';

type PageTemplateCategory = {
    id: string;
    name: string;
    websiteType: WebsiteType;
};

type PageTemplate = {
    id: string;
    categoryId: string;
    category: PageTemplateCategory;
    websiteType: WebsiteType;
    title: string;
    slug: string | null;
    path: string;
    blocks: unknown;
    previewImageUrl: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

type PageTemplatesResponse = {
    success: boolean;
    data?: {
        items: PageTemplate[];
        pagination: Pagination;
    };
    error?: string;
};

type CategoryResponse = {
    success: boolean;
    data?: {
        categories: PageTemplateCategory[];
        count: number;
    };
    error?: string;
};

const WEBSITE_TYPE_LABELS: Record<WebsiteType, string> = {
    landing: 'Landing',
    blog: 'Blog',
    ecommerce: 'Ecommerce',
    booking: 'Booking',
    lms: 'LMS',
};

const DEFAULT_PAGINATION: Pagination = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
};

export default function PageTemplates() {
    const [search, setSearch] = useState('');
    const [websiteType, setWebsiteType] = useState('ALL');
    const [category, setCategory] = useState('ALL');

    const [categories, setCategories] = useState<PageTemplateCategory[]>([]);
    const [templates, setTemplates] = useState<PageTemplate[]>([]);
    const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);

    const [selected, setSelected] = useState<string[]>([]);
    const [view, setView] = useState<'list' | 'grid'>('list');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const loadCategories = useCallback(async () => {
        try {
            const params = new URLSearchParams();

            if (websiteType !== 'ALL') {
                params.set('websiteType', websiteType);
            }

            const query = params.toString();
            const response = await fetch(
                `/api/platform/template-categories${query ? `?${query}` : ''}`,
                {
                    method: 'GET',
                    cache: 'no-store',
                },
            );

            const result = (await response.json()) as CategoryResponse;

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to load template categories.');
            }

            setCategories(result.data?.categories ?? []);
        } catch (error) {
            console.error('[PageTemplates] loadCategories', error);
            setCategories([]);
        }
    }, [websiteType]);

    const loadTemplates = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams({
                page: String(pagination.page),
                limit: String(pagination.limit),
            });

            if (search.trim()) params.set('search', search.trim());
            if (websiteType !== 'ALL') params.set('websiteType', websiteType);
            if (category !== 'ALL') params.set('categoryId', category);

            const response = await fetch(`/api/platform/page-templates?${params.toString()}`, {
                method: 'GET',
                cache: 'no-store',
            });

            const result = (await response.json()) as PageTemplatesResponse;

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to load page templates.');
            }

            setTemplates(result.data?.items ?? []);
            const nextPagination = result.data?.pagination;

            if (nextPagination) {
                setPagination((current) => ({
                    ...current,
                    ...nextPagination,
                }));
            }
        } catch (error) {
            console.error('[PageTemplates] loadTemplates', error);
            setTemplates([]);
            setError(error instanceof Error ? error.message : 'Failed to load page templates.');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, websiteType, category]);

    useEffect(() => {
        void loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        void loadTemplates();
    }, [loadTemplates]);

    useEffect(() => {
        setSelected((current) =>
            current.filter((id) => templates.some((template) => template.id === id)),
        );
    }, [templates]);

    const categoryOptions = useMemo(
        () =>
            [
                ['ALL', 'All Categories'],
                ...categories
                    .filter((item) => websiteType === 'ALL' || item.websiteType === websiteType)
                    .map((item) => [item.id, item.name]),
            ] as [string, string][],
        [categories, websiteType],
    );

    const toggleSelect = (id: string) => {
        setSelected((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
    };

    const toggleAll = () => {
        const visibleIds = templates.map((template) => template.id);
        const allSelected =
            visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

        setSelected((current) =>
            allSelected
                ? current.filter((id) => !visibleIds.includes(id))
                : [...new Set([...current, ...visibleIds])],
        );
    };

    const clearFilters = () => {
        setSearch('');
        setWebsiteType('ALL');
        setCategory('ALL');
        setPagination((current) => ({ ...current, page: 1 }));
    };

    const handleWebsiteTypeChange = (value: string) => {
        setWebsiteType(value);
        setCategory('ALL');
        setPagination((current) => ({ ...current, page: 1 }));
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPagination((current) => ({ ...current, page: 1 }));
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        setPagination((current) => ({ ...current, page: 1 }));
    };

    const handleLimitChange = (value: number) => {
        setPagination((current) => ({
            ...current,
            page: 1,
            limit: value,
        }));
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.totalPages || page === pagination.page) {
            return;
        }

        setPagination((current) => ({ ...current, page }));
    };

    const handleCreateTemplate = async (data: PageTemplateFormData) => {
        setError('');

        const response = await fetch('/api/platform/page-templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = (await response.json()) as {
            success: boolean;
            data?: PageTemplate;
            error?: string;
        };

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to create page template.');
        }

        setCreateModalOpen(false);
        setSelected([]);
        setPagination((current) => ({ ...current, page: 1 }));

        /*
         * loadTemplates is intentionally not called here.
         * Changing page to 1 is enough to trigger the effect when needed;
         * when already on page 1, the effect does not re-run, so refresh
         * explicitly in that case.
         */
        if (pagination.page === 1) {
            await loadTemplates();
        }
    };

    const firstResult = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

    const lastResult =
        pagination.total === 0 ? 0 : Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}>
                                <i className="bi bi-layout-text-window-reverse" />
                            </div>
                            <div>
                                <h1>Page Templates</h1>
                                <p className={styles.subtitle}>Manage reusable page templates.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <i className="bi bi-plus-lg" />
                        <span>New Template</span>
                    </button>
                </header>

                {error && (
                    <div className={styles.error}>
                        <i className="bi bi-exclamation-triangle" />
                        <span>{error}</span>
                        <button type="button" onClick={() => void loadTemplates()}>
                            Retry
                        </button>
                    </div>
                )}

                <section className={styles.workspace}>
                    <div className={styles.contentCard}>
                        <div className={styles.toolbar}>
                            <div className={styles.toolbarLeft}>
                                <div className={styles.search}>
                                    <i className="bi bi-search" />
                                    <input
                                        value={search}
                                        onChange={(event) => handleSearchChange(event.target.value)}
                                        placeholder="Search templates..."
                                    />
                                </div>
                            </div>

                            <div className={styles.toolbarRight}>
                                <div className={styles.viewSwitcher}>
                                    <button
                                        type="button"
                                        className={view === 'grid' ? styles.viewActive : ''}
                                        onClick={() => setView('grid')}
                                        aria-label="Grid view"
                                        aria-pressed={view === 'grid'}
                                    >
                                        <i className="bi bi-grid" />
                                    </button>
                                    <button
                                        type="button"
                                        className={view === 'list' ? styles.viewActive : ''}
                                        onClick={() => setView('list')}
                                        aria-label="List view"
                                        aria-pressed={view === 'list'}
                                    >
                                        <i className="bi bi-list-ul" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>
                                <i className="bi bi-arrow-repeat" />
                                <span>Loading page templates...</span>
                            </div>
                        ) : view === 'list' ? (
                            <TemplateTable
                                templates={templates}
                                selected={selected}
                                onToggle={toggleSelect}
                                onToggleAll={toggleAll}
                            />
                        ) : (
                            <TemplateGrid templates={templates} />
                        )}

                        <div className={styles.pagination}>
                            <span>
                                Showing <strong>{firstResult}</strong>–<strong>{lastResult}</strong>{' '}
                                of <strong>{pagination.total}</strong> results
                            </span>

                            <div className={styles.paginationControls}>
                                <select
                                    value={pagination.limit}
                                    onChange={(event) =>
                                        handleLimitChange(Number(event.target.value))
                                    }
                                    aria-label="Items per page"
                                >
                                    <option value="10">10 per page</option>
                                    <option value="20">20 per page</option>
                                    <option value="50">50 per page</option>
                                </select>

                                <button
                                    type="button"
                                    disabled={pagination.page <= 1}
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    aria-label="Previous page"
                                >
                                    <i className="bi bi-chevron-left" />
                                </button>

                                {buildPageNumbers(pagination.page, pagination.totalPages).map(
                                    (pageNumber, index) =>
                                        pageNumber === '...' ? (
                                            <span key={`ellipsis-${index}`}>...</span>
                                        ) : (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                className={
                                                    pageNumber === pagination.page
                                                        ? styles.pageActive
                                                        : ''
                                                }
                                                onClick={() => handlePageChange(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        ),
                                )}

                                <button
                                    type="button"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    aria-label="Next page"
                                >
                                    <i className="bi bi-chevron-right" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <aside className={styles.filters}>
                        <section className={styles.stats}>
                            <StatCard
                                icon="bi-grid-1x2"
                                label="Total Templates"
                                value={String(pagination.total)}
                                note=""
                                description="All page templates"
                                tone="purple"
                                trend="up"
                            />
                            <StatCard
                                icon="bi-folder2-open"
                                label="Categories"
                                value={String(categories.length)}
                                note=""
                                description="Available template categories"
                                tone="green"
                                trend="stable"
                            />
                            <StatCard
                                icon="bi-window-stack"
                                label="Website Types"
                                value={String(
                                    new Set(templates.map((template) => template.websiteType)).size,
                                )}
                                note=""
                                description="Types in the current page"
                                tone="yellow"
                                trend="neutral"
                            />
                        </section>

                        <div className={styles.filterHeader}>
                            <h2>Filters</h2>
                            <button type="button" onClick={clearFilters}>
                                Clear all
                            </button>
                        </div>

                        <FilterSelect
                            label="Website Type"
                            value={websiteType}
                            onChange={handleWebsiteTypeChange}
                            options={[
                                ['ALL', 'All Types'],
                                ['landing', 'Landing'],
                                ['blog', 'Blog'],
                                ['ecommerce', 'Ecommerce'],
                                ['booking', 'Booking'],
                                ['lms', 'LMS'],
                            ]}
                        />

                        <FilterSelect
                            label="Category"
                            value={category}
                            onChange={handleCategoryChange}
                            options={categoryOptions}
                        />
                    </aside>
                </section>
            </div>

            <PageTemplateModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateTemplate}
            />
        </main>
    );
}

function StatCard({
    icon,
    label,
    value,
    note,
    description,
    tone,
    trend,
}: {
    icon: string;
    label: string;
    value: string;
    note: string;
    description: string;
    tone: 'purple' | 'green' | 'yellow' | 'red';
    trend: 'up' | 'stable' | 'neutral';
}) {
    return (
        <article className={`${styles.statCard} ${styles[`stat${tone}`]}`}>
            <div className={styles.statTop}>
                <div className={styles.statLabelTop}>
                    <div className={`${styles.statIcon} ${styles[tone]}`}>
                        <i className={`bi ${icon}`} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>{label}</span>
                        <strong className={styles.statValue}>{value}</strong>
                    </div>
                </div>

                {note && (
                    <span className={`${styles.statTrend} ${styles[`trend${trend}`]}`}>
                        {trend === 'up' && <i className="bi bi-arrow-up-right" />}
                        {trend === 'stable' && <i className="bi bi-check2" />}
                        {trend === 'neutral' && <i className="bi bi-dash" />}
                        {note}
                    </span>
                )}
            </div>
            <span className={styles.statDescription}>{description}</span>
        </article>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: [string, string][];
}) {
    return (
        <div className={styles.filterGroup}>
            <label>{label}</label>
            <select value={value} onChange={(event) => onChange(event.target.value)}>
                {options.map(([optionValue, optionLabel]) => (
                    <option key={optionValue} value={optionValue}>
                        {optionLabel}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TemplateTable({
    templates,
    selected,
    onToggle,
    onToggleAll,
}: {
    templates: PageTemplate[];
    selected: string[];
    onToggle: (id: string) => void;
    onToggleAll: () => void;
}) {
    const allSelected =
        templates.length > 0 && templates.every((template) => selected.includes(template.id));

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.checkboxColumn}>
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={onToggleAll}
                                aria-label="Select all templates"
                            />
                        </th>
                        <th>Preview</th>
                        <th>Template</th>
                        <th>Category</th>
                        <th>Path</th>
                        <th>Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {templates.map((template) => (
                        <tr key={template.id}>
                            <td className={styles.checkboxColumn}>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(template.id)}
                                    onChange={() => onToggle(template.id)}
                                    aria-label={`Select ${template.title}`}
                                />
                            </td>

                            <td>
                                <div className={styles.preview}>
                                    {template.previewImageUrl ? (
                                        <img
                                            src={template.previewImageUrl}
                                            alt={template.title}
                                            onError={(event) => {
                                                event.currentTarget.style.display = 'none';
                                                event.currentTarget.parentElement?.classList.add(
                                                    styles.previewError,
                                                );
                                            }}
                                        />
                                    ) : (
                                        <div className={styles.previewEmpty}>
                                            <i className="bi bi-image" />
                                        </div>
                                    )}
                                </div>
                            </td>

                            <td>
                                <div className={styles.templateInfo}>
                                    <strong>{template.title}</strong>
                                    <span>{template.slug ? `/${template.slug}` : 'No slug'}</span>
                                </div>
                            </td>

                            <td>
                                <div className={styles.categoryInfo}>
                                    <strong>
                                        {WEBSITE_TYPE_LABELS[template.websiteType] ??
                                            template.websiteType}
                                    </strong>
                                    <span>{template.category.name}</span>
                                </div>
                            </td>

                            <td>
                                <span>{template.path}</span>
                            </td>

                            <td>
                                <div className={styles.updatedBy}>
                                    <div className={styles.avatar}>PT</div>
                                    <div>
                                        <strong>Platform</strong>
                                        <span>{formatDate(template.updatedAt)}</span>
                                    </div>
                                </div>
                            </td>

                            <td>
                                <div className={styles.actions}>
                                    <button type="button" aria-label="Preview">
                                        <i className="bi bi-eye" />
                                    </button>
                                    <button type="button" aria-label="Edit">
                                        <i className="bi bi-pencil" />
                                    </button>
                                    <button type="button" aria-label="More">
                                        <i className="bi bi-three-dots-vertical" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {!templates.length && (
                        <tr>
                            <td colSpan={7}>
                                <div className={styles.empty}>
                                    <i className="bi bi-layout-text-window-reverse" />
                                    <strong>No page templates found</strong>
                                    <span>Try changing your filters or search keywords.</span>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function TemplateGrid({ templates }: { templates: PageTemplate[] }) {
    return (
        <div className={styles.grid}>
            {templates.map((template) => (
                <article className={styles.gridCard} key={template.id}>
                    <div className={styles.gridPreview}>
                        {template.previewImageUrl ? (
                            <img src={template.previewImageUrl} alt={template.title} />
                        ) : (
                            <i className="bi bi-image" />
                        )}

                        <div className={styles.gridOverlay}>
                            <button type="button" aria-label="Preview">
                                <i className="bi bi-eye" />
                            </button>
                            <button type="button" aria-label="Edit">
                                <i className="bi bi-pencil" />
                            </button>
                        </div>
                    </div>

                    <div className={styles.gridContent}>
                        <div>
                            <strong>{template.title}</strong>
                            <span>{template.slug ? `/${template.slug}` : template.path}</span>
                        </div>

                        <div className={styles.gridMeta}>
                            <span>{template.category.name}</span>
                            <span>{template.path}</span>
                        </div>
                    </div>
                </article>
            ))}

            {!templates.length && (
                <div className={styles.empty}>
                    <i className="bi bi-layout-text-window-reverse" />
                    <strong>No page templates found</strong>
                    <span>Try changing your filters or search keywords.</span>
                </div>
            )}
        </div>
    );
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function buildPageNumbers(currentPage: number, totalPages: number): Array<number | '...'> {
    if (totalPages <= 1) return totalPages === 1 ? [1] : [];
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: Array<number | '...'> = [1];

    if (currentPage > 4) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (currentPage < totalPages - 3) pages.push('...');

    pages.push(totalPages);

    return pages;
}
