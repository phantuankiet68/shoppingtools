'use client';

import { useEffect, useMemo, useState } from 'react';
import { MenuArea, WebsiteType } from '@/generated/prisma';
import styles from '@/styles/platform/menu-template/create-menu-template-modal.module.css';
import type {
    MenuTemplate,
    MenuTemplateCategory,
    MenuTemplateParent,
} from '@/services/platform/menu-template/index.service';

type CreateMenuTemplatePayload = {
    websiteType: WebsiteType;
    categoryId: string;
    parentId?: string | null;
    key: string;
    title: string;
    path?: string | null;
    icon?: string | null;
    area: MenuArea;
    visible?: boolean;
    sortOrder?: number;
};

interface CreateMenuTemplateModalProps {
    open: boolean;
    loading: boolean;
    categories: MenuTemplateCategory[];
    parentMenus: MenuTemplateParent[];
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

export default function CreateMenuTemplateModal({
    open,
    loading,
    categories,
    parentMenus,
    menu,
    onClose,
    onSubmit,
}: CreateMenuTemplateModalProps) {
    const [websiteType, setWebsiteType] = useState<WebsiteType | undefined>();
    const [categoryId, setCategoryId] = useState('');
    const [title, setTitle] = useState('');
    const [key, setKey] = useState('');
    const [path, setPath] = useState('');
    const [icon, setIcon] = useState('bi-house');
    const [area, setArea] = useState<MenuArea | undefined>();
    const [sortOrder, setSortOrder] = useState(0);
    const [visible, setVisible] = useState(true);
    const [error, setError] = useState('');
    const [parentId, setParentId] = useState<string | null>(null);
    const categoryOptions = useMemo(() => categories, [categories]);

    const isEdit = Boolean(menu);

    useEffect(() => {
        if (!open) return;

        if (menu) {
            setWebsiteType(menu.websiteType);
            setCategoryId(menu.categoryId);
            setParentId(menu.parentId);
            setTitle(menu.title);
            setKey(menu.key);
            setPath(menu.path ?? '');
            setIcon(menu.icon ?? '');
            setArea(menu.area);
            setSortOrder(menu.sortOrder);
            setVisible(menu.visible);
            setError('');
            return;
        }

        setWebsiteType(WebsiteType.landing);
        setCategoryId(categories[0]?.id ?? '');
        setParentId(null);
        setTitle('');
        setKey('');
        setPath('');
        setIcon('bi-house');
        setArea(MenuArea.SITE);
        setSortOrder(0);
        setVisible(true);
        setError('');
    }, [open, menu, categories]);

    useEffect(() => {
        if (!open || menu) return;

        const slug = slugify(title);

        setKey(slug);

        switch (area) {
            case MenuArea.ADMIN:
                setPath(slug ? `/admin/${slug}` : '');
                break;

            case MenuArea.PLATFORM:
                setPath(slug ? `/platform/${slug}` : '');
                break;

            case MenuArea.SITE:
            default:
                setPath(slug ? `/${slug}` : '');
                break;
        }
    }, [title, area, open, menu]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError('');

        if (!websiteType) {
            setError('Website type is required.');
            return;
        }

        if (!categoryId) {
            setError('Category is required.');
            return;
        }

        if (!title.trim()) {
            setError('Title is required.');
            return;
        }

        if (!key.trim()) {
            setError('Key is required.');
            return;
        }

        if (!area) {
            setError('Area is required.');
            return;
        }

        if (sortOrder < 0) {
            setError('Sort order cannot be negative.');
            return;
        }

        await onSubmit({
            websiteType,
            categoryId,
            parentId,
            key: key.trim(),
            title: title.trim(),
            path: path.trim() || null,
            icon: icon.trim() || null,
            area,
            sortOrder,
            visible,
        });
    }

    if (!open) {
        return null;
    }

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
                            <label htmlFor="parentId">Parent Menu</label>

                            <select
                                id="parentId"
                                value={parentId ?? ''}
                                onChange={(e) => setParentId(e.target.value || null)}
                                disabled={loading}
                            >
                                <option value="">Root Menu</option>

                                {parentMenus.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.title}
                                    </option>
                                ))}
                            </select>

                            <small>Leave empty to create a root-level menu.</small>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="area">Area</label>

                            <select
                                id="area"
                                value={area ?? ''}
                                onChange={(e) => setArea(e.target.value as MenuArea)}
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
                                onChange={(e) => setCategoryId(e.target.value)}
                                disabled={loading}
                            >
                                <option value="" disabled>
                                    Select category
                                </option>

                                {categoryOptions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="sortOrder">Sort Order</label>

                            <input
                                id="sortOrder"
                                type="number"
                                min={0}
                                value={sortOrder}
                                onChange={(e) => setSortOrder(Math.max(0, Number(e.target.value)))}
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
                                onChange={(e) => setTitle(e.target.value)}
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
