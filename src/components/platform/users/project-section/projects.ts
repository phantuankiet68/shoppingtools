export interface ProjectItem {
    id: string;
    userId: string;
    name: string;
    slug: string;
    websiteType: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    thumbnail: string | null;
    logo: string | null;
    domain: string | null;
    totalViews: number;
    totalTemplates: number;
    storageUsed: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
}
