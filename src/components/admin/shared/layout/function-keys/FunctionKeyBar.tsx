"use client";

import styles from "@/styles/admin/layouts/Topbar.module.css";
import FunctionKeyButton from "./FunctionKeyButton";
import { FunctionKeyCode, FunctionKeyItem } from "./functionKeys";

type Props = {
  items: FunctionKeyItem[];
  onClick?: (key: FunctionKeyCode) => void;
};

export default function FunctionKeyBar({ items, onClick }: Props) {
  return (
    <div className={styles.functionBar}>
      <div className={styles.functionGrid}>
        {items.map((item) => (
          <FunctionKeyButton
            key={item.key}
            hotkey={item.key}
            label={item.label}
            icon={item.icon}
            onClick={() => onClick?.(item.key)}
          />
        ))}
      </div>
    </div>
  );
}
