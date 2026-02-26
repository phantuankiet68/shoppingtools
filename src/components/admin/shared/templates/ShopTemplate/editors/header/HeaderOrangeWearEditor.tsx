// components/templates/ShopTemplate/editors/topbar/HeaderOrangeWearEditor.tsx
"use client";

import React from "react";
import type { HeaderOrangeWearProps } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderOrangeWear";

import Section from "../parts/Section";
import LabeledRow from "../parts/LabeledRow";
import TextInput from "../parts/TextInput";
import Checkbox from "../parts/Checkbox";

type EditorProps = {
  props: HeaderOrangeWearProps;
  updateActive: (patch: Partial<HeaderOrangeWearProps>) => void;
};

const HeaderOrangeWearEditor: React.FC<EditorProps> = ({ props, updateActive }) => {
  const p = props;

  return (
    <>
      {/* BRAND / LOGO */}
      <Section title="Logo / Thương hiệu">
        <LabeledRow label="Chữ trong ô vuông (ví dụ: OW)">
          <TextInput value={p.brandInitials ?? ""} onChange={(v) => updateActive({ brandInitials: v })} placeholder="OW" />
        </LabeledRow>

        <LabeledRow label="Tên thương hiệu">
          <TextInput value={p.brandName ?? ""} onChange={(v) => updateActive({ brandName: v })} placeholder="OrangeWear" />
        </LabeledRow>

        <LabeledRow label="Subtitle (mô tả dưới logo)">
          <TextInput value={p.brandSubtitle ?? ""} onChange={(v) => updateActive({ brandSubtitle: v })} placeholder="Thời trang xuống phố" />
        </LabeledRow>

        <LabeledRow label="Badge nhỏ (ví dụ: 2025 Edition)">
          <TextInput value={p.brandBadge ?? ""} onChange={(v) => updateActive({ brandBadge: v })} placeholder="2025 Edition" />
        </LabeledRow>
      </Section>

      {/* MENU & API */}
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

      {/* SEARCH */}
      <Section title="Search">
        <LabeledRow label="Placeholder ô tìm kiếm">
          <TextInput value={p.searchPlaceholder ?? ""} onChange={(v) => updateActive({ searchPlaceholder: v })} placeholder="Tìm: áo sơ mi trắng, váy công sở..." />
        </LabeledRow>
      </Section>

      {/* ACTIONS */}
      <Section title="Actions">
        <LabeledRow label="Nhãn nút Đăng nhập">
          <TextInput value={p.loginLabel ?? ""} onChange={(v) => updateActive({ loginLabel: v })} placeholder="Đăng nhập" />
        </LabeledRow>

        <LabeledRow label="Nhãn nút Giỏ hàng">
          <TextInput value={p.cartLabel ?? ""} onChange={(v) => updateActive({ cartLabel: v })} placeholder="Giỏ hàng" />
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
            placeholder="4"
          />
        </LabeledRow>
      </Section>

      {/* KHÁC */}
      <Section title="Khác">
        <LabeledRow label="Preview mode (chặn điều hướng / click demo)">
          <Checkbox checked={p.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default HeaderOrangeWearEditor;
