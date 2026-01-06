// app/(admin)/menu/components/AllowedBlocks.tsx
"use client";

import React from "react";
import { useMenuStore } from "@/components/admin/menu/state/useMenuStore";
import styles from "@/styles/admin/menu/menu.module.css";

type TabKey = "home" | "dashboard";

function isTabbedConfig(v: unknown): v is { home: string[]; dashboard: string[] } {
  return !!v && typeof v === "object" && !Array.isArray(v) && Array.isArray((v as any).home) && Array.isArray((v as any).dashboard);
}

export default function AllowedBlocks() {
  const { TEMPLATE_ALLOWED, templateKey, activeMenu, setActiveMenu, addBlankItem, INTERNAL_PAGES, siteKind } = useMenuStore();

  const tpl = TEMPLATE_ALLOWED[templateKey];
  const hasTabs = isTabbedConfig(tpl);
  const [tab, setTab] = React.useState<TabKey>("home");

  const baseNames: string[] = React.useMemo(() => {
    if (!tpl) return [];
    if (Array.isArray(tpl)) return tpl;
    return tab === "dashboard" ? tpl.dashboard : tpl.home;
  }, [tpl, tab]);

  const SUGGEST = React.useMemo(() => {
    const out: Record<string, string[]> = {};

    if (siteKind === "ecommerce") {
      out["Khám phá"] = ["Tìm kiếm", "Danh mục", "Bộ sưu tập", "Bán chạy"];
      out["Nội dung & SEO"] = ["Hướng dẫn mua hàng", "Về chúng tôi", "Câu hỏi thường gặp"];
      out["CSKH & Chính sách"] = ["Vận chuyển", "Đổi trả & Hoàn tiền", "Hệ thống cửa hàng"];
      out["Mua hàng"] = ["Giỏ hàng", "Thanh toán"];
    }
    if (siteKind === "corporate") {
      out["Giới thiệu mở rộng"] = ["Tầm nhìn & Sứ mệnh", "Lịch sử hình thành", "Đội ngũ lãnh đạo", "Giá trị cốt lõi", "Đối tác & Khách hàng"];
      out["Dịch vụ & Giải pháp"] = ["Tư vấn chiến lược", "Thiết kế & Sáng tạo", "Phát triển phần mềm", "Chuyển đổi số", "Hạ tầng IT & Bảo mật"];
      out["Tuyển dụng & Văn hóa"] = ["Văn hóa doanh nghiệp", "Đời sống công ty", "Chính sách nhân sự", "Tin tuyển dụng"];
      out["CSKH & Chính sách"] = ["Liên hệ nhanh", "FAQ - Câu hỏi thường gặp", "Chính sách bảo mật", "Điều khoản sử dụng"];
    }

    if (siteKind === "education") {
      out["Khóa học & Lộ trình"] = ["Khóa học miễn phí", "Khóa học nổi bật", "Lộ trình luyện thi", "Chứng chỉ & Thành tích"];

      out["Tương tác học viên"] = ["Forum thảo luận", "Câu hỏi thường gặp (FAQ)", "Gửi Issue / Báo lỗi", "Đề xuất bài học mới"];

      out["Quản lý & Cá nhân hóa"] = ["Calendar", "Mind Map", "Profile", "Dashboard cá nhân", "Cài đặt thông báo"];

      out["Truyền thông & SEO"] = ["Blog", "Tin tức học tập", "Sự kiện & Workshop", "Hướng dẫn đăng ký"];
    }

    return out;
  }, [siteKind]);

  const existingTitles = React.useMemo(() => {
    const all: string[] = [];
    const walk = (arr: any[]) => {
      arr.forEach((n) => {
        if (n?.title) all.push(String(n.title).toLowerCase().trim());
        if (n?.children?.length) walk(n.children);
      });
    };
    walk(activeMenu || []);
    return new Set(all);
  }, [activeMenu]);

  const findPageByName = React.useCallback(
    (name: string) => {
      const needle = name
        .toLowerCase()
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
        .trim();

      return INTERNAL_PAGES.find((p) => {
        const pool = [p.label, p.labelVi, ...(p.aliases || [])].filter(Boolean).map((s) => String(s).toLowerCase().trim());
        return pool.includes(needle);
      });
    },
    [INTERNAL_PAGES]
  );

  const addByName = React.useCallback(
    (name: string) => {
      const page = findPageByName(name);
      const item = {
        id: `s_${Math.random().toString(36).slice(2, 9)}`,
        title: name,
        icon: "",
        linkType: "internal" as const,
        externalUrl: "",
        newTab: false,
        internalPageId: page?.id ?? "home",
        rawPath: page?.path ?? (page ? null : "/"),
        schedules: [] as any[],
        children: [] as any[],
      };
      setActiveMenu([...(activeMenu || []), item]);
    },
    [activeMenu, findPageByName, setActiveMenu]
  );

  function onDragStart(e: React.DragEvent, name: string) {
    const page = findPageByName(name);
    const payload = page ? { type: "new", name, linkType: "internal" as const, internalPageId: page.id } : { type: "new", name, linkType: "internal" as const, internalPageId: "home" };
    const json = JSON.stringify(payload);
    e.dataTransfer.setData("application/json", json);
    e.dataTransfer.setData("text/plain", json);
    e.dataTransfer.effectAllowed = "copy";
  }

  const filteredSuggest = React.useMemo(() => {
    const out: Record<string, string[]> = {};
    const baseSet = new Set(baseNames.map((s) => s.toLowerCase().trim()));

    Object.entries(SUGGEST).forEach(([group, arr]) => {
      const items = arr.filter((name) => {
        const k = name.toLowerCase().trim();
        return !baseSet.has(k) && !existingTitles.has(k);
      });
      if (items.length) out[group] = items;
    });

    return out;
  }, [SUGGEST, baseNames, existingTitles]);

  return (
    <div className={styles.cardform}>
      <div className={styles.cardHeader}>
        <button className={`${styles.btn} ${styles.btnOutlineLight}`} onClick={addBlankItem}>
          <i className="bi bi-plus-lg" /> Thêm item trống
        </button>

        {hasTabs && (
          <div className={styles.tabs}>
            <button type="button" onClick={() => setTab("home")} className={`${styles.btn} ${tab === "home" ? styles.btnOutlinePrimary : styles.btnOutlineLight}`} aria-pressed={tab === "home"}>
              Home
            </button>

            <button
              type="button"
              onClick={() => setTab("dashboard")}
              className={`${styles.btn} ${tab === "dashboard" ? styles.btnOutlinePrimary : styles.btnOutlineLight}`}
              aria-pressed={tab === "dashboard"}>
              Dashboard
            </button>
          </div>
        )}
      </div>

      {/* ============ GRID MỤC CHÍNH ============ */}
      <div className={styles.blocksGrid}>
        {baseNames.map((n) => (
          <div key={n} className={styles.blockCell}>
            <div className={`${styles.blockCard} ${styles.appCard}`} draggable onDragStart={(e) => onDragStart(e, n)} onClick={() => addByName(n)} title="Kéo thả hoặc nhấn để thêm vào Menu">
              <div className={styles.blockIconWrap}>
                <i className="bi bi-cursor" />
              </div>
              <div>
                <div className={styles.blockTitle}>{n}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      <section aria-label="Gợi ý mở rộng menu" style={{ display: "grid", gap: 12 }}>
        {Object.keys(filteredSuggest).length === 0 ? (
          <div className={styles.smallHelp}>Không còn gợi ý nào — bạn đã đầy đủ mục quan trọng rồi 🎉</div>
        ) : (
          Object.entries(filteredSuggest).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>{group}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {items.map((name) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => addByName(name)}
                    onDragStart={(e) => onDragStart(e as any, name)}
                    draggable
                    className={styles.btn}
                    style={{
                      borderRadius: 20,
                      border: "1px dashed var(--bd,#cbd5e1)",
                      background: "var(--chip-bg,rgba(16,185,129,.08))",
                      padding: "6px 10px",
                      fontSize: 13,
                    }}
                    title="Nhấn để thêm, hoặc kéo thả vào cấu trúc">
                    <i className="bi bi-plus-lg" style={{ marginRight: 6 }} />
                    {name}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <div className={styles.divider} />
    </div>
  );
}
