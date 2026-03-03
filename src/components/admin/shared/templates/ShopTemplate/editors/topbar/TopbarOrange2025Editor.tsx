"use client";

import React from "react";
import Section from "../parts/Section";
import TextArea from "../parts/TextArea";
import TextInput from "../parts/TextInput";
import LabeledRow from "../parts/LabeledRow";
import { JsonListEditor } from "../JsonListEditor";
import type {
  TopbarOrange2025Props,
  TopbarOrangeTickerItem,
  TopbarOrangeLink,
} from "@/components/admin/shared/templates/ShopTemplate/Ui/topbar/TopbarOrange2025";

import {
  TOPBAR_ORANGE_DEFAULT_TICKERS,
  TOPBAR_ORANGE_DEFAULT_LINKS,
} from "@/components/admin/shared/templates/ShopTemplate/Ui/topbar/TopbarOrange2025";

type TopbarOrange2025EditorProps = {
  props: TopbarOrange2025Props;
  updateActive: (patch: Partial<TopbarOrange2025Props>) => void;
};

const TopbarOrange2025Editor: React.FC<TopbarOrange2025EditorProps> = ({ props, updateActive }) => {
  // fallback giống TopbarProEditor
  const tickerItems: TopbarOrangeTickerItem[] = props.tickerItems ?? TOPBAR_ORANGE_DEFAULT_TICKERS;

  const links: TopbarOrangeLink[] = props.links ?? TOPBAR_ORANGE_DEFAULT_LINKS;

  const safeParseArray = <T,>(json: string | undefined): T[] => {
    if (!json) return [];
    try {
      const v = JSON.parse(json);
      return Array.isArray(v) ? (v as T[]) : [];
    } catch {
      return [];
    }
  };

  return (
    <>
      <Section title="Brand & khu vực">
        <LabeledRow label="Brand title">
          <TextInput value={props.brandTitle ?? ""} onChange={(v) => updateActive({ brandTitle: v })} />
        </LabeledRow>

        <LabeledRow label="Brand subtitle">
          <TextInput value={props.brandSubtitle ?? ""} onChange={(v) => updateActive({ brandSubtitle: v })} />
        </LabeledRow>

        <LabeledRow label="Prefix khu vực (vd: KV:)">
          <TextInput value={props.regionPrefix ?? ""} onChange={(v) => updateActive({ regionPrefix: v })} />
        </LabeledRow>

        <LabeledRow label="Tên khu vực">
          <TextInput value={props.regionValue ?? ""} onChange={(v) => updateActive({ regionValue: v })} />
        </LabeledRow>
      </Section>

      <Section title="Ticker">
        <LabeledRow label="News label">
          <TextInput value={props.newsLabel ?? ""} onChange={(v) => updateActive({ newsLabel: v })} />
        </LabeledRow>

        <JsonListEditor<TopbarOrangeTickerItem>
          label="Danh sách ticker (text + tag)"
          json={JSON.stringify(tickerItems, null, 2)}
          onChangeJson={(nextJson) => {
            const arr = safeParseArray<TopbarOrangeTickerItem>(nextJson);
            updateActive({ tickerItems: arr });
          }}
          fields={[
            { key: "text", label: "Text", placeholder: "Nội dung ticker" },
            { key: "tag", label: "Tag", placeholder: "VD: Hot / New" },
          ]}
          makeDefaultItem={() => ({
            text: "",
            tag: "",
          })}
        />
      </Section>

      <Section title="Links & trạng thái">
        <JsonListEditor<TopbarOrangeLink>
          label="Danh sách links (label + href + icon)"
          json={JSON.stringify(links, null, 2)}
          onChangeJson={(nextJson) => {
            const arr = safeParseArray<TopbarOrangeLink>(nextJson);
            updateActive({ links: arr });
          }}
          fields={[
            { key: "label", label: "Label", placeholder: "VD: Hỗ trợ" },
            { key: "href", label: "Href", placeholder: "#" },
            {
              key: "icon",
              label: "Bootstrap icon class",
              placeholder: "vd: bi-truck",
            },
          ]}
          makeDefaultItem={() => ({
            label: "",
            href: "#",
            icon: "",
          })}
        />

        <LabeledRow label="Hiện trạng thái Online">
          <TextInput
            value={props.showStatus ? "true" : "false"}
            onChange={(val) => updateActive({ showStatus: val === "true" || val === "1" })}
          />
        </LabeledRow>

        <LabeledRow label="Status text">
          <TextInput value={props.statusText ?? ""} onChange={(v) => updateActive({ statusText: v })} />
        </LabeledRow>

        <LabeledRow label="Màu nền">
          <input
            type="color"
            value={props.backgroundColor ?? "#f97316"}
            onChange={(e) => updateActive({ backgroundColor: e.target.value })}
            style={{ width: 50, height: 32, cursor: "pointer" }}
          />
        </LabeledRow>
      </Section>
    </>
  );
};

export default TopbarOrange2025Editor;
