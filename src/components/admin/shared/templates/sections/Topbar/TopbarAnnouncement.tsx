"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Topbar/TopbarAnnouncement.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type AnnouncementItem = {
  title: string;
  meta: string;
};

export type TopbarAnnouncementProps = {
  brandTitle?: string;
  branchLabel?: string;
  hotline?: string;
  supportText?: string;
  announcementLabel?: string;
  announcementItems?: AnnouncementItem[];
  background?: string;
  preview?: boolean;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);

    onChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return reduced;
}

export function TopbarAnnouncement({
  brandTitle = "Aurora Hub",
  branchLabel = "Chi nhánh Hồ Chí Minh",
  hotline = "0867105900",
  supportText = "Hỗ trợ 24/7",
  announcementLabel = "THÔNG BÁO",
  announcementItems,
  background = "#47c98b",
  preview = false,
}: TopbarAnnouncementProps) {
  const items = useMemo<AnnouncementItem[]>(
    () =>
      announcementItems?.length
        ? announcementItems
        : [
            { title: "Miễn phí vận chuyển cho đơn từ 499K", meta: "Freeship" },
            { title: "Đổi trả nhanh trong 7 ngày với lỗi kỹ thuật", meta: "7 ngày đổi trả" },
            { title: "Tư vấn đặt hàng và hỗ trợ nhanh mỗi ngày", meta: "Hỗ trợ nhanh" },
          ],
    [announcementItems],
  );

  const reducedMotion = usePrefersReducedMotion();
  const menuId = useId();
  const timeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"active" | "leaving" | "entering">("active");
  const [menuOpen, setMenuOpen] = useState(false);

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (!items.length || reducedMotion) return;

    const interval = window.setInterval(() => {
      setPhase("leaving");

      timeoutRef.current = window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setPhase("entering");

        requestAnimationFrame(() => {
          requestAnimationFrame(() => setPhase("active"));
        });
      }, 260);
    }, 4200);

    return () => {
      window.clearInterval(interval);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [items.length, reducedMotion]);

  useEffect(() => {
    if (!menuOpen || preview) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      if (dropdownRef.current?.contains(target)) return;
      if (menuBtnRef.current?.contains(target)) return;

      setMenuOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, preview]);

  const current = items[index] ?? { title: "", meta: "" };
  const telHref = `tel:${String(hotline).replace(/\s+/g, "")}`;

  return (
    <header
      className={cls.announcementBar}
      onClick={onBlockClick}
      role="region"
      aria-label="Thanh thông báo và hỗ trợ cửa hàng"
      style={{ background }}
    >
      <div className={cls.inner}>
        {/* LEFT */}
        <div className={cls.leftZone}>
          <div className={cls.brandWrap}>
            <div className={cls.brandIcon} aria-hidden="true">
              <i className="bi bi-megaphone-fill" />
            </div>

            <div className={cls.brandText}>
              <span className={cls.brandName}>{brandTitle}</span>
              <span className={cls.brandSub}>{announcementLabel}</span>
            </div>
          </div>

          <button
            type="button"
            className={cls.branchChip}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              alert("Sau này có thể mở danh sách chi nhánh / khu vực tại đây.");
            }}
            aria-label={`Khu vực hiện tại: ${branchLabel}`}
            title={branchLabel}
          >
            <i className="bi bi-shop" aria-hidden="true" />
            <span>{branchLabel}</span>
            <i className="bi bi-chevron-down" aria-hidden="true" />
          </button>
        </div>

        {/* CENTER */}
        <div className={cls.centerZone}>
          <div className={cls.announcementTrack} aria-live={reducedMotion ? "off" : "polite"} aria-atomic="true">
            <span className={cls.labelPill}>{announcementLabel}</span>

            <div
              className={[
                cls.announcementText,
                phase === "active" ? cls.isActive : "",
                phase === "leaving" ? cls.isLeaving : "",
                phase === "entering" ? cls.isEntering : "",
              ].join(" ")}
            >
              <span className={cls.title}>{current.title}</span>
              <span className={cls.meta}>{current.meta}</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={`${cls.rightZone} ${menuOpen ? cls.isOpen : ""}`}>
          <a
            href={telHref}
            className={cls.hotlineBtn}
            onClick={onBlockClick}
            aria-label={`Gọi hotline ${hotline}`}
            title={`Hotline đặt hàng ${hotline}`}
          >
            <i className="bi bi-telephone-outbound" aria-hidden="true" />
            <span>{hotline}</span>
          </a>

          <div className={cls.supportBadge} aria-label={supportText} title={supportText}>
            <span className={cls.liveDot} aria-hidden="true" />
            <span>{supportText}</span>
          </div>

          <button
            ref={menuBtnRef}
            type="button"
            className={cls.menuBtn}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              setMenuOpen((v) => !v);
            }}
            aria-label="Mở menu tiện ích"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
          >
            <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
          </button>

          {!preview && menuOpen ? (
            <div id={menuId} ref={dropdownRef} className={cls.dropdownMenu} role="menu" aria-label="Menu tiện ích">
              <button type="button" className={cls.dropdownItem} role="menuitem">
                <i className="bi bi-bell" aria-hidden="true" />
                <span>Thông báo mới</span>
              </button>
              <button type="button" className={cls.dropdownItem} role="menuitem">
                <i className="bi bi-ticket-perforated" aria-hidden="true" />
                <span>Ưu đãi hôm nay</span>
              </button>
              <button type="button" className={cls.dropdownItem} role="menuitem">
                <i className="bi bi-headset" aria-hidden="true" />
                <span>Liên hệ hỗ trợ</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/* ================ Helpers ================ */
function parseAnnouncementItems(raw?: string): AnnouncementItem[] | undefined {
  if (!raw) return undefined;

  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const ok = val
      .map((x) => ({
        title: String(x?.title ?? "").trim(),
        meta: String(x?.meta ?? "").trim(),
      }))
      .filter((x) => x.title && x.meta);

    return ok.length ? ok : undefined;
  } catch {
    return undefined;
  }
}

function parseBackground(raw?: string): string | undefined {
  if (!raw) return undefined;
  const value = String(raw).trim();
  return value || undefined;
}

const BACKGROUND_PRESETS = [
  "linear-gradient(90deg, #4ed595, #49b884)",
  "linear-gradient(90deg, rgb(213 78 78), rgb(184 73 73))",
  "linear-gradient(90deg, rgb(213 125 78), rgb(184 108 73))",
  "linear-gradient(90deg, rgb(78 213 194), rgb(73, 184, 132))",
  "linear-gradient(90deg, rgb(78 213 184), rgb(73 184 169))",
  "linear-gradient(90deg, rgb(78 182 213), rgb(73 175 184))",
  "linear-gradient(90deg, rgb(78 132 213), rgb(73 154 184))",
  "linear-gradient(90deg, rgb(124 78 213), rgb(73 89 184))",
  "linear-gradient(90deg, rgb(174 78 213), rgb(152 73 184))",
  "linear-gradient(90deg, rgb(203 78 213), rgb(184 73 175))",
  "linear-gradient(90deg, rgb(255 103 204), rgb(253 130 243))",
];

/* ================ Registry ================ */
export const SHOP_TOPBAR_ANNOUNCEMENT: RegItem = {
  kind: "TopbarAnnouncement",
  label: "Topbar Announcement",
  defaults: {
    brandTitle: "Aurora Hub",
    branchLabel: "Chi nhánh Hồ Chí Minh",
    hotline: "0867105900",
    supportText: "Hỗ trợ nhanh 24/7",
    announcementLabel: "THÔNG BÁO",
    background: BACKGROUND_PRESETS[0],
    announcementItems: JSON.stringify(
      [
        { title: "Miễn phí vận chuyển cho đơn từ 499K", meta: "Freeship" },
        { title: "Đổi trả nhanh trong 7 ngày với lỗi kỹ thuật", meta: "7 ngày đổi trả" },
        { title: "Tư vấn đặt hàng và hỗ trợ nhanh mỗi ngày", meta: "Hỗ trợ nhanh" },
      ],
      null,
      2,
    ),
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "branchLabel", label: "Branch Label", kind: "text" },
    { key: "hotline", label: "Hotline", kind: "text" },
    { key: "supportText", label: "Support Text", kind: "text" },
    { key: "announcementLabel", label: "Announcement Label", kind: "text" },
    { key: "background", label: "Background", kind: "select", options: BACKGROUND_PRESETS },
    {
      key: "announcementItems",
      label: "Announcement Items (JSON)",
      kind: "textarea",
      rows: 6,
      placeholder: `Ví dụ:
[
  { "title": "Miễn phí vận chuyển cho đơn từ 499K", "meta": "Freeship" },
  { "title": "Đổi trả nhanh trong 7 ngày với lỗi kỹ thuật", "meta": "7 ngày đổi trả" }
]`,
    },
  ],
  render: (p) => {
    const items = parseAnnouncementItems(p.announcementItems as string | undefined);
    const background = parseBackground(p.background as string | undefined);

    return (
      <div aria-label="Shop Topbar Announcement">
        <TopbarAnnouncement
          brandTitle={p.brandTitle as string | undefined}
          branchLabel={p.branchLabel as string | undefined}
          hotline={p.hotline as string | undefined}
          supportText={p.supportText as string | undefined}
          announcementLabel={p.announcementLabel as string | undefined}
          announcementItems={items}
          background={background}
          preview={true}
        />
      </div>
    );
  },
};

export default TopbarAnnouncement;
