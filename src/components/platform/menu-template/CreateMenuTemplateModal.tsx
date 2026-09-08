'use client';

import { useEffect, useState } from 'react';
import { MenuArea, WebsiteType } from '@/generated/prisma';
import styles from '@/styles/platform/menu-template/create-menu-template-modal.module.css';
import {
    getMenuTemplates,
    type MenuTemplate,
    type MenuTemplateCategory,
    type MenuTemplateParent,
    type CreateMenuTemplatePayload,
} from '@/services/platform/menu-template/index.service';

interface CreateMenuTemplateModalProps {
    open: boolean;
    loading: boolean;
    categories: MenuTemplateCategory[];
    menu?: MenuTemplate | null;
    onClose: () => void;
    onSubmit: (data: CreateMenuTemplatePayload) => Promise<void>;
}

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function getPath(slug: string, area?: MenuArea) {
    if (!slug) return '';

    switch (area) {
        case MenuArea.ADMIN:
            return `/admin/${slug}`;
        case MenuArea.PLATFORM:
            return `/platform/${slug}`;
        default:
            return `/${slug}`;
    }
}

export default function CreateMenuTemplateModal({
    open,
    loading,
    categories,
    menu,
    onClose,
    onSubmit,
}: CreateMenuTemplateModalProps) {
    const [websiteType, setWebsiteType] = useState<WebsiteType>();
    const [area, setArea] = useState<MenuArea>();
    const [categoryId, setCategoryId] = useState('');
    const [parentId, setParentId] = useState<string | null>(null);
    const [parentMenus, setParentMenus] = useState<MenuTemplateParent[]>([]);
    const [title, setTitle] = useState('');
    const [key, setKey] = useState('');
    const [path, setPath] = useState('');
    const [icon, setIcon] = useState('bi-house');
    const [sortOrder, setSortOrder] = useState(0);
    const [visible, setVisible] = useState(true);
    const [error, setError] = useState('');
    const [loadingParents, setLoadingParents] = useState(false);

    const isEdit = Boolean(menu);

    useEffect(() => {
        if (!open) return;

        if (menu) {
            setWebsiteType(menu.websiteType);
            setArea(menu.area);
            setCategoryId(menu.categoryId);
            setParentId(menu.parentId);
            setTitle(menu.title);
            setKey(menu.key);
            setPath(menu.path ?? '');
            setIcon(menu.icon ?? '');
            setSortOrder(menu.sortOrder);
            setVisible(menu.visible);
        } else {
            setWebsiteType(WebsiteType.landing);
            setArea(MenuArea.SITE);
            setCategoryId(categories[0]?.id ?? '');
            setParentId(null);
            setTitle('');
            setKey('');
            setPath('');
            setIcon('bi-house');
            setSortOrder(0);
            setVisible(true);
        }

        setError('');
    }, [open, menu, categories]);

    useEffect(() => {
        if (!open || !categoryId) {
            setParentMenus([]);
            return;
        }

        let cancelled = false;

        async function loadParentMenus() {
            try {
                setLoadingParents(true);

                const response = await getMenuTemplates({
                    categoryId,
                    limit: 100,
                    sortBy: 'sortOrder',
                    sortOrder: 'asc',
                });

                if (cancelled) return;

                const currentId = menu?.id;

                const parents = response.data
                    .filter((item) => item.parentId === null)
                    .filter((item) => item.id !== currentId)
                    .map(({ id, title }) => ({ id, title }));

                setParentMenus(parents);
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to load parent menus:', err);
                    setParentMenus([]);
                }
            } finally {
                if (!cancelled) {
                    setLoadingParents(false);
                }
            }
        }

        loadParentMenus();

        return () => {
            cancelled = true;
        };
    }, [open, categoryId, menu?.id]);

    function handleTitleChange(value: string) {
        setTitle(value);

        if (isEdit) return;

        const slug = slugify(value);
        setKey(slug);
        setPath(getPath(slug, area));
    }

    function handleAreaChange(value: MenuArea) {
        setArea(value);

        if (!isEdit) {
            setPath(getPath(slugify(title), value));
        }
    }

    function handleCategoryChange(value: string) {
        setCategoryId(value);
        setParentId(null);
    }

    function validate(): string {
        if (!websiteType) return 'Website type is required.';
        if (!area) return 'Area is required.';
        if (!categoryId) return 'Category is required.';
        if (!title.trim()) return 'Title is required.';
        if (!key.trim()) return 'Key is required.';
        if (!Number.isInteger(sortOrder) || sortOrder < 0) {
            return 'Sort order must be a non-negative integer.';
        }

        return '';
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');

        await onSubmit({
            websiteType: websiteType!,
            categoryId,
            parentId,
            key: key.trim(),
            title: title.trim(),
            path: path.trim() || null,
            icon: icon.trim() || null,
            area: area!,
            sortOrder,
            visible,
        });
    }

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <div>
                        <h2>{isEdit ? 'Edit Menu Template' : 'Create Menu Template'}</h2>

                        <p>
                            {isEdit
                                ? 'Update an existing menu template.'
                                : 'Create a reusable menu template for your website builder.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </header>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && (
                        <div className={styles.error}>
                            <i className="bi bi-exclamation-circle-fill" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label htmlFor="websiteType">Website Type</label>

                            <select
                                id="websiteType"
                                value={websiteType ?? ''}
                                onChange={(e) => setWebsiteType(e.target.value as WebsiteType)}
                                disabled={loading}
                            >
                                {Object.values(WebsiteType).map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="area">Area</label>

                            <select
                                id="area"
                                value={area ?? ''}
                                onChange={(e) => handleAreaChange(e.target.value as MenuArea)}
                                disabled={loading}
                            >
                                {Object.values(MenuArea).map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="categoryId">Category</label>

                            <select
                                id="categoryId"
                                value={categoryId}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                disabled={loading}
                            >
                                <option value="" disabled>
                                    Select category
                                </option>

                                {categories.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="parentId">Parent Menu</label>

                            <select
                                id="parentId"
                                value={parentId ?? ''}
                                onChange={(e) => setParentId(e.target.value || null)}
                                disabled={loading || loadingParents || !categoryId}
                            >
                                <option value="">
                                    {loadingParents ? 'Loading...' : 'Root Menu'}
                                </option>

                                {parentMenus.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.title}
                                    </option>
                                ))}
                            </select>

                            <small>
                                {categoryId
                                    ? 'Only root menus from this category are available.'
                                    : 'Select a category first.'}
                            </small>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="sortOrder">Sort Order</label>

                            <input
                                id="sortOrder"
                                type="number"
                                min={0}
                                step={1}
                                value={sortOrder}
                                onChange={(e) => {
                                    const value = Number(e.target.value);

                                    setSortOrder(
                                        Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0,
                                    );
                                }}
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="title">Title</label>

                            <input
                                id="title"
                                type="text"
                                placeholder="About Us"
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="key">Key</label>

                            <input
                                id="key"
                                type="text"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="path">Path</label>

                            <input
                                id="path"
                                type="text"
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="icon">Icon</label>

                            <input
                                id="icon"
                                type="text"
                                placeholder="bi-house"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="visible">Visible</label>

                            <label className={styles.switch}>
                                <input
                                    id="visible"
                                    type="checkbox"
                                    checked={visible}
                                    onChange={(e) => setVisible(e.target.checked)}
                                    disabled={loading}
                                />

                                <span className={styles.slider} />

                                <span className={styles.switchText}>
                                    {visible ? 'Visible' : 'Hidden'}
                                </span>
                            </label>
                        </div>
                    </div>

                    <footer className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? (
                                <>
                                    <i className="bi bi-arrow-repeat" />
                                    {isEdit ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <i className={`bi ${isEdit ? 'bi-check2' : 'bi-plus-lg'}`} />
                                    {isEdit ? 'Save Changes' : 'Create Menu Template'}
                                </>
                            )}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
