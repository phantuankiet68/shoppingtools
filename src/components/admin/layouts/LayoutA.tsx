"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/styles/admin/layouts/LayoutA.module.css";
import { useAdminTitle } from "@/components/admin/AdminTitleContext";
import { useRipple } from "@/utils/layout/ripple";
import { useAdminLayoutStore } from "@/store/layout/layouta/index";
import Sidebar from "@/components/admin/shared/layout/layoutA/Sidebar";
import Topbar from "@/components/admin/shared/layout/layoutA/Topbar";

const ADD_PAGE_REGEX = /^\/(en)\/v1\/pages\/add(?:\/.*)?$/;

type Props = {
  children: ReactNode;
};

export default function LayoutA({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { meta } = useAdminTitle();

  const navRef = useRef<HTMLDivElement>(null);
  useRipple(navRef);

  // selector nhỏ để giảm rerender không cần thiết
  const sidebarOpen = useAdminLayoutStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAdminLayoutStore((s) => s.setSidebarOpen);
  const setCollapsed = useAdminLayoutStore((s) => s.setCollapsed);
  const loadMe = useAdminLayoutStore((s) => s.loadMe);
  const loadMenu = useAdminLayoutStore((s) => s.loadMenu);
  const syncActiveByPathname = useAdminLayoutStore((s) => s.syncActiveByPathname);
  const setUserMenuOpen = useAdminLayoutStore((s) => s.setUserMenuOpen);
  const setNotiOpen = useAdminLayoutStore((s) => s.setNotiOpen);
  const logout = useAdminLayoutStore((s) => s.logout);

  // load initial data một lần khi mount
  useEffect(() => {
    void loadMe();
    void loadMenu();
  }, [loadMe, loadMenu]);

  // chỉ xử lý ESC ở level layout
  // outside click cho dropdown đã để Topbar tự quản lý bằng ref
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setUserMenuOpen(false);
      setNotiOpen(false);
    }

    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("keydown", onEsc);
    };
  }, [setNotiOpen, setUserMenuOpen]);

  // đồng bộ active menu theo route
  useEffect(() => {
    if (!pathname) return;
    syncActiveByPathname(pathname);
  }, [pathname, syncActiveByPathname]);

  // rule collapse theo route đặc biệt
  useEffect(() => {
    if (!pathname) return;

    const isBuilderAdd = pathname.startsWith("/admin/builder/page/add");
    const matchesRegex = ADD_PAGE_REGEX.test(pathname);
    const shouldCollapse = isBuilderAdd || matchesRegex;

    setCollapsed(shouldCollapse);

    if (shouldCollapse) {
      setSidebarOpen(false);
    }
  }, [pathname, setCollapsed, setSidebarOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
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
