// src/components/templates/editors/parts/Checkbox.tsx
import React from "react";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, className, disabled = false }) => {
  const classes = ["editor-checkbox", className].filter(Boolean).join(" ");

  return <input type="checkbox" className={classes} checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />;
};

export default Checkbox;
