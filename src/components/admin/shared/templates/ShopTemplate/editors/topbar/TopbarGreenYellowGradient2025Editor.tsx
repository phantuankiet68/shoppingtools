import React from "react";

import type {
  TopbarGreenYellowGradient2025Props,
  TopbarGreenYellowGradient2025TickerItem,
  TopbarGreenYellowGradient2025LinkItem,
} from "@/components/admin/shared/templates/ShopTemplate/Ui/topbar/TopbarGreenYellowGradient2025";

// ✅ Đổi sang import theo parts đúng với project của bạn
import Section from "../parts/Section";
import TextArea from "../parts/TextArea"; // (nếu không dùng có thể xoá)
import TextInput from "../parts/TextInput";
import LabeledRow from "../parts/LabeledRow";
import Checkbox from "../parts/Checkbox";
import Button from "../parts/Button";

type EditorProps = {
  props: TopbarGreenYellowGradient2025Props;
  updateActive: (patch: Partial<TopbarGreenYellowGradient2025Props>) => void;
};

const TopbarGreenYellowGradient2025Editor: React.FC<EditorProps> = ({ props, updateActive }) => {
  const tickers = props.tickerItems ?? [];
  const links = props.links ?? [];

  const updateTickerItem = (index: number, patch: Partial<TopbarGreenYellowGradient2025TickerItem>) => {
    const next = tickers.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ tickerItems: next });
  };

  const addTickerItem = () => {
    updateActive({
      tickerItems: [
        ...tickers,
        {
          text: "",
          badge: "",
        },
      ],
    });
  };

  const removeTickerItem = (index: number) => {
    const next = tickers.filter((_, i) => i !== index);
    updateActive({ tickerItems: next });
  };

  const updateLinkItem = (index: number, patch: Partial<TopbarGreenYellowGradient2025LinkItem>) => {
    const next = links.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ links: next });
  };

  const addLinkItem = () => {
    updateActive({
      links: [
        ...links,
        {
          label: "",
          href: "",
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
      {/* BRAND */}
      <Section title="Brand">
        <LabeledRow label="Logo icon class">
          <TextInput
            value={props.logoIconClass ?? ""}
            onChange={(v) => updateActive({ logoIconClass: v })}
            placeholder="bi bi-sun-fill"
          />
        </LabeledRow>

        <LabeledRow label="Tiêu đề">
          <TextInput
            value={props.brandTitle ?? ""}
            onChange={(v) => updateActive({ brandTitle: v })}
            placeholder="Aurora Green"
          />
        </LabeledRow>

        <LabeledRow label="Subtitle">
          <TextInput
            value={props.brandSubtitle ?? ""}
            onChange={(v) => updateActive({ brandSubtitle: v })}
            placeholder="Topbar 2025 – Gradient xanh lá → vàng"
          />
        </LabeledRow>
      </Section>

      {/* REGION BUTTON */}
      <Section title="Khu vực / Region button">
        <LabeledRow label="Hiển thị nút khu vực">
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

        <LabeledRow label="Icon location (class)">
          <TextInput
            value={props.regionIconClass ?? ""}
            onChange={(v) => updateActive({ regionIconClass: v })}
            placeholder="bi bi-geo-alt"
          />
        </LabeledRow>

        <LabeledRow label="Icon chevron (class)">
          <TextInput
            value={props.regionChevronIconClass ?? ""}
            onChange={(v) => updateActive({ regionChevronIconClass: v })}
            placeholder="bi bi-chevron-down"
          />
        </LabeledRow>
      </Section>

      {/* TICKER */}
      <Section title="Ticker giữa">
        <LabeledRow label="Bật ticker">
          <Checkbox checked={props.showTicker ?? true} onChange={(checked) => updateActive({ showTicker: checked })} />
        </LabeledRow>

        <LabeledRow label="Label nhỏ">
          <TextInput
            value={props.tickerLabel ?? ""}
            onChange={(v) => updateActive({ tickerLabel: v })}
            placeholder="Tin mới"
          />
        </LabeledRow>

        <div style={{ marginTop: 8 }}>
          {tickers.length === 0 && (
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
              Chưa có ticker nào. Nhấn "Thêm ticker" để tạo.
            </div>
          )}

          {tickers.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <strong style={{ fontSize: 12 }}>Ticker #{index + 1}</strong>
                <Button type="button" onClick={() => removeLinkItem(index)}>
                  Xóa
                </Button>
              </div>

              <LabeledRow label="Badge">
                <TextInput
                  value={item.badge ?? ""}
                  onChange={(v) => updateTickerItem(index, { badge: v })}
                  placeholder="Hot / Eco / Free..."
                />
              </LabeledRow>

              <LabeledRow label="Text">
                <TextInput
                  value={item.text ?? ""}
                  onChange={(v) => updateTickerItem(index, { text: v })}
                  placeholder="Ưu đãi mùa xanh – giao nhanh trong ngày."
                />
              </LabeledRow>
            </div>
          ))}

          <Button type="button" onClick={addTickerItem}>
            + Thêm ticker
          </Button>
        </div>
      </Section>

      {/* STATUS */}
      <Section title="Trạng thái (Online)">
        <LabeledRow label="Hiển thị status">
          <Checkbox checked={props.showStatus ?? true} onChange={(checked) => updateActive({ showStatus: checked })} />
        </LabeledRow>

        <LabeledRow label="Text status">
          <TextInput
            value={props.statusText ?? ""}
            onChange={(v) => updateActive({ statusText: v })}
            placeholder="Online"
          />
        </LabeledRow>

        <LabeledRow label="Màu chấm (hex)">
          <TextInput
            value={props.statusDotColor ?? ""}
            onChange={(v) => updateActive({ statusDotColor: v })}
            placeholder="#16a34a"
          />
        </LabeledRow>
      </Section>

      {/* LINKS */}
      <Section title="Links bên phải">
        <div style={{ marginBottom: 8 }}>
          {links.length === 0 && (
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
              Chưa có link nào. Nhấn "Thêm link" để tạo.
            </div>
          )}

          {links.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <strong style={{ fontSize: 12 }}>Link #{index + 1}</strong>
                <Button type="button" onClick={() => removeLinkItem(index)}>
                  Xóa
                </Button>
              </div>

              <LabeledRow label="Label">
                <TextInput
                  value={item.label ?? ""}
                  onChange={(v) => updateLinkItem(index, { label: v })}
                  placeholder="Hỗ trợ / Tài khoản..."
                />
              </LabeledRow>

              <LabeledRow label="Href">
                <TextInput
                  value={item.href ?? ""}
                  onChange={(v) => updateLinkItem(index, { href: v })}
                  placeholder="/support"
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

      {/* KHÁC */}
      <Section title="Khác">
        <LabeledRow label="Màu đầu gradient (g1)">
          <TextInput
            value={props.backgroundColor ?? ""}
            onChange={(v) => updateActive({ backgroundColor: v })}
            placeholder="#a7f3d0"
          />
        </LabeledRow>

        <LabeledRow label="Preview mode (chặn click link)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>
    </>
  );
};

export default TopbarGreenYellowGradient2025Editor;
