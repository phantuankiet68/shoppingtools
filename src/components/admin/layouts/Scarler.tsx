"use client";
import styles from "@/styles/admin/layouts/Scarler.module.css";
import { useState, useEffect } from "react";

export default function Scarler() {
  const [temp, setTemp] = useState(25);
  const [isOn, setIsOn] = useState(true);

  const increase = () => setTemp((t) => Math.min(35, t + 1));
  const decrease = () => setTemp((t) => Math.max(5, t - 1));
useEffect(() => {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    const data = await res.json();

    if (data.current_weather) {
      setTemp(Math.round(data.current_weather.temperature));
    }
  });
}, []);
  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2>Scarlett’s Home</h2>

        <div className={styles.info}>
          <span>💧 35%</span>
          <span>🌡 15°C</span>

          <select className={styles.select}>
            <option>Living Room</option>
          </select>
        </div>
      </div>

      <div className={styles.devices}>
        <Device title="Refrigerator" active={true} />
        <Device title="Temperature" active={true} highlight />
        <Device title="Conditioner" active={false} />
        <Device title="Lights" active={false} />
      </div>

      <div className={styles.control}>
        <div className={styles.controlHeader}>
          <div className={styles.title}>
            ⚡ <span>Living Room Temperature</span>
          </div>

          <label className={styles.switch}>
            <span>{isOn ? "ON" : "OFF"}</span>
            <input
              type="checkbox"
              checked={isOn}
              onChange={() => setIsOn(!isOn)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
        <div className={styles.tempWrapper}>
          <button onClick={decrease} className={styles.btn}>
            −
          </button>
          <div
            className={styles.circle}
            style={{
              background: `conic-gradient(#7cd8fb ${
                (temp / 40) * 100
              }%, #e5e7eb 0%)`,
            }}
          >
            <div className={styles.inner}>
              <span className={styles.temp}>{temp}°C</span>
              <span className={styles.label}>Celsius</span>
            </div>
          </div>

          <button onClick={increase} className={styles.btnPrimary}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}

/* DEVICE COMPONENT */
function Device({
  title,
  active,
  highlight,
}: {
  title: string;
  active: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`${styles.device} ${
        highlight ? styles.highlight : ""
      }`}
    >
      <div className={styles.deviceTop}>
        <span>{active ? "ON" : "OFF"}</span>
        <div
          className={`${styles.toggle} ${
            active ? styles.toggleActive : ""
          }`}
        />
      </div>

      <div className={styles.deviceBody}>
        <div className={styles.icon}>⚡</div>
        <span>{title}</span>
      </div>
    </div>
  );
}