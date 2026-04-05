"use client";

import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  RefObject,
} from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import styles from "@/styles/admin/layouts/LayoutA.module.css";
import { useAdminLayoutStore } from "@/store/layout/layouta/index";
import {
  SECTION_ORDER,
  SECTION_TITLES,
  sectionOfTopItem,
  type Item,
  type SectionKey,
} from "@/utils/layout/menu.utils";

type SectionBucket = {
  flats: Item[];
  groups: Item[];
};

type CloseTimerMap = Record<
  string,
  ReturnType<typeof setTimeout> | number | undefined
>;

function positionFlyout(groupEl: HTMLElement, flyEl: HTMLElement) {
  const groupRect = groupEl.getBoundingClientRect();
  const flyRect = flyEl.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const margin = 8;

  const centerY = groupRect.top + groupRect.height / 2;
  const flyHalfHeight = flyRect.height / 2;

  let top = centerY - flyHalfHeight;

  if (top < margin) top = margin;

  if (top + flyRect.height > viewportHeight - margin) {
    top = Math.max(margin, viewportHeight - margin - flyRect.height);
  }

  flyEl.style.top = `${top}px`;
  flyEl.style.left = `${groupRect.right + 10}px`;
}

function createEmptySectionBuckets(): Record<SectionKey, SectionBucket> {
  return {
    overview: { flats: [], groups: [] },
    marketing: { flats: [], groups: [] },
    content: { flats: [], groups: [] },
    account: { flats: [], groups: [] },
  };
}

