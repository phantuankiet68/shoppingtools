// components/templates/ShopTemplate/editors/topbar/HeaderProEditor.tsx
"use client";

import React from "react";
import type { HeaderProProps } from "@/components/admin/shared/templates/ShopTemplate/Ui/header/HeaderPro";

import Section from "../parts/Section";
import LabeledRow from "../parts/LabeledRow";
import TextInput from "../parts/TextInput";
import Checkbox from "../parts/Checkbox";

type EditorProps = {
  props: HeaderProProps;
  updateActive: (patch: Partial<HeaderProProps>) => void;
};

const HeaderProEditor: React.FC<EditorProps> = ({ props, updateActive }) => {
  return (
    <>
      <Section title="Logo">
        <LabeledRow label="Icon class (Bootstrap Icons)">
          <TextInput
            value={props.logoIconClass ?? "bi bi-bag-heart"}
            onChange={(v) => updateActive({ logoIconClass: v })}
            placeholder="bi bi-bag-heart"
          />
        </LabeledRow>
        <LabeledRow label="Tiêu đề">
          <TextInput
            value={props.logoTitle ?? ""}
            onChange={(v) => updateActive({ logoTitle: v })}
            placeholder="StyleMall"
          />
        </LabeledRow>
        <LabeledRow label="Mô tả ngắn">
          <TextInput
            value={props.logoSubtitle ?? ""}
            onChange={(v) => updateActive({ logoSubtitle: v })}
            placeholder="Thời trang mỗi ngày"
          />
        </LabeledRow>
      </Section>

      <Section title="Thanh tìm kiếm">
        <LabeledRow label="Hiển thị search">
          <Checkbox checked={props.showSearch ?? true} onChange={(checked) => updateActive({ showSearch: checked })} />
        </LabeledRow>
        <LabeledRow label="Placeholder">
          <TextInput
            value={props.searchPlaceholder ?? ""}
            onChange={(v) => updateActive({ searchPlaceholder: v })}
            placeholder="Tìm áo thun, đầm, quần jean, phụ kiện..."
          />
        </LabeledRow>
      </Section>

      <Section title="Actions bên phải">
        <LabeledRow label="Label tài khoản">
          <TextInput
            value={props.accountLabel ?? ""}
            onChange={(v) => updateActive({ accountLabel: v })}
            placeholder="Tài khoản"
          />
        </LabeledRow>
        <LabeledRow label="Sub tài khoản">
          <TextInput
            value={props.accountSubLabel ?? ""}
            onChange={(v) => updateActive({ accountSubLabel: v })}
            placeholder="Đăng nhập / Đăng ký"
          />
        </LabeledRow>
        <LabeledRow label="Label đơn hàng">
          <TextInput
            value={props.orderLabel ?? ""}
            onChange={(v) => updateActive({ orderLabel: v })}
            placeholder="Đơn hàng"
          />
        </LabeledRow>
        <LabeledRow label="Sub đơn hàng">
          <TextInput
            value={props.orderSubLabel ?? ""}
            onChange={(v) => updateActive({ orderSubLabel: v })}
            placeholder="Theo dõi trạng thái"
          />
        </LabeledRow>
        <LabeledRow label="Số lượng trong giỏ (cartCount)">
          <TextInput
            value={String(props.cartCount ?? 3)}
            onChange={(v) => {
              const num = parseInt(v, 10);
              updateActive({ cartCount: Number.isNaN(num) ? undefined : num });
            }}
            placeholder="3"
          />
        </LabeledRow>
      </Section>

      {/* Promo bên phải menu */}
      <Section title="Khuyến mãi bên phải menu">
        <LabeledRow label="Hiển thị khối promo">
          <Checkbox
            checked={props.showNavPromo ?? true}
            onChange={(checked) => updateActive({ showNavPromo: checked })}
          />
        </LabeledRow>

        <LabeledRow label="Badge nhỏ (ví dụ: Free)">
          <TextInput
            value={props.navPromoBadge ?? ""}
            onChange={(v) => updateActive({ navPromoBadge: v })}
            placeholder="Free / New / Hot"
          />
        </LabeledRow>

        <LabeledRow label="Dòng chính">
          <TextInput
            value={props.navPromoLabel ?? ""}
            onChange={(v) => updateActive({ navPromoLabel: v })}
            placeholder="Miễn phí giao hàng"
          />
        </LabeledRow>

        <LabeledRow label="Dòng phụ">
          <TextInput
            value={props.navPromoSubLabel ?? ""}
            onChange={(v) => updateActive({ navPromoSubLabel: v })}
            placeholder="Đơn từ 399k toàn quốc"
          />
        </LabeledRow>
      </Section>

      <Section title="Khác">
        <LabeledRow label="Preview mode (chặn click)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default HeaderProEditor;
