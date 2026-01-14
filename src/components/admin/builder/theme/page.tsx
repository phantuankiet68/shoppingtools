"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/builder/theme/theme-builder.module.css";

type ThemeTokens = {
  name: string;

  colors: {
    primary: string;
    primarySoft: string;
    bg: string;
    surface: string;
    border: string;
    text: string;
    mutedText: string;
    danger: string;
    success: string;
    warning: string;
  };

  typography: {
    fontFamily: string;
    baseSize: number; // px
    headingWeight: number;
    bodyWeight: number;
    lineHeight: number;
  };

  radius: {
    sm: number;
    md: number;
    lg: number;
  };

  shadow: {
    sm: string;
    md: string;
    lg: string;
  };

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeJsonParse(s: string) {
  try {
    return { ok: true as const, value: JSON.parse(s) };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || "Invalid JSON" };
  }
}

function prettyJson(v: any) {
  try {
    return JSON.stringify(v ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

const PRESETS: ThemeTokens[] = [
  {
    name: "Default Blue",
    colors: {
      primary: "#2f7bff",
      primarySoft: "rgba(47, 123, 255, 0.12)",
      bg: "#f6f9ff",
      surface: "#ffffff",
      border: "rgba(15, 23, 42, 0.12)",
      text: "#0f172a",
      mutedText: "rgba(15, 23, 42, 0.65)",
      danger: "#ef4444",
      success: "#22c55e",
      warning: "#f59e0b",
    },
    typography: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
      baseSize: 14,
      headingWeight: 900,
      bodyWeight: 600,
      lineHeight: 1.5,
    },
    radius: { sm: 12, md: 16, lg: 22 },
    shadow: {
      sm: "0 6px 18px rgba(15, 23, 42, 0.08)",
      md: "0 10px 30px rgba(15, 23, 42, 0.10)",
      lg: "0 16px 44px rgba(15, 23, 42, 0.12)",
    },
    spacing: { xs: 6, sm: 10, md: 14, lg: 18 },
  },
  {
    name: "Ocean",
    colors: {
      primary: "#0ea5e9",
      primarySoft: "rgba(14, 165, 233, 0.14)",
      bg: "#f2fbff",
      surface: "#ffffff",
      border: "rgba(2, 132, 199, 0.18)",
      text: "#062235",
      mutedText: "rgba(6, 34, 53, 0.65)",
      danger: "#ef4444",
      success: "#10b981",
      warning: "#f59e0b",
    },
    typography: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
      baseSize: 14,
      headingWeight: 900,
      bodyWeight: 600,
      lineHeight: 1.55,
    },
    radius: { sm: 12, md: 18, lg: 26 },
    shadow: {
      sm: "0 6px 18px rgba(6, 34, 53, 0.08)",
      md: "0 10px 30px rgba(6, 34, 53, 0.10)",
      lg: "0 16px 44px rgba(6, 34, 53, 0.12)",
    },
    spacing: { xs: 6, sm: 10, md: 14, lg: 18 },
  },
  {
    name: "Dark",
    colors: {
      primary: "#60a5fa",
      primarySoft: "rgba(96, 165, 250, 0.16)",
      bg: "#0b1220",
      surface: "#0f172a",
      border: "rgba(148, 163, 184, 0.16)",
      text: "#e2e8f0",
      mutedText: "rgba(226, 232, 240, 0.70)",
      danger: "#fb7185",
      success: "#34d399",
      warning: "#fbbf24",
    },
    typography: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
      baseSize: 14,
      headingWeight: 900,
      bodyWeight: 600,
      lineHeight: 1.55,
    },
    radius: { sm: 12, md: 18, lg: 26 },
    shadow: {
      sm: "0 10px 24px rgba(0, 0, 0, 0.35)",
      md: "0 14px 36px rgba(0, 0, 0, 0.45)",
      lg: "0 18px 52px rgba(0, 0, 0, 0.55)",
    },
    spacing: { xs: 6, sm: 10, md: 14, lg: 18 },
  },
];

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export default function ThemeBuilderPage() {
  const [themes, setThemes] = useState<ThemeTokens[]>(() => PRESETS.map(deepClone));
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const active = themes[activeIndex];

  const [jsonText, setJsonText] = useState<string>(() => prettyJson(active));
  const [err, setErr] = useState<string>("");

  function selectTheme(i: number) {
    setActiveIndex(i);
    setJsonText(prettyJson(themes[i]));
    setErr("");
  }

  function updateActive(patch: Partial<ThemeTokens>) {
    setThemes((prev) => {
      const next = [...prev];
      next[activeIndex] = { ...next[activeIndex], ...patch };
      return next;
    });
  }

  function updateNested(path: string[], value: any) {
    setThemes((prev) => {
      const next = [...prev];
      const cur = deepClone(next[activeIndex]);

      let obj: any = cur;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;

      next[activeIndex] = cur;
      return next;
    });
  }

  function applyJson() {
    const res = safeJsonParse(jsonText.trim() || "{}");
    if (!res.ok) return setErr(`JSON error: ${res.error}`);

    // minimal validation
    if (!res.value?.colors?.primary) return setErr("Missing colors.primary");
    if (!res.value?.name) return setErr("Missing name");

    setThemes((prev) => {
      const next = [...prev];
      next[activeIndex] = res.value as ThemeTokens;
      return next;
    });
    setErr("");
  }

  function syncJsonFromForm() {
    setJsonText(prettyJson(themes[activeIndex]));
    setErr("");
  }

  function duplicatePreset() {
    setThemes((prev) => {
      const next = [...prev, { ...deepClone(prev[activeIndex]), name: prev[activeIndex].name + " Copy" }];
      return next;
    });
    setTimeout(() => selectTheme(themes.length), 0);
  }

  const cssVars = useMemo(() => {
    const t = active;
    return {
      "--t-primary": t.colors.primary,
      "--t-primarySoft": t.colors.primarySoft,
      "--t-bg": t.colors.bg,
      "--t-surface": t.colors.surface,
      "--t-border": t.colors.border,
      "--t-text": t.colors.text,
      "--t-mutedText": t.colors.mutedText,
      "--t-danger": t.colors.danger,
      "--t-success": t.colors.success,
      "--t-warning": t.colors.warning,

      "--t-font": t.typography.fontFamily,
      "--t-baseSize": `${t.typography.baseSize}px`,
      "--t-headingWeight": `${t.typography.headingWeight}`,
      "--t-bodyWeight": `${t.typography.bodyWeight}`,
      "--t-lineHeight": `${t.typography.lineHeight}`,

      "--t-r-sm": `${t.radius.sm}px`,
      "--t-r-md": `${t.radius.md}px`,
      "--t-r-lg": `${t.radius.lg}px`,

      "--t-sh-sm": t.shadow.sm,
      "--t-sh-md": t.shadow.md,
      "--t-sh-lg": t.shadow.lg,

      "--t-sp-xs": `${t.spacing.xs}px`,
      "--t-sp-sm": `${t.spacing.sm}px`,
      "--t-sp-md": `${t.spacing.md}px`,
      "--t-sp-lg": `${t.spacing.lg}px`,
    } as React.CSSProperties;
  }, [active]);

  return (
    <div className={styles.shell} style={cssVars}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Theme Builder</div>
            <div className={styles.brandSub}>Tokens · Presets · Live Preview · Export JSON</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={duplicatePreset}>
            <i className="bi bi-files" /> Duplicate preset
          </button>
          <button className={styles.ghostBtn} type="button" onClick={syncJsonFromForm}>
            <i className="bi bi-arrow-counterclockwise" /> Sync JSON
          </button>
          <button className={styles.primaryBtn} type="button" onClick={applyJson}>
            <i className="bi bi-check2-circle" /> Apply JSON
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Theme presets</div>
            <div className={styles.sidebarHint}>Chọn preset hoặc duplicate rồi chỉnh tokens.</div>
          </div>

          <div className={styles.presetList}>
            {themes.map((t, i) => (
              <button key={i} type="button" className={`${styles.presetItem} ${i === activeIndex ? styles.presetActive : ""}`} onClick={() => selectTheme(i)}>
                <span className={styles.swatch} style={{ background: t.colors.primary }} />
                <div className={styles.presetText}>
                  <div className={styles.presetTitle}>{t.name}</div>
                  <div className={styles.presetMeta}>
                    <span className={styles.mono}>{t.colors.primary}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.mono}>{t.typography.baseSize}px</span>
                  </div>
                </div>
                <i className={`bi ${i === activeIndex ? "bi-check2-circle" : "bi-circle"}`} />
              </button>
            ))}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>
                Khi save vào DB, bạn lưu tokens vào <span className={styles.mono}>Site.theme</span> hoặc <span className={styles.mono}>Page.themeOverride</span>.
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.grid}>
            {/* Tokens Form */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Tokens</div>
                  <div className={styles.panelSub}>Chỉnh nhanh bằng form — sau đó “Sync JSON”.</div>
                </div>
              </div>

              <div className={styles.panelBody}>
                {/* Name */}
                <div className={styles.row}>
                  <label className={styles.label}>Theme name</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-palette" />
                    <input className={styles.input} value={active.name} onChange={(e) => updateActive({ name: e.target.value })} placeholder="My Theme" />
                  </div>
                </div>

                {/* Colors */}
                <div className={styles.sectionTitle}>
                  <i className="bi bi-droplet" /> Colors
                </div>

                <div className={styles.twoCols}>
                  {(
                    [
                      ["primary", "Primary"],
                      ["bg", "Background"],
                      ["surface", "Surface"],
                      ["text", "Text"],
                      ["mutedText", "Muted text"],
                      ["border", "Border"],
                      ["success", "Success"],
                      ["warning", "Warning"],
                      ["danger", "Danger"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className={styles.row}>
                      <label className={styles.label}>{label}</label>
                      <div className={styles.colorRow}>
                        <input
                          className={styles.color}
                          type="color"
                          value={key === "mutedText" || key === "border" ? "#999999" : (active.colors as any)[key]}
                          onChange={(e) => updateNested(["colors", key], e.target.value)}
                          title="Pick color"
                        />
                        <input className={styles.input} value={(active.colors as any)[key]} onChange={(e) => updateNested(["colors", key], e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.row}>
                  <label className={styles.label}>Primary soft</label>
                  <input className={styles.input} value={active.colors.primarySoft} onChange={(e) => updateNested(["colors", "primarySoft"], e.target.value)} placeholder="rgba(47, 123, 255, 0.12)" />
                  <div className={styles.hint}>Tip: dùng rgba() để tạo nền nhẹ cho badge / hover / card.</div>
                </div>

                {/* Typography */}
                <div className={styles.sectionTitle}>
                  <i className="bi bi-fonts" /> Typography
                </div>

                <div className={styles.twoCols}>
                  <div className={styles.row}>
                    <label className={styles.label}>Base font size (px)</label>
                    <input
                      className={styles.input}
                      type="number"
                      value={active.typography.baseSize}
                      onChange={(e) => updateNested(["typography", "baseSize"], clamp(Number(e.target.value || 0), 12, 18))}
                    />
                  </div>

                  <div className={styles.row}>
                    <label className={styles.label}>Line height</label>
                    <input
                      className={styles.input}
                      type="number"
                      step="0.05"
                      value={active.typography.lineHeight}
                      onChange={(e) => updateNested(["typography", "lineHeight"], clamp(Number(e.target.value || 0), 1.2, 1.9))}
                    />
                  </div>

                  <div className={styles.row}>
                    <label className={styles.label}>Heading weight</label>
                    <input
                      className={styles.input}
                      type="number"
                      value={active.typography.headingWeight}
                      onChange={(e) => updateNested(["typography", "headingWeight"], clamp(Number(e.target.value || 0), 600, 950))}
                    />
                  </div>

                  <div className={styles.row}>
                    <label className={styles.label}>Body weight</label>
                    <input
                      className={styles.input}
                      type="number"
                      value={active.typography.bodyWeight}
                      onChange={(e) => updateNested(["typography", "bodyWeight"], clamp(Number(e.target.value || 0), 400, 800))}
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <label className={styles.label}>Font family</label>
                  <input className={styles.input} value={active.typography.fontFamily} onChange={(e) => updateNested(["typography", "fontFamily"], e.target.value)} />
                </div>

                {/* Radius / Spacing */}
                <div className={styles.sectionTitle}>
                  <i className="bi bi-bounding-box" /> Radius & Spacing
                </div>

                <div className={styles.twoCols}>
                  <div className={styles.row}>
                    <label className={styles.label}>Radius sm</label>
                    <input className={styles.input} type="number" value={active.radius.sm} onChange={(e) => updateNested(["radius", "sm"], clamp(Number(e.target.value || 0), 6, 20))} />
                  </div>
                  <div className={styles.row}>
                    <label className={styles.label}>Radius md</label>
                    <input className={styles.input} type="number" value={active.radius.md} onChange={(e) => updateNested(["radius", "md"], clamp(Number(e.target.value || 0), 8, 28))} />
                  </div>
                  <div className={styles.row}>
                    <label className={styles.label}>Radius lg</label>
                    <input className={styles.input} type="number" value={active.radius.lg} onChange={(e) => updateNested(["radius", "lg"], clamp(Number(e.target.value || 0), 10, 36))} />
                  </div>

                  <div className={styles.row}>
                    <label className={styles.label}>Spacing md</label>
                    <input className={styles.input} type="number" value={active.spacing.md} onChange={(e) => updateNested(["spacing", "md"], clamp(Number(e.target.value || 0), 8, 28))} />
                  </div>
                </div>
              </div>
            </section>

            {/* Preview */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Live Preview</div>
                  <div className={styles.panelSub}>Preview card, buttons, inputs theo theme tokens.</div>
                </div>
              </div>

              <div className={styles.previewWrap}>
                <div className={styles.previewCard}>
                  <div className={styles.previewHeader}>
                    <div className={styles.previewTitle}>Theme Preview</div>
                    <div className={styles.previewBadge}>
                      <i className="bi bi-stars" /> {active.name}
                    </div>
                  </div>

                  <p className={styles.previewText}>Đây là preview nhanh. Khi bạn áp dụng theme vào toàn site, bạn chỉ cần export tokens và map ra CSS variables.</p>

                  <div className={styles.previewActions}>
                    <button className={styles.btnPrimary} type="button">
                      <i className="bi bi-lightning-charge" /> Primary
                    </button>
                    <button className={styles.btnGhost} type="button">
                      <i className="bi bi-gear" /> Ghost
                    </button>
                    <button className={styles.btnDanger} type="button">
                      <i className="bi bi-trash" /> Danger
                    </button>
                  </div>

                  <div className={styles.previewForm}>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-search" />
                      <input className={styles.input} placeholder="Search..." />
                    </div>
                    <div className={styles.hint}>
                      <i className="bi bi-info-circle" /> Borders, radius, shadow đều lấy từ tokens.
                    </div>
                  </div>
                </div>

                <div className={styles.jsonBox}>
                  <div className={styles.jsonHeader}>
                    <div className={styles.jsonTitle}>
                      <i className="bi bi-braces" /> Theme JSON
                    </div>
                    <button className={styles.ghostBtn} type="button" onClick={() => navigator.clipboard.writeText(jsonText)}>
                      <i className="bi bi-clipboard" /> Copy
                    </button>
                  </div>

                  <textarea className={styles.jsonArea} value={jsonText} onChange={(e) => setJsonText(e.target.value)} spellCheck={false} />

                  {err && (
                    <div className={styles.error}>
                      <i className="bi bi-exclamation-triangle" />
                      <span>{err}</span>
                    </div>
                  )}

                  <div className={styles.jsonActions}>
                    <button className={styles.primaryBtn} type="button" onClick={applyJson}>
                      <i className="bi bi-check2-circle" /> Apply JSON
                    </button>
                    <button className={styles.ghostBtn} type="button" onClick={syncJsonFromForm}>
                      <i className="bi bi-arrow-counterclockwise" /> Sync JSON
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
