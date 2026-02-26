// components/templates/ShopTemplate/editors/topbar/HeaderAuroraEditor.tsx
"use client";

import React from "react";
import type { HeaderAuroraProps } from "@/components/admin/templates/ShopTemplate/Ui/header/HeaderAurora";

import Section from "../parts/Section";
import LabeledRow from "../parts/LabeledRow";
import TextInput from "../parts/TextInput";
import Checkbox from "../parts/Checkbox";
import TextArea from "../parts/TextArea";

type EditorProps = {
  props: HeaderAuroraProps;
  updateActive: (patch: Partial<HeaderAuroraProps>) => void;
};

const HeaderAuroraEditor: React.FC<EditorProps> = ({ props, updateActive }) => {
  /** ===== Helpers cho textarea list ===== */
  const hintsText = (props.searchHints ?? []).join("\n");
  const suggestsText = (props.searchSuggests ?? []).join("\n");

  const tickerItemsText = (props.tickerItems ?? []).map((item) => `${item.tag}|${item.content}`).join("\n");

  const bottomNavItemsText = (props.bottomNavItems ?? []).map((item) => `${item.id}|${item.iconClass}|${item.label}`).join("\n");

  return (
    <>
      {/* BRAND */}
      <Section title="Brand">
        <LabeledRow label="Tên thương hiệu">
          <TextInput value={props.brandName ?? ""} onChange={(v) => updateActive({ brandName: v })} placeholder="Aurora Wear" />
        </LabeledRow>
        <LabeledRow label="Chip nhỏ dưới brand">
          <TextInput value={props.brandChip ?? ""} onChange={(v) => updateActive({ brandChip: v })} placeholder="Fashion Studio" />
        </LabeledRow>
      </Section>

      {/* SEARCH */}
      <Section title="Tìm kiếm">
        <LabeledRow label="Placeholder search (desktop)">
          <TextInput value={props.searchPlaceholder ?? ""} onChange={(v) => updateActive({ searchPlaceholder: v })} placeholder="Tìm đầm maxi, áo blazer, sneaker trắng hoặc mã đơn hàng..." />
        </LabeledRow>

        <LabeledRow label="Placeholder nút search (mobile)">
          <TextInput value={props.searchMobilePlaceholder ?? ""} onChange={(v) => updateActive({ searchMobilePlaceholder: v })} placeholder="Tìm outfit, sản phẩm, mã đơn..." />
        </LabeledRow>

        <LabeledRow label="Label nút submit">
          <TextInput value={props.searchButtonLabel ?? ""} onChange={(v) => updateActive({ searchButtonLabel: v })} placeholder="Tìm outfit" />
        </LabeledRow>

        <LabeledRow label="Search hints (gợi ý dưới ô - mỗi dòng 1 item)">
          <TextArea
            value={hintsText}
            onChange={(e) =>
              updateActive({
                searchHints: e
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </LabeledRow>

        <LabeledRow label="Search suggests (popup gợi ý - mỗi dòng 1 item)">
          <TextArea
            value={suggestsText}
            onChange={(e) =>
              updateActive({
                searchSuggests: e
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder={`Set suit công sở nữ\nÁo thun basic oversize\nSneaker trắng phối đồ`}
            rows={4}
          />
        </LabeledRow>
      </Section>

      {/* USER / BADGES */}
      <Section title="User & Badge">
        <LabeledRow label="Lời chào (user name)">
          <TextInput value={props.welcomeName ?? ""} onChange={(v) => updateActive({ welcomeName: v })} placeholder="Xin chào, Bạn" />
        </LabeledRow>

        <LabeledRow label="User role / cấp độ">
          <TextInput value={props.userRole ?? ""} onChange={(v) => updateActive({ userRole: v })} placeholder="Aurora Member" />
        </LabeledRow>

        <LabeledRow label="Số thông báo (notifCount)">
          <TextInput
            value={String(props.notifCount ?? 0)}
            onChange={(v) => {
              const num = parseInt(v, 10);
              updateActive({
                notifCount: Number.isNaN(num) ? undefined : num,
              });
            }}
            placeholder="5"
          />
        </LabeledRow>

        <LabeledRow label="Số lượng trong giỏ (cartCount)">
          <TextInput
            value={String(props.cartCount ?? 0)}
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

      {/* TICKER */}
      <Section title="Thanh ticker (Updates)">
        <LabeledRow label="Tiêu đề ticker">
          <TextInput value={props.tickerTitle ?? ""} onChange={(v) => updateActive({ tickerTitle: v })} placeholder="Aurora Wear Updates" />
        </LabeledRow>

        <LabeledRow label="Danh sách ticker (mỗi dòng: TAG|Nội dung)">
          <textarea
            value={tickerItemsText}
            onChange={(e) => {
              const lines = e.target.value.split("\n");
              const items =
                lines
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const [tagRaw, ...rest] = line.split("|");
                    const tag = tagRaw?.trim() || "";
                    const content = rest.join("|").trim() || tagRaw.trim();
                    return { tag, content };
                  }) ?? [];
              updateActive({ tickerItems: items });
            }}
            placeholder={`NEW|Ra mắt collection Aura Blue – phối được 12 outfit với 8 items.\nSALE|Flash Sale cuối tuần – Giảm đến 50% áo khoác, blazer, knit wear.`}
            className="tb-textarea"
            rows={4}
          />
        </LabeledRow>
      </Section>

      {/* BOTTOM NAV */}
      <Section title="Bottom nav (tab bar mobile)">
        <LabeledRow label="Items (mỗi dòng: id|iconClass|Label)">
          <textarea
            value={bottomNavItemsText}
            onChange={(e) => {
              const lines = e.target.value.split("\n");
              const items =
                lines
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const parts = line.split("|");
                    const id = (parts[0] || "").trim();
                    const iconClass = (parts[1] || "").trim();
                    const label = (parts[2] || "").trim() || id;
                    return { id, iconClass, label };
                  }) ?? [];
              updateActive({ bottomNavItems: items });
            }}
            placeholder={`home|bi bi-house-door|Trang chủ\ncategory|bi bi-grid-3x3-gap|Danh mục\nstyle|bi bi-magic|Mix đồ\ncart|bi bi-bag|Giỏ hàng\naccount|bi bi-person|Tài khoản`}
            className="tb-textarea"
            rows={5}
          />
        </LabeledRow>
      </Section>

      {/* MENU / API */}
      <Section title="Menu từ API">
        <LabeledRow label="Tự động load menu từ API">
          <Checkbox checked={props.autoLoadMenu ?? true} onChange={(checked) => updateActive({ autoLoadMenu: checked })} />
        </LabeledRow>

        <LabeledRow label="Locale">
          <TextInput value={props.locale ?? ""} onChange={(v) => updateActive({ locale: v })} placeholder="vi" />
        </LabeledRow>

        <LabeledRow label="setKey (bộ menu)">
          <TextInput value={props.setKey ?? ""} onChange={(v) => updateActive({ setKey: v })} placeholder="home" />
        </LabeledRow>

        <LabeledRow label="Site ID (nếu dùng multi-site)">
          <TextInput value={props.siteId ?? ""} onChange={(v) => updateActive({ siteId: v || undefined })} placeholder="(optional) cmhogc..." />
        </LabeledRow>
      </Section>

      {/* OTHER */}
      <Section title="Khác">
        <LabeledRow label="Preview mode (chặn click, chỉ xem)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default HeaderAuroraEditor;
