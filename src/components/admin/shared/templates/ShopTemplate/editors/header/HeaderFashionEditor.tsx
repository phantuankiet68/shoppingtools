"use client";

import React from "react";
import type { HeaderFashionProps } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderFashion";
import Section from "../parts/Section";
import LabeledRow from "../parts/LabeledRow";
import TextInput from "../parts/TextInput";
import Checkbox from "../parts/Checkbox";

type EditorProps = {
  props: HeaderFashionProps;
  updateActive: (patch: Partial<HeaderFashionProps>) => void;
};

const HeaderFashionEditor: React.FC<EditorProps> = ({ props, updateActive }) => {
  // helpers chuyển array <-> string
  const categoryString = props.searchCategoryOptions && props.searchCategoryOptions.length ? props.searchCategoryOptions.join(", ") : "";

  const onCategoryChange = (v: string) => {
    const arr = v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateActive({ searchCategoryOptions: arr });
  };

  const toInt = (v: string, fallback = 0) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? fallback : n;
  };

  return (
    <>
      {/* Thương hiệu & logo */}
      <Section title="Thương hiệu & logo">
        <LabeledRow label="Tên brand">
          <TextInput value={props.brandName ?? ""} onChange={(v) => updateActive({ brandName: v })} placeholder="Aurora Wear / Header Fashion..." />
        </LabeledRow>

        <LabeledRow label="Tagline">
          <TextInput value={props.brandTagline ?? ""} onChange={(v) => updateActive({ brandTagline: v })} placeholder="Mix & 2026, slogan..." />
        </LabeledRow>

        <LabeledRow label="Icon class (Bootstrap Icons)">
          <TextInput value={props.logoIconClass ?? ""} onChange={(v) => updateActive({ logoIconClass: v })} placeholder="bi bi-stars" />
        </LabeledRow>

        <LabeledRow label="Label tài khoản">
          <TextInput value={props.accountLabel ?? ""} onChange={(v) => updateActive({ accountLabel: v })} placeholder="Tài khoản / Đăng nhập..." />
        </LabeledRow>
      </Section>

      {/* Tìm kiếm */}
      <Section title="Thanh tìm kiếm">
        <LabeledRow label="Placeholder">
          <TextInput value={props.searchPlaceholder ?? ""} onChange={(v) => updateActive({ searchPlaceholder: v })} placeholder="Tìm áo, quần, váy, outfit..." />
        </LabeledRow>

        <LabeledRow label="Hint nhỏ bên phải">
          <TextInput value={props.searchHint ?? ""} onChange={(v) => updateActive({ searchHint: v })} placeholder="Enter để gợi ý outfit" />
        </LabeledRow>

        <LabeledRow label="Thông báo khi không nhập gì">
          <TextInput value={props.searchEmptyMessage ?? ""} onChange={(v) => updateActive({ searchEmptyMessage: v })} placeholder="Hãy nhập sản phẩm hoặc outfit..." />
        </LabeledRow>

        <LabeledRow label="Prefix thông báo khi tìm kiếm">
          <TextInput value={props.searchAlertPrefix ?? ""} onChange={(v) => updateActive({ searchAlertPrefix: v })} placeholder='Aurora Wear đang gợi ý outfit cho: "..."' />
        </LabeledRow>

        <LabeledRow label="Danh mục tìm kiếm (ngăn cách bởi dấu phẩy)">
          <TextInput value={categoryString} onChange={onCategoryChange} placeholder="Tất cả danh mục, Nữ, Nam, Unisex..." />
        </LabeledRow>
      </Section>

      {/* Badge & mode */}
      <Section title="Badge & chế độ hiển thị">
        <LabeledRow label="Hiện nút Yêu thích">
          <Checkbox checked={props.showFavorites ?? false} onChange={(checked) => updateActive({ showFavorites: checked })} />
        </LabeledRow>

        <LabeledRow label="Số lượng Yêu thích">
          <TextInput
            value={typeof props.favoritesCount === "number" ? String(props.favoritesCount) : ""}
            onChange={(v) => updateActive({ favoritesCount: toInt(v, props.favoritesCount ?? 0) })}
            placeholder="12"
          />
        </LabeledRow>

        <LabeledRow label="Hiện nút Giỏ hàng">
          <Checkbox checked={props.showCart ?? false} onChange={(checked) => updateActive({ showCart: checked })} />
        </LabeledRow>

        <LabeledRow label="Số lượng Giỏ hàng">
          <TextInput value={typeof props.cartCount === "number" ? String(props.cartCount) : ""} onChange={(v) => updateActive({ cartCount: toInt(v, props.cartCount ?? 0) })} placeholder="3" />
        </LabeledRow>

        <LabeledRow label='Mode mặc định ("light" hoặc "night")'>
          <TextInput
            value={props.modeInitial ?? ""}
            onChange={(v) =>
              updateActive({
                modeInitial: (v === "night" ? "night" : "light") as "light" | "night",
              })
            }
            placeholder="light hoặc night"
          />
        </LabeledRow>
      </Section>

      {/* Nav / menu */}
      <Section title="Nav / menu tự động">
        <LabeledRow label="Tự load menu từ API (autoLoadMenu)">
          <Checkbox checked={props.autoLoadMenu ?? false} onChange={(checked) => updateActive({ autoLoadMenu: checked })} />
        </LabeledRow>

        <LabeledRow label="Locale">
          <TextInput value={props.locale ?? ""} onChange={(v) => updateActive({ locale: v })} placeholder="vi" />
        </LabeledRow>

        <LabeledRow label="Set key (menu set)">
          <TextInput value={props.setKey ?? ""} onChange={(v) => updateActive({ setKey: v })} placeholder="home, main-nav..." />
        </LabeledRow>

        <LabeledRow label="Site ID (optional)">
          <TextInput value={props.siteId ?? ""} onChange={(v) => updateActive({ siteId: v })} placeholder="site id nếu dùng multi-site..." />
        </LabeledRow>

        <LabeledRow label="ID nav chính (primaryNavId)">
          <TextInput value={props.primaryNavId ?? ""} onChange={(v) => updateActive({ primaryNavId: v })} placeholder="id item để tô màu primary..." />
        </LabeledRow>
      </Section>

      {/* Mobile & popup search */}
      <Section title="Mobile & popup search">
        <LabeledRow label="Tiêu đề menu mobile">
          <TextInput value={props.mobileMenuTitle ?? ""} onChange={(v) => updateActive({ mobileMenuTitle: v })} placeholder="Danh mục" />
        </LabeledRow>

        <LabeledRow label="Bottom nav: Trang chủ">
          <TextInput value={props.bottomNavHomeLabel ?? ""} onChange={(v) => updateActive({ bottomNavHomeLabel: v })} placeholder="Trang chủ" />
        </LabeledRow>

        <LabeledRow label="Bottom nav: Danh mục">
          <TextInput value={props.bottomNavCategoryLabel ?? ""} onChange={(v) => updateActive({ bottomNavCategoryLabel: v })} placeholder="Danh mục" />
        </LabeledRow>

        <LabeledRow label="Bottom nav: Yêu thích">
          <TextInput value={props.bottomNavWishlistLabel ?? ""} onChange={(v) => updateActive({ bottomNavWishlistLabel: v })} placeholder="Yêu thích" />
        </LabeledRow>

        <LabeledRow label="Bottom nav: Tài khoản">
          <TextInput value={props.bottomNavAccountLabel ?? ""} onChange={(v) => updateActive({ bottomNavAccountLabel: v })} placeholder="Tài khoản" />
        </LabeledRow>

        <LabeledRow label="Popup search placeholder (mobile)">
          <TextInput value={props.popupSearchPlaceholder ?? ""} onChange={(v) => updateActive({ popupSearchPlaceholder: v })} placeholder="Tìm áo, quần, váy, outfit..." />
        </LabeledRow>
      </Section>

      {/* Khác */}
      <Section title="Khác">
        <LabeledRow label="Preview mode (chặn click / điều hướng)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default HeaderFashionEditor;
