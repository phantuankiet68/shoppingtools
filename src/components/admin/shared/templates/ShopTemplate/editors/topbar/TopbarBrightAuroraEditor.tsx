// editors/topbar/TopbarBrightAuroraEditor.tsx
import React from "react";

import Section from "../parts/Section";
import TextArea from "../parts/TextArea";
import TextInput from "../parts/TextInput";
import LabeledRow from "../parts/LabeledRow";
import Checkbox from "../parts/Checkbox";
import Button from "../parts/Button";

import type {
  TopbarBrightAuroraProps,
  TopbarProTickerItem,
  TopbarProLinkItem,
} from "@/components/admin/shared/templates/ShopTemplate/Ui/topbar/TopbarBrightAurora";

type TopbarBrightAuroraEditorProps = {
  props: TopbarBrightAuroraProps;
  updateActive: (patch: Partial<TopbarBrightAuroraProps>) => void;
};

const TopbarBrightAuroraEditor: React.FC<TopbarBrightAuroraEditorProps> = ({ props, updateActive }) => {
  const tickerItems: TopbarProTickerItem[] = props.tickerItems ?? [];
  const links: TopbarProLinkItem[] = props.links ?? [];

  // ===== helpers cho ticker =====
  const updateTickerItem = (index: number, patch: Partial<TopbarProTickerItem>) => {
    const next = tickerItems.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ tickerItems: next });
  };

  const addTickerItem = () => {
    const next: TopbarProTickerItem[] = [
      ...tickerItems,
      {
        text: "Nội dung ticker mới",
        badge: "New",
      },
    ];
    updateActive({ tickerItems: next });
  };

  const removeTickerItem = (index: number) => {
    const next = tickerItems.filter((_, i) => i !== index);
    updateActive({ tickerItems: next });
  };

  // ===== helpers cho links =====
  const updateLinkItem = (index: number, patch: Partial<TopbarProLinkItem>) => {
    const next = links.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ links: next });
  };

  const addLinkItem = () => {
    const next: TopbarProLinkItem[] = [
      ...links,
      {
        label: "Link mới",
        href: "#",
        iconClass: "bi bi-link-45deg",
      },
    ];
    updateActive({ links: next });
  };

  const removeLinkItem = (index: number) => {
    const next = links.filter((_, i) => i !== index);
    updateActive({ links: next });
  };

  return (
    <>
      {/* Logo & Brand */}
      <Section title="Logo & thương hiệu">
        <LabeledRow label="Icon class (Bootstrap Icons)">
          <TextInput
            value={props.logoIconClass ?? "bi bi-stars"}
            onChange={(value) => updateActive({ logoIconClass: value })}
            placeholder="VD: bi bi-stars"
          />
        </LabeledRow>

        <LabeledRow label="Tiêu đề thương hiệu">
          <TextInput
            value={props.brandTitle ?? ""}
            onChange={(value) => updateActive({ brandTitle: value })}
            placeholder="VD: Aurora Hub"
          />
        </LabeledRow>

        <LabeledRow label="Mô tả ngắn">
          <TextArea
            value={props.brandSubtitle ?? ""}
            onChange={(value) => updateActive({ brandSubtitle: value })}
            placeholder="Không gian đọc & trải nghiệm 2026"
          />
        </LabeledRow>
      </Section>

      {/* Region / KV */}
      <Section title="Khu vực hiển thị (Region)">
        <LabeledRow label="Hiển thị nút KV">
          <Checkbox
            checked={props.showRegionButton ?? true}
            onChange={(checked) => updateActive({ showRegionButton: checked })}
          />
        </LabeledRow>

        <LabeledRow label="Text khu vực">
          <TextInput
            value={props.regionLabel ?? ""}
            onChange={(value) => updateActive({ regionLabel: value })}
            placeholder="VD: KV: Hồ Chí Minh"
          />
        </LabeledRow>

        <LabeledRow label="Icon trái (class)">
          <TextInput
            value={props.regionIconClass ?? "bi bi-geo-alt"}
            onChange={(value) => updateActive({ regionIconClass: value })}
            placeholder="VD: bi bi-geo-alt"
          />
        </LabeledRow>

        <LabeledRow label="Icon chevron phải (class)">
          <TextInput
            value={props.regionChevronIconClass ?? "bi bi-chevron-down"}
            onChange={(value) => updateActive({ regionChevronIconClass: value })}
            placeholder="VD: bi bi-chevron-down"
          />
        </LabeledRow>
      </Section>

      {/* Ticker */}
      <Section title="Ticker / Updates">
        <LabeledRow label="Hiển thị ticker">
          <Checkbox checked={props.showTicker ?? true} onChange={(checked) => updateActive({ showTicker: checked })} />
        </LabeledRow>

        <LabeledRow label="Nhãn ticker (label)">
          <TextInput
            value={props.tickerLabel ?? "Updates"}
            onChange={(value) => updateActive({ tickerLabel: value })}
            placeholder="VD: Updates"
          />
        </LabeledRow>

        {tickerItems.map((item, index) => (
          <Section key={index} title={`Ticker #${index + 1}`}>
            <LabeledRow label="Nội dung">
              <TextArea
                value={item.text}
                onChange={(value) => updateTickerItem(index, { text: value })}
                placeholder="Text hiển thị của ticker"
              />
            </LabeledRow>

            <LabeledRow label="Badge (nhãn nhỏ)">
              <TextInput
                value={item.badge ?? ""}
                onChange={(value) => updateTickerItem(index, { badge: value })}
                placeholder="VD: New, Premium, Update..."
              />
            </LabeledRow>

            <Button type="button" onClick={() => removeTickerItem(index)}>
              Xóa ticker
            </Button>
          </Section>
        ))}

        <Button type="button" onClick={addTickerItem}>
          + Thêm ticker
        </Button>
      </Section>

      {/* Links bên phải */}
      <Section title="Links bên phải">
        {links.map((link, index) => (
          <Section key={index} title={`Link #${index + 1}`}>
            <LabeledRow label="Label">
              <TextInput
                value={link.label}
                onChange={(value) => updateLinkItem(index, { label: value })}
                placeholder="VD: Trung tâm hỗ trợ"
              />
            </LabeledRow>

            <LabeledRow label="URL">
              <TextInput
                value={link.href ?? ""}
                onChange={(value) => updateLinkItem(index, { href: value })}
                placeholder="VD: /support"
              />
            </LabeledRow>

            <LabeledRow label="Icon class">
              <TextInput
                value={link.iconClass ?? ""}
                onChange={(value) => updateLinkItem(index, { iconClass: value })}
                placeholder="VD: bi bi-life-preserver"
              />
            </LabeledRow>

            <Button type="button" onClick={() => removeLinkItem(index)}>
              Xóa link
            </Button>
          </Section>
        ))}

        <Button type="button" onClick={addLinkItem}>
          + Thêm link
        </Button>
      </Section>

      {/* Status pill */}
      <Section title="Status pill (Online / trạng thái)">
        <LabeledRow label="Hiển thị status">
          <Checkbox checked={props.showStatus ?? true} onChange={(checked) => updateActive({ showStatus: checked })} />
        </LabeledRow>

        <LabeledRow label="Text trạng thái">
          <TextInput
            value={props.statusText ?? ""}
            onChange={(value) => updateActive({ statusText: value })}
            placeholder="VD: Online"
          />
        </LabeledRow>

        <LabeledRow label="Màu chấm (dot color)">
          <TextInput
            value={props.statusDotColor ?? "#22c55e"}
            onChange={(value) => updateActive({ statusDotColor: value })}
            placeholder="VD: #22c55e"
          />
        </LabeledRow>
      </Section>

      {/* Background */}
      <Section title="Màu nền gradient">
        <LabeledRow label="Màu g1 (chính)">
          <TextInput
            value={props.backgroundColor ?? "#ffe8d6"}
            onChange={(value) => updateActive({ backgroundColor: value })}
            placeholder="VD: #ffe8d6"
          />
        </LabeledRow>
      </Section>

      {/* Khác */}
      <Section title="Tùy chọn khác">
        <LabeledRow label="Preview mode (khóa click link)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default TopbarBrightAuroraEditor;
