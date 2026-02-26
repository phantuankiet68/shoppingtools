// editors/topbar/TopbarAurora2026Editor.tsx
import React from "react";
import Section from "../parts/Section";
import TextArea from "../parts/TextArea";
import TextInput from "../parts/TextInput";
import LabeledRow from "../parts/LabeledRow";
import Checkbox from "../parts/Checkbox";
import Button from "../parts/Button";

import type {
  TopbarAurora2026Props,
  TopbarProTickerItem,
  TopbarProLinkItem,
} from "@/components/admin/shared/templates/ShopTemplate/Ui/topbar/TopbarAurora2026";

type TopbarAurora2026EditorProps = {
  props: TopbarAurora2026Props;
  updateActive: (patch: Partial<TopbarAurora2026Props>) => void;
};

const TopbarAurora2026Editor: React.FC<TopbarAurora2026EditorProps> = ({ props, updateActive }) => {
  const tickerItems = props.tickerItems ?? [];
  const links = props.links ?? [];

  const updateTickerItem = (index: number, patch: Partial<TopbarProTickerItem>) => {
    const next = tickerItems.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ tickerItems: next });
  };

  const addTickerItem = () => {
    const next: TopbarProTickerItem = {
      text: "Nội dung ticker mới...",
      badge: "New",
    };
    updateActive({ tickerItems: [...tickerItems, next] });
  };

  const removeTickerItem = (index: number) => {
    const next = tickerItems.filter((_, i) => i !== index);
    updateActive({ tickerItems: next });
  };

  const updateLinkItem = (index: number, patch: Partial<TopbarProLinkItem>) => {
    const next = links.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ links: next });
  };

  const addLinkItem = () => {
    const next: TopbarProLinkItem = {
      label: "Link mới",
      href: "#",
      iconClass: "bi bi-link-45deg",
    };
    updateActive({ links: [...links, next] });
  };

  const removeLinkItem = (index: number) => {
    const next = links.filter((_, i) => i !== index);
    updateActive({ links: next });
  };

  return (
    <>
      {/* Thông tin thương hiệu */}
      <Section title="Thương hiệu & Logo">
        <LabeledRow label="Logo icon class (Bootstrap Icons)">
          <TextInput
            value={props.logoIconClass ?? ""}
            onChange={(value) => updateActive({ logoIconClass: value })}
            placeholder="vd: bi bi-sparkles"
          />
        </LabeledRow>

        <LabeledRow label="Tiêu đề thương hiệu">
          <TextInput
            value={props.brandTitle ?? ""}
            onChange={(value) => updateActive({ brandTitle: value })}
            placeholder="Aurora Hub"
          />
        </LabeledRow>

        <LabeledRow label="Mô tả ngắn dưới logo">
          <TextInput
            value={props.brandSubtitle ?? ""}
            onChange={(value) => updateActive({ brandSubtitle: value })}
            placeholder="Nền tảng Mua sắm thế hệ mới."
          />
        </LabeledRow>
      </Section>

      {/* Region */}
      <Section title="Khu vực (Region button)">
        <LabeledRow label="Hiển thị nút khu vực">
          <Checkbox
            checked={props.showRegionButton ?? true}
            onChange={(checked) => updateActive({ showRegionButton: checked })}
          />
        </LabeledRow>

        <LabeledRow label="Label khu vực">
          <TextInput
            value={props.regionLabel ?? ""}
            onChange={(value) => updateActive({ regionLabel: value })}
            placeholder="KV: Hồ Chí Minh"
          />
        </LabeledRow>

        <LabeledRow label="Icon trái (Bootstrap)">
          <TextInput
            value={props.regionIconClass ?? ""}
            onChange={(value) => updateActive({ regionIconClass: value })}
            placeholder="bi bi-geo-alt"
          />
        </LabeledRow>

        <LabeledRow label="Icon chevron phải (Bootstrap)">
          <TextInput
            value={props.regionChevronIconClass ?? ""}
            onChange={(value) => updateActive({ regionChevronIconClass: value })}
            placeholder="bi bi-chevron-down"
          />
        </LabeledRow>
      </Section>

      {/* Ticker */}
      <Section title="Ticker cập nhật">
        <LabeledRow label="Hiển thị ticker">
          <Checkbox checked={props.showTicker ?? true} onChange={(checked) => updateActive({ showTicker: checked })} />
        </LabeledRow>

        <LabeledRow label="Label nhỏ bên trái">
          <TextInput
            value={props.tickerLabel ?? ""}
            onChange={(value) => updateActive({ tickerLabel: value })}
            placeholder="UPDATES"
          />
        </LabeledRow>

        {tickerItems.map((item, index) => (
          <Section key={index} title={`Ticker #${index + 1}`}>
            <LabeledRow label="Nội dung">
              <TextArea
                value={item.text ?? ""}
                onChange={(value) => updateTickerItem(index, { text: value })}
                placeholder="Text hiển thị trong ticker..."
              />
            </LabeledRow>
            <LabeledRow label="Badge (tag nhỏ)">
              <TextInput
                value={item.badge ?? ""}
                onChange={(value) => updateTickerItem(index, { badge: value })}
                placeholder="vd: AI Mode, Space Room..."
              />
            </LabeledRow>
            <Button type="button" onClick={() => removeTickerItem(index)}>
              Xóa ticker này
            </Button>
          </Section>
        ))}

        <Button type="button" onClick={addTickerItem}>
          + Thêm ticker
        </Button>
      </Section>

      {/* Status */}
      <Section title="Trạng thái (Status pill)">
        <LabeledRow label="Hiển thị status pill">
          <Checkbox checked={props.showStatus ?? true} onChange={(checked) => updateActive({ showStatus: checked })} />
        </LabeledRow>

        <LabeledRow label="Text trạng thái">
          <TextInput
            value={props.statusText ?? ""}
            onChange={(value) => updateActive({ statusText: value })}
            placeholder="Trực tuyến 24/7"
          />
        </LabeledRow>

        <LabeledRow label="Màu dot (CSS color)">
          <TextInput
            value={props.statusDotColor ?? ""}
            onChange={(value) => updateActive({ statusDotColor: value })}
            placeholder="#22c55e hoặc tên màu"
          />
        </LabeledRow>
      </Section>

      {/* Links */}
      <Section title="Link bên phải">
        {links.map((link, index) => (
          <Section key={index} title={`Link #${index + 1}`}>
            <LabeledRow label="Label">
              <TextInput
                value={link.label ?? ""}
                onChange={(value) => updateLinkItem(index, { label: value })}
                placeholder="Trung tâm hỗ trợ"
              />
            </LabeledRow>

            <LabeledRow label="Href">
              <TextInput
                value={link.href ?? ""}
                onChange={(value) => updateLinkItem(index, { href: value })}
                placeholder="# hoặc /support"
              />
            </LabeledRow>

            <LabeledRow label="Icon class (Bootstrap)">
              <TextInput
                value={link.iconClass ?? ""}
                onChange={(value) => updateLinkItem(index, { iconClass: value })}
                placeholder="bi bi-life-preserver"
              />
            </LabeledRow>

            <Button type="button" onClick={() => removeLinkItem(index)}>
              Xóa link này
            </Button>
          </Section>
        ))}

        <Button type="button" onClick={addLinkItem}>
          + Thêm link
        </Button>
      </Section>

      {/* Background & preview */}
      <Section title="Khác">
        <LabeledRow label="Màu nền chính (override gradient)">
          <TextInput
            value={props.backgroundColor ?? ""}
            onChange={(value) => updateActive({ backgroundColor: value })}
            placeholder="vd: #0f172a (để trống dùng mặc định)"
          />
        </LabeledRow>

        <LabeledRow label="Preview mode (chặn click link)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default TopbarAurora2026Editor;
