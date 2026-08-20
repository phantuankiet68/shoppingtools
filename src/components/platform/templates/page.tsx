'use client';

import NewGroupModal from '@/components/platform/templates/NewGroupModal';
import NewTemplateModal from '@/components/platform/templates/NewTemplateModal';
import styles from '@/styles/platform/templates/page.module.css';
import { useEffect, useMemo, useState } from 'react';

import type {
    AccessTier,
    TemplateCatalog,
    TemplateCategory,
    TemplateStatus,
} from '@/features/template/types';

const PAGE_SIZE = 8;

const statusOptions: TemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const tierOptions: AccessTier[] = ['BASIC', 'NORMAL', 'PRO'];

type TemplateListResponse = {
    success: boolean;
    data: TemplateCatalog[];
    meta?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    message?: string;
};

type TemplateDetailResponse = {
    success: boolean;
    data: TemplateCatalog;
    message?: string;
};

type TemplateCategoryWithCount = TemplateCategory & {
    _count?: {
        templates: number;
        pageTemplates: number;
    };
};

type GroupListResponse = {
    success: boolean;
    data: TemplateCategoryWithCount[];
    meta?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    message?: string;
};

type TemplateFilters = {
    keyword: string;
    categoryId: string;
    status: string;
    tier: string;
    publicOnly: boolean;
};

const DEFAULT_FILTERS: TemplateFilters = {
    keyword: '',
    categoryId: 'all',
    status: 'all',
    tier: 'all',
    publicOnly: false,
};

function formatDate(dateString: string) {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(dateString));
}

function getStatusLabel(status: TemplateStatus) {
    return (
        {
            PUBLISHED: 'Published',
            DRAFT: 'Draft',
            ARCHIVED: 'Archived',
        }[status] ?? status
    );
}

