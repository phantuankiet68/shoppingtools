"use client";

import { useMemo, useState } from "react";

import styles from "@/styles/admin/categories/categories-automation.module.css";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import {
  ECOMMERCE_CATEGORY_PRESETS,
  LANDING_PAGE_PRESETS,
  WEBSITE_TYPES,
  type EcommercePresetKey,
  type LandingPagePresetKey,
} from "@/constants/categories/index";

type PresetKey = EcommercePresetKey | LandingPagePresetKey;

type WebsiteType = "ecommerce" | "landing-page" | "other";

type Props = {
  open: boolean;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (websiteType: WebsiteType, selected: PresetKey[]) => Promise<void>;
};
export default function CategoryAutomationModal({ open, loading, onClose, onSubmit }: Props) {
  const { t } = useAdminI18n();

  const [websiteType, setWebsiteType] = useState<WebsiteType>("ecommerce");

  const [search, setSearch] = useState("");

  const [selectedKeys, setSelectedKeys] = useState<PresetKey[]>([]);

  const presets = useMemo(() => {
    switch (websiteType) {
      case "landing-page":
        return LANDING_PAGE_PRESETS;

      case "ecommerce":
      default:
        return ECOMMERCE_CATEGORY_PRESETS;
    }
  }, [websiteType]);

  const filteredPresets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return presets;
    }

    return presets.filter((item) => {
      return (
        item.label.toLowerCase().includes(keyword) ||
        item.categories.some((category) => category.name.toLowerCase().includes(keyword))
      );
    });
  }, [search, presets]);

  const togglePreset = (key: PresetKey) => {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((x) => x !== key);
      }

      return [...prev, key];
    });
  };

  const handleSelectAll = () => {
    setSelectedKeys(filteredPresets.map((x) => x.key));
  };

  const handleClearAll = () => {
    setSelectedKeys([]);
  };

  const handleSubmit = async () => {
    if (selectedKeys.length === 0) return;

    await onSubmit(websiteType, selectedKeys);
  };

  const handleChangeWebsiteType = (value: WebsiteType) => {
    setWebsiteType(value);

    setSelectedKeys([]);

    setSearch("");
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>{t("categoriesAutomation.title")}</h2>

          <button className={styles.closeBtn} onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          <div className={styles.gridSelect}>
            <div className={styles.section}>
              <label className={styles.label}>{t("categoriesAutomation.websiteType")}</label>

              <div className={styles.selectBox}>
                <i className="bi bi-globe2" />

                <select value={websiteType} onChange={(e) => handleChangeWebsiteType(e.target.value as WebsiteType)}>
                  {WEBSITE_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {t(item.label)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>{t("categoriesAutomation.businessType")}</label>

              <div className={styles.searchRow}>
                <div className={styles.searchBox}>
                  <i className="bi bi-search" />

                  <input
                    placeholder={t("categoriesAutomation.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <button type="button" className={styles.secondaryBtn} onClick={handleSelectAll}>
                  <i className="bi bi-check2-square" />

                  {t("categoriesAutomation.selectAll")}
                </button>

                <button type="button" className={styles.secondaryBtn} onClick={handleClearAll}>
                  <i className="bi bi-eraser" />

                  {t("categoriesAutomation.clearAll")}
                </button>
              </div>
            </div>
          </div>

          {/* GRID */}
          <div className={styles.grid}>
            {filteredPresets.map((item) => {
              const checked = selectedKeys.includes(item.key);

              return (
                <div
                  key={item.key}
                  className={`${styles.card} ${checked ? styles.activeCard : ""}`}
                  onClick={() => togglePreset(item.key)}
                >
                  <div className={styles.cardTop}>
                    <input type="checkbox" checked={checked} readOnly />

                    <h3>{t(item.label)}</h3>
                  </div>

                  <p>{item.categories.map((x) => t(x.name)).join(", ")}</p>
                </div>
              );
            })}
          </div>

          {/* INFO */}
          <div className={styles.infoBox}>
            <i className="bi bi-lightbulb" />

            {t("categoriesAutomation.selectedInfo.before")}

            <strong>{selectedKeys.length}</strong>

            {t("categoriesAutomation.selectedInfo.after")}
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            {t("categoriesAutomation.common.cancel")}
          </button>

          <button
            type="button"
            className={styles.submitBtn}
            disabled={loading || selectedKeys.length === 0}
            onClick={handleSubmit}
          >
            <i className="bi bi-magic" />

            {loading ? t("categoriesAutomation.creating") : t("categoriesAutomation.autoCreate")}
          </button>
        </div>
      </div>
    </div>
  );
}
