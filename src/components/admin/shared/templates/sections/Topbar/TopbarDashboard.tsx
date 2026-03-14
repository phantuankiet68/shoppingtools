"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Topbar/TopbarDashboard.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type TopbarDashboardItem = {
  text: string;
  chip: string;
};

export type TopbarDashboardProps = {
  brandTitle?: string;
  leftLabel?: string;
  hotline?: string;
  statusText?: string;
  tickerLabel?: string;
  tickerItems?: TopbarDashboardItem[];
  background?: string;
  preview?: boolean;
};

/* ================= Helpers ================= */
const asText = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

const BACKGROUND_PRESETS = [
  "linear-gradient(90deg, #0b1220 0%, #0f172a 50%, #111827 100%)",
  "linear-gradient(90deg, rgb(169 68 68) 0%, rgb(15, 23, 42) 50%, rgb(71 117 216) 100%)",
  "linear-gradient(90deg, rgb(52 96 184) 0%, rgb(65 95 168) 50%, rgb(17, 24, 39) 100%)",
  "linear-gradient(90deg, rgb(121 44 134) 0%, rgb(15, 23, 42) 50%, rgb(126 49 133) 100%)",
  "linear-gradient(90deg, rgb(69 18 168) 0%, rgb(56 89 168) 50%, rgb(69 23 73) 100%)",
  "linear-gradient(90deg, rgb(18 50 168) 0%, rgb(56 89 168) 50%, rgb(53 76 110) 100%)",
  "linear-gradient(90deg, rgb(38 126 142) 0%, rgb(56 89 168) 50%, rgb(15 84 186) 100%)",
  "linear-gradient(90deg, rgb(38 142 85) 0%, rgb(41 124 124) 50%, rgb(60 37 115) 100%)",
  "linear-gradient(90deg, rgb(117 142 38) 0%, rgb(41 124 124) 50%, rgb(115 37 37) 100%)",
  "linear-gradient(90deg, rgb(64 142 38) 0%, rgb(41 124 124) 50%, rgb(194 76 173) 100%)",
  "linear-gradient(90deg, rgb(142 38 38) 0%, rgb(118 81 39) 50%, rgb(136 122 26) 100%)",
];

