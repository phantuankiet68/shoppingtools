"use client";

import React, { useEffect, useMemo, useState } from "react";
import cls from "@/styles/template/shopGreen/topbar/topbar1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type TopbarTickerItem = { main: string; tag: string };

export type Topbar1Props = {
  brandTitle?: string;
  regionLabel?: string;
  hotline?: string;
  statusText?: string;
  tickerLabel?: string;
  tickerItems?: TopbarTickerItem[];
  preview?: boolean;
};

/* ================ Component ================ */
export function Topbar1({
  brandTitle = "Aurora Hub",
  regionLabel = "KV: Ho Chi Minh",
  hotline = "0867105900",
  statusText = "Online 24/7",
  tickerLabel = "UPDATES",
  tickerItems,
  preview = false,
}: Topbar1Props) {
  const items = useMemo<TopbarTickerItem[]>(
    () =>
      tickerItems?.length
        ? tickerItems
        : [
            { main: "AI recommends suitable products.", tag: "AI Mode" },
            { main: "Sync shopping across all devices.", tag: "Space Room" },
            { main: "25-minute focus for order processing.", tag: "Focus 25'" },
          ],
    [tickerItems],
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"active" | "leaving" | "entering">("active");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (!items.length) return;

    const interval = window.setInterval(() => {
      setPhase("leaving");

      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setPhase("entering");

        requestAnimationFrame(() => {
          requestAnimationFrame(() => setPhase("active"));
        });
      }, 280);
    }, 4600);

    return () => window.clearInterval(interval);
  }, [items.length]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 900);
    }, 7000);

    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!menuOpen || preview) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(`.${cls.tbRight}`)) return;
      setMenuOpen(false);
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen, preview]);

  const current = items[index] ?? { main: "", tag: "" };

  return (
    <div className={cls.topbar2026} onClick={onBlockClick}>
      <div className={cls.tbInner}>
        {/* LEFT */}
        <div className={cls.tbLeft}>
          <div className={`${cls.tbLogoPill} ${pulse ? cls.isPulse : ""}`} aria-hidden="true">
            <i className="bi bi-sparkles" />
          </div>

          <div className={cls.tbBrandText}>
            <div className={cls.tbBrandTitle}>{brandTitle}</div>
          </div>

          <button
            type="button"
            className={cls.tbRegionChip}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              alert("Sau này bạn có thể mở popover chọn khu vực / chi nhánh ở đây (2026 style).");
            }}>
            <i className="bi bi-geo-alt" />
            <span>{regionLabel}</span>
            <i className="bi bi-chevron-down" />
          </button>
        </div>

        {/* CENTER */}
        <div className={cls.tbCenter}>
          <div className={cls.tbTicker}>
            <div className={cls.tbTickerTrack}>
              <span className={cls.tbTickerLabel}>{tickerLabel}</span>

              <div className={[cls.tbTickerText, phase === "active" ? cls.isActive : "", phase === "leaving" ? cls.isLeaving : "", phase === "entering" ? cls.isEntering : ""].join(" ")}>
                <span className={cls.main}>{current.main}</span>
                <span className={cls.tag}>{current.tag}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={`${cls.tbRight} ${menuOpen ? cls.isOpen : ""}`}>
          <div className={cls.tbRightLinks}>
            <button className={cls.tbLink} type="button" onClick={onBlockClick}>
              <span>Hotline: {hotline}</span>
            </button>
          </div>

          <div className={cls.tbDivider} />

          <div className={cls.tbStatusPill}>
            <span className={cls.tbStatusDot} />
            <span>{statusText}</span>
          </div>

          <button
            type="button"
            className={cls.tbMoreBtn}
            onClick={(e) => {
              onBlockClick(e);
              if (preview) return;
              setMenuOpen((v) => !v);
            }}
            aria-label="More">
            <i className="bi bi-list" />
          </button>
        </div>
      </div>
    </div>
  );
}

function parseTickerItems(raw?: string): TopbarTickerItem[] | undefined {
  if (!raw) return undefined;

  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const ok = val.map((x) => ({ main: String(x?.main ?? ""), tag: String(x?.tag ?? "") })).filter((x) => x.main && x.tag);

    return ok.length ? ok : undefined;
  } catch {
    return undefined;
  }
}

export const SHOP_TOPBAR_GREEN_ONE: RegItem = {
  kind: "Topbar1",
  label: "Topbar",
  defaults: {
    brandTitle: "Aurora Hub",
    regionLabel: "KV: Ho Chi Minh",
    hotline: "0867105900",
    statusText: "Online 24/7",
    tickerLabel: "UPDATES",
    tickerItems: JSON.stringify(
      [
        { main: "AI recommends suitable products.", tag: "AI Mode" },
        { main: "Sync shopping across all devices.", tag: "Space Room" },
        { main: "25-minute focus for order processing.", tag: "Focus 25'" },
      ],
      null,
      2,
    ),
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "regionLabel", label: "Region Label", kind: "text" },
    { key: "hotline", label: "Hotline", kind: "text" },
    { key: "statusText", label: "Status Text", kind: "text" },
    { key: "tickerLabel", label: "Ticker Label", kind: "text" },
    {
      key: "tickerItems",
      label: "Ticker Items (JSON)",
      kind: "textarea",
      rows: 6,
      placeholder: `Ví dụ:
        [
            {"main":"AI recommends suitable products.","tag":"AI Mode"},
            {"main":"Sync shopping across all devices.","tag":"Space Room"}
        ]`,
    },
  ],
  render: (p) => {
    const items = parseTickerItems(p.tickerItems);

    return (
      <div aria-label="Shop Topbar (Green One)">
        <Topbar1 brandTitle={p.brandTitle} regionLabel={p.regionLabel} hotline={p.hotline} statusText={p.statusText} tickerLabel={p.tickerLabel} tickerItems={items} preview={true} />
      </div>
    );
  },
};

export default Topbar1;
