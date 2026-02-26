"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import React from "react";
import cls from "@/styles/admin/templates/hero/banner-pro.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
type PalettePreset = "sunrise" | "coral" | "peach";
type PaletteCustom = { brand: string; brand2: string };

export type BannerProps = {
  eyebrow?: string;
  title?: string;
  highlight?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;

  imageSrc: string;
  imageAlt?: string;

  palette?: PalettePreset | PaletteCustom;
  /** dùng khi render trong canvas: chặn điều hướng */
  preview?: boolean;
};

/* ================ Component ================ */
export function BannerPro({
  eyebrow = "Trusted by 2,000+ teams",
  title = "Embrace the Digital Transformation of",
  highlight = "Next-Gen",
  subtitle = "Our mission is to bring you the latest advancements and groundbreaking ideas that are shaping the world of tomorrow.",
  ctaLabel = "Read more",
  ctaHref = "/about",
  imageSrc,
  imageAlt = "Hero image",
  palette = "sunrise",
  preview = false,
}: BannerProps) {
  const isPreset = typeof palette === "string";
  const style: React.CSSProperties | undefined = !isPreset
    ? ({
        ["--brand" as any]: (palette as any).brand,
        ["--brand-2" as any]: (palette as any).brand2,
      } as React.CSSProperties)
    : undefined;

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const CTA = preview ? (
    <button type="button" className={cls.cta} onClick={onBlockClick}>
      {ctaLabel}
    </button>
  ) : (
    <Link href={(ctaHref || "/") as Route} className={cls.cta}>
      {ctaLabel}
    </Link>
  );

  return (
    <section className={cls.wrap} data-palette={isPreset ? palette : "custom"} style={style}>
      <div className={cls.inner}>
        {/* Left text */}
        <div className={cls.left}>
          {eyebrow ? (
            <div className={cls.eyebrow}>
              <span className={cls.eyebrowDot} />
              {eyebrow}
            </div>
          ) : null}

          <h1 className={cls.title}>
            {title} <span className={cls.highlight}>{highlight}</span>
          </h1>

          {subtitle ? <p className={cls.subtitle}>{subtitle}</p> : null}

          <div className={cls.actions}>{CTA}</div>
        </div>

        {/* Right image */}
        <div className={cls.right}>
          <div className={cls.imageFrame} onClick={onBlockClick}>
            {/* dùng fill nên cần parent position:relative trong css */}
            <Image src={imageSrc} alt={imageAlt} fill priority className={cls.image} />
            <div className={cls.glass} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== Helpers (giống HeaderPro) ============== */
function parsePalette(pal?: string): PalettePreset | PaletteCustom {
  if (!pal) return "sunrise";
  if (pal === "sunrise" || pal === "coral" || pal === "peach") return pal;
  try {
    const obj = JSON.parse(pal);
    if (obj?.brand && obj?.brand2) return obj as PaletteCustom;
  } catch {}
  return "sunrise";
}

/* ============== RegItem (để đưa vào REGISTRY) ============== */
export const BANNER_PRO: RegItem = {
  kind: "BannerPro",
  label: "Banner (Pro)",
  defaults: {
    palette: "sunrise", // hoặc JSON: {"brand":"#ff8a3d","brand2":"#ffb36b"}
    eyebrow: "Trusted by 2,000+ teams",
    title: "Embrace the Digital Transformation of",
    highlight: "Next-Gen",
    subtitle: "Our mission is to bring you the latest advancements and groundbreaking ideas that are shaping the world of tomorrow.",
    ctaLabel: "Read more",
    ctaHref: "/about",
    imageSrc: "/assets/images/office-hero.jpg",
    imageAlt: "Modern office",
  },
  inspector: [
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "title", label: "Title (left)", kind: "text" },
    { key: "highlight", label: "Highlight", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "textarea" },
    { key: "ctaLabel", label: "CTA Label", kind: "text" },
    { key: "ctaHref", label: "CTA Href", kind: "text" },
    { key: "imageSrc", label: "Image URL", kind: "text" },
    { key: "imageAlt", label: "Image Alt", kind: "text" },
    { key: "palette", label: "Palette", kind: "select", options: ["sunrise", "coral", "peach"] },
  ],
  render: (p) => {
    const palette = parsePalette(p.palette);

    return (
      <div className="border border-dashed rounded-3 p-3" aria-label="Banner (Pro)">
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 6px 20px rgba(2,6,23,.04)",
          }}>
          <BannerPro
            eyebrow={p.eyebrow}
            title={p.title}
            highlight={p.highlight}
            subtitle={p.subtitle}
            ctaLabel={p.ctaLabel}
            ctaHref={p.ctaHref}
            imageSrc={p.imageSrc}
            imageAlt={p.imageAlt}
            palette={palette}
            preview={true} // chặn điều hướng khi trong canvas
          />
        </div>

        <div className="text-muted small mt-2">
          <i className="bi bi-palette2" /> Palette:&nbsp;
          <code>{typeof palette === "string" ? palette : JSON.stringify(palette)}</code>
        </div>
      </div>
    );
  },
};

export default BannerPro;
