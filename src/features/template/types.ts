export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type AccessTier = 'BASIC' | 'NORMAL' | 'PRO';

export type TemplateCategory = {
    id: string;

    name: string;
    description?: string;

    minTier: AccessTier;

    sortOrder: number;
    isActive: boolean;

    createdAt?: string;
    updatedAt?: string;
};

export type TemplateCatalog = {
    id: string;

    code: string;
    name: string;
    kind: string;

    categoryId: string;

    category?: TemplateCategory;

    status: TemplateStatus;

    previewImageUrl?: string | null;

    isActive: boolean;
    isPublic: boolean;

    sortOrder: number;

    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
};
