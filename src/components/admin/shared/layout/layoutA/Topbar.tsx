'use client';

import AdminLocaleSwitcher from '@/components/admin/layouts/AdminLocaleSwitcher';
import { useAdminUser } from '@/components/admin/providers/AdminAuthProvider';
import {
    FunctionKeyBar,
    type FunctionKeyCode,
} from '@/components/admin/shared/layout/function-keys';
import { useFunctionKeysContext } from '@/components/admin/shared/layout/function-keys/FunctionKeysProvider';
import { useAdminLayoutStore } from '@/store/layout/layouta/index';
import styles from './Topbar.module.css';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Props = {
    meta: {
        title: string;
        subtitle?: string | null;
    };
    onLogout: () => void | Promise<void>;
};

type NotificationItem = {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    type: string;
    createdAt: string;
};

export default function Topbar({ meta, onLogout }: Props) {
    const {
        collapsed,
        toggleCollapsed,
        sidebarOpen,
        setSidebarOpen,
        user,
        userMenuOpen,
        setUserMenuOpen,
        notiOpen,
        setNotiOpen,
    } = useAdminLayoutStore();

    const { items, actions } = useFunctionKeysContext();

    const adminUser = useAdminUser();

    const isSystemAdmin = adminUser?.systemRole?.toUpperCase() === 'ADMIN';

    const [searchValue, setSearchValue] = useState('');

    const [chatOpen, setChatOpen] = useState(false);

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const userMenuRef = useRef<HTMLDivElement | null>(null);

    const notiRef = useRef<HTMLDivElement | null>(null);

    const chatRef = useRef<HTMLDivElement | null>(null);

    const unreadCount = notifications.filter((item) => !item.isRead).length;

    const displayTitle = meta.title || 'Dashboard';

    const displaySubtitle = meta.subtitle || 'Overview';

    const userName = user?.name ?? 'admin';

    const userRole = user?.role ?? 'Admin';

    const userInitial = userName.charAt(0).toUpperCase() || 'A';

    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    const loadNotifications = async () => {
        try {
            const response = await fetch('/api/admin/notifications');

            const result = await response.json();

            if (!result.success) {
                return;
            }

            setNotifications(result.data || []);
        } catch (error) {
            console.error('[Topbar] Failed to load notifications:', error);
        }
    };

    useEffect(() => {
        void loadNotifications();
    }, []);

    /* =====================================================
       OUTSIDE CLICK / ESCAPE
    ===================================================== */

    useEffect(() => {
        function onDocumentMouseDown(event: MouseEvent) {
            const target = event.target as Node;

            if (userMenuRef.current && !userMenuRef.current.contains(target)) {
                setUserMenuOpen(false);
            }

            if (notiRef.current && !notiRef.current.contains(target)) {
                setNotiOpen(false);
            }

            if (chatRef.current && !chatRef.current.contains(target)) {
                setChatOpen(false);
            }
        }

        function onEscape(event: KeyboardEvent) {
            if (event.key !== 'Escape') {
                return;
            }

            setUserMenuOpen(false);
            setNotiOpen(false);
            setChatOpen(false);
        }

        document.addEventListener('mousedown', onDocumentMouseDown);

        document.addEventListener('keydown', onEscape);

        return () => {
            document.removeEventListener('mousedown', onDocumentMouseDown);

            document.removeEventListener('keydown', onEscape);
        };
    }, [setNotiOpen, setUserMenuOpen]);

    const handleSidebarToggle = () => {
        if (typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches) {
            setSidebarOpen(!sidebarOpen);
            return;
        }

        toggleCollapsed();
    };

    /* =====================================================
       USER
    ===================================================== */

    const handleLogoutClick = async () => {
        setUserMenuOpen(false);
        await onLogout();
    };

    /* =====================================================
       FUNCTION KEYS
    ===================================================== */

    const handleFunctionClick = (key: FunctionKeyCode) => {
        actions[key]?.();
    };

    /* =====================================================
       SEARCH
    ===================================================== */

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!searchValue.trim()) {
            return;
        }

        // Search action can be connected later.
    };

    /* =====================================================
       NOTIFICATION
    ===================================================== */

    const handleMarkAsRead = async (id: string) => {
        try {
            await fetch(`/api/admin/notifications/${id}`, {
                method: 'PATCH',
            });

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              isRead: true,
                          }
                        : item,
                ),
            );
        } catch (error) {
            console.error('[Topbar] Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch('/api/admin/notifications/read-all', {
                method: 'PATCH',
            });

            setNotifications((previous) =>
                previous.map((item) => ({
                    ...item,
                    isRead: true,
                })),
            );
        } catch (error) {
            console.error('[Topbar] Failed to mark all notifications as read:', error);
        }
    };

    return (
        <header className={styles.topbar}>
            <div className={styles.topbarShell}>
                {/* =================================================
                    LEFT
                ================================================= */}

                <div className={styles.topbarLeft}>
                    <button
                        className={styles.sidebarToggle}
                        type="button"
                        onClick={handleSidebarToggle}
                        aria-label={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
                    >
                        <i
                            className={`bi ${
                                collapsed ? 'bi-layout-sidebar' : 'bi-layout-sidebar-inset'
                            }`}
                        />
                    </button>

                    <div className={styles.pageIdentity}>
                        <div className={styles.pageEyebrow}>KBUILDER</div>
                        <div className={styles.titleEyebrow}>
                            <div className={styles.pageTitle}>{displayTitle}</div>
                            <div className={styles.pageSubtitle}>{displaySubtitle}</div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    CENTER
                ================================================= */}

                <div className={styles.topbarCenter}>
                    {isSystemAdmin ? (
                        <form className={styles.topbarSearch} onSubmit={handleSearchSubmit}>
                            <span className={styles.topbarSearchIcon}>
                                <i className="bi bi-search" />
                            </span>

                            <input
                                type="text"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                className={styles.topbarSearchInput}
                                placeholder="Search anything..."
                                aria-label="Search"
                            />

                            <span className={styles.searchShortcut}>⌘ K</span>
                        </form>
                    ) : (
                        <div className={styles.functionBarWrap}>
                            <FunctionKeyBar items={items} onClick={handleFunctionClick} />
                        </div>
                    )}
                </div>

                {/* =================================================
                    RIGHT
                ================================================= */}

                <div className={styles.topbarRight}>
                    {/* Locale */}

                    <div className={styles.localeWrap}>
                        <AdminLocaleSwitcher />
                    </div>

                    {/* Divider */}

                    <div className={styles.actionDivider} />

                    {/* Quick actions */}

                    {isSystemAdmin && (
                        <div className={styles.quickActions}>
                            {/* CHAT */}

                            <div className={styles.actionWrap} ref={chatRef}>
                                <button
                                    className={styles.iconBtn}
                                    type="button"
                                    aria-label="Open chats"
                                    aria-haspopup="menu"
                                    aria-expanded={chatOpen}
                                    onClick={() => setChatOpen((previous) => !previous)}
                                >
                                    <i className="bi bi-chat-square-dots" />

                                    <span className={styles.actionBadge}>5</span>
                                </button>

                                {chatOpen && (
                                    <div className={styles.chatDropdown}>
                                        <div className={styles.dropdownHeader}>
                                            <div>
                                                <div className={styles.dropdownTitle}>Messages</div>

                                                <div className={styles.dropdownSubtitle}>
                                                    5 new messages
                                                </div>
                                            </div>

                                            <span className={styles.headerIcon}>
                                                <i className="bi bi-chat-dots" />
                                            </span>
                                        </div>

                                        <div className={styles.chatEmpty}>
                                            <div className={styles.emptyIcon}>
                                                <i className="bi bi-chat-heart" />
                                            </div>

                                            <strong>Your messages</strong>

                                            <span>Recent conversations will appear here.</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SETTINGS */}

                            <Link
                                href="/admin/settings"
                                className={styles.iconBtn}
                                aria-label="Settings"
                                title="Settings"
                            >
                                <i className="bi bi-sliders2" />
                            </Link>
                        </div>
                    )}

                    {/* NOTIFICATIONS */}

                    <div className={styles.actionWrap} ref={notiRef}>
                        <button
                            className={styles.iconBtn}
                            type="button"
                            aria-label="Notifications"
                            aria-haspopup="menu"
                            aria-expanded={notiOpen}
                            onClick={async () => {
                                if (!notiOpen) {
                                    await loadNotifications();
                                }

                                setNotiOpen(!notiOpen);
                            }}
                        >
                            <i className="bi bi-bell" />

                            {unreadCount > 0 && (
                                <span className={styles.actionBadge}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {notiOpen && (
                            <div
                                className={styles.dropdownCard}
                                role="menu"
                                aria-label="Notifications"
                            >
                                <div className={styles.dropdownHeader}>
                                    <div>
                                        <div className={styles.dropdownTitle}>Notifications</div>

                                        <div className={styles.dropdownSubtitle}>
                                            {unreadCount} unread notifications
                                        </div>
                                    </div>

                                    <button
                                        className={styles.textButton}
                                        type="button"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        Mark all
                                    </button>
                                </div>

                                <div className={styles.notificationList}>
                                    {notifications.length === 0 ? (
                                        <div className={styles.emptyNotification}>
                                            <div className={styles.emptyIcon}>
                                                <i className="bi bi-bell-slash" />
                                            </div>

                                            <strong>No notifications</strong>

                                            <span>You're all caught up.</span>
                                        </div>
                                    ) : (
                                        notifications.map((item) => (
                                            <button
                                                key={item.id}
                                                className={`${styles.notificationItem} ${
                                                    !item.isRead ? styles.notificationUnread : ''
                                                }`}
                                                type="button"
                                                onClick={() => handleMarkAsRead(item.id)}
                                            >
                                                <span
                                                    className={`${styles.notificationAccent} ${
                                                        styles[`accent_${item.type}`] || ''
                                                    }`}
                                                />

                                                <span className={styles.notificationIcon}>
                                                    <i className="bi bi-info-circle" />
                                                </span>

                                                <span className={styles.notificationContent}>
                                                    <span className={styles.notificationTitle}>
                                                        {item.title}
                                                    </span>

                                                    <span className={styles.notificationDesc}>
                                                        {item.message}
                                                    </span>

                                                    <span className={styles.notificationMeta}>
                                                        {new Date(item.createdAt).toLocaleString()}
                                                    </span>
                                                </span>

                                                {!item.isRead && (
                                                    <span className={styles.unreadDot} />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>

                                {notifications.length > 0 && (
                                    <div className={styles.dropdownFooter}>
                                        <button
                                            className={styles.ghostInlineBtn}
                                            type="button"
                                            onClick={handleMarkAllAsRead}
                                        >
                                            <i className="bi bi-check2-all" />
                                            Mark all as read
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* DIVIDER */}

                    <div className={styles.actionDivider} />

                    {/* USER */}

                    <div className={styles.userMenu} ref={userMenuRef}>
                        <button
                            className={styles.userTrigger}
                            type="button"
                            aria-label="User menu"
                            aria-haspopup="menu"
                            aria-expanded={userMenuOpen}
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className={styles.avatarWrap}>
                                <div className={styles.avatar}>{userInitial}</div>

                                <span className={styles.onlineDot} />
                            </div>

                            <div className={styles.userInfo}>
                                <div className={styles.userName}>{userName}</div>

                                <div className={styles.userRole}>{userRole}</div>
                            </div>

                            <span className={styles.userChevron}>
                                <i
                                    className={`bi bi-chevron-down ${
                                        userMenuOpen ? styles.chevronOpen : ''
                                    }`}
                                />
                            </span>
                        </button>

                        {userMenuOpen && (
                            <div
                                className={styles.userDropdown}
                                role="menu"
                                aria-label="User options"
                            >
                                <div className={styles.userDropdownProfile}>
                                    <div className={styles.dropdownAvatar}>{userInitial}</div>

                                    <div>
                                        <strong>{userName}</strong>

                                        <span>{userRole}</span>
                                    </div>
                                </div>

                                <div className={styles.dropdownDivider} />

                                <Link
                                    className={styles.dropdownItem}
                                    href="/admin/profile"
                                    role="menuitem"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <span className={styles.dropdownItemIcon}>
                                        <i className="bi bi-person" />
                                    </span>

                                    <span>Profile</span>

                                    <i className="bi bi-chevron-right" />
                                </Link>

                                <Link
                                    className={styles.dropdownItem}
                                    href="/admin/settings"
                                    role="menuitem"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <span className={styles.dropdownItemIcon}>
                                        <i className="bi bi-gear" />
                                    </span>

                                    <span>Settings</span>

                                    <i className="bi bi-chevron-right" />
                                </Link>

                                <div className={styles.dropdownDivider} />

                                <button
                                    type="button"
                                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                                    role="menuitem"
                                    onClick={handleLogoutClick}
                                >
                                    <span className={styles.dropdownItemIcon}>
                                        <i className="bi bi-box-arrow-right" />
                                    </span>

                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