function parseTickerItems(raw?: string): TopbarDashboardItem[] | undefined {
  if (!raw) return undefined;

  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const ok = val
      .map((x) => ({
        text: String(x?.text ?? "").trim(),
        chip: String(x?.chip ?? "").trim(),
      }))
      .filter((x) => x.text && x.chip);

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

/* ================ Component ================ */
export function TopbarDashboard({
  brandTitle = "Aurora Hub",
  leftLabel = "Cửa hàng chính hãng",
  hotline = "0867105900",
  statusText = "Hỗ trợ online 24/7",
  tickerLabel = "LIVE",
  tickerItems,
  background = BACKGROUND_PRESETS[0],
  preview = false,
}: TopbarDashboardProps) {
  const items = useMemo<TopbarDashboardItem[]>(
    () =>
      tickerItems?.length
        ? tickerItems
        : [
            { text: "Miễn phí vận chuyển cho đơn từ 499K", chip: "Freeship" },
            { text: "Đổi trả trong 7 ngày với lỗi kỹ thuật", chip: "7 ngày đổi trả" },
            { text: "Hàng chính hãng, hỗ trợ nhanh mỗi ngày", chip: "Chính hãng" },
          ],
    [tickerItems],
  );

  const reducedMotion = usePrefersReducedMotion();
  const menuId = useId();
  const timeoutRef = useRef<number | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
      }, 220);
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

  const current = items[index] ?? { text: "", chip: "" };
  const telHref = `tel:${String(hotline).replace(/\s+/g, "")}`;

  return (
    <header
      className={cls.topbarDashboard}
      onClick={onBlockClick}
      role="region"
      aria-label="Thanh topbar dashboard của cửa hàng"
      style={{ background }}
    >
      <div className={cls.dbInner}>
        {/* LEFT */}
        <div className={cls.dbLeft}>
          <div className={cls.dbBrand} aria-label={`Thương hiệu ${brandTitle}`}>
            <span className={cls.dbBrandBadge} aria-hidden="true">
              <i className="bi bi-grid-1x2-fill" />
            </span>

            <div className={cls.dbBrandText}>
              <span className={cls.dbBrandTitle}>{brandTitle}</span>
              <span className={cls.dbBrandSub}>{leftLabel}</span>
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className={cls.dbCenter}>
          <div className={cls.dbTickerShell} aria-live={reducedMotion ? "off" : "polite"} aria-atomic="true">
            <span className={cls.dbTickerLabel}>{tickerLabel}</span>

            <div
              className={[
                cls.dbTickerText,
                phase === "active" ? cls.isActive : "",
                phase === "leaving" ? cls.isLeaving : "",
                phase === "entering" ? cls.isEntering : "",
              ].join(" ")}
            >
              <span className={cls.main}>{current.text}</span>
              <span className={cls.chip}>{current.chip}</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={`${cls.dbRight} ${menuOpen ? cls.isOpen : ""}`}>
          <a
            href={telHref}
            className={cls.dbContact}
            onClick={onBlockClick}
            aria-label={`Gọi hotline ${hotline}`}
            title={`Hotline hỗ trợ ${hotline}`}
          >
            <i className="bi bi-headset" aria-hidden="true" />
            <span>{hotline}</span>
          </a>

          <div className={cls.dbStatus} aria-label={statusText} title={statusText}>
            <span className={cls.dbStatusDot} aria-hidden="true" />
            <span>{statusText}</span>
          </div>

          <button
            type="button"
            className={cls.dbActionBtn}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              alert("Sau này có thể mở khu vực cảnh báo hoặc thông báo nhanh.");
            }}
            aria-label="Mở cảnh báo nhanh"
            title="Mở cảnh báo nhanh"
          >
            <i className="bi bi-bell" aria-hidden="true" />
          </button>

          <button
            ref={menuBtnRef}
            type="button"
            className={cls.dbMenuBtn}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              setMenuOpen((v) => !v);
            }}
            aria-label="Mở menu dashboard"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
          >
            <i className="bi bi-layout-sidebar-inset" aria-hidden="true" />
          </button>

          {!preview && menuOpen ? (
            <div id={menuId} ref={dropdownRef} className={cls.dbDropdown} role="menu" aria-label="Menu dashboard">
              <button type="button" className={cls.dbDropdownItem} role="menuitem">
                <i className="bi bi-lightning-charge" aria-hidden="true" />
                <span>Truy cập nhanh</span>
              </button>

              <button type="button" className={cls.dbDropdownItem} role="menuitem">
                <i className="bi bi-box-seam" aria-hidden="true" />
                <span>Quản lý đơn hàng</span>
              </button>

              <button type="button" className={cls.dbDropdownItem} role="menuitem">
                <i className="bi bi-people" aria-hidden="true" />
                <span>CSKH & hỗ trợ</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/* ================ Registry ================ */
export const SHOP_TOPBAR_DASHBOARD: RegItem = {
  kind: "TopbarDashboard",
  label: "Topbar Dashboard",
  defaults: {
    brandTitle: "Aurora Hub",
    leftLabel: "Cửa hàng chính hãng",
    hotline: "0867105900",
    statusText: "Hỗ trợ online 24/7",
    tickerLabel: "LIVE",
    background: BACKGROUND_PRESETS[0],
    tickerItems: JSON.stringify(
      [
        { text: "Miễn phí vận chuyển cho đơn từ 499K", chip: "Freeship" },
        { text: "Đổi trả trong 7 ngày với lỗi kỹ thuật", chip: "7 ngày đổi trả" },
        { text: "Hàng chính hãng, hỗ trợ nhanh mỗi ngày", chip: "Chính hãng" },
      ],
      null,
      2,
    ),
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "leftLabel", label: "Left Label", kind: "text" },
    { key: "hotline", label: "Hotline", kind: "text" },
    { key: "statusText", label: "Status Text", kind: "text" },
    { key: "tickerLabel", label: "Ticker Label", kind: "text" },
    {
      key: "background",
      label: "Background",
      kind: "select",
      options: BACKGROUND_PRESETS,
    },
    {
      key: "tickerItems",
      label: "Ticker Items (JSON)",
      kind: "textarea",
      rows: 6,
      placeholder: `Ví dụ:
[
  { "text": "Miễn phí vận chuyển cho đơn từ 499K", "chip": "Freeship" },
  { "text": "Đổi trả trong 7 ngày với lỗi kỹ thuật", "chip": "7 ngày đổi trả" }
]`,
    },
  ],
  render: (p) => {
    const items = parseTickerItems(asText(p.tickerItems));
    const background = parseBackground(asText(p.background));

    return (
      <div aria-label="Shop Topbar Dashboard">
        <TopbarDashboard
          brandTitle={asText(p.brandTitle)}
          leftLabel={asText(p.leftLabel)}
          hotline={asText(p.hotline)}
          statusText={asText(p.statusText)}
          tickerLabel={asText(p.tickerLabel)}
          tickerItems={items}
          background={background}
          preview={true}
        />
      </div>
    );
  },
};

export default TopbarDashboard;
