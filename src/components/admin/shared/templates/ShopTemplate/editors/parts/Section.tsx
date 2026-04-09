"use client";

import React from "react";
import cls from "@/styles/admin/pages/inspector.module.css";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function Section({ title, children }: Props) {
  return (
    <div className={cls.section}>
      <div className={cls.sectionHeadSimple}>
        <span className={cls.sectionTitle}>{title}</span>
      </div>
      <div className={cls.sectionBody}>{children}</div>
    </div>
  );
}
