// src/components/templates/editors/TopbarBlueEditor.tsx
import React from "react";
import type {
  TopbarBlueProps,
  TopbarBlueTickerItem,
  TopbarBlueLinkItem,
} from "@/components/admin/shared/templates/ShopTemplate/Ui/topbar/TopbarBlue";

import Section from "../parts/Section";
import TextArea from "../parts/TextArea";
import TextInput from "../parts/TextInput";
import LabeledRow from "../parts/LabeledRow";
import Checkbox from "../parts/Checkbox";
import Button from "../parts/Button";

type TopbarBlueEditorProps = {
  props: TopbarBlueProps;
  updateActive: (patch: Partial<TopbarBlueProps>) => void;
};

const TopbarBlueEditor: React.FC<TopbarBlueEditorProps> = ({ props, updateActive }) => {
  const tickerItems: TopbarBlueTickerItem[] = props.tickerItems ?? [];
  const links: TopbarBlueLinkItem[] = props.links ?? [];

  // ===== ticker handlers =====
  const updateTickerItem = (index: number, patch: Partial<TopbarBlueTickerItem>) => {
    const next = tickerItems.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ tickerItems: next });
  };

  const addTickerItem = () => {
    updateActive({
      tickerItems: [
        ...tickerItems,
        {
          text: "",
          badge: "",
        },
      ],
    });
  };

  const removeTickerItem = (index: number) => {
    const next = tickerItems.filter((_, i) => i !== index);
    updateActive({ tickerItems: next });
  };

  // ===== links handlers =====
  const updateLinkItem = (index: number, patch: Partial<TopbarBlueLinkItem>) => {
    const next = links.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ links: next });
  };

  const addLinkItem = () => {
    updateActive({
      links: [
        ...links,
        {
          label: "",
          href: "#",
          iconClass: "",
        },
      ],
    });
  };

  const removeLinkItem = (index: number) => {
    const next = links.filter((_, i) => i !== index);
    updateActive({ links: next });
  };

  return (
    <>
      {/* Nội dung chính */}
      <Section title="Nội dung chính">
        <LabeledRow label="Logo icon class">
          <TextInput
            value={props.logoIconClass ?? "bi bi-lightning-fill"}
            onChange={(v) => updateActive({ logoIconClass: v })}
            placeholder="bi bi-lightning-fill"
          />
        </LabeledRow>

        <LabeledRow label="Tiêu đề">
          <TextInput
            value={props.brandTitle ?? ""}
            onChange={(v) => updateActive({ brandTitle: v })}
            placeholder="Aurora Blue"
          />
        </LabeledRow>

        <LabeledRow label="Mô tả ngắn">
          <TextArea
            value={props.brandSubtitle ?? ""}
            onChange={(v) => updateActive({ brandSubtitle: v })}
            placeholder="Topbar 2025 – Xanh đậm chuyên nghiệp"
          />
        </LabeledRow>

        <LabeledRow label="Màu nền">
          <TextInput
            value={props.backgroundColor ?? "#0b5ed7"}
            onChange={(v) => updateActive({ backgroundColor: v })}
            placeholder="#0b5ed7"
          />
        </LabeledRow>
      </Section>

      {/* Region button */}
      <Section title="Khu vực (Region button)">
        <LabeledRow label="Hiển thị nút KV">
          <Checkbox
            checked={props.showRegionButton ?? true}
            onChange={(checked) => updateActive({ showRegionButton: checked })}
          />
        </LabeledRow>

        <LabeledRow label="Text khu vực">
          <TextInput
            value={props.regionLabel ?? ""}
            onChange={(v) => updateActive({ regionLabel: v })}
            placeholder="KV: Hồ Chí Minh"
          />
        </LabeledRow>

        <LabeledRow label="Icon location class">
          <TextInput
            value={props.regionIconClass ?? "bi bi-geo-alt"}
            onChange={(v) => updateActive({ regionIconClass: v })}
            placeholder="bi bi-geo-alt"
          />
        </LabeledRow>

        <LabeledRow label="Icon chevron class">
          <TextInput
            value={props.regionChevronIconClass ?? "bi bi-chevron-down"}
            onChange={(v) => updateActive({ regionChevronIconClass: v })}
            placeholder="bi bi-chevron-down"
          />
        </LabeledRow>
      </Section>

      {/* Ticker */}
      <Section title="Ticker">
        <LabeledRow label="Bật ticker">
          <Checkbox checked={props.showTicker ?? true} onChange={(checked) => updateActive({ showTicker: checked })} />
        </LabeledRow>

        <LabeledRow label="Label">
          <TextInput
            value={props.tickerLabel ?? "News"}
            onChange={(v) => updateActive({ tickerLabel: v })}
            placeholder="News"
          />
        </LabeledRow>

        <div className="listBox">
          {tickerItems.length === 0 && (
            <div className="hint">Chưa có ticker nào. Nhấn &quot;Thêm ticker&quot; để tạo.</div>
          )}

          {tickerItems.map((item, index) => (
            <div key={index} className="listItem">
              <div className="listItemHeader">
                <strong>Ticker #{index + 1}</strong>
                <button type="button" onClick={() => removeTickerItem(index)}>
                  Xóa
                </button>
              </div>

              <LabeledRow label="Badge">
                <TextInput
                  value={item.badge ?? ""}
                  onChange={(v) => updateTickerItem(index, { badge: v })}
                  placeholder="Online / Update / Support..."
                />
              </LabeledRow>

              <LabeledRow label="Text">
                <TextInput
                  value={item.text ?? ""}
                  onChange={(v) => updateTickerItem(index, { text: v })}
                  placeholder="Nội dung ticker"
                />
              </LabeledRow>
            </div>
          ))}

          <Button type="button" onClick={addTickerItem}>
            + Thêm ticker
          </Button>
        </div>
      </Section>

      {/* Links */}
      <Section title="Links bên phải">
        <div className="listBox">
          {links.length === 0 && <div className="hint">Chưa có link nào. Nhấn &quot;Thêm link&quot; để tạo.</div>}

          {links.map((item, index) => (
            <div key={index} className="listItem">
              <div className="listItemHeader">
                <strong>Link #{index + 1}</strong>
                <button type="button" onClick={() => removeLinkItem(index)}>
                  Xóa
                </button>
              </div>

              <LabeledRow label="Label">
                <TextInput
                  value={item.label ?? ""}
                  onChange={(v) => updateLinkItem(index, { label: v })}
                  placeholder="Hỗ trợ"
                />
              </LabeledRow>

              <LabeledRow label="Href">
                <TextInput
                  value={item.href ?? ""}
                  onChange={(v) => updateLinkItem(index, { href: v })}
                  placeholder="https://..."
                />
              </LabeledRow>

              <LabeledRow label="Icon class">
                <TextInput
                  value={item.iconClass ?? ""}
                  onChange={(v) => updateLinkItem(index, { iconClass: v })}
                  placeholder="bi bi-life-preserver"
                />
              </LabeledRow>
            </div>
          ))}

          <Button type="button" onClick={addLinkItem}>
            + Thêm link
          </Button>
        </div>
      </Section>

      {/* Status & preview */}
      <Section title="Trạng thái & Preview">
        <LabeledRow label="Hiển thị status">
          <Checkbox checked={props.showStatus ?? true} onChange={(checked) => updateActive({ showStatus: checked })} />
        </LabeledRow>

        <LabeledRow label="Text status">
          <TextInput
            value={props.statusText ?? "Online"}
            onChange={(v) => updateActive({ statusText: v })}
            placeholder="Online"
          />
        </LabeledRow>

        <LabeledRow label="Màu chấm status">
          <TextInput
            value={props.statusDotColor ?? "#4ade80"}
            onChange={(v) => updateActive({ statusDotColor: v })}
            placeholder="#4ade80"
          />
        </LabeledRow>

        <LabeledRow label="Preview (chặn click link)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default TopbarBlueEditor;