export default function Sidebar({
  navRef,
}: {
  navRef: RefObject<HTMLDivElement | null>;
}) {
  const {
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    items,
    openGroups,
    activeKey,
    setActiveKey,
    toggleGroupExclusive,
    openGroupExclusive,
  } = useAdminLayoutStore();

  const asideRef = useRef<HTMLElement | null>(null);
  const closeTimersRef = useRef<CloseTimerMap>({});

  const sectionBuckets = useMemo(() => {
    const buckets = createEmptySectionBuckets();

    for (const item of items) {
      const sectionKey = sectionOfTopItem(item.title);

      if (item.children?.length) {
        buckets[sectionKey].groups.push(item);
      } else {
        buckets[sectionKey].flats.push(item);
      }
    }

    return buckets;
  }, [items]);

  const railStyle = useMemo<CSSProperties | undefined>(() => {
    return collapsed ? { width: 84 } : undefined;
  }, [collapsed]);

  const clearCloseTimer = (groupKey: string) => {
    const timerId = closeTimersRef.current[groupKey];
    if (!timerId) return;

    window.clearTimeout(timerId);
    closeTimersRef.current[groupKey] = undefined;
  };

  const clearAllCloseTimers = () => {
    Object.values(closeTimersRef.current).forEach((timerId) => {
      if (timerId) window.clearTimeout(timerId);
    });
    closeTimersRef.current = {};
  };

  const closeSidebarIfMobile = () => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(max-width: 900px)").matches) {
      setSidebarOpen(false);
    }
  };

  const handleItemClick = (key: string) => {
    setActiveKey(key);

    try {
      localStorage.setItem("sb_active_key", key);
    } catch {}

    closeSidebarIfMobile();
  };

  const scheduleCloseGroup = (groupKey: string, delay = 180) => {
    clearCloseTimer(groupKey);

    closeTimersRef.current[groupKey] = window.setTimeout(() => {
      useAdminLayoutStore.setState((state) => ({
        openGroups: {
          ...state.openGroups,
          [groupKey]: false,
        },
      }));

      closeTimersRef.current[groupKey] = undefined;
    }, delay);
  };

  const handleGroupMouseEnter = (
    groupKey: string,
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    if (!collapsed) return;

    clearCloseTimer(groupKey);
    openGroupExclusive(groupKey);

    const groupElement = event.currentTarget;
    const flyoutElement = groupElement.querySelector<HTMLElement>(
      `[data-flyout="${groupKey}"]`
    );

    if (flyoutElement) {
      requestAnimationFrame(() => {
        positionFlyout(groupElement, flyoutElement);
      });
    }
  };

  const handleGroupMouseLeave = (groupKey: string) => {
    if (!collapsed) return;
    scheduleCloseGroup(groupKey, 220);
  };

  useEffect(() => {
    return () => {
      clearAllCloseTimers();
    };
  }, []);

  useEffect(() => {
    if (!collapsed) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const root = asideRef.current;
      if (!root) return;
      if (root.contains(event.target as Node)) return;

      useAdminLayoutStore.setState({ openGroups: {} });
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [collapsed]);

  return (
    <>
      {sidebarOpen && (
        <button
          className={styles.backdrop}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          type="button"
        />
      )}

      <aside
        ref={(element) => {
          asideRef.current = element;
        }}
        data-collapsed={collapsed ? "true" : "false"}
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
        style={railStyle}
        aria-label="Sidebar"
      >
        <div className={styles.sidebarPanel}>
          <div className={styles.brandWrap}>
            <Link href="/admin" className={styles.brandLink}>
              <div className={styles.brandLogo}>
                <span className={styles.brandLogoText}>A</span>
              </div>

              {!collapsed && (
                <div className={styles.brandText}>
                  <div className={styles.brandTop}>
                    <div className={styles.brandName}>Manager</div>
                  </div>

                  <div className={styles.brandSub}>
                    <i className="bi bi-shield-lock" />
                    <span>Dashboard Panel</span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          <nav className={styles.nav} ref={navRef}>
            {SECTION_ORDER.map((sectionKey) => {
              const bucket = sectionBuckets[sectionKey];
              const hasItems = bucket.flats.length + bucket.groups.length > 0;

              if (!hasItems) return null;

              return (
                <div key={sectionKey} className={styles.section}>
                  {!collapsed && (
                    <div className={styles.sectionTitle}>
                      {SECTION_TITLES[sectionKey]}
                    </div>
                  )}

                  <div className={styles.sectionList}>
                    {bucket.flats.map((item) => (
                      <Link
                        key={item.key}
                        href={item.path ?? "#"}
                        className={`${styles.navItem} ${
                          activeKey === item.key ? styles.navItemActive : ""
                        }`}
                        aria-current={activeKey === item.key ? "page" : undefined}
                        title={collapsed ? item.title ?? undefined : undefined}
                        aria-label={item.title ?? ""}
                        onClick={(event) => {
                          if (!item.path || item.path === "#") {
                            event.preventDefault();
                          }
                          handleItemClick(item.key);
                        }}
                      >
                        <span className={styles.navIcon}>
                          <i className={item.icon} />
                        </span>

                        {!collapsed && (
                          <span className={styles.navLabel}>{item.title ?? ""}</span>
                        )}
                      </Link>
                    ))}

                    {bucket.groups.map((group) => {
                      const isOpen = Boolean(openGroups[group.key]);

                      return (
                        <div
                          key={group.key}
                          className={styles.navGroup}
                          onMouseEnter={(event) =>
                            handleGroupMouseEnter(group.key, event)
                          }
                          onMouseLeave={() => handleGroupMouseLeave(group.key)}
                        >
                          <button
                            type="button"
                            className={`${styles.navItem} ${styles.navGroupBtn} ${
                              isOpen ? styles.navItemActive : ""
                            }`}
                            aria-expanded={isOpen}
                            title={collapsed ? group.title ?? undefined : undefined}
                            aria-label={group.title ?? ""}
                            onClick={(event) => {
                              if (collapsed) return;
                              event.preventDefault();
                              toggleGroupExclusive(group.key);
                            }}
                          >
                            <span className={styles.navIcon}>
                              <i className={group.icon} />
                            </span>

                            {!collapsed && (
                              <span className={styles.navLabel}>
                                {group.title ?? ""}
                              </span>
                            )}

                            {!collapsed && (
                              <span
                                className={`${styles.chev} ${
                                  isOpen ? styles.chevOpen : ""
                                }`}
                              >
                                <i className="bi bi-chevron-down" />
                              </span>
                            )}
                          </button>

                          {!collapsed && (
                            <div
                              className={`${styles.submenu} ${
                                isOpen ? styles.submenuOpen : ""
                              }`}
                            >
                              {group.children?.map((subItem) => (
                                <Link
                                  key={subItem.key}
                                  href={subItem.path ?? "#"}
                                  className={`${styles.subItem} ${
                                    activeKey === subItem.key
                                      ? styles.subItemActive
                                      : ""
                                  }`}
                                  title={subItem.title ?? undefined}
                                  aria-label={subItem.title ?? ""}
                                  onClick={(event) => {
                                    if (!subItem.path || subItem.path === "#") {
                                      event.preventDefault();
                                    }
                                    handleItemClick(subItem.key);
                                  }}
                                >
                                  <span className={styles.navIcon}>
                                    <i className={subItem.icon} />
                                  </span>
                                  <span className={styles.subLabel}>
                                    {subItem.title ?? ""}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}

                          {collapsed && isOpen && (
                            <div data-flyout={group.key} className={styles.flyout}>
                              <div className={styles.flyoutTitle}>
                                {group.title ?? ""}
                              </div>

                              <div className={styles.flyoutList}>
                                {group.children?.map((subItem) => (
                                  <Link
                                    key={subItem.key}
                                    href={subItem.path ?? "#"}
                                    className={`${styles.flyoutItem} ${
                                      activeKey === subItem.key
                                        ? styles.flyoutItemActive
                                        : ""
                                    }`}
                                    aria-label={subItem.title ?? ""}
                                    onClick={(event) => {
                                      if (!subItem.path || subItem.path === "#") {
                                        event.preventDefault();
                                      }
                                      handleItemClick(subItem.key);
                                      toggleGroupExclusive(group.key);
                                    }}
                                  >
                                    <span className={styles.navIcon}>
                                      <i className={subItem.icon} />
                                    </span>
                                    <span>{subItem.title ?? ""}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {sectionKey !== "account" && (
                    <div className={styles.sectionDivider} />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}