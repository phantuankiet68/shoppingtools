"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/components/admin/templates/ShopTemplate/styles/home/topbar/topbar-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type TopbarShopProps = {
  message?: string;
  phone?: string;
  phoneHref?: string;
  loginHref?: Route;
  signupHref?: Route;
  showAuth?: boolean;
  theme?: { brand?: string };
  className?: string;
  preview?: boolean;
  hideOnMobile?: boolean;
};

export default function TopbarShop({
  message = "Giao siêu tốc - Đổi trả 7 ngày - Giá luôn đẹp",
  phone = "0921.152.150",
  loginHref = "/login" as Route,
  signupHref = "/register" as Route,
  phoneHref = "tel:0921152150",
  showAuth = true,
  theme = { brand: "#f97316" },
  className,
  preview = false,
  hideOnMobile = true,
}: TopbarShopProps) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme?.brand) root.style.setProperty("--brand", theme.brand);
    return () => {};
  }, [theme?.brand]);

  const stop = (e: React.MouseEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={[cls.topbar, hideOnMobile ? cls.hideMobile : "", className || ""].join(" ")} onClick={preview ? stop : undefined} aria-hidden={preview || undefined}>
      <div className={cls.container}>
        <div className={cls.row}>
          <div className={cls.left}>{message}</div>

          <div className={cls.right}>
            <a href={phoneHref} className={cls.phone} aria-label="Call us" onClick={preview ? stop : undefined}>
              <i className="bi bi-telephone" aria-hidden="true" />
              <span>{phone}</span>
            </a>
            <span className={cls.sep}>|</span>
            {showAuth && (
              <>
                <Link href={loginHref} onClick={preview ? stop : undefined} className={cls.link}>
                  Đăng nhập
                </Link>
                <Link href={signupHref} onClick={preview ? stop : undefined} className={cls.link}>
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const TOPBAR_SHOP: RegItem = {
  kind: "topbar.shop",
  label: "Topbar — Shop",
  defaults: {
    message: "Giao siêu tốc - Đổi trả 7 ngày - Giá luôn đẹp",
    phone: "0921.152.150",
    phoneHref: "tel:0921152150",
    loginHref: "/auth/login",
    signupHref: "/auth/register",
    showAuth: true,
    hideOnMobile: true,
    theme: { brand: "#f97316" },
  },
  inspector: [
    { key: "message", label: "Message", kind: "text" },
    { key: "phone", label: "Phone", kind: "text" },
    { key: "phoneHref", label: "Phone Href (tel:)", kind: "text" },
    { key: "loginHref", label: "Login Href", kind: "text" },
    { key: "signupHref", label: "Signup Href", kind: "text" },
    { key: "showAuth", label: "Show Auth Links", kind: "check" },
    { key: "hideOnMobile", label: "Hide on Mobile (<640px)", kind: "check" },
    { key: "theme.brand", label: "Brand Color", kind: "text" },
  ],
  render: (p: any) => <TopbarShop {...p} preview />,
};
