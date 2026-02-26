// components/templates/ShopTemplate/editors/topbar/HeaderAuroraPinkEditor.tsx
"use client";

import React from "react";
import type { HeaderAuroraPinkProps } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderAuroraPink";

import Section from "../parts/Section";
import LabeledRow from "../parts/LabeledRow";
import TextInput from "../parts/TextInput";
import Checkbox from "../parts/Checkbox";

type EditorProps = {
  props: HeaderAuroraPinkProps;
  updateActive: (patch: Partial<HeaderAuroraPinkProps>) => void;
};

const HeaderAuroraPinkEditor: React.FC<EditorProps> = ({ props, updateActive }) => {
  return (
    <>
      {/* ========== Logo ========== */}
      <Section title="Logo">
        <LabeledRow label="Icon class (Bootstrap Icons)">
          <TextInput value={props.logoIconClass ?? "bi bi-heart"} onChange={(v) => updateActive({ logoIconClass: v })} placeholder="bi bi-heart" />
        </LabeledRow>

        <LabeledRow label="Tiêu đề">
          <TextInput value={props.logoText ?? ""} onChange={(v) => updateActive({ logoText: v })} placeholder="Aurora Pink" />
        </LabeledRow>

        <LabeledRow label="Mô tả ngắn">
          <TextInput value={props.logoSubtitle ?? ""} onChange={(v) => updateActive({ logoSubtitle: v })} placeholder="Fashion & Lifestyle 2025" />
        </LabeledRow>

        <LabeledRow label="Link logo (href)">
          <TextInput value={props.logoHref ?? ""} onChange={(v) => updateActive({ logoHref: v })} placeholder="#" />
        </LabeledRow>
      </Section>

      {/* ========== Menu & API ========== */}
      <Section title="Menu &amp; API">
        <LabeledRow label="Tự động load menu từ API (autoLoadMenu)">
          <Checkbox checked={props.autoLoadMenu ?? false} onChange={(checked) => updateActive({ autoLoadMenu: checked })} />
        </LabeledRow>

        <LabeledRow label="Menu API URL (tùy chọn)">
          <TextInput value={props.menuApiUrl ?? ""} onChange={(v) => updateActive({ menuApiUrl: v })} placeholder="/api/menu-items?..." />
        </LabeledRow>

        <LabeledRow label="Locale">
          <TextInput value={props.locale ?? "en"} onChange={(v) => updateActive({ locale: v })} placeholder="vi" />
        </LabeledRow>

        <LabeledRow label="Set key">
          <TextInput value={props.setKey ?? "home"} onChange={(v) => updateActive({ setKey: v })} placeholder="home" />
        </LabeledRow>

        <LabeledRow label="Site ID (nếu có)">
          <TextInput value={props.siteId ?? ""} onChange={(v) => updateActive({ siteId: v })} placeholder="site id từ DB (optional)" />
        </LabeledRow>
      </Section>

      {/* ========== Thanh tìm kiếm ========== */}
      <Section title="Thanh tìm kiếm">
        <LabeledRow label="Placeholder search">
          <TextInput value={props.searchPlaceholder ?? ""} onChange={(v) => updateActive({ searchPlaceholder: v })} placeholder="Tìm váy, áo, phụ kiện pastel..." />
        </LabeledRow>

        <LabeledRow label="Hiển thị nút danh mục (category)">
          <Checkbox checked={props.showCategoryDropdown ?? true} onChange={(checked) => updateActive({ showCategoryDropdown: checked })} />
        </LabeledRow>

        <LabeledRow label="Label nút danh mục">
          <TextInput value={props.categoryLabel ?? ""} onChange={(v) => updateActive({ categoryLabel: v })} placeholder="Danh mục" />
        </LabeledRow>
      </Section>

      {/* ========== Actions bên phải ========== */}
      <Section title="Actions bên phải">
        <LabeledRow label="Hiển thị icon Yêu thích">
          <Checkbox checked={props.showWishlist ?? true} onChange={(checked) => updateActive({ showWishlist: checked })} />
        </LabeledRow>

        <LabeledRow label="Hiển thị icon Giỏ hàng">
          <Checkbox checked={props.showCart ?? true} onChange={(checked) => updateActive({ showCart: checked })} />
        </LabeledRow>

        <LabeledRow label="Số lượng trong giỏ (cartCount)">
          <TextInput
            value={String(props.cartCount ?? 3)}
            onChange={(v) => {
              const num = parseInt(v, 10);
              updateActive({
                cartCount: Number.isNaN(num) ? undefined : num,
              });
            }}
            placeholder="3"
          />
        </LabeledRow>

        <LabeledRow label="Hiển thị nút Đăng nhập">
          <Checkbox checked={props.showAuth ?? true} onChange={(checked) => updateActive({ showAuth: checked })} />
        </LabeledRow>

        <LabeledRow label="Text nút Đăng nhập">
          <TextInput value={props.authLabel ?? ""} onChange={(v) => updateActive({ authLabel: v })} placeholder="Đăng nhập" />
        </LabeledRow>
      </Section>

      {/* ========== Khác ========== */}
      <Section title="Khác">
        <LabeledRow label="Preview mode (chặn click)">
          <Checkbox checked={props.isPreviewMode ?? false} onChange={(checked) => updateActive({ isPreviewMode: checked })} />
        </LabeledRow>

        <LabeledRow label="Block key khi click trong preview">
          <TextInput value={props.onPreviewBlockClickKey ?? "header-aurora-pink"} onChange={(v) => updateActive({ onPreviewBlockClickKey: v })} placeholder="header-aurora-pink" />
        </LabeledRow>
      </Section>
    </>
  );
};

export default HeaderAuroraPinkEditor;
