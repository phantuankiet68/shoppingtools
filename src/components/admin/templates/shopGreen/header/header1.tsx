"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/header/header1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type MegaColumn = {
  title: string;
  items: { label: string; href: string }[];
};

export type NavItem = { type: "link"; label: string; href: string; icon: string } | { type: "mega"; label: string; icon: string; columns: MegaColumn[] };

export type Header1Props = {
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
  preview?: boolean;

  /**
   * ✅ NEW:
   * - isAuthed: control trạng thái đăng nhập (tạm thời bạn có thể truyền false)
   * - onLogin/onRegister: callback xử lý submit
   */
  isAuthed?: boolean;
  onLogin?: (payload: { email: string; password: string }) => Promise<void> | void;
  onRegister?: (payload: { name: string; email: string; password: string }) => Promise<void> | void;
};

/* ============== Defaults ============== */
const DEFAULT_NAV: NavItem[] = [
  { type: "link", label: "Home", href: "/", icon: "bi-house-door-fill" },
  { type: "link", label: "Promotions", href: "/promotions", icon: "bi-megaphone" },
  {
    type: "mega",
    label: "Makeup",
    icon: "bi-bag-heart",
    columns: [
      {
        title: "LIP MAKEUP",
        items: [
          { label: "Lip Balm", href: "/makeup/lip-balm" },
          { label: "Lipstick", href: "/makeup/lipstick" },
          { label: "Liquid Lipstick", href: "/makeup/liquid-lipstick" },
        ],
      },
      {
        title: "EYE MAKEUP",
        items: [
          { label: "Mascara", href: "/makeup/mascara" },
          { label: "Eyeshadow", href: "/makeup/eyeshadow" },
          { label: "Eyeliner", href: "/makeup/eyeliner" },
          { label: "Eyebrow Pencil / Powder", href: "/makeup/eyebrow" },
        ],
      },
      {
        title: "BASE MAKEUP",
        items: [
          { label: "Primer", href: "/makeup/primer" },
          { label: "Foundation", href: "/makeup/foundation" },
          { label: "Concealer", href: "/makeup/concealer" },
          { label: "Powder", href: "/makeup/powder" },
          { label: "Cushion / BB Compact", href: "/makeup/cushion" },
        ],
      },
    ],
  },
  { type: "link", label: "Skincare", href: "/skincare", icon: "bi-droplet" },
  { type: "link", label: "Body Care", href: "/body-care", icon: "bi-heart-pulse" },
  { type: "link", label: "Personal Care", href: "/personal-care", icon: "bi-person-hearts" },
  { type: "link", label: "Kids", href: "/kids", icon: "bi-emoji-smile" },
  { type: "link", label: "For Men", href: "/men", icon: "bi-gender-male" },
  { type: "link", label: "Accessories", href: "/accessories", icon: "bi-tags" },
  { type: "link", label: "Gift Sets", href: "/gift-sets", icon: "bi-gift" },
  { type: "link", label: "Brands", href: "/brands", icon: "bi-award" },
];

type AuthMode = "login" | "register";

