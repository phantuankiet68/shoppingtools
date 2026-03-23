"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Social/SocialWidgetOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type SocialActionItem = {
  label: string;
  value: string;
  href: string;
  icon?: string;
  highlight?: boolean;
};

export type SocialWidgetOneProps = {
  brandTitle?: string;
  statusText?: string;
  panelTitle?: string;
  panelSubtitle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  position?: "bottom-right" | "bottom-left";
  defaultOpen?: boolean;
  showBackdrop?: boolean;
  supportItems?: SocialActionItem[];
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

export function SocialWidgetOne({
  brandTitle = "Aurora Support",
  statusText = "Typically replies within minutes",
  panelTitle = "How can we help?",
  panelSubtitle = "Connect with sales, support, or order assistance.",
  primaryColor = "#14b8a6",
  secondaryColor = "#0f766e",
  position = "bottom-right",
  defaultOpen = false,
  showBackdrop = false,
  supportItems,
  preview = false,
}: SocialWidgetOneProps) {
  const items = useMemo<SocialActionItem[]>(
    () =>
      supportItems?.length
        ? supportItems
        : [
            {
              label: "Call Hotline",
              value: "+84 867 105 900",
              href: "tel:+84867105900",
              icon: "bi-telephone-fill",
              highlight: true,
            },
            {
              label: "Chat on Zalo",
              value: "Official business support",
              href: "https://zalo.me",
              icon: "bi-chat-dots-fill",
            },
            {
              label: "Messenger",
              value: "Fast answers for product questions",
              href: "https://m.me",
              icon: "bi-messenger",
            },
            {
              label: "Email Support",
              value: "support@example.com",
              href: "mailto:support@example.com",
              icon: "bi-envelope-fill",
            },
          ],
    [supportItems],
  );

  const reducedMotion = usePrefersReducedMotion();
  const panelId = useId();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  const [open, setOpen] = useState(defaultOpen && !preview);
  const [mounted, setMounted] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(defaultOpen && !preview);
  }, [defaultOpen, preview]);

  useEffect(() => {
    if (!open || preview) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      if (panelRef.current?.contains(target)) return;
      if (toggleBtnRef.current?.contains(target)) return;

      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleBtnRef.current?.focus();
      }
    };

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, preview]);

  useEffect(() => {
    if (preview) {
      setShowTopButton(false);
      return;
    }

    const onScroll = () => {
      setShowTopButton(window.scrollY > 240);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [preview]);

  const blockPreviewLink = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleToggle = () => {
    setOpen((v) => !v);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleScrollTop = () => {
    if (preview) return;

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <>
      {showBackdrop && open && !preview ? <div className={cls.backdrop} aria-hidden="true" /> : null}

      <aside
        className={[
          cls.widget,
          mounted ? cls.isMounted : "",
          open ? cls.isOpen : "",
          position === "bottom-left" ? cls.left : cls.right,
        ].join(" ")}
        aria-label="Floating support widget"
        style={
          {
            "--sw-primary": primaryColor,
            "--sw-secondary": secondaryColor,
          } as React.CSSProperties
        }
      >
        <div ref={panelRef} id={panelId} className={cls.panel} role="dialog" aria-modal="false" aria-label={panelTitle}>
          <div className={cls.panelHeader}>
            <div className={cls.brandBlock}>
              <div className={cls.brandIcon} aria-hidden="true">
                <i className="bi bi-headset" />
              </div>

              <div className={cls.brandText}>
                <div className={cls.brandTop}>
                  <strong className={cls.brandTitle}>{brandTitle}</strong>
                  <span className={cls.onlineBadge}>
                    <span className={cls.onlineDot} aria-hidden="true" />
                    Online
                  </span>
                </div>
                <p className={cls.statusText}>{statusText}</p>
              </div>
            </div>

            <button type="button" className={cls.closeBtn} onClick={handleClose} aria-label="Close support panel">
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>

          <div className={cls.panelBody}>
            <div className={cls.heroCard}>
              <span className={cls.heroEyebrow}>Customer care</span>
              <h3 className={cls.panelTitle}>{panelTitle}</h3>
              <p className={cls.panelSubtitle}>{panelSubtitle}</p>
            </div>

            <nav className={cls.actionList} aria-label="Support channels">
              {items.map((item, idx) => {
                const isExternal = item.href.startsWith("http");

                return (
                  <a
                    key={`${item.label}-${idx}`}
                    href={item.href}
                    className={`${cls.actionCard} ${item.highlight ? cls.actionCardHighlight : ""}`}
                    onClick={blockPreviewLink}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                    aria-label={`${item.label}: ${item.value}`}
                    title={`${item.label}: ${item.value}`}
                  >
                    <span className={cls.actionIcon} aria-hidden="true">
                      <i className={`bi ${item.icon || "bi-link-45deg"}`} />
                    </span>

                    <span className={cls.actionContent}>
                      <span className={cls.actionLabel}>{item.label}</span>
                      <span className={cls.actionValue}>{item.value}</span>
                    </span>

                    <span className={cls.actionArrow} aria-hidden="true">
                      <i className="bi bi-arrow-up-right" />
                    </span>
                  </a>
                );
              })}
            </nav>

            <div className={cls.trustBar}>
              <div className={cls.trustItem}>
                <i className="bi bi-patch-check-fill" aria-hidden="true" />
                <span>Verified support</span>
              </div>
              <div className={cls.trustItem}>
                <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
                <span>Fast response</span>
              </div>
              <div className={cls.trustItem}>
                <i className="bi bi-shield-lock-fill" aria-hidden="true" />
                <span>Secure contact</span>
              </div>
            </div>
          </div>
        </div>

        <div className={cls.floatingStack}>
          {showTopButton ? (
            <button
              type="button"
              className={cls.secondaryFab}
              onClick={handleScrollTop}
              aria-label="Back to top"
              title="Back to top"
            >
              <i className="bi bi-arrow-up" aria-hidden="true" />
            </button>
          ) : null}

          <button
            ref={toggleBtnRef}
            type="button"
            className={cls.primaryFab}
            onClick={handleToggle}
            aria-label={open ? "Close support widget" : "Open support widget"}
            aria-expanded={open}
            aria-controls={panelId}
          >
            <span className={cls.primaryFabGlow} aria-hidden="true" />
            <span className={cls.primaryFabIcon} aria-hidden="true">
              <i className={`bi ${open ? "bi-x-lg" : "bi-headset"}`} />
            </span>

            <span className={cls.primaryFabText}>
              <strong>{open ? "Close" : "Support"}</strong>
              <small>{open ? "Hide panel" : "Chat & contact"}</small>
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ================= Helpers ================= */

function parseSupportItems(raw?: string): SocialActionItem[] | undefined {
  if (!raw) return undefined;

  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return undefined;

    const normalized = value
      .map((item) => ({
        label: String(item?.label ?? "").trim(),
        value: String(item?.value ?? "").trim(),
        href: String(item?.href ?? "").trim(),
        icon: item?.icon ? String(item.icon).trim() : undefined,
        highlight: Boolean(item?.highlight),
      }))
      .filter((item) => item.label && item.value && item.href);

    return normalized.length ? normalized : undefined;
  } catch {
    return undefined;
  }
}

function parseString(raw?: string, fallback?: string): string | undefined {
  const value = String(raw ?? "").trim();
  return value || fallback;
}

function parseBoolean(raw?: string | boolean): boolean {
  if (typeof raw === "boolean") return raw;
  return (
    String(raw ?? "")
      .trim()
      .toLowerCase() === "true"
  );
}

const PRIMARY_PRESETS = ["#14b8a6", "#0f766e", "#2563eb", "#7c3aed", "#e11d48", "#f97316"];

const SECONDARY_PRESETS = ["#0f766e", "#0f172a", "#1d4ed8", "#6d28d9", "#be123c", "#ea580c"];

/* ================= Registry ================= */

export const SHOP_SOCIAL_WIDGET_ONE: RegItem = {
  kind: "SocialWidgetOne",
  label: "Social Widget One",
  defaults: {
    brandTitle: "Aurora Support",
    statusText: "Typically replies within minutes",
    panelTitle: "How can we help?",
    panelSubtitle: "Connect with sales, support, or order assistance.",
    primaryColor: PRIMARY_PRESETS[0],
    secondaryColor: SECONDARY_PRESETS[0],
    position: "bottom-right",
    defaultOpen: "false",
    showBackdrop: "false",
    supportItems: JSON.stringify(
      [
        {
          label: "Call Hotline",
          value: "+84 867 105 900",
          href: "tel:+84867105900",
          icon: "bi-telephone-fill",
          highlight: true,
        },
        {
          label: "Chat on Zalo",
          value: "Official business support",
          href: "https://zalo.me",
          icon: "bi-chat-dots-fill",
        },
        {
          label: "Messenger",
          value: "Fast answers for product questions",
          href: "https://m.me",
          icon: "bi-messenger",
        },
        {
          label: "Email Support",
          value: "support@example.com",
          href: "mailto:support@example.com",
          icon: "bi-envelope-fill",
        },
      ],
      null,
      2,
    ),
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "statusText", label: "Status Text", kind: "text" },
    { key: "panelTitle", label: "Panel Title", kind: "text" },
    { key: "panelSubtitle", label: "Panel Subtitle", kind: "textarea", rows: 3 },
    { key: "primaryColor", label: "Primary Color", kind: "select", options: PRIMARY_PRESETS },
    { key: "secondaryColor", label: "Secondary Color", kind: "select", options: SECONDARY_PRESETS },
    {
      key: "position",
      label: "Position",
      kind: "select",
      options: ["bottom-right", "bottom-left"],
    },
    {
      key: "defaultOpen",
      label: "Default Open",
      kind: "select",
      options: ["true", "false"],
    },
    {
      key: "showBackdrop",
      label: "Show Backdrop",
      kind: "select",
      options: ["true", "false"],
    },
    {
      key: "supportItems",
      label: "Support Items (JSON)",
      kind: "textarea",
      rows: 10,
      placeholder: `Example:
[
  {
    "label": "Call Hotline",
    "value": "+84 867 105 900",
    "href": "tel:+84867105900",
    "icon": "bi-telephone-fill",
    "highlight": true
  },
  {
    "label": "Chat on Zalo",
    "value": "Official business support",
    "href": "https://zalo.me",
    "icon": "bi-chat-dots-fill"
  }
]`,
    },
  ],
  render: (p) => {
    const items = parseSupportItems(p.supportItems as string | undefined);
    const primaryColor = parseString(p.primaryColor as string | undefined, PRIMARY_PRESETS[0]);
    const secondaryColor = parseString(p.secondaryColor as string | undefined, SECONDARY_PRESETS[0]);

    return (
      <div aria-label="Shop Social Widget One">
        <SocialWidgetOne
          brandTitle={p.brandTitle as string | undefined}
          statusText={p.statusText as string | undefined}
          panelTitle={p.panelTitle as string | undefined}
          panelSubtitle={p.panelSubtitle as string | undefined}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          position={(p.position as "bottom-right" | "bottom-left" | undefined) ?? "bottom-right"}
          defaultOpen={parseBoolean(p.defaultOpen as string | boolean | undefined)}
          showBackdrop={parseBoolean(p.showBackdrop as string | boolean | undefined)}
          supportItems={items}
          preview={false}
        />
      </div>
    );
  },
};

export default SocialWidgetOne;
