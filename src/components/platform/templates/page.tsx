'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/platform/templates/page.module.css';
import NewTemplateModal from '@/components/platform/templates/NewTemplateModal';
import NewGroupModal from '@/components/platform/templates/NewGroupModal';

type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type AccessTier = 'BASIC' | 'NORMAL' | 'PRO';

type TemplateGroup = {
  id: string;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  minTier: AccessTier;
  minTierLevel: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    templates: number;
  };
};

type TemplateCatalog = {
  id: string;
  code: string;
  name: string;
  kind: string;
  groupId: string;
  status: TemplateStatus;
  previewImageUrl?: string;
  initialProps?: unknown | null;
  blocks?: unknown | null;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  minTier: AccessTier;
  minTierLevel: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  group?: TemplateGroup;
};

type TemplateListResponse = {
  success: boolean;
  data: TemplateCatalog[];
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
};

type GroupListResponse = {
  success: boolean;
  data: TemplateGroup[];
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
};

const statusOptions: TemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const tierOptions: AccessTier[] = ['BASIC', 'NORMAL', 'PRO'];

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

function getStatusLabel(status: TemplateStatus) {
  switch (status) {
    case 'PUBLISHED':
      return 'Published';
    case 'DRAFT':
      return 'Draft';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return status;
  }
}

