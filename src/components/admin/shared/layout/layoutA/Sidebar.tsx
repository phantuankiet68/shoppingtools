"use client";
import type { RefObject } from "react";
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
  if (top + flyRect.height > vpH - margin) top = Math.max(margin, vpH - margin - flyRect.height);

  flyEl.style.top = `${top}px`;
  flyEl.style.left = `${railRect.right + 8}px`;
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
      const map = closeTimers.current;
      Object.keys(map).forEach((k) => {
        const id = map[k];
        if (id) window.clearTimeout(id);
      });
    };
  }, []);

  // close groups if click outside sidebar while collapsed (giống code gốc)
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const root = asideRef.current;
      if (!root) return;
      const t = e.target as Node;
      if (root.contains(t)) return;
      if (collapsed) {
        // đóng tất cả group (exclusive)
        // store hiện không có action clear trực tiếp, nên mở group khác sẽ tự exclusive
        // ở đây giữ behavior: đóng hết
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
      useAdminLayoutStore.setState((s) => ({ openGroups: { ...s.openGroups, [gKey]: false } }));
      closeTimers.current[gKey] = undefined;
    }, delay);
  }

  const onGroupMouseEnter = (gKey: string, ev: React.MouseEvent<HTMLDivElement>) => {
    if (!collapsed) return;
    openGroupExclusive(gKey);

    const groupEl = ev.currentTarget as HTMLElement;
    const fly = groupEl.querySelector<HTMLElement>(`[data-flyout="${gKey}"]`);
    if (groupEl && fly) requestAnimationFrame(() => positionFlyout(groupEl, fly));
  };

  const onGroupMouseLeave = (gKey: string) => {
    if (!collapsed) return;
    scheduleCloseGroup(gKey, 220);
  };

  const closeSidebarIfMobile = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1024px)").matches) {
      setSidebarOpen(false);
    }
  };

  const railStyle: React.CSSProperties | undefined = collapsed ? { width: 80 } : undefined;

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
          <Link
            href="/admin"
            className={styles.brandLink}
            onClick={() => {
              closeSidebarIfMobile();
            }}
          >
            <div className={styles.brandLogo}>
              <span className={styles.brandLogoText}>A</span>
              <span className={styles.brandGlow} />
            </div>

            {!collapsed && (
              <div className={styles.brandText}>
                <div className={styles.brandTop}>
                  <div className={styles.brandName}>Manager</div>
                  <span className={styles.brandBadge}>Admin</span>
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
            const hasAny = (bucket.flats?.length || 0) + (bucket.groups?.length || 0) > 0;
            if (!hasAny) return null;

            return (
              <div key={sec}>
                <div className={styles.section}>
                  {!collapsed && <div className={styles.sectionTitle}>{SECTION_TITLES[sec]}</div>}

                  <div className={styles.sectionList}>
                    {bucket.flats.map((it) => (
                      <Link
                        key={it.key}
                        data-sb-key={it.key}
                        href={it.path || "#"}
                        data-ripple="1"
                        className={`${styles.navItem} ${activeKey === it.key ? styles.navItemActive : ""}`}
                        aria-current={activeKey === it.key ? "page" : undefined}
                        title={collapsed ? it.title : undefined}
                        aria-label={it.title}
                        onClick={(e) => {
                          if (!it.path || it.path === "#") e.preventDefault();
                          setActiveKey(it.key);
                          try {
                            localStorage.setItem("sb_active_key", it.key);
                          } catch {}
                          closeSidebarIfMobile();
                        }}
                      >
                        <span className={styles.navIcon}>
                          <i className={it.icon} />
                        </span>
                        {!collapsed && <span className={styles.navLabel}>{it.title}</span>}
                      </Link>
                    ))}

                    {bucket.groups.map((g) => {
                      const isOpen = !!openGroups[g.key];
                      return (
                        <div
                          className={styles.navGroup}
                          key={g.key}
                          onMouseEnter={(e) => onGroupMouseEnter(g.key, e)}
                          onMouseLeave={() => onGroupMouseLeave(g.key)}
                        >
                          <button
                            type="button"
                            data-sb-key={g.key}
                            data-ripple="1"
                            className={`${styles.navItem} ${styles.navGroupBtn} ${isOpen ? styles.navItemActive : ""}`}
                            aria-expanded={isOpen}
                            title={collapsed ? g.title : undefined}
                            aria-label={g.title}
                            onClick={(e) => {
                              if (collapsed) return;
                              e.preventDefault();
                              toggleGroupExclusive(g.key);
                            }}
                          >
                            <span className={styles.navIcon}>
                              <i className={g.icon} />
                            </span>
                            {!collapsed && <span className={styles.navLabel}>{g.title}</span>}
                            {!collapsed && (
                              <span className={`${styles.chev} ${isOpen ? styles.chevOpen : ""}`}>
                                <i className="bi bi-chevron-down" />
                              </span>
                            )}
                          </button>

                          {!collapsed && (
                            <div className={`${styles.submenu} ${isOpen ? styles.submenuOpen : ""}`}>
                              {g.children!.map((s) => (
                                <Link
                                  key={s.key}
                                  data-sb-key={s.key}
                                  href={s.path || "#"}
                                  data-ripple="1"
                                  className={`${styles.subItem} ${activeKey === s.key ? styles.subItemActive : ""}`}
                                  title={s.title}
                                  aria-label={s.title}
                                  onClick={(e) => {
                                    if (!s.path || s.path === "#") e.preventDefault();
                                    setActiveKey(s.key);
                                    try {
                                      localStorage.setItem("sb_active_key", s.key);
                                    } catch {}
                                    closeSidebarIfMobile();
                                  }}
                                >
                                  <span className={styles.subDot} />
                                  <span className={styles.subLabel}>{s.title}</span>
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* flyout collapsed */}
                          {collapsed && isOpen && (
                            <div data-flyout={g.key} className={styles.flyout}>
                              <div className={styles.flyoutTitle}>{g.title}</div>
                              <div className={styles.flyoutList}>
                                {g.children!.map((s) => (
                                  <Link
                                    key={s.key}
                                    href={s.path || "#"}
                                    data-ripple="1"
                                    onClick={(e) => {
                                      if (!s.path || s.path === "#") e.preventDefault();
                                      setActiveKey(s.key);
                                      try {
                                        localStorage.setItem("sb_active_key", s.key);
                                      } catch {}
                                      closeSidebarIfMobile();
                                      toggleGroupExclusive(g.key);
                                    }}
                                    className={`${styles.flyoutItem} ${activeKey === s.key ? styles.flyoutItemActive : ""}`}
                                  >
                                    <i className={s.icon} />
                                    <span>{s.title}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
