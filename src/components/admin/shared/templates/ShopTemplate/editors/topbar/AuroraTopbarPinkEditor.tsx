"use client";

import React from "react";
import Section from "../parts/Section";
import TextArea from "../parts/TextArea";
import TextInput from "../parts/TextInput";
import LabeledRow from "../parts/LabeledRow";
import type { AuroraTopbarPinkProps, AuroraTopbarTickerItem } from "@/components/admin/templates/ShopTemplate/Ui/topbar/AuroraTopbarPink";

type AuroraTopbarPinkEditorProps = {
  props: AuroraTopbarPinkProps;
  updateActive: (patch: Partial<AuroraTopbarPinkProps>) => void;
};

const DEFAULT_TICKER: AuroraTopbarTickerItem[] = [
  { text: "Khuyến mãi 30% cho bộ sưu tập mới.", tag: "Hot" },
  { text: "Sản phẩm mới cập bến tuần này.", tag: "New" },
  { text: "Hỗ trợ khách hàng 24/7.", tag: "Support" },
];

export default function AuroraTopbarPinkEditor({ props, updateActive }: AuroraTopbarPinkEditorProps) {
  const tickerItems = props.tickerItems && props.tickerItems.length ? props.tickerItems : DEFAULT_TICKER;

  const updateTicker = (idx: number, patch: Partial<AuroraTopbarTickerItem>) => {
    const next = [...tickerItems];
    next[idx] = { ...next[idx], ...patch };
    updateActive({ tickerItems: next });
  };

  return (
    <>
      {/* BRAND */}
      <Section title="Brand">
        <LabeledRow label="Tiêu đề brand">
          <TextInput value={props.brandTitle ?? ""} onChange={(v) => updateActive({ brandTitle: v })} />
        </LabeledRow>

        <LabeledRow label="Mô tả brand">
          <TextArea value={props.brandSubtitle ?? ""} onChange={(v) => updateActive({ brandSubtitle: v })} />
        </LabeledRow>
      </Section>

      {/* REGION */}
      <Section title="Khu vực">
        <LabeledRow label="Prefix vùng (VD: KV:)">
          <TextInput value={props.regionPrefix ?? ""} onChange={(v) => updateActive({ regionPrefix: v })} />
        </LabeledRow>

        <LabeledRow label="Tên vùng">
          <TextInput value={props.regionLocation ?? ""} onChange={(v) => updateActive({ regionLocation: v })} />
        </LabeledRow>

        <LabeledRow label="Hiện nút chọn vùng">
          <input type="checkbox" checked={props.showRegionButton ?? true} onChange={(e) => updateActive({ showRegionButton: e.target.checked })} />
        </LabeledRow>
      </Section>

      {/* TICKER */}
      <Section title="Ticker">
        <LabeledRow label="Label ticker">
          <TextInput value={props.tickerLabel ?? ""} onChange={(v) => updateActive({ tickerLabel: v })} />
        </LabeledRow>

        <LabeledRow label="Hiện ticker">
          <input type="checkbox" checked={props.showTicker ?? true} onChange={(e) => updateActive({ showTicker: e.target.checked })} />
        </LabeledRow>

        {tickerItems.map((item, idx) => (
          <div key={idx} style={{ marginBottom: 12, paddingLeft: 8 }}>
            <LabeledRow label={`Ticker #${idx + 1} – text`}>
              <TextInput value={item.text} onChange={(v) => updateTicker(idx, { text: v })} />
            </LabeledRow>

            <LabeledRow label={`Ticker #${idx + 1} – tag`}>
              <TextInput value={item.tag} onChange={(v) => updateTicker(idx, { tag: v })} />
            </LabeledRow>
          </div>
        ))}
      </Section>

      {/* LINKS */}
      <Section title="Liên kết bên phải">
        <LabeledRow label="Link hỗ trợ">
          <TextInput value={props.supportHref ?? ""} onChange={(v) => updateActive({ supportHref: v })} />
        </LabeledRow>

        <LabeledRow label="Text hỗ trợ">
          <TextInput value={props.supportLabel ?? ""} onChange={(v) => updateActive({ supportLabel: v })} />
        </LabeledRow>

        <LabeledRow label="Link theo dõi đơn">
          <TextInput value={props.trackHref ?? ""} onChange={(v) => updateActive({ trackHref: v })} />
        </LabeledRow>

        <LabeledRow label="Text theo dõi đơn">
          <TextInput value={props.trackLabel ?? ""} onChange={(v) => updateActive({ trackLabel: v })} />
        </LabeledRow>

        <LabeledRow label="Link tài khoản">
          <TextInput value={props.accountHref ?? ""} onChange={(v) => updateActive({ accountHref: v })} />
        </LabeledRow>

        <LabeledRow label="Text tài khoản">
          <TextInput value={props.accountLabel ?? ""} onChange={(v) => updateActive({ accountLabel: v })} />
        </LabeledRow>
      </Section>

      {/* STATUS */}
      <Section title="Status">
        <LabeledRow label="Hiện badge Online">
          <input type="checkbox" checked={props.showStatus ?? true} onChange={(e) => updateActive({ showStatus: e.target.checked })} />
        </LabeledRow>

        <LabeledRow label="Text status">
          <TextInput value={props.statusText ?? ""} onChange={(v) => updateActive({ statusText: v })} />
        </LabeledRow>
      </Section>
    </>
  );
}
