// components/templates/ShopTemplate/editors/topbar/HeaderAuroraOrangeNeo2025Editor.tsx
"use client";

import React from "react";
import type { HeaderAuroraOrangeNeo2025Props } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderAuroraOrangeNeo2025";
import Section from "../parts/Section";
import LabeledRow from "../parts/LabeledRow";
import TextInput from "../parts/TextInput";
import Checkbox from "../parts/Checkbox";

type EditorProps = {
  props: HeaderAuroraOrangeNeo2025Props;
  updateActive: (patch: Partial<HeaderAuroraOrangeNeo2025Props>) => void;
};

const HeaderAuroraOrangeNeo2025Editor: React.FC<EditorProps> = ({ props, updateActive }) => {
  const chipsString = props.highlightChips && props.highlightChips.length > 0 ? props.highlightChips.join(", ") : "";

  return (
    <>
      {/* Logo */}
      <Section title="Logo">
        <LabeledRow label="Logo text">
          <TextInput value={props.logoText ?? ""} onChange={(v) => updateActive({ logoText: v })} />
        </LabeledRow>
        <LabeledRow label="Logo subtitle">
          <TextInput value={props.logoSubtitle ?? ""} onChange={(v) => updateActive({ logoSubtitle: v })} />
        </LabeledRow>
        <LabeledRow label="Logo href">
          <TextInput value={props.logoHref ?? ""} onChange={(v) => updateActive({ logoHref: v })} />
        </LabeledRow>
        <LabeledRow label="Logo icon (Bootstrap icon class)">
          <TextInput value={props.logoIconClass ?? ""} onChange={(v) => updateActive({ logoIconClass: v })} />
        </LabeledRow>
      </Section>

      {/* Menu & API */}
      <Section title="Menu & API">
        <LabeledRow label="Tự động load menu">
          <Checkbox checked={props.autoLoadMenu ?? false} onChange={(checked) => updateActive({ autoLoadMenu: checked })} />
        </LabeledRow>
        <LabeledRow label="Menu API URL (ưu tiên nếu có)">
          <TextInput value={props.menuApiUrl ?? ""} onChange={(v) => updateActive({ menuApiUrl: v })} />
        </LabeledRow>
        <LabeledRow label="Locale">
          <TextInput value={props.locale ?? ""} onChange={(v) => updateActive({ locale: v })} />
        </LabeledRow>
        <LabeledRow label="Site ID">
          <TextInput value={props.siteId ?? ""} onChange={(v) => updateActive({ siteId: v })} />
        </LabeledRow>
        <LabeledRow label="Menu set key">
          <TextInput value={props.setKey ?? ""} onChange={(v) => updateActive({ setKey: v })} />
        </LabeledRow>
      </Section>

      {/* Search */}
      <Section title="Search">
        <LabeledRow label="Placeholder ô tìm kiếm">
          <TextInput value={props.searchPlaceholder ?? ""} onChange={(v) => updateActive({ searchPlaceholder: v })} />
        </LabeledRow>
        <LabeledRow label="Hiện nút chọn Danh mục">
          <Checkbox checked={props.showCategoryDropdown ?? false} onChange={(checked) => updateActive({ showCategoryDropdown: checked })} />
        </LabeledRow>
        <LabeledRow label="Label nút Danh mục">
          <TextInput value={props.categoryLabel ?? ""} onChange={(v) => updateActive({ categoryLabel: v })} />
        </LabeledRow>
        <LabeledRow label="Hiện nút bộ lọc (sliders)">
          <Checkbox checked={props.showFilterButton ?? false} onChange={(checked) => updateActive({ showFilterButton: checked })} />
        </LabeledRow>
        <LabeledRow label="Từ khóa gợi ý (chips, cách nhau bởi dấu phẩy)">
          <TextInput
            value={chipsString}
            onChange={(v) =>
              updateActive({
                highlightChips: v
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </LabeledRow>
      </Section>

      {/* Actions */}
      <Section title="Actions">
        <LabeledRow label="Hiện nút Yêu thích">
          <Checkbox checked={props.showWishlist ?? false} onChange={(checked) => updateActive({ showWishlist: checked })} />
        </LabeledRow>
        <LabeledRow label="Hiện nút Giỏ hàng">
          <Checkbox checked={props.showCart ?? false} onChange={(checked) => updateActive({ showCart: checked })} />
        </LabeledRow>
        <LabeledRow label="Số lượng trong giỏ">
          <TextInput
            type="number"
            value={props.cartCount !== undefined ? String(props.cartCount) : ""}
            onChange={(v) =>
              updateActive({
                cartCount: v === "" ? undefined : Number(v),
              })
            }
          />
        </LabeledRow>
        <LabeledRow label="Hiện nút Đăng nhập">
          <Checkbox checked={props.showAuth ?? false} onChange={(checked) => updateActive({ showAuth: checked })} />
        </LabeledRow>
        <LabeledRow label="Label nút Đăng nhập">
          <TextInput value={props.authLabel ?? ""} onChange={(v) => updateActive({ authLabel: v })} />
        </LabeledRow>
        <LabeledRow label="Hiện pill voucher">
          <Checkbox checked={props.showVoucherPill ?? false} onChange={(checked) => updateActive({ showVoucherPill: checked })} />
        </LabeledRow>
        <LabeledRow label="Text pill voucher">
          <TextInput value={props.voucherLabel ?? ""} onChange={(v) => updateActive({ voucherLabel: v })} />
        </LabeledRow>
        <LabeledRow label="Hiện badge nav (Mã giảm giá mới hôm nay)">
          <Checkbox checked={props.showNavBadge ?? false} onChange={(checked) => updateActive({ showNavBadge: checked })} />
        </LabeledRow>
        <LabeledRow label="Text badge nav">
          <TextInput value={props.navBadgeText ?? ""} onChange={(v) => updateActive({ navBadgeText: v })} />
        </LabeledRow>
      </Section>

      {/* Khác */}
      <Section title="Khác">
        <LabeledRow label="Preview mode">
          <Checkbox checked={props.isPreviewMode ?? false} onChange={(checked) => updateActive({ isPreviewMode: checked })} />
        </LabeledRow>
        <LabeledRow label="Preview block key">
          <TextInput value={props.onPreviewBlockClickKey ?? ""} onChange={(v) => updateActive({ onPreviewBlockClickKey: v })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default HeaderAuroraOrangeNeo2025Editor;
