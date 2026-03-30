"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Account/AccountOne.module.css";
import type { AccountSidebarItem } from "@/components/admin/shared/templates/sections/Account/AccountOne";

type AccountSidebarProps = {
  preview?: boolean;
  avatar: string;
  customerName: string;
  customerEmail: string;
  customerEditHref: string;
  customerRankText: string;
  customerTagline: string;
  sidebarItems: AccountSidebarItem[];
};

type SmartLinkProps = {
  preview?: boolean;
  href: string;
  className?: string;
  children: React.ReactNode;
};

function SmartLink({ preview, href, className, children }: SmartLinkProps) {
  if (preview) {
    return (
      <a
        href="#"
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={className}>
      {children}
    </Link>
  );
}

export default function AccountSidebar({
  preview = false,
  avatar,
  customerName,
  customerEmail,
  customerEditHref,
  customerRankText,
  customerTagline,
  sidebarItems,
}: AccountSidebarProps) {
  return (
    <aside className={cls.sidebar}>
      <div className={cls.profileCard}>
        <div className={cls.profileTop}>
          <div className={cls.avatarWrap}>
            <Image src={avatar} alt={customerName} fill sizes="64px" className={cls.avatarImg} />
            <span className={cls.onlineDot} />
          </div>

          <div className={cls.profileInfo}>
            <strong>{customerName}</strong>
            <span>{customerEmail}</span>

            <SmartLink preview={preview} href={customerEditHref} className={cls.editProfile}>
              <i className="bi bi-pencil-square" />
              <span>Edit profile</span>
            </SmartLink>
          </div>
        </div>

        <div className={cls.memberBanner}>
          <div className={cls.memberBadgeIcon}>
            <i className="bi bi-patch-check-fill" />
          </div>
          <div className={cls.memberBannerContent}>
            <strong>{customerRankText}</strong>
            <p>{customerTagline}</p>
          </div>
        </div>
      </div>

      <nav className={cls.sidebarNav} aria-label="Account menu">
        {sidebarItems.map((item, index) => (
          <SmartLink
            key={`${item.label}-${index}`}
            preview={preview}
            href={item.href}
            className={`${cls.sidebarLink} ${item.active ? cls.sidebarLinkActive : ""}`}
          >
            <span className={cls.sidebarIcon}>
              <i className={`bi ${item.icon}`} />
            </span>

            <span className={cls.sidebarLabel}>{item.label}</span>

            {item.badge ? <span className={cls.sidebarBadge}>{item.badge}</span> : null}
          </SmartLink>
        ))}
      </nav>
    </aside>
  );
}
