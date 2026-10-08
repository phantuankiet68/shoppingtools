'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './team-member-list.module.css';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useModal } from '@/components/admin/shared/common/modal';
import AddTeamMemberModal from '@/components/admin/team-member/modal/add-team-member-modal';

type Locale = 'vi' | 'en' | 'ja';
type TeamMemberStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
type TeamMemberColor = 'blue' | 'pink' | 'green' | 'orange';
type ViewMode = 'grid' | 'list';

type TeamMemberTranslation = {
    id: string;
    locale: Locale;
    name: string;
    role: string;
    department: string | null;
    description: string | null;
};

type TeamMember = {
    id: string;
    siteId: string;
    name: string;
    email: string;
    role: string;
    department: string;
    description: string;
    imageUrl: string | null;
    icon: string | null;
    experience: string | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    sortOrder: number;
    status: TeamMemberStatus;
    isActive: boolean;
    color: TeamMemberColor;
    translations: TeamMemberTranslation[];
};

type TeamMemberApiItem = {
    id: string;
    siteId: string;
    imageUrl: string | null;
    icon: string | null;
    experience: string | null;
    color: TeamMemberColor;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    email: string | null;
    sortOrder: number;
    status: TeamMemberStatus;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    translations: TeamMemberTranslation[];
};

