"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Header/HeaderAnnouncement.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type MegaColumn = {
  title: string;
  items: { label: string; href: string }[];
};

export type NavItem =
  | { type: "link"; label: string; href: string; icon: string }
  | { type: "mega"; label: string; icon: string; columns: MegaColumn[] };

export type CategoryMenuItem = {
  label: string;
  href: string;
  emoji?: string;
};

export type HeaderAnnouncementProps = {
  brandHref?: string;
  brandName?: string;
  brandSub?: string;
  logoSrc: string;
  logoAlt?: string;
  searchPlaceholder?: string;
  onSearchSubmit?: (q: string) => void;
  badgeStoreLocator?: number;
  badgeCart?: number;
  navItems?: NavItem[];
  categoryItems?: CategoryMenuItem[];
  preview?: boolean;
  menuApiUrl?: string;
  menuSetKey?: string;
  menuSiteIdKey?: string;
  isAuthed?: boolean;
  onLogin?: (payload: { email: string; password: string }) => Promise<void> | void;
  onRegister?: (payload: { name: string; email: string; password: string }) => Promise<void> | void;
};



type AuthMode = "login" | "register";

type ApiLayoutItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  locale: string;
  setKey: string;
};

type ApiTreeNode = {
  key: string;
  title: string;
  icon: string;
  path: string | null;
  parentKey: string | null;
  children?: ApiTreeNode[];
};

function normalizePath(p?: string | null): string {
  const s = String(p || "").trim();
  if (!s) return "/";
  return s.startsWith("/") ? s : `/${s}`;
}

function toIcon(raw?: string | null): string {
  const s = String(raw || "").trim();
  if (!s) return "bi-dot";
  return s
    .replace(/^bi\s+/i, "")
    .replace(/^bi\s+bi-/i, "bi-")
    .replace(/^bi\s+bi\s+/i, "");
}

