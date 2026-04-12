"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import type { AdminLocale } from "@/lib/admin/i18n/config";
import styles from "@/styles/admin/layouts/AdminLocaleSwitcher.module.css";

type LocaleItem = {
  value: AdminLocale;
  label: string;
  description: string;
  country: "us" | "vn" | "jp";
};

const LOCALES: LocaleItem[] = [
  {
    value: "en",
    label: "English",
    description: "United States",
    country: "us",
  },
  {
    value: "vi",
    label: "Tiếng Việt",
    description: "Việt Nam",
    country: "vn",
  },
  {
    value: "ja",
    label: "日本語",
    description: "Japan",
    country: "jp",
  },
];

export default function AdminLocaleSwitcher() {
  const router = useRouter();
  const { locale } = useAdminI18n();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const current =
    LOCALES.find((item) => item.value === locale) ?? LOCALES[0];

  async function handleChange(nextLocale: AdminLocale) {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/locale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locale: nextLocale }),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Failed to update locale");
        return;
      }

      setOpen(false);

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Locale request error:", error);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      {open && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={() => setOpen(false)}
          aria-label="Close locale menu"
        />
      )}

      <div className={styles.wrapper} ref={rootRef}>
        <button
          type="button"
          className={`${styles.trigger} ${isPending ? styles.triggerDisabled : ""}`}
          onClick={() => setOpen((prev) => !prev)}
          disabled={isPending}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className={styles.triggerLeft}>
            <span className={styles.flagBox}>
              <Image
                src={`/flags/${current.country}.png`}
                alt={current.label}
                width={22}
                height={16}
                className={styles.flagImg}
              />
            </span>

            <span className={styles.labelGroup}>
              <span className={styles.label}>{current.label}</span>
              <span className={styles.subLabel}>{current.description}</span>
            </span>
          </span>

          <span
            className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          >
            ▼
          </span>
        </button>

        {open && (
          <div className={styles.menu} role="menu" aria-label="Select language">
            {LOCALES.map((item) => {
              const isActive = item.value === locale;

              return (
                <button
                  key={item.value}
                  type="button"
                  role="menuitem"
                  className={`${styles.option} ${isActive ? styles.optionActive : ""}`}
                  onClick={() => handleChange(item.value)}
                >
                  <span className={styles.optionLeft}>
                    <span className={styles.flagBox}>
                      <Image
                        src={`/flags/${item.country}.png`}
                        alt={item.label}
                        width={22}
                        height={16}
                        className={styles.flagImg}
                      />
                    </span>

                    <span className={styles.optionText}>
                      <span className={styles.optionTitle}>{item.label}</span>
                      <span className={styles.optionDesc}>
                        {item.description}
                      </span>
                    </span>
                  </span>

                  {isActive && <span className={styles.check}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}