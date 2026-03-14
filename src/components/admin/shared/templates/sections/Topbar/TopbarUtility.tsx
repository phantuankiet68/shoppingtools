"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Topbar/TopbarUtility.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type TopbarUtilityItem = {
  text: string;
  chip: string;
};

export type TopbarUtilityProps = {
  brandTitle?: string;
  brandHref?: string;
  leftLabel?: string;
  leftHref?: string;
  hotline?: string;
  statusText?: string;
  tickerLabel?: string;
  tickerItems?: TopbarUtilityItem[];
  background?: string;
  preview?: boolean;
};

/* ================= Helpers ================= */
const asText = (v: unknown): string | undefined => (typeof v === "string" ? v.trim() || undefined : undefined);

const BACKGROUND_PRESETS = [
  "#ffffff",
  "linear-gradient(135deg, rgb(255 192 192), rgb(253 185 185))",
  "linear-gradient(135deg, rgb(255 192 211), rgb(253 185 210))",
  "linear-gradient(135deg, rgb(253 192 255), rgb(253 185 228))",
  "linear-gradient(135deg, rgb(206 192 255), rgb(200 185 253))",
  "linear-gradient(135deg, rgb(192 201 255), rgb(185 205 253))",
  "linear-gradient(135deg, rgb(192 247 255), rgb(185 230 253))",
  "linear-gradient(135deg, rgb(255 138 190), rgb(255 164 234))",
  "linear-gradient(135deg, rgb(192 255 209), rgb(185 253 213))",
  "linear-gradient(135deg, rgb(255 233 192), rgb(253 224 185))",
  "linear-gradient(135deg, rgb(255 109 109), rgb(255 106 106))",
];

function parseTickerItems(raw?: string): TopbarUtilityItem[] | undefined {
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
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener?.("change", update);

    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  return reducedMotion;
}

/* ================ Component ================ */
export function TopbarUtility({
  brandTitle = "Aurora Hub",
  brandHref = "/",
  leftLabel = "Utility Access",
  leftHref = "/account",
  hotline = "0867105900",
  statusText = "Ready to Support",
  tickerLabel = "Notice",
  tickerItems,
  background = BACKGROUND_PRESETS[0],
  preview = false,
}: TopbarUtilityProps) {
  const items = useMemo<TopbarUtilityItem[]>(
    () =>
      tickerItems?.length
        ? tickerItems
        : [
            { text: "Miễn phí vận chuyển cho đơn từ 499K", chip: "Freeship" },
            { text: "Hỗ trợ mua hàng nhanh, kiểm tra đơn và ưu đãi tại một nơi", chip: "Utility" },
            { text: "Đồng bộ tài khoản, lịch sử và thông báo trên mọi thiết bị", chip: "Sync" },
          ],
    [tickerItems],
  );

  const reducedMotion = usePrefersReducedMotion();
  const dropdownId = useId();
  const timeoutRef = useRef<number | null>(null);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"active" | "leaving" | "entering">("active");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pauseTicker, setPauseTicker] = useState(false);

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
      if (target.closest(`.${cls.utRight}`)) return;
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
      className={cls.topbarUtility}
      onClick={onBlockClick}
      aria-label="Thanh tiện ích cửa hàng"
      style={{ background }}
    >
      <div className={cls.utInner}>
        {/* LEFT */}
        <div className={cls.utLeft}>
          <a href={brandHref} className={cls.utBrand} onClick={onBlockClick} aria-label={`Về trang chủ ${brandTitle}`}>
            <span className={cls.utBrandMark} aria-hidden="true">
              <i className="bi bi-wrench-adjustable-circle" />
            </span>

            <div className={cls.utBrandText}>
              <span className={cls.utBrandTitle}>{brandTitle}</span>
              <span className={cls.utBrandSub}>{leftLabel}</span>
            </div>
          </a>
        </div>

        {/* CENTER */}
        <div className={cls.utCenter}>
          <div
            className={cls.utTicker}
            onMouseEnter={() => setPauseTicker(true)}
            onMouseLeave={() => setPauseTicker(false)}
            onFocus={() => setPauseTicker(true)}
            onBlur={() => setPauseTicker(false)}
          >
            <span className={cls.utTickerLabel}>{tickerLabel}</span>

            <div
              className={[
                cls.utTickerText,
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
        <div className={`${cls.utRight} ${menuOpen ? cls.isOpen : ""}`}>
          <a
            href={`tel:${hotline}`}
            className={cls.utPhone}
            onClick={onBlockClick}
            aria-label={`Gọi hotline ${hotline}`}
          >
            <i className="bi bi-telephone" aria-hidden="true" />
            <span>{hotline}</span>
          </a>

          <div className={cls.utStatus} role="status" aria-label={`Trạng thái hỗ trợ: ${statusText}`}>
            <span className={cls.utStatusDot} aria-hidden="true" />
            <span>{statusText}</span>
          </div>

          <a href="/account" className={cls.utActionBtn} onClick={onBlockClick} aria-label="Truy cập tiện ích nhanh">
            <i className="bi bi-lightning-charge" aria-hidden="true" />
          </a>

          <button
            type="button"
            className={cls.utMenuBtn}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              setMenuOpen((v) => !v);
            }}
            aria-label="Mở menu tiện ích"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={dropdownId}
          >
            <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
          </button>

          {!preview && menuOpen ? (
            <div id={dropdownId} className={cls.utDropdown} role="menu" aria-label="Menu tiện ích">
              <a href="/track-order" className={cls.utDropdownItem} role="menuitem">
                <i className="bi bi-box-seam" aria-hidden="true" />
                <span>Theo dõi đơn hàng</span>
              </a>

              <a href="/coupons" className={cls.utDropdownItem} role="menuitem">
                <i className="bi bi-ticket-perforated" aria-hidden="true" />
                <span>Mã giảm giá của bạn</span>
              </a>

              <a href="/support" className={cls.utDropdownItem} role="menuitem">
                <i className="bi bi-headset" aria-hidden="true" />
                <span>Trung tâm hỗ trợ</span>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ================ Registry ================ */
export const SHOP_TOPBAR_UTILITY: RegItem = {
  kind: "TopbarUtility",
  label: "Topbar Utility",
  defaults: {
    brandTitle: "Aurora Hub",
    brandHref: "/",
    leftLabel: "Utility Access",
    leftHref: "/account",
    hotline: "0867105900",
    statusText: "Ready to Support",
    tickerLabel: "Notice",
    background: BACKGROUND_PRESETS[0],
    tickerItems: JSON.stringify(
      [
        { text: "Miễn phí vận chuyển cho đơn từ 499K", chip: "Freeship" },
        { text: "Hỗ trợ mua hàng nhanh, kiểm tra đơn và ưu đãi tại một nơi", chip: "Utility" },
        { text: "Đồng bộ tài khoản, lịch sử và thông báo trên mọi thiết bị", chip: "Sync" },
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
  { "text": "Miễn phí vận chuyển cho đơn từ 499K", "chip": "Freeship" },
  { "text": "Hỗ trợ mua hàng nhanh, kiểm tra đơn và ưu đãi tại một nơi", "chip": "Utility" }
]`,
    },
  ],
  render: (p) => {
    const items = parseTickerItems(asText(p.tickerItems));
    const background = parseBackground(asText(p.background));

    return (
      <div aria-label="Shop Topbar Utility">
        <TopbarUtility
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

export default TopbarUtility;
