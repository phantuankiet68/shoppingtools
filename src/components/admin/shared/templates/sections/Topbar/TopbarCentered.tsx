"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Topbar/TopbarCentered.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type TopbarCenteredItem = {
  text: string;
  badge: string;
};

export type TopbarCenteredProps = {
  brandTitle?: string;
  leftLabel?: string;
  hotline?: string;
  rightLabel?: string;
  centerLabel?: string;
  tickerItems?: TopbarCenteredItem[];
  background?: string;
  preview?: boolean;
};

const asText = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

const BACKGROUND_PRESETS = [
  "linear-gradient(135deg, rgb(255 141 141), rgb(213 139 139))",
  "linear-gradient(135deg, rgb(255 189 141), rgb(213 159 139))",
  "linear-gradient(135deg, rgb(141 153 255), rgb(213 159 139))",
  "linear-gradient(135deg, rgb(255 141 187), rgb(213 159 139))",
  "linear-gradient(135deg, rgb(239 141 255), rgb(213 159 139))",
  "linear-gradient(135deg, rgb(167 141 255), rgb(213 159 139))",
  "linear-gradient(135deg, rgb(141 166 255), rgb(213 159 139))",
  "linear-gradient(135deg, rgb(255 141 141), rgb(139 171 213))",
  "linear-gradient(135deg, rgb(138 168 255), rgb(181 164 255))",
  "linear-gradient(135deg, rgb(255 141 225), rgb(139 171 213))",
];

function parseTickerItems(raw?: string): TopbarCenteredItem[] | undefined {
  if (!raw) return undefined;

  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const ok = val
      .map((x) => ({
        text: String(x?.text ?? "").trim(),
        badge: String(x?.badge ?? "").trim(),
      }))
      .filter((x) => x.text && x.badge);

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
export function TopbarCentered({
  brandTitle = "Aurora Hub",
  leftLabel = "Giao nhanh nội thành",
  hotline = "0867105900",
  rightLabel = "Hỗ trợ 24/7",
  centerLabel = "HIGHLIGHTS",
  tickerItems,
  background = BACKGROUND_PRESETS[0],
  preview = false,
}: TopbarCenteredProps) {
  const items = useMemo<TopbarCenteredItem[]>(
    () =>
      tickerItems?.length
        ? tickerItems
        : [
            { text: "Miễn phí vận chuyển cho đơn từ 499K", badge: "Freeship" },
            { text: "Đổi trả trong 7 ngày với lỗi kỹ thuật", badge: "7 ngày đổi trả" },
            { text: "Tư vấn đặt hàng và hỗ trợ nhanh mỗi ngày", badge: "Hỗ trợ nhanh" },
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
    }, 4300);

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

  const current = items[index] ?? { text: "", badge: "" };
  const telHref = `tel:${String(hotline).replace(/\s+/g, "")}`;

  return (
    <header
      className={cls.topbarCentered}
      onClick={onBlockClick}
      role="region"
      aria-label="Thanh topbar trung tâm của cửa hàng"
      style={{ background }}
    >
      <div className={cls.tcInner}>
        {/* LEFT */}
        <div className={cls.tcLeft}>
          <button
            type="button"
            className={cls.tcUtility}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              alert("Khu vực utility bên trái có thể mở modal thông tin dịch vụ.");
            }}
            aria-label={leftLabel}
            title={leftLabel}
          >
            <i className="bi bi-lightning-charge" aria-hidden="true" />
            <span>{leftLabel}</span>
          </button>
        </div>

        {/* CENTER */}
        <div className={cls.tcCenter}>
          <div className={cls.tcBrandWrap}>
            <div className={cls.tcBrandIcon} aria-hidden="true">
              <i className="bi bi-stars" />
            </div>

            <div className={cls.tcBrandText}>
              <div className={cls.tcTicker} aria-live={reducedMotion ? "off" : "polite"} aria-atomic="true">
                <span className={cls.tcTickerLabel}>{centerLabel}</span>

                <div
                  className={[
                    cls.tcTickerText,
                    phase === "active" ? cls.isActive : "",
                    phase === "leaving" ? cls.isLeaving : "",
                    phase === "entering" ? cls.isEntering : "",
                  ].join(" ")}
                >
                  <span className={cls.main}>{current.text}</span>
                  <span className={cls.badge}>{current.badge}</span>
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

          <div className={cls.tcStatus} aria-label={rightLabel} title={rightLabel}>
            <span className={cls.tcDot} aria-hidden="true" />
            <span>{rightLabel}</span>
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
            <i className="bi bi-three-dots" aria-hidden="true" />
          </button>

          {!preview && menuOpen ? (
            <div id={menuId} ref={dropdownRef} className={cls.tcDropdown} role="menu" aria-label="Menu tiện ích">
              <button type="button" className={cls.tcDropdownItem} role="menuitem">
                <i className="bi bi-gift" aria-hidden="true" />
                <span>Ưu đãi hôm nay</span>
              </button>
              <button type="button" className={cls.tcDropdownItem} role="menuitem">
                <i className="bi bi-truck" aria-hidden="true" />
                <span>Chính sách giao hàng</span>
              </button>
              <button type="button" className={cls.tcDropdownItem} role="menuitem">
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

/* ================ Registry ================ */
export const SHOP_TOPBAR_CENTERED: RegItem = {
  kind: "Centered",
  label: "Centered",
  defaults: {
    brandTitle: "Aurora Hub",
    leftLabel: "Giao nhanh nội thành",
    hotline: "0867105900",
    rightLabel: "Hỗ trợ 24/7",
    centerLabel: "HIGHLIGHTS",
    background: BACKGROUND_PRESETS[0],
    tickerItems: JSON.stringify(
      [
        { text: "Miễn phí vận chuyển cho đơn từ 499K", badge: "Freeship" },
        { text: "Đổi trả trong 7 ngày với lỗi kỹ thuật", badge: "7 ngày đổi trả" },
        { text: "Tư vấn đặt hàng và hỗ trợ nhanh mỗi ngày", badge: "Hỗ trợ nhanh" },
      ],
      null,
      2,
    ),
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "leftLabel", label: "Left Label", kind: "text" },
    { key: "hotline", label: "Hotline", kind: "text" },
    { key: "rightLabel", label: "Right Label", kind: "text" },
    { key: "centerLabel", label: "Center Label", kind: "text" },
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
  { "text": "Miễn phí vận chuyển cho đơn từ 499K", "badge": "Freeship" },
  { "text": "Đổi trả trong 7 ngày với lỗi kỹ thuật", "badge": "7 ngày đổi trả" }
]`,
    },
  ],
  render: (p) => {
    const items = parseTickerItems(asText(p.tickerItems));
    const background = parseBackground(asText(p.background));

    return (
      <div aria-label="Shop Topbar Centered">
        <TopbarCentered
          brandTitle={asText(p.brandTitle)}
          leftLabel={asText(p.leftLabel)}
          hotline={asText(p.hotline)}
          rightLabel={asText(p.rightLabel)}
          centerLabel={asText(p.centerLabel)}
          tickerItems={items}
          background={background}
          preview={true}
        />
      </div>
    );
  },
};

export default TopbarCentered;
