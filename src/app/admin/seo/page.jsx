'use client';

import { useMemo, useState } from 'react';
import styles from '@/styles/admin/seo/page.module.css';

const initialData = {
  seoTitle: 'Landing Page Chuyen Nghiep Chuan SEO | Nova Studio',
  metaDescription:
    'Thiet ke landing page hien dai, toi uu chuyen doi, chuan SEO va phu hop xu huong giao dien moi cho doanh nghiep.',
  slug: 'landing-page-seo',
  canonicalUrl: 'https://yourdomain.com/landing-page-seo',
  focusKeyword: 'landing page chuan seo',
  ogTitle: 'Landing Page Chuan SEO & Tang Chuyen Doi',
  ogDescription:
    'Giai phap landing page moi, dep, ro noi dung, thu hut nguoi dung va ho tro SEO hieu qua.',
  ogImage: 'https://yourdomain.com/og-image.jpg',
  schemaType: 'Organization',
  allowIndex: true,
  allowFollow: true,
  includeSitemap: true,
  forceCanonical: false,
  notes: '',
};

const sections = [
  { id: 'general', label: 'General', icon: 'bi-grid-1x2' },
  { id: 'social', label: 'Social Share', icon: 'bi-share' },
  { id: 'indexing', label: 'Indexing', icon: 'bi-globe2' },
  { id: 'schema', label: 'Schema', icon: 'bi-braces-asterisk' },
  { id: 'notes', label: 'Notes', icon: 'bi-journal-text' },
  { id: 'preview', label: 'Preview', icon: 'bi-eye' },
];

