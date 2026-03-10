export type FunctionKeyCode = "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8" | "F9" | "F10" | "F11" | "F12";

export type FunctionKeyItem = {
  key: FunctionKeyCode;
  label: string;
  icon?: string;
};

export type FunctionKeyConfig = {
  action?: () => void;
  label?: string;
  icon?: string;
};

export type FunctionKeyInput = Partial<Record<FunctionKeyCode, FunctionKeyConfig | (() => void)>>;

export const functionKeys: FunctionKeyItem[] = [
  { key: "F1", label: "Help", icon: "bi-question-circle" },
  { key: "F2", label: "Preview", icon: "bi bi-eye" },
  { key: "F3", label: "Delete", icon: "bi-trash" },
  { key: "F4", label: "Refresh", icon: "bi-arrow-clockwise" },
  { key: "F5", label: "Create", icon: "bi-plus-circle" },
  { key: "F6", label: "Edit", icon: "bi bi-pencil-square" },
  { key: "F7", label: "Download", icon: "bi-download" },
  { key: "F8", label: "Import", icon: "bi-upload" },
  { key: "F9", label: "Automation", icon: "bi-save" },
  { key: "F10", label: "Update", icon: "bi-pencil-square" },
  { key: "F11", label: "Publish", icon: "bi bi-arrow-up-square" },
  { key: "F12", label: "Dashboard", icon: "bi-speedometer2" },
];

export const functionKeyMap: Record<FunctionKeyCode, FunctionKeyItem> = {
  F1: { key: "F1", label: "Help", icon: "bi-question-circle" },
  F2: { key: "F2", label: "Preview", icon: "bi bi-eye" },
  F3: { key: "F3", label: "Delete", icon: "bi-trash" },
  F4: { key: "F4", label: "Refresh", icon: "bi-arrow-clockwise" },
  F5: { key: "F5", label: "Create", icon: "bi-plus-circle" },
  F6: { key: "F6", label: "Edit", icon: "bi bi-pencil-square" },
  F7: { key: "F7", label: "Download", icon: "bi-download" },
  F8: { key: "F8", label: "Import", icon: "bi-upload" },
  F9: { key: "F9", label: "Automation", icon: "bi-save" },
  F10: { key: "F10", label: "Update", icon: "bi-pencil-square" },
  F11: { key: "F11", label: "Publish", icon: "bi bi-arrow-up-square" },
  F12: { key: "F12", label: "Dashboard", icon: "bi-speedometer2" },
};
