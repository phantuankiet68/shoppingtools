"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Topbar/TopbarRegion.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type TopbarRegionItem = {
  text: string;
  chip: string;
};

export type TopbarRegionProps = {
  brandTitle?: string;
  brandHref?: string;
  leftLabel?: string;
  leftHref?: string;
  hotline?: string;
  statusText?: string;
  tickerLabel?: string;
  tickerItems?: TopbarRegionItem[];
  background?: string;
  preview?: boolean;
};

/* ================= Helpers ================= */
const asText = (v: unknown): string | undefined => (typeof v === "string" ? v.trim() || undefined : undefined);

const BACKGROUND_PRESETS = [
  "linear-gradient(90deg, #5b3a29 0%, #7c4a2d 48%, #8d552f 100%)",
  "linear-gradient(90deg, rgb(41 46 91) 0%, rgb(45 47 124) 48%, rgb(47 73 141) 100%)",
  "linear-gradient(90deg, rgb(91 41 41) 0%, rgb(124 45 45) 48%, rgb(141 47 47) 100%)",
  "linear-gradient(90deg, rgb(41 63 91) 0%, rgb(45 103 124) 48%, rgb(47 138 141) 100%)",
  "linear-gradient(90deg, rgb(41 54 91) 0%, rgb(45 103 124) 48%, rgb(141 47 47) 100%)",
  "linear-gradient(90deg, rgb(41 79 91) 0%, rgb(45 124 96) 48%, rgb(47 84 141) 100%)",
  "linear-gradient(90deg, rgb(40 146 179) 0%, rgb(41 163 120) 48%, rgb(31 149 173) 100%)",
  "linear-gradient(90deg, rgb(23 144 60) 0%, rgb(41 163 120) 48%, rgb(51 129 109) 100%)",
  "linear-gradient(90deg, rgb(43 108 29) 0%, rgb(14 120 82) 48%, rgb(30 112 7) 100%)",
  "linear-gradient(90deg, rgb(194 130 58) 0%, rgb(197 137 58) 48%, rgb(181 138 40) 100%)",
  "linear-gradient(90deg, rgb(194 91 58) 0%, rgb(197 137 58) 48%, rgb(181 93 40) 100%)",
];

function parseTickerItems(raw?: string): TopbarRegionItem[] | undefined {
  if (!raw) return undefined;

  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const items = val
      .map((x) => ({
        text: String(x?.text ?? "").trim(),
        chip: String(x?.chip ?? "").trim(),
      }))
      .filter((x) => x.text.length > 0 && x.chip.length > 0);

    return items.length ? items : undefined;
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
    const update = () => setReduced(media.matches);

    update();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return reduced;
}

