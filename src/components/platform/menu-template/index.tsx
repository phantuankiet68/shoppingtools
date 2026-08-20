'use client';

import { useMemo, useState } from 'react';
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
import type { CreateMenuTemplatePayload } from '@/services/platform/menu-template/index.service';
import type { MenuTemplate as MenuTemplateModel } from '@/services/platform/menu-template/index.service';

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
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [search, setSearch] = useState('');
    const [websiteType, setWebsiteType] = useState<WebsiteType>();
    const [categoryId] = useState<string>();
    const [area] = useState<MenuArea>();
    const [visible] = useState<boolean>();
    const [sortBy] = useState<'sortOrder' | 'title' | 'createdAt' | 'updatedAt'>('sortOrder');
    const [sortOrder] = useState<'asc' | 'desc'>('asc');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const { loading, error, menus, categories, setMenus, pagination, refresh } = useMenuTemplate({
        page,
        limit,
        search,
        websiteType,
        categoryId,
        area,
        visible,
        sortBy,
        sortOrder,
    });
    const [editingMenu, setEditingMenu] = useState<MenuTemplateModel | null>(null);

    const groups = useMemo(() => {
        const map = new Map<
            string,
            {
                id: string;
                title: string;
                menus: typeof menus;
            }
        >();

        menus.forEach((item) => {
            if (!map.has(item.category.id)) {
                map.set(item.category.id, {
                    id: item.category.id,
                    title: item.category.name,
                    menus: [],
                });
            }

            map.get(item.category.id)!.menus.push(item);
        });

        return [...map.values()];
    }, [menus]);

    async function handleDelete(id: string) {
        if (!confirm('Delete this menu template?')) return;

        try {
            await deleteMenuTemplate(id);

            setMenus((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            if (err instanceof Error) {
                alert(err.message);
            }
        }
    }

    async function handleDuplicate(id: string) {
        try {
            await duplicateMenuTemplate(id);

            await refresh();
        } catch (err) {
            if (err instanceof Error) {
                alert(err.message);
            }
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
            if (err instanceof Error) {
                alert(err.message);
            }
        }
    }

    function handleEdit(id: string) {
        const menu = menus.find((item) => item.id === id);

        if (!menu) return;

        setEditingMenu(menu);
        setOpenCreateModal(true);
    }

    async function handleCreateMenu(payload: CreateMenuTemplatePayload) {
        try {
            await createMenuTemplate(payload);

            setOpenCreateModal(false);

            refresh();
        } catch (error) {
            console.error(error);
        }
    }

    const parentMenus = useMemo(() => {
        return menus.map((item) => ({
            id: item.id,
            title: item.title,
        }));
    }, [menus]);

    const handleSubmitMenu = async (data: CreateMenuTemplatePayload) => {
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
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('Failed to save menu template.');
            }
        }
    };

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
                                className={`${styles.viewButton} ${view.active ? styles.viewButtonActive : ''}`}
                            >
                                <i className={`bi ${view.icon}`} />
                                <span>{view.label}</span>
                            </button>
                        ))}

                        <div className={styles.websiteTabs}>
                            {websiteTypes.map((item) => (
                                <button
                                    key={item.value}
                                    className={`${styles.websiteButton} ${websiteType === item.value ? styles.websiteButtonActive : ''}`}
                                    onClick={() => {
                                        setWebsiteType(item.value);
                                        setPage(1);
                                    }}
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
                        className={styles.toolbarButton}
                        onClick={() => setOpenCreateModal(true)}
                    >
                        <i className="bi bi-plus-lg" />
                        <span>Create</span>
                    </button>
                    <button className={styles.toolbarButton}>
                        <i className="bi bi-sort-down" />
                        <span>Sort</span>
                    </button>

                    <div className={styles.search}>
                        <i className="bi bi-search" />

                        <input
                            value={search}
                            placeholder="Search menu template..."
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />

                        <button className={styles.searchShortcut}>⌘K</button>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                {groups.map((group, index) => (
                    <section
                        key={group.id}
                        className={`${styles.group} ${groupColors[index % groupColors.length]}`}
                    >
                        <div className={styles.groupHeader}>
                            <div className={styles.groupLeft}>
                                <button className={styles.expand}>
                                    <i className="bi bi-chevron-down" />
                                </button>

                                <div className={styles.groupInfo}>
                                    <h3>{group.title}</h3>
                                    <span>{group.menus.length}</span>
                                </div>
                            </div>

                            <button className={styles.groupMenu}>
                                <i className="bi bi-three-dots" />
                            </button>
                        </div>

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
                                            MT-{String(menuIndex + 1).padStart(3, '0')}
                                        </div>

                                        <div className={styles.taskContent}>
                                            <div className={styles.taskTitle}>{menu.title}</div>
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
                                            className={`${styles.websiteBadge}
                                    ${
                                        menu.websiteType === WebsiteType.landing
                                            ? styles.websiteLanding
                                            : menu.websiteType === WebsiteType.blog
                                              ? styles.websiteBlog
                                              : menu.websiteType === WebsiteType.ecommerce
                                                ? styles.websiteEcommerce
                                                : menu.websiteType === WebsiteType.booking
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
                                        <span className={styles.sortBadge}>{menu.sortOrder}</span>
                                    </div>

                                    <div className={styles.actions}>
                                        <button
                                            className={styles.actionEdit}
                                            title="Edit"
                                            onClick={() => handleEdit(menu.id)}
                                        >
                                            <i className="bi bi-pencil-square" />
                                        </button>

                                        <button
                                            className={styles.actionCopy}
                                            title="Duplicate"
                                            onClick={() => handleDuplicate(menu.id)}
                                        >
                                            <i className="bi bi-copy" />
                                        </button>

                                        <button
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
                    </section>
                ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
                <footer className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                        <span>
                            Showing <strong>{(pagination.page - 1) * pagination.limit + 1}</strong>
                            {' - '}
                            <strong>
                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </strong>
                            {' of '}
                            <strong>{pagination.total}</strong> menu templates
                        </span>
                    </div>

                    <div className={styles.paginationActions}>
                        <button
                            className={styles.pageButton}
                            disabled={pagination.page <= 1}
                            onClick={() => setPage((prev) => prev - 1)}
                        >
                            <i className="bi bi-chevron-left" />
                        </button>

                        {Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
                            .filter((item) => {
                                if (pagination.totalPages <= 7) return true;

                                return (
                                    item === 1 ||
                                    item === pagination.totalPages ||
                                    Math.abs(item - pagination.page) <= 1
                                );
                            })
                            .map((item, index, array) => {
                                const previous = array[index - 1];

                                return (
                                    <div key={item} className={styles.pageWrapper}>
                                        {previous && item - previous > 1 && (
                                            <span className={styles.pageDots}>...</span>
                                        )}

                                        <button
                                            className={`${styles.pageButton} ${
                                                pagination.page === item
                                                    ? styles.pageButtonActive
                                                    : ''
                                            }`}
                                            onClick={() => setPage(item)}
                                        >
                                            {item}
                                        </button>
                                    </div>
                                );
                            })}

                        <button
                            className={styles.pageButton}
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            <i className="bi bi-chevron-right" />
                        </button>
                    </div>
                </footer>
            )}
            <CreateMenuTemplateModal
                open={openCreateModal}
                loading={loading}
                categories={categories}
                parentMenus={parentMenus}
                menu={editingMenu}
                onClose={() => {
                    setEditingMenu(null);
                    setOpenCreateModal(false);
                }}
                onSubmit={handleSubmitMenu}
            />
        </div>
    );
}
