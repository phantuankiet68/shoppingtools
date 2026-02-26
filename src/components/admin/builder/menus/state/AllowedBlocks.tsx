// app/(admin)/menu/components/AllowedBlocks.tsx
"use client";

import React from "react";
import { useMenuStore, type BuilderMenuItem } from "@/components/admin/menu/state/useMenuStore";
import styles from "@/styles/admin/menu/menu.module.css";

type TabKey = "home" | "dashboard";

function isTabbedConfig(v: unknown): v is { home: string[]; dashboard?: string[] } {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Array.isArray((v as any).home) &&
    ((v as any).dashboard === undefined || Array.isArray((v as any).dashboard))
  );
}

export default function AllowedBlocks() {
  const {
    TEMPLATE_ALLOWED,
    templateKey,
    activeMenu,
    setActiveMenu,
    addBlankItem,
    INTERNAL_PAGES,
    siteKind,
    currentSet,
  } = useMenuStore();

  const tpl = TEMPLATE_ALLOWED[templateKey];
  const hasTabs = isTabbedConfig(tpl);

  // ✅ Ép tab theo currentSet, không dùng state tab để tránh user đổi tay + tránh re-render dư
  const forcedTab: TabKey = currentSet === "v1" ? "dashboard" : "home";

  const baseNames: string[] = React.useMemo(() => {
    if (!tpl) return [];
    if (Array.isArray(tpl)) return tpl;

    // ✅ dashboard có thể undefined
    return forcedTab === "dashboard" ? (tpl.dashboard ?? []) : tpl.home;
  }, [tpl, forcedTab]);

  const existingPages = React.useMemo(() => {
    const set = new Set<string>();

    (INTERNAL_PAGES || []).forEach((p) => {
      if (p.label) set.add(p.label.toLowerCase().trim());
      if (p.labelVi) set.add(p.labelVi.toLowerCase().trim());
      (p.aliases || []).forEach((a) => set.add(a.toLowerCase().trim()));
    });

    return set;
  }, [INTERNAL_PAGES]);

  const SUGGEST = React.useMemo(() => {
    const out: Record<string, string[]> = {};

    if (siteKind === "ecommerce") {
      out["Product Experience"] = [
        "Product Detail",
        "Product Reviews",
        "Compare Products",
        "Recently Viewed",
        "Related Products",
      ];
      out["Trust & Conversion"] = [
        "Customer Reviews",
        "Testimonials",
        "Warranty Policy",
        "Return Process",
        "Payment Methods",
      ];
      out["Order & After Sale"] = ["Order Tracking", "Track My Order", "Order History", "Reorder"];
      out["Content & Growth"] = ["News", "Press", "Promotions Detail", "Campaigns"];
      out["Engagement"] = ["Notifications", "Subscriptions", "Newsletter", "Loyalty Program", "Reward Points"];
      out["Utilities"] = ["Store Locator", "Size Guide", "Help Center", "Live Chat"];
    }

    return out;
  }, [siteKind]);

  const existingTitles = React.useMemo(() => {
    const all: string[] = [];

    const walk = (arr: BuilderMenuItem[]) => {
      arr.forEach((n) => {
        if (n?.title) all.push(String(n.title).toLowerCase().trim());
        if (n?.children?.length) walk(n.children);
      });
    };

    walk(activeMenu || []);
    return new Set(all);
  }, [activeMenu]);

  const findPageByName = React.useCallback(
    (name: string) => {
      const needle = name
        .toLowerCase()
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
        .trim();

      return INTERNAL_PAGES.find((p) => {
        const pool = [p.label, p.labelVi, ...(p.aliases || [])]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase().trim());

        return pool.includes(needle);
      });
    },
    [INTERNAL_PAGES],
  );

  const addByName = React.useCallback(
    (name: string) => {
      const page = findPageByName(name);

      const item: BuilderMenuItem = {
        id: `s_${Math.random().toString(36).slice(2, 9)}`,
        title: name,
        icon: "",
        linkType: "internal",
        externalUrl: "",
        internalPageId: page?.id ?? "home",
        rawPath: page?.path ?? "/",
        schedules: [],
        children: [],
      };

      setActiveMenu([...(activeMenu || []), item]);
    },
    [activeMenu, findPageByName, setActiveMenu],
  );

  const onDragStart = React.useCallback(
    (e: React.DragEvent, name: string) => {
      const page = findPageByName(name);

      const payload = page
        ? { type: "new", name, linkType: "internal" as const, internalPageId: page.id, rawPath: page.path }
        : { type: "new", name, linkType: "internal" as const, internalPageId: "home", rawPath: "/" };

      const json = JSON.stringify(payload);
      e.dataTransfer.setData("application/json", json);
      e.dataTransfer.setData("text/plain", json);
      e.dataTransfer.effectAllowed = "copy";
    },
    [findPageByName],
  );

  const filteredSuggest = React.useMemo(() => {
    const out: Record<string, string[]> = {};
    const baseSet = new Set(baseNames.map((s) => s.toLowerCase().trim()));

    Object.entries(SUGGEST).forEach(([group, arr]) => {
      const items = arr.filter((name) => {
        const key = name.toLowerCase().trim();
        return !baseSet.has(key) && !existingTitles.has(key) && !existingPages.has(key);
      });

      if (items.length) out[group] = items;
    });

    return out;
  }, [SUGGEST, baseNames, existingTitles, existingPages]);

  return (
    <div className={styles.cardform}>
      <div className={styles.cardHeader}>
        <button className={`${styles.btn} ${styles.btnOutlineLight}`} onClick={addBlankItem} type="button">
          <i className="bi bi-plus-lg" /> Add empty item
        </button>

        {hasTabs && (
          <div className={styles.smallHelp} style={{ marginLeft: "auto" }}>
            <button type="button" className={`${styles.btn} ${styles.btnOutlinePrimary}`}>
              Showing: <b>{forcedTab === "dashboard" ? "Dashboard" : "Home"}</b>
            </button>
          </div>
        )}
      </div>

      <div className={styles.grid2}>
        <div className={styles.blocksGrid}>
          {baseNames.map((n) => (
            <div key={n} className={styles.blockCell}>
              <div
                className={`${styles.blockCard} ${styles.appCard}`}
                draggable
                onDragStart={(e) => onDragStart(e, n)}
                onClick={() => addByName(n)}
                title="Kéo thả hoặc nhấn để thêm vào Menu"
              >
                <div className={styles.blockIconWrap}>
                  <i className="bi bi-cursor" />
                </div>
                <div>
                  <div className={styles.blockTitle}>{n}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section
          className={styles.blocksGridRight}
          aria-label="Suggestions for expanding the menu"
          style={{ display: "grid", gap: 6 }}
        >
          {Object.keys(filteredSuggest).length === 0 ? (
            <div className={styles.smallHelp}>
              No more suggestions — you've got all the important points already. 🎉
            </div>
          ) : (
            Object.entries(filteredSuggest).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 500, marginBottom: 6, color: "rgb(134 134 134)", fontSize: 16 }}>{group}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {items.map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => addByName(name)}
                      onDragStart={(e) => onDragStart(e as any, name)}
                      draggable
                      className={styles.btn}
                      style={{
                        borderRadius: 20,
                        border: "1px dashed var(--bd,#cbd5e1)",
                        background: "var(--chip-bg,rgba(16,185,129,.08))",
                        padding: "6px 10px",
                        fontSize: 13,
                      }}
                      title="Click to add, or drag and drop into structure"
                    >
                      <i className="bi bi-plus-lg" style={{ marginRight: 6 }} />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      <div className={styles.divider} />
    </div>
  );
}
