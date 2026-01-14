// components/templates/ShopTemplate/editors/topbar/HeaderGreenEditor.tsx
"use client";

import React from "react";
import type { HeaderGreenProps } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderGreen";

import Section from "../parts/Section";
import LabeledRow from "../parts/LabeledRow";
import TextInput from "../parts/TextInput";
import Checkbox from "../parts/Checkbox";

type EditorProps = {
  props: HeaderGreenProps;
  updateActive: (patch: Partial<HeaderGreenProps>) => void;
};

const HeaderGreenEditor: React.FC<EditorProps> = ({ props, updateActive }) => {
  const p = props;

  const popupSuggestionsStr = (p.popupSuggestions ?? []).join(", ");

  return (
    <>
      {/* Topbar */}
      <Section title="Topbar">
        <LabeledRow label="Thông điệp bên trái">
          <TextInput value={p.topbarMessage ?? ""} onChange={(v) => updateActive({ topbarMessage: v })} placeholder="Miễn phí vận chuyển đơn từ 199K" />
        </LabeledRow>

        <LabeledRow label="Link bên phải">
          <TextInput value={p.topbarLinkText ?? ""} onChange={(v) => updateActive({ topbarLinkText: v })} placeholder="Theo dõi đơn hàng" />
        </LabeledRow>
      </Section>

      {/* Brand / Logo */}
      <Section title="Logo / Thương hiệu">
        <LabeledRow label="Icon class (Bootstrap Icons)">
          <TextInput value={p.brandIconClass ?? ""} onChange={(v) => updateActive({ brandIconClass: v })} placeholder="bi bi-flower2" />
        </LabeledRow>

        <LabeledRow label="Tên thương hiệu">
          <TextInput value={p.brandTitle ?? ""} onChange={(v) => updateActive({ brandTitle: v })} placeholder="Aurora Green" />
        </LabeledRow>

        <LabeledRow label="Subtitle (dòng mô tả)">
          <TextInput value={p.brandSubtitle ?? ""} onChange={(v) => updateActive({ brandSubtitle: v })} placeholder="Thời trang dành cho" />
        </LabeledRow>

        <LabeledRow label="Highlight (chữ màu xanh)">
          <TextInput value={p.brandHighlight ?? ""} onChange={(v) => updateActive({ brandHighlight: v })} placeholder="người sống xanh" />
        </LabeledRow>
      </Section>

      {/* Search */}
      <Section title="Search">
        <LabeledRow label="Placeholder ô tìm kiếm (desktop)">
          <TextInput value={p.searchPlaceholder ?? ""} onChange={(v) => updateActive({ searchPlaceholder: v })} placeholder="Tìm: áo thun, áo croptop, chân váy..." />
        </LabeledRow>

        <LabeledRow label="Tagline trước hashtag">
          <TextInput value={p.searchTaglinePrefix ?? ""} onChange={(v) => updateActive({ searchTaglinePrefix: v })} placeholder="Gợi ý:" />
        </LabeledRow>

        <LabeledRow label="Hashtag gợi ý (ví dụ: #OOTD)">
          <TextInput value={p.searchTaglineTag ?? ""} onChange={(v) => updateActive({ searchTaglineTag: v })} placeholder="#OOTD" />
        </LabeledRow>
      </Section>

      {/* Menu & API */}
      <Section title="Menu &amp; API">
        <LabeledRow label="Tự động load menu (API /api/menu-items)">
          <Checkbox checked={p.autoLoadMenu ?? true} onChange={(checked) => updateActive({ autoLoadMenu: checked })} />
        </LabeledRow>

        <LabeledRow label="Locale">
          <TextInput value={p.locale ?? ""} onChange={(v) => updateActive({ locale: v })} placeholder="vi" />
        </LabeledRow>

        <LabeledRow label="Site ID">
          <TextInput value={p.siteId ?? ""} onChange={(v) => updateActive({ siteId: v })} placeholder="(tùy chọn)" />
        </LabeledRow>

        <LabeledRow label="Set key (bộ menu)">
          <TextInput value={p.setKey ?? ""} onChange={(v) => updateActive({ setKey: v })} placeholder="home" />
        </LabeledRow>
      </Section>

      {/* Actions */}
      <Section title="Actions / Nút bên phải">
        <LabeledRow label="Hiện icon Yêu thích (desktop)">
          <Checkbox checked={p.showWishlist ?? true} onChange={(checked) => updateActive({ showWishlist: checked })} />
        </LabeledRow>

        <LabeledRow label="Hiện icon Tài khoản (desktop)">
          <Checkbox checked={p.showAccount ?? true} onChange={(checked) => updateActive({ showAccount: checked })} />
        </LabeledRow>

        <LabeledRow label="Hiện nút Giỏ hàng">
          <Checkbox checked={p.showCart ?? true} onChange={(checked) => updateActive({ showCart: checked })} />
        </LabeledRow>

        <LabeledRow label="Số lượng trong giỏ (cartCount)">
          <TextInput
            value={typeof p.cartCount === "number" ? String(p.cartCount) : ""}
            onChange={(v) => {
              const num = parseInt(v, 10);
              updateActive({
                cartCount: Number.isNaN(num) ? undefined : num,
              });
            }}
            placeholder="3"
          />
        </LabeledRow>
      </Section>

      {/* Search popup suggestions */}
      <Section title="Suggest tìm kiếm (popup mobile)">
        <LabeledRow label="Danh sách gợi ý (ngăn cách bởi dấu phẩy)">
          <TextInput
            value={popupSuggestionsStr}
            onChange={(v) =>
              updateActive({
                popupSuggestions: v
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Áo thun basic, Áo croptop nữ, Váy midi xếp ly..."
          />
        </LabeledRow>
      </Section>

      {/* Khác */}
      <Section title="Khác">
        <LabeledRow label="Preview mode (chặn alert / điều hướng demo)">
          <Checkbox checked={p.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default HeaderGreenEditor;
