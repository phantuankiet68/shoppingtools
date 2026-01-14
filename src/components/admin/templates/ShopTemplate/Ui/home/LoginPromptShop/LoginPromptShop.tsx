"use client";

import React from "react";
import cls from "@/styles/admin/templates/home/login-prompt-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type LoginPromptShopProps = {
  label?: string;
  icon?: string; // bootstrap icon class, ví dụ "bi-lock-fill"
  preview?: boolean;
};

export default function LoginPromptShop({ label = "Đăng nhập để xem thêm", icon = "bi-lock-fill", preview = false }: LoginPromptShopProps) {
  function stop(e: React.MouseEvent<HTMLButtonElement>) {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <div className={cls.loginBox}>
      <button className={cls.loginBtn} type="button" onClick={stop}>
        <i className={`bi ${icon}`} aria-hidden="true" />
        {label}
      </button>
    </div>
  );
}

export const LOGIN_PROMPT_SHOP: RegItem = {
  kind: "login.prompt.shop",
  label: "CTA — Đăng nhập để xem thêm",
  defaults: {
    label: "Đăng nhập để xem thêm",
    icon: "bi-lock-fill",
  },
  inspector: [
    { key: "label", label: "Text nút", kind: "text" },
    { key: "icon", label: "Bootstrap icon class", kind: "text" },
  ],
  render: (p: any) => <LoginPromptShop {...p} preview />,
};
