"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Topbar/TopbarClassic.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type TopbarClassicItem = {
  text: string;
  note: string;
};

export type TopbarClassicProps = {
  brandTitle?: string;
  locationLabel?: string;
  hotline?: string;
  workingText?: string;
  promoLabel?: string;
  tickerItems?: TopbarClassicItem[];
  background?: string;
  preview?: boolean;
};

/* ================= Helpers ================= */
const asText = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

const BACKGROUND_PRESETS = [
  "linear-gradient(135deg, rgb(141, 170, 255), rgb(139 170 213))",
  "linear-gradient(135deg, rgb(141 224 255), rgb(139 204 213))",
  "linear-gradient(135deg, rgb(255 194 141), rgb(213 173 139))",
  "linear-gradient(135deg, rgb(255 152 141), rgb(213 154 139))",
  "linear-gradient(135deg, rgb(113 182 132), rgb(139 213 173))",
  "linear-gradient(135deg, rgb(182 113 174), rgb(213 139 196))",
  "linear-gradient(135deg, rgb(255 138 190), rgb(255 164 234))",
  "linear-gradient(135deg, rgb(255 138 155), rgb(255 164 164))",
  "linear-gradient(135deg, rgb(138 168 255), rgb(181 164 255))",
  "linear-gradient(135deg, rgb(22 82 229), rgb(49 86 255))",
];

function parseTickerItems(raw?: string): TopbarClassicItem[] | undefined {
  if (!raw) return undefined;

  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const ok = val
      .map((x) => ({
        text: String(x?.text ?? "").trim(),
        note: String(x?.note ?? "").trim(),
      }))
      .filter((x) => x.text && x.note);

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
export function TopbarClassic({
  locationLabel = "Hồ Chí Minh",
  hotline = "0867105900",
  workingText = "Hỗ trợ 24/7",
  promoLabel = "PROMO",
  tickerItems,
  background = BACKGROUND_PRESETS[0],
  preview = false,
}: TopbarClassicProps) {
  const items = useMemo<TopbarClassicItem[]>(
    () =>
      tickerItems?.length
        ? tickerItems
        : [
            { text: "Miễn phí vận chuyển cho đơn từ 499K", note: "Freeship" },
            { text: "Đổi trả trong 7 ngày với lỗi kỹ thuật", note: "7 ngày đổi trả" },
            { text: "Hàng chính hãng, hỗ trợ tư vấn nhanh mỗi ngày", note: "Chính hãng" },
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
      }, 260);
    }, 4400);

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

  const current = items[index] ?? { text: "", note: "" };
  const telHref = `tel:${String(hotline).replace(/\s+/g, "")}`;

  return (
    <header
      className={cls.topbarClassic}
      onClick={onBlockClick}
      role="region"
      aria-label="Thanh topbar cổ điển của cửa hàng"
      style={{ background }}
    >
      <div className={cls.tcInner}>
        {/* LEFT */}
        <div className={cls.tcLeft}>
          <button
            type="button"
            className={cls.tcInfoChip}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              alert("Sau này có thể mở popover khu vực hoặc hệ thống cửa hàng tại đây.");
            }}
            aria-label={`Khu vực hiện tại: ${locationLabel}`}
            title={locationLabel}
          >
            <i className="bi bi-geo-alt" aria-hidden="true" />
            <span>{locationLabel}</span>
            <i className="bi bi-chevron-down" aria-hidden="true" />
          </button>
        </div>

        {/* CENTER */}
        <div className={cls.tcCenter}>
          <div className={cls.tcBrandBlock}>
            <div className={cls.tcBrandMark} aria-hidden="true">
              <i className="bi bi-shop" />
            </div>

            <div className={cls.tcBrandContent}>
              <div className={cls.tcTicker} aria-live={reducedMotion ? "off" : "polite"} aria-atomic="true">
                <span className={cls.tcTickerLabel}>{promoLabel}</span>

                <div
                  className={[
                    cls.tcTickerText,
                    phase === "active" ? cls.isActive : "",
                    phase === "leaving" ? cls.isLeaving : "",
                    phase === "entering" ? cls.isEntering : "",
                  ].join(" ")}
                >
                  <span className={cls.main}>{current.text}</span>
                  <span className={cls.note}>{current.note}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={`${cls.tcRight} ${menuOpen ? cls.isOpen : ""}`}>
          <a
            href={telHref}
            className={cls.tcPhone}
            onClick={onBlockClick}
            aria-label={`Gọi hotline ${hotline}`}
            title={`Hotline đặt hàng ${hotline}`}
          >
            <i className="bi bi-telephone" aria-hidden="true" />
            <span>{hotline}</span>
          </a>

          <div className={cls.tcWorking} aria-label={workingText} title={workingText}>
            <span className={cls.tcDot} aria-hidden="true" />
            <span>{workingText}</span>
          </div>

          <button
            ref={menuBtnRef}
            type="button"
            className={cls.tcMenuBtn}
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
            <i className="bi bi-list" aria-hidden="true" />
          </button>

          {!preview && menuOpen ? (
            <div id={menuId} ref={dropdownRef} className={cls.tcDropdown} role="menu" aria-label="Menu tiện ích">
              <button type="button" className={cls.tcDropdownItem} role="menuitem">
                <i className="bi bi-bag" aria-hidden="true" />
                <span>Sản phẩm nổi bật</span>
              </button>
              <button type="button" className={cls.tcDropdownItem} role="menuitem">
                <i className="bi bi-truck" aria-hidden="true" />
                <span>Chính sách giao hàng</span>
              </button>
              <button type="button" className={cls.tcDropdownItem} role="menuitem">
                <i className="bi bi-headset" aria-hidden="true" />
                <span>Trung tâm hỗ trợ</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/* ================ Registry ================ */
export const SHOP_TOPBAR_CLASSIC: RegItem = {
  kind: "Classic",
  label: "Classic",
  defaults: {
    locationLabel: "Hồ Chí Minh",
    hotline: "0867105900",
    workingText: "Hỗ trợ 24/7",
    promoLabel: "PROMO",
    background: BACKGROUND_PRESETS[0],
    tickerItems: JSON.stringify(
      [
        { text: "Miễn phí vận chuyển cho đơn từ 499K", note: "Freeship" },
        { text: "Đổi trả trong 7 ngày với lỗi kỹ thuật", note: "7 ngày đổi trả" },
        { text: "Hàng chính hãng, hỗ trợ tư vấn nhanh mỗi ngày", note: "Chính hãng" },
      ],
      null,
      2,
    ),
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "locationLabel", label: "Location Label", kind: "text" },
    { key: "hotline", label: "Hotline", kind: "text" },
    { key: "workingText", label: "Working Text", kind: "text" },
    { key: "promoLabel", label: "Promo Label", kind: "text" },
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
  { "text": "Miễn phí vận chuyển cho đơn từ 499K", "note": "Freeship" },
  { "text": "Đổi trả trong 7 ngày với lỗi kỹ thuật", "note": "7 ngày đổi trả" }
]`,
    },
  ],
  render: (p) => {
    const items = parseTickerItems(asText(p.tickerItems));
    const background = parseBackground(asText(p.background));

    return (
      <div aria-label="Shop Topbar Classic">
        <TopbarClassic
          locationLabel={asText(p.locationLabel)}
          hotline={asText(p.hotline)}
          workingText={asText(p.workingText)}
          promoLabel={asText(p.promoLabel)}
          tickerItems={items}
          background={background}
          preview={true}
        />
      </div>
    );
  },
};

export default TopbarClassic;
