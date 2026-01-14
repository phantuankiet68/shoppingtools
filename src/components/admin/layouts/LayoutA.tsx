"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/layouts/LayoutA.module.css";
import { usePathname } from "next/navigation";
import { useAdminTitle } from "@/components/admin/AdminTitleContext";
import UpdatePopup from "@/components/admin/layouts/UpdatePopup";
type AdminUser = { name: string; role: string };
type NotiTab = "all" | "messages" | "tasks" | "alerts";

/* ===================== Sidebar Types ===================== */
type Locale = "vi" | "en" | "ja";

type ApiMenuItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  locale: Locale;
  setKey?: "home" | "v1" | string;
};

type Item = {
  key: string;
  title: string;
  icon: string;
  path?: string | null;
  parentKey?: string | null;
  children?: Item[];
};

/* ===================== Sidebar Utils ===================== */
const LOCALE_PREFIX = /^\/(vi|en|ja)(?=\/|$)/i;
const ADD_PAGE_REGEX = /^\/(vi|en|ja)\/v1\/pages\/add(?:\/.*)?$/;

function getCurrentLocale(): Locale {
  if (typeof document !== "undefined") {
    const l = (document.documentElement.lang || "vi").toLowerCase();
    if (l === "vi" || l === "en" || l === "ja") return l;
  }
  return "vi";
}

function normalize(p?: string | null): string {
  if (!p) return "";
  let s = p.split("#")[0].split("?")[0].trim();
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function stripLocale(p?: string | null): string {
  const s = normalize(p);
  return (s.replace(LOCALE_PREFIX, "") || "/").replace(/\/{2,}/g, "/");
}

function buildTree(rows: ApiMenuItem[]): Item[] {
  const vis = rows.filter((r) => r.visible);
  const map = new Map<string, Item>();

  vis.forEach((r) =>
    map.set(r.id, {
      key: r.id,
      title: r.title,
      icon: r.icon || "bi bi-dot",
      path: normalize(r.path),
      parentKey: r.parentId,
      children: [],
    })
  );

  const roots: Item[] = [];
  vis.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) map.get(r.parentId)!.children!.push(node);
    else roots.push(node);
  });

  // sort theo sortOrder rồi tới title
  const sortMap: Record<string, number> = {};
  rows.forEach((r) => (sortMap[r.id] = r.sortOrder));

  const sortRec = (arr?: Item[]) => {
    if (!arr) return;
    arr.sort((a, b) => {
      const sa = sortMap[a.key] ?? 0;
      const sb = sortMap[b.key] ?? 0;
      if (sa !== sb) return sa - sb;
      return a.title.localeCompare(b.title);
    });
    arr.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);

  return roots;
}

/** Ripple nhẹ cho các phần tử có data-ripple (không cần CSS riêng) */
function useRipple(containerRef: React.RefObject<HTMLElement | null>, attrName = "data-ripple", duration = 520) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const onClick = (ev: MouseEvent) => {
      let host = ev.target as HTMLElement | null;
      while (host && host !== root && !host.hasAttribute(attrName)) host = host.parentElement;
      if (!host || host === root) return;

      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const span = document.createElement("span");

      span.style.position = "absolute";
      span.style.borderRadius = "999px";
      span.style.pointerEvents = "none";
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      span.style.left = `${ev.clientX - rect.left - size / 2}px`;
      span.style.top = `${ev.clientY - rect.top - size / 2}px`;
      span.style.background = "rgba(255,255,255,.18)";
      span.style.transform = "scale(0)";
      span.style.opacity = "1";
      span.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

      const cs = window.getComputedStyle(host);
      if (cs.position === "static") host.style.position = "relative";
      host.style.overflow = "hidden";

      host.appendChild(span);
      requestAnimationFrame(() => {
        span.style.transform = "scale(1)";
        span.style.opacity = "0";
      });

      const remove = () => span.isConnected && span.remove();
      const to = window.setTimeout(remove, duration + 80);
      span.addEventListener(
        "transitionend",
        () => {
          clearTimeout(to);
          remove();
        },
        { once: true }
      );
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [containerRef, attrName, duration]);
}

/* ===================== Match dài nhất ===================== */
type MatchResult = { hit: Item; trail: string[]; np: string } | null;

