"use client";
import styles from "@/styles/admin/layouts/Browser.module.css";
import { useEffect, useState } from "react";

const apps = [
  {
    name: "Google",
    icon: "bi-google",
    color: "linear-gradient(135deg, #88d6ff, #26bbff)",
    url: "https://google.com",
    views: 1240,
    likes: 320,
  },
  {
    name: "Facebook",
    icon: "bi-facebook",
    color: "linear-gradient(135deg, #88d6ff, #26bbff)",
    url: "https://facebook.com",
    views: 980,
    likes: 210,
  },
  {
    name: "TikTok",
    icon: "bi-tiktok",
    color: "#000000",
    url: "https://tiktok.com",
    views: 2100,
    likes: 860,
  },
  {
    name: "Email",
    icon: "bi-envelope-fill",
    color: "#EA4335",
    url: "mailto:",
    views: 300,
    likes: 90,
  },
   {
    name: "Browser",
    icon: "bi bi-browser-chrome",
    color: "rgb(71 239 155)",
    url: "https://tiktok.com",
    views: 2100,
    likes: 860,
  },
  {
    name: "Email",
    icon: "bi-envelope-fill",
    color: "#EA4335",
    url: "mailto:",
    views: 300,
    likes: 90,
  },
];

export default function Browser() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {apps.map((app, index) => (
          <a
            key={index}
            href={app.url}
            target="_blank"
            className={styles.appCard}
          >
            {/* ICON */}
            <div
              className={styles.icon}
              style={{ background: app.color }}
            >
              <i className={`bi ${app.icon}`}></i>
            </div>

            {/* INFO */}
            <div className={styles.info}>
              <span className={styles.name}>{app.name}</span>
              <span className={styles.sub}>Open app</span>

              {/* METRICS */}
              <div className={styles.metrics}>
                <span>👁 {app.views}</span>
                <span>❤️ {app.likes}</span>
              </div>
            </div>

            {/* ACTION */}
            <div className={styles.action}>→</div>
          </a>
        ))}
      </div>
  </div>
  );
}