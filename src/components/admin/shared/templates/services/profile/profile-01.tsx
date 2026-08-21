'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import type { InspectorField, RegItem } from '@/lib/ui-builder/types';
import models from '@/components/admin/shared/templates/services/profile/styles/models.module.css';
import styles from '@/components/admin/shared/templates/services/profile/styles/profile-01.module.css';
export type WebsiteType = 'landing' | 'blog' | 'ecommerce' | 'booking' | 'lms';
export type ProjectStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProjectModel extends ProjectSummaryModel {
    profileId: string;
    description: string | null;
    publishedAt: Date | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    rejectReason: string | null;
}
interface UploadResponse {
    success: boolean;
    message: string;
    image: string;
}

export interface ProjectSummaryModel {
    id: string;
    name: string;
    slug: string;
    websiteType: WebsiteType;
    thumbnail: string | null;
    logo: string | null;
    domain: string | null;
    status: ProjectStatus;
    isPublished: boolean;
    totalViews: number;
    totalTemplates: number;
    storageUsed: bigint;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProjectRequest {
    name: string;
    slug: string;
    websiteType: WebsiteType;
    description: string | null;
    logo: string | null;
    thumbnail: string | null;
    domain: string | null;
}

export interface UpdateProjectRequest {
    name: string;
    slug: string;
    description: string | null;
}

export interface CreateProjectModalProps extends Partial<Profile01Props> {
    open: boolean;
    onClose: () => void;
    onCreated?: (project: ProjectModel) => void;
}

export interface Profile01Props {
    generalTitle?: LocalizedText;
    generalDescription?: LocalizedText;

    firstNameLabel?: LocalizedText;
    firstNamePlaceholder?: LocalizedText;

    lastNameLabel?: LocalizedText;
    lastNamePlaceholder?: LocalizedText;

    usernameLabel?: LocalizedText;
    usernamePlaceholder?: LocalizedText;

    emailLabel?: LocalizedText;
    emailPlaceholder?: LocalizedText;

    phoneLabel?: LocalizedText;
    phonePlaceholder?: LocalizedText;

    companyLabel?: LocalizedText;
    companyPlaceholder?: LocalizedText;

    websiteLabel?: LocalizedText;
    websitePlaceholder?: LocalizedText;

    locationLabel?: LocalizedText;
    locationPlaceholder?: LocalizedText;

    bioLabel?: LocalizedText;
    bioPlaceholder?: LocalizedText;

    genderLabel?: LocalizedText;
    selectGenderPlaceholder?: LocalizedText;
    genderMale?: LocalizedText;
    genderFemale?: LocalizedText;
    genderOther?: LocalizedText;

    dateOfBirthLabel?: LocalizedText;

    monthPlaceholder?: LocalizedText;
    dayPlaceholder?: LocalizedText;
    yearPlaceholder?: LocalizedText;

    monthJanuary?: LocalizedText;
    monthFebruary?: LocalizedText;
    monthMarch?: LocalizedText;
    monthApril?: LocalizedText;
    monthMay?: LocalizedText;
    monthJune?: LocalizedText;
    monthJuly?: LocalizedText;
    monthAugust?: LocalizedText;
    monthSeptember?: LocalizedText;
    monthOctober?: LocalizedText;
    monthNovember?: LocalizedText;
    monthDecember?: LocalizedText;

    statusLabel?: LocalizedText;
    statusActive?: LocalizedText;
    statusVerified?: LocalizedText;

    languageLabel?: LocalizedText;
    languageEnglish?: LocalizedText;
    languageVietnamese?: LocalizedText;
    languageJapanese?: LocalizedText;

    timezoneLabel?: LocalizedText;
    timezoneVietnam?: LocalizedText;
    timezoneJapan?: LocalizedText;
    timezoneUtc?: LocalizedText;

    avatarSectionTitle?: LocalizedText;
    avatarSectionDescription?: LocalizedText;

    uploadAvatarButton?: LocalizedText;
    removeAvatarButton?: LocalizedText;

    logoSectionTitle?: LocalizedText;
    logoSectionDescription?: LocalizedText;

    uploadLogoButton?: LocalizedText;
    removeLogoButton?: LocalizedText;

    saveButton?: LocalizedText;
    cancelButton?: LocalizedText;
    savingButton?: LocalizedText;

    /* ==========================================================
   Create Project Modal
========================================================== */

    createProjectTitle?: LocalizedText;
    createProjectDescription?: LocalizedText;

    projectNameLabel?: LocalizedText;
    projectNamePlaceholder?: LocalizedText;

    projectSlugLabel?: LocalizedText;
    projectSlugPlaceholder?: LocalizedText;

    websiteTypeLabel?: LocalizedText;

    websiteTypeLanding?: LocalizedText;
    websiteTypeBlog?: LocalizedText;
    websiteTypeEcommerce?: LocalizedText;
    websiteTypeBooking?: LocalizedText;
    websiteTypeLms?: LocalizedText;

    projectDomainLabel?: LocalizedText;
    projectDomainPlaceholder?: LocalizedText;

    projectDescriptionLabel?: LocalizedText;
    projectDescriptionPlaceholder?: LocalizedText;

    projectLogoLabel?: LocalizedText;
    projectLogoAlt?: LocalizedText;

    projectThumbnailLabel?: LocalizedText;
    projectThumbnailAlt?: LocalizedText;

    uploadThumbnailButton?: LocalizedText;

    uploadingLogoButton?: LocalizedText;
    uploadingThumbnailButton?: LocalizedText;

    createProjectButton?: LocalizedText;
    creatingProjectButton?: LocalizedText;

    closeModalButton?: LocalizedText;
    accountSummaryTitle?: LocalizedText;
    projectsTitle?: LocalizedText;
    projectsDescription?: LocalizedText;

    createNewProjectButton?: LocalizedText;

    loadingProjectsText?: LocalizedText;

    noProjectsTitle?: LocalizedText;
    noProjectsDescription?: LocalizedText;
    noProjectsButton?: LocalizedText;

    projectViewsLabel?: LocalizedText;
    projectTemplatesLabel?: LocalizedText;
    projectStorageLabel?: LocalizedText;
    projectCreatedLabel?: LocalizedText;
    projectUpdatedLabel?: LocalizedText;

    statusPending?: LocalizedText;
    statusApproved?: LocalizedText;
    statusRejected?: LocalizedText;

    publishedLabel?: LocalizedText;
    unpublishedLabel?: LocalizedText;

    editProjectButton?: LocalizedText;
    previewProjectButton?: LocalizedText;
    builderProjectButton?: LocalizedText;
    publishProjectButton?: LocalizedText;
    unpublishProjectButton?: LocalizedText;
    duplicateProjectButton?: LocalizedText;
    deleteProjectButton?: LocalizedText;

    completionTitle?: LocalizedText;
    completionDescription?: LocalizedText;
    completionButton?: LocalizedText;

    completionCompleted?: LocalizedText;

    completionPersonalInfo?: LocalizedText;
    completionEmailVerified?: LocalizedText;
    completionPublishedWebsite?: LocalizedText;
    completionConnectDomain?: LocalizedText;

    upgradeBadge?: LocalizedText;

    upgradeFeature1?: LocalizedText;
    upgradeFeature2?: LocalizedText;
    upgradeFeature3?: LocalizedText;
    upgradeFeature4?: LocalizedText;

    upgradeTitle?: LocalizedText;
    upgradeDescription?: LocalizedText;
    upgradeButton?: LocalizedText;
    saveSuccessMessage?: LocalizedText;
    saveFailedMessage?: LocalizedText;

    uploadSuccessMessage?: LocalizedText;
    uploadFailedMessage?: LocalizedText;

    createProjectSuccessMessage?: LocalizedText;
    createProjectFailedMessage?: LocalizedText;

    deleteProjectConfirm?: LocalizedText;
    deleteProjectSuccessMessage?: LocalizedText;
    deleteProjectFailedMessage?: LocalizedText;

