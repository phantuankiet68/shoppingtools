// src/components/templates/editors/TopbarProLangEditor.tsx

import React from "react";
import type {
  TopbarProLangProps,
  TopbarProLangTickerItem,
  TopbarProLangLinkItem,
  TopbarProLangSocialItem,
  TopbarProLangLanguageOption,
} from "@/components/admin/templates/ShopTemplate/Ui/topbar/TopbarProLang";

/**
 * Các component editor dưới đây là phiên bản tối giản, tự chứa.
 * Trong project thật bạn có thể thay bằng UI component sẵn có (FormRow, Input, Switch,...)
 */

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div style={{ marginBottom: 16 }}>
    <h4 style={{ margin: "8px 0" }}>{title}</h4>
    <div>{children}</div>
  </div>
);

type LabeledRowProps = {
  label: string;
  children: React.ReactNode;
};

const LabeledRow: React.FC<LabeledRowProps> = ({ label, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    }}>
    <div style={{ width: 140, fontSize: 13 }}>{label}</div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const TextInput: React.FC<TextInputProps> = ({ value, onChange, placeholder }) => (
  <input style={{ width: "100%", padding: "4px 8px", fontSize: 13 }} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
);

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />;

type TopbarProLangEditorProps = {
  props: TopbarProLangProps;
  updateActive: (patch: Partial<TopbarProLangProps>) => void;
};

