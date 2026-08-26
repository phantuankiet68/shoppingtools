'use client';

import { useEffect, useMemo, useState } from 'react';
import { MenuArea, WebsiteType } from '@/generated/prisma';
import {
    createMenuTemplate,
    updateMenuTemplate,
    deleteMenuTemplate,
    duplicateMenuTemplate,
    toggleMenuTemplateVisible,
} from '@/services/platform/menu-template/index.service';
import { useMenuTemplate } from '@/hooks/platform/menu-template/use-menu-template';
import styles from '@/styles/platform/menu-template/menu-template.module.css';
import CreateMenuTemplateModal from '@/components/platform/menu-template/CreateMenuTemplateModal';
import type {
    CreateMenuTemplatePayload,
    MenuTemplate as MenuTemplateModel,
} from '@/services/platform/menu-template/index.service';

const groupColors = [
    styles.groupBlue,
    styles.groupOrange,
    styles.groupPurple,
    styles.groupGreen,
    styles.groupPink,
];

const views = [
    {
        label: 'List',
        icon: 'bi-list-ul',
        active: true,
    },
];

const websiteTypes: {
    value: WebsiteType;
    label: string;
    icon: string;
}[] = [
    {
        value: WebsiteType.landing,
        label: 'Landing',
        icon: 'bi-window',
    },
    {
        value: WebsiteType.blog,
        label: 'Blog',
        icon: 'bi-journal-text',
    },
    {
        value: WebsiteType.ecommerce,
        label: 'E-Commerce',
        icon: 'bi-bag',
    },
    {
        value: WebsiteType.booking,
        label: 'Booking',
        icon: 'bi-calendar-check',
    },
    {
        value: WebsiteType.lms,
        label: 'LMS',
        icon: 'bi-mortarboard',
    },
];

