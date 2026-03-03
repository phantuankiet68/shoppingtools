// editors/topbar/TopbarMultiEditor.tsx
import React from "react";
import type {
  TopbarMultiProps,
  TopbarProTickerItem,
  TopbarProLinkItem,
} from "@/components/admin/shared/templates/ShopTemplate/Ui/topbar/TopbarMulti";
import Section from "../parts/Section";
import TextArea from "../parts/TextArea";
import TextInput from "../parts/TextInput";
import LabeledRow from "../parts/LabeledRow";
import Checkbox from "../parts/Checkbox";
import Button from "../parts/Button";

type TopbarMultiEditorProps = {
  props: TopbarMultiProps;
  updateActive: (patch: Partial<TopbarMultiProps>) => void;
};

const TopbarMultiEditor: React.FC<TopbarMultiEditorProps> = ({ props, updateActive }) => {
  const tickerItems = props.tickerItems ?? [];
  const links = props.links ?? [];

  const updateTickerItem = (index: number, patch: Partial<TopbarProTickerItem>) => {
    const next = tickerItems.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ tickerItems: next });
  };

  const addTickerItem = () => {
    const next: TopbarProTickerItem[] = [...tickerItems, { text: "Ticker mới", badge: "New" }];
    updateActive({ tickerItems: next });
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
    const next: TopbarProLinkItem[] = [...links, { label: "Link mới", href: "#", iconClass: "bi bi-link-45deg" }];
    updateActive({ links: next });
  };

  const removeLinkItem = (index: number) => {
    const next = links.filter((_, i) => i !== index);
    updateActive({ links: next });
  };

  return (
    <>
      <Section title="Logo & Thương hiệu">
        <LabeledRow label="Logo icon class (Bootstrap Icons)">
          <TextInput
            value={props.logoIconClass ?? ""}
            onChange={(v) => updateActive({ logoIconClass: v })}
            placeholder="ví dụ: bi bi-stars"
          />
        </LabeledRow>

        <LabeledRow label="Tiêu đề thương hiệu">
          <TextInput
            value={props.brandTitle ?? ""}
            onChange={(v) => updateActive({ brandTitle: v })}
            placeholder="Aurora Neo"
          />
        </LabeledRow>

        <LabeledRow label="Mô tả ngắn">
          <TextArea
            value={props.brandSubtitle ?? ""}
            onChange={(v) => updateActive({ brandSubtitle: v })}
            placeholder="Trải nghiệm mua sắm đa vũ trụ 2026."
          />
        </LabeledRow>
      </Section>

      <Section title="Khu vực / Region">
        <LabeledRow label="Hiển thị nút KV">
          <Checkbox
            checked={props.showRegionButton ?? true}
            onChange={(checked) => updateActive({ showRegionButton: checked })}
          />
        </LabeledRow>

        <LabeledRow label="Text KV">
          <TextInput
            value={props.regionLabel ?? ""}
            onChange={(v) => updateActive({ regionLabel: v })}
            placeholder="KV: Hồ Chí Minh"
          />
        </LabeledRow>

        <LabeledRow label="Icon trái (regionIconClass)">
          <TextInput
            value={props.regionIconClass ?? ""}
            onChange={(v) => updateActive({ regionIconClass: v })}
            placeholder="bi bi-geo-alt"
          />
        </LabeledRow>

        <LabeledRow label="Icon phải (chevron)">
          <TextInput
            value={props.regionChevronIconClass ?? ""}
            onChange={(v) => updateActive({ regionChevronIconClass: v })}
            placeholder="bi bi-chevron-down"
          />
        </LabeledRow>
      </Section>

      <Section title="Ticker trung tâm">
        <LabeledRow label="Hiển thị ticker">
          <Checkbox checked={props.showTicker ?? true} onChange={(checked) => updateActive({ showTicker: checked })} />
        </LabeledRow>

        <LabeledRow label="Label ticker">
          <TextInput
            value={props.tickerLabel ?? ""}
            onChange={(v) => updateActive({ tickerLabel: v })}
            placeholder="LIVE UPDATE"
          />
        </LabeledRow>

        {tickerItems.map((item, index) => (
          <Section key={index} title={`Ticker #${index + 1}`}>
            <LabeledRow label="Text">
              <TextArea value={item.text} onChange={(v) => updateTickerItem(index, { text: v })} />
            </LabeledRow>
            <LabeledRow label="Badge (tag)">
              <TextInput value={item.badge ?? ""} onChange={(v) => updateTickerItem(index, { badge: v })} />
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

      <Section title="Trạng thái & màu nền">
        <LabeledRow label="Hiển thị status pill">
          <Checkbox checked={props.showStatus ?? false} onChange={(checked) => updateActive({ showStatus: checked })} />
        </LabeledRow>

        <LabeledRow label="Text trạng thái">
          <TextInput
            value={props.statusText ?? ""}
            onChange={(v) => updateActive({ statusText: v })}
            placeholder="Online"
          />
        </LabeledRow>

        <LabeledRow label="Màu chấm trạng thái">
          <TextInput
            value={props.statusDotColor ?? ""}
            onChange={(v) => updateActive({ statusDotColor: v })}
            placeholder="#22c55e"
          />
        </LabeledRow>

        <LabeledRow label="Background color override (tùy chọn)">
          <TextInput
            value={props.backgroundColor ?? ""}
            onChange={(v) => updateActive({ backgroundColor: v })}
            placeholder="VD: #f97316"
          />
        </LabeledRow>
      </Section>

      <Section title="Links bên phải">
        {links.map((link, index) => (
          <Section key={index} title={`Link #${index + 1}`}>
            <LabeledRow label="Label">
              <TextInput value={link.label} onChange={(v) => updateLinkItem(index, { label: v })} />
            </LabeledRow>
            <LabeledRow label="Href">
              <TextInput
                value={link.href ?? ""}
                onChange={(v) => updateLinkItem(index, { href: v })}
                placeholder="# hoặc https://..."
              />
            </LabeledRow>
            <LabeledRow label="Icon class">
              <TextInput
                value={link.iconClass ?? ""}
                onChange={(v) => updateLinkItem(index, { iconClass: v })}
                placeholder="bi bi-truck"
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

      <Section title="Khác">
        <LabeledRow label="Preview mode (khóa link)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default TopbarMultiEditor;
