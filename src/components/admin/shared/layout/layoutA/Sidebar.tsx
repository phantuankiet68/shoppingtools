"use client";

import type { CSSProperties, MouseEvent as ReactMouseEvent, RefObject } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import styles from "@/styles/admin/layouts/LayoutA.module.css";
import { useAdminLayoutStore } from "@/store/layout/layouta/index";
import { SECTION_ORDER, SECTION_TITLES, sectionOfTopItem, type Item, type SectionKey } from "@/utils/layout/menu.utils";

function positionFlyout(groupEl: HTMLElement, flyEl: HTMLElement) {
  const railRect = groupEl.getBoundingClientRect();
  const flyRect = flyEl.getBoundingClientRect();
  const vpH = window.innerHeight;

  const centerY = railRect.top + railRect.height / 2;
  const halfFly = flyRect.height / 2;

  let top = centerY - halfFly;
  const margin = 8;

  if (top < margin) top = margin;
  if (top + flyRect.height > vpH - margin) {
    top = Math.max(margin, vpH - margin - flyRect.height);
  }

  flyEl.style.top = `${top}px`;
  flyEl.style.left = `${railRect.right + 10}px`;
}

export default function Sidebar({ navRef }: { navRef: RefObject<HTMLDivElement | null> }) {
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
  const closeTimers = useRef<Record<string, number | undefined>>({});

  useEffect(() => {
    return () => {
      Object.values(closeTimers.current).forEach((id) => {
        if (id) window.clearTimeout(id);
      });
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const root = asideRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;

      if (collapsed) {
        useAdminLayoutStore.setState({ openGroups: {} });
      }
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [collapsed]);

  const sectionBuckets = useMemo(() => {
    const buckets: Record<SectionKey, { flats: Item[]; groups: Item[] }> = {
      overview: { flats: [], groups: [] },
      builder: { flats: [], groups: [] },
      commerce: { flats: [], groups: [] },
      system: { flats: [], groups: [] },
      account: { flats: [], groups: [] },
    };

    for (const it of items) {
      const sec = sectionOfTopItem(it.title);
      if (it.children?.length) buckets[sec].groups.push(it);
      else buckets[sec].flats.push(it);
    }

    return buckets;
  }, [items]);

  function scheduleCloseGroup(gKey: string, delay = 180) {
    const old = closeTimers.current[gKey];
    if (old) window.clearTimeout(old);

    closeTimers.current[gKey] = window.setTimeout(() => {
      useAdminLayoutStore.setState((s) => ({
        openGroups: { ...s.openGroups, [gKey]: false },
      }));
      closeTimers.current[gKey] = undefined;
    }, delay);
  }

  const onGroupMouseEnter = (gKey: string, ev: ReactMouseEvent<HTMLDivElement>) => {
    if (!collapsed) return;
    openGroupExclusive(gKey);

    const groupEl = ev.currentTarget;
    const fly = groupEl.querySelector<HTMLElement>(`[data-flyout="${gKey}"]`);
    if (fly) requestAnimationFrame(() => positionFlyout(groupEl, fly));
  };

  const onGroupMouseLeave = (gKey: string) => {
    if (!collapsed) return;
    scheduleCloseGroup(gKey, 220);
  };

  const closeSidebarIfMobile = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches) {
      setSidebarOpen(false);
    }
  };

  const railStyle: CSSProperties | undefined = collapsed ? { width: 84 } : undefined;

  const handleItemClick = (key: string) => {
    setActiveKey(key);
    try {
      localStorage.setItem("sb_active_key", key);
    } catch {}
    closeSidebarIfMobile();
  };

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
        ref={(el) => {
          asideRef.current = el;
        }}
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
        style={railStyle}
        aria-label="Sidebar"
      >
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
          {SECTION_ORDER.map((sec) => {
            const bucket = sectionBuckets[sec];
            const hasAny = bucket.flats.length + bucket.groups.length > 0;
            if (!hasAny) return null;

            return (
              <div key={sec} className={styles.section}>
                {!collapsed && <div className={styles.sectionTitle}>{SECTION_TITLES[sec]}</div>}

                <div className={styles.sectionList}>
                  {bucket.flats.map((it) => (
                    <Link
                      key={it.key}
                      href={it.path ?? "#"}
                      className={`${styles.navItem} ${activeKey === it.key ? styles.navItemActive : ""}`}
                      aria-current={activeKey === it.key ? "page" : undefined}
                      title={collapsed ? (it.title ?? undefined) : undefined}
                      aria-label={it.title ?? ""}
                      onClick={(e) => {
                        if (!it.path || it.path === "#") e.preventDefault();
                        handleItemClick(it.key);
                      }}
                    >
                      <span className={styles.navIcon}>
                        <i className={it.icon} />
                      </span>
                      {!collapsed && <span className={styles.navLabel}>{it.title ?? ""}</span>}
                    </Link>
                  ))}

                  {bucket.groups.map((g) => {
                    const isOpen = !!openGroups[g.key];

                    return (
                      <div
                        key={g.key}
                        className={styles.navGroup}
                        onMouseEnter={(e) => onGroupMouseEnter(g.key, e)}
                        onMouseLeave={() => onGroupMouseLeave(g.key)}
                      >
                        <button
                          type="button"
                          className={`${styles.navItem} ${styles.navGroupBtn} ${isOpen ? styles.navItemActive : ""}`}
                          aria-expanded={isOpen}
                          title={collapsed ? (g.title ?? undefined) : undefined}
                          aria-label={g.title ?? ""}
                          onClick={(e) => {
                            if (collapsed) return;
                            e.preventDefault();
                            toggleGroupExclusive(g.key);
                          }}
                        >
                          <span className={styles.navIcon}>
                            <i className={g.icon} />
                          </span>

                          {!collapsed && <span className={styles.navLabel}>{g.title ?? ""}</span>}

                          {!collapsed && (
                            <span className={`${styles.chev} ${isOpen ? styles.chevOpen : ""}`}>
                              <i className="bi bi-chevron-down" />
                            </span>
                          )}
                        </button>

                        {!collapsed && (
                          <div className={`${styles.submenu} ${isOpen ? styles.submenuOpen : ""}`}>
                            {g.children?.map((s) => (
                              <Link
                                key={s.key}
                                href={s.path ?? "#"}
                                className={`${styles.subItem} ${activeKey === s.key ? styles.subItemActive : ""}`}
                                title={s.title ?? undefined}
                                aria-label={s.title ?? ""}
                                onClick={(e) => {
                                  if (!s.path || s.path === "#") e.preventDefault();
                                  handleItemClick(s.key);
                                }}
                              >
                                <span className={styles.navIcon}>
                                  <i className={s.icon} />
                                </span>
                                <span className={styles.subLabel}>{s.title ?? ""}</span>
                              </Link>
                            ))}
                          </div>
                        )}

                        {collapsed && isOpen && (
                          <div data-flyout={g.key} className={styles.flyout}>
                            <div className={styles.flyoutTitle}>{g.title ?? ""}</div>
                            <div className={styles.flyoutList}>
                              {g.children?.map((s) => (
                                <Link
                                  key={s.key}
                                  href={s.path ?? "#"}
                                  className={`${styles.flyoutItem} ${
                                    activeKey === s.key ? styles.flyoutItemActive : ""
                                  }`}
                                  aria-label={s.title ?? ""}
                                  onClick={(e) => {
                                    if (!s.path || s.path === "#") e.preventDefault();
                                    handleItemClick(s.key);
                                    toggleGroupExclusive(g.key);
                                  }}
                                >
                                  <span className={styles.navIcon}>
                                    <i className={s.icon} />
                                  </span>
                                  <span>{s.title ?? ""}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {sec !== "account" && <div className={styles.sectionDivider} />}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