/* ================ Component ================ */
export function TopbarRegion({
  brandTitle = "Aurora Hub",
  brandHref = "/",
  leftLabel = "Khu vực miền Nam",
  leftHref = "/he-thong-cua-hang",
  hotline = "0867105900",
  statusText = "Đang phục vụ",
  tickerLabel = "Region",
  tickerItems,
  background = BACKGROUND_PRESETS[0],
  preview = false,
}: TopbarRegionProps) {
  const items = useMemo<TopbarRegionItem[]>(
    () =>
      tickerItems?.length
        ? tickerItems
        : [
            { text: "Giao nhanh nội vùng cho đơn từ 299K", chip: "Nội vùng" },
            { text: "Ưu đãi theo khu vực được cập nhật mỗi ngày", chip: "Local" },
            { text: "Hỗ trợ đặt hàng và đồng bộ chi nhánh thuận tiện", chip: "Hub" },
          ],
    [tickerItems],
  );

  const reducedMotion = usePrefersReducedMotion();
  const dropdownId = useId();

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"active" | "leaving" | "entering">("active");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pauseTicker, setPauseTicker] = useState(false);

  const timeoutRef = useRef<number | null>(null);

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (reducedMotion || pauseTicker || items.length <= 1) return;

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
  }, [items.length, pauseTicker, reducedMotion]);

  useEffect(() => {
    if (!menuOpen || preview) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(`.${cls.rgRight}`)) return;
      setMenuOpen(false);
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen, preview]);

  const current = items[index] ?? { text: "", chip: "" };

  return (
    <section
      className={cls.topbarRegion}
      onClick={onBlockClick}
      aria-label="Thông báo khu vực cửa hàng"
      style={{ background }}
    >
      <div className={cls.rgInner}>
        {/* LEFT */}
        <div className={cls.rgLeft}>
          <a href={brandHref} className={cls.rgBrand} onClick={onBlockClick} aria-label={`Về trang chủ ${brandTitle}`}>
            <span className={cls.rgBrandIcon} aria-hidden="true">
              <i className="bi bi-geo-alt-fill" />
            </span>

            <div className={cls.rgBrandText}>
              <span className={cls.rgBrandTitle}>{brandTitle}</span>
              <span className={cls.rgBrandLabel}>{leftLabel}</span>
            </div>
          </a>
        </div>

        {/* CENTER */}
        <div className={cls.rgCenter}>
          <div
            className={cls.rgTicker}
            onMouseEnter={() => setPauseTicker(true)}
            onMouseLeave={() => setPauseTicker(false)}
            onFocus={() => setPauseTicker(true)}
            onBlur={() => setPauseTicker(false)}
          >
            <span className={cls.rgTickerLabel}>{tickerLabel}</span>

            <div
              className={[
                cls.rgTickerText,
                phase === "active" ? cls.isActive : "",
                phase === "leaving" ? cls.isLeaving : "",
                phase === "entering" ? cls.isEntering : "",
              ].join(" ")}
              aria-live={reducedMotion ? "polite" : "off"}
              aria-atomic="true"
            >
              <span className={cls.main}>{current.text}</span>
              <span className={cls.chip}>{current.chip}</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={`${cls.rgRight} ${menuOpen ? cls.isOpen : ""}`}>
          <a
            href={`tel:${hotline}`}
            className={cls.rgPhone}
            onClick={onBlockClick}
            aria-label={`Gọi hotline khu vực ${hotline}`}
          >
            <i className="bi bi-telephone-forward" aria-hidden="true" />
            <span>{hotline}</span>
          </a>

          <div className={cls.rgStatus} role="status" aria-label={`Trạng thái hỗ trợ: ${statusText}`}>
            <span className={cls.rgStatusDot} aria-hidden="true" />
            <span>{statusText}</span>
          </div>

          <button
            type="button"
            className={cls.rgMenuBtn}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              setMenuOpen((v) => !v);
            }}
            aria-label="Mở menu khu vực"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={dropdownId}
          >
            <i className="bi bi-layout-text-sidebar-reverse" aria-hidden="true" />
          </button>

          {!preview && menuOpen ? (
            <div id={dropdownId} className={cls.rgDropdown} role="menu" aria-label="Menu khu vực">
              <a href="/he-thong-cua-hang" className={cls.rgDropdownItem} role="menuitem">
                <i className="bi bi-shop" aria-hidden="true" />
                <span>Chi nhánh gần bạn</span>
              </a>

              <a href="/chinh-sach-giao-hang" className={cls.rgDropdownItem} role="menuitem">
                <i className="bi bi-truck" aria-hidden="true" />
                <span>Chính sách giao theo vùng</span>
              </a>

              <a href="/ho-tro" className={cls.rgDropdownItem} role="menuitem">
                <i className="bi bi-headset" aria-hidden="true" />
                <span>Hỗ trợ khu vực</span>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ================ Registry ================ */
export const SHOP_TOPBAR_REGION: RegItem = {
  kind: "Region",
  label: "Region",
  defaults: {
    brandTitle: "Aurora Hub",
    brandHref: "/",
    leftLabel: "Khu vực miền Nam",
    leftHref: "/he-thong-cua-hang",
    hotline: "0867105900",
    statusText: "Đang phục vụ",
    tickerLabel: "Region",
    background: BACKGROUND_PRESETS[0],
    tickerItems: JSON.stringify(
      [
        { text: "Giao nhanh nội vùng cho đơn từ 299K", chip: "Nội vùng" },
        { text: "Ưu đãi theo khu vực được cập nhật mỗi ngày", chip: "Local" },
        { text: "Hỗ trợ đặt hàng và đồng bộ chi nhánh thuận tiện", chip: "Hub" },
      ],
      null,
      2,
    ),
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "brandHref", label: "Brand Link", kind: "text" },
    { key: "leftLabel", label: "Left Label", kind: "text" },
    { key: "leftHref", label: "Left Link", kind: "text" },
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
  { "text": "Giao nhanh nội vùng cho đơn từ 299K", "chip": "Nội vùng" },
  { "text": "Ưu đãi theo khu vực được cập nhật mỗi ngày", "chip": "Local" }
]`,
    },
  ],
  render: (p) => {
    const items = parseTickerItems(asText(p.tickerItems));
    const background = parseBackground(asText(p.background));

    return (
      <div aria-label="Shop Topbar Region">
        <TopbarRegion
          brandTitle={asText(p.brandTitle)}
          brandHref={asText(p.brandHref)}
          leftLabel={asText(p.leftLabel)}
          leftHref={asText(p.leftHref)}
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

export default TopbarRegion;
