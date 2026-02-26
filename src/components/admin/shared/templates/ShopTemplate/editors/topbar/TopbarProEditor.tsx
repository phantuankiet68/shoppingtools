"use client";

import React from "react";
import Section from "../parts/Section";
import TextArea from "../parts/TextArea";
import TextInput from "../parts/TextInput";
import LabeledRow from "../parts/LabeledRow";
import type { TopbarMainProps } from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarMain"; // chỉnh path nếu khác

type TopbarProEditorProps = {
  props: TopbarMainProps;
  updateActive: (patch: Partial<TopbarMainProps>) => void;
};

export default function TopbarProEditor({ props, updateActive }: TopbarProEditorProps) {
  const socialLinks =
    props.socialLinks && props.socialLinks.length
      ? props.socialLinks
      : [
          { icon: "facebook" as const, href: "#" },
          { icon: "tiktok" as const, href: "#" },
          { icon: "youtube" as const, href: "#" },
        ];

  const updateSocialHref = (idx: number, href: string) => {
    const next = [...socialLinks];
    next[idx] = { ...next[idx], href };
    updateActive({ socialLinks: next });
  };

  return (
    <>
      <Section title="Màu nền">
        <LabeledRow label="Background">
          <input
            type="color"
            value={props.backgroundColor ?? "#fff8ed"}
            onChange={(e) => updateActive({ backgroundColor: e.target.value })}
            style={{ width: 168, height: 32, cursor: "pointer", border: "0" }}
          />
        </LabeledRow>
      </Section>

      <Section title="Thông điệp & Khu vực">
        <LabeledRow label="Thông điệp freeship / promo">
          <TextArea value={props.message ?? ""} onChange={(v) => updateActive({ message: v })} />
        </LabeledRow>

        <LabeledRow label="Nhãn khu vực">
          <TextInput value={props.regionLabel ?? ""} onChange={(v) => updateActive({ regionLabel: v })} />
        </LabeledRow>
      </Section>

      {/* Thông tin thương hiệu */}
      <Section title="Thông tin thương hiệu">
        <LabeledRow label="Tên thương hiệu (logo text)">
          <TextInput value={props.logoText ?? ""} onChange={(v) => updateActive({ logoText: v })} />
        </LabeledRow>
      </Section>

      {/* Liên hệ */}
      <Section title="Liên hệ">
        <LabeledRow label="Số điện thoại">
          <TextInput value={props.phoneNumber ?? ""} onChange={(v) => updateActive({ phoneNumber: v })} />
        </LabeledRow>

        <LabeledRow label="Email">
          <TextInput value={props.email ?? ""} onChange={(v) => updateActive({ email: v })} />
        </LabeledRow>
      </Section>

      {/* Mạng xã hội */}
      <Section title="Mạng xã hội">
        <LabeledRow label="Facebook URL">
          <TextInput
            value={socialLinks.find((s) => s.icon === "facebook")?.href ?? ""}
            onChange={(v) => {
              const idx = socialLinks.findIndex((s) => s.icon === "facebook");
              if (idx >= 0) updateSocialHref(idx, v);
            }}
          />
        </LabeledRow>

        <LabeledRow label="TikTok URL">
          <TextInput
            value={socialLinks.find((s) => s.icon === "tiktok")?.href ?? ""}
            onChange={(v) => {
              const idx = socialLinks.findIndex((s) => s.icon === "tiktok");
              if (idx >= 0) updateSocialHref(idx, v);
            }}
          />
        </LabeledRow>

        <LabeledRow label="YouTube URL">
          <TextInput
            value={socialLinks.find((s) => s.icon === "youtube")?.href ?? ""}
            onChange={(v) => {
              const idx = socialLinks.findIndex((s) => s.icon === "youtube");
              if (idx >= 0) updateSocialHref(idx, v);
            }}
          />
        </LabeledRow>
      </Section>

      {/* Tuỳ chọn */}
      <Section title="Tùy chọn hiển thị">
        <LabeledRow label="Giữ cố định trên đầu (sticky)">
          <input type="checkbox" checked={!!props.sticky} onChange={(e) => updateActive({ sticky: e.target.checked })} />
        </LabeledRow>
      </Section>
    </>
  );
}
