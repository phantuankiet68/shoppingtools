"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import cls from "@/styles/admin/templates/header/header-skystack.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HeaderSkyStackProps = {
  brandTitle?: string;
  brandSub?: string;
  badge?: string;
  announcement?: string;
  preview?: boolean;
};

export default function HeaderSkyStack({
  brandTitle = "SkyStack Cloud",
  brandSub = "Deploy • Scale • Ship",
  badge = "SS",
  announcement = "Launching SkyStack Functions (beta) — free 50k invocations/month.",
  preview = false,
}: HeaderSkyStackProps) {
  // Theme toggle logic
  useEffect(() => {
    const themeBtn = document.getElementById("themeBtn");
    const html = document.documentElement;

    const setTheme = (dark: boolean) => {
      html.setAttribute("data-theme", dark ? "dark" : "light");
      if (themeBtn) themeBtn.innerHTML = dark ? '<i class="bi bi-brightness-high"></i>' : '<i class="bi bi-moon"></i>';
    };

    themeBtn?.addEventListener("click", () => setTheme(html.getAttribute("data-theme") !== "dark"));

    return () => themeBtn?.removeEventListener("click", () => {});
  }, []);

  const stop = (e: React.SyntheticEvent) => {
    if (preview) e.preventDefault();
  };

  return (
    <>
      {/* ===== Announcement ===== */}
      <div className={cls.tdAnnounce}>
        <div className="container py-1 d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div className="small">
            <strong>New:</strong> <span style={{ color: "var(--td-primary)" }}>{announcement}</span>
          </div>
          <a href="#" className={`btn btn-sm ${cls.btnGhost}`} onClick={stop}>
            <i className="bi bi-fire"></i> Learn more
          </a>
        </div>
      </div>

      {/* ===== Header ===== */}
      <header className={cls.tdHeader}>
        <div className="container py-2 d-flex align-items-center gap-3">
          {/* Mobile toggler */}
          <button className="btn btn-outline-secondary d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#tdNav">
            <i className="bi bi-list"></i>
          </button>

          {/* Brand */}
          <Link href="#" className={cls.tdBrand} onClick={stop}>
            <div className={cls.tdLogo}>{badge}</div>
            <div className={cls.tdTitle}>
              {brandTitle}
              <small>{brandSub}</small>
            </div>
          </Link>

          {/* Nav (desktop) */}
          <nav className={`${cls.tdNav} ms-auto`}>
            <ul className="nav align-items-center">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  Product
                </a>
                <div className="dropdown-menu mt-2">
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <div className={cls.ddTitle}>Platform</div>
                      <a href="#" className={cls.ddLink} onClick={stop}>
                        <div className={cls.ddIco}>
                          <i className="bi bi-cloud-upload"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Deploy</div>
                          <p className={cls.ddSub}>Zero-downtime, multi-region</p>
                        </div>
                      </a>
                      <a href="#" className={cls.ddLink} onClick={stop}>
                        <div className={cls.ddIco}>
                          <i className="bi bi-cpu"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Functions</div>
                          <p className={cls.ddSub}>Serverless, event-driven</p>
                        </div>
                      </a>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className={cls.ddTitle}>Data</div>
                      <a href="#" className={cls.ddLink} onClick={stop}>
                        <div className={cls.ddIco}>
                          <i className="bi bi-hdd-network"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Database</div>
                          <p className={cls.ddSub}>Postgres + Vector Store</p>
                        </div>
                      </a>
                      <a href="#" className={cls.ddLink} onClick={stop}>
                        <div className={cls.ddIco}>
                          <i className="bi bi-shield-lock"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Auth</div>
                          <p className={cls.ddSub}>SSO, OAuth, RBAC</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  Solutions
                </a>
                <ul className="dropdown-menu mt-2">
                  <li>
                    <a className="dropdown-item" href="#">
                      AI Apps
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Mobile Backend
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      E-commerce
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      SaaS Analytics
                    </a>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  Pricing
                </a>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  Resources
                </a>
                <ul className="dropdown-menu mt-2">
                  <li>
                    <a className="dropdown-item" href="#">
                      Docs
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Tutorials
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Changelog
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Community
                    </a>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <button className={`btn ${cls.btnGhost}`}>
                  <i className="bi bi-command"></i> Command (⌘/Ctrl + K)
                </button>
              </li>

              <li className="nav-item ms-2">
                <a className={`btn ${cls.btnGhost}`} href="#">
                  <i className="bi bi-box-arrow-in-right"></i> Sign in
                </a>
              </li>
              <li className="nav-item ms-2">
                <a className={`btn ${cls.btnCta}`} href="#">
                  <i className="bi bi-rocket-takeoff"></i> Start free
                </a>
              </li>

              <li className="nav-item ms-2">
                <button id="themeBtn" className={`btn ${cls.btnGhost}`} type="button">
                  <i className="bi bi-moon"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}

/* ========= RegItem ========= */
export const HEADER_SKYSTACK: RegItem = {
  kind: "HeaderSkyStack",
  label: "Header SkyStack",
  defaults: {
    brandTitle: "SkyStack Cloud",
    brandSub: "Deploy • Scale • Ship",
    badge: "SS",
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "brandSub", label: "Brand Subtitle", kind: "text" },
    { key: "badge", label: "Logo Badge", kind: "text" },
    { key: "announcement", label: "Announcement Text", kind: "text" },
  ],
  render: (p) => <HeaderSkyStack {...p} preview={true} />,
};
