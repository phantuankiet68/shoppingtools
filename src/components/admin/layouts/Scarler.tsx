"use client";

import styles from "@/styles/admin/layouts/Scarler.module.css";
import { useEffect, useState } from "react";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

export default function Scarler() {
  const { t } = useAdminI18n();

  const [temp, setTemp] = useState<number>(25);
  const [isOn, setIsOn] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`
      );

      if (!res.ok) throw new Error("Weather API failed");

      const data = await res.json();
      const temperature = data?.current?.temperature_2m;

      if (temperature !== undefined) {
        setTemp(Math.round(temperature));
      } else {
        throw new Error("No temperature data");
      }
    } catch (err: any) {
      setError("error");
      setTemp(30);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("error");
      setLoading(false);
      return;
    }

    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((permission) => {
        if (permission.state === "denied") {
          setError("error");
          fetchWeather(10.8231, 106.6297);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            fetchWeather(latitude, longitude);
          },
          () => {
            setError("error");
            fetchWeather(10.8231, 106.6297);
          }
        );
      });
  }, []);

  const increase = () => setTemp((t) => Math.min(40, t + 1));
  const decrease = () => setTemp((t) => Math.max(5, t - 1));

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2>{t("scarler.home")}</h2>

        <div className={styles.info}>
          <span>💧 53%</span>

          <span>
            🌡{" "}
            {loading
              ? "..."
              : error
              ? "--"
              : `${temp}°C`}
          </span>

          <select className={styles.select}>
            <option>{t("scarler.livingRoom")}</option>
          </select>
        </div>
      </div>

      {/* DEVICES */}
      <div className={styles.devices}>
        <Device title={t("scarler.devices.refrigerator")} active t={t} />
        <Device title={t("scarler.devices.temperature")} active highlight t={t} />
        <Device title={t("scarler.devices.conditioner")} active={false} t={t} />
        <Device title={t("scarler.devices.lights")} active={false} t={t} />
      </div>

      {/* CONTROL */}
      <div className={styles.neoCard}>
        <div className={styles.neoHeader}>
          <div>
            <p className={styles.room}>{t("scarler.livingRoom")}</p>
            <h3 className={styles.title}>{t("scarler.devices.temperature")}</h3>
          </div>

          <div className={styles.right}>
            <span>💧 53%</span>

            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={isOn}
                onChange={() => setIsOn(!isOn)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.neoControl}>
          <button onClick={decrease} className={styles.neoBtn}>
            −
          </button>

          <div className={styles.circleWrap}>
            <div className={styles.ticks}></div>

            <div
              className={styles.circle}
              style={{
                background: `conic-gradient(#3abaedff ${(temp / 40) * 100}%, #e5e7eb 0%)`,
              }}
            >
              <div className={styles.inner}>
                <span className={styles.goal}>
                  {loading
                    ? t("scarler.loading")
                    : error
                    ? t("scarler.error")
                    : t("scarler.goal")}
                </span>
                <h1>{temp}°C</h1>
              </div>
            </div>

            <div
              className={styles.dot}
              style={{
                transform: `rotate(${(temp / 40) * 360}deg) translate(90px)`,
              }}
            />
          </div>

          <button onClick={increase} className={styles.neoBtnPrimary}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}

/* DEVICE */
function Device({
  title,
  active,
  highlight,
  t,
}: {
  title: string;
  active: boolean;
  highlight?: boolean;
  t: any;
}) {
  return (
    <div
      className={`${styles.device} ${
        highlight ? styles.highlight : ""
      }`}
    >
      <div className={styles.deviceTop}>
        <span>{active ? t("scarler.on") : t("scarler.off")}</span>
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