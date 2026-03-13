"use client";

import React, { useMemo } from "react";
import cls from "@/styles/admin/builder/pages/design-header.module.css";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";

type Device = "desktop" | "tablet" | "mobile";

type SiteOption = {
  id: string;
  name: string;
  domain?: string;
  localeDefault?: string;
};

type Props = {
  title: string;
  setTitle?: (v: string) => void;
  path?: string;
  saving?: boolean;
  saved?: boolean;
  publishing?: boolean;
  onSave?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  onRefresh?: () => void;
  device?: Device;
  setDevice?: (d: Device) => void;

  sites?: SiteOption[];
  selectedSiteId?: string;
  onChangeSite?: (siteId: string) => void;
  disableSiteSelect?: boolean;
};

function DesignHeader({
  title,
  setTitle,
  path,
  saving,
  saved,
  publishing,
  onSave,
  onPublish,
  onPreview,
  onRefresh,
  device = "desktop",
  setDevice,
  sites = [],
  selectedSiteId = "",
  onChangeSite,
  disableSiteSelect = false,
}: Props) {
  const handleRefresh = React.useCallback(() => {
    window.location.href = "/admin/builder/pages";
  }, []);

  const functionKeyActions = useMemo(
    () => ({
      F2: {
        action: () => onPublish?.(),
        label: "Publish",
        icon: "bi-arrow-right-short",
      },
      F3: {
        action: () => onPreview?.(),
        label: "Preview",
        icon: "bi-eye",
      },
      F5: {
        action: () => onSave?.(),
        label: "Save",
        icon: "bi-save",
      },
      F6: {
        action: handleRefresh,
        label: "Scancel",
        icon: "bi-arrow-repeat",
      },
    }),
    [onPublish, onPreview, onSave, handleRefresh],
  );

  usePageFunctionKeys(functionKeyActions);

  return (
    <div className={`${cls.bar} mb-2`} role="toolbar" aria-label="Builder header">
      <div className={cls.center}>
        <div className={cls.titleRow}>
          {setTitle ? (
            <input
              className={cls.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề trang…"
              aria-label="Page title"
            />
          ) : (
            <span className={cls.title} title={title || "Untitled"}>
              {title || "Untitled"}
            </span>
          )}
        </div>

        <div className={cls.subRow}>
          <div className={`${cls.kv} me-3`}>
            <select
              className={cls.select}
              value={selectedSiteId}
              onChange={(e) => onChangeSite?.(e.target.value)}
              disabled={disableSiteSelect}
              aria-label="Chọn site"
            >
              {sites.length === 0 ? (
                <option value="">No site</option>
              ) : (
                sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.domain ? `— ${s.domain}` : ""} {s.localeDefault ? `(${s.localeDefault})` : ""}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      <div className={cls.right}>
        <div className={cls.deviceGroup} role="group" aria-label="Device">
          {(["desktop", "tablet", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              className={`${cls.deviceBtn} ${device === d ? cls.deviceActive : ""}`}
              onClick={() => setDevice?.(d)}
              title={d}
              aria-pressed={device === d}
            >
              <i className={`bi ${d === "desktop" ? "bi-display" : d === "tablet" ? "bi-tablet" : "bi-phone"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(DesignHeader);