const TopbarProLangEditor: React.FC<TopbarProLangEditorProps> = ({ props, updateActive }) => {
  const tickerItems = props.tickerItems ?? [];
  const helpLinks = props.helpLinks ?? [];
  const socialLinks = props.socialLinks ?? [];
  const languageOptions = props.languageOptions ?? [];

  /** Helpers cho list */

  const updateTickerItem = (index: number, patch: Partial<TopbarProLangTickerItem>) => {
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

  const updateHelpLinkItem = (index: number, patch: Partial<TopbarProLangLinkItem>) => {
    const next = helpLinks.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ helpLinks: next });
  };

  const addHelpLinkItem = () => {
    updateActive({
      helpLinks: [
        ...helpLinks,
        {
          label: "",
          href: "",
          iconClass: "",
        },
      ],
    });
  };

  const removeHelpLinkItem = (index: number) => {
    const next = helpLinks.filter((_, i) => i !== index);
    updateActive({ helpLinks: next });
  };

  const updateSocialItem = (index: number, patch: Partial<TopbarProLangSocialItem>) => {
    const next = socialLinks.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ socialLinks: next });
  };

  const addSocialItem = () => {
    updateActive({
      socialLinks: [
        ...socialLinks,
        {
          href: "",
          iconClass: "",
          ariaLabel: "",
        },
      ],
    });
  };

  const removeSocialItem = (index: number) => {
    const next = socialLinks.filter((_, i) => i !== index);
    updateActive({ socialLinks: next });
  };

  const updateLangItem = (index: number, patch: Partial<TopbarProLangLanguageOption>) => {
    const next = languageOptions.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateActive({ languageOptions: next });
  };

  const addLangItem = () => {
    updateActive({
      languageOptions: [
        ...languageOptions,
        {
          value: "",
          label: "",
        },
      ],
    });
  };

  const removeLangItem = (index: number) => {
    const next = languageOptions.filter((_, i) => i !== index);
    updateActive({ languageOptions: next });
  };

  return (
    <div>
      {/* Cấu hình cơ bản */}
      <Section title="Cấu hình chung">
        <LabeledRow label="Region label">
          <TextInput value={props.regionLabel ?? ""} onChange={(v) => updateActive({ regionLabel: v })} />
        </LabeledRow>

        <LabeledRow label="Hiện nút region">
          <Checkbox checked={props.showRegion ?? true} onChange={(checked) => updateActive({ showRegion: checked })} />
        </LabeledRow>

        <LabeledRow label="Topbar sticky">
          <Checkbox checked={props.sticky ?? false} onChange={(checked) => updateActive({ sticky: checked })} />
        </LabeledRow>

        <LabeledRow label="Preview (chặn click link)">
          <Checkbox checked={props.preview ?? false} onChange={(checked) => updateActive({ preview: checked })} />
        </LabeledRow>
      </Section>

      {/* Màu nền */}
      <Section title="Màu nền">
        <LabeledRow label="Background from">
          <TextInput value={props.backgroundFrom ?? ""} onChange={(v) => updateActive({ backgroundFrom: v })} placeholder="#fff8ed" />
        </LabeledRow>

        <LabeledRow label="Background to">
          <TextInput value={props.backgroundTo ?? ""} onChange={(v) => updateActive({ backgroundTo: v })} placeholder="#ffffff" />
        </LabeledRow>
      </Section>

      {/* Ticker */}
      <Section title="Ticker">
        <LabeledRow label="Bật ticker">
          <Checkbox checked={props.showTicker ?? true} onChange={(checked) => updateActive({ showTicker: checked })} />
        </LabeledRow>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: 8,
            marginTop: 8,
          }}>
          {tickerItems.length === 0 && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Chưa có ticker nào. Nhấn "Thêm ticker" để tạo.</div>}

          {tickerItems.map((item, index) => (
            <div
              key={index}
              style={{
                borderBottom: index === tickerItems.length - 1 ? "none" : "1px solid #f3f4f6",
                paddingBottom: 8,
                marginBottom: 8,
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}>
                <strong style={{ fontSize: 12 }}>Ticker #{index + 1}</strong>
                <button
                  type="button"
                  onClick={() => removeTickerItem(index)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#ef4444",
                    fontSize: 12,
                    cursor: "pointer",
                  }}>
                  Xóa
                </button>
              </div>

              <LabeledRow label="Badge">
                <TextInput value={item.badge ?? ""} onChange={(v) => updateTickerItem(index, { badge: v })} placeholder="NEW / SALE / GIFT..." />
              </LabeledRow>
              <LabeledRow label="Text">
                <TextInput value={item.text ?? ""} onChange={(v) => updateTickerItem(index, { text: v })} placeholder="Nội dung ticker" />
              </LabeledRow>
            </div>
          ))}

          <button
            type="button"
            onClick={addTickerItem}
            style={{
              marginTop: 4,
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
            }}>
            + Thêm ticker
          </button>
        </div>
      </Section>

      {/* Links bên phải */}
      <Section title="Links bên phải">
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: 8,
            marginTop: 8,
          }}>
          {helpLinks.length === 0 && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Chưa có link nào. Nhấn "Thêm link" để tạo.</div>}

          {helpLinks.map((item, index) => (
            <div
              key={index}
              style={{
                borderBottom: index === helpLinks.length - 1 ? "none" : "1px solid #f3f4f6",
                paddingBottom: 8,
                marginBottom: 8,
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}>
                <strong style={{ fontSize: 12 }}>Link #{index + 1}</strong>
                <button
                  type="button"
                  onClick={() => removeHelpLinkItem(index)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#ef4444",
                    fontSize: 12,
                    cursor: "pointer",
                  }}>
                  Xóa
                </button>
              </div>

              <LabeledRow label="Label">
                <TextInput value={item.label ?? ""} onChange={(v) => updateHelpLinkItem(index, { label: v })} placeholder="Trung tâm trợ giúp" />
              </LabeledRow>
              <LabeledRow label="Href">
                <TextInput value={item.href ?? ""} onChange={(v) => updateHelpLinkItem(index, { href: v })} placeholder="/help" />
              </LabeledRow>
              <LabeledRow label="Icon class">
                <TextInput value={item.iconClass ?? ""} onChange={(v) => updateHelpLinkItem(index, { iconClass: v })} placeholder="bi bi-life-preserver" />
              </LabeledRow>
            </div>
          ))}

          <button
            type="button"
            onClick={addHelpLinkItem}
            style={{
              marginTop: 4,
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
            }}>
            + Thêm link
          </button>
        </div>
      </Section>

      {/* Social links */}
      <Section title="Mạng xã hội">
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: 8,
            marginTop: 8,
          }}>
          {socialLinks.length === 0 && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Chưa có social nào. Nhấn "Thêm social" để tạo.</div>}

          {socialLinks.map((item, index) => (
            <div
              key={index}
              style={{
                borderBottom: index === socialLinks.length - 1 ? "none" : "1px solid #f3f4f6",
                paddingBottom: 8,
                marginBottom: 8,
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}>
                <strong style={{ fontSize: 12 }}>Social #{index + 1}</strong>
                <button
                  type="button"
                  onClick={() => removeSocialItem(index)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#ef4444",
                    fontSize: 12,
                    cursor: "pointer",
                  }}>
                  Xóa
                </button>
              </div>

              <LabeledRow label="Href">
                <TextInput value={item.href ?? ""} onChange={(v) => updateSocialItem(index, { href: v })} placeholder="https://facebook.com/..." />
              </LabeledRow>
              <LabeledRow label="Icon class">
                <TextInput value={item.iconClass ?? ""} onChange={(v) => updateSocialItem(index, { iconClass: v })} placeholder="bi bi-facebook" />
              </LabeledRow>
              <LabeledRow label="Aria label">
                <TextInput value={item.ariaLabel ?? ""} onChange={(v) => updateSocialItem(index, { ariaLabel: v })} placeholder="Facebook" />
              </LabeledRow>
            </div>
          ))}

          <button
            type="button"
            onClick={addSocialItem}
            style={{
              marginTop: 4,
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
            }}>
            + Thêm social
          </button>
        </div>
      </Section>

      {/* Language select */}
      <Section title="Ngôn ngữ">
        <LabeledRow label="Hiện language select">
          <Checkbox checked={props.showLanguageSelect ?? true} onChange={(checked) => updateActive({ showLanguageSelect: checked })} />
        </LabeledRow>

        <LabeledRow label="Current language value">
          <TextInput value={props.currentLanguage ?? ""} onChange={(v) => updateActive({ currentLanguage: v })} placeholder="vi" />
        </LabeledRow>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: 8,
            marginTop: 8,
          }}>
          {languageOptions.length === 0 && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Chưa có ngôn ngữ nào. Nhấn "Thêm ngôn ngữ" để tạo.</div>}

          {languageOptions.map((item, index) => (
            <div
              key={index}
              style={{
                borderBottom: index === languageOptions.length - 1 ? "none" : "1px solid #f3f4f6",
                paddingBottom: 8,
                marginBottom: 8,
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}>
                <strong style={{ fontSize: 12 }}>Ngôn ngữ #{index + 1}</strong>
                <button
                  type="button"
                  onClick={() => removeLangItem(index)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#ef4444",
                    fontSize: 12,
                    cursor: "pointer",
                  }}>
                  Xóa
                </button>
              </div>

              <LabeledRow label="Value">
                <TextInput value={item.value ?? ""} onChange={(v) => updateLangItem(index, { value: v })} placeholder="vi" />
              </LabeledRow>
              <LabeledRow label="Label">
                <TextInput value={item.label ?? ""} onChange={(v) => updateLangItem(index, { label: v })} placeholder="Tiếng Việt" />
              </LabeledRow>
            </div>
          ))}

          <button
            type="button"
            onClick={addLangItem}
            style={{
              marginTop: 4,
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
            }}>
            + Thêm ngôn ngữ
          </button>
        </div>
      </Section>
    </div>
  );
};

export default TopbarProLangEditor;
