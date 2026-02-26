"use client";

import React from "react";
import Section from "../parts/Section";
import TextArea from "../parts/TextArea";
import TextInput from "../parts/TextInput";
import LabeledRow from "../parts/LabeledRow";
import { JsonListEditor } from "../JsonListEditor";

type FooterProProps = {
  addressHtml?: string;
  legalJson?: string;
  payIcons?: string;
  socialsJson?: string;
};

type FooterProEditorProps = {
  props: FooterProProps;
  updateActive: (patch: Partial<FooterProProps>) => void;
};

export default function FooterProEditor({ props, updateActive }: FooterProEditorProps) {
  return (
    <>
      <Section title="Địa chỉ (HTML)">
        <TextArea value={props.addressHtml ?? ""} onChange={(v) => updateActive({ addressHtml: v })} />
      </Section>

      <JsonListEditor
        label="Links pháp lý"
        json={props.legalJson}
        onChangeJson={(v) => updateActive({ legalJson: v })}
        fields={[
          { key: "text", label: "Text" },
          { key: "href", label: "Href" },
        ]}
        makeDefaultItem={() => ({ text: "Link mới", href: "#" })}
      />

      <JsonListEditor
        label="Mạng xã hội"
        json={props.socialsJson}
        onChangeJson={(v) => updateActive({ socialsJson: v })}
        fields={[
          { key: "text", label: "Tên" },
          { key: "href", label: "Link" },
        ]}
        makeDefaultItem={() => ({ text: "Facebook", href: "#" })}
      />

      <Section title="Icons thanh toán (csv)">
        <TextInput value={props.payIcons ?? ""} onChange={(v) => updateActive({ payIcons: v })} />
      </Section>
    </>
  );
}