export default function MenuTemplate() {
    const [search, setSearch] = useState('');
    const [websiteType, setWebsiteType] = useState<WebsiteType>();
    const [categoryId] = useState<string>();
    const [area] = useState<MenuArea>();
    const [visible] = useState<boolean>();
    const [sortBy] = useState<'sortOrder' | 'title' | 'createdAt' | 'updatedAt'>('sortOrder');
    const [sortOrder] = useState<'asc' | 'desc'>('asc');

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MenuTemplateModel | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const { loading, error, menus, categories, setMenus, refresh } = useMenuTemplate({
        search,
        websiteType,
        categoryId,
        area,
        visible,
        sortBy,
        sortOrder,
    });

    const groups = useMemo(() => {
        const map = new Map<
            string,
            {
                id: string;
                title: string;
                menus: MenuTemplateModel[];
            }
        >();

        menus.forEach((item) => {
            const category = item.category;

            if (!category) return;

            if (!map.has(category.id)) {
                map.set(category.id, {
                    id: category.id,
                    title: category.name,
                    menus: [],
                });
            }

            map.get(category.id)!.menus.push(item);
        });

        return Array.from(map.values());
    }, [menus]);

    useEffect(() => {
        setCollapsedGroups(new Set(groups.map((group) => group.id)));
    }, [groups]);

    function toggleGroup(groupId: string) {
        setCollapsedGroups((prev) => {
            const next = new Set(prev);

            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }

            return next;
        });
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this menu template?')) return;

        try {
            await deleteMenuTemplate(id);

            setMenus((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete menu template.');
        }
    }

    async function handleDuplicate(id: string) {
        try {
            await duplicateMenuTemplate(id);
            await refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to duplicate menu template.');
        }
    }

    async function handleVisible(id: string, checked: boolean) {
        try {
            await toggleMenuTemplateVisible(id, checked);

            setMenus((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              visible: checked,
                          }
                        : item,
                ),
            );
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update visibility.');
        }
    }

    function handleEdit(id: string) {
        const menu = menus.find((item) => item.id === id);

        if (!menu) return;

        setEditingMenu(menu);
        setOpenCreateModal(true);
    }

    const parentMenus = useMemo(
        () =>
            menus.map((item) => ({
                id: item.id,
                title: item.title,
            })),
        [menus],
    );

    async function handleSubmitMenu(data: CreateMenuTemplatePayload) {
        try {
            if (editingMenu) {
                await updateMenuTemplate(editingMenu.id, data);
            } else {
                await createMenuTemplate(data);
            }

            await refresh();

            setEditingMenu(null);
            setOpenCreateModal(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save menu template.');
        }
    }

    function closeModal() {
        setEditingMenu(null);
        setOpenCreateModal(false);
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <i className="bi bi-arrow-repeat" />
                <span>Loading menu templates...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.loading}>
                <i className="bi bi-exclamation-circle" />
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <header className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <div className={styles.viewTabs}>
                        {views.map((view) => (
                            <button
                                key={view.label}
                                type="button"
                                className={`${styles.viewButton} ${
                                    view.active ? styles.viewButtonActive : ''
                                }`}
                            >
                                <i className={`bi ${view.icon}`} />
                                <span>{view.label}</span>
                            </button>
                        ))}

                        <div className={styles.websiteTabs}>
                            {websiteTypes.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    className={`${styles.websiteButton} ${
                                        websiteType === item.value ? styles.websiteButtonActive : ''
                                    }`}
                                    onClick={() => setWebsiteType(item.value)}
                                >
                                    <i className={`bi ${item.icon}`} />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.toolbarRight}>
                    <button
                        type="button"
                        className={styles.toolbarButton}
                        onClick={() => {
                            setEditingMenu(null);
                            setOpenCreateModal(true);
                        }}
                    >
                        <i className="bi bi-plus-lg" />
                        <span>Create</span>
                    </button>

                    <button type="button" className={styles.toolbarButton}>
                        <i className="bi bi-sort-down" />
                        <span>Sort</span>
                    </button>

                    <div className={styles.search}>
                        <i className="bi bi-search" />

                        <input
                            value={search}
                            placeholder="Search menu template..."
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <button type="button" className={styles.searchShortcut}>
                            ⌘K
                        </button>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                {groups.map((group, index) => {
                    const collapsed = collapsedGroups.has(group.id);

                    return (
                        <section
                            key={group.id}
                            className={`${styles.group} ${groupColors[index % groupColors.length]}`}
                        >
                            <div className={styles.groupHeader}>
                                <div className={styles.groupLeft}>
                                    <button
                                        type="button"
                                        className={styles.expand}
                                        aria-label={
                                            collapsed
                                                ? `Expand ${group.title}`
                                                : `Collapse ${group.title}`
                                        }
                                        aria-expanded={!collapsed}
                                        onClick={() => toggleGroup(group.id)}
                                    >
                                        <i
                                            className={`bi ${
                                                collapsed ? 'bi-chevron-right' : 'bi-chevron-down'
                                            }`}
                                        />
                                    </button>

                                    <div className={styles.groupInfo}>
                                        <h3>{group.title}</h3>
                                        <span>{group.menus.length}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={styles.groupMenu}
                                    aria-label={`More options for ${group.title}`}
                                >
                                    <i className="bi bi-three-dots" />
                                </button>
                            </div>

                            {!collapsed && (
                                <div className={styles.table}>
                                    <div className={styles.tableHeader}>
                                        <div className={styles.colName}>
                                            Name
                                            <i className="bi bi-arrow-down-up" />
                                        </div>

                                        <div className={styles.colPath}>
                                            Path
                                            <i className="bi bi-arrow-down-up" />
                                        </div>

                                        <div className={styles.colIcon}>Icon</div>

                                        <div className={styles.colWebsiteType}>
                                            Website Type
                                            <i className="bi bi-arrow-down-up" />
                                        </div>

                                        <div className={styles.colArea}>
                                            Area
                                            <i className="bi bi-arrow-down-up" />
                                        </div>

                                        <div className={styles.colVisible}>Visible</div>

                                        <div className={styles.colSort}>
                                            Sort
                                            <i className="bi bi-arrow-down-up" />
                                        </div>

                                        <div className={styles.colActions}>Actions</div>
                                    </div>

                                    {group.menus.map((menu, menuIndex) => (
                                        <div key={menu.id} className={styles.row}>
                                            <div className={styles.colName}>
                                                <div className={styles.taskId}>
                                                    MT-
                                                    {String(menuIndex + 1).padStart(3, '0')}
                                                </div>

                                                <div className={styles.taskContent}>
                                                    <div className={styles.taskTitle}>
                                                        {menu.title}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.colPath}>{menu.path ?? '-'}</div>

                                            <div className={styles.colIcon}>
                                                <div className={styles.iconBadge}>
                                                    {menu.icon ? (
                                                        <i className={`bi ${menu.icon}`} />
                                                    ) : (
                                                        <i className="bi bi-dash" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.colWebsiteType}>
                                                <span
                                                    className={`${styles.websiteBadge} ${
                                                        menu.websiteType === WebsiteType.landing
                                                            ? styles.websiteLanding
                                                            : menu.websiteType === WebsiteType.blog
                                                              ? styles.websiteBlog
                                                              : menu.websiteType ===
                                                                  WebsiteType.ecommerce
                                                                ? styles.websiteEcommerce
                                                                : menu.websiteType ===
                                                                    WebsiteType.booking
                                                                  ? styles.websiteBooking
                                                                  : styles.websiteLms
                                                    }`}
                                                >
                                                    {menu.websiteType}
                                                </span>
                                            </div>

                                            <div className={styles.colArea}>
                                                <span
                                                    className={`${styles.areaBadge} ${
                                                        menu.area === MenuArea.ADMIN
                                                            ? styles.areaAdmin
                                                            : menu.area === MenuArea.PLATFORM
                                                              ? styles.areaPlatform
                                                              : styles.areaSite
                                                    }`}
                                                >
                                                    {menu.area}
                                                </span>
                                            </div>

                                            <div className={styles.colVisible}>
                                                <label className={styles.switch}>
                                                    <input
                                                        type="checkbox"
                                                        checked={menu.visible}
                                                        onChange={(e) =>
                                                            handleVisible(menu.id, e.target.checked)
                                                        }
                                                    />
                                                    <span className={styles.slider} />
                                                </label>
                                            </div>

                                            <div className={styles.colSort}>
                                                <span className={styles.sortBadge}>
                                                    {menu.sortOrder}
                                                </span>
                                            </div>

                                            <div className={styles.actions}>
                                                <button
                                                    type="button"
                                                    className={styles.actionEdit}
                                                    title="Edit"
                                                    onClick={() => handleEdit(menu.id)}
                                                >
                                                    <i className="bi bi-pencil-square" />
                                                </button>

                                                <button
                                                    type="button"
                                                    className={styles.actionCopy}
                                                    title="Duplicate"
                                                    onClick={() => handleDuplicate(menu.id)}
                                                >
                                                    <i className="bi bi-copy" />
                                                </button>

                                                <button
                                                    type="button"
                                                    className={styles.actionDelete}
                                                    title="Delete"
                                                    onClick={() => handleDelete(menu.id)}
                                                >
                                                    <i className="bi bi-trash" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>

            <CreateMenuTemplateModal
                open={openCreateModal}
                loading={loading}
                categories={categories}
                parentMenus={parentMenus}
                menu={editingMenu}
                onClose={closeModal}
                onSubmit={handleSubmitMenu}
            />
        </div>
    );
}
