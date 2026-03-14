"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Topbar/TopbarSplit.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type TopbarSplitItem = {
  text: string;
  chip: string;
};

export type TopbarSplitProps = {
  brandTitle?: string;
  brandHref?: string;
  leftLabel?: string;
  leftHref?: string;
  hotline?: string;
  statusText?: string;
  tickerLabel?: string;
  tickerItems?: TopbarSplitItem[];
  background?: string;
  preview?: boolean;
};

/* ================= Helpers ================= */
const asText = (v: unknown): string | undefined => (typeof v === "string" ? v.trim() || undefined : undefined);

const BACKGROUND_PRESETS = [
  "linear-gradient(90deg, #0f172a 0%, #111827 48%, #0b1220 100%)",
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

function parseTickerItems(raw?: string): TopbarSplitItem[] | undefined {
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
    media.addEventListener?.("change", update);

    return () => media.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

/* ================ Component ================ */
export function TopbarSplit({
  brandTitle = "Aurora Hub",
  brandHref = "/",
  leftLabel = "Official Commerce",
  leftHref = "/about",
  hotline = "0867105900",
  statusText = "Live Support",
  tickerLabel = "Flash",
  tickerItems,
  background = BACKGROUND_PRESETS[0],
  preview = false,
}: TopbarSplitProps) {
  const items = useMemo<TopbarSplitItem[]>(
    () =>
      tickerItems?.length
        ? tickerItems
        : [
            { text: "Miễn phí vận chuyển cho đơn từ 499K", chip: "Freeship" },
            { text: "Gợi ý mua sắm thông minh cho từng khách hàng", chip: "Smart" },
            { text: "Đồng bộ đơn hàng, lịch sử và ưu đãi đa nền tảng", chip: "Sync" },
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
      if (target.closest(`.${cls.spRight}`)) return;
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
    <section className={cls.topbarSplit} onClick={onBlockClick} aria-label="Thông báo cửa hàng" style={{ background }}>
      <div className={cls.spInner}>
        {/* LEFT */}
        <div className={cls.spLeft}>
          <a href={brandHref} className={cls.spBrand} onClick={onBlockClick} aria-label={`Về trang chủ ${brandTitle}`}>
            <span className={cls.spBrandIcon} aria-hidden="true">
              <i className="bi bi-columns-gap" />
            </span>

            <div className={cls.spBrandText}>
              <span className={cls.spBrandTitle}>{brandTitle}</span>
              <span className={cls.spBrandSub}>{leftLabel}</span>
            </div>
          </a>
        </div>

        {/* CENTER */}
        <div className={cls.spCenter}>
          <div
            className={cls.spTicker}
            onMouseEnter={() => setPauseTicker(true)}
            onMouseLeave={() => setPauseTicker(false)}
            onFocus={() => setPauseTicker(true)}
            onBlur={() => setPauseTicker(false)}
          >
            <span className={cls.spTickerLabel}>{tickerLabel}</span>

            <div
              className={[
                cls.spTickerText,
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
        <div className={`${cls.spRight} ${menuOpen ? cls.isOpen : ""}`}>
          <a
            href={`tel:${hotline}`}
            className={cls.spPhone}
            onClick={onBlockClick}
            aria-label={`Gọi hotline ${hotline}`}
          >
            <i className="bi bi-telephone-outbound" aria-hidden="true" />
            <span>{hotline}</span>
          </a>

          <div className={cls.spStatus} role="status" aria-label={`Trạng thái hỗ trợ: ${statusText}`}>
            <span className={cls.spStatusDot} aria-hidden="true" />
            <span>{statusText}</span>
          </div>

          <button
            type="button"
            className={cls.spMenuBtn}
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
            <i className="bi bi-sliders2" aria-hidden="true" />
          </button>

          {!preview && menuOpen ? (
            <div id={dropdownId} className={cls.spDropdown} role="menu" aria-label="Menu nhanh">
              <a href="/promotions" className={cls.spDropdownItem} role="menuitem">
                <i className="bi bi-lightning-charge" aria-hidden="true" />
                <span>Ưu đãi nhanh</span>
              </a>
              <a href="/track-order" className={cls.spDropdownItem} role="menuitem">
                <i className="bi bi-box-seam" aria-hidden="true" />
                <span>Tra cứu đơn hàng</span>
              </a>
              <a href="/support" className={cls.spDropdownItem} role="menuitem">
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
export const SHOP_TOPBAR_SPLIT: RegItem = {
  kind: "TopbarSplit",
  label: "TopbarSplit",
  defaults: {
    brandTitle: "Aurora Hub",
    brandHref: "/",
    leftLabel: "Official Commerce",
    leftHref: "/about",
    hotline: "0867105900",
    statusText: "Live Support",
    tickerLabel: "Flash",
    background: BACKGROUND_PRESETS[0],
    tickerItems: JSON.stringify(
      [
        { text: "Miễn phí vận chuyển cho đơn từ 499K", chip: "Freeship" },
        { text: "Gợi ý mua sắm thông minh cho từng khách hàng", chip: "Smart" },
        { text: "Đồng bộ đơn hàng, lịch sử và ưu đãi đa nền tảng", chip: "Sync" },
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
  { "text": "Gợi ý mua sắm thông minh cho từng khách hàng", "chip": "Smart" }
]`,
    },
  ],
  render: (p) => {
    const items = parseTickerItems(asText(p.tickerItems));
    const background = parseBackground(asText(p.background));

    return (
      <div aria-label="Shop Topbar Split">
        <TopbarSplit
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

export default TopbarSplit;