    analyticsTitle?: LocalizedText;
    analyticsDescription?: LocalizedText;
    totalViewsLabel?: LocalizedText;
    totalProjectsLabel?: LocalizedText;
    totalTemplatesLabel?: LocalizedText;
    storageUsageLabel?: LocalizedText;
    bannerSectionTitle?: LocalizedText;
    bannerSectionDescription?: LocalizedText;
    uploadBannerButton?: LocalizedText;
    uploadingBannerButton?: LocalizedText;
    removeBannerButton?: LocalizedText;
}

export const DEFAULT_PROPS: Required<Profile01Props> = {
    /* ==========================================================
       General Information
    ========================================================== */

    generalTitle: {
        sourceLocale: 'en',
        default: 'General Information',
        translations: {
            vi: 'Thông tin chung',
            ja: '基本情報',
        },
    },

    generalDescription: {
        sourceLocale: 'en',
        default:
            'Keep your profile information up to date so your account remains secure and your projects stay organized.',
        translations: {
            vi: 'Luôn cập nhật thông tin hồ sơ để tài khoản của bạn an toàn và các dự án được quản lý hiệu quả.',
            ja: 'プロフィール情報を最新の状態に保ち、安全かつ効率的にプロジェクトを管理しましょう。',
        },
    },

    firstNameLabel: {
        sourceLocale: 'en',
        default: 'First Name',
        translations: {
            vi: 'Tên',
            ja: '名',
        },
    },

    firstNamePlaceholder: {
        sourceLocale: 'en',
        default: 'Enter your first name',
        translations: {
            vi: 'Nhập tên của bạn',
            ja: '名前を入力してください',
        },
    },

    lastNameLabel: {
        sourceLocale: 'en',
        default: 'Last Name',
        translations: {
            vi: 'Họ',
            ja: '姓',
        },
    },

    lastNamePlaceholder: {
        sourceLocale: 'en',
        default: 'Enter your last name',
        translations: {
            vi: 'Nhập họ của bạn',
            ja: '姓を入力してください',
        },
    },

    usernameLabel: {
        sourceLocale: 'en',
        default: 'Username',
        translations: {
            vi: 'Tên người dùng',
            ja: 'ユーザー名',
        },
    },

    usernamePlaceholder: {
        sourceLocale: 'en',
        default: 'Enter your username',
        translations: {
            vi: 'Nhập tên người dùng',
            ja: 'ユーザー名を入力してください',
        },
    },

    emailLabel: {
        sourceLocale: 'en',
        default: 'Email Address',
        translations: {
            vi: 'Địa chỉ Email',
            ja: 'メールアドレス',
        },
    },

    emailPlaceholder: {
        sourceLocale: 'en',
        default: 'Enter your email address',
        translations: {
            vi: 'Nhập địa chỉ Email',
            ja: 'メールアドレスを入力してください',
        },
    },

    phoneLabel: {
        sourceLocale: 'en',
        default: 'Phone Number',
        translations: {
            vi: 'Số điện thoại',
            ja: '電話番号',
        },
    },

    phonePlaceholder: {
        sourceLocale: 'en',
        default: 'Enter your phone number',
        translations: {
            vi: 'Nhập số điện thoại',
            ja: '電話番号を入力してください',
        },
    },

    companyLabel: {
        sourceLocale: 'en',
        default: 'Company',
        translations: {
            vi: 'Công ty',
            ja: '会社',
        },
    },

    companyPlaceholder: {
        sourceLocale: 'en',
        default: 'Enter your company',
        translations: {
            vi: 'Nhập tên công ty',
            ja: '会社名を入力してください',
        },
    },

    websiteLabel: {
        sourceLocale: 'en',
        default: 'Website',
        translations: {
            vi: 'Website',
            ja: 'ウェブサイト',
        },
    },

    websitePlaceholder: {
        sourceLocale: 'en',
        default: 'https://example.com',
        translations: {
            vi: 'https://example.com',
            ja: 'https://example.com',
        },
    },

    locationLabel: {
        sourceLocale: 'en',
        default: 'Location',
        translations: {
            vi: 'Địa điểm',
            ja: '所在地',
        },
    },

    locationPlaceholder: {
        sourceLocale: 'en',
        default: 'Enter your location',
        translations: {
            vi: 'Nhập địa điểm',
            ja: '所在地を入力してください',
        },
    },

    bioLabel: {
        sourceLocale: 'en',
        default: 'Biography',
        translations: {
            vi: 'Giới thiệu',
            ja: '自己紹介',
        },
    },

    bioPlaceholder: {
        sourceLocale: 'en',
        default: 'Tell everyone about yourself...',
        translations: {
            vi: 'Giới thiệu đôi nét về bạn...',
            ja: '自己紹介を書いてください...',
        },
    },

    genderLabel: {
        sourceLocale: 'en',
        default: 'Gender',
        translations: {
            vi: 'Giới tính',
            ja: '性別',
        },
    },
    selectGenderPlaceholder: {
        sourceLocale: 'en',
        default: 'Select Gender',
        translations: {
            vi: 'Chọn giới tính',
            ja: '性別を選択',
        },
    },
    genderMale: {
        sourceLocale: 'en',
        default: 'Male',
        translations: {
            vi: 'Nam',
            ja: '男性',
        },
    },
    genderFemale: {
        sourceLocale: 'en',
        default: 'Female',
        translations: {
            vi: 'Nữ',
            ja: '女性',
        },
    },
    genderOther: {
        sourceLocale: 'en',
        default: 'Other',
        translations: {
            vi: 'Khác',
            ja: 'その他',
        },
    },

    dateOfBirthLabel: {
        sourceLocale: 'en',
        default: 'Date of Birth',
        translations: {
            vi: 'Ngày sinh',
            ja: '生年月日',
        },
    },

    monthPlaceholder: {
        sourceLocale: 'en',
        default: 'Month',
        translations: {
            vi: 'Tháng',
            ja: '月',
        },
    },
    dayPlaceholder: {
        sourceLocale: 'en',
        default: 'Day',
        translations: {
            vi: 'Ngày',
            ja: '日',
        },
    },
    yearPlaceholder: {
        sourceLocale: 'en',
        default: 'Year',
        translations: {
            vi: 'Năm',
            ja: '年',
        },
    },

    monthJanuary: {
        sourceLocale: 'en',
        default: 'January',
        translations: { vi: 'Tháng 1', ja: '1月' },
    },
    monthFebruary: {
        sourceLocale: 'en',
        default: 'February',
        translations: { vi: 'Tháng 2', ja: '2月' },
    },
    monthMarch: {
        sourceLocale: 'en',
        default: 'March',
        translations: { vi: 'Tháng 3', ja: '3月' },
    },
    monthApril: {
        sourceLocale: 'en',
        default: 'April',
        translations: { vi: 'Tháng 4', ja: '4月' },
    },
    monthMay: { sourceLocale: 'en', default: 'May', translations: { vi: 'Tháng 5', ja: '5月' } },
    monthJune: { sourceLocale: 'en', default: 'June', translations: { vi: 'Tháng 6', ja: '6月' } },
    monthJuly: { sourceLocale: 'en', default: 'July', translations: { vi: 'Tháng 7', ja: '7月' } },
    monthAugust: {
        sourceLocale: 'en',
        default: 'August',
        translations: { vi: 'Tháng 8', ja: '8月' },
    },
    monthSeptember: {
        sourceLocale: 'en',
        default: 'September',
        translations: { vi: 'Tháng 9', ja: '9月' },
    },
    monthOctober: {
        sourceLocale: 'en',
        default: 'October',
        translations: { vi: 'Tháng 10', ja: '10月' },
    },
    monthNovember: {
        sourceLocale: 'en',
        default: 'November',
        translations: { vi: 'Tháng 11', ja: '11月' },
    },
    monthDecember: {
        sourceLocale: 'en',
        default: 'December',
        translations: { vi: 'Tháng 12', ja: '12月' },
    },

    statusLabel: {
        sourceLocale: 'en',
        default: 'Status',
        translations: {
            vi: 'Trạng thái',
            ja: 'ステータス',
        },
    },
    statusActive: {
        sourceLocale: 'en',
        default: 'Active',
        translations: {
            vi: 'Đang hoạt động',
            ja: 'アクティブ',
        },
    },
    statusVerified: {
        sourceLocale: 'en',
        default: 'Verified',
        translations: {
            vi: 'Đã xác minh',
            ja: '認証済み',
        },
    },

    languageLabel: {
        sourceLocale: 'en',
        default: 'Language',
        translations: {
            vi: 'Ngôn ngữ',
            ja: '言語',
        },
    },
    languageEnglish: {
        sourceLocale: 'en',
        default: 'English',
        translations: {
            vi: 'Tiếng Anh',
            ja: '英語',
        },
    },
    languageVietnamese: {
        sourceLocale: 'en',
        default: 'Vietnamese',
        translations: {
            vi: 'Tiếng Việt',
            ja: 'ベトナム語',
        },
    },
    languageJapanese: {
        sourceLocale: 'en',
        default: 'Japanese',
        translations: {
            vi: 'Tiếng Nhật',
            ja: '日本語',
        },
    },

    timezoneLabel: {
        sourceLocale: 'en',
        default: 'Timezone',
        translations: {
            vi: 'Múi giờ',
            ja: 'タイムゾーン',
        },
    },
    timezoneVietnam: {
        sourceLocale: 'en',
        default: '(GMT+07:00) Asia/Ho_Chi_Minh',
        translations: {
            vi: '(GMT+07:00) Châu Á/Hồ Chí Minh',
            ja: '(GMT+07:00) アジア/ホーチミン',
        },
    },
    timezoneJapan: {
        sourceLocale: 'en',
        default: '(GMT+09:00) Asia/Tokyo',
        translations: {
            vi: '(GMT+09:00) Châu Á/Tokyo',
            ja: '(GMT+09:00) アジア/東京',
        },
    },
    timezoneUtc: {
        sourceLocale: 'en',
        default: 'UTC',
        translations: {
            vi: 'UTC',
            ja: 'UTC',
        },
    },

    /* ==========================================================
       Avatar
    ========================================================== */

    avatarSectionTitle: {
        sourceLocale: 'en',
        default: 'Profile Avatar',
        translations: {
            vi: 'Ảnh đại diện',
            ja: 'プロフィール画像',
        },
    },

    avatarSectionDescription: {
        sourceLocale: 'en',
        default: 'Upload a professional profile photo that represents your account.',
        translations: {
            vi: 'Tải lên ảnh đại diện chuyên nghiệp cho tài khoản của bạn.',
            ja: 'プロフィールを表す画像をアップロードしてください。',
        },
    },

    uploadAvatarButton: {
        sourceLocale: 'en',
        default: 'Upload Avatar',
        translations: {
            vi: 'Tải ảnh đại diện',
            ja: 'プロフィール画像をアップロード',
        },
    },

    removeAvatarButton: {
        sourceLocale: 'en',
        default: 'Remove Avatar',
        translations: {
            vi: 'Xóa ảnh đại diện',
            ja: 'プロフィール画像を削除',
        },
    },

    /* ==========================================================
       Logo
    ========================================================== */

    logoSectionTitle: {
        sourceLocale: 'en',
        default: 'Brand Logo',
        translations: {
            vi: 'Logo thương hiệu',
            ja: 'ブランドロゴ',
        },
    },

    logoSectionDescription: {
        sourceLocale: 'en',
        default: 'Upload your company or project logo to personalize your workspace.',
        translations: {
            vi: 'Tải lên logo công ty hoặc dự án để cá nhân hóa không gian làm việc.',
            ja: '会社またはプロジェクトのロゴをアップロードしてください。',
        },
    },

    uploadLogoButton: {
        sourceLocale: 'en',
        default: 'Upload Logo',
        translations: {
            vi: 'Tải logo',
            ja: 'ロゴをアップロード',
        },
    },

    removeLogoButton: {
        sourceLocale: 'en',
        default: 'Remove Logo',
        translations: {
            vi: 'Xóa logo',
            ja: 'ロゴを削除',
        },
    },

    /* ==========================================================
       Actions
    ========================================================== */

    saveButton: {
        sourceLocale: 'en',
        default: 'Save Changes',
        translations: {
            vi: 'Lưu thay đổi',
            ja: '変更を保存',
        },
    },

    cancelButton: {
        sourceLocale: 'en',
        default: 'Cancel',
        translations: {
            vi: 'Hủy',
            ja: 'キャンセル',
        },
    },

    savingButton: {
        sourceLocale: 'en',
        default: 'Saving...',
        translations: {
            vi: 'Đang lưu...',
            ja: '保存中...',
        },
    },
    /* ==========================================================
       Create Project
    ========================================================== */

    createProjectTitle: {
        sourceLocale: 'en',
        default: 'Create Project',
        translations: {
            vi: 'Tạo dự án',
            ja: 'プロジェクトを作成',
        },
    },

    createProjectDescription: {
        sourceLocale: 'en',
        default: 'Create a new website project and start building immediately.',
        translations: {
            vi: 'Tạo một dự án website mới và bắt đầu xây dựng ngay.',
            ja: '新しいウェブサイトプロジェクトを作成して開始しましょう。',
        },
    },

    projectNameLabel: {
        sourceLocale: 'en',
        default: 'Project Name',
        translations: {
            vi: 'Tên dự án',
            ja: 'プロジェクト名',
        },
    },

    projectNamePlaceholder: {
        sourceLocale: 'en',
        default: 'Enter project name',
        translations: {
            vi: 'Nhập tên dự án',
            ja: 'プロジェクト名を入力',
        },
    },

    projectSlugLabel: {
        sourceLocale: 'en',
        default: 'Project Slug',
        translations: {
            vi: 'Slug dự án',
            ja: 'プロジェクトスラッグ',
        },
    },

    projectSlugPlaceholder: {
        sourceLocale: 'en',
        default: 'my-awesome-project',
        translations: {
            vi: 'du-an-cua-toi',
            ja: 'my-awesome-project',
        },
    },

    projectDescriptionLabel: {
        sourceLocale: 'en',
        default: 'Description',
        translations: {
            vi: 'Mô tả',
            ja: '説明',
        },
    },

    projectDescriptionPlaceholder: {
        sourceLocale: 'en',
        default: 'Describe your project...',
        translations: {
            vi: 'Mô tả dự án...',
            ja: 'プロジェクトについて説明してください...',
        },
    },
    projectLogoLabel: {
        sourceLocale: 'en',
        default: 'Project Logo',
        translations: {
            vi: 'Logo dự án',
            ja: 'プロジェクトロゴ',
        },
    },

    projectLogoAlt: {
        sourceLocale: 'en',
        default: 'Project Logo',
        translations: {
            vi: 'Logo dự án',
            ja: 'プロジェクトロゴ',
        },
    },

    projectThumbnailLabel: {
        sourceLocale: 'en',
        default: 'Project Thumbnail',
        translations: {
            vi: 'Ảnh thumbnail',
            ja: 'プロジェクトサムネイル',
        },
    },

    projectThumbnailAlt: {
        sourceLocale: 'en',
        default: 'Project Thumbnail',
        translations: {
            vi: 'Ảnh thumbnail',
            ja: 'プロジェクトサムネイル',
        },
    },
    websiteTypeLabel: {
        sourceLocale: 'en',
        default: 'Website Type',
        translations: {
            vi: 'Loại website',
            ja: 'ウェブサイト種類',
        },
    },
    websiteTypeLanding: {
        sourceLocale: 'en',
        default: 'Landing',
        translations: {
            vi: 'Landing Page',
            ja: 'ランディングページ',
        },
    },

    websiteTypeBlog: {
        sourceLocale: 'en',
        default: 'Blog',
        translations: {
            vi: 'Blog',
            ja: 'ブログ',
        },
    },

    websiteTypeEcommerce: {
        sourceLocale: 'en',
        default: 'E-Commerce',
        translations: {
            vi: 'Thương mại điện tử',
            ja: 'ECサイト',
        },
    },

    websiteTypeBooking: {
        sourceLocale: 'en',
        default: 'Booking',
        translations: {
            vi: 'Đặt lịch',
            ja: '予約',
        },
    },

    websiteTypeLms: {
        sourceLocale: 'en',
        default: 'Learning Management',
        translations: {
            vi: 'Hệ thống học trực tuyến',
            ja: '学習管理システム',
        },
    },

    uploadThumbnailButton: {
        sourceLocale: 'en',
        default: 'Upload Thumbnail',
        translations: {
            vi: 'Tải ảnh thumbnail',
            ja: 'サムネイルをアップロード',
        },
    },
    uploadingLogoButton: {
        sourceLocale: 'en',
        default: 'Uploading...',
        translations: {
            vi: 'Đang tải...',
            ja: 'アップロード中...',
        },
    },

    uploadingThumbnailButton: {
        sourceLocale: 'en',
        default: 'Uploading...',
        translations: {
            vi: 'Đang tải...',
            ja: 'アップロード中...',
        },
    },

    createProjectButton: {
        sourceLocale: 'en',
        default: 'Create Project',
        translations: {
            vi: 'Tạo dự án',
            ja: 'プロジェクトを作成',
        },
    },

    creatingProjectButton: {
        sourceLocale: 'en',
        default: 'Creating...',
        translations: {
            vi: 'Đang tạo...',
            ja: '作成中...',
        },
    },

    closeModalButton: {
        sourceLocale: 'en',
        default: 'Close',
        translations: {
            vi: 'Đóng',
            ja: '閉じる',
        },
    },

    /* ==========================================================
       Projects
    ========================================================== */

    projectsTitle: {
        sourceLocale: 'en',
        default: 'Projects',
        translations: {
            vi: 'Dự án',
            ja: 'プロジェクト',
        },
    },

    projectsDescription: {
        sourceLocale: 'en',
        default: 'Manage all of your websites and monitor their current status.',
        translations: {
            vi: 'Quản lý tất cả website của bạn và theo dõi trạng thái hiện tại.',
            ja: 'すべてのウェブサイトを管理し、現在の状態を確認します。',
        },
    },

    createNewProjectButton: {
        sourceLocale: 'en',
        default: 'Create New Project',
        translations: {
            vi: 'Tạo dự án mới',
            ja: '新しいプロジェクト',
        },
    },

    loadingProjectsText: {
        sourceLocale: 'en',
        default: 'Loading projects...',
        translations: {
            vi: 'Đang tải dự án...',
            ja: 'プロジェクトを読み込み中...',
        },
    },

    noProjectsTitle: {
        sourceLocale: 'en',
        default: 'No Projects Yet',
        translations: {
            vi: 'Chưa có dự án',
            ja: 'プロジェクトがありません',
        },
    },

    noProjectsDescription: {
        sourceLocale: 'en',
        default: 'Create your first website project to start building with Kbuilder.',
        translations: {
            vi: 'Hãy tạo dự án website đầu tiên để bắt đầu với Kbuilder.',
            ja: '最初のウェブサイトプロジェクトを作成して始めましょう。',
        },
    },

    noProjectsButton: {
        sourceLocale: 'en',
        default: 'Create Project',
        translations: {
            vi: 'Tạo dự án',
            ja: 'プロジェクトを作成',
        },
    },

    /* ==========================================================
       Project Card
    ========================================================== */

    projectViewsLabel: {
        sourceLocale: 'en',
        default: 'Views',
        translations: {
            vi: 'Lượt xem',
            ja: '閲覧数',
        },
    },

    projectTemplatesLabel: {
        sourceLocale: 'en',
        default: 'Templates',
        translations: {
            vi: 'Template',
            ja: 'テンプレート',
        },
    },

    projectStorageLabel: {
        sourceLocale: 'en',
        default: 'Storage',
        translations: {
            vi: 'Dung lượng',
            ja: 'ストレージ',
        },
    },

    projectCreatedLabel: {
        sourceLocale: 'en',
        default: 'Created',
        translations: {
            vi: 'Ngày tạo',
            ja: '作成日',
        },
    },

    projectUpdatedLabel: {
        sourceLocale: 'en',
        default: 'Updated',
        translations: {
            vi: 'Cập nhật',
            ja: '更新日',
        },
    },

    projectDomainLabel: {
        sourceLocale: 'en',
        default: 'Domain',
        translations: {
            vi: 'Tên miền',
            ja: 'ドメイン',
        },
    },
    projectDomainPlaceholder: {
        sourceLocale: 'en',
        default: 'example.com',
        translations: {
            vi: 'example.com',
            ja: 'example.com',
        },
    },

    /* ==========================================================
       Project Status
    ========================================================== */

    statusPending: {
        sourceLocale: 'en',
        default: 'Pending Review',
        translations: {
            vi: 'Đang chờ duyệt',
            ja: '審査待ち',
        },
    },

    statusApproved: {
        sourceLocale: 'en',
        default: 'Approved',
        translations: {
            vi: 'Đã duyệt',
            ja: '承認済み',
        },
    },

    statusRejected: {
        sourceLocale: 'en',
        default: 'Rejected',
        translations: {
            vi: 'Đã từ chối',
            ja: '却下',
        },
    },

    publishedLabel: {
        sourceLocale: 'en',
        default: 'Published',
        translations: {
            vi: 'Đã xuất bản',
            ja: '公開済み',
        },
    },

    unpublishedLabel: {
        sourceLocale: 'en',
        default: 'Draft',
        translations: {
            vi: 'Bản nháp',
            ja: '下書き',
        },
    },

    /* ==========================================================
       Project Actions
    ========================================================== */

    editProjectButton: {
        sourceLocale: 'en',
        default: 'Edit',
        translations: {
            vi: 'Chỉnh sửa',
            ja: '編集',
        },
    },

    previewProjectButton: {
        sourceLocale: 'en',
        default: 'Preview',
        translations: {
            vi: 'Xem trước',
            ja: 'プレビュー',
        },
    },

    builderProjectButton: {
        sourceLocale: 'en',
        default: 'Open Builder',
        translations: {
            vi: 'Mở Builder',
            ja: 'ビルダーを開く',
        },
    },

    publishProjectButton: {
        sourceLocale: 'en',
        default: 'Publish',
        translations: {
            vi: 'Xuất bản',
            ja: '公開',
        },
    },

    unpublishProjectButton: {
        sourceLocale: 'en',
        default: 'Unpublish',
        translations: {
            vi: 'Hủy xuất bản',
            ja: '公開解除',
        },
    },

    duplicateProjectButton: {
        sourceLocale: 'en',
        default: 'Duplicate',
        translations: {
            vi: 'Nhân bản',
            ja: '複製',
        },
    },

    deleteProjectButton: {
        sourceLocale: 'en',
        default: 'Delete',
        translations: {
            vi: 'Xóa',
            ja: '削除',
        },
    },
    /* ==========================================================
       Analytics
    ========================================================== */

    analyticsTitle: {
        sourceLocale: 'en',
        default: 'Analytics',
        translations: {
            vi: 'Thống kê',
            ja: '分析',
        },
    },

    analyticsDescription: {
        sourceLocale: 'en',
        default: 'Track your website performance and growth over time.',
        translations: {
            vi: 'Theo dõi hiệu suất và sự phát triển của website theo thời gian.',
            ja: 'ウェブサイトのパフォーマンスと成長を確認します。',
        },
    },

    totalViewsLabel: {
        sourceLocale: 'en',
        default: 'Total Views',
        translations: {
            vi: 'Tổng lượt xem',
            ja: '総閲覧数',
        },
    },

    totalProjectsLabel: {
        sourceLocale: 'en',
        default: 'Projects',
        translations: {
            vi: 'Dự án',
            ja: 'プロジェクト',
        },
    },

    totalTemplatesLabel: {
        sourceLocale: 'en',
        default: 'Templates',
        translations: {
            vi: 'Template',
            ja: 'テンプレート',
        },
    },

    storageUsageLabel: {
        sourceLocale: 'en',
        default: 'Storage Usage',
        translations: {
            vi: 'Dung lượng sử dụng',
            ja: 'ストレージ使用量',
        },
    },

    /* ==========================================================
       Sidebar
    ========================================================== */

    accountSummaryTitle: {
        sourceLocale: 'en',
        default: 'Account Summary',
        translations: {
            vi: 'Tổng quan tài khoản',
            ja: 'アカウント概要',
        },
    },

    completionTitle: {
        sourceLocale: 'en',
        default: 'Profile Completion',
        translations: {
            vi: 'Hoàn thiện hồ sơ',
            ja: 'プロフィール完成度',
        },
    },

    completionDescription: {
        sourceLocale: 'en',
        default: 'Complete your profile to unlock more features.',
        translations: {
            vi: 'Hoàn thiện hồ sơ để mở khóa nhiều tính năng hơn.',
            ja: 'プロフィールを完成させてさらに多くの機能を利用しましょう。',
        },
    },

    completionButton: {
        sourceLocale: 'en',
        default: 'Complete Now',
        translations: {
            vi: 'Hoàn thiện ngay',
            ja: '今すぐ完了',
        },
    },

    completionCompleted: {
        sourceLocale: 'en',
        default: 'Completed',
        translations: {
            vi: 'Hoàn thành',
            ja: '完了',
        },
    },

    completionPersonalInfo: {
        sourceLocale: 'en',
        default: 'Personal Information',
        translations: {
            vi: 'Thông tin cá nhân',
            ja: '個人情報',
        },
    },

    completionEmailVerified: {
        sourceLocale: 'en',
        default: 'Email Verified',
        translations: {
            vi: 'Email đã xác minh',
            ja: 'メール認証済み',
        },
    },

    completionPublishedWebsite: {
        sourceLocale: 'en',
        default: 'Published Website',
        translations: {
            vi: 'Website đã xuất bản',
            ja: '公開済みサイト',
        },
    },

    completionConnectDomain: {
        sourceLocale: 'en',
        default: 'Connect Domain',
        translations: {
            vi: 'Kết nối tên miền',
            ja: 'ドメイン接続',
        },
    },

    upgradeBadge: {
        sourceLocale: 'en',
        default: 'PRO PLAN',
        translations: {
            vi: 'GÓI PRO',
            ja: 'PROプラン',
        },
    },

    upgradeFeature1: {
        sourceLocale: 'en',
        default: 'Unlimited Websites',
        translations: {
            vi: 'Website không giới hạn',
            ja: '無制限のWebサイト',
        },
    },

    upgradeFeature2: {
        sourceLocale: 'en',
        default: 'Premium Templates',
        translations: {
            vi: 'Mẫu giao diện cao cấp',
            ja: 'プレミアムテンプレート',
        },
    },

    upgradeFeature3: {
        sourceLocale: 'en',
        default: 'Cloud Hosting',
        translations: {
            vi: 'Cloud Hosting',
            ja: 'クラウドホスティング',
        },
    },

    upgradeFeature4: {
        sourceLocale: 'en',
        default: 'AI Website Builder',
        translations: {
            vi: 'AI Website Builder',
            ja: 'AIウェブサイトビルダー',
        },
    },

    /* ==========================================================
       Upgrade
    ========================================================== */

    upgradeTitle: {
        sourceLocale: 'en',
        default: 'Upgrade Your Plan',
        translations: {
            vi: 'Nâng cấp gói dịch vụ',
            ja: 'プランをアップグレード',
        },
    },

    upgradeDescription: {
        sourceLocale: 'en',
        default: 'Unlock premium templates, AI tools and advanced analytics.',
        translations: {
            vi: 'Mở khóa template cao cấp, AI và thống kê nâng cao.',
            ja: 'プレミアムテンプレート、AI、詳細分析を利用できます。',
        },
    },

    upgradeButton: {
        sourceLocale: 'en',
        default: 'Upgrade Now',
        translations: {
            vi: 'Nâng cấp ngay',
            ja: '今すぐアップグレード',
        },
    },

    /* ==========================================================
       Messages
    ========================================================== */

    saveSuccessMessage: {
        sourceLocale: 'en',
        default: 'Profile updated successfully.',
        translations: {
            vi: 'Cập nhật hồ sơ thành công.',
            ja: 'プロフィールを更新しました。',
        },
    },

    saveFailedMessage: {
        sourceLocale: 'en',
        default: 'Unable to update profile.',
        translations: {
            vi: 'Không thể cập nhật hồ sơ.',
            ja: 'プロフィールを更新できません。',
        },
    },

    uploadSuccessMessage: {
        sourceLocale: 'en',
        default: 'Upload completed successfully.',
        translations: {
            vi: 'Tải lên thành công.',
            ja: 'アップロードが完了しました。',
        },
    },

    uploadFailedMessage: {
        sourceLocale: 'en',
        default: 'Upload failed.',
        translations: {
            vi: 'Tải lên thất bại.',
            ja: 'アップロードに失敗しました。',
        },
    },

    createProjectSuccessMessage: {
        sourceLocale: 'en',
        default: 'Project created successfully.',
        translations: {
            vi: 'Tạo dự án thành công.',
            ja: 'プロジェクトを作成しました。',
        },
    },

    createProjectFailedMessage: {
        sourceLocale: 'en',
        default: 'Unable to create project.',
        translations: {
            vi: 'Không thể tạo dự án.',
            ja: 'プロジェクトを作成できません。',
        },
    },

    deleteProjectConfirm: {
        sourceLocale: 'en',
        default: 'Are you sure you want to delete this project?',
        translations: {
            vi: 'Bạn có chắc chắn muốn xóa dự án này?',
            ja: 'このプロジェクトを削除しますか？',
        },
    },

    deleteProjectSuccessMessage: {
        sourceLocale: 'en',
        default: 'Project deleted successfully.',
        translations: {
            vi: 'Đã xóa dự án thành công.',
            ja: 'プロジェクトを削除しました。',
        },
    },

    deleteProjectFailedMessage: {
        sourceLocale: 'en',
        default: 'Unable to delete project.',
        translations: {
            vi: 'Không thể xóa dự án.',
            ja: 'プロジェクトを削除できません。',
        },
    },
    bannerSectionTitle: {
        sourceLocale: 'en',
        default: 'Profile Banner',
        translations: {
            vi: 'Ảnh bìa hồ sơ',
            ja: 'プロフィールバナー',
        },
    },

    bannerSectionDescription: {
        sourceLocale: 'en',
        default: 'Upload a banner image to personalize your profile.',
        translations: {
            vi: 'Tải lên ảnh bìa để cá nhân hóa hồ sơ của bạn.',
            ja: 'プロフィールをカスタマイズするためのバナー画像をアップロードします。',
        },
    },

    uploadBannerButton: {
        sourceLocale: 'en',
        default: 'Upload Banner',
        translations: {
            vi: 'Tải ảnh bìa',
            ja: 'バナーをアップロード',
        },
    },

    uploadingBannerButton: {
        sourceLocale: 'en',
        default: 'Uploading...',
        translations: {
            vi: 'Đang tải lên...',
            ja: 'アップロード中...',
        },
    },

    removeBannerButton: {
        sourceLocale: 'en',
        default: 'Remove Banner',
        translations: {
            vi: 'Xóa ảnh bìa',
            ja: 'バナーを削除',
        },
    },
};

export function CreateProjectModal(props: CreateProjectModalProps) {
    const mergedProps = useMemo(
        () => ({
            ...DEFAULT_PROPS,
            ...props,
        }),
        [props],
    );
    const {
        createProjectTitle,
        createProjectDescription,
        projectNameLabel,
        projectNamePlaceholder,
        projectSlugLabel,
        projectSlugPlaceholder,
        websiteTypeLabel,
        websiteTypeLanding,
        websiteTypeBlog,
        websiteTypeEcommerce,
        websiteTypeBooking,
        websiteTypeLms,
        projectDomainLabel,
        projectDomainPlaceholder,
        projectDescriptionLabel,
        projectDescriptionPlaceholder,
        projectLogoLabel,
        projectLogoAlt,
        projectThumbnailLabel,
        projectThumbnailAlt,
        uploadLogoButton,
        uploadThumbnailButton,
        uploadingLogoButton,
        uploadingThumbnailButton,
        createProjectButton,
        creatingProjectButton,
        cancelButton,
        uploadFailedMessage,
        createProjectFailedMessage,
        createProjectSuccessMessage,
    } = mergedProps;

    const { open, onClose, onCreated } = props;

    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const WEBSITE_TYPE_KEYS: WebsiteType[] = ['landing', 'blog', 'ecommerce', 'booking', 'lms'];

    const [selectedLocale, setSelectedLocale] = useState(() => {
        if (typeof window === 'undefined') {
            return 'en';
        }
        return localStorage.getItem('locale') ?? 'en';
    });

    useEffect(() => {
        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            setSelectedLocale(customEvent.detail);
        };
        window.addEventListener('locale-change', handleLocaleChange as EventListener);
        return () => {
            window.removeEventListener('locale-change', handleLocaleChange as EventListener);
        };
    }, []);