function bestMatchWithTrail(items: Item[], currentNoLocale: string): MatchResult {
  const stack: Item[] = [];
  let best: MatchResult = null;

  function dfs(arr: Item[]): void {
    for (const n of arr) {
      stack.push(n);

      const np = stripLocale(n.path || "");
      const ok = !!np && (currentNoLocale === np || currentNoLocale.startsWith(np + "/") || (np === "/" && currentNoLocale === "/"));

      if (ok) {
        const trail = stack.slice(0, -1).map((x) => x.key);
        if (!best || np.length > best.np.length) best = { hit: n, trail, np };
      }

      if (n.children?.length) dfs(n.children);
      stack.pop();
    }
  }

  dfs(items);
  return best;
}

/* ===================== Helpers UI ===================== */
const isAccountItem = (t: string) => /(account|profile|setting|logout|sign\s*out|chat)/i.test(t);
const isOverviewGroup = (title: string) => !isAccountItem(title);

/* Clamp vị trí flyout theo viewport */
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

type SectionKey = "overview" | "builder" | "commerce" | "system" | "account";

const SECTION_TITLES: Record<SectionKey, string> = {
  overview: "OVERVIEW",
  builder: "NO-CODE BUILDER",
  commerce: "COMMERCE",
  system: "SYSTEM",
  account: "ACCOUNT",
};

const SECTION_ORDER: SectionKey[] = ["overview", "builder", "commerce", "system", "account"];

function sectionOfTopItem(title: string): SectionKey {
  const t = (title || "").toLowerCase();
  if (isAccountItem(title)) return "account";
  if (/(^|\s)(builder)(\s|$)/i.test(title)) return "builder";
  if (/(products|inventory|orders|customers)/i.test(t)) return "commerce";
  if (/(integrations|settings|roles|logs|system)/i.test(t)) return "system";
  return "overview";
}