function buildTreeFromItems(rows: ApiLayoutItem[]): ApiTreeNode[] {
  const vis = (rows || []).filter((r) => !!r.visible);

  const map = new Map<string, ApiTreeNode>();
  vis.forEach((r) => {
    map.set(r.id, {
      key: r.id,
      title: r.title,
      icon: toIcon(r.icon),
      path: r.path,
      parentKey: r.parentId,
      children: [],
    });
  });

  const roots: ApiTreeNode[] = [];
  vis.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) {
      map.get(r.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortMap: Record<string, number> = {};
  (rows || []).forEach((r) => {
    sortMap[r.id] = r.sortOrder;
  });

  const sortRec = (arr?: ApiTreeNode[]) => {
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

function treeToNavItems(tree: ApiTreeNode[]): NavItem[] {
  const out: NavItem[] = [];

  for (const n of tree || []) {
    const icon = toIcon(n.icon);
    const children = n.children || [];

    if (!children.length) {
      out.push({
        type: "link",
        label: n.title,
        href: normalizePath(n.path),
        icon,
      });
      continue;
    }

    const columns: MegaColumn[] = children
      .map((c) => {
        const grand = c.children || [];

        const colItems = grand
          .filter((g) => !!g?.title && !!g?.path)
          .map((g) => ({
            label: g.title,
            href: normalizePath(g.path),
          }));

        if (!colItems.length && c.path) {
          return {
            title: c.title,
            items: [{ label: c.title, href: normalizePath(c.path) }],
          };
        }

        return { title: c.title, items: colItems };
      })
      .filter((col) => col.title && col.items.length);

    if (!columns.length) {
      out.push({
        type: "link",
        label: n.title,
        href: normalizePath(n.path),
        icon,
      });
      continue;
    }

    out.push({
      type: "mega",
      label: n.title,
      icon,
      columns,
    });
  }

  return out;
}

export function HeaderAnnouncement({
  brandHref = "/",
  brandName = "Tuan Kiet Store",
  brandSub = "COSMETICS",
  logoSrc,
  logoAlt = "",
  searchPlaceholder = "What are you looking for?",
  onSearchSubmit,
  badgeStoreLocator = 2,
  badgeCart = 0,
  navItems,
  preview = false,
  menuApiUrl = "/api/admin/builder/menus/header-menu",
  menuSetKey = "home",
  menuSiteIdKey = "builder_site_id",
  isAuthed = false,
  onLogin,
  onRegister,
}: HeaderAnnouncementProps) {
  const rootRef = useRef<HTMLElement | null>(null);

  const [safeLogo, setSafeLogo] = useState(logoSrc || "/assets/images/logo.jpg");
  useEffect(() => setSafeLogo(logoSrc || "/assets/images/logo.jpg"), [logoSrc]);

  const [apiNav, setApiNav] = useState<NavItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);

  const items = useMemo(() => {
    if (navItems && navItems.length > 0) return navItems;
    return apiNav;
  }, [navItems, apiNav]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const qs = new URLSearchParams();
        qs.set("setKey", menuSetKey || "home");
        qs.set("tree", "1");
        qs.set("includeHidden", "0");
        qs.set("page", "1");
        qs.set("size", "1000");
        qs.set("sort", "sortOrder:asc");

        const siteId =
          typeof window !== "undefined" ? localStorage.getItem(menuSiteIdKey) : null;
        if (siteId) qs.set("siteId", siteId);

        const res = await fetch(`${menuApiUrl}?${qs.toString()}`, {
          cache: "no-store",
          credentials: "include",
          headers: {
            "x-site-domain": typeof window !== "undefined" ? window.location.host : "",
          },
        });

        if (!res.ok) throw new Error("Failed to load header menu");

        const data = (await res.json()) as {
          tree?: ApiTreeNode[];
          items?: ApiLayoutItem[];
        };

        let tree: ApiTreeNode[] = [];

        if (Array.isArray(data.tree) && data.tree.length) {
          tree = data.tree;
        } else if (Array.isArray(data.items) && data.items.length) {
          tree = buildTreeFromItems(data.items);
        }

        const mapped = treeToNavItems(tree);

        if (!alive) return;
        setApiNav(mapped);
        setMenuLoaded(true);
      } catch {
        if (!alive) return;
        setApiNav([]);
        setMenuLoaded(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [preview, menuApiUrl, menuSetKey, menuSiteIdKey]);

  const [query, setQuery] = useState("");
  const [openMegaIndex, setOpenMegaIndex] = useState<number | null>(null);

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const closeAll = () => {
    setOpenMegaIndex(null);
    setCategoryOpen(false);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (rootRef.current && rootRef.current.contains(target)) return;
      closeAll();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const openAuth = (mode: AuthMode) => {
    setErr("");
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);
    setBusy(false);
    setErr("");
  };

  useEffect(() => {
    if (!authOpen) return;
    const t = window.setTimeout(() => firstInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [authOpen, authMode]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());

  const submitLogin = async () => {
    setErr("");
    const email = loginEmail.trim();
    const password = loginPass;

    if (!validateEmail(email)) return setErr("Please enter a valid email.");
    if (!password || password.length < 6) {
      return setErr("Password must be at least 6 characters.");
    }

    setBusy(true);
    try {
      await onLogin?.({ email, password });
      closeAuth();
    } catch (e: any) {
      setErr(e?.message || "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async () => {
    setErr("");
    const name = regName.trim();
    const email = regEmail.trim();
    const password = regPass;

    if (!name) return setErr("Please enter your name.");
    if (!validateEmail(email)) return setErr("Please enter a valid email.");
    if (!password || password.length < 6) {
      return setErr("Password must be at least 6 characters.");
    }

    setBusy(true);
    try {
      await onRegister?.({ name, email, password });
      closeAuth();
    } catch (e: any) {
      setErr(e?.message || "Register failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onAccountClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthed) {
      openAuth("login");
      return;
    }

    openAuth("login");
  };
  const categoryItems = [
     { label: "Sản phẩm mới", href: "/new-arrivals", emoji: "🆕" },
    { label: "Bán chạy", href: "/best-sellers", emoji: "🔥" },
    { label: "Khuyến mãi", href: "/sale", emoji: "🏷️" },
    { label: "Phụ kiện", href: "/accessories", emoji: "⌚" },
    { label: "Chăm sóc cá nhân", href: "/beauty", emoji: "💄" },
    { label: "Chăm sóc sức khỏe", href: "/health", emoji: "💊" },
    { label: "Đồ gia dụng", href: "/home-living", emoji: "🏠" },
    { label: "Công nghệ", href: "/tech", emoji: "📱" },
    { label: "Thể thao & dã ngoại", href: "/sports", emoji: "🏃" },
    { label: "Mẹ & bé", href: "/mom-baby", emoji: "🍼" },
    { label: "Quà tặng", href: "/gifts", emoji: "🎁" }
  ]
  const [categoryOpen, setCategoryOpen] = useState(false);

 return (
  <header className={cls.header} ref={rootRef}>
    <div className={cls.mainShell}>
      <div className={cls.container}>
        <div className={cls.mainRow}>
          <div className={cls.leftZone}>
            {preview ? (
              <a className={cls.logo} href="#" aria-label={brandName} onClick={onBlockClick}>
                <span className={cls.logoBadge}>
                  <Image
                    src={safeLogo}
                    alt={logoAlt}
                    fill
                    className={cls.logoImg}
                    onError={() => setSafeLogo("/assets/images/logo.jpg")}
                  />
                </span>

                <span className={cls.logoText}>
                  <span className={cls.logoName}>{brandName}</span>
                  <span className={cls.logoSub}>{brandSub}</span>
                </span>
              </a>
            ) : (
              <Link className={cls.logo} href={brandHref as Route} aria-label={brandName}>
                <span className={cls.logoBadge}>
                  <Image
                    src={safeLogo}
                    alt={logoAlt}
                    fill
                    className={cls.logoImg}
                    onError={() => {
                      const fallback = "/assets/images/logo.jpg";
                      if (safeLogo !== fallback) setSafeLogo(fallback);
                    }}
                  />
                </span>

                <span className={cls.logoText}>
                  <span className={cls.logoName}>{brandName}</span>
                  <span className={cls.logoSub}>{brandSub}</span>
                </span>
              </Link>
            )}
          </div>

          <div className={cls.centerZone}>
              <form
              className={cls.search}
              onSubmit={(e) => {
                e.preventDefault();
                if (preview) return;
                onSearchSubmit?.(query);
              }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder={searchPlaceholder}
              />
              <button type="submit" aria-label="Search">
                <i className="bi bi-search" />
              </button>
            </form>
          </div>

          <div className={cls.rightZone}>
            <button
              className={`${cls.actionBtn} ${cls.accountBtn}`}
              type="button"
              onClick={onAccountClick}
              aria-haspopup="dialog"
              aria-expanded={authOpen}
            >
              <span className={cls.actionIcon}>
                <i className="bi bi-person-fill" />
              </span>
              <span className={cls.actionText}>
                <span>Đăng nhập</span>
                <strong>Tài khoản</strong>
              </span>
              <i className={`bi bi-chevron-down ${cls.actionCaret}`} />
            </button>

            <button
              className={cls.actionBtn}
              type="button"
              onClick={onBlockClick}
              aria-label="Store system"
            >
              <span className={cls.actionIcon}>
                <i className="bi bi-shop" />
              </span>
              <span className={cls.actionText}>
                <span>Hệ thống</span>
                <strong>Thông báo</strong>
              </span>
            </button>
            <button
              className={cls.cartBtn}
              type="button"
              onClick={onBlockClick}
              aria-label="Cart"
            >
              <i className="bi bi-cart3" />
              <span className={cls.badge}>{badgeCart}</span>
            </button>
          </div>
        </div>
        <div className={cls.navWrap}>
  <div
    className={`${cls.categoryNav} ${categoryOpen ? cls.categoryNavOpen : ""}`}
    tabIndex={0}
    role="button"
    aria-haspopup="true"
    aria-expanded={categoryOpen}
    onMouseEnter={() => {
      if (!preview) setCategoryOpen(true);
    }}
    onMouseLeave={() => {
      if (!preview) setCategoryOpen(false);
    }}
    onClick={(e) => {
      if (preview) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCategoryOpen((v) => !v);
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setCategoryOpen((v) => !v);
      }
      if (e.key === "Escape") setCategoryOpen(false);
    }}
  >
    <div className={cls.categoryTrigger}>
      <span className={cls.categoryTriggerLeft}>
        <i className="bi bi-list" />
        <span>Danh mục sản phẩm</span>
      </span>
    </div>

    <div className={cls.categoryDropdown}>
      <div className={cls.categoryPanel}>
          {categoryItems.map((cat, idx) =>
            preview ? (
              <a key={idx} href="#" className={cls.categoryItem} onClick={onBlockClick}>
                <span className={cls.categoryItemIcon}>{cat.emoji || "•"}</span>
                <span className={cls.categoryItemText}>{cat.label}</span>
              </a>
            ) : (
              <Link
                key={idx}
                href={(cat.href || "/") as Route}
                className={cls.categoryItem}
              >
                <span className={cls.categoryItemIcon}>{cat.emoji || "•"}</span>
                <span className={cls.categoryItemText}>{cat.label}</span>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>

    <nav className={cls.nav} aria-label="Primary navigation">
      {items.map((it, idx) => {
        const iconCls = `bi ${it.icon}`;
        const isMega = it.type === "mega";
        const isOpen = openMegaIndex === idx;

        if (!isMega) {
          return preview ? (
            <a key={idx} className={cls.navItem} href="#" onClick={onBlockClick}>
              <i className={iconCls} />
              <span>{it.label}</span>
            </a>
          ) : (
            <Link key={idx} className={cls.navItem} href={(it.href || "/") as Route}>
              <i className={iconCls} />
              <span>{it.label}</span>
            </Link>
          );
        }

        return (
          <div
            key={idx}
            className={`${cls.navItem} ${cls.navItemMega} ${isOpen ? cls.open : ""}`}
            tabIndex={0}
            role="button"
            aria-haspopup="true"
            aria-expanded={isOpen}
            onMouseEnter={() => {
              if (!preview) setOpenMegaIndex(idx);
            }}
            onMouseLeave={() => {
              if (!preview) setOpenMegaIndex(null);
            }}
            onClick={(e) => {
              if (preview) {
                e.preventDefault();
                e.stopPropagation();
                setOpenMegaIndex((cur) => (cur === idx ? null : idx));
                return;
              }
              setOpenMegaIndex((cur) => (cur === idx ? null : idx));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenMegaIndex((cur) => (cur === idx ? null : idx));
              }
              if (e.key === "Escape") setOpenMegaIndex(null);
            }}
          >
            <i className={iconCls} />
            <span>{it.label}</span>
            <i className={`bi bi-chevron-down ${cls.navCaret}`} />

            <div className={cls.mega} role="menu" aria-label={`${it.label} menu`}>
              <div className={cls.megaGrid}>
                {it.columns.map((col, cIdx) => (
                  <div className={cls.megaCol} key={cIdx}>
                    <h4>{col.title}</h4>

                    {col.items.map((link, lIdx) =>
                      preview ? (
                        <a key={lIdx} href="#" onClick={onBlockClick}>
                          <span>{link.label}</span>
                          <i className="bi bi-arrow-right-short" />
                        </a>
                      ) : (
                        <Link key={lIdx} href={(link.href || "/") as Route}>
                          <span>{link.label}</span>
                          <i className="bi bi-arrow-right-short" />
                        </Link>
                      ),
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  </div>
      </div>
    </div>

    {authOpen && (
      <div
        className={cls.authOverlay}
        role="dialog"
        aria-modal="true"
        aria-label={authMode === "login" ? "Login dialog" : "Register dialog"}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) closeAuth();
        }}
      >
        <div className={cls.authPanel}>
          <div className={cls.authHead}>
            <div className={cls.authTitle}>
              {authMode === "login" ? "Welcome back" : "Create your account"}
            </div>

            <button
              className={cls.authClose}
              type="button"
              onClick={closeAuth}
              aria-label="Close"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className={cls.authTabs} role="tablist" aria-label="Auth tabs">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === "login"}
              className={`${cls.authTab} ${authMode === "login" ? cls.authTabActive : ""}`}
              onClick={() => {
                setErr("");
                setAuthMode("login");
              }}
            >
              Login
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={authMode === "register"}
              className={`${cls.authTab} ${authMode === "register" ? cls.authTabActive : ""}`}
              onClick={() => {
                setErr("");
                setAuthMode("register");
              }}
            >
              Register
            </button>
          </div>

          {err ? (
            <div className={cls.authError} role="status" aria-live="polite">
              <i className="bi bi-exclamation-triangle" />
              <span>{err}</span>
            </div>
          ) : null}

          {authMode === "login" ? (
            <form
              className={cls.authForm}
              onSubmit={(e) => {
                e.preventDefault();
                if (busy) return;
                submitLogin();
              }}
            >
              <label className={cls.authLabel}>
                Email
                <div className={cls.authInputWrap}>
                  <i className={`bi bi-envelope ${cls.authInputIcon}`} />
                  <input
                    ref={firstInputRef}
                    className={cls.authInput}
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className={cls.authLabel}>
                Password
                <div className={cls.authInputWrap}>
                  <i className={`bi bi-lock ${cls.authInputIcon}`} />
                  <input
                    className={cls.authInput}
                    type={showPass ? "text" : "password"}
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    className={cls.authEye}
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </label>

              <div className={cls.authRow}>
                <button className={cls.authPrimary} type="submit" disabled={busy}>
                  {busy ? "Signing in…" : "Login"}
                </button>

                <button
                  className={cls.authGhost}
                  type="button"
                  onClick={() => {
                    setErr("");
                    setAuthMode("register");
                  }}
                >
                  Create account
                </button>
              </div>
            </form>
          ) : (
            <form
              className={cls.authForm}
              onSubmit={(e) => {
                e.preventDefault();
                if (busy) return;
                submitRegister();
              }}
            >
              <label className={cls.authLabel}>
                Full name
                <div className={cls.authInputWrap}>
                  <i className={`bi bi-person ${cls.authInputIcon}`} />
                  <input
                    ref={firstInputRef}
                    className={cls.authInput}
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
              </label>

              <label className={cls.authLabel}>
                Email
                <div className={cls.authInputWrap}>
                  <i className={`bi bi-envelope ${cls.authInputIcon}`} />
                  <input
                    className={cls.authInput}
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className={cls.authLabel}>
                Password
                <div className={cls.authInputWrap}>
                  <i className={`bi bi-lock ${cls.authInputIcon}`} />
                  <input
                    className={cls.authInput}
                    type={showPass ? "text" : "password"}
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    className={cls.authEye}
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </label>

              <div className={cls.authRow}>
                <button className={cls.authPrimary} type="submit" disabled={busy}>
                  {busy ? "Creating…" : "Register"}
                </button>

                <button
                  className={cls.authGhost}
                  type="button"
                  onClick={() => {
                    setErr("");
                    setAuthMode("login");
                  }}
                >
                  I already have an account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}
  </header>
);
}

function parseNavItems(raw?: string): NavItem[] | undefined {
  if (!raw) return undefined;

  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const cleaned: NavItem[] = [];

    for (const it of val) {
      if (it?.type === "link" && it?.label && it?.href && it?.icon) {
        cleaned.push({
          type: "link",
          label: String(it.label),
          href: String(it.href),
          icon: String(it.icon),
        });
        continue;
      }

      if (it?.type === "mega" && it?.label && it?.icon && Array.isArray(it?.columns)) {
        const cols: MegaColumn[] = it.columns
          .filter(Boolean)
          .map((c: any) => ({
            title: String(c?.title ?? ""),
            items: Array.isArray(c?.items)
              ? c.items
                  .filter(Boolean)
                  .map((x: any) => ({
                    label: String(x?.label ?? ""),
                    href: String(x?.href ?? ""),
                  }))
                  .filter((x: any) => x.label && x.href)
              : [],
          }))
          .filter((c: MegaColumn) => c.title && c.items.length);

        if (cols.length) {
          cleaned.push({
            type: "mega",
            label: String(it.label),
            icon: String(it.icon),
            columns: cols,
          });
        }
      }
    }

    return cleaned.length ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

export const SHOP_HEADER_ANNOUNCEMENT: RegItem = {
  kind: "HeaderAnnouncement",
  label: "Header Announcement",
  defaults: {
    brandHref: "/",
    brandName: "Tuan Kiet Store",
    brandSub: "COSMETICS",
    logoSrc: "/assets/images/logo.jpg",
    logoAlt: "Tuan Kiet Store",

    searchPlaceholder: "What are you looking for?",
    badgeStoreLocator: 2,
    badgeCart: 0,

    navItems: "[]",

    menuApiUrl: "/api/admin/builder/menus/header-menu",
    menuSetKey: "home",
    menuSiteIdKey: "builder_site_id",

    isAuthed: 0,
  },
  inspector: [
    { key: "brandHref", label: "Brand Href", kind: "text" },
    { key: "brandName", label: "Brand Name", kind: "text" },
    { key: "brandSub", label: "Brand Sub", kind: "text" },
    { key: "logoSrc", label: "Logo Src", kind: "text" },
    { key: "logoAlt", label: "Logo Alt", kind: "text" },

    { key: "searchPlaceholder", label: "Search Placeholder", kind: "text" },
    { key: "badgeStoreLocator", label: "Badge (Store)", kind: "number" },
    { key: "badgeCart", label: "Badge (Cart)", kind: "number" },

    { key: "menuApiUrl", label: "Menu API URL", kind: "text" },
    { key: "menuSetKey", label: "Menu setKey", kind: "text" },
    { key: "menuSiteIdKey", label: "LocalStorage siteId key", kind: "text" },

    { key: "isAuthed", label: "Is Authed (0/1)", kind: "number" },

    { key: "navItems", label: "Nav Items (JSON, preview)", kind: "textarea", rows: 10 },
  ],
  render: (props) => {
    const p = props as Record<string, any>;
    const navItems = parseNavItems(p.navItems);

    return (
      <div aria-label="Shop Header Announcement">
        <HeaderAnnouncement
          brandHref={p.brandHref}
          brandName={p.brandName}
          brandSub={p.brandSub}
          logoSrc={p.logoSrc}
          logoAlt={p.logoAlt}
          searchPlaceholder={p.searchPlaceholder}
          badgeStoreLocator={p.badgeStoreLocator}
          badgeCart={p.badgeCart}
          preview={p.preview}
          navItems={navItems ?? []}
          menuApiUrl={p.menuApiUrl || "/api/admin/builder/menus/header-menu"}
          menuSetKey={p.menuSetKey || "home"}
          menuSiteIdKey={p.menuSiteIdKey || "builder_site_id"}
          isAuthed={Number(p.isAuthed) === 1}
        />
      </div>
    );
  },
};

export default HeaderAnnouncement;