"use client";
import Image from "next/image";
import styles from "./blog-preview.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type Post = { id: string; title: string; img: string; href?: string; date?: string };
type Props = { title?: string; postsJson?: string; preview?: boolean; note?: string };

export default function BlogPreview({
  title = "BlogPreview",
  postsJson = JSON.stringify([
    { id: "p1", title: "5 cuốn sách thay đổi tư duy bán hàng", img: "https://picsum.photos/seed/blog1/800/450", href: "#", date: "2025-10-01" },
    { id: "p2", title: "Đọc nhanh mà nhớ lâu: kỹ thuật Feynman", img: "https://picsum.photos/seed/blog2/800/450", href: "#", date: "2025-10-12" },
    { id: "p3", title: "Chọn sách ngoại ngữ phù hợp trình độ", img: "https://picsum.photos/seed/blog3/800/450", href: "#", date: "2025-10-20" },
  ]),
  preview = true,
  note = "Tăng traffic SEO",
}: Props) {
  const posts: Post[] = (() => {
    try {
      const a = JSON.parse(postsJson);
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  })();
  return (
    <section className={styles.wrap}>
      <div className={styles.container}>
        <header className={styles.head}>
          <h2>{title}</h2>
          {note && <span className={styles.subtle}>{note}</span>}
        </header>
        <div className={styles.grid}>
          {posts.map((b) => (
            <a key={b.id} href={preview ? "#" : b.href || "#"} className={styles.card} onClick={(e) => preview && e.preventDefault()}>
              <div className={styles.thumb}>
                <Image alt={b.title} src={b.img} width={800} height={450} unoptimized />
              </div>
              <div className={styles.info}>
                <time>
                  <i className="bi bi-calendar-event" /> {b.date ? new Date(b.date).toLocaleDateString("vi-VN") : "—"}
                </time>
                <h3>{b.title}</h3>
                <span className={styles.more}>
                  Đọc tiếp <i className="bi bi-arrow-right" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export const BLOG_PREVIEW: RegItem = {
  kind: "BlogPreview",
  label: "Blog Preview",
  defaults: {},
  inspector: [
    { key: "title", label: "Tiêu đề", kind: "text" },
    { key: "postsJson", label: "Posts (JSON)", kind: "textarea" },
    { key: "note", label: "Ghi chú nhỏ", kind: "text" },
  ],
  render: (p) => <BlogPreview {...p} />,
};
