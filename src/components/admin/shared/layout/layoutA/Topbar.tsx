'use client';

import AdminLocaleSwitcher from '@/components/admin/layouts/AdminLocaleSwitcher';
import { useAdminUser } from '@/components/admin/providers/AdminAuthProvider';
import {
    FunctionKeyBar,
    type FunctionKeyCode,
} from '@/components/admin/shared/layout/function-keys';
import { useFunctionKeysContext } from '@/components/admin/shared/layout/function-keys/FunctionKeysProvider';
import { useAdminLayoutStore } from '@/store/layout/layouta/index';
import styles from '@/styles/admin/layouts/Topbar.module.css';
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
        toggleCollapsed();
    };

    const handleLogoutClick = async () => {
        setUserMenuOpen(false);
        await onLogout();
    };

    const handleFunctionClick = (key: FunctionKeyCode) => {
        actions[key]?.();
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!searchValue.trim()) {
            return;
        }
    };

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
                <div className={styles.topbarLeft}>
                    <button
                        className={styles.sidebarToggle}
                        type="button"
                        onClick={handleSidebarToggle}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-expanded={!collapsed}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <i
                            className={`bi ${
                                collapsed ? 'bi-text-indent-right' : 'bi-text-indent-left'
                            }`}
                        />
                    </button>
                </div>

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
                                placeholder="Search"
                                aria-label="Search help and features"
                            />

                            <button
                                type="submit"
                                className={styles.topbarSearchVisual}
                                aria-label="Submit search"
                                title="Search"
                            >
                                <img
                                    src="/assets/images/iconSearch.png"
                                    alt=""
                                    className={styles.topbarSearchImage}
                                />
                            </button>
                        </form>
                    ) : (
                        <FunctionKeyBar items={items} onClick={handleFunctionClick} />
                    )}
                </div>

                <AdminLocaleSwitcher />

                <div className={styles.topbarRight}>
                    {isSystemAdmin && (
                        <div className={styles.quickActions}>
                            <div className={styles.chatWrap} ref={chatRef}>
                                <button
                                    className={styles.iconBtn}
                                    type="button"
                                    aria-label="Open chats"
                                    aria-haspopup="menu"
                                    aria-expanded={chatOpen}
                                    onClick={() => setChatOpen((previous) => !previous)}
                                >
                                    <i className="bi bi-chat-dots" />
                                    <span className={styles.chatBadge}>5</span>
                                </button>
                            </div>

                            <Link
                                href="/admin/settings"
                                className={styles.iconBtn}
                                aria-label="Settings"
                                title="Settings"
                            >
                                <i className="bi bi-gear" />
                            </Link>
                        </div>
                    )}

                    <div className={styles.notiWrap} ref={notiRef}>
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
                                <span className={styles.chatBadge}>{unreadCount}</span>
                            )}
                        </button>

                        {notiOpen && (
                            <div
                                className={styles.dropdownCard}
                                role="menu"
                                aria-label="Notifications menu"
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
                                            No notifications yet
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

                                <div className={styles.dropdownFooter}>
                                    <button
                                        className={styles.ghostInlineBtn}
                                        type="button"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        <i className="bi bi-check2" />
                                        Mark all as read
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

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
                                <div className={styles.avatar}>
                                    {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
                                </div>

                                <span className={styles.onlineDot} />
                            </div>

                            <div className={styles.userInfo}>
                                <div className={styles.userName}>{user?.name ?? 'admin'}</div>

                                <div className={styles.userRole}>{user?.role ?? 'Admin'}</div>
                            </div>

                            <span className={styles.chevron}>
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
                                <Link
                                    className={styles.dropdownItem}
                                    href="/admin/profile"
                                    role="menuitem"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <i className="bi bi-person" />
                                    <span>Profile</span>
                                </Link>

                                <Link
                                    className={styles.dropdownItem}
                                    href="/admin/settings"
                                    role="menuitem"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <i className="bi bi-gear" />
                                    <span>Settings</span>
                                </Link>

                                <div className={styles.dropdownDivider} />

                                <button
                                    type="button"
                                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                                    role="menuitem"
                                    onClick={handleLogoutClick}
                                >
                                    <i className="bi bi-box-arrow-right" />
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
