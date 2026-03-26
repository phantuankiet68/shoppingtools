"use client";

import React, { useId, useMemo } from "react";
import Link from "next/link";
import type { Route } from "next";
import styles from "@/styles/templates/sections/Evaluate/EvaluateOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type EvaluateAccent = "green" | "emerald" | "lime" | "teal" | "mint";

export type EvaluateOneMetric = {
  id?: string;
  label: string;
  score: number;
  shortNote?: string;
  accent?: EvaluateAccent;
};

export type EvaluateOneProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  summaryLabel?: string;
  summaryScore?: number;
  summaryNote?: string;
  ctaPrimaryText?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  sectionAriaLabel?: string;
  metrics?: EvaluateOneMetric[];
  preview?: boolean;
};

const DEFAULT_METRICS: EvaluateOneMetric[] = [
  {
    id: "ui",
    label: "UI Quality",
    score: 8,
    shortNote: "Modern visual rhythm",
    accent: "green",
  },
  {
    id: "structure",
    label: "Code Structure",
    score: 8,
    shortNote: "Scalable and clean",
    accent: "emerald",
  },
  {
    id: "seo",
    label: "SEO Direct Impact",
    score: 8,
    shortNote: "Semantic page value",
    accent: "lime",
  },
  {
    id: "a11y",
    label: "Accessibility",
    score: 8,
    shortNote: "Readable and inclusive",
    accent: "teal",
  },
  {
    id: "trust",
    label: "Conversion Trust",
    score: 8,
    shortNote: "Confidence-driven UX",
    accent: "mint",
  },
];

function clampScore(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(10, value));
}

function safeMetrics(metrics?: EvaluateOneMetric[]): EvaluateOneMetric[] {
  if (!Array.isArray(metrics) || metrics.length === 0) return DEFAULT_METRICS;

  return metrics.slice(0, 5).map((item, index) => ({
    id: item.id || `metric-${index + 1}`,
    label: item.label || `Metric ${index + 1}`,
    score: clampScore(item.score),
    shortNote: item.shortNote || "Clear product-facing signal",
    accent: item.accent || DEFAULT_METRICS[index % DEFAULT_METRICS.length]?.accent || "green",
  }));
}

function averageScore(metrics: EvaluateOneMetric[]): number {
  if (!metrics.length) return 0;
  const total = metrics.reduce((sum, item) => sum + clampScore(item.score), 0);
  return Number((total / metrics.length).toFixed(1));
}

function getScoreTone(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 8) return "Strong";
  if (score >= 7) return "Well Balanced";
  if (score >= 6) return "Promising";
  return "Needs Work";
}

function getAccentClass(accent?: EvaluateAccent): string {
  switch (accent) {
    case "emerald":
      return styles.accentEmerald;
    case "lime":
      return styles.accentLime;
    case "teal":
      return styles.accentTeal;
    case "mint":
      return styles.accentMint;
    case "green":
    default:
      return styles.accentGreen;
  }
}

function ScoreOrb({ score, label }: { score: number; label: string }) {
  const normalized = clampScore(score);
  const degrees = (normalized / 10) * 360;

  return (
    <div
      className={styles.scoreOrb}
      style={{ "--evaluate-progress": `${degrees}deg` } as React.CSSProperties}
      aria-label={`${label}: ${normalized} out of 10`}
    >
      <div className={styles.scoreOrbInner}>
        <strong className={styles.scoreValue}>{normalized.toFixed(1)}</strong>
        <span className={styles.scoreTotal}>/10</span>
      </div>
    </div>
  );
}

