"use client";

import { useEffect } from "react";
import { useSiteStore } from "@/store/site/site.store";

export function SiteSelect() {
  const sites = useSiteStore((s) => s.sites);
  const loading = useSiteStore((s) => s.loading);
  const err = useSiteStore((s) => s.err);
  const siteId = useSiteStore((s) => s.siteId);

  const loadSites = useSiteStore((s) => s.loadSites);
  const hydrate = useSiteStore((s) => s.hydrateFromStorage);
  const setSiteId = useSiteStore((s) => s.setSiteId);

  useEffect(() => {
    hydrate();
    loadSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <label style={{ fontWeight: 700 }}>Site</label>

      <select
        value={siteId}
        onChange={(e) => setSiteId(e.target.value)}
        disabled={loading}
        style={{ padding: "6px 10px", borderRadius: 8 }}
      >
        <option value="">{loading ? "Loading..." : "Select site"}</option>
        {sites.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name ? `${s.name}` : s.id}
          </option>
        ))}
      </select>

      {err ? <span style={{ color: "crimson", fontSize: 12 }}>{err}</span> : null}
    </div>
  );
}
