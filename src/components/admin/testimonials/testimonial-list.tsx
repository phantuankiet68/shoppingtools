'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useModal } from '@/components/admin/shared/common/modal';
import styles from './testimonial-list.module.css';
import AddTestimonialModal from '@/components/admin/testimonials/modal/add-testimonial-modal';
type TestimonialStatus = 'Published' | 'Inactive';
type LocaleCode = 'en' | 'vi' | 'ja';

type Translation = {
    locale: LocaleCode;
    name: string;
    role: string;
    websiteLabel: string | null;
    quote: string;
};

type ApiTestimonial = {
    id: string;
    avatar: string;
    website: string | null;
    accentColor: string | null;
    rating: number;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    translations: Translation[];
};

type Testimonial = {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: TestimonialStatus;
    rating: number;
    quote: string;
    website: string | null;
    websiteLabel: string | null;
    locales: LocaleCode[];
    createdAt: string;
};

export interface TestimonialListProps {
    siteId?: string;
    locale?: LocaleCode;
    onAdd?: () => void;
    onEdit?: (testimonialId: string) => void;
}

function Stars({ rating }: { rating: number }) {
    const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
    return (
        <span className={styles.stars} aria-label={`${safeRating} out of 5`}>
            {Array.from({ length: 5 }, (_, index) => (
                <i
                    key={index}
                    className={
                        index + 1 <= Math.round(safeRating) ? 'bi bi-star-fill' : 'bi bi-star'
                    }
                />
            ))}
        </span>
    );
}

function StatusBadge({ status }: { status: TestimonialStatus }) {
    return <span className={`${styles.status} ${styles[`status${status}`]}`}>{status}</span>;
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
}