function getTierTone(tier: AccessTier) {
  switch (tier) {
    case 'BASIC':
      return styles.tierBasic;
    case 'NORMAL':
      return styles.tierNormal;
    case 'PRO':
      return styles.tierPro;
    default:
      return '';
  }
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateCatalog[]>([]);
  const [groups, setGroups] = useState<TemplateGroup[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [publicOnly, setPublicOnly] = useState(false);

  const [openNewTemplate, setOpenNewTemplate] = useState(false);
  const [openNewGroup, setOpenNewGroup] = useState(false);

  const fetchTemplateGroups = async () => {
    try {
      setLoadingGroups(true);

      const response = await fetch('/api/platform/templates/template-groups', {
        method: 'GET',
        cache: 'no-store',
      });

      const result: GroupListResponse = await response.json().catch(() => ({
        success: false,
        data: [],
        message: 'Invalid response',
      }));

      if (!response.ok || !result.success) {
        console.error('Failed to fetch template groups:', result);
        setGroups([]);
        return;
      }

      setGroups(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Fetch template groups error:', error);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);

      const response = await fetch('/api/platform/templates?page=1&pageSize=100', {
        method: 'GET',
        cache: 'no-store',
      });

      const result: TemplateListResponse = await response.json().catch(() => ({
        success: false,
        data: [],
        message: 'Invalid response',
      }));

      if (!response.ok || !result.success) {
        console.error('Failed to fetch templates:', result);
        setTemplates([]);
        return;
      }

      setTemplates(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Fetch templates error:', error);
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchTemplateGroups();
    fetchTemplates();
  }, []);

  const groupMap = useMemo(() => {
    return groups.reduce<Record<string, TemplateGroup>>((acc, group) => {
      acc[group.id] = group;
      return acc;
    }, {});
  }, [groups]);

  const filteredTemplates = useMemo(() => {
    return [...templates]
      .filter((item) => {
        const q = keyword.trim().toLowerCase();
        if (!q) return true;

        return (
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.kind.toLowerCase().includes(q) ||
          groupMap[item.groupId]?.name.toLowerCase().includes(q)
        );
      })
      .filter((item) => (selectedGroupId === 'all' ? true : item.groupId === selectedGroupId))
      .filter((item) => (selectedStatus === 'all' ? true : item.status === selectedStatus))
      .filter((item) => (selectedTier === 'all' ? true : item.minTier === selectedTier))
      .filter((item) => (publicOnly ? item.isPublic : true))
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [groupMap, keyword, publicOnly, selectedGroupId, selectedStatus, selectedTier, templates]);

  const stats = useMemo(() => {
    return {
      totalTemplates: templates.length,
      totalGroups: groups.length,
      published: templates.filter((item) => item.status === 'PUBLISHED').length,
      drafts: templates.filter((item) => item.status === 'DRAFT').length,
      archived: templates.filter((item) => item.status === 'ARCHIVED').length,
      publicCount: templates.filter((item) => item.isPublic).length,
    };
  }, [groups.length, templates]);

  return (
    <div className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />

      <header className={styles.hero}>
        <div className={styles.heroActions}>
          <button className={styles.ghostButton} onClick={() => setOpenNewGroup(true)} type="button">
            <i className="bi bi-grid-3x3-gap" />
            New Group
          </button>

          <button className={styles.primaryButton} onClick={() => setOpenNewTemplate(true)} type="button">
            <i className="bi bi-plus-lg" />
            New Template
          </button>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <i className={`bi bi-search ${styles.searchIcon}`} />
            <input
              className={styles.searchInput}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name, code, kind..."
            />
          </div>

          <div className={styles.filterActions}>
            <select
              className={styles.select}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {getStatusLabel(item)}
                </option>
              ))}
            </select>

            <select
              className={styles.select}
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
            >
              <option value="all">All Tiers</option>
              {tierOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label className={styles.checkWrap}>
              <input
                type="checkbox"
                checked={publicOnly}
                onChange={(e) => setPublicOnly(e.target.checked)}
              />
              <span>Public only</span>
            </label>
          </div>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconIndigo}`}>
            <i className="bi bi-layout-text-window-reverse" />
          </div>
          <div>
            <div className={styles.statValue}>{stats.totalTemplates}</div>
            <div className={styles.statLabel}>Templates</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSky}`}>
            <i className="bi bi-collection" />
          </div>
          <div>
            <div className={styles.statValue}>{stats.totalGroups}</div>
            <div className={styles.statLabel}>Groups</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <i className="bi bi-check2-circle" />
          </div>
          <div>
            <div className={styles.statValue}>{stats.published}</div>
            <div className={styles.statLabel}>Published</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
            <i className="bi bi-pencil-square" />
          </div>
          <div>
            <div className={styles.statValue}>{stats.drafts}</div>
            <div className={styles.statLabel}>Drafts</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSlate}`}>
            <i className="bi bi-archive" />
          </div>
          <div>
            <div className={styles.statValue}>{stats.archived}</div>
            <div className={styles.statLabel}>Archived</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconRose}`}>
            <i className="bi bi-globe2" />
          </div>
          <div>
            <div className={styles.statValue}>{stats.publicCount}</div>
            <div className={styles.statLabel}>Public</div>
          </div>
        </div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHead}>
              <div>
                <div className={styles.sidebarTitle}>Template Groups</div>
              </div>

              <button className={styles.moreButton} type="button">
                <i className="bi bi-three-dots" />
              </button>
            </div>

            <div className={styles.groupList}>
              <button
                className={`${styles.groupItem} ${selectedGroupId === 'all' ? styles.groupItemActive : ''}`}
                onClick={() => setSelectedGroupId('all')}
                type="button"
              >
                <div className={styles.groupItemMain}>
                  <div className={styles.groupItemIcon}>
                    <i className="bi bi-stars" />
                  </div>
                  <div>
                    <div className={styles.groupName}>All Groups</div>
                    <div className={styles.groupMeta}>Hiển thị toàn bộ template</div>
                  </div>
                </div>
                <span className={styles.groupCount}>{templates.length}</span>
              </button>

              {loadingGroups ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyTitle}>Đang tải groups...</div>
                </div>
              ) : (
                groups.map((group) => {
                  const count = templates.filter((item) => item.groupId === group.id).length;

                  return (
                    <button
                      key={group.id}
                      className={`${styles.groupItem} ${selectedGroupId === group.id ? styles.groupItemActive : ''}`}
                      onClick={() => setSelectedGroupId(group.id)}
                      type="button"
                    >
                      <div className={styles.groupItemMain}>
                        <div className={styles.groupItemIcon}>
                          <i className="bi bi-folder2-open" />
                        </div>
                        <div>
                          <div className={styles.groupName}>{group.name}</div>
                          <div className={styles.groupMeta}>
                            {group.minTier} · Level {group.minTierLevel}
                          </div>
                        </div>
                      </div>
                      <span className={styles.groupCount}>{count}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.panel}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Group</th>
                    <th>Status</th>
                    <th>Access</th>
                    <th>Visibility</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingTemplates ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyTitle}>Đang tải template...</div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTemplates.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyIcon}>
                            <i className="bi bi-inboxes" />
                          </div>
                          <div className={styles.emptyTitle}>Không có template phù hợp</div>
                          <div className={styles.emptyText}>
                            Hãy thử thay đổi filter hoặc từ khóa tìm kiếm.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTemplates.map((template) => {
                      const group = groupMap[template.groupId] || template.group;

                      return (
                        <tr key={template.id}>
                          <td>
                            <div className={styles.templateInfo}>
                              <div className={styles.templateThumb}>
                                <i className="bi bi-window-sidebar" />
                              </div>

                              <div className={styles.templateText}>
                                <div className={styles.templateTitle}>{template.name}</div>
                                <div className={styles.templateCode}>
                                  {template.code} · {template.kind}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className={styles.softBadge}>
                              <i className="bi bi-folder2-open" />
                              {group?.name ?? '-'}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                template.status === 'PUBLISHED'
                                  ? styles.statusPublished
                                  : template.status === 'DRAFT'
                                    ? styles.statusDraft
                                    : styles.statusArchived
                              }`}
                            >
                              {getStatusLabel(template.status)}
                            </span>
                          </td>

                          <td>
                            <div className={styles.accessCell}>
                              <span className={`${styles.tierBadge} ${getTierTone(template.minTier)}`}>
                                {template.minTier}
                              </span>
                              <span className={styles.levelBadge}>Lv.{template.minTierLevel}</span>
                            </div>
                          </td>

                          <td>
                            <div className={styles.visibility}>
                              <span
                                className={`${styles.visibilityDot} ${
                                  template.isPublic ? styles.publicDot : styles.privateDot
                                }`}
                              />
                              <span>{template.isPublic ? 'Public' : 'Private'}</span>
                            </div>
                          </td>

                          <td>
                            <span className={styles.dateText}>{formatDate(template.updatedAt)}</span>
                          </td>

                          <td>
                            <div className={styles.rowActions}>
                              <button className={styles.iconAction} title="Preview" type="button">
                                <i className="bi bi-eye" />
                              </button>
                              <button className={styles.iconAction} title="Edit" type="button">
                                <i className="bi bi-pencil-square" />
                              </button>
                              <button className={styles.iconAction} title="Duplicate" type="button">
                                <i className="bi bi-copy" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </section>

      <NewTemplateModal
        open={openNewTemplate}
        groups={groups}
        onClose={() => setOpenNewTemplate(false)}
        onCreated={() => {
          fetchTemplates();
        }}
      />

      <NewGroupModal
        open={openNewGroup}
        onClose={() => setOpenNewGroup(false)}
        onCreated={() => {
          fetchTemplateGroups();
        }}
      />
    </div>
  );
}