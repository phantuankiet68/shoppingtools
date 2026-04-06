'use client';

import styles from '@/styles/admin/settings/page.module.css';
import SectionHeader from './SectionHeader';

type Props = {
  title: string;
};

export default function PlaceholderTab({ title }: Props) {
  return (
    <div className={styles.panelBody}>
      <section className={styles.sectionBlock}>
        <SectionHeader
          title={title}
          description="Tab này bạn có thể tiếp tục gắn form thật theo module của hệ thống."
        />
      </section>
    </div>
  );
}