function getTierTone(tier: AccessTier) {
    return {
        BASIC: styles.tierBasic,
        NORMAL: styles.tierNormal,
        PRO: styles.tierPro,
    }[tier];
}

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<TemplateCatalog[]>([]);
    const [categories, setCategories] = useState<TemplateCategoryWithCount[]>([]);

    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingTemplateDetail, setLoadingTemplateDetail] = useState(false);

    const [filters, setFilters] = useState<TemplateFilters>(DEFAULT_FILTERS);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [openNewTemplate, setOpenNewTemplate] = useState(false);
    const [openNewGroup, setOpenNewGroup] = useState(false);

    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateCatalog | null>(null);

    const updateFilter = <K extends keyof TemplateFilters>(key: K, value: TemplateFilters[K]) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));

        setPage(1);
    };

    /**
     * Fetch template categories
     */
    const fetchTemplateCategories = async () => {
        try {
            setLoadingGroups(true);

            const response = await fetch('/api/platform/templates/template-categories', {
                cache: 'no-store',
            });

            const result: GroupListResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to fetch categories');
            }

            setCategories(result.data ?? []);
        } catch (error) {
            console.error('[Templates] Fetch categories failed:', error);
            setCategories([]);
        } finally {
            setLoadingGroups(false);
        }
    };

    /**
     * Fetch templates
     *
     * Filtering, sorting and pagination are handled by API.
     */
    const fetchTemplates = async () => {
        try {
            setLoadingTemplates(true);

            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(PAGE_SIZE),
            });

            const keyword = filters.keyword.trim();

            if (keyword) {
                params.set('keyword', keyword);
            }

            if (filters.categoryId !== 'all') {
                params.set('categoryId', filters.categoryId);
            }

            if (filters.status !== 'all') {
                params.set('status', filters.status);
            }

            if (filters.tier !== 'all') {
                params.set('tier', filters.tier);
            }

            if (filters.publicOnly) {
                params.set('isPublic', 'true');
            }

            const response = await fetch(`/api/platform/templates?${params.toString()}`, {
                cache: 'no-store',
            });

            const result: TemplateListResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to fetch templates');
            }

            setTemplates(result.data ?? []);
            setTotalPages(result.meta?.totalPages ?? 1);
            setTotalItems(result.meta?.total ?? 0);
        } catch (error) {
            console.error('[Templates] Fetch templates failed:', error);

            setTemplates([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setLoadingTemplates(false);
        }
    };

    /**
     * Fetch template detail for edit
     */
    const fetchTemplateDetail = async (id: string) => {
        try {
            setLoadingTemplateDetail(true);

            const response = await fetch(`/api/platform/templates/${id}`, {
                cache: 'no-store',
            });

            const result: TemplateDetailResponse = await response.json();

            if (!response.ok || !result.success || !result.data) {
                throw new Error(result.message || 'Không lấy được thông tin template');
            }

            setSelectedTemplate(result.data);
            setModalMode('edit');
            setOpenNewTemplate(true);
        } catch (error) {
            console.error('[Templates] Fetch detail failed:', error);
            alert(error instanceof Error ? error.message : 'Có lỗi khi lấy thông tin template');
        } finally {
            setLoadingTemplateDetail(false);
        }
    };

    const handleOpenCreateTemplate = () => {
        setModalMode('create');
        setSelectedTemplate(null);
        setOpenNewTemplate(true);
    };

    const handleCloseTemplateModal = () => {
        setOpenNewTemplate(false);
        setModalMode('create');
        setSelectedTemplate(null);
    };

    /**
     * Initial categories
     */
    useEffect(() => {
        void fetchTemplateCategories();
    }, []);

    /**
     * Fetch templates whenever page/filter changes.
     *
     * Search is debounced to avoid an API request
     * for every single keystroke.
     */
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchTemplates();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [
        page,
        filters.keyword,
        filters.categoryId,
        filters.status,
        filters.tier,
        filters.publicOnly,
    ]);

    const categoryMap = useMemo(
        () =>
            Object.fromEntries(categories.map((category) => [category.id, category])) as Record<
                string,
                TemplateCategoryWithCount
            >,
        [categories],
    );

    /**
     * Stats
     *
     * totalTemplates uses server total.
     * Status/public counts are based on the currently loaded page.
     *
     * If you want global status statistics,
     * expose stats from the API instead.
     */
    const stats = {
        totalTemplates: totalItems,
        totalGroups: categories.length,
        published: templates.filter((item) => item.status === 'PUBLISHED').length,
        drafts: templates.filter((item) => item.status === 'DRAFT').length,
        archived: templates.filter((item) => item.status === 'ARCHIVED').length,
        publicCount: templates.filter((item) => item.isPublic).length,
    };

    return (
        <div className={styles.page}>
            <div className={styles.bgGlowOne} />
            <div className={styles.bgGlowTwo} />

            <header className={styles.hero}>
                <div className={styles.heroActions}>
                    <button
                        className={styles.ghostButton}
                        onClick={() => setOpenNewGroup(true)}
                        type="button"
                    >
                        <i className="bi bi-grid-3x3-gap" />
                        New Group
                    </button>

                    <button
                        className={styles.primaryButton}
                        onClick={handleOpenCreateTemplate}
                        type="button"
                    >
                        <i className="bi bi-plus-lg" />
                        New Template
                    </button>
                </div>

                <div className={styles.filterBar}>
                    <div className={styles.searchBox}>
                        <i className={`bi bi-search ${styles.searchIcon}`} />

                        <input
                            className={styles.searchInput}
                            value={filters.keyword}
                            onChange={(event) => updateFilter('keyword', event.target.value)}
                            placeholder="Search by name, code, kind..."
                        />
                    </div>

                    <div className={styles.filterActions}>
                        <select
                            className={styles.select}
                            value={filters.status}
                            onChange={(event) => updateFilter('status', event.target.value)}
                        >
                            <option value="all">All Status</option>

                            {statusOptions.map((item) => (
                                <option key={item} value={item}>
                                    {getStatusLabel(item)}
                                </option>
                            ))}
                        </select>

                        <select
                            className={styles.select}
                            value={filters.tier}
                            onChange={(event) => updateFilter('tier', event.target.value)}
                        >
                            <option value="all">All Tiers</option>

                            {tierOptions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <label className={styles.checkWrap}>
                            <input
                                type="checkbox"
                                checked={filters.publicOnly}
                                onChange={(event) =>
                                    updateFilter('publicOnly', event.target.checked)
                                }
                            />

                            <span>Public only</span>
                        </label>
                    </div>
                </div>
            </header>

            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconIndigo}`}>
                        <i className="bi bi-layout-text-window-reverse" />
                    </div>

                    <div>
                        <div className={styles.statValue}>{stats.totalTemplates}</div>

                        <div className={styles.statLabel}>Templates</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconSky}`}>
                        <i className="bi bi-collection" />
                    </div>

                    <div>
                        <div className={styles.statValue}>{stats.totalGroups}</div>

                        <div className={styles.statLabel}>Groups</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <i className="bi bi-check2-circle" />
                    </div>

                    <div>
                        <div className={styles.statValue}>{stats.published}</div>

                        <div className={styles.statLabel}>Published</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
                        <i className="bi bi-pencil-square" />
                    </div>

                    <div>
                        <div className={styles.statValue}>{stats.drafts}</div>

                        <div className={styles.statLabel}>Drafts</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconSlate}`}>
                        <i className="bi bi-archive" />
                    </div>

                    <div>
                        <div className={styles.statValue}>{stats.archived}</div>

                        <div className={styles.statLabel}>Archived</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconRose}`}>
                        <i className="bi bi-globe2" />
                    </div>

                    <div>
                        <div className={styles.statValue}>{stats.publicCount}</div>

                        <div className={styles.statLabel}>Public</div>
                    </div>
                </div>
            </section>

            <section className={styles.workspace}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarCard}>
                        <div className={styles.sidebarHead}>
                            <div>
                                <div className={styles.sidebarTitle}>Template Groups</div>
                            </div>

                            <button className={styles.moreButton} type="button">
                                <i className="bi bi-three-dots" />
                            </button>
                        </div>

                        <div className={styles.groupList}>
                            <button
                                className={`${styles.groupItem} ${
                                    filters.categoryId === 'all' ? styles.groupItemActive : ''
                                }`}
                                onClick={() => updateFilter('categoryId', 'all')}
                                type="button"
                            >
                                <div className={styles.groupItemMain}>
                                    <div className={styles.groupItemIcon}>
                                        <i className="bi bi-stars" />
                                    </div>

                                    <div>
                                        <div className={styles.groupName}>All Groups</div>

                                        <div className={styles.groupMeta}>
                                            Hiển thị toàn bộ template
                                        </div>
                                    </div>
                                </div>

                                <span className={styles.groupCount}>{totalItems}</span>
                            </button>

                            {loadingGroups ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyTitle}>Đang tải categories...</div>
                                </div>
                            ) : (
                                categories.map((group) => (
                                    <button
                                        key={group.id}
                                        className={`${styles.groupItem} ${
                                            filters.categoryId === group.id
                                                ? styles.groupItemActive
                                                : ''
                                        }`}
                                        onClick={() => updateFilter('categoryId', group.id)}
                                        type="button"
                                    >
                                        <div className={styles.groupItemMain}>
                                            <div className={styles.groupItemIcon}>
                                                <i className="bi bi-folder2-open" />
                                            </div>

                                            <div>
                                                <div className={styles.groupName}>{group.name}</div>

                                                <div className={styles.groupMeta}>
                                                    {group.minTier}
                                                </div>
                                            </div>
                                        </div>

                                        <span className={styles.groupCount}>
                                            {group._count?.templates ?? 0}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                <main className={styles.main}>
                    <div className={styles.panel}>
                        <div className={styles.tableScroll}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Template</th>
                                        <th>Group</th>
                                        <th>Status</th>
                                        <th>Access</th>
                                        <th>Visibility</th>
                                        <th>Updated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loadingTemplates ? (
                                        <tr>
                                            <td colSpan={7}>
                                                <div className={styles.emptyState}>
                                                    <div className={styles.emptyTitle}>
                                                        Đang tải template...
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : templates.length === 0 ? (
                                        <tr>
                                            <td colSpan={7}>
                                                <div className={styles.emptyState}>
                                                    <div className={styles.emptyIcon}>
                                                        <i className="bi bi-inboxes" />
                                                    </div>

                                                    <div className={styles.emptyTitle}>
                                                        Không có template phù hợp
                                                    </div>

                                                    <div className={styles.emptyText}>
                                                        Hãy thử thay đổi filter hoặc từ khóa tìm
                                                        kiếm.
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        templates.map((template) => {
                                            const category =
                                                categoryMap[template.categoryId] ??
                                                template.category;

                                            return (
                                                <tr key={template.id}>
                                                    <td>
                                                        <div className={styles.templateInfo}>
                                                            <div className={styles.templateThumb}>
                                                                <i className="bi bi-window-sidebar" />
                                                            </div>

                                                            <div className={styles.templateText}>
                                                                <div
                                                                    className={styles.templateTitle}
                                                                >
                                                                    {template.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className={styles.softBadge}>
                                                            <i className="bi bi-folder2-open" />

                                                            {category?.name ?? '-'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`${styles.statusBadge} ${
                                                                template.status === 'PUBLISHED'
                                                                    ? styles.statusPublished
                                                                    : template.status === 'DRAFT'
                                                                      ? styles.statusDraft
                                                                      : styles.statusArchived
                                                            }`}
                                                        >
                                                            {getStatusLabel(template.status)}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className={styles.accessCell}>
                                                            <span
                                                                className={`${
                                                                    styles.tierBadge
                                                                } ${getTierTone(
                                                                    category?.minTier ?? 'BASIC',
                                                                )}`}
                                                            >
                                                                {category?.minTier ?? 'BASIC'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className={styles.visibility}>
                                                            <span
                                                                className={`${
                                                                    styles.visibilityDot
                                                                } ${
                                                                    template.isPublic
                                                                        ? styles.publicDot
                                                                        : styles.privateDot
                                                                }`}
                                                            />

                                                            <span>
                                                                {template.isPublic
                                                                    ? 'Public'
                                                                    : 'Private'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className={styles.dateText}>
                                                            {template.updatedAt
                                                                ? formatDate(template.updatedAt)
                                                                : '-'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className={styles.rowActions}>
                                                            <button
                                                                className={styles.iconAction}
                                                                title="Edit"
                                                                type="button"
                                                                onClick={() =>
                                                                    fetchTemplateDetail(template.id)
                                                                }
                                                                disabled={loadingTemplateDetail}
                                                            >
                                                                <i className="bi bi-pencil-square" />
                                                            </button>

                                                            <button
                                                                className={styles.iconAction}
                                                                title="Duplicate"
                                                                type="button"
                                                            >
                                                                <i className="bi bi-copy" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>

                            <div className={styles.pagination}>
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((current) => current - 1)}
                                    type="button"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                                    (pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            className={page === pageNumber ? styles.activePage : ''}
                                            onClick={() => setPage(pageNumber)}
                                            type="button"
                                        >
                                            {pageNumber}
                                        </button>
                                    ),
                                )}

                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage((current) => current + 1)}
                                    type="button"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </section>

            <NewTemplateModal
                open={openNewTemplate}
                categories={categories}
                mode={modalMode}
                initialData={selectedTemplate}
                loading={loadingTemplateDetail}
                onClose={handleCloseTemplateModal}
                onCreated={() => {
                    handleCloseTemplateModal();
                    void fetchTemplates();
                }}
            />

            <NewGroupModal
                open={openNewGroup}
                onClose={() => setOpenNewGroup(false)}
                onCreated={() => {
                    void fetchTemplateCategories();
                }}
            />
        </div>
    );
}