type TeamMemberApiResponse = {
    success: boolean;
    message?: string;
    items: TeamMemberApiItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

type TeamMemberListProps = {
    siteId?: string;
    locale?: Locale;
    onAdd?: () => void;
    onEdit?: (member: TeamMember) => void;
};

const PAGE_SIZE_OPTIONS = [8, 12, 24];
const FALLBACK_AVATAR = '/assets/images/avatar-1.png';

const getTranslation = (
    translations: TeamMemberTranslation[],
    locale: Locale,
): TeamMemberTranslation | null => {
    return (
        translations.find((translation) => translation.locale === locale) ??
        translations.find((translation) => translation.locale === 'en') ??
        translations[0] ??
        null
    );
};

const mapTeamMember = (item: TeamMemberApiItem, locale: Locale): TeamMember => {
    const translation = getTranslation(item.translations, locale);

    return {
        id: item.id,
        siteId: item.siteId,
        name: translation?.name ?? '',
        email: item.email ?? '',
        role: translation?.role ?? '',
        department: translation?.department ?? '',
        description: translation?.description ?? '',
        imageUrl: item.imageUrl,
        icon: item.icon,
        experience: item.experience,
        linkedinUrl: item.linkedinUrl,
        twitterUrl: item.twitterUrl,
        sortOrder: item.sortOrder,
        status: item.status,
        isActive: item.isActive,
        color: item.color,
        translations: item.translations,
    };
};

const getImageUrl = (imageUrl: string | null) => {
    return imageUrl?.trim() || FALLBACK_AVATAR;
};

function SocialLinks({ member, className }: { member: TeamMember; className?: string }) {
    return (
        <div className={className}>
            <a
                href={member.linkedinUrl || '#'}
                target={member.linkedinUrl ? '_blank' : undefined}
                rel={member.linkedinUrl ? 'noopener noreferrer' : undefined}
                aria-label="LinkedIn"
                onClick={(event) => {
                    if (!member.linkedinUrl) {
                        event.preventDefault();
                    }
                }}
            >
                <i className="bi bi-linkedin" />
            </a>

            <a
                href={member.twitterUrl || '#'}
                target={member.twitterUrl ? '_blank' : undefined}
                rel={member.twitterUrl ? 'noopener noreferrer' : undefined}
                aria-label="X"
                onClick={(event) => {
                    if (!member.twitterUrl) {
                        event.preventDefault();
                    }
                }}
            >
                <i className="bi bi-twitter-x" />
            </a>

            <a
                href={member.email ? `mailto:${member.email}` : '#'}
                aria-label="Email"
                onClick={(event) => {
                    if (!member.email) {
                        event.preventDefault();
                    }
                }}
            >
                <i className="bi bi-envelope-fill" />
            </a>
        </div>
    );
}

export default function TeamMemberList({
    siteId: propSiteId,
    locale = 'en',
    onAdd,
    onEdit,
}: TeamMemberListProps) {
    const { currentSite } = useAdminAuth();
    const { t } = useAdminI18n();
    const modal = useModal();

    const siteId = currentSite?.id ?? propSiteId ?? '';

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [savingId, setSavingId] = useState<string | null>(null);

    const [showMemberModal, setShowMemberModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    /**
     * Open Add modal.
     */
    const handleAdd = useCallback(() => {
        setEditingMember(null);
        setShowMemberModal(true);
        onAdd?.();
    }, [onAdd]);

    /**
     * Open Edit modal.
     */
    const handleEdit = useCallback(
        (member: TeamMember) => {
            setEditingMember(member);
            setShowMemberModal(true);
            onEdit?.(member);
        },
        [onEdit],
    );

    /**
     * Close Add/Edit modal.
     */
    const handleCloseMemberModal = useCallback(() => {
        setShowMemberModal(false);
        setEditingMember(null);
    }, []);

    /**
     * Load team members from admin API.
     */
    const loadTeamMembers = useCallback(
        async (signal?: AbortSignal) => {
            if (!siteId) {
                setMembers([]);
                setTotal(0);
                setTotalPages(1);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const params = new URLSearchParams();

                params.set('siteId', siteId);
                params.set('locale', locale);
                params.set('page', String(currentPage));
                params.set('limit', String(pageSize));
                params.set('sortBy', 'sortOrder');
                params.set('sortOrder', sortOrder);

                if (search.trim()) {
                    params.set('search', search.trim());
                }

                if (statusFilter !== 'all') {
                    params.set('status', statusFilter);
                }

                if (roleFilter !== 'all') {
                    params.set('role', roleFilter);
                }

                const response = await fetch(`/api/admin/team-member?${params.toString()}`, {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-store',
                    signal,
                });

                const data = (await response.json()) as TeamMemberApiResponse;

                if (!response.ok || !data.success) {
                    throw new Error(data.message ?? t('teamMember.modal.loadFailed'));
                }

                setMembers(data.items.map((item) => mapTeamMember(item, locale)));

                setTotal(data.pagination.total);
                setTotalPages(Math.max(1, data.pagination.totalPages));
            } catch (error: unknown) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                modal.error(
                    t('teamMember.modal.loadFailed'),
                    error instanceof Error ? error.message : t('teamMember.modal.loadFailed'),
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [
            siteId,
            locale,
            currentPage,
            pageSize,
            search,
            statusFilter,
            roleFilter,
            sortOrder,
            t,
            modal,
        ],
    );

    /**
     * Reload list whenever filters/pagination/site change.
     */
    useEffect(() => {
        const controller = new AbortController();

        void loadTeamMembers(controller.signal);

        return () => {
            controller.abort();
        };
    }, [loadTeamMembers]);

    /**
     * Available roles for current result.
     */
    const roles = useMemo(() => {
        return Array.from(new Set(members.map((member) => member.role).filter(Boolean)));
    }, [members]);

    const totalMembers = total;

    const activeMembers = members.filter((member) => member.isActive).length;

    const hiddenMembers = members.filter((member) => !member.isActive).length;

    const pageMemberCount = members.length;

    const activePercent =
        pageMemberCount > 0 ? Math.round((activeMembers / pageMemberCount) * 100) : 0;

    const hiddenPercent =
        pageMemberCount > 0 ? Math.round((hiddenMembers / pageMemberCount) * 100) : 0;

    const safePage = Math.min(currentPage, Math.max(1, totalPages));

    const firstItem = total === 0 ? 0 : (safePage - 1) * pageSize + 1;

    const lastItem = total === 0 ? 0 : Math.min(safePage * pageSize, total);

    /**
     * Search.
     */
    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    /**
     * Status filter.
     */
    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    /**
     * Role filter.
     */
    const handleRoleChange = (value: string) => {
        setRoleFilter(value);
        setCurrentPage(1);
    };

    /**
     * Page size.
     */
    const handlePageSizeChange = (value: number) => {
        setPageSize(value);
        setCurrentPage(1);
    };

    /**
     * Sort by sortOrder.
     */
    const toggleSort = () => {
        setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
        setCurrentPage(1);
    };

    /**
     * Toggle active/hidden.
     */
    const toggleActive = async (member: TeamMember) => {
        try {
            setSavingId(member.id);

            const response = await fetch(`/api/admin/team-member/${member.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    isActive: !member.isActive,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message ?? t('teamMember.modal.updateFailed'));
            }

            setMembers((current) =>
                current.map((item) =>
                    item.id === member.id
                        ? {
                              ...item,
                              isActive: !member.isActive,
                          }
                        : item,
                ),
            );
        } catch (error: unknown) {
            modal.error(
                t('teamMember.modal.updateFailed'),
                error instanceof Error ? error.message : t('teamMember.modal.updateFailed'),
            );
        } finally {
            setSavingId(null);
        }
    };

    /**
     * Delete member.
     */
    const handleDelete = (member: TeamMember) => {
        modal.confirmDelete(
            t('teamMember.modal.deleteMember'),
            t('teamMember.modal.deleteMemberConfirm').replace('{name}', member.name),
            async () => {
                try {
                    setSavingId(member.id);

                    const response = await fetch(`/api/admin/team-member/${member.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });

                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        throw new Error(data.message ?? t('teamMember.modal.deleteFailed'));
                    }

                    setMembers((current) => current.filter((item) => item.id !== member.id));

                    setTotal((current) => Math.max(0, current - 1));

                    modal.success(
                        t('teamMember.modal.success'),
                        t('teamMember.modal.deletedSuccess').replace('{name}', member.name),
                    );

                    if (members.length === 1 && currentPage > 1) {
                        setCurrentPage((page) => Math.max(1, page - 1));
                    }
                } catch (error: unknown) {
                    modal.error(
                        t('teamMember.modal.deleteFailed'),
                        error instanceof Error ? error.message : t('teamMember.modal.deleteFailed'),
                    );
                } finally {
                    setSavingId(null);
                }
            },
        );
    };

    /**
     * Reset filters.
     */
    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setRoleFilter('all');
        setCurrentPage(1);
    };

    /**
     * Called after Add / Update succeeds.
     */
    const handleMemberSaved = useCallback(() => {
        setShowMemberModal(false);
        setEditingMember(null);

        void loadTeamMembers();
    }, [loadTeamMembers]);

    const renderSocialLinks = (member: TeamMember, className: string) => (
        <SocialLinks member={member} className={className} />
    );

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroGlow} />

                <div className={styles.heroContent}>
                    <div className={styles.heroTop}>
                        <section className={styles.statsGrid}>
                            <article className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.blue}`}>
                                    <i className="bi bi-people-fill" />
                                </div>

                                <div className={styles.statContent}>
                                    <span className={styles.statLabel}>
                                        {t('teamMember.stats.total')}
                                    </span>

                                    <div className={styles.statValueRow}>
                                        <strong>{totalMembers}</strong>

                                        <span
                                            className={`${styles.statTrend} ${styles.greenTrend}`}
                                        >
                                            <i className="bi bi-arrow-up" />2
                                        </span>

                                        <span className={styles.statDescription}>
                                            {t('teamMember.stats.comparedToLastMonth')}
                                        </span>
                                    </div>
                                </div>
                            </article>

                            <article className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.green}`}>
                                    <i className="bi bi-circle-fill" />
                                </div>

                                <div className={styles.statContent}>
                                    <span className={styles.statLabel}>
                                        {t('teamMember.stats.active')}
                                    </span>

                                    <div className={styles.statValueRow}>
                                        <strong>{activeMembers}</strong>

                                        <span
                                            className={`${styles.statPercent} ${styles.greenText}`}
                                        >
                                            {activePercent}%
                                        </span>

                                        <span className={styles.statDescription}>
                                            {t('teamMember.stats.activated')}
                                        </span>
                                    </div>
                                </div>
                            </article>

                            <article className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.orange}`}>
                                    <i className="bi bi-clock-fill" />
                                </div>

                                <div className={styles.statContent}>
                                    <span className={styles.statLabel}>
                                        {t('teamMember.stats.hidden')}
                                    </span>

                                    <div className={styles.statValueRow}>
                                        <strong>{hiddenMembers}</strong>

                                        <span
                                            className={`${styles.statPercent} ${styles.orangeText}`}
                                        >
                                            {hiddenPercent}%
                                        </span>

                                        <span className={styles.statDescription}>
                                            {t('teamMember.stats.notDisplayed')}
                                        </span>
                                    </div>
                                </div>
                            </article>

                            <article className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.pink}`}>
                                    <i className="bi bi-translate" />
                                </div>

                                <div className={styles.statContent}>
                                    <span className={styles.statLabel}>
                                        {t('teamMember.stats.languages')}
                                    </span>

                                    <div className={styles.statValueRow}>
                                        <strong>3</strong>

                                        <span
                                            className={`${styles.statPercent} ${styles.pinkText}`}
                                        >
                                            VI
                                        </span>

                                        <span className={styles.statDescription}>
                                            {t('teamMember.stats.supportedLanguages')}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </section>

                        <button
                            type="button"
                            className={styles.addButton}
                            onClick={handleAdd}
                            disabled={!siteId}
                        >
                            <i className="bi bi-plus-lg" />
                            <span>{t('teamMember.actions.add')}</span>
                        </button>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={`${styles.heroOrb} ${styles.heroOrbOne}`}>
                        <i className="bi bi-person-fill" />
                    </div>

                    <div className={`${styles.heroOrb} ${styles.heroOrbTwo}`}>
                        <i className="bi bi-person-fill" />
                    </div>

                    <div className={`${styles.heroOrb} ${styles.heroOrbThree}`}>
                        <i className="bi bi-person-fill" />
                    </div>

                    <div className={`${styles.heroSpark} ${styles.sparkOne}`}>✦</div>

                    <div className={`${styles.heroSpark} ${styles.sparkTwo}`}>✦</div>

                    <div className={`${styles.heroSpark} ${styles.sparkThree}`}>✦</div>
                </div>
            </section>

            <section className={styles.tableCard}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <i className="bi bi-search" />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => handleSearch(event.target.value)}
                            placeholder={t('teamMember.search.placeholder')}
                            aria-label={t('teamMember.search.ariaLabel')}
                        />

                        {search && (
                            <button
                                type="button"
                                className={styles.clearSearch}
                                onClick={() => handleSearch('')}
                                aria-label={t('teamMember.actions.clearSearch')}
                            >
                                <i className="bi bi-x" />
                            </button>
                        )}
                    </div>

                    <div className={styles.filters}>
                        <div className={styles.filterGroup}>
                            <select
                                value={statusFilter}
                                onChange={(event) => handleStatusChange(event.target.value)}
                                aria-label={t('teamMember.filter.status')}
                            >
                                <option value="all">{t('teamMember.filter.all')}</option>

                                <option value="PUBLISHED">
                                    {t('teamMember.filter.published')}
                                </option>

                                <option value="DRAFT">{t('teamMember.filter.draft')}</option>

                                <option value="ARCHIVED">{t('teamMember.filter.archived')}</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <select
                                value={roleFilter}
                                onChange={(event) => handleRoleChange(event.target.value)}
                                aria-label={t('teamMember.filter.role')}
                            >
                                <option value="all">{t('teamMember.filter.all')}</option>

                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.toolbarActions}>
                        <button type="button" className={styles.sortButton} onClick={toggleSort}>
                            <i className="bi bi-arrow-down-up" />
                            <span>{t('teamMember.actions.sort')}</span>
                        </button>

                        <div className={styles.viewSwitcher}>
                            <button
                                type="button"
                                className={
                                    viewMode === 'grid'
                                        ? styles.viewButtonActive
                                        : styles.viewButton
                                }
                                onClick={() => setViewMode('grid')}
                                aria-label={t('teamMember.actions.gridView')}
                            >
                                <i className="bi bi-grid-fill" />
                            </button>

                            <button
                                type="button"
                                className={
                                    viewMode === 'list'
                                        ? styles.viewButtonActive
                                        : styles.viewButton
                                }
                                onClick={() => setViewMode('list')}
                                aria-label={t('teamMember.actions.listView')}
                            >
                                <i className="bi bi-list-ul" />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <i className="bi bi-arrow-repeat" />
                        </div>

                        <h3>{t('teamMember.loading.title')}</h3>

                        <p>{t('teamMember.loading.description')}</p>
                    </div>
                ) : members.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <i className="bi bi-people" />
                        </div>

                        <h3>{t('teamMember.empty.title')}</h3>

                        <p>{t('teamMember.empty.description')}</p>

                        {(search || statusFilter !== 'all' || roleFilter !== 'all') && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className={styles.resetButton}
                            >
                                {t('teamMember.actions.resetFilters')}
                            </button>
                        )}
                    </div>
                ) : viewMode === 'list' ? (
                    <>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.checkboxColumn}>
                                            <input
                                                type="checkbox"
                                                aria-label={t('teamMember.table.selectAll')}
                                            />
                                        </th>

                                        <th className={styles.memberColumn}>
                                            {t('teamMember.table.information')}
                                        </th>

                                        <th>{t('teamMember.table.role')}</th>

                                        <th>{t('teamMember.table.links')}</th>

                                        <th>{t('teamMember.table.order')}</th>

                                        <th>{t('teamMember.table.status')}</th>

                                        <th className={styles.actionColumn}>
                                            {t('teamMember.table.actions')}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    aria-label={t(
                                                        'teamMember.table.selectMember',
                                                    ).replace('{name}', member.name)}
                                                />
                                            </td>

                                            <td>
                                                <div className={styles.memberInfo}>
                                                    <button
                                                        type="button"
                                                        className={styles.dragHandle}
                                                        aria-label={t(
                                                            'teamMember.actions.reorder',
                                                        ).replace('{name}', member.name)}
                                                    >
                                                        <i className="bi bi-grip-vertical" />
                                                    </button>

                                                    <div className={styles.avatar}>
                                                        <Image
                                                            src={getImageUrl(member.imageUrl)}
                                                            alt={member.name}
                                                            width={46}
                                                            height={46}
                                                        />
                                                    </div>

                                                    <div className={styles.memberMeta}>
                                                        <strong>{member.name}</strong>

                                                        <span>{member.email}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`${styles.roleBadge} ${styles[member.color]}`}
                                                >
                                                    {member.role}
                                                </span>
                                            </td>

                                            <td>{renderSocialLinks(member, styles.socials)}</td>

                                            <td>
                                                <span className={styles.orderBadge}>
                                                    {member.sortOrder}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className={styles.statusButton}
                                                    onClick={() => void toggleActive(member)}
                                                    disabled={savingId === member.id}
                                                    aria-label={`${
                                                        member.isActive
                                                            ? t('teamMember.actions.hide')
                                                            : t('teamMember.actions.show')
                                                    } ${member.name}`}
                                                >
                                                    <span
                                                        className={`${styles.switch} ${
                                                            member.isActive
                                                                ? styles.switchActive
                                                                : ''
                                                        }`}
                                                    >
                                                        <span />
                                                    </span>

                                                    <span
                                                        className={
                                                            member.isActive
                                                                ? styles.activeStatus
                                                                : styles.hiddenStatus
                                                        }
                                                    >
                                                        {member.isActive
                                                            ? t('teamMember.actions.visible')
                                                            : t('teamMember.actions.hidden')}
                                                    </span>
                                                </button>
                                            </td>

                                            <td>
                                                <div className={styles.rowActions}>
                                                    <button
                                                        type="button"
                                                        className={`${styles.rowAction} ${styles.editAction}`}
                                                        onClick={() => handleEdit(member)}
                                                        aria-label={t('teamMember.actions.edit')}
                                                    >
                                                        <i className="bi bi-pencil" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`${styles.rowAction} ${styles.deleteAction}`}
                                                        onClick={() => handleDelete(member)}
                                                        disabled={savingId === member.id}
                                                        aria-label={t('teamMember.actions.delete')}
                                                    >
                                                        <i className="bi bi-trash3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.pagination}>
                            <span className={styles.paginationInfo}>
                                {t('teamMember.pagination.showing')
                                    .replace('{from}', String(firstItem))
                                    .replace('{to}', String(lastItem))
                                    .replace('{total}', String(total))}
                            </span>

                            <div className={styles.paginationControls}>
                                <button
                                    type="button"
                                    className={styles.pageArrow}
                                    disabled={safePage === 1}
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    aria-label={t('teamMember.actions.previous')}
                                >
                                    <i className="bi bi-chevron-left" />
                                </button>

                                {Array.from(
                                    {
                                        length: Math.min(totalPages, 5),
                                    },
                                    (_, index) => index + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        className={
                                            safePage === page
                                                ? styles.pageActive
                                                : styles.pageNumber
                                        }
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    className={styles.pageArrow}
                                    disabled={safePage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                                    }
                                    aria-label={t('teamMember.actions.next')}
                                >
                                    <i className="bi bi-chevron-right" />
                                </button>

                                <select
                                    className={styles.pageSize}
                                    value={pageSize}
                                    onChange={(event) =>
                                        handlePageSizeChange(Number(event.target.value))
                                    }
                                    aria-label={t('teamMember.pagination.pageSize')}
                                >
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <option key={size} value={size}>
                                            {size} / trang
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.gridView}>
                            {members.map((member) => (
                                <article key={member.id} className={styles.memberCard}>
                                    <div
                                        className={`${styles.cardAccent} ${styles[member.color]}`}
                                    />

                                    <div className={styles.cardTop}>
                                        <div className={styles.cardAvatar}>
                                            <Image
                                                src={getImageUrl(member.imageUrl)}
                                                alt={member.name}
                                                width={72}
                                                height={72}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            className={
                                                member.isActive
                                                    ? styles.featuredActive
                                                    : styles.cardStar
                                            }
                                            onClick={() => void toggleActive(member)}
                                            disabled={savingId === member.id}
                                            aria-label={
                                                member.isActive
                                                    ? t('teamMember.actions.hide')
                                                    : t('teamMember.actions.show')
                                            }
                                        >
                                            <i
                                                className={
                                                    member.isActive
                                                        ? 'bi bi-eye-slash'
                                                        : 'bi bi-eye'
                                                }
                                            />
                                        </button>
                                    </div>

                                    <div className={styles.cardContent}>
                                        <h3>{member.name}</h3>

                                        <p>{member.email}</p>

                                        <span
                                            className={`${styles.roleBadge} ${styles[member.color]}`}
                                        >
                                            {member.role}
                                        </span>

                                        {renderSocialLinks(member, styles.cardSocials)}
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <button type="button" onClick={() => handleEdit(member)}>
                                            <i className="bi bi-pencil" />
                                            {t('teamMember.actions.edit')}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(member)}
                                            disabled={savingId === member.id}
                                        >
                                            <i className="bi bi-trash3" />
                                            {t('teamMember.actions.delete')}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className={styles.pagination}>
                            <span className={styles.paginationInfo}>
                                {t('teamMember.pagination.showing')
                                    .replace('{from}', String(firstItem))
                                    .replace('{to}', String(lastItem))
                                    .replace('{total}', String(total))}
                            </span>

                            <div className={styles.paginationControls}>
                                <button
                                    type="button"
                                    className={styles.pageArrow}
                                    disabled={safePage === 1}
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    aria-label={t('teamMember.actions.previous')}
                                >
                                    <i className="bi bi-chevron-left" />
                                </button>

                                {Array.from(
                                    {
                                        length: Math.min(totalPages, 5),
                                    },
                                    (_, index) => index + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        className={
                                            safePage === page
                                                ? styles.pageActive
                                                : styles.pageNumber
                                        }
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    className={styles.pageArrow}
                                    disabled={safePage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                                    }
                                    aria-label={t('teamMember.actions.next')}
                                >
                                    <i className="bi bi-chevron-right" />
                                </button>

                                <select
                                    className={styles.pageSize}
                                    value={pageSize}
                                    onChange={(event) =>
                                        handlePageSizeChange(Number(event.target.value))
                                    }
                                    aria-label={t('teamMember.pagination.pageSize')}
                                >
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <option key={size} value={size}>
                                            {size} / trang
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {showMemberModal && siteId && (
                <AddTeamMemberModal
                    siteId={siteId}
                    member={editingMember}
                    onClose={handleCloseMemberModal}
                    onSuccess={handleMemberSaved}
                />
            )}
        </main>
    );
}
