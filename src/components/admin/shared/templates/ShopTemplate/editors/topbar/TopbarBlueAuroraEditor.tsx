// editors/topbar/TopbarBlueAuroraEditor.tsx
import React from "react";

import { type TopbarBlueAuroraProps, type TopbarProTickerItem, type TopbarProLinkItem } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarBlueAurora";

import Section from "../parts/Section";
import TextArea from "../parts/TextArea";
import TextInput from "../parts/TextInput";
import LabeledRow from "../parts/LabeledRow";
import Checkbox from "../parts/Checkbox";
import Button from "../parts/Button";

type TopbarBlueAuroraEditorProps = {
  props: TopbarBlueAuroraProps;
  updateActive: (patch: Partial<TopbarBlueAuroraProps>) => void;
};

const TopbarBlueAuroraEditor: React.FC<TopbarBlueAuroraEditorProps> = ({ props, updateActive }) => {
  const tickerItems: TopbarProTickerItem[] = props.tickerItems ?? [];
  const links: TopbarProLinkItem[] = props.links ?? [];

  // ----- Ticker helpers -----
  const updateTickerItem = (index: number, patch: Partial<TopbarProTickerItem>) => {
    const next = tickerItems.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ tickerItems: next });
  };

  const addTickerItem = () => {
    const next = [
      ...tickerItems,
      {
        text: "",
        badge: "",
      },
    ];
    updateActive({ tickerItems: next });
  };

  const removeTickerItem = (index: number) => {
    const next = tickerItems.filter((_, i) => i !== index);
    updateActive({ tickerItems: next });
  };

  // ----- Links helpers -----
  const updateLinkItem = (index: number, patch: Partial<TopbarProLinkItem>) => {
    const next = links.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ links: next });
  };

  const addLinkItem = () => {
    const next = [
      ...links,
      {
        label: "",
        href: "#",
        iconClass: "",
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
      {/* Brand & Logo */}
      <Section title="Brand & Logo">
        <LabeledRow label="Logo icon class (Bootstrap Icons)">
          <TextInput value={props.logoIconClass ?? ""} onChange={(value) => updateActive({ logoIconClass: value })} placeholder="vd: bi bi-lightning" />
        </LabeledRow>

        <LabeledRow label="Tiêu đề (brandTitle)">
          <TextInput value={props.brandTitle ?? ""} onChange={(value) => updateActive({ brandTitle: value })} placeholder="Aurora Blue" />
        </LabeledRow>

        <LabeledRow label="Mô tả ngắn (brandSubtitle)">
          <TextArea value={props.brandSubtitle ?? ""} onChange={(value) => updateActive({ brandSubtitle: value })} placeholder="Không gian sáng tạo – phiên bản Blue 2026" rows={2} />
        </LabeledRow>
      </Section>

      {/* Region button */}
      <Section title="Khu vực (Region button)">
        <LabeledRow label="Hiển thị nút KV">
          <Checkbox checked={props.showRegionButton ?? true} onChange={(checked) => updateActive({ showRegionButton: checked })} />
        </LabeledRow>

        <LabeledRow label="Nhãn KV (regionLabel)">
          <TextInput value={props.regionLabel ?? ""} onChange={(value) => updateActive({ regionLabel: value })} placeholder="KV: Hồ Chí Minh" />
        </LabeledRow>

        <LabeledRow label="Icon trái (regionIconClass)">
          <TextInput value={props.regionIconClass ?? ""} onChange={(value) => updateActive({ regionIconClass: value })} placeholder="bi bi-geo-alt" />
        </LabeledRow>

        <LabeledRow label="Icon chevron (regionChevronIconClass)">
          <TextInput value={props.regionChevronIconClass ?? ""} onChange={(value) => updateActive({ regionChevronIconClass: value })} placeholder="bi bi-chevron-down" />
        </LabeledRow>
      </Section>

      {/* Ticker */}
      <Section title="Ticker (news)">
        <LabeledRow label="Hiển thị ticker">
          <Checkbox checked={props.showTicker ?? true} onChange={(checked) => updateActive({ showTicker: checked })} />
        </LabeledRow>

        <LabeledRow label="Ticker label">
          <TextInput value={props.tickerLabel ?? ""} onChange={(value) => updateActive({ tickerLabel: value })} placeholder="NEWS" />
        </LabeledRow>

        <LabeledRow label="Danh sách ticker items">
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            {tickerItems.map((item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}>
                <LabeledRow label="Text">
                  <TextInput value={item.text ?? ""} onChange={(value) => updateTickerItem(index, { text: value })} placeholder="Nội dung ticker" />
                </LabeledRow>
                <LabeledRow label="Badge (vd: Update, AI...)">
                  <TextInput value={item.badge ?? ""} onChange={(value) => updateTickerItem(index, { badge: value })} placeholder="Update / AI / New" />
                </LabeledRow>

                <Button type="button" onClick={() => removeTickerItem(index)}>
                  Xóa ticker
                </Button>
              </div>
            ))}

            <Button type="button" onClick={addTickerItem}>
              + Thêm ticker
            </Button>
          </div>
        </LabeledRow>
      </Section>

      {/* Status pill */}
      <Section title="Status (Online)">
        <LabeledRow label="Hiển thị status pill">
          <Checkbox checked={props.showStatus ?? true} onChange={(checked) => updateActive({ showStatus: checked })} />
        </LabeledRow>

        <LabeledRow label="Status text">
          <TextInput value={props.statusText ?? ""} onChange={(value) => updateActive({ statusText: value })} placeholder="Online" />
        </LabeledRow>

        <LabeledRow label="Màu chấm (statusDotColor)">
          <TextInput value={props.statusDotColor ?? ""} onChange={(value) => updateActive({ statusDotColor: value })} placeholder="#0b5ed7" />
        </LabeledRow>
      </Section>

      {/* Links */}
      <Section title="Danh sách link bên phải">
        <LabeledRow label="Links">
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            {links.map((link, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}>
                <LabeledRow label="Label">
                  <TextInput value={link.label ?? ""} onChange={(value) => updateLinkItem(index, { label: value })} placeholder="Hỗ trợ / Theo dõi đơn / Tài khoản" />
                </LabeledRow>

                <LabeledRow label="Href">
                  <TextInput value={link.href ?? ""} onChange={(value) => updateLinkItem(index, { href: value })} placeholder="# hoặc /account" />
                </LabeledRow>

                <LabeledRow label="Icon class (Bootstrap Icons)">
                  <TextInput value={link.iconClass ?? ""} onChange={(value) => updateLinkItem(index, { iconClass: value })} placeholder="bi bi-life-preserver" />
                </LabeledRow>

                <Button type="button" onClick={() => removeLinkItem(index)}>
                  Xóa link
                </Button>
              </div>
            ))}

            <Button type="button" onClick={addLinkItem}>
              + Thêm link
            </Button>
          </div>
        </LabeledRow>
      </Section>

      {/* Khác */}
      <Section title="Khác">
        <LabeledRow label="Background color (override)">
          <TextInput value={props.backgroundColor ?? ""} onChange={(value) => updateActive({ backgroundColor: value })} placeholder="#ffffff hoặc màu gradient chính" />
        </LabeledRow>

        <LabeledRow label="Preview mode (chặn click link)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default TopbarBlueAuroraEditor;