function clampScore(value) {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export default function SeoAdminPage() {
  const [form, setForm] = useState(initialData);
  const [activeSection, setActiveSection] = useState('general');

  const titleLength = form.seoTitle.trim().length;
  const descriptionLength = form.metaDescription.trim().length;
  const ogTitleLength = form.ogTitle.trim().length;
  const ogDescriptionLength = form.ogDescription.trim().length;

  const seoScore = useMemo(() => {
    let score = 0;

    if (titleLength >= 30 && titleLength <= 60) score += 25;
    else if (titleLength > 0) score += 12;

    if (descriptionLength >= 120 && descriptionLength <= 160) score += 25;
    else if (descriptionLength > 0) score += 12;

    if (form.slug.trim()) score += 10;
    if (form.canonicalUrl.trim()) score += 10;
    if (form.focusKeyword.trim()) score += 10;
    if (form.allowIndex) score += 5;
    if (form.allowFollow) score += 5;
    if (form.includeSitemap) score += 5;
    if (form.ogTitle.trim()) score += 3;
    if (form.ogDescription.trim()) score += 2;

    return clampScore(score);
  }, [
    titleLength,
    descriptionLength,
    form.slug,
    form.canonicalUrl,
    form.focusKeyword,
    form.allowIndex,
    form.allowFollow,
    form.includeSitemap,
    form.ogTitle,
    form.ogDescription,
  ]);

  const scoreTone =
    seoScore >= 85 ? 'excellent' : seoScore >= 70 ? 'good' : seoScore >= 50 ? 'fair' : 'weak';

  const scoreLabel =
    seoScore >= 85 ? 'Excellent' : seoScore >= 70 ? 'Good' : seoScore >= 50 ? 'Needs work' : 'Poor';

  const robotsValue = `${form.allowIndex ? 'index' : 'noindex'}, ${form.allowFollow ? 'follow' : 'nofollow'}`;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('SEO SETTINGS:', form);
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brandCard}>
            <div className={styles.brandTop}>
              <div className={styles.brandMark}>S</div>
              <div>
                <p className={styles.eyebrow}>Admin panel</p>
                <h1 className={styles.pageTitle}>SEO Manager</h1>
              </div>
            </div>

            <p className={styles.pageIntro}>
              Cau hinh SEO cho landing page theo bo cuc hien dai, ro rang va chuyen nghiep hon.
            </p>
          </div>

          <div className={styles.navCard}>
            <div className={styles.cardHead}>
              <span>Sections</span>
            </div>

            <nav className={styles.navList}>
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`${styles.navItem} ${activeSection === section.id ? styles.navItemActive : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  <span className={styles.navItemLeft}>
                    <i className={`bi ${section.icon}`}></i>
                    {section.label}
                  </span>
                  <i className="bi bi-chevron-right"></i>
                </button>
              ))}
            </nav>
          </div>

          <div className={styles.scoreCard} data-tone={scoreTone}>
            <div className={styles.cardHead}>
              <span>SEO score</span>
              <strong>{seoScore}/100</strong>
            </div>

            <div className={styles.scoreBar}>
              <div className={styles.scoreBarFill} style={{ width: `${seoScore}%` }} />
            </div>

            <div className={styles.scoreMeta}>
              <span>{scoreLabel}</span>
              <span>{robotsValue}</span>
            </div>
          </div>

          <div className={styles.miniStats}>
            <div className={styles.miniStat}>
              <span>Title</span>
              <strong>{titleLength}</strong>
            </div>
            <div className={styles.miniStat}>
              <span>Description</span>
              <strong>{descriptionLength}</strong>
            </div>
            <div className={styles.miniStat}>
              <span>OG</span>
              <strong>{form.ogTitle ? 'Ready' : 'Empty'}</strong>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.stickyBar}>
              <div>
                <p className={styles.stickyLabel}>Landing page SEO</p>
                <h2 className={styles.stickyTitle}>Settings overview</h2>
              </div>

              <div className={styles.stickyActions}>
                <button type="button" className={styles.ghostButton}>
                  <i className="bi bi-arrow-counterclockwise"></i>
                  Reset
                </button>
                <button type="submit" className={styles.primaryButton}>
                  <i className="bi bi-check2-circle"></i>
                  Save Changes
                </button>
              </div>
            </div>

            <section id="general" className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelKicker}>Core setup</p>
                  <h3>General SEO</h3>
                </div>
                <span className={styles.panelHint}>Search result basics</span>
              </div>

              <div className={styles.grid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="seoTitle">SEO Title</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="seoTitle"
                      type="text"
                      value={form.seoTitle}
                      onChange={(e) => updateField('seoTitle', e.target.value)}
                      placeholder="Nhap tieu de SEO"
                    />
                    <span className={styles.counter}>{titleLength}/60</span>
                  </div>
                  <small className={titleLength > 60 ? styles.warning : ''}>
                    Khuyen nghi trong khoang 50-60 ky tu.
                  </small>
                </div>

                <div className={styles.field}>
                  <label htmlFor="slug">Slug</label>
                  <div className={styles.prefixInput}>
                    <span>yourdomain.com/</span>
                    <input
                      id="slug"
                      type="text"
                      value={form.slug}
                      onChange={(e) => updateField('slug', e.target.value)}
                      placeholder="landing-page-seo"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="focusKeyword">Focus Keyword</label>
                  <input
                    id="focusKeyword"
                    type="text"
                    value={form.focusKeyword}
                    onChange={(e) => updateField('focusKeyword', e.target.value)}
                    placeholder="landing page chuan seo"
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="metaDescription">Meta Description</label>
                  <div className={styles.textareaWrap}>
                    <textarea
                      id="metaDescription"
                      rows="5"
                      value={form.metaDescription}
                      onChange={(e) => updateField('metaDescription', e.target.value)}
                      placeholder="Nhap mo ta ngan cho trang"
                    />
                    <span className={styles.counter}>{descriptionLength}/160</span>
                  </div>
                  <small className={descriptionLength > 160 ? styles.warning : ''}>
                    Khuyen nghi trong khoang 140-160 ky tu.
                  </small>
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="canonicalUrl">Canonical URL</label>
                  <input
                    id="canonicalUrl"
                    type="text"
                    value={form.canonicalUrl}
                    onChange={(e) => updateField('canonicalUrl', e.target.value)}
                    placeholder="https://yourdomain.com/landing-page-seo"
                  />
                </div>
              </div>
            </section>

            <section id="social" className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelKicker}>Share preview</p>
                  <h3>Social Share</h3>
                </div>
                <span className={styles.panelHint}>Facebook, Zalo, chat apps</span>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="ogTitle">OG Title</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="ogTitle"
                      type="text"
                      value={form.ogTitle}
                      onChange={(e) => updateField('ogTitle', e.target.value)}
                      placeholder="Open Graph title"
                    />
                    <span className={styles.counter}>{ogTitleLength}</span>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="ogImage">OG Image URL</label>
                  <input
                    id="ogImage"
                    type="text"
                    value={form.ogImage}
                    onChange={(e) => updateField('ogImage', e.target.value)}
                    placeholder="https://yourdomain.com/og-image.jpg"
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="ogDescription">OG Description</label>
                  <div className={styles.textareaWrap}>
                    <textarea
                      id="ogDescription"
                      rows="4"
                      value={form.ogDescription}
                      onChange={(e) => updateField('ogDescription', e.target.value)}
                      placeholder="Open Graph description"
                    />
                    <span className={styles.counter}>{ogDescriptionLength}</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="indexing" className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelKicker}>Robots control</p>
                  <h3>Indexing & Sitemap</h3>
                </div>
                <span className={styles.panelHint}>Crawler rules</span>
              </div>

              <div className={styles.toggleGrid}>
                <label className={styles.switchCard}>
                  <div>
                    <strong>Allow Indexing</strong>
                    <span>Cho phep cong cu tim kiem index trang nay</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.allowIndex}
                    onChange={(e) => updateField('allowIndex', e.target.checked)}
                  />
                </label>

                <label className={styles.switchCard}>
                  <div>
                    <strong>Allow Follow</strong>
                    <span>Cho phep bot theo doi lien ket trong trang</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.allowFollow}
                    onChange={(e) => updateField('allowFollow', e.target.checked)}
                  />
                </label>

                <label className={styles.switchCard}>
                  <div>
                    <strong>Include in Sitemap</strong>
                    <span>Dua page vao sitemap.xml</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.includeSitemap}
                    onChange={(e) => updateField('includeSitemap', e.target.checked)}
                  />
                </label>

                <label className={styles.switchCard}>
                  <div>
                    <strong>Force Canonical</strong>
                    <span>Uu tien canonical khi co URL trung lap</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.forceCanonical}
                    onChange={(e) => updateField('forceCanonical', e.target.checked)}
                  />
                </label>
              </div>
            </section>

            <section id="schema" className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelKicker}>Structured data</p>
                  <h3>Schema</h3>
                </div>
                <span className={styles.panelHint}>Search enhancement</span>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="schemaType">Schema Type</label>
                  <div className={styles.selectWrap}>
                    <select
                      id="schemaType"
                      value={form.schemaType}
                      onChange={(e) => updateField('schemaType', e.target.value)}
                    >
                      <option value="Organization">Organization</option>
                      <option value="Article">Article</option>
                      <option value="Product">Product</option>
                      <option value="Service">Service</option>
                      <option value="WebPage">WebPage</option>
                    </select>
                    <i className="bi bi-chevron-down"></i>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Robots Output</label>
                  <div className={styles.readonlyBox}>{robotsValue}</div>
                </div>
              </div>
            </section>

            <section id="notes" className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelKicker}>Internal use</p>
                  <h3>Notes</h3>
                </div>
                <span className={styles.panelHint}>Team comments</span>
              </div>

              <div className={styles.grid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="notes">SEO Notes</label>
                  <textarea
                    id="notes"
                    rows="5"
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Ghi chu cho editor, marketer hoac SEO team..."
                  />
                </div>
              </div>
            </section>

            <section id="preview" className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelKicker}>Live preview</p>
                  <h3>Preview</h3>
                </div>
                <span className={styles.panelHint}>SERP + social card</span>
              </div>

              <div className={styles.previewGrid}>
                <div className={styles.previewCard}>
                  <div className={styles.previewTop}>
                    <span className={styles.previewBadge}>Google Preview</span>
                  </div>

                  <div className={styles.googlePreview}>
                    <span className={styles.googleUrl}>
                      https://yourdomain.com/{form.slug || 'your-page'}
                    </span>
                    <h4>{form.seoTitle || 'SEO title preview'}</h4>
                    <p>{form.metaDescription || 'Meta description preview will appear here.'}</p>
                  </div>
                </div>

                <div className={styles.previewCard}>
                  <div className={styles.previewTop}>
                    <span className={styles.previewBadge}>Social Preview</span>
                  </div>

                  <div className={styles.socialPreview}>
                    <div className={styles.socialThumb}>
                      <span>OG IMAGE</span>
                    </div>
                    <div className={styles.socialBody}>
                      <small>yourdomain.com</small>
                      <h4>{form.ogTitle || 'OG title preview'}</h4>
                      <p>{form.ogDescription || 'OG description preview will appear here.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}