/* ===================== LayoutA ===================== */
export default function LayoutA({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // ===== LayoutA original states =====
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const [user, setUser] = useState<AdminUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const [notiOpen, setNotiOpen] = useState(false);
  const [notiTab, setNotiTab] = useState<NotiTab>("all");
  const notiRef = useRef<HTMLDivElement | null>(null);

  const { meta } = useAdminTitle();

  // ===== Sidebar dynamic states (tích hợp từ file đang vận hành) =====
  const [collapsed, setCollapsed] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [activeKey, setActiveKey] = useState("");

  const navRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement | null>(null);
  const closeTimers = useRef<Record<string, number | undefined>>({});

  useRipple(navRef);

  // ===== Load user (giữ nguyên) =====
  useEffect(() => {
    let alive = true;

    fetch("/api/admin/me", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (!alive) return;
        setUser(data?.user ?? null);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  // ===== Close user menu (giữ nguyên) =====
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!userMenuRef.current) return;
      const target = e.target as Node;
      if (!userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setUserMenuOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // ===== Close noti (giữ nguyên) =====
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!notiRef.current) return;
      const target = e.target as Node;
      if (!notiRef.current.contains(target)) setNotiOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setNotiOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const toggleNoti = () => setNotiOpen((v) => !v);

  // ===== Sidebar: click outside đóng flyout khi collapsed =====
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const root = asideRef.current;
      if (!root) return;
      const t = e.target as Node;
      if (root.contains(t)) return;
      if (collapsed) setOpenGroups({});
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [collapsed]);

  // ===== Sidebar: Fetch menu (giữ logic cũ) =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("size", "1000");
        params.set("sort", "sortOrder:asc");
        params.set("locale", getCurrentLocale());
        params.set("setKey", "v1");

        const res = await fetch(`/api/admin/menu-items?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load menu");
        const data = (await res.json()) as { items: ApiMenuItem[] };

        if (!alive) return;

        const tree = buildTree(data.items || []);
        setItems(tree);

        setOpenGroups({});
      } catch {
        setItems([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  function toggleGroupExclusive(gKey: string) {
    setOpenGroups((prev) => {
      const isOpen = !!prev[gKey];
      // nếu đang mở -> đóng hết
      if (isOpen) return {};
      // nếu đang đóng -> đóng hết cái khác và mở cái này
      return { [gKey]: true };
    });
  }

  function openGroupExclusive(gKey: string) {
    setOpenGroups((prev) => {
      if (prev[gKey]) return prev;
      return { [gKey]: true };
    });
  }

  // ===== Sidebar: Active theo URL (match dài nhất) =====
  useEffect(() => {
    if (!pathname || !items.length) return;

    const current = stripLocale(pathname);
    const res = bestMatchWithTrail(items, current);

    if (res?.hit) {
      setActiveKey(res.hit.key);

      setOpenGroups((prev) => {
        const next = { ...prev };
        res.trail.forEach((k) => (next[k] = true));
        return next;
      });

      try {
        localStorage.setItem("sb_active_key", res.hit.key);
      } catch {}

      const el = document.querySelector<HTMLElement>(`[data-sb-key="${res.hit.key}"]`);
      if (el) el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      return;
    }

    try {
      const k = localStorage.getItem("sb_active_key");
      if (k) setActiveKey(k);
    } catch {}
  }, [pathname, items]);

  // ===== Sidebar: Auto-collapse khi ở trang add page =====
  useEffect(() => {
    const shouldCollapse = ADD_PAGE_REGEX.test(pathname || "");
    setCollapsed(shouldCollapse);
    if (shouldCollapse) setOpenGroups({});
  }, [pathname]);

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
      setOpenGroups((prev) => ({ ...prev, [gKey]: false }));
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

  const railStyle: React.CSSProperties | undefined = collapsed ? { width: 76 } : undefined;

  return (
    <div className={`${styles.shell} ${sidebarOpen ? styles.shellSidebarOpen : styles.shellSidebarClosed}`}>
      {sidebarOpen && <button className={styles.backdrop} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" type="button" style={{ display: "none" }} />}

      <aside
        ref={(el) => {
          asideRef.current = el;
        }}
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
        style={railStyle}
        aria-label="Sidebar">
        <div className={styles.brandWrap}>
          <Link
            href="/admin"
            className={styles.brandLink}
            onClick={() => {
              closeSidebarIfMobile();
            }}>
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
                    {/* flats */}
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
                        }}>
                        <span className={styles.navIcon}>
                          <i className={it.icon} />
                        </span>
                        {!collapsed && <span className={styles.navLabel}>{it.title}</span>}
                      </Link>
                    ))}

                    {/* groups */}
                    {bucket.groups.map((g) => {
                      const isOpen = !!openGroups[g.key];
                      return (
                        <div className={styles.navGroup} key={g.key} onMouseEnter={(e) => onGroupMouseEnter(g.key, e)} onMouseLeave={() => onGroupMouseLeave(g.key)}>
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
                            }}>
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
                                  }}>
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
                                    className={`${styles.flyoutItem} ${activeKey === s.key ? styles.flyoutItemActive : ""}`}>
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

                {/* divider giữa các section */}
                {sec !== "account" && <div className={styles.sectionDivider} />}
              </div>
            );
          })}
        </nav>

        <UpdatePopup />
      </aside>

      {/* ===================== MAIN (giữ nguyên) ===================== */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.row1}>
            <div className={styles.left}>
              <button className={styles.burger} type="button" onClick={toggleSidebar} aria-label="Toggle sidebar" aria-expanded={sidebarOpen}>
                <i className={`bi ${sidebarOpen ? "bi-arrow-bar-left" : "bi-list"}`} />
              </button>

              <div className={styles.titleBlock}>
                <h1 className={styles.pageTitle}>{meta.title}</h1>
                <span className={styles.pageSubtitle}>{meta.subtitle ?? ""}</span>
              </div>
            </div>

            <div className={styles.center}>
              <div className={styles.search}>
                <span className={styles.searchIcon}>
                  <i className="bi bi-search" />
                </span>
                <input className={styles.searchInput} placeholder="Search anything…" />
              </div>
            </div>

            <div className={styles.right}>
              <div className={styles.row2}>
                <div className={styles.row2Right}>
                  <button className={styles.ghostBtn} type="button">
                    <i className="bi bi-funnel" />
                    Filters
                  </button>

                  <button className={styles.ghostBtn} type="button">
                    <i className="bi bi-download" />
                    Export
                  </button>

                  <button className={styles.ghostBtn} type="button">
                    <i className="bi bi-sliders" />
                    Customize
                  </button>
                </div>
              </div>

              <button className={styles.iconBtn} type="button" aria-label="Language">
                <i className="bi bi-globe2" />
              </button>

              <div className={styles.notiWrap} ref={notiRef}>
                <button className={styles.iconBtn} type="button" aria-label="Notifications" aria-haspopup="menu" aria-expanded={notiOpen} onClick={toggleNoti}>
                  <i className="bi bi-bell" />
                  <span className={styles.dot} />
                </button>

                {notiOpen && (
                  <div className={styles.notiDropdown} role="menu" aria-label="Notifications menu">
                    <div className={styles.notiHead}>
                      <div className={styles.notiTitle}>Notifications</div>
                      <button className={styles.notiLink} type="button">
                        VIEW ALL
                      </button>
                    </div>

                    <div className={styles.notiTabs}>
                      <button type="button" className={`${styles.notiTab} ${notiTab === "all" ? styles.notiTabActive : ""}`} onClick={() => setNotiTab("all")}>
                        All <span className={styles.notiBadge}>3</span>
                      </button>

                      <button type="button" className={`${styles.notiTab} ${notiTab === "messages" ? styles.notiTabActive : ""}`} onClick={() => setNotiTab("messages")}>
                        Messages <span className={styles.notiBadgeMuted}>2</span>
                      </button>

                      <button type="button" className={`${styles.notiTab} ${notiTab === "tasks" ? styles.notiTabActive : ""}`} onClick={() => setNotiTab("tasks")}>
                        Tasks <span className={styles.notiBadgeMuted}>1</span>
                      </button>

                      <button type="button" className={`${styles.notiTab} ${notiTab === "alerts" ? styles.notiTabActive : ""}`} onClick={() => setNotiTab("alerts")}>
                        Alerts
                      </button>
                    </div>

                    <div className={styles.notiList}>
                      <button className={styles.notiItem} type="button">
                        <span className={styles.notiBar} />
                        <span className={styles.notiItemText}>
                          <span className={styles.notiItemTitle}>You have a new task</span>
                          <span className={styles.notiItemSub}>Just now</span>
                        </span>
                      </button>

                      <button className={styles.notiItem} type="button">
                        <span className={styles.notiBar} />
                        <span className={styles.notiItemText}>
                          <span className={styles.notiItemTitle}>New message from Naomi</span>
                          <span className={styles.notiItemSub}>1 hour ago</span>
                        </span>
                      </button>

                      <button className={styles.notiItem} type="button">
                        <span className={styles.notiBar} />
                        <span className={styles.notiItemText}>
                          <span className={styles.notiItemTitle}>Your role has been set to Admin</span>
                          <span className={styles.notiItemSub}>3 days ago</span>
                        </span>
                      </button>

                      <button className={styles.notiItem} type="button">
                        <span className={styles.notiBar} />
                        <span className={styles.notiItemText}>
                          <span className={styles.notiItemTitle}>New message from Robert</span>
                          <span className={styles.notiItemSub}>2 weeks ago</span>
                        </span>
                      </button>
                    </div>

                    <div className={styles.notiFoot}>
                      <button className={styles.notiMark} type="button">
                        <i className="bi bi-check2" />
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <span className={styles.divider} />

              <div className={styles.userMenu} ref={userMenuRef}>
                <button className={styles.userBtn} type="button" aria-label="User menu" aria-haspopup="menu" aria-expanded={userMenuOpen} onClick={() => setUserMenuOpen((v) => !v)}>
                  <div className={styles.avatarWrap}>
                    <div className={styles.avatar}>A</div>
                    <span className={styles.status} />
                  </div>

                  <div className={styles.userText}>
                    <div className={styles.userName}>{user?.name ?? "—"}</div>
                    <div className={styles.userRole}>{user?.role ?? ""}</div>
                  </div>

                  <span className={styles.userChevron}>
                    <i className={`bi bi-chevron-down ${userMenuOpen ? styles.chevOpen : ""}`} />
                  </span>
                </button>

                {userMenuOpen && (
                  <div className={styles.userDropdown} role="menu" aria-label="User options">
                    <Link className={styles.menuItem} href="/admin/profile" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <span className={styles.menuIcon}>
                        <i className="bi bi-person" />
                      </span>
                      <span className={styles.menuText}>Profile</span>
                    </Link>

                    <Link className={styles.menuItem} href="/admin/settings" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <span className={styles.menuIcon}>
                        <i className="bi bi-gear" />
                      </span>
                      <span className={styles.menuText}>Settings</span>
                    </Link>

                    <div className={styles.userDropdownDivider} />

                    <Link className={`${styles.menuItem} ${styles.danger}`} href="/admin/logout" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <span className={styles.menuIcon}>
                        <i className="bi bi-box-arrow-right" />
                      </span>
                      <span className={styles.menuText}>Logout</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