    const t = useCallback(
        (value: LocalizedText) => getLocalizedValue(value, selectedLocale),
        [selectedLocale],
    );

    const [form, setForm] = useState<CreateProjectRequest>({
        name: '',
        slug: '',
        websiteType: 'landing',
        description: null,
        logo: null,
        thumbnail: null,
        domain: null,
    });

    const updateForm = useCallback(
        <K extends keyof CreateProjectRequest>(key: K, value: CreateProjectRequest[K]) => {
            setForm((prev) => {
                if (Object.is(prev[key], value)) {
                    return prev;
                }
                return {
                    ...prev,
                    [key]: value,
                };
            });
        },
        [],
    );

    const createSlug = (value: string): string =>
        value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

    const resetForm = () => {
        setForm({
            name: '',
            slug: '',
            websiteType: 'landing',
            description: null,
            logo: null,
            thumbnail: null,
            domain: null,
        });

        setLogoPreview(null);
        setThumbnailPreview(null);
        setError(null);
        setSuccess(null);
    };

    const uploadImage = useCallback(
        async (file: File, type: 'logo' | 'thumbnail'): Promise<UploadResponse> => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            const response = await fetch('/api/v1/profile/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            const json: UploadResponse = await response.json();
            if (!response.ok || !json.success) {
                throw new Error(json.message ?? t(uploadFailedMessage));
            }
            return json;
        },
        [t, uploadFailedMessage],
    );