/* ================ Component ================ */
export function Header1({
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

  isAuthed = false,
  onLogin,
  onRegister,
}: Header1Props) {
  const items = useMemo(() => navItems ?? DEFAULT_NAV, [navItems]);

  const [query, setQuery] = useState("");
  const [openMegaIndex, setOpenMegaIndex] = useState<number | null>(null);

  const rootRef = useRef<HTMLElement | null>(null);

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const closeAll = () => setOpenMegaIndex(null);

  // close when click outside / ESC (works also in preview)
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

  // ===========================
  // ✅ Auth Modal
  // ===========================
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  const [showPass, setShowPass] = useState(false);
  const modalPanelRef = useRef<HTMLDivElement | null>(null);
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

  // focus first input when open
  useEffect(() => {
    if (!authOpen) return;
    const t = window.setTimeout(() => firstInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [authOpen, authMode]);

  // ESC close when modal open + focus trap basic
  useEffect(() => {
    if (!authOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeAuth();
        return;
      }

      if (e.key === "Tab") {
        const panel = modalPanelRef.current;
        if (!panel) return;

        const focusables = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        const active = document.activeElement as HTMLElement | null;
        if (!active) return;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [authOpen]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());

  const submitLogin = async () => {
    setErr("");
    const email = loginEmail.trim();
    const password = loginPass;

    if (!validateEmail(email)) return setErr("Please enter a valid email.");
    if (!password || password.length < 6) return setErr("Password must be at least 6 characters.");

    setBusy(true);
    try {
      await onLogin?.({ email, password });
      // demo: nếu bạn chưa nối API thì vẫn đóng để UX ok
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
    if (!password || password.length < 6) return setErr("Password must be at least 6 characters.");

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
    // preview vẫn cho mở modal để xem UI, nhưng không navigate
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthed) {
      openAuth("login");
      return;
    }

    // đã login: bạn có thể mở dropdown account ở đây (tạm placeholder)
    openAuth("login"); // nếu muốn: setUserMenuOpen(true)...
  };

  return (
    <header className={cls.topbar} ref={rootRef}>
      <div className={cls.containerHeader}>
        <div className={cls.topbarInner}>
          {preview ? (
            <a className={cls.logo} href="#" aria-label={brandName} onClick={onBlockClick}>
              <span className={cls.logoBadge}>
                <Image src={logoSrc} alt={logoAlt} fill className={cls.logoImg} />
              </span>
              <span className={cls.logoText}>
                <span className={cls.logoName}>{brandName}</span>
                <span className={cls.logoSub}>{brandSub}</span>
              </span>
            </a>
          ) : (
            <Link className={cls.logo} href={brandHref as Route} aria-label={brandName}>
              <span className={cls.logoBadge}>
                <Image src={logoSrc} alt={logoAlt} fill className={cls.logoImg} />
              </span>
              <span className={cls.logoText}>
                <span className={cls.logoName}>{brandName}</span>
                <span className={cls.logoSub}>{brandSub}</span>
              </span>
            </Link>
          )}

          <form
            className={cls.search}
            onSubmit={(e) => {
              e.preventDefault();
              if (preview) return;
              onSearchSubmit?.(query);
            }}>
            <i className={`bi bi-search ${cls.searchIcon}`} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder={searchPlaceholder} />
            <button type="submit">Search</button>
          </form>

          <div className={cls.tbRight}>
            <button className={cls.tbLink} type="button" onClick={onBlockClick}>
              <i className="bi bi-geo-alt" />
              <span>Store Locator</span>
              <span className={cls.badge}>{badgeStoreLocator}</span>
            </button>

            <button className={cls.tbLink} type="button" onClick={onBlockClick}>
              <i className="bi bi-cart" />
              <span>Cart</span>
              <span className={cls.badge}>{badgeCart}</span>
            </button>

            <button className={cls.tbLink} type="button" onClick={(e) => (preview ? onBlockClick(e) : onAccountClick(e))} aria-haspopup="dialog" aria-expanded={authOpen}>
              <i className="bi bi-person" />
              <span>Account</span>
              <i className={`bi bi-caret-down-fill ${cls.caret}`} />
            </button>
          </div>
        </div>
      </div>

      <nav className={cls.navwrap} aria-label="Primary navigation">
        <div className={cls.container}>
          <div className={cls.nav}>
            {items.map((it, idx) => {
              const iconCls = `bi ${it.icon}`;
              const isMega = it.type === "mega";
              const isOpen = openMegaIndex === idx;

              if (!isMega) {
                return preview ? (
                  <a key={idx} className={cls.navItem} href="#" onClick={onBlockClick}>
                    <div className={cls.icon}>
                      <i className={iconCls} />
                    </div>
                    <div className={cls.label}>{it.label}</div>
                  </a>
                ) : (
                  <Link key={idx} className={cls.navItem} href={(it.href || "/") as Route}>
                    <div className={cls.icon}>
                      <i className={iconCls} />
                    </div>
                    <div className={cls.label}>{it.label}</div>
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
                  }}>
                  <div className={cls.icon}>
                    <i className={iconCls} />
                  </div>
                  <div className={cls.label}>{it.label}</div>

                  <div className={cls.mega} role="menu" aria-label={`${it.label} menu`}>
                    <div className={cls.megaGrid}>
                      {it.columns.map((col, cIdx) => (
                        <div className={cls.megaCol} key={cIdx}>
                          <h4>
                            <span className={cls.dot} />
                            {col.title}
                          </h4>

                          {col.items.map((link, lIdx) =>
                            preview ? (
                              <a key={lIdx} href="#" onClick={onBlockClick}>
                                <span>{link.label}</span>
                                <i className={`bi bi-chevron-right ${cls.chev}`} />
                              </a>
                            ) : (
                              <Link key={lIdx} href={(link.href || "/") as Route}>
                                <span>{link.label}</span>
                                <i className={`bi bi-chevron-right ${cls.chev}`} />
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
          </div>
        </div>
      </nav>

      {/* ===========================
          ✅ AUTH MODAL (Login/Register)
         =========================== */}
      {authOpen && (
        <div
          className={cls.authOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={authMode === "login" ? "Login dialog" : "Register dialog"}
          onMouseDown={(e) => {
            // click overlay to close
            if (e.target === e.currentTarget) closeAuth();
          }}>
          <div className={cls.authPanel} ref={modalPanelRef}>
            <div className={cls.authHead}>
              <div className={cls.authTitle}>
                <span className={cls.authDot} aria-hidden="true" />
                {authMode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
              </div>

              <button className={cls.authClose} type="button" onClick={closeAuth} aria-label="Close">
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
                }}>
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
                }}>
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
                }}>
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
                    <button className={cls.authEye} type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Hide password" : "Show password"}>
                      <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                </label>

                <div className={cls.authRow}>
                  <button className={cls.authPrimary} type="submit" disabled={busy}>
                    {busy ? "Signing in…" : "Login"}
                    <i className="bi bi-arrow-right" />
                  </button>

                  <button
                    className={cls.authGhost}
                    type="button"
                    onClick={() => {
                      setErr("");
                      setAuthMode("register");
                    }}>
                    Create account
                  </button>
                </div>

                <button className={cls.authLink} type="button" onClick={() => setErr("Please contact support to reset password.")}>
                  Forgot password?
                </button>
              </form>
            ) : (
              <form
                className={cls.authForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (busy) return;
                  submitRegister();
                }}>
                <label className={cls.authLabel}>
                  Full name
                  <div className={cls.authInputWrap}>
                    <i className={`bi bi-person ${cls.authInputIcon}`} />
                    <input ref={firstInputRef} className={cls.authInput} type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Your name" autoComplete="name" />
                  </div>
                </label>

                <label className={cls.authLabel}>
                  Email
                  <div className={cls.authInputWrap}>
                    <i className={`bi bi-envelope ${cls.authInputIcon}`} />
                    <input className={cls.authInput} type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
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
                    <button className={cls.authEye} type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Hide password" : "Show password"}>
                      <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                </label>

                <div className={cls.authRow}>
                  <button className={cls.authPrimary} type="submit" disabled={busy}>
                    {busy ? "Creating…" : "Register"}
                    <i className="bi bi-arrow-right" />
                  </button>

                  <button
                    className={cls.authGhost}
                    type="button"
                    onClick={() => {
                      setErr("");
                      setAuthMode("login");
                    }}>
                    I already have an account
                  </button>
                </div>

                <div className={cls.authNote}>
                  By creating an account, you agree to our <span className={cls.authNoteStrong}>Terms</span> and <span className={cls.authNoteStrong}>Privacy Policy</span>.
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ============== Helpers (giống BannerPro) ============== */
function parseNavItems(raw?: string): NavItem[] | undefined {
  if (!raw) return undefined;
  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const cleaned: NavItem[] = [];
    for (const it of val) {
      if (it?.type === "link" && it?.label && it?.href && it?.icon) {
        cleaned.push({ type: "link", label: String(it.label), href: String(it.href), icon: String(it.icon) });
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
                  .map((x: any) => ({ label: String(x?.label ?? ""), href: String(x?.href ?? "") }))
                  .filter((x: any) => x.label && x.href)
              : [],
          }))
          .filter((c: MegaColumn) => c.title && c.items.length);

        if (cols.length) cleaned.push({ type: "mega", label: String(it.label), icon: String(it.icon), columns: cols });
      }
    }

    return cleaned.length ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

export const SHOP_HEADER_GREEN_ONE: RegItem = {
  kind: "Header1",
  label: "Header",
  defaults: {
    brandHref: "/",
    brandName: "Tuan Kiet Store",
    brandSub: "COSMETICS",
    logoSrc: "/images/logo.jpg",
    logoAlt: "Tuan Kiet Store",

    searchPlaceholder: "What are you looking for?",
    badgeStoreLocator: 2,
    badgeCart: 0,

    navItems: JSON.stringify(DEFAULT_NAV, null, 2),

    // ✅ new defaults
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

    { key: "isAuthed", label: "Is Authed (0/1)", kind: "number" },

    { key: "navItems", label: "Nav Items (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (p) => {
    const navItems = parseNavItems(p.navItems);

    return (
      <div aria-label="Shop Header (Green One)">
        <Header1
          brandHref={p.brandHref}
          brandName={p.brandName}
          brandSub={p.brandSub}
          logoSrc={p.logoSrc}
          logoAlt={p.logoAlt}
          searchPlaceholder={p.searchPlaceholder}
          badgeStoreLocator={p.badgeStoreLocator}
          badgeCart={p.badgeCart}
          navItems={navItems ?? DEFAULT_NAV}
          preview={true}
          isAuthed={Number(p.isAuthed) === 1}
        />
      </div>
    );
  },
};

export default Header1;
