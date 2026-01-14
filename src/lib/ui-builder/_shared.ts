import React from "react";

export const clamp01to5 = (n: any, d = 3) => {
  const v = Number.isFinite(+n) ? Math.max(0, Math.min(5, +n)) : d;
  return v;
};

export const bgClass = (bg?: string) => {
  switch (bg) {
    case "light":
      return "bg-light";
    case "dark":
      return "bg-dark text-white";
    case "body":
      return "bg-body";
    case "transparent":
    default:
      return "";
  }
};

/** Build class cho Bootstrap Col từ props: { xs, sm, md, lg, xl, xxl } */
export const mkColClass = (p: any) => {
  const seg = (bp: string) => {
    const v = p?.[bp];
    if (v === true || v === "true") return `col-${bp}`;
    if (v === "auto") return `col-${bp}-auto`;
    if (v === "" || v == null) return "";
    const n = Number(v);
    return Number.isFinite(n) ? `col-${bp}-${n}` : "";
  };

  const xs = (() => {
    const v = p?.xs;
    if (v === true || v === "true") return "col";
    if (v === "auto") return "col-auto";
    if (v === "" || v == null) return "";
    const n = Number(v);
    return Number.isFinite(n) ? `col-${n}` : "";
  })();

  return [xs || "col", seg("sm"), seg("md"), seg("lg"), seg("xl"), seg("xxl")].filter(Boolean).join(" ");
};

/** Chuẩn hoá options (string[] | {value,label}[] | CSV line/”value|label”) */
export const normalizeOptions = (options: any): { value: string; label: string }[] => {
  if (Array.isArray(options)) {
    if (options.length === 0) return [];
    if (typeof options[0] === "string") {
      return (options as string[]).map((s) => ({ value: s, label: s }));
    }
    return (options as any[]).map((it) => {
      if (typeof it === "string") return { value: it, label: it };
      const v = String(it?.value ?? "");
      const l = String(it?.label ?? it?.value ?? "");
      return { value: v, label: l || v };
    });
  }
  const raw = String(options || "");
  if (!raw) return [];
  const lines = raw
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
  return lines.map((line) => {
    const [v = "", l = ""] = line.split("|").map((x) => x.trim());
    return { value: v, label: l || v };
  });
};