    const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        setLogoPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return preview;
        });
        try {
            setUploadingLogo(true);
            const json = await uploadImage(file, 'logo');
            setForm((prev) => ({
                ...prev,
                logo: json.image,
            }));
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        setThumbnailPreview(preview);
        try {
            setUploadingThumbnail(true);

            const json = await uploadImage(file, 'thumbnail');

            setForm((prev) => ({
                ...prev,
                thumbnail: json.image,
            }));
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setUploadingThumbnail(false);
        }
    };
    useEffect(() => {
        return () => {
            if (logoPreview) URL.revokeObjectURL(logoPreview);
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        };
    }, [logoPreview, thumbnailPreview]);

    const handleSubmit = async () => {
        if (loading) return;
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/v1/project', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: form.name,
                    slug: form.slug,
                    websiteType: form.websiteType,
                    description: form.description,
                    logo: form.logo,
                    thumbnail: form.thumbnail,
                    domain: form.domain,
                }),
            });

            const json = await response.json();
            if (!response.ok || !json.success) {
                throw new Error(json.message || t(createProjectFailedMessage));
            }
            setSuccess(json.message || t(createProjectSuccessMessage));
            onCreated?.(json.project);
            resetForm();
            setTimeout(() => {
                onClose();
            }, 300);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const WEBSITE_TYPES = useMemo(() => {
        const labels: Record<WebsiteType, string> = {
            landing: t(websiteTypeLanding),
            blog: t(websiteTypeBlog),
            ecommerce: t(websiteTypeEcommerce),
            booking: t(websiteTypeBooking),
            lms: t(websiteTypeLms),
        };

        return WEBSITE_TYPE_KEYS.map((value) => ({
            value,
            label: labels[value],
        }));
    }, [
        selectedLocale,
        websiteTypeLanding,
        websiteTypeBlog,
        websiteTypeEcommerce,
        websiteTypeBooking,
        websiteTypeLms,
    ]);

    const handleNameChange = useCallback((value: string) => {
        const slug = createSlug(value);

        setForm((prev) => {
            if (prev.name === value && prev.slug === slug) {
                return prev;
            }

            return {
                ...prev,
                name: value,
                slug,
            };
        });
    }, []);

    if (!open) return null;

    return (
        <div
            className={models.overlay}
            onClick={() => {
                resetForm();
                onClose();
            }}
        >
            <div className={models.modal} onClick={(e) => e.stopPropagation()}>
                <div className={models.header}>
                    <div>
                        <h2>{t(createProjectTitle)}</h2>
                        <p>{t(createProjectDescription)}</p>
                    </div>

                    <button type="button" className={models.closeButton} onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className={models.modalBody}>
                    {error && <div className={models.errorMessage}>{error}</div>}

                    {success && <div className={models.successMessage}>{success}</div>}

                    <div className={models.formGrid}>
                        <div className={models.formGroup}>
                            <label>{t(projectNameLabel)} *</label>

                            <div className={models.inputWrapper}>
                                <i className="bi bi-folder2-open"></i>

                                <input
                                    type="text"
                                    placeholder={t(projectNamePlaceholder)}
                                    value={form.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={models.formGroup}>
                            <label>{t(projectSlugLabel)} *</label>

                            <div className={models.inputWrapper}>
                                <i className="bi bi-link-45deg"></i>

                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            slug: createSlug(e.target.value),
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className={models.formGroup}>
                            <label>{t(websiteTypeLabel)} *</label>

                            <div className={models.inputWrapper}>
                                <i className="bi bi-globe2"></i>

                                <select
                                    value={form.websiteType}
                                    onChange={(e) =>
                                        updateForm('websiteType', e.target.value as WebsiteType)
                                    }
                                >
                                    {WEBSITE_TYPES.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={models.formGroup}>
                            <label>{t(projectDomainLabel)}</label>

                            <div className={models.inputWrapper}>
                                <i className="bi bi-globe"></i>

                                <input
                                    type="text"
                                    placeholder={t(projectDomainPlaceholder)}
                                    value={form.domain ?? ''}
                                    onChange={(e) => updateForm('domain', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={models.formGroupFull}>
                            <label>{t(projectDescriptionLabel)}</label>
                            <textarea
                                rows={5}
                                placeholder={t(projectDescriptionPlaceholder)}
                                value={form.description ?? ''}
                                onChange={(e) => updateForm('description', e.target.value)}
                            />
                        </div>

                        <div className={models.formGroup}>
                            <label>{t(projectLogoLabel)}</label>
                            <div className={models.uploadCard}>
                                {logoPreview || form.logo ? (
                                    <Image
                                        src={logoPreview ?? form.logo!}
                                        alt={t(projectLogoAlt)}
                                        width={80}
                                        height={80}
                                        className={models.uploadPreview}
                                    />
                                ) : (
                                    <div className={models.uploadPlaceholder}>
                                        <i className="bi bi-image"></i>
                                    </div>
                                )}

                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />

                                <button
                                    type="button"
                                    className={models.outlineButton}
                                    disabled={uploadingLogo || loading}
                                    onClick={() => logoInputRef.current?.click()}
                                >
                                    <i className="bi bi-upload"></i>

                                    {uploadingLogo ? t(uploadingLogoButton) : t(uploadLogoButton)}
                                </button>
                            </div>
                        </div>

                        <div className={models.formGroup}>
                            <label>{t(projectThumbnailLabel)}</label>
                            <div className={models.uploadCard}>
                                {thumbnailPreview || form.thumbnail ? (
                                    <Image
                                        src={thumbnailPreview ?? form.thumbnail!}
                                        alt={t(projectThumbnailAlt)}
                                        width={160}
                                        height={100}
                                        className={models.thumbnailPreview}
                                    />
                                ) : (
                                    <div className={models.uploadPlaceholder}>
                                        <i className="bi bi-card-image"></i>
                                    </div>
                                )}

                                <input
                                    ref={thumbnailInputRef}
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                />

                                <button
                                    type="button"
                                    className={models.outlineButton}
                                    disabled={uploadingThumbnail || loading}
                                    onClick={() => thumbnailInputRef.current?.click()}
                                >
                                    <i className="bi bi-upload"></i>

                                    {uploadingThumbnail
                                        ? t(uploadingThumbnailButton)
                                        : t(uploadThumbnailButton)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={models.footer}>
                    <button
                        type="button"
                        className={models.cancelButton}
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                    >
                        <i className="bi bi-x-circle"></i>
                        {t(cancelButton)}
                    </button>

                    <button
                        type="button"
                        className={models.createButton}
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? (
                            <>
                                <span className={models.spinner}></span>
                                {t(creatingProjectButton)}
                            </>
                        ) : (
                            <>
                                <i className="bi bi-plus-circle"></i>
                                {t(createProjectButton)}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
export function Profile01(props: Profile01Props) {
    const mergedProps = useMemo(
        () => ({
            ...DEFAULT_PROPS,
            ...props,
        }),
        [props],
    );

    const {
        completionCompleted,

        completionPersonalInfo,
        completionEmailVerified,
        completionPublishedWebsite,
        completionConnectDomain,

        upgradeBadge,

        upgradeFeature1,
        upgradeFeature2,
        upgradeFeature3,
        upgradeFeature4,
    } = mergedProps;

    const {
        generalTitle,
        generalDescription,

        firstNameLabel,
        firstNamePlaceholder,

        lastNameLabel,
        lastNamePlaceholder,

        usernameLabel,
        usernamePlaceholder,

        emailLabel,
        emailPlaceholder,

        phoneLabel,
        phonePlaceholder,

        bioLabel,
        bioPlaceholder,
    } = mergedProps;

    const {
        genderLabel,
        selectGenderPlaceholder,
        genderMale,
        genderFemale,
        genderOther,

        dateOfBirthLabel,

        monthPlaceholder,
        dayPlaceholder,
        yearPlaceholder,

        monthJanuary,
        monthFebruary,
        monthMarch,
        monthApril,
        monthMay,
        monthJune,
        monthJuly,
        monthAugust,
        monthSeptember,
        monthOctober,
        monthNovember,
        monthDecember,

        languageLabel,
        languageEnglish,
        languageVietnamese,
        languageJapanese,

        timezoneLabel,
        timezoneVietnam,
        timezoneJapan,
        timezoneUtc,

        statusLabel,
        statusActive,
        statusVerified,
    } = mergedProps;

    const {
        avatarSectionTitle,
        avatarSectionDescription,
        uploadAvatarButton,
        removeAvatarButton,

        logoSectionTitle,
        logoSectionDescription,
        uploadLogoButton,
        removeLogoButton,
    } = mergedProps;

    const { saveButton, savingButton, cancelButton, uploadingLogoButton } = mergedProps;

    const {
        projectsTitle,
        projectsDescription,

        createNewProjectButton,

        loadingProjectsText,

        noProjectsTitle,
        noProjectsDescription,
        noProjectsButton,

        projectViewsLabel,
        projectTemplatesLabel,
        projectUpdatedLabel,

        statusPending,
        statusApproved,
        statusRejected,

        editProjectButton,
        previewProjectButton,
    } = mergedProps;

    const {
        analyticsTitle,
        analyticsDescription,

        totalViewsLabel,
        totalProjectsLabel,
        totalTemplatesLabel,
        storageUsageLabel,

        accountSummaryTitle,

        completionTitle,
        completionDescription,
        completionButton,

        upgradeTitle,
        upgradeDescription,
        upgradeButton,
        bannerSectionTitle,
        bannerSectionDescription,
        uploadBannerButton,
        uploadingBannerButton,
        removeBannerButton,
    } = mergedProps;

    const [selectedLocale, setSelectedLocale] = useState(() => {
        if (typeof window === 'undefined') {
            return 'en';
        }

        return localStorage.getItem('locale') ?? 'en';
    });

    useEffect(() => {
        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            setSelectedLocale(customEvent.detail);
        };

        window.addEventListener('locale-change', handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener('locale-change', handleLocaleChange as EventListener);
        };
    }, []);

    const t = (value: LocalizedText) => getLocalizedValue(value, selectedLocale);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [generalForm, setGeneralForm] = useState({
        firstName: '',
        lastName: '',
        username: '',

        email: '',
        phone: '',

        gender: '',

        dobMonth: '',
        dobDay: null as number | null,
        dobYear: null as number | null,

        locale: '',
        timezone: '',

        bio: '',

        avatar: '',
        banner: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const avatarSrc =
        avatarPreview ??
        (generalForm.avatar?.startsWith('/uploads/')
            ? generalForm.avatar
            : '/assets/images/avatar/avatar-01.jpg');

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please choose an image.');
            return;
        }
        const preview = URL.createObjectURL(file);
        setAvatarPreview(preview);
        try {
            const json = await uploadImage(file, 'avatar');
            setGeneralForm((prev) => ({
                ...prev,
                avatar: json.image,
            }));
            setSuccess('Avatar updated successfully.');
            URL.revokeObjectURL(preview);
        } catch (err) {
            URL.revokeObjectURL(preview);
            setAvatarPreview(null);
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    };

    const loadProfile = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/v1/profile', {
                credentials: 'include',
                cache: 'no-store',
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message ?? 'Unable to load profile.');
            }

            const profile = json.profile;

            const dob = profile.dob ? new Date(profile.dob) : null;

            setGeneralForm({
                firstName: profile.firstName ?? '',
                lastName: profile.lastName ?? '',
                username: profile.username ?? '',

                email: profile.contactEmail ?? '',
                phone: profile.contactPhone ?? '',

                gender: profile.gender ?? '',

                dobMonth: dob ? dob.toLocaleString('en-US', { month: 'long' }) : '',

                dobDay: dob ? dob.getDate() : null,

                dobYear: dob ? dob.getFullYear() : null,

                locale: profile.locale ?? '',
                timezone: profile.timezone ?? '',
                bio: profile.bio ?? '',

                avatar: profile.avatar ?? '',

                banner: profile.banner ?? '',
            });

            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const saveGeneral = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await fetch('/api/v1/profile/general', {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(generalForm),
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message ?? 'Unable to save profile.');
            }

            const profile = json.profile;

            const dob = profile.dob ? new Date(profile.dob) : null;

            setSuccess(json.message ?? 'Profile updated successfully.');

            setGeneralForm({
                firstName: profile.firstName ?? '',
                lastName: profile.lastName ?? '',
                username: profile.username ?? '',

                email: profile.contactEmail ?? '',
                phone: profile.contactPhone ?? '',

                gender: profile.gender ?? 'UNKNOWN',

                dobMonth: dob ? dob.toLocaleString('en-US', { month: 'long' }) : '',

                dobDay: dob ? dob.getDate() : null,

                dobYear: dob ? dob.getFullYear() : null,

                locale: profile.locale ?? '',
                timezone: profile.timezone ?? '',

                bio: profile.bio ?? '',

                avatar: profile.avatar ?? '',
                banner: profile.banner ?? '',
            });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const uploadImage = async (file: File, type: 'avatar' | 'logo' | 'banner' | 'cover') => {
        const formData = new FormData();

        formData.append('file', file);

        formData.append('type', type);

        const response = await fetch('/api/v1/profile/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
            throw new Error(json.message ?? 'Upload failed.');
        }

        return json;
    };

    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const bannerInputRef = useRef<HTMLInputElement>(null);

    const bannerSrc = generalForm.banner || '/assets/images/default-banner.jpg';

    const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setUploadingBanner(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload/banner', {
                method: 'POST',
                body: formData,
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message);
            }

            setGeneralForm((prev) => ({
                ...prev,
                banner: json.url, // hoặc json.data.url
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setUploadingBanner(false);
        }
    };

    // projects
    const [openCreateProject, setOpenCreateProject] = useState(false);
    const [projects, setProjects] = useState<ProjectModel[]>([]);

    const [loadingProjects, setLoadingProjects] = useState(true);
    const loadProjects = async () => {
        try {
            setLoadingProjects(true);

            const response = await fetch('/api/v1/project', {
                method: 'GET',
                credentials: 'include',
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message);
            }

            setProjects(json.projects);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingProjects(false);
        }
    };

    useEffect(() => {
        console.log('PROJECT STATE', projects);
    }, [projects]);

    useEffect(() => {
        loadProfile();
        loadProjects();
    }, []);

    const MONTHS = [
        { value: 'January', label: monthJanuary },
        { value: 'February', label: monthFebruary },
        { value: 'March', label: monthMarch },
        { value: 'April', label: monthApril },
        { value: 'May', label: monthMay },
        { value: 'June', label: monthJune },
        { value: 'July', label: monthJuly },
        { value: 'August', label: monthAugust },
        { value: 'September', label: monthSeptember },
        { value: 'October', label: monthOctober },
        { value: 'November', label: monthNovember },
        { value: 'December', label: monthDecember },
    ] as const;
    const CHART_MONTHS = [
        monthJanuary,
        monthFebruary,
        monthMarch,
        monthApril,
        monthMay,
        monthJune,
        monthJuly,
        monthAugust,
        monthSeptember,
        monthOctober,
        monthNovember,
        monthDecember,
    ];

    return (
        <>
            <section className={styles.profile}>
                <div className={styles.container}>
                    {/* ================= HERO ================= */}
                    <section className={styles.profileSettings}>
                        <div className={styles.mediaCard}>
                            <div className={styles.mediaGrid}>
                                <div>
                                    <div className={styles.avatarSection}>
                                        <div className={styles.avatarWrapper}>
                                            <Image
                                                src={avatarSrc}
                                                alt={t(avatarSectionTitle)}
                                                width={132}
                                                height={132}
                                                className={styles.avatar}
                                            />

                                            <label className={styles.avatarUpload}>
                                                <i className="bi bi-camera-fill"></i>

                                                <input
                                                    ref={avatarInputRef}
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                />
                                            </label>
                                        </div>

                                        <div className={styles.avatarInfo}>
                                            <h3>{t(avatarSectionTitle)}</h3>

                                            <p>{t(avatarSectionDescription)}</p>

                                            <div className={styles.mediaButtons}>
                                                <button
                                                    type="button"
                                                    className={styles.primaryButton}
                                                    onClick={() => avatarInputRef.current?.click()}
                                                >
                                                    <i className="bi bi-upload"></i>
                                                    {t(uploadAvatarButton)}
                                                </button>

                                                <button
                                                    type="button"
                                                    className={styles.outlineButton}
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                    {t(removeAvatarButton)}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.bannerSection}>
                                        <div className={styles.bannerPreview}>
                                            <Image
                                                src={bannerSrc}
                                                alt={t(bannerSectionTitle)}
                                                width={220}
                                                height={120}
                                                className={styles.bannerImage}
                                            />

                                            <input
                                                ref={bannerInputRef}
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleBannerChange}
                                            />
                                        </div>

                                        <div className={styles.bannerInfo}>
                                            <h3>{t(bannerSectionTitle)}</h3>

                                            <p>{t(bannerSectionDescription)}</p>

                                            <div className={styles.mediaButtons}>
                                                <button
                                                    type="button"
                                                    className={styles.primaryButton}
                                                    disabled={uploadingBanner}
                                                    onClick={() => bannerInputRef.current?.click()}
                                                >
                                                    {uploadingBanner ? (
                                                        <>
                                                            <span className={styles.spinner}></span>
                                                            {t(uploadingBannerButton)}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-upload"></i>
                                                            {t(uploadBannerButton)}
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    className={styles.outlineButton}
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                    {t(removeBannerButton)}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formCard}>
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <h2>{t(generalTitle)}</h2>
                                            <p>{t(generalDescription)}</p>
                                        </div>

                                        <div className={styles.footerActions}>
                                            <button
                                                className={styles.cancelButton}
                                                onClick={loadProfile}
                                                disabled={loading || saving}
                                            >
                                                <i className="bi bi-x-circle"></i>
                                                {t(cancelButton)}
                                            </button>

                                            <button
                                                className={styles.saveButton}
                                                onClick={saveGeneral}
                                                disabled={saving}
                                            >
                                                <i className="bi bi-check2-circle"></i>
                                                {saving ? t(savingButton) : t(saveButton)}
                                            </button>
                                        </div>
                                    </div>

                                    {error && <div className={styles.errorMessage}>{error}</div>}

                                    {success && (
                                        <div className={styles.successMessage}>{success}</div>
                                    )}

                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>{t(firstNameLabel)}</label>

                                            <div className={styles.inputWrapper}>
                                                <i className="bi bi-person"></i>

                                                <input
                                                    type="text"
                                                    placeholder={t(firstNamePlaceholder)}
                                                    value={generalForm.firstName}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            firstName: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>{t(lastNameLabel)}</label>

                                            <div className={styles.inputWrapper}>
                                                <i className="bi bi-person"></i>

                                                <input
                                                    type="text"
                                                    placeholder={t(lastNamePlaceholder)}
                                                    value={generalForm.lastName}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            lastName: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>{t(usernameLabel)}</label>

                                            <div className={styles.inputWrapper}>
                                                <i className="bi bi-at"></i>

                                                <input
                                                    type="text"
                                                    placeholder={t(usernamePlaceholder)}
                                                    value={generalForm.username}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            username: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>{t(emailLabel)}</label>

                                            <div className={styles.inputWrapper}>
                                                <i className="bi bi-envelope"></i>

                                                <input
                                                    type="email"
                                                    placeholder={t(emailPlaceholder)}
                                                    value={generalForm.email}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            email: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>{t(phoneLabel)}</label>

                                            <div className={styles.inputWrapper}>
                                                <i className="bi bi-telephone"></i>

                                                <input
                                                    type="text"
                                                    placeholder={t(phonePlaceholder)}
                                                    value={generalForm.phone}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            phone: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>{t(genderLabel)}</label>

                                            <div className={styles.inputWrapper}>
                                                <i className="bi bi-gender-ambiguous"></i>

                                                <select
                                                    value={generalForm.gender}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            gender: e.target.value,
                                                        }))
                                                    }
                                                >
                                                    <option value="">
                                                        {t(selectGenderPlaceholder)}
                                                    </option>
                                                    <option value="Male">{t(genderMale)}</option>
                                                    <option value="Female">
                                                        {t(genderFemale)}
                                                    </option>
                                                    <option value="Other">{t(genderOther)}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>{t(dateOfBirthLabel)}</label>

                                            <div className={styles.dateGrid}>
                                                <select
                                                    value={generalForm.dobMonth}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            dobMonth: e.target.value,
                                                        }))
                                                    }
                                                >
                                                    <option value="">{t(monthPlaceholder)}</option>

                                                    {MONTHS.map((month) => (
                                                        <option
                                                            key={month.value}
                                                            value={month.value}
                                                        >
                                                            {t(month.label)}
                                                        </option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={generalForm.dobDay ?? ''}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            dobDay: e.target.value
                                                                ? Number(e.target.value)
                                                                : null,
                                                        }))
                                                    }
                                                >
                                                    <option value="">{t(dayPlaceholder)}</option>
                                                    {Array.from({ length: 31 }, (_, i) => (
                                                        <option key={i + 1} value={i + 1}>
                                                            {i + 1}
                                                        </option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={generalForm.dobYear ?? ''}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            dobYear: e.target.value
                                                                ? Number(e.target.value)
                                                                : null,
                                                        }))
                                                    }
                                                >
                                                    <option value="">{t(yearPlaceholder)}</option>
                                                    {Array.from({ length: 100 }, (_, i) => {
                                                        const year = new Date().getFullYear() - i;

                                                        return (
                                                            <option key={year} value={year}>
                                                                {year}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>{t(statusLabel)}</label>

                                            <div className={styles.statusRow}>
                                                <span className={styles.statusActive}>
                                                    <i className="bi bi-check-circle-fill" />
                                                    {t(statusActive)}
                                                </span>
                                                <span className={styles.statusVerified}>
                                                    <i className="bi bi-patch-check-fill" />
                                                    {t(statusVerified)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>{t(languageLabel)}</label>

                                            <div className={styles.inputWrapper}>
                                                <i className="bi bi-translate" />

                                                <select
                                                    value={generalForm.locale}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            locale: e.target.value,
                                                        }))
                                                    }
                                                >
                                                    {[
                                                        { value: 'en', label: languageEnglish },
                                                        { value: 'vi', label: languageVietnamese },
                                                        { value: 'ja', label: languageJapanese },
                                                    ].map((item) => (
                                                        <option key={item.value} value={item.value}>
                                                            {t(item.label)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>{t(timezoneLabel)}</label>
                                            <div className={styles.inputWrapper}>
                                                <i className="bi bi-clock" />
                                                <select
                                                    value={generalForm.timezone}
                                                    onChange={(e) =>
                                                        setGeneralForm((prev) => ({
                                                            ...prev,
                                                            timezone: e.target.value,
                                                        }))
                                                    }
                                                >
                                                    {[
                                                        {
                                                            value: 'Asia/Ho_Chi_Minh',
                                                            label: timezoneVietnam,
                                                        },
                                                        {
                                                            value: 'Asia/Tokyo',
                                                            label: timezoneJapan,
                                                        },
                                                        {
                                                            value: 'UTC',
                                                            label: timezoneUtc,
                                                        },
                                                    ].map((item) => (
                                                        <option key={item.value} value={item.value}>
                                                            {t(item.label)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formGroupFull}>
                                            <label>{t(bioLabel)}</label>
                                            <textarea
                                                rows={5}
                                                placeholder={t(bioPlaceholder)}
                                                value={generalForm.bio}
                                                onChange={(e) =>
                                                    setGeneralForm((prev) => ({
                                                        ...prev,
                                                        bio: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className={styles.alertError}>
                                            <i className="bi bi-exclamation-circle-fill"></i>
                                            <span>{error}</span>
                                        </div>
                                    )}
                                    {success && (
                                        <div className={styles.alertSuccess}>
                                            <i className="bi bi-check-circle-fill"></i>
                                            <span>{success}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className={styles.content}>
                        <div className={styles.leftColumn}>
                            <section className={styles.projects}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionHeaderTitle}>
                                        <span className={styles.sectionLabel}>
                                            {t(projectsTitle)}
                                        </span>
                                        <h2>{t(projectsDescription)}</h2>
                                    </div>
                                    <button
                                        className={styles.primaryButton}
                                        onClick={() => setOpenCreateProject(true)}
                                    >
                                        <i className="bi bi-plus-lg" />
                                        {t(createNewProjectButton)}
                                    </button>
                                </div>

                                <div className={styles.projectList}>
                                    {loadingProjects ? (
                                        <div className={styles.loadingProjects}>
                                            {t(loadingProjectsText)}
                                        </div>
                                    ) : projects.length === 0 ? (
                                        <div className={styles.emptyProjects}>
                                            <i className="bi bi-folder2-open" />
                                            <h3>{t(noProjectsTitle)}</h3>
                                            <p>{t(noProjectsDescription)}</p>
                                            <button
                                                className={styles.primaryButton}
                                                onClick={() => setOpenCreateProject(true)}
                                            >
                                                <i className="bi bi-plus-lg" />
                                                {t(noProjectsButton)}
                                            </button>
                                        </div>
                                    ) : (
                                        projects.map((project) => (
                                            <article
                                                key={project.id}
                                                className={styles.projectCard}
                                            >
                                                <div className={styles.projectThumbnail}>
                                                    <Image
                                                        src={
                                                            project.thumbnail ??
                                                            project.logo ??
                                                            '/assets/images/default-project.jpg'
                                                        }
                                                        alt={project.name}
                                                        fill
                                                        className={styles.projectImage}
                                                    />
                                                    <div className={styles.projectOverlay}>
                                                        <button title={t(previewProjectButton)}>
                                                            <i className="bi bi-eye-fill"></i>
                                                        </button>

                                                        <button title={t(editProjectButton)}>
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className={styles.projectBody}>
                                                    <div className={styles.projectTop}>
                                                        <div>
                                                            <h3>{project.name}</h3>
                                                            <p>{project.domain ?? project.slug}</p>
                                                        </div>
                                                        <span
                                                            className={
                                                                project.status === 'APPROVED'
                                                                    ? styles.statusPublished
                                                                    : project.status === 'PENDING'
                                                                      ? styles.statusPending
                                                                      : styles.statusRejected
                                                            }
                                                        >
                                                            {project.status === 'APPROVED'
                                                                ? t(statusApproved)
                                                                : project.status === 'PENDING'
                                                                  ? t(statusPending)
                                                                  : t(statusRejected)}
                                                        </span>
                                                    </div>
                                                    <div className={styles.projectNumbers}>
                                                        <div>
                                                            <strong>{project.totalViews}</strong>
                                                            <small>{t(projectViewsLabel)}</small>
                                                        </div>
                                                        <div>
                                                            <strong>
                                                                {project.totalTemplates}
                                                            </strong>
                                                            <small>
                                                                {t(projectTemplatesLabel)}
                                                            </small>
                                                        </div>
                                                        <div>
                                                            <strong>
                                                                {new Date(
                                                                    project.updatedAt,
                                                                ).toLocaleDateString()}
                                                            </strong>
                                                            <small>{t(projectUpdatedLabel)}</small>
                                                        </div>
                                                    </div>

                                                    <div className={styles.projectProgress}>
                                                        <div className={styles.projectProgressBar}>
                                                            <span
                                                                style={{
                                                                    width: `${Math.min(
                                                                        project.totalTemplates * 10,
                                                                        100,
                                                                    )}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </section>
                            <section className={styles.analytics}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <span className={styles.sectionLabel}>
                                            {t(analyticsTitle)}
                                        </span>
                                        <h2>{t(analyticsDescription)}</h2>
                                    </div>
                                    <button className={styles.moreButton}>
                                        <i className="bi bi-download" />
                                    </button>
                                </div>

                                <div className={styles.analyticsCard}>
                                    <div className={styles.chartHeader}>
                                        <div className={styles.chartItem}>
                                            <span className={styles.chartDot}></span>
                                            <div>
                                                <strong>Visitors</strong>
                                                <small>18,492 this month</small>
                                            </div>
                                        </div>
                                        <div className={styles.chartItem}>
                                            <span
                                                className={`${styles.chartDot} ${styles.chartDotPurple}`}
                                            ></span>
                                            <div>
                                                <strong>Conversions</strong>
                                                <small>1,284 Leads</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.chartArea}>
                                        <div className={styles.chartBars}>
                                            {[42, 58, 66, 72, 81, 69, 90, 78, 88, 95, 84, 100].map(
                                                (item, index) => (
                                                    <div key={index} className={styles.barWrapper}>
                                                        <div
                                                            className={styles.bar}
                                                            style={{
                                                                height: `${item}%`,
                                                                animationDelay: `${index * 0.08}s`,
                                                            }}
                                                        ></div>

                                                        <span>{t(CHART_MONTHS[index])}</span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <aside className={styles.sidebar}>
                            <section className={styles.sidebarCard}>
                                <div className={styles.sidebarHeader}>
                                    <h3>{t(completionTitle)}</h3>

                                    <small>{t(completionDescription)}</small>
                                </div>
                                <div className={styles.circleProgress}>
                                    <div className={styles.circleOuter}>
                                        <div className={styles.circleInner}>
                                            <strong>86%</strong>
                                            <small>Completed</small>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.checkList}>
                                    <div className={styles.checkItem}>
                                        <i className="bi bi-check-circle-fill"></i>
                                        <span>{t(completionPersonalInfo)}</span>
                                    </div>
                                    <div className={styles.checkItem}>
                                        <i className="bi bi-check-circle-fill"></i>
                                        <span>{t(completionEmailVerified)}</span>
                                    </div>
                                    <div className={styles.checkItem}>
                                        <i className="bi bi-check-circle-fill"></i>
                                        <span>{t(completionPublishedWebsite)}</span>
                                    </div>
                                    <div className={styles.checkItem}>
                                        <i className="bi bi-circle"></i>
                                        <span>{t(completionConnectDomain)}</span>
                                    </div>
                                </div>
                            </section>
                            <section className={`${styles.sidebarCard} ${styles.planCard}`}>
                                <span className={styles.planBadge}>{t(upgradeBadge)}</span>
                                <h3>{t(upgradeTitle)}</h3>
                                <p>{t(upgradeDescription)}</p>
                                <ul className={styles.planFeatures}>
                                    <li>
                                        <i className="bi bi-check2"></i>
                                        {t(upgradeFeature1)}
                                    </li>
                                    <li>
                                        <i className="bi bi-check2"></i>
                                        {t(upgradeFeature2)}
                                    </li>
                                    <li>
                                        <i className="bi bi-check2"></i>
                                        {t(upgradeFeature3)}
                                    </li>
                                    <li>
                                        <i className="bi bi-check2"></i>
                                        {t(upgradeFeature4)}
                                    </li>
                                </ul>
                                <button className={styles.upgradeButton}>
                                    {t(upgradeButton)}
                                    <i className="bi bi-arrow-right"></i>
                                </button>
                            </section>
                        </aside>
                    </div>
                </div>
            </section>
            <CreateProjectModal
                open={openCreateProject}
                onClose={() => setOpenCreateProject(false)}
                onCreated={async () => {
                    await loadProjects();
                }}
            />
        </>
    );
}

function createTextField(key: string, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createTextareaField(key: string, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createImageField(key: string, label: string, folder = 'images'): InspectorField {
    return {
        key,
        label,
        kind: 'image',
        folder,
    };
}
function createInspector(): RegItem['inspector'] {
    return [
        createTextField('generalTitle', 'General Title'),
        createTextareaField('generalDescription', 'General Description'),
        createTextField('firstNameLabel', 'First Name Label'),
        createTextField('firstNamePlaceholder', 'First Name Placeholder'),
        createTextField('lastNameLabel', 'Last Name Label'),
        createTextField('lastNamePlaceholder', 'Last Name Placeholder'),
        createTextField('usernameLabel', 'Username Label'),
        createTextField('usernamePlaceholder', 'Username Placeholder'),
        createTextField('emailLabel', 'Email Label'),
        createTextField('emailPlaceholder', 'Email Placeholder'),
        createTextField('phoneLabel', 'Phone Label'),
        createTextField('phonePlaceholder', 'Phone Placeholder'),
        createTextField('companyLabel', 'Company Label'),
        createTextField('companyPlaceholder', 'Company Placeholder'),
        createTextField('websiteLabel', 'Website Label'),
        createTextField('websitePlaceholder', 'Website Placeholder'),
        createTextField('locationLabel', 'Location Label'),
        createTextField('locationPlaceholder', 'Location Placeholder'),
        createTextField('bioLabel', 'Bio Label'),
        createTextareaField('bioPlaceholder', 'Bio Placeholder'),
        createTextField('genderLabel', 'Gender Label'),
        createTextField('selectGenderPlaceholder', 'Gender Placeholder'),
        createTextField('genderMale', 'Male'),
        createTextField('genderFemale', 'Female'),
        createTextField('genderOther', 'Other'),
        createTextField('dateOfBirthLabel', 'Date Of Birth'),
        createTextField('monthPlaceholder', 'Month Placeholder'),
        createTextField('dayPlaceholder', 'Day Placeholder'),
        createTextField('yearPlaceholder', 'Year Placeholder'),
        createTextField('monthJanuary', 'January'),
        createTextField('monthFebruary', 'February'),
        createTextField('monthMarch', 'March'),
        createTextField('monthApril', 'April'),
        createTextField('monthMay', 'May'),
        createTextField('monthJune', 'June'),
        createTextField('monthJuly', 'July'),
        createTextField('monthAugust', 'August'),
        createTextField('monthSeptember', 'September'),
        createTextField('monthOctober', 'October'),
        createTextField('monthNovember', 'November'),
        createTextField('monthDecember', 'December'),
        createTextField('statusLabel', 'Status Label'),
        createTextField('statusActive', 'Active'),
        createTextField('statusVerified', 'Verified'),
        createTextField('languageLabel', 'Language Label'),
        createTextField('languageEnglish', 'English'),
        createTextField('languageVietnamese', 'Vietnamese'),
        createTextField('languageJapanese', 'Japanese'),
        createTextField('timezoneLabel', 'Timezone Label'),
        createTextField('timezoneVietnam', 'Vietnam'),
        createTextField('timezoneJapan', 'Japan'),
        createTextField('timezoneUtc', 'UTC'),
        createTextField('avatarSectionTitle', 'Avatar Section Title'),
        createTextareaField('avatarSectionDescription', 'Avatar Section Description'),
        createTextField('uploadAvatarButton', 'Upload Avatar Button'),
        createTextField('removeAvatarButton', 'Remove Avatar Button'),
        createTextField('logoSectionTitle', 'Logo Section Title'),
        createTextareaField('logoSectionDescription', 'Logo Section Description'),
        createTextField('uploadLogoButton', 'Upload Logo Button'),
        createTextField('removeLogoButton', 'Remove Logo Button'),
        createTextField('saveButton', 'Save Button'),
        createTextField('savingButton', 'Saving Button'),
        createTextField('cancelButton', 'Cancel Button'),
        createTextField('createProjectTitle', 'Create Project Title'),
        createTextareaField('createProjectDescription', 'Create Project Description'),
        createTextField('projectNameLabel', 'Project Name Label'),
        createTextField('projectNamePlaceholder', 'Project Name Placeholder'),
        createTextField('projectSlugLabel', 'Project Slug Label'),
        createTextField('projectSlugPlaceholder', 'Project Slug Placeholder'),
        createTextField('websiteTypeLabel', 'Website Type Label'),
        createTextField('websiteTypeLanding', 'Landing Website'),
        createTextField('websiteTypeBlog', 'Blog Website'),
        createTextField('websiteTypeEcommerce', 'Ecommerce Website'),
        createTextField('websiteTypeBooking', 'Booking Website'),
        createTextField('websiteTypeLms', 'LMS Website'),
        createTextField('projectDomainLabel', 'Project Domain Label'),
        createTextField('projectDomainPlaceholder', 'Project Domain Placeholder'),
        createTextField('projectDescriptionLabel', 'Project Description Label'),
        createTextareaField('projectDescriptionPlaceholder', 'Project Description Placeholder'),
        createTextField('projectLogoLabel', 'Project Logo Label'),
        createImageField('projectLogoAlt', 'Project Logo Image', 'logos'),
        createTextField('projectThumbnailLabel', 'Project Thumbnail Label'),
        createImageField('projectThumbnailAlt', 'Project Thumbnail Image', 'thumbnails'),
        createTextField('uploadThumbnailButton', 'Upload Thumbnail Button'),
        createTextField('uploadingLogoButton', 'Uploading Logo Button'),
        createTextField('uploadingThumbnailButton', 'Uploading Thumbnail Button'),
        createTextField('createProjectButton', 'Create Project Button'),
        createTextField('creatingProjectButton', 'Creating Project Button'),
        createTextField('closeModalButton', 'Close Modal Button'),
        createTextField('createProjectSuccessMessage', 'Create Project Success Message'),
        createTextField('createProjectFailedMessage', 'Create Project Failed Message'),
        createTextField('projectsTitle', 'Projects Title'),
        createTextareaField('projectsDescription', 'Projects Description'),
        createTextField('createNewProjectButton', 'Create New Project Button'),
        createTextField('loadingProjectsText', 'Loading Projects Text'),
        createTextField('noProjectsTitle', 'No Projects Title'),
        createTextareaField('noProjectsDescription', 'No Projects Description'),
        createTextField('noProjectsButton', 'No Projects Button'),
        createTextField('projectViewsLabel', 'Project Views Label'),
        createTextField('projectTemplatesLabel', 'Project Templates Label'),
        createTextField('projectStorageLabel', 'Project Storage Label'),
        createTextField('projectCreatedLabel', 'Project Created Label'),
        createTextField('projectUpdatedLabel', 'Project Updated Label'),
        createTextField('statusPending', 'Pending Status'),
        createTextField('statusApproved', 'Approved Status'),
        createTextField('statusRejected', 'Rejected Status'),
        createTextField('publishedLabel', 'Published Label'),
        createTextField('unpublishedLabel', 'Unpublished Label'),
        createTextField('editProjectButton', 'Edit Project Button'),
        createTextField('previewProjectButton', 'Preview Project Button'),
        createTextField('builderProjectButton', 'Builder Project Button'),
        createTextField('publishProjectButton', 'Publish Project Button'),
        createTextField('unpublishProjectButton', 'Unpublish Project Button'),
        createTextField('duplicateProjectButton', 'Duplicate Project Button'),
        createTextField('deleteProjectButton', 'Delete Project Button'),
        createTextField('deleteProjectConfirm', 'Delete Project Confirm'),
        createTextField('deleteProjectSuccessMessage', 'Delete Project Success Message'),
        createTextField('deleteProjectFailedMessage', 'Delete Project Failed Message'),
        createTextField('analyticsTitle', 'Analytics Title'),
        createTextareaField('analyticsDescription', 'Analytics Description'),
        createTextField('totalViewsLabel', 'Total Views Label'),
        createTextField('totalProjectsLabel', 'Total Projects Label'),
        createTextField('totalTemplatesLabel', 'Total Templates Label'),
        createTextField('storageUsageLabel', 'Storage Usage Label'),
        createTextField('accountSummaryTitle', 'Account Summary Title'),
        createTextField('completionTitle', 'Completion Title'),
        createTextareaField('completionDescription', 'Completion Description'),
        createTextField('completionButton', 'Completion Button'),
        createTextField('completionCompleted', 'Completion Completed'),
        createTextField('completionPersonalInfo', 'Completion Personal Information'),
        createTextField('completionEmailVerified', 'Completion Email Verified'),
        createTextField('completionPublishedWebsite', 'Completion Published Website'),
        createTextField('completionConnectDomain', 'Completion Connect Domain'),
        createTextField('upgradeBadge', 'Upgrade Badge'),
        createTextField('upgradeTitle', 'Upgrade Title'),
        createTextareaField('upgradeDescription', 'Upgrade Description'),
        createTextField('upgradeButton', 'Upgrade Button'),
        createTextField('upgradeFeature1', 'Upgrade Feature 1'),
        createTextField('upgradeFeature2', 'Upgrade Feature 2'),
        createTextField('upgradeFeature3', 'Upgrade Feature 3'),
        createTextField('upgradeFeature4', 'Upgrade Feature 4'),
        createTextField('saveSuccessMessage', 'Save Success Message'),
        createTextField('saveFailedMessage', 'Save Failed Message'),
        createTextField('uploadSuccessMessage', 'Upload Success Message'),
        createTextField('uploadFailedMessage', 'Upload Failed Message'),
    ];
}

export const PROFILE_01: RegItem = {
    kind: 'profile-01',
    label: 'Profile 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <Profile01 {...(props as Profile01Props)} />,
};

export default Profile01;
