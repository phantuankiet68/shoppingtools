"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import styles from "@/styles/admin/layouts/LayoutA.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useAdminTitle } from "@/components/admin/AdminTitleContext";
import { useRipple } from "@/utils/layout/ripple";
import { useAdminLayoutStore } from "@/store/layout/layouta/index";
import Sidebar from "@/components/admin/shared/layout/layoutA/Sidebar";
import Topbar from "@/components/admin/shared/layout/layoutA/Topbar";

const ADD_PAGE_REGEX = /^\/(en)\/v1\/pages\/add(?:\/.*)?$/;

export default function LayoutA({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { meta } = useAdminTitle();

  const navRef = useRef<HTMLDivElement>(null);
  useRipple(navRef);

  const {
    sidebarOpen,
    collapsed,
    setCollapsed,
    setSidebarOpen,

    loadMe,
    loadMenu,
    syncActiveByPathname,

    setUserMenuOpen,
    setNotiOpen,

    logout,
  } = useAdminLayoutStore();

  // load initial data
  useEffect(() => {
    loadMe();
    loadMenu();
  }, [loadMe, loadMenu]);

  // close dropdowns on outside click / ESC
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      // components tự check ref; store chỉ đóng trạng thái
      setUserMenuOpen(false);
      setNotiOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setUserMenuOpen(false);
      setNotiOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [setNotiOpen, setUserMenuOpen]);

  // sync active menu by route
  useEffect(() => {
    if (!pathname) return;
    syncActiveByPathname(pathname);
  }, [pathname, syncActiveByPathname]);

  // collapse rules
  useEffect(() => {
    const isBuilderAdd = pathname?.startsWith("/admin/builder/page/add");
    const matchesRegex = ADD_PAGE_REGEX.test(pathname || "");
    const shouldCollapse = isBuilderAdd || matchesRegex;

    setCollapsed(shouldCollapse);
    if (shouldCollapse) {
      // giống behavior cũ
      setSidebarOpen(false);
    }
  }, [pathname, setCollapsed, setSidebarOpen]);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className={`${styles.shell} ${sidebarOpen ? styles.shellSidebarOpen : styles.shellSidebarClosed}`}>
      <Sidebar navRef={navRef} />
      <div className={styles.main}>
        <Topbar meta={meta} onLogout={handleLogout} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