function normalizeWebsite(value: string | null) {
    if (!value) return null;
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function mapApiTestimonial(item: ApiTestimonial, currentLocale: LocaleCode): Testimonial {
    const translations = Array.isArray(item.translations) ? item.translations : [];
    const translation =
        translations.find((value) => value.locale === currentLocale) ??
        translations.find((value) => value.locale === 'en') ??
        translations[0];
    return {
        id: item.id,
        name: translation?.name ?? 'Unnamed customer',
        role: translation?.role ?? '',
        avatar: item.avatar,
        status: item.isActive ? 'Published' : 'Inactive',
        rating: Math.max(0, Math.min(5, Number(item.rating) || 0)),
        quote: translation?.quote ?? '',
        website: normalizeWebsite(item.website),
        websiteLabel: translation?.websiteLabel ?? item.website ?? null,
        locales: translations
            .map((value) => value.locale)
            .filter((value, index, list) => list.indexOf(value) === index),
        createdAt: item.createdAt,
    };
}

export default function TestimonialList({
    siteId: propSiteId,
    locale = 'en',
    onAdd,
    onEdit,
}: TestimonialListProps) {
    const { currentSite } = useAdminAuth();
    const { t } = useAdminI18n();
    const modal = useModal();

    const siteId = currentSite?.id ?? propSiteId ?? '';

    const [items, setItems] = useState<Testimonial[]>([]);
    const [query, setQuery] = useState('');
    const [localeFilter, setLocaleFilter] = useState('all');
    const [status, setStatus] = useState('all');
    const [rating, setRating] = useState('all');
    const [sort, setSort] = useState('newest');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(Boolean(siteId));
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<ApiTestimonial | null>(null);
    const [loadingTestimonialId, setLoadingTestimonialId] = useState<string | null>(null);

    const handleAdd = useCallback(() => {
        setEditingTestimonial(null);
        if (onAdd) {
            onAdd();
            return;
        }
        setShowAddModal(true);
    }, [onAdd]);

    const handleEdit = useCallback(
        async (id: string) => {
            if (loadingTestimonialId) return;

            setLoadingTestimonialId(id);

            try {
                const response = await fetch(`/api/admin/testimonials/${encodeURIComponent(id)}`, {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-store',
                    headers: {
                        Accept: 'application/json',
                    },
                });

                const payload = await response.json().catch(() => null);

                if (!response.ok || !payload?.success || !payload?.testimonial) {
                    throw new Error(payload?.error || t('testimonials.modal.loadFailed'));
                }

                setEditingTestimonial(payload.testimonial as ApiTestimonial);
                setShowAddModal(true);
            } catch (requestError) {
                console.error('[TestimonialList] edit load failed', requestError);
                modal.error(
                    t('testimonials.modal.loadFailed'),
                    requestError instanceof Error
                        ? requestError.message
                        : t('testimonials.modal.loadFailed'),
                );
            } finally {
                setLoadingTestimonialId(null);
            }
        },
        [loadingTestimonialId, modal, onEdit, t],
    );

    const loadTestimonials = useCallback(
        async (signal?: AbortSignal) => {
            if (!siteId) {
                setItems([]);
                setLoading(false);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({ siteId, limit: '100', locale });
                const response = await fetch(`/api/admin/testimonials?${params.toString()}`, {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-store',
                    headers: { Accept: 'application/json' },
                    signal,
                });
                const payload = await response.json().catch(() => null);
                if (!response.ok || !payload?.success) {
                    throw new Error(
                        payload?.error || `Failed to load testimonials (${response.status})`,
                    );
                }

                const nextItems = Array.isArray(payload.testimonials)
                    ? payload.testimonials.map((item: ApiTestimonial) =>
                          mapApiTestimonial(item, locale),
                      )
                    : [];

                setItems(nextItems);
            } catch (requestError) {
                if (requestError instanceof DOMException && requestError.name === 'AbortError')
                    return;
                console.error('[TestimonialList] load failed', requestError);
                const message =
                    requestError instanceof Error
                        ? requestError.message
                        : t('testimonials.modal.loadFailed');

                setItems([]);
                setError(message);
                modal.error(t('testimonials.modal.loadFailed'), message);
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [siteId, locale, modal, t],
    );

    useEffect(() => {
        const controller = new AbortController();
        void loadTestimonials(controller.signal);
        return () => controller.abort();
    }, [loadTestimonials]);

    useEffect(() => {
        setSelected((current) => current.filter((id) => items.some((item) => item.id === id)));
    }, [items]);

    const filteredTestimonials = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        const result = items.filter((item) => {
            const matchesQuery =
                !normalized ||
                [
                    item.name,
                    item.role,
                    item.quote,
                    item.website ?? '',
                    item.websiteLabel ?? '',
                ].some((value) => value.toLowerCase().includes(normalized));
            const matchesLocale =
                localeFilter === 'all' ||
                item.locales.includes(localeFilter.toLowerCase() as LocaleCode);
            const matchesStatus = status === 'all' || item.status === status;
            const matchesRating =
                rating === 'all' ||
                (rating === '5' ? item.rating === 5 : item.rating >= Number(rating));
            return matchesQuery && matchesLocale && matchesStatus && matchesRating;
        });

        return [...result].sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return sort === 'newest' ? bTime - aTime : aTime - bTime;
        });
    }, [items, localeFilter, query, rating, sort, status]);

    const selectableTestimonials = filteredTestimonials;
    const allSelected =
        selectableTestimonials.length > 0 &&
        selectableTestimonials.every((item) => selected.includes(item.id));

    const toggleSelect = (id: string) => {
        setSelected((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
    };

    const toggleAll = () => {
        setSelected(allSelected ? [] : selectableTestimonials.map((item) => item.id));
    };

    const deleteTestimonial = async (id: string) => {
        const item = items.find((value) => value.id === id);
        if (!item || !siteId || deleting) return;

        modal.confirmDelete(
            t('testimonials.modal.deleteTestimonial'),
            t('testimonials.modal.deleteTestimonialConfirm').replace('{name}', item.name),
            async () => {
                try {
                    setDeleting(id);

                    const response = await fetch(
                        `/api/admin/testimonials/${encodeURIComponent(id)}`,
                        {
                            method: 'DELETE',
                            credentials: 'include',
                            headers: {
                                Accept: 'application/json',
                            },
                        },
                    );

                    const payload = await response.json().catch(() => null);

                    if (!response.ok || !payload?.success) {
                        throw new Error(payload?.error || t('testimonials.modal.deleteFailed'));
                    }

                    setItems((current) => current.filter((value) => value.id !== id));
                    setSelected((current) => current.filter((value) => value !== id));

                    modal.success(
                        t('testimonials.modal.success'),
                        t('testimonials.modal.deletedSuccess').replace('{name}', item.name),
                    );
                } catch (requestError) {
                    console.error('[TestimonialList] delete failed', requestError);
                    modal.error(
                        t('testimonials.modal.deleteFailed'),
                        requestError instanceof Error
                            ? requestError.message
                            : t('testimonials.modal.deleteFailed'),
                    );
                } finally {
                    setDeleting(null);
                }
            },
        );
    };

    const deleteSelected = async () => {
        const ids = selected.filter((id) => items.some((item) => item.id === id));

        if (!ids.length || !siteId || deleting) return;

        modal.confirmDelete(
            t('testimonials.modal.deleteSelected'),
            t('testimonials.modal.deleteSelectedConfirm').replace('{count}', String(ids.length)),
            async () => {
                try {
                    setDeleting('bulk');

                    const results = await Promise.all(
                        ids.map(async (id) => {
                            try {
                                const response = await fetch(
                                    `/api/admin/testimonials/${encodeURIComponent(id)}`,
                                    {
                                        method: 'DELETE',
                                        credentials: 'include',
                                        headers: {
                                            Accept: 'application/json',
                                        },
                                    },
                                );

                                const payload = await response.json().catch(() => null);

                                return {
                                    id,
                                    ok: response.ok && Boolean(payload?.success),
                                };
                            } catch {
                                return { id, ok: false };
                            }
                        }),
                    );

                    const deletedIds = new Set(
                        results.filter((result) => result.ok).map((result) => result.id),
                    );

                    setItems((current) => current.filter((item) => !deletedIds.has(item.id)));
                    setSelected((current) => current.filter((id) => !deletedIds.has(id)));

                    if (deletedIds.size === ids.length) {
                        modal.success(
                            t('testimonials.modal.success'),
                            t('testimonials.modal.deletedSelectedSuccess').replace(
                                '{count}',
                                String(deletedIds.size),
                            ),
                        );
                    } else {
                        modal.error(
                            t('testimonials.modal.deleteFailed'),
                            t('testimonials.modal.partialDeleteFailed'),
                        );
                    }
                } catch (requestError) {
                    console.error('[TestimonialList] bulk delete failed', requestError);
                    modal.error(
                        t('testimonials.modal.deleteFailed'),
                        requestError instanceof Error
                            ? requestError.message
                            : t('testimonials.modal.deleteFailed'),
                    );
                } finally {
                    setDeleting(null);
                }
            },
        );
    };

    return (
        <main className={styles.page}>
            <header className={styles.pageHeader}>
                <div className={styles.titleBlock}>
                    <div className={styles.titleIcon}>
                        <i className="bi bi-chat-square-text" />
                    </div>
                    <div>
                        <h1>{t('testimonials.title')}</h1>
                        <p>{t('testimonials.description')}</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button type="button" className={styles.secondaryButton}>
                        <i className="bi bi-box-arrow-in-down" /> {t('testimonials.actions.import')}
                    </button>
                    <button type="button" className={styles.primaryButton} onClick={handleAdd}>
                        <i className="bi bi-plus-lg" />
                        {t('testimonials.actions.add')}
                    </button>
                </div>
            </header>

            {error && siteId && (
                <div className={styles.errorBar}>
                    <i className="bi bi-exclamation-circle" /> {error}{' '}
                    <button type="button" onClick={() => void loadTestimonials()}>
                        Retry
                    </button>
                </div>
            )}

            <section className={styles.toolbar}>
                <div className={styles.filterBar}>
                    <label className={styles.searchBox}>
                        <i className="bi bi-search" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={t('testimonials.filters.search')}
                        />
                    </label>
                    <label className={styles.selectBox}>
                        <select
                            value={localeFilter}
                            onChange={(event) => setLocaleFilter(event.target.value)}
                        >
                            <option value="all">{t('testimonials.filters.allLocales')}</option>
                            <option value="EN">{t('testimonials.locales.english')}</option>
                            <option value="VI">{t('testimonials.locales.vietnamese')}</option>
                            <option value="JA">{t('testimonials.locales.japanese')}</option>
                        </select>
                    </label>
                    <label className={styles.selectBox}>
                        <select value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="all">{t('testimonials.filters.allStatus')}</option>
                            <option>{t('testimonials.status.published')}</option>
                            <option>{t('testimonials.status.inactive')}</option>
                        </select>
                    </label>
                    <label className={styles.selectBox}>
                        <select value={rating} onChange={(event) => setRating(event.target.value)}>
                            <option value="all">{t('testimonials.filters.allRatings')}</option>
                            <option value="5">{t('testimonials.filters.fiveStars')}</option>
                            <option>4</option>
                            <option>3</option>
                        </select>
                    </label>
                </div>
                <div className={styles.toolbarActions}>
                    <div className={styles.viewToggle}>
                        <button
                            type="button"
                            className={view === 'grid' ? styles.activeView : ''}
                            onClick={() => setView('grid')}
                            aria-label="Grid view"
                        >
                            <i className="bi bi-grid-fill" />
                        </button>
                        <button
                            type="button"
                            className={view === 'list' ? styles.activeView : ''}
                            onClick={() => setView('list')}
                            aria-label="List view"
                        >
                            <i className="bi bi-list-ul" />
                        </button>
                    </div>
                    <select
                        className={styles.sortSelect}
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                    >
                        <option value="newest">{t('testimonials.sort.newest')}</option>
                        <option value="oldest">{t('testimonials.sort.oldest')}</option>
                    </select>
                </div>
            </section>

            {selected.length > 0 && (
                <div className={styles.bulkBar}>
                    <button type="button" onClick={toggleAll}>
                        {allSelected
                            ? t('testimonials.selection.clear')
                            : t('testimonials.selection.selectAll')}
                    </button>
                    <span>
                        {t('testimonials.selection.selected').replace(
                            '{count}',
                            String(selected.length),
                        )}
                    </span>
                    <button
                        type="button"
                        className={styles.bulkDelete}
                        onClick={() => void deleteSelected()}
                        disabled={deleting === 'bulk'}
                    >
                        <i className="bi bi-trash3" />{' '}
                        {deleting === 'bulk'
                            ? t('testimonials.actions.deleting')
                            : t('testimonials.actions.delete')}
                    </button>
                </div>
            )}

            <div className={styles.resultMeta}>
                {loading && <span className={styles.loadingText}>{t('testimonials.loading')}</span>}
            </div>

            {filteredTestimonials.length === 0 ? (
                <section className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <i className="bi bi-chat-square-text" />
                    </div>
                    <h2>
                        {loading
                            ? t('testimonials.empty.loadingTitle')
                            : t('testimonials.empty.title')}
                    </h2>
                    <p>
                        {loading
                            ? t('testimonials.empty.loadingDescription')
                            : !siteId
                              ? t('testimonials.empty.noSite')
                              : query ||
                                  localeFilter !== 'all' ||
                                  status !== 'all' ||
                                  rating !== 'all'
                                ? t('testimonials.empty.filtered')
                                : t('testimonials.empty.description')}
                    </p>
                    {!loading && (
                        <button type="button" className={styles.primaryButton} onClick={handleAdd}>
                            <i className="bi bi-plus-lg" /> {t('testimonials.actions.add')}
                        </button>
                    )}
                </section>
            ) : (
                <section className={view === 'grid' ? styles.grid : styles.list}>
                    {filteredTestimonials.map((testimonial) => (
                        <article key={testimonial.id} className={styles.card}>
                            <div className={styles.cardTop}>
                                <label className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(testimonial.id)}
                                        onChange={() => toggleSelect(testimonial.id)}
                                    />
                                    <span />
                                </label>
                                <div className={styles.profile}>
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        loading="lazy"
                                        onError={(event) => {
                                            event.currentTarget.style.visibility = 'hidden';
                                        }}
                                    />
                                    <div className={styles.profileText}>
                                        <h3>{testimonial.name}</h3>
                                        <p>{testimonial.role}</p>
                                        <div className={styles.rating}>
                                            <Stars rating={testimonial.rating} />
                                            <strong>{testimonial.rating.toFixed(1)}</strong>
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge status={testimonial.status} />
                                <button
                                    type="button"
                                    className={styles.moreButton}
                                    aria-label={`${t('testimonials.actions.more')} ${testimonial.name}`}
                                    onClick={() => void handleEdit(testimonial.id)}
                                    disabled={loadingTestimonialId === testimonial.id}
                                >
                                    <i
                                        className={
                                            loadingTestimonialId === testimonial.id
                                                ? 'bi bi-arrow-repeat'
                                                : 'bi bi-three-dots'
                                        }
                                    />
                                </button>
                            </div>

                            <div className={styles.quoteWrap}>
                                <span className={styles.quoteIcon}>“</span>
                                <p>{testimonial.quote || t('testimonials.empty.noQuote')}</p>
                            </div>

                            {testimonial.website && (
                                <a
                                    className={styles.website}
                                    href={testimonial.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className="bi bi-link-45deg" />
                                    {testimonial.websiteLabel || testimonial.website}
                                    <i className="bi bi-box-arrow-up-right" />
                                </a>
                            )}

                            <div className={styles.tags}>
                                {testimonial.locales.map((value) => (
                                    <span
                                        key={`${testimonial.id}-${value}`}
                                        className={styles.languageTag}
                                    >
                                        {value.toUpperCase()}
                                    </span>
                                ))}
                            </div>

                            <footer className={styles.cardFooter}>
                                <time dateTime={testimonial.createdAt}>
                                    {formatDate(testimonial.createdAt)}
                                </time>
                                <div className={styles.cardActions}>
                                    <button
                                        type="button"
                                        className={styles.editButton}
                                        onClick={() => void handleEdit(testimonial.id)}
                                    >
                                        <i className="bi bi-pencil" />{' '}
                                        {t('testimonials.actions.edit')}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.deleteButton}
                                        onClick={() => void deleteTestimonial(testimonial.id)}
                                        disabled={deleting === testimonial.id}
                                    >
                                        <i className="bi bi-trash3" />{' '}
                                        {deleting === testimonial.id
                                            ? t('testimonials.actions.deleting')
                                            : t('testimonials.actions.delete')}
                                    </button>
                                </div>
                            </footer>
                        </article>
                    ))}
                </section>
            )}
            <AddTestimonialModal
                open={showAddModal}
                testimonial={editingTestimonial}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingTestimonial(null);
                }}
                onSuccess={() => {
                    setShowAddModal(false);
                    setEditingTestimonial(null);
                    void loadTestimonials();
                }}
            />
        </main>
    );
}
