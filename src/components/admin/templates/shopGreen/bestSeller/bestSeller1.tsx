"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/bestSeller/bestSeller1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type BestSellerItem = {
  id: string;
  name: string;

  slug?: string;
  sku?: string;
  barcode?: string | null;

  imageSrc: string;
  imageAlt?: string;
  href?: string;

  price: string;
  cost?: string;
  stock?: number;
  isActive?: boolean;

  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BestSeller1Props = {
  title?: string;
  badgeText?: string;
  moreLabel?: string;
  moreHref?: string;

  /** allow override api for public/admin */
  apiUrl?: string;

  /** builder preview mode (only blocks navigation) */
  preview?: boolean;
};

/* ================= API Types ================= */
type ApiBestSellingResp = {
  categoryId: string;
  items: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    barcode: string | null;
    priceCents: number;
    costCents: number;
    stock: number;
    isActive: boolean;
    categoryId: string;
    category?: { id: string; name: string } | null;
    createdAt: string;
    updatedAt: string;
    images?: Array<{ id: string; url: string; isCover: boolean; sort: number }> | null;
  }>;
  total?: number;
  page?: number;
  pageSize?: number;
};

const DEFAULT_API_URL = "/api/admin/products/best-selling";

/* ================= Helpers ================= */
function formatVndFromCents(priceCents: unknown) {
  const n = Number(priceCents);
  if (!Number.isFinite(n)) return "0₫";

  // NOTE: bạn đang lưu cents => /100 ra VND
  // Nếu thực tế là VND trực tiếp thì đổi thành: const vnd = Math.trunc(n);
  const vnd = Math.max(0, Math.trunc(n / 100));
  return `${vnd.toLocaleString("vi-VN")}₫`;
}

function mapApiToItems(api: ApiBestSellingResp | null): BestSellerItem[] {
  if (!api?.items?.length) return [];

  return api.items.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    barcode: p.barcode,

    imageSrc: p.images?.[0]?.url || "/images/product.jpg",
    imageAlt: p.name,
    href: `/product/${p.slug}`,

    price: formatVndFromCents(p.priceCents),
    cost: formatVndFromCents(p.costCents),
    stock: p.stock,
    isActive: p.isActive,

    category: p.category?.name || undefined,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}

/* ================= Component ================= */
export function BestSeller1({
  title = "Best-Selling Products",
  badgeText = "Hot",
  moreLabel = "View More",
  moreHref = "/best-sellers",
  apiUrl,
  preview = false,
}: BestSeller1Props) {
  const [items, setItems] = useState<BestSellerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errText, setErrText] = useState<string>("");

  const endpoint = useMemo(() => (apiUrl && apiUrl.trim() ? apiUrl.trim() : DEFAULT_API_URL), [apiUrl]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setErrText("");
        setLoading(true);

        const params = new URLSearchParams();
        params.set("active", "active");
        params.set("sort", "newest");
        params.set("pageSize", "10");

        const url = `${endpoint}?${params.toString()}`;

        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          credentials: "include", // ✅ quan trọng để gửi cookie admin
        });

        // đọc text để debug (tránh res.json fail khi server trả HTML)
        const raw = await res.text();

        if (!res.ok) {
          // ✅ show error rõ ràng để biết 401/403/500
          console.error("[BestSeller1] API failed:", {
            url,
            status: res.status,
            body: raw,
          });
          if (mounted) setErrText(`API failed (${res.status}): ${raw.slice(0, 240)}`);
          return;
        }

        const data = JSON.parse(raw) as ApiBestSellingResp;

        const mapped = mapApiToItems(data);
        if (!mounted) return;

        setItems(mapped);
      } catch (e: any) {
        console.error("[BestSeller1] Fetch crashed:", e);
        if (mounted) setErrText(e?.message || "Fetch crashed");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [endpoint]);

  const block = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <section className={cls.bs} aria-label="Best Sellers">
      <div className={cls.bsHead}>
        <div className={cls.bsLeft}>
          <h2 className={cls.bsTitle}>{title}</h2>
          {!!badgeText && <span className={cls.bsBadge}>{badgeText}</span>}
        </div>

        {preview ? (
          <button className={cls.bsMore} type="button" onClick={block}>
            {moreLabel} <span className={cls.bsArrow}>→</span>
          </button>
        ) : (
          <Link className={cls.bsMore} href={moreHref as Route}>
            {moreLabel} <span className={cls.bsArrow}>→</span>
          </Link>
        )}
      </div>

      <div className={cls.bsBody}>
        <div className={cls.bsViewport}>
          {loading && items.length === 0 && <div className={cls.loading}>Loading…</div>}
          {!loading && errText && <div className={cls.loading}>Error: {errText}</div>}
          {!loading && !errText && items.length === 0 && <div className={cls.loading}>No products.</div>}

          <div className={cls.bsTrack}>
            {items.map((it) => {
              const CardInner = (
                <div className={cls.card}>
                  <div className={cls.imgbox}>
                    <Image
                      src={it.imageSrc}
                      alt={it.imageAlt || it.name}
                      fill
                      sizes="(max-width: 620px) 80vw, 420px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  <div className={cls.pInfo}>
                    <div className={cls.pTop}>
                      <h3 className={cls.pName} title={it.name}>
                        {it.name}
                      </h3>
                    </div>
                    <div className={cls.pPriceContent}>
                      <div className={cls.pPriceWrap}>
                        <span className={cls.pPrice}>{it.price}</span>
                      </div>
                      <div className={cls.pMeta}>
                        {!!it.category && <span className={cls.pCategory}>{it.category}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );

              return (
                <article className={cls.bsItem} key={it.id}>
                  {preview || !it.href ? (
                    <div className={cls.itemLink} role="group" aria-label={it.name} onClick={block}>
                      {CardInner}
                    </div>
                  ) : (
                    <Link className={cls.itemLink} href={it.href as Route}>
                      {CardInner}
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BestSeller1;

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_BEST_SELLER_GREEN_ONE: RegItem = {
  kind: "BestSeller1",
  label: "Best Seller",
  defaults: {
    title: "Best-Selling Products",
    badgeText: "Hot",
    moreLabel: "View More",
    moreHref: "/best-sellers", // ✅ đúng: đây là trang, không phải API
    apiUrl: "/api/admin/products/best-selling",
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "badgeText", label: "Badge", kind: "text" },
    { key: "moreLabel", label: "More label", kind: "text" },
    { key: "moreHref", label: "More href", kind: "text" },
    { key: "apiUrl", label: "API url", kind: "text" },
  ],
  render: (p) => {
    return (
      <div className="sectionContainer" aria-label="Shop Best Seller (Green One)">
        <BestSeller1
          title={String(p.title ?? "Best-Selling Products")}
          badgeText={String(p.badgeText ?? "Hot")}
          moreLabel={String(p.moreLabel ?? "View More")}
          moreHref={String(p.moreHref ?? "/best-sellers")}
          apiUrl={String(p.apiUrl ?? "/api/admin/products/best-selling")}
          preview={true}
        />
      </div>
    );
  },
};
