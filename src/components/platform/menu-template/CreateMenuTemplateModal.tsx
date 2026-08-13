'use client';

import { useEffect, useMemo, useState } from 'react';
import { MenuArea, WebsiteType } from '@/generated/prisma';
import styles from '@/styles/platform/menu-template/create-menu-template-modal.module.css';
import type {
    MenuTemplate,
    MenuTemplateCategory,
} from '@/services/platform/menu-template/index.service';
interface CategoryItem {
    id: string;
    name: string;
}

interface ParentMenuItem {
    id: string;
    title: string;
}

export interface CreateMenuTemplatePayload {
    websiteType: WebsiteType;
    categoryId: string;
    parentId: string | null;
    key: string;
    title: string;
    path: string | null;
    icon: string | null;
    area: MenuArea;
    sortOrder: number;
    visible: boolean;
}

interface CreateMenuTemplateModalProps {
    open: boolean;
    loading: boolean;
    categories: MenuTemplateCategory[];
    parentMenus: {
        id: string;
        title: string;
    }[];
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
    const [parentId, setParentId] = useState('');
    const [title, setTitle] = useState('');
    const [key, setKey] = useState('');
    const [path, setPath] = useState('');
    const [icon, setIcon] = useState('bi-house');
    const [area, setArea] = useState<MenuArea | undefined>();
    const [sortOrder, setSortOrder] = useState(0);
    const [visible, setVisible] = useState(true);
    const [error, setError] = useState('');

    const categoryOptions = useMemo(() => categories, [categories]);
    const parentOptions = useMemo(() => parentMenus, [parentMenus]);

    useEffect(() => {
        if (!open) return;

        setWebsiteType(WebsiteType.landing);
        setCategoryId(categories[0]?.id ?? '');
        setParentId('');
        setTitle('');
        setKey('');
        setPath('');
        setIcon('bi-house');
        setArea(MenuArea.SITE);
        setSortOrder(0);
        setVisible(true);
        setError('');
    }, [open, categories]);

    useEffect(() => {
        const slug = slugify(title);

        setKey(slug);

        switch (area) {
            case MenuArea.ADMIN:
                setPath(slug ? `/admin/${slug}` : '');
                break;

            case MenuArea.PLATFORM:
                setPath(slug ? `/platform/${slug}` : '');
                break;

            default:
                setPath(slug ? `/${slug}` : '');
        }
    }, [title, area]);

    async function handleSubmit(e: React.FormEvent) {
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

        if (!key.trim()) {
            setError('Key is required.');
            return;
        }

        if (!title.trim()) {
            setError('Title is required.');
            return;
        }

        if (!area) {
            setError('Area is required.');
            return;
        }

        await onSubmit({
            websiteType,
            categoryId,
            parentId: parentId || null,
            key: key.trim(),
            title: title.trim(),
            path: path.trim() || null,
            icon: icon.trim() || null,
            area,
            sortOrder,
            visible,
        });
    }

    useEffect(() => {
        if (!open) return;

        if (menu) {
            setWebsiteType(menu.websiteType);
            setCategoryId(menu.categoryId);
            setParentId(menu.parentId ?? '');
            setKey(menu.key);
            setTitle(menu.title);
            setPath(menu.path ?? '');
            setIcon(menu.icon ?? '');
            setArea(menu.area);
            setSortOrder(menu.sortOrder);
            setVisible(menu.visible);
            return;
        }

        setWebsiteType(undefined);
        setCategoryId('');
        setParentId('');
        setKey('');
        setTitle('');
        setPath('');
        setIcon('');
        setArea(undefined);
        setSortOrder(0);
        setVisible(true);
    }, [menu, open]);

    const isEdit = menu !== null;

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

                    <button type="button" className={styles.closeButton} onClick={onClose}>
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
                            <label>Website Type</label>

                            <select
                                value={websiteType}
                                onChange={(e) => setWebsiteType(e.target.value as WebsiteType)}
                            >
                                {Object.values(WebsiteType).map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label>Area</label>

                            <select
                                value={area}
                                onChange={(e) => setArea(e.target.value as MenuArea)}
                            >
                                {Object.values(MenuArea).map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label>Category</label>

                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
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
                            <label>Parent Menu</label>

                            <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                                <option value="">None</option>

                                {parentOptions.map((menu) => (
                                    <option key={menu.id} value={menu.id}>
                                        {menu.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label>Title</label>

                            <input
                                type="text"
                                placeholder="About Us"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Key</label>

                            <input
                                type="text"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Path</label>

                            <input
                                type="text"
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Icon</label>

                            <input
                                type="text"
                                placeholder="bi-house"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Sort Order</label>

                            <input
                                type="number"
                                min={0}
                                value={sortOrder}
                                onChange={(e) => setSortOrder(Number(e.target.value))}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Visible</label>

                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={visible}
                                    onChange={(e) => setVisible(e.target.checked)}
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
