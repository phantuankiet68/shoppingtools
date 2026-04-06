'use client';

import { ReactNode } from 'react';
import styles from '@/styles/admin/settings/page.module.css';

type SectionHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function SectionHeader({
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerGlow} />

      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.iconWrap}>
            <div className={styles.iconBox}>
              <i className="bi bi-envelope-paper" />
            </div>
          </div>

          <div className={styles.textBlock}>
            <div className={styles.badge}>Configuration</div>
            <h2 className={styles.title}>{title}</h2>
            {description ? (
              <p className={styles.description}>{description}</p>
            ) : null}
          </div>
        </div>

        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </div>
  );
}