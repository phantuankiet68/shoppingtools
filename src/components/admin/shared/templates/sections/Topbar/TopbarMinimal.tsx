"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Topbar/TopbarMinimal.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type TopbarMinimalItem = {
  text: string;
  chip: string;
};

export type TopbarMinimalProps = {
  brandTitle?: string;
  brandHref?: string;
  leftLabel?: string;
  leftHref?: string;
  hotline?: string;
  statusText?: string;
  tickerLabel?: string;
  tickerItems?: TopbarMinimalItem[];
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

function parseTickerItems(raw?: string): TopbarMinimalItem[] | undefined {
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
export function TopbarMinimal({
  brandTitle = "Aurora Hub",
  brandHref = "/",
  leftLabel = "Official Store",
  leftHref = "/about",
  hotline = "0867105900",
  statusText = "Available",
  tickerLabel = "Update",
  tickerItems,
  background = BACKGROUND_PRESETS[0],
  preview = false,
}: TopbarMinimalProps) {
  const items = useMemo<TopbarMinimalItem[]>(
    () =>
      tickerItems?.length
        ? tickerItems
        : [
            { text: "Miễn phí vận chuyển cho đơn từ 499K", chip: "Freeship" },
            { text: "Mua sắm nhanh hơn với trải nghiệm tối giản", chip: "Smooth" },
            { text: "Đồng bộ tài khoản và giỏ hàng trên mọi thiết bị", chip: "Sync" },
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
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [items.length, pauseTicker, reducedMotion]);

  useEffect(() => {
    if (!menuOpen || preview) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(`.${cls.mnRight}`)) return;
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
      className={cls.topbarMinimal}
      onClick={onBlockClick}
      aria-label="Thông báo cửa hàng"
      style={{ background }}
    >
      <div className={cls.mnInner}>
        {/* LEFT */}
        <div className={cls.mnLeft}>
          <a href={brandHref} className={cls.mnBrand} onClick={onBlockClick} aria-label={`Về trang chủ ${brandTitle}`}>
            <span className={cls.mnBrandMark} aria-hidden="true" />
            <span className={cls.mnBrandTitle}>{brandTitle}</span>
          </a>

          <span className={cls.mnDivider} aria-hidden="true" />

          <a href={leftHref} className={cls.mnLeftMeta} onClick={onBlockClick} aria-label={leftLabel}>
            <i className="bi bi-shield-check" aria-hidden="true" />
            <span>{leftLabel}</span>
          </a>
        </div>

        {/* CENTER */}
        <div className={cls.mnCenter}>
          <div
            className={cls.mnTicker}
            onMouseEnter={() => setPauseTicker(true)}
            onMouseLeave={() => setPauseTicker(false)}
            onFocus={() => setPauseTicker(true)}
            onBlur={() => setPauseTicker(false)}
          >
            <span className={cls.mnTickerLabel}>{tickerLabel}</span>

            <div
              className={[
                cls.mnTickerText,
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
        <div className={`${cls.mnRight} ${menuOpen ? cls.isOpen : ""}`}>
          <a
            href={`tel:${hotline}`}
            className={cls.mnPhone}
            onClick={onBlockClick}
            aria-label={`Gọi hotline ${hotline}`}
          >
            <i className="bi bi-telephone" aria-hidden="true" />
            <span>{hotline}</span>
          </a>

          <div className={cls.mnStatus} role="status" aria-label={`Trạng thái hỗ trợ: ${statusText}`}>
            <span className={cls.mnStatusDot} aria-hidden="true" />
            <span>{statusText}</span>
          </div>

          <button
            type="button"
            className={cls.mnMenuBtn}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              setMenuOpen((v) => !v);
            }}
            aria-label="Mở menu nhanh"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={dropdownId}
          >
            <i className="bi bi-three-dots" aria-hidden="true" />
          </button>

          {!preview && menuOpen ? (
            <div id={dropdownId} className={cls.mnDropdown} role="menu" aria-label="Menu nhanh">
              <a href="/promotions" className={cls.mnDropdownItem} role="menuitem">
                <i className="bi bi-stars" aria-hidden="true" />
                <span>Ưu đãi nổi bật</span>
              </a>
              <a href="/track-order" className={cls.mnDropdownItem} role="menuitem">
                <i className="bi bi-bag-check" aria-hidden="true" />
                <span>Kiểm tra đơn hàng</span>
              </a>
              <a href="/support" className={cls.mnDropdownItem} role="menuitem">
                <i className="bi bi-chat-dots" aria-hidden="true" />
                <span>Liên hệ hỗ trợ</span>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ================ Registry ================ */
export const SHOP_TOPBAR_MINIMAL: RegItem = {
  kind: "TopbarMinimal",
  label: "Topbar Minimal",
  defaults: {
    brandTitle: "Aurora Hub",
    brandHref: "/",
    leftLabel: "Official Store",
    leftHref: "/about",
    hotline: "0867105900",
    statusText: "Available",
    tickerLabel: "Update",
    background: BACKGROUND_PRESETS[0],
    tickerItems: JSON.stringify(
      [
        { text: "Miễn phí vận chuyển cho đơn từ 499K", chip: "Freeship" },
        { text: "Mua sắm nhanh hơn với trải nghiệm tối giản", chip: "Smooth" },
        { text: "Đồng bộ tài khoản và giỏ hàng trên mọi thiết bị", chip: "Sync" },
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
  { "text": "Mua sắm nhanh hơn với trải nghiệm tối giản", "chip": "Smooth" }
]`,
    },
  ],
  render: (p) => {
    const items = parseTickerItems(asText(p.tickerItems));
    const background = parseBackground(asText(p.background));

    return (
      <div aria-label="Shop Topbar Minimal">
        <TopbarMinimal
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

export default TopbarMinimal;
