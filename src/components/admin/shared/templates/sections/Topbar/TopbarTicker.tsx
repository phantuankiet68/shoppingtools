"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Topbar/TopbarTicker.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type TopbarTickerItem = {
  text: string;
  chip: string;
};

export type TopbarTickerProps = {
  brandTitle?: string;
  brandHref?: string;
  leftLabel?: string;
  leftHref?: string;
  hotline?: string;
  statusText?: string;
  tickerLabel?: string;
  tickerItems?: TopbarTickerItem[];
  background?: string;
  preview?: boolean;
};

/* ================= Helpers ================= */
const asText = (v: unknown): string | undefined => (typeof v === "string" ? v.trim() || undefined : undefined);

const BACKGROUND_PRESETS = [
  "linear-gradient(90deg, #07131a 0%, #0b1b24 48%, #0a1821 100%)",
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

function parseTickerItems(raw?: string): TopbarTickerItem[] | undefined {
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
export function TopbarTicker({
  brandTitle = "Aurora Hub",
  brandHref = "/",
  leftLabel = "Live Commerce Feed",
  leftHref = "/about",
  hotline = "0867105900",
  statusText = "Streaming Updates",
  tickerLabel = "Ticker",
  tickerItems,
  background = BACKGROUND_PRESETS[0],
  preview = false,
}: TopbarTickerProps) {
  const items = useMemo<TopbarTickerItem[]>(
    () =>
      tickerItems?.length
        ? tickerItems
        : [
            { text: "Miễn phí vận chuyển cho đơn từ 499K", chip: "Freeship" },
            { text: "Cập nhật ưu đãi liên tục theo thời gian thực", chip: "Live" },
            { text: "Trải nghiệm mua sắm nhanh hơn với gợi ý thông minh", chip: "Smart" },
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
      if (target.closest(`.${cls.tkRight}`)) return;
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
      className={cls.topbarTicker}
      onClick={onBlockClick}
      aria-label="Thanh thông báo cửa hàng"
      style={{ background }}
    >
      <div className={cls.tkInner}>
        {/* LEFT */}
        <div className={cls.tkLeft}>
          <a href={brandHref} className={cls.tkBrand} onClick={onBlockClick} aria-label={`Về trang chủ ${brandTitle}`}>
            <span className={cls.tkBrandPulse} aria-hidden="true" />
            <div className={cls.tkBrandText}>
              <span className={cls.tkBrandTitle}>{brandTitle}</span>
              <span className={cls.tkBrandSub}>{leftLabel}</span>
            </div>
          </a>
        </div>

        {/* CENTER */}
        <div className={cls.tkCenter}>
          <div
            className={cls.tkTickerWrap}
            onMouseEnter={() => setPauseTicker(true)}
            onMouseLeave={() => setPauseTicker(false)}
            onFocus={() => setPauseTicker(true)}
            onBlur={() => setPauseTicker(false)}
          >
            <span className={cls.tkTickerLabel}>
              <span className={cls.tkTickerDot} aria-hidden="true" />
              {tickerLabel}
            </span>

            <div
              className={[
                cls.tkTickerText,
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
        <div className={`${cls.tkRight} ${menuOpen ? cls.isOpen : ""}`}>
          <a
            href={`tel:${hotline}`}
            className={cls.tkPhone}
            onClick={onBlockClick}
            aria-label={`Gọi hotline ${hotline}`}
          >
            <i className="bi bi-telephone" aria-hidden="true" />
            <span>{hotline}</span>
          </a>

          <div className={cls.tkStatus} role="status" aria-label={`Trạng thái cập nhật: ${statusText}`}>
            <span className={cls.tkStatusDot} aria-hidden="true" />
            <span>{statusText}</span>
          </div>

          <button
            type="button"
            className={cls.tkMenuBtn}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              setMenuOpen((v) => !v);
            }}
            aria-label="Mở menu ticker"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={dropdownId}
          >
            <i className="bi bi-broadcast-pin" aria-hidden="true" />
          </button>

          {!preview && menuOpen ? (
            <div id={dropdownId} className={cls.tkDropdown} role="menu" aria-label="Menu ticker">
              <a href="/news" className={cls.tkDropdownItem} role="menuitem">
                <i className="bi bi-megaphone" aria-hidden="true" />
                <span>Tin nổi bật hôm nay</span>
              </a>

              <a href="/promotions" className={cls.tkDropdownItem} role="menuitem">
                <i className="bi bi-tags" aria-hidden="true" />
                <span>Ưu đãi đang chạy</span>
              </a>

              <a href="/support" className={cls.tkDropdownItem} role="menuitem">
                <i className="bi bi-headset" aria-hidden="true" />
                <span>Hỗ trợ nhanh</span>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ================ Registry ================ */
export const SHOP_TOPBAR_TICKER: RegItem = {
  kind: "Ticker",
  label: "Ticker",
  defaults: {
    brandTitle: "Aurora Hub",
    brandHref: "/",
    leftLabel: "Live Commerce Feed",
    leftHref: "/about",
    hotline: "0867105900",
    statusText: "Streaming Updates",
    tickerLabel: "Ticker",
    background: BACKGROUND_PRESETS[0],
    tickerItems: JSON.stringify(
      [
        { text: "Miễn phí vận chuyển cho đơn từ 499K", chip: "Freeship" },
        { text: "Cập nhật ưu đãi liên tục theo thời gian thực", chip: "Live" },
        { text: "Trải nghiệm mua sắm nhanh hơn với gợi ý thông minh", chip: "Smart" },
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
  { "text": "Cập nhật ưu đãi liên tục theo thời gian thực", "chip": "Live" }
]`,
    },
  ],
  render: (p) => {
    const items = parseTickerItems(asText(p.tickerItems));
    const background = parseBackground(asText(p.background));

    return (
      <div aria-label="Shop Topbar Ticker">
        <TopbarTicker
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

export default TopbarTicker;