export function EvaluateOne({
  eyebrow = "EXPERT EVALUATION",
  title = "A fresh review layout built for premium trust, clarity, and conversion readiness",
  subtitle = "A more modern evaluation section with a cleaner hierarchy, stronger green brand presence, and a more memorable visual identity.",
  badgeText = "Senior Front-End Review",
  summaryLabel = "Overall Score",
  summaryScore,
  summaryNote = "A compact expert snapshot that balances aesthetics, technical structure, discoverability, accessibility, and buyer confidence.",
  ctaPrimaryText = "Request Full Audit",
  ctaPrimaryHref = "/contact",
  ctaSecondaryText = "Explore Case Studies",
  ctaSecondaryHref = "/cases",
  sectionAriaLabel = "Evaluation overview",
  metrics,
  preview = false,
}: EvaluateOneProps) {
  const regionId = useId();
  const normalizedMetrics = useMemo(() => safeMetrics(metrics), [metrics]);
  const computedScore = useMemo(() => averageScore(normalizedMetrics), [normalizedMetrics]);
  const finalScore = typeof summaryScore === "number" ? clampScore(summaryScore) : computedScore;

  const headingId = `${regionId}-evaluate-title`;
  const descId = `${regionId}-evaluate-description`;

  const onPreviewClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!preview) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const renderLink = (href: string, children: React.ReactNode, className?: string, ariaLabel?: string) => {
    if (preview) {
      return (
        <a href="#" onClick={onPreviewClick} className={className} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }

    return (
      <Link href={(href || "/") as Route} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  };

  return (
    <section
      className={styles.section}
      aria-label={sectionAriaLabel}
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      <div className={styles.container}>
        <div className={styles.shell}>
          <div className={styles.hero}>
            <div className={styles.backdropGlow} aria-hidden="true" />
            <div className={styles.noise} aria-hidden="true" />

            <div className={styles.copyColumn}>
              <div className={styles.topline}>
                <span className={styles.badge}>{badgeText}</span>
                <p className={styles.eyebrow}>{eyebrow}</p>
              </div>

              <h2 id={headingId} className={styles.title}>
                {title}
              </h2>

              <p id={descId} className={styles.subtitle}>
                {subtitle}
              </p>

              <div className={styles.proofRow} aria-label="Evaluation highlights">
                <span className={styles.proofPill}>Design-led</span>
                <span className={styles.proofPill}>Conversion-aware</span>
                <span className={styles.proofPill}>SEO-conscious</span>
              </div>

              <div className={styles.ctaRow}>
                {renderLink(
                  ctaPrimaryHref,
                  <span>{ctaPrimaryText}</span>,
                  `${styles.cta} ${styles.ctaPrimary}`,
                  ctaPrimaryText,
                )}

                {renderLink(
                  ctaSecondaryHref,
                  <span>{ctaSecondaryText}</span>,
                  `${styles.cta} ${styles.ctaSecondary}`,
                  ctaSecondaryText,
                )}
              </div>
            </div>

            <aside className={styles.reviewPanel} aria-label="Evaluation summary">
              <div className={styles.reviewTop}>
                <div>
                  <p className={styles.reviewLabel}>{summaryLabel}</p>
                  <h3 className={styles.reviewHeading}>Expert Snapshot</h3>
                </div>

                <span className={styles.reviewTone}>{getScoreTone(finalScore)}</span>
              </div>

              <div className={styles.scoreSection}>
                <ScoreOrb score={finalScore} label={summaryLabel} />

                <div className={styles.scoreMeta}>
                  <p className={styles.scoreLead}>
                    Balanced performance across product presentation and technical quality.
                  </p>
                  <p className={styles.scoreNote}>{summaryNote}</p>
                </div>
              </div>

              <div className={styles.metricGrid}>
                {normalizedMetrics.map((metric, index) => {
                  const score = clampScore(metric.score);

                  return (
                    <article
                      key={metric.id || `${metric.label}-${index}`}
                      className={`${styles.metricCard} ${getAccentClass(metric.accent)}`}
                      aria-label={`${metric.label}: ${score} out of 10`}
                    >
                      <div className={styles.metricHead}>
                        <span className={styles.metricLabel}>{metric.label}</span>
                        <span className={styles.metricScore}>{score.toFixed(1)}</span>
                      </div>

                      <div className={styles.metricTrack} aria-hidden="true">
                        <span className={styles.metricFill} style={{ width: `${(score / 10) * 100}%` }} />
                      </div>

                      <p className={styles.metricNote}>{metric.shortNote}</p>
                    </article>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

export const SHOP_EVALUATE_ONE: RegItem = {
  kind: "EvaluateOne",
  label: "Evaluate One",
  defaults: {
    eyebrow: "EXPERT EVALUATION",
    title: "A fresh review layout built for premium trust, clarity, and conversion readiness",
    subtitle:
      "A more modern evaluation section with a cleaner hierarchy, stronger green brand presence, and a more memorable visual identity.",
    badgeText: "Senior Front-End Review",
    summaryLabel: "Overall Score",
    summaryScore: 8,
    summaryNote:
      "A compact expert snapshot that balances aesthetics, technical structure, discoverability, accessibility, and buyer confidence.",
    ctaPrimaryText: "Request Full Audit",
    ctaPrimaryHref: "/contact",
    ctaSecondaryText: "Explore Case Studies",
    ctaSecondaryHref: "/cases",
    metrics: JSON.stringify(DEFAULT_METRICS, null, 2),
  },
  inspector: [
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "title", label: "Title", kind: "textarea", rows: 4 },
    { key: "subtitle", label: "Subtitle", kind: "textarea", rows: 4 },
    { key: "badgeText", label: "Badge text", kind: "text" },
    { key: "summaryLabel", label: "Summary label", kind: "text" },
    { key: "summaryScore", label: "Summary score", kind: "number" },
    { key: "summaryNote", label: "Summary note", kind: "textarea", rows: 4 },
    { key: "ctaPrimaryText", label: "Primary CTA text", kind: "text" },
    { key: "ctaPrimaryHref", label: "Primary CTA URL", kind: "text" },
    { key: "ctaSecondaryText", label: "Secondary CTA text", kind: "text" },
    { key: "ctaSecondaryHref", label: "Secondary CTA URL", kind: "text" },
    { key: "metrics", label: "Metrics (JSON)", kind: "textarea", rows: 14 },
  ],
  render: (props) => {
    let parsedMetrics: EvaluateOneMetric[] | undefined;

    try {
      parsedMetrics = props.metrics ? (JSON.parse(String(props.metrics)) as EvaluateOneMetric[]) : undefined;
    } catch {
      parsedMetrics = undefined;
    }

    return (
      <div className="sectionContainer" aria-label="Evaluate One">
        <EvaluateOne
          eyebrow={String(props.eyebrow || "EXPERT EVALUATION")}
          title={String(
            props.title || "A fresh review layout built for premium trust, clarity, and conversion readiness",
          )}
          subtitle={String(
            props.subtitle ||
              "A more modern evaluation section with a cleaner hierarchy, stronger green brand presence, and a more memorable visual identity.",
          )}
          badgeText={String(props.badgeText || "Senior Front-End Review")}
          summaryLabel={String(props.summaryLabel || "Overall Score")}
          summaryScore={Number(props.summaryScore ?? 8)}
          summaryNote={String(
            props.summaryNote ||
              "A compact expert snapshot that balances aesthetics, technical structure, discoverability, accessibility, and buyer confidence.",
          )}
          ctaPrimaryText={String(props.ctaPrimaryText || "Request Full Audit")}
          ctaPrimaryHref={String(props.ctaPrimaryHref || "/contact")}
          ctaSecondaryText={String(props.ctaSecondaryText || "Explore Case Studies")}
          ctaSecondaryHref={String(props.ctaSecondaryHref || "/cases")}
          metrics={parsedMetrics}
          preview={true}
        />
      </div>
    );
  },
};

export default EvaluateOne;
