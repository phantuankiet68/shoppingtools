// components/templates/ShopTemplate/editors/topbar/HeaderBlueEditor.tsx
"use client";

import React from "react";
import type { HeaderBlueProps as HeaderBlueProps } from "@/components/admin/shared/templates/ShopTemplate/Ui/header/HeaderBlue";

import Section from "../parts/Section";
import LabeledRow from "../parts/LabeledRow";
import TextInput from "../parts/TextInput";
import Checkbox from "../parts/Checkbox";

type EditorProps = {
  props: HeaderBlueProps;
  updateActive: (patch: Partial<HeaderBlueProps>) => void;
};

const HeaderBlueEditor: React.FC<EditorProps> = ({ props, updateActive }) => {
  const chipsToString = (arr?: string[]) => (arr && arr.length ? arr.join(", ") : "");
  const stringToChips = (v: string): string[] =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  return (
    <>
      {/* Logo & thương hiệu */}
      <Section title="Logo &amp; Thương hiệu">
        <LabeledRow label="Logo text (chữ trong vòng tròn)">
          <TextInput value={props.logoText ?? ""} onChange={(v) => updateActive({ logoText: v })} placeholder="AW" />
        </LabeledRow>

        <LabeledRow label="Tên thương hiệu">
          <TextInput
            value={props.brandName ?? ""}
            onChange={(v) => updateActive({ brandName: v })}
            placeholder="AURORA WARDROBE"
          />
        </LabeledRow>

        <LabeledRow label="Prefix vị trí">
          <TextInput
            value={props.brandLocationPrefix ?? ""}
            onChange={(v) => updateActive({ brandLocationPrefix: v })}
            placeholder="Cửa hàng online"
          />
        </LabeledRow>

        <LabeledRow label="Text vị trí">
          <TextInput
            value={props.brandLocationText ?? ""}
            onChange={(v) => updateActive({ brandLocationText: v })}
            placeholder="VN"
          />
        </LabeledRow>
      </Section>

      {/* Thanh tìm kiếm */}
      <Section title="Thanh tìm kiếm">
        <LabeledRow label="Placeholder">
          <TextInput
            value={props.searchPlaceholder ?? ""}
            onChange={(v) => updateActive({ searchPlaceholder: v })}
            placeholder="Tìm áo, quần, váy, giày hoặc bộ sưu tập..."
          />
        </LabeledRow>

        <LabeledRow label="Tiêu đề gợi ý nhanh">
          <TextInput
            value={props.searchQuickTitle ?? ""}
            onChange={(v) => updateActive({ searchQuickTitle: v })}
            placeholder="Gợi ý nhanh hôm nay"
          />
        </LabeledRow>

        <LabeledRow label="Gợi ý nhanh (ngăn cách bởi dấu phẩy)">
          <TextInput
            value={chipsToString(props.searchQuickChips)}
            onChange={(v) => updateActive({ searchQuickChips: stringToChips(v) })}
            placeholder="Flash Sale áo khoác xanh, Bộ sưu tập NEW ARRIVAL, ..."
          />
        </LabeledRow>

        <LabeledRow label="Danh mục cho nút 'Tất cả danh mục' (ngăn cách bởi dấu phẩy)">
          <TextInput
            value={chipsToString(props.searchCategoryOptions)}
            onChange={(v) => updateActive({ searchCategoryOptions: stringToChips(v) })}
            placeholder="Tất cả danh mục, Thời trang nữ, Thời trang nam, Giày & phụ kiện, Bộ sưu tập mới"
          />
        </LabeledRow>
      </Section>

      {/* Actions bên phải */}
      <Section title="Actions bên phải">
        <LabeledRow label="Label Trung tâm đơn hàng">
          <TextInput
            value={props.orderCenterLabel ?? ""}
            onChange={(v) => updateActive({ orderCenterLabel: v })}
            placeholder="Trung tâm đơn hàng"
          />
        </LabeledRow>

        <LabeledRow label="Label tài khoản">
          <TextInput
            value={props.accountLabel ?? ""}
            onChange={(v) => updateActive({ accountLabel: v })}
            placeholder="Tài khoản"
          />
        </LabeledRow>

        <LabeledRow label="Label hỗ trợ">
          <TextInput
            value={props.supportLabel ?? ""}
            onChange={(v) => updateActive({ supportLabel: v })}
            placeholder="Hỗ trợ"
          />
        </LabeledRow>

        <LabeledRow label="Label giỏ hàng">
          <TextInput
            value={props.cartLabel ?? ""}
            onChange={(v) => updateActive({ cartLabel: v })}
            placeholder="Giỏ hàng"
          />
        </LabeledRow>

        <LabeledRow label="Số lượng trong giỏ (cartInitialCount)">
          <TextInput
            value={String(props.cartInitialCount ?? 2)}
            onChange={(v) => {
              const num = parseInt(v, 10);
              updateActive({
                cartInitialCount: Number.isNaN(num) ? undefined : num,
              });
            }}
            placeholder="2"
          />
        </LabeledRow>
      </Section>

      {/* Bottom nav (mobile) */}
      <Section title="Bottom navigation (Mobile)">
        <LabeledRow label="Trang chủ">
          <TextInput
            value={props.bottomNavHomeLabel ?? ""}
            onChange={(v) => updateActive({ bottomNavHomeLabel: v })}
            placeholder="Trang chủ"
          />
        </LabeledRow>

        <LabeledRow label="Danh mục">
          <TextInput
            value={props.bottomNavCategoryLabel ?? ""}
            onChange={(v) => updateActive({ bottomNavCategoryLabel: v })}
            placeholder="Danh mục"
          />
        </LabeledRow>

        <LabeledRow label="Mix đồ">
          <TextInput
            value={props.bottomNavStyleLabel ?? ""}
            onChange={(v) => updateActive({ bottomNavStyleLabel: v })}
            placeholder="Mix đồ"
          />
        </LabeledRow>

        <LabeledRow label="Giỏ hàng">
          <TextInput
            value={props.bottomNavCartLabel ?? ""}
            onChange={(v) => updateActive({ bottomNavCartLabel: v })}
            placeholder="Giỏ hàng"
          />
        </LabeledRow>

        <LabeledRow label="Tài khoản">
          <TextInput
            value={props.bottomNavAccountLabel ?? ""}
            onChange={(v) => updateActive({ bottomNavAccountLabel: v })}
            placeholder="Tài khoản"
          />
        </LabeledRow>
      </Section>

      {/* Menu / dữ liệu API */}
      <Section title="Menu động (API)">
        <LabeledRow label="Tự động load menu từ API">
          <Checkbox
            checked={props.autoLoadMenu ?? true}
            onChange={(checked) => updateActive({ autoLoadMenu: checked })}
          />
        </LabeledRow>

        <LabeledRow label="Locale">
          <TextInput value={props.locale ?? ""} onChange={(v) => updateActive({ locale: v })} placeholder="vi" />
        </LabeledRow>

        <LabeledRow label="Site ID (tùy chọn)">
          <TextInput
            value={props.siteId ?? ""}
            onChange={(v) => updateActive({ siteId: v || undefined })}
            placeholder="(để trống nếu không dùng)"
          />
        </LabeledRow>

        <LabeledRow label="Set key menu (setKey)">
          <TextInput value={props.setKey ?? ""} onChange={(v) => updateActive({ setKey: v })} placeholder="home" />
        </LabeledRow>
      </Section>

      {/* Khác */}
      <Section title="Khác">
        <LabeledRow label="Preview mode (chặn click)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default HeaderBlueEditor